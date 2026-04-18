import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";



const getUser = async () => {
  const userStr = await AsyncStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

interface Cita {
  id: string;
  usuarioNombre: string;
  vehiculoId: string;
  fecha: string;
  hora: string;
  servicio: string;
  estado: "pendiente" | "confirmada" | "cancelada";
}

export default function CitasTaller() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [])
  );

  const cargarCitas = async () => {
    try {
      const user = await getUser();

      if (!user) throw new Error("Usuario no autenticado");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No autenticado");
      }


      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/citas/taller`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setCitas(data);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarCita = async (citaId: string) => {
    try {
      const user = await getUser();

      if (!user) throw new Error("Usuario no autenticado");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No autenticado");
      }


      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/citas/${citaId}/confirmar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Cita confirmada");
      cargarCitas();
    } catch (error) {
      Alert.alert("Error", "No se pudo confirmar la cita");
    }
  };

   const cancelarCita = async (id: string) => {
    try {
      const user = await getUser();

      if (!user) throw new Error("Usuario no autenticado");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No autenticado");
      }


      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/citas/${id}/cancelar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      cargarCitas();
    } catch (error) {
      console.error("Error cancelando:", error);
    }
  };

    const confirmarCancelacion = (id: string) => {
      Alert.alert(
        "Cancelar cita",
        "¿Seguro que deseas cancelar esta cita?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Sí, cancelar",
            style: "destructive",
            onPress: () => cancelarCita(id),
          },
        ]
      );
    };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-2 text-gray-600">Cargando citas...</Text>
      </View>
    );
  }

  const citasPorDia: Record<string, Cita[]> = {};

  citas.forEach((cita) => {
    if (!citasPorDia[cita.fecha]) citasPorDia[cita.fecha] = [];
    citasPorDia[cita.fecha].push(cita);
  });

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-center mb-4">
        Citas de la Semana
      </Text>

      {Object.keys(citasPorDia).length === 0 && (
        <Text className="text-center text-gray-500 mt-10">
          No hay citas programadas esta semana.
        </Text>
      )}

      {Object.keys(citasPorDia).map((fecha) => (
        <View key={fecha} className="mb-6">
          <Text className="text-lg font-bold mb-2">{fecha}</Text>

          {citasPorDia[fecha].map((cita) => (
            <View
              key={cita.id}
              className={`
                p-3 mb-3 rounded-lg 
                 ${cita.estado === "confirmada"
                  ? "bg-[#2cc55852] "
                  : cita.estado === "cancelada"
                    ? "bg-[#6b010120]"
                    : "bg-[#f59b0020]"
                }
              `}
            >
              {/* Botón cancelar arriba derecha */}
              {cita.estado === "pendiente" && (
                <View className="flex-row ">
                  <Text className="font-bold text-base mb-1">
                    {cita.usuarioNombre}
                  </Text>
                  <View className="flex-1" />
                  <TouchableOpacity
                    onPress={() => confirmarCancelacion(cita.id)}
                    className="bg-red-500 px-3 py-1 rounded "
                  >
                    <Text className="text-white font-bold">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}



              <Text>Vehículo: {cita.vehiculoId}</Text>
              <Text>Servicio: {cita.servicio}</Text>
              <Text>Hora: {cita.hora}</Text>

              <Text
                className={`font-bold mt-1 ${cita.estado === "confirmada"
                  ? "text-green-600"
                  : cita.estado === "cancelada"
                    ? "text-red-600"
                    : "text-orange-500"
                  }`}
              >
                {cita.estado === "confirmada"
                  ? "Confirmada"
                  : cita.estado === "cancelada"
                    ? "Cancelada"
                    : "Pendiente"}
              </Text>

              {/* Botón confirmar abajo */}
              {cita.estado === "pendiente" && (
                <TouchableOpacity
                  onPress={() => confirmarCita(cita.id)}
                  className="mt-3 bg-green-500 py-2 rounded"
                >
                  <Text className="text-white text-center font-bold">
                    Confirmar Cita
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}