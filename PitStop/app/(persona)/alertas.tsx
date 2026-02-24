import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { auth } from "../../firebase.config";

interface Alerta {
  id: string;
  tipo: string;
  fecha: string;
  placa: string;
  activa: boolean;
}

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alerta | null>(null);
  const [fechaSoat, setFechaSoat] = useState<Date | null>(null);
  const [fechaTecno, setFechaTecno] = useState<Date | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState<"soat" | "tecno" | null>(null);
  const [errorFecha, setErrorFecha] = useState({ soat: false, tecno: false });

  // 🔹 Obtener alertas
  const obtenerAlertas = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/alertas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("Error HTTP:", res.status, text);
        setAlertas([]);
        return;
      }

      const data = await res.json();
      setAlertas(data);
    } catch (error) {
      console.log("Error cargando alertas:", error);
      setAlertas([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { obtenerAlertas(); }, []));

  // 🔹 Abrir modal
  const handleRealizado = (alerta: Alerta) => {
    setAlertaSeleccionada(alerta);
    setModalVisible(true);
  };

  // 🔹 Confirmar nueva alerta
  const confirmarNuevaAlerta = async () => {
    if (!alertaSeleccionada) return;

    let fechaNueva: Date | null = null;

    if (alertaSeleccionada.tipo === "SOAT") {
      fechaNueva = fechaSoat;
      if (!fechaNueva) {
        setErrorFecha({ soat: true, tecno: false });
        return;
      }
    } else if (alertaSeleccionada.tipo === "TECNOMECANICA") {
      fechaNueva = fechaTecno;
      if (!fechaNueva) {
        setErrorFecha({ soat: false, tecno: true });
        return;
      }
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      if (!fechaNueva) return;

      // 1️⃣ Eliminar alerta antigua
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/alertas/${alertaSeleccionada.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2️⃣ Crear nueva alerta
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/vehicles/alertas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo: alertaSeleccionada.tipo,
          fecha: fechaNueva.toISOString().split("T")[0],
          placa: alertaSeleccionada.placa,
        }),
      });

      // 3️⃣ Refrescar alertas y cerrar modal
      obtenerAlertas();
      setModalVisible(false);
      setFechaSoat(null);
      setFechaTecno(null);
      setAlertaSeleccionada(null);
      setErrorFecha({ soat: false, tecno: false });
    } catch (error) {
      console.log("Error creando nueva alerta:", error);
    }
  };

  // 🔹 Render alerta con botón a la derecha
  const renderAlerta = ({ item }: { item: Alerta }) => (
    <View className="bg-[#f59b0020] p-4 rounded-2xl mb-3 -zinc-700 flex-row justify-between items-start">
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
      <Text className="text-black text-2xl font-bold mb-4">Alertas Activas</Text>

      {alertas.length === 0 ? (
        <Text className="text-black">No tienes alertas activas</Text>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(item) => item.id}
          renderItem={renderAlerta}
        />
      )}

      {/* Modal para actualizar fecha */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 p-6 rounded-2xl">
            <Text className="text-lg font-bold mb-4">
              Actualizar fecha {alertaSeleccionada?.tipo}
            </Text>

            {alertaSeleccionada?.tipo === "SOAT" && (
              <TouchableOpacity
                onPress={() => setMostrarPicker("soat")}
                className={`bg-gray-100 border px-4 py-3 rounded mb-4 ${
                  errorFecha.soat ? "border-red-500" : "border-gray-300"
                }`}
              >
                <Text>{fechaSoat ? fechaSoat.toLocaleDateString() : "Seleccionar fecha SOAT"}</Text>
              </TouchableOpacity>
            )}

            {alertaSeleccionada?.tipo === "TECNOMECANICA" && (
              <TouchableOpacity
                onPress={() => setMostrarPicker("tecno")}
                className={`bg-gray-100 border px-4 py-3 rounded mb-4 ${
                  errorFecha.tecno ? "border-red-500" : "border-gray-300"
                }`}
              >
                <Text>{fechaTecno ? fechaTecno.toLocaleDateString() : "Seleccionar fecha Tecnomecánica"}</Text>
              </TouchableOpacity>
            )}

            {mostrarPicker && (
              <DateTimePicker
                value={
                  mostrarPicker === "soat" ? fechaSoat || new Date() : fechaTecno || new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setMostrarPicker(null);
                  if (mostrarPicker === "soat") setFechaSoat(selectedDate || fechaSoat);
                  else setFechaTecno(selectedDate || fechaTecno);
                }}
              />
            )}

            <TouchableOpacity
              onPress={confirmarNuevaAlerta}
              className="bg-orange-500 px-4 py-3 rounded mt-4"
            >
              <Text className="text-white font-bold text-center">Guardar fecha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-2 px-4 py-3 rounded"
            >
              <Text className="text-center text-gray-700">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
