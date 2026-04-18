import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
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
import * as Location from "expo-location";
import { db } from "../../firebase.config";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Solicitud {
  id: string;
  usuarioId: string;
  estado: "pendiente" | "en_camino" | "completada";
  ubicacionUsuario: {
    lat: number;
    lng: number;
  };
}

const getUser = async () => {
  const userStr = await AsyncStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export default function SolicitudesTaller() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInterval, setTrackingInterval] = useState<any>(null);

  // 🧹 cleanup
  useEffect(() => {
    return () => {
      if (trackingInterval) clearInterval(trackingInterval);
    };
  }, [trackingInterval]);

  // 🔥 SOLO PENDIENTES
  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      const q = query(
        collection(db, "solicitudesAyuda"),
        where("estado", "==", "pendiente")
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const lista: Solicitud[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as any),
        }));

        setSolicitudes(lista);
        setLoading(false);
      });

      return () => unsub();
    }, [])
  );

  // 🧭 MAPS
  const abrirRuta = (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    });

    Linking.openURL(url!);
  };

  // 📡 TRACKING SOLO CUANDO ESTA EN_CAMINO
  const iniciarTracking = async (solicitudId: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    if (trackingInterval) clearInterval(trackingInterval);

    const interval = setInterval(async () => {
      try {
        const ref = doc(db, "solicitudesAyuda", solicitudId);
        const snap = await getDoc(ref);
        const data = snap.data();

        // 🛑 STOP
        if (!data || data.estado !== "en_camino") {
          clearInterval(interval);
          setTrackingInterval(null);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});

        await updateDoc(ref, {
          ubicacionTaller: {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          },
        });

      } catch (error) {
        console.log("Error tracking:", error);
      }
    }, 5000);

    setTrackingInterval(interval);
  };

  // 🚗 ACEPTAR SOLICITUD
  const aceptarSolicitud = async (solicitud: Solicitud) => {
    try {
      const user = await getUser();
      if (!user) return;

      const ref = doc(db, "solicitudesAyuda", solicitud.id);
      const snap = await getDoc(ref);
      const data = snap.data();

      if (!data || data.estado !== "pendiente") {
        Alert.alert("Ya fue tomada", "Lo sentimos, esta solicitud ya fue aceptada por otro taller.");
        return;
      }

      await updateDoc(ref, {
        estado: "en_camino",
        tallerId: user.uid,
      });

      Alert.alert(
        "Solicitud aceptada",
        "Revisa tus solicitudes para ver el estado y el código del cliente."
      );

      abrirRuta(
        solicitud.ubicacionUsuario.lat,
        solicitud.ubicacionUsuario.lng
      );

      iniciarTracking(solicitud.id);

    } catch (error) {
      console.log(error);
      Alert.alert("",
        "Error al aceptar solicitud");
    }
  };


  const renderItem = ({ item }: { item: Solicitud }) => (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
      }}
    >
      <Text style={{ fontWeight: "bold" }}>
        Solicitud de ayuda
      </Text>

      <Text>
        📍 {item.ubicacionUsuario.lat.toFixed(4)},{" "}
        {item.ubicacionUsuario.lng.toFixed(4)}
      </Text>

      <TouchableOpacity
        onPress={() => aceptarSolicitud(item)}
        style={{
          marginTop: 10,
          backgroundColor: "#16a34a",
          padding: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Aceptar solicitud
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Solicitudes disponibles
      </Text>

      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}