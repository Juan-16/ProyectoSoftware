import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase.config";

const getUser = async () => {
  const userStr = await AsyncStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

interface Alerta {
  id: string;
  tipo: string;
  fecha: string;
  placa: string;
  activa: boolean;
}

interface Solicitud {
  id: string;
  estado: string;
  codigoConfirmacion: string;
}

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);

  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alerta | null>(null);
  const [fechaSoat, setFechaSoat] = useState<Date | null>(null);
  const [fechaTecno, setFechaTecno] = useState<Date | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState<"soat" | "tecno" | null>(null);
  const [errorFecha, setErrorFecha] = useState({ soat: false, tecno: false });

  // 🔔 ALERTAS
  const obtenerAlertas = async () => {
    try {
      const user = await getUser();
      if (!user) return;

      const snapshot = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/alertas`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          },
        }
      );

      const data = await snapshot.json();
      setAlertas(data);
    } catch (error) {
      console.log(error);
      setAlertas([]);
    }
  };


const obtenerSolicitud = async () => {
  try {
    const user = await getUser();
    if (!user) return;

    const q = query(
      collection(db, "solicitudesAyuda"),
      where("usuarioId", "==", user.uid),
      where("estado", "in", ["pendiente", "en_camino"]) 
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      setSolicitud(null);
      return;
    }

    const docSnap = snapshot.docs[0];

    setSolicitud({
      id: docSnap.id,
      ...(docSnap.data() as any),
    });
  } catch (error) {
    console.log("Error obteniendo solicitud:", error);
  }
};

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([obtenerAlertas(), obtenerSolicitud()]).finally(() =>
        setLoading(false)
      );
    }, [])
  );

  const cancelarServicio = async () => {
    if (!solicitud) return;

    Alert.alert(
      "Cancelar servicio",
      "¿Seguro que deseas cancelar la solicitud?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "solicitudesAyuda", solicitud.id), {
                estado: "cancelada",
              });

              setSolicitud(null);
            } catch (error) {
              console.log(error);
            }
          },
        },
      ]
    );
  };

 
  const handleRealizado = (alerta: Alerta) => {
    setAlertaSeleccionada(alerta);
    setModalVisible(true);
  };

  const confirmarNuevaAlerta = async () => {
    setModalVisible(false);
  };

  const renderAlerta = ({ item }: { item: Alerta }) => (
    <View className="bg-[#f59b0020] p-4 rounded-2xl mb-3 flex-row justify-between items-start">
      <View className="flex-1">
        <Text className="text-black font-bold text-lg">{item.placa}</Text>
        <Text className="text-orange-400 font-semibold mt-1">{item.tipo}</Text>
        <Text className="text-zinc-400 mt-1">Vence: {item.fecha}</Text>
      </View>

      <TouchableOpacity
        className="bg-green-800 px-2 py-1 rounded self-start"
        onPress={() => handleRealizado(item)}
      >
        <Text className="text-white font-bold">Realizado</Text>
      </TouchableOpacity>
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
        Alertas Activas
      </Text>

      {/* 🔔 ALERTAS */}
      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id}
        renderItem={renderAlerta}
        ListEmptyComponent={
          <Text className="text-black text-center">
            No tienes alertas activas
          </Text>
        }
      />

      {/* 🚨 SERVICIO ACTIVO */}
      {solicitud && (
        <View
          className={`
      mt-6 p-4 rounded-2xl
      ${solicitud.estado === "aceptada"
              ? "bg-[#2cc55852]"
              : solicitud.estado === "en_camino"
                ? "bg-[#2cc55852]"
                : solicitud.estado === "cancelada"
                  ? "bg-[#6b010120]"
                  : "bg-[#f59b0020]"
            }
    `}
        >
          <Text className="font-bold text-lg mb-1">
            Servicio en curso
          </Text>

          <Text>
            Estado:{" "}
            <Text
              className={`font-bold ${solicitud.estado === "aceptada"
                  ? "text-green-600"
                  : solicitud.estado === "en_camino"
                    ? "text-green-600"
                    : solicitud.estado === "cancelada"
                      ? "text-red-600"
                      : "text-orange-500"
                }`}
            >
              {solicitud.estado}
            </Text>
          </Text>

          {/* 🔢 CÓDIGO */}
          <View className="mt-3 items-center">
            <Text className="text-gray-600 text-xs">
              Código de verificación
            </Text>

            <Text className="text-2xl font-bold text-black">
              {solicitud.codigoConfirmacion}
            </Text>
          </View>

          <Text className="text-gray-500 text-xs mt-2 text-center">
            Dale este código al taller cuando llegue
          </Text>

          {/* ❌ CANCELAR */}
          <TouchableOpacity
            onPress={cancelarServicio}
            className="bg-red-500 mt-4 py-2 rounded"
          >
            <Text className="text-white text-center font-bold">
              Cancelar servicio
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 p-6 rounded-2xl">
            <Text className="text-lg font-bold mb-4">
              Actualizar fecha
            </Text>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-2 px-4 py-3 rounded"
            >
              <Text className="text-center text-gray-700">
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}