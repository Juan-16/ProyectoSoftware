import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { db } from "../../firebase.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Linking } from "react-native";

interface Solicitud {
  id: string;
  usuarioId: string;
  estado: "pendiente" | "en_camino" | "completada";
  codigoConfirmacion: string;
  ubicacionUsuario: {
    lat: number;
    lng: number;
  };
}

const abrirRuta = (lat: number, lng: number) => {
  const url = Platform.select({
    ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
    android: `google.navigation:q=${lat},${lng}`,
  });

  Linking.openURL(url!);
};

const getUser = async () => {
  const userStr = await AsyncStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export default function MisServiciosTaller() {
  const [servicios, setServicios] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  const [codigoInput, setCodigoInput] = useState("");
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string | null>(null);

  const [trackingMap, setTrackingMap] = useState<{ [key: string]: any }>({});

  // 🔄 CARGAR SERVICIOS
  useFocusEffect(
    useCallback(() => {
      let unsubscribe: any;

      const cargar = async () => {
        try {
          const user = await getUser();
          if (!user) return;

          const q = query(
            collection(db, "solicitudesAyuda"),
            where("tallerId", "==", user.uid)
          );

          unsubscribe = onSnapshot(q, (snapshot) => {
            const lista: Solicitud[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as any),
            })) as Solicitud[];

            setServicios(lista);
            setLoading(false);

            lista.forEach((item) => {
              if (
                item.estado === "en_camino" &&
                !trackingMap[item.id]
              ) {
                iniciarTracking(item.id);
              }
            });
          });
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      };

      cargar();

      return () => {
        if (unsubscribe) unsubscribe();
        Object.values(trackingMap).forEach(clearInterval);
      };
    }, [trackingMap])
  );

  // 📡 TRACKING
  const iniciarTracking = async (solicitudId: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const interval = setInterval(async () => {
      try {
        const ref = doc(db, "solicitudesAyuda", solicitudId);
        const snap = await getDoc(ref);
        const data = snap.data();

        if (!data || data.estado === "completada") {
          clearInterval(interval);

          setTrackingMap((prev) => {
            const copy = { ...prev };
            delete copy[solicitudId];
            return copy;
          });

          return;
        }

        const loc = await Location.getCurrentPositionAsync({});

        await updateDoc(ref, {
          ubicacionTaller: {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          },
          estado: "en_camino",
        });

      } catch (error) {
        console.log("Error tracking:", error);
      }
    }, 5000);

    setTrackingMap((prev) => ({
      ...prev,
      [solicitudId]: interval,
    }));
  };

  // ❌ CANCELAR (ahora coherente: cancelada)
  const cancelarServicio = async (id: string) => {
    Alert.alert("Cancelar servicio", "¿Seguro?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí",
        style: "destructive",
        onPress: async () => {
          await updateDoc(doc(db, "solicitudesAyuda", id), {
            estado: "completada",
          });

          if (trackingMap[id]) {
            clearInterval(trackingMap[id]);

            setTrackingMap((prev) => {
              const copy = { ...prev };
              delete copy[id];
              return copy;
            });
          }
        },
      },
    ]);
  };

  // ✅ CONFIRMAR LLEGADA
  const confirmarLlegada = async (item: Solicitud) => {
    if (!codigoInput) {
      Alert.alert("Ingresa el código", "El cliente te dará un código de 4 dígitos");
      return;
    }

    if (codigoInput !== item.codigoConfirmacion) {
      Alert.alert("Código incorrecto", "Verifica con el cliente");
      return;
    }

    try {
      await updateDoc(doc(db, "solicitudesAyuda", item.id), {
        estado: "completada",
      });

      if (trackingMap[item.id]) {
        clearInterval(trackingMap[item.id]);

        setTrackingMap((prev) => {
          const copy = { ...prev };
          delete copy[item.id];
          return copy;
        });
      }

      Alert.alert("Servicio completado, ¡gracias por tu ayuda!");

      setCodigoInput("");
      setServicioSeleccionado(null);

    } catch (error) {
      console.log(error);
    }
  };


const renderItem = ({ item }: { item: Solicitud }) => (
  <View className="bg-[#f59b0020] p-4 rounded-2xl mb-3">

    {/* 🔝 HEADER con botón ubicación */}
    <View className="flex-row justify-between items-center mb-2">
      
      <Text className="text-black font-bold text-lg">
        Servicio
      </Text>

      <TouchableOpacity
        onPress={() =>
          abrirRuta(
            item.ubicacionUsuario.lat,
            item.ubicacionUsuario.lng
          )
        }
        className="bg-black px-3 py-1 rounded-full"
      >
        <Text className="text-white text-xs font-bold">
          Ubicación
        </Text>
      </TouchableOpacity>
    </View>

    <Text className="text-zinc-600 mt-1">
      Estado:{" "}
      <Text className="font-bold text-black">
        {item.estado}
      </Text>
    </Text>

    {/* SOLO en_camino */}
    {item.estado === "en_camino" && (
      <>
        <TouchableOpacity
          onPress={() => cancelarServicio(item.id)}
          className="bg-red-500 mt-3 py-2 rounded-xl"
        >
          <Text className="text-white text-center font-bold">
            Cancelar servicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setServicioSeleccionado(item.id)}
          className="bg-[#FF6D08] mt-3 py-2 rounded-xl"
        >
          <Text className="text-white text-center font-bold">
            Llegué al cliente
          </Text>
        </TouchableOpacity>

        {servicioSeleccionado === item.id && (
          <>
            <TextInput
              placeholder="Código cliente"
              value={codigoInput}
              onChangeText={setCodigoInput}
              keyboardType="numeric"
              className="bg-white mt-3 p-3 rounded"
            />

            <TouchableOpacity
              onPress={() => confirmarLlegada(item)}
              className="bg-green-600 mt-3 py-2 rounded"
            >
              <Text className="text-white text-center font-bold">
                Confirmar llegada
              </Text>
            </TouchableOpacity>
          </>
        )}
      </>
    )}
  </View>
);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-fondo">
        <ActivityIndicator size="large" color="#FF6D08" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-fondo p-4">

      <Text className="text-black text-2xl font-bold mb-4">
        Mis servicios
      </Text>

      <FlatList
        data={servicios}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}