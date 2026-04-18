import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";



const getUser = async () => {
  const userStr = await AsyncStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export default function DetalleTaller() {
  const { id } = useLocalSearchParams();

  const [taller, setTaller] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [horariosDisponibles, setHorariosDisponibles] = useState<any[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");
  const [servicio, setServicio] = useState("");
  const [comentario, setComentario] = useState("");
  const [loadingAgendar, setLoadingAgendar] = useState(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      cargarTaller();
      cargarVehiculos();
    }
  }, [id]);

  useEffect(() => {
    if (taller) generarHorariosDisponibles();
  }, [fechaSeleccionada, taller]);

  // 🔥 GET /taller/:id
  const cargarTaller = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/taller/${id}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setTaller(data);
      setServiciosDisponibles(data.servicios || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo cargar el taller");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 GET /vehiculos (protegido)
  const cargarVehiculos = async () => {
    try {
      const user = await getUser();

      if (!user) throw new Error("Usuario no autenticado");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No autenticado");
      }
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/vehiculos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setVehiculos(data);
    } catch (error) {
      console.error("Error cargando vehículos:", error);
    }
  };

  // 🔥 GET /citas/disponibles
  const generarHorariosDisponibles = async () => {
    try {
      const fechaISO = fechaSeleccionada.toLocaleDateString("sv-SE");

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/citas/disponibles?tallerId=${id}&fecha=${fechaISO}`
      );

      const data = await res.json();

      setHorariosDisponibles(data);
    } catch (error) {
      console.error(error);
    }
  };

  const abrirModal = (hora: string) => {
    setHoraSeleccionada(hora);
    setModalVisible(true);
  };

  // 🔥 POST /citas
  const agendarCita = async () => {
    if (!vehiculoSeleccionado || !servicio || !horaSeleccionada) {
      Alert.alert("Completa los datos");
      return;
    }

    setLoadingAgendar(true);

    try {
      const user = await getUser();

      if (!user) throw new Error("Usuario no autenticado");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No autenticado");
      }
      const fechaISO = fechaSeleccionada.toLocaleDateString("sv-SE");

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/citas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tallerId: id,
            vehiculoId: vehiculoSeleccionado,
            servicio,
            comentario,
            fecha: fechaISO,
            hora: horaSeleccionada,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      Alert.alert("✅ Cita agendada");

      setModalVisible(false);
      setVehiculoSeleccionado("");
      setServicio("");
      setComentario("");

      generarHorariosDisponibles();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo agendar");
    } finally {
      setLoadingAgendar(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!taller) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No encontrado</Text>
      </View>
    );
  }

  const datos = taller.datosPersonales || {};

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-2">{datos.nombre}</Text>
      <Text className="text-gray-600 mb-4">📍 {datos.direccion}</Text>

      {/* FECHA */}
      <TouchableOpacity
        onPress={() => setMostrarCalendario(true)}
        className="bg-orange-500 p-3 rounded-lg mb-3"
      >
        <Text className="text-white text-center">
          📅 {fechaSeleccionada.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {mostrarCalendario && (
        <DateTimePicker
          value={fechaSeleccionada}
          mode="date"
          minimumDate={new Date()}
          onChange={(e, d) => {
            setMostrarCalendario(false);
            if (d) setFechaSeleccionada(d);
          }}
        />
      )}

      {/* HORARIOS */}
      {horariosDisponibles.map((h, i) => (
        <TouchableOpacity
          key={i}
          disabled={h.disponibles <= 0}
          onPress={() => abrirModal(h.hora)}
          className={`p-3 rounded-lg mb-2 ${h.disponibles > 0 ? "bg-orange-500" : "bg-gray-300"
            }`}
        >
          <Text className="text-white text-center">
            {h.hora} - {h.disponibles} cupos
          </Text>
        </TouchableOpacity>
      ))}

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-5 rounded-t-2xl">
            <RNPickerSelect
              placeholder={{
                label: "Placa de vehículo",
                value: null,
              }}
              onValueChange={setVehiculoSeleccionado}
              items={vehiculos.map((v) => ({
                label: v.placa,
                value: v.placa,
              }))}
            />

            <RNPickerSelect
              placeholder={{
                label: "Servicio a realizar",
                value: null,
              }}

              onValueChange={setServicio}
              items={serviciosDisponibles.map((s) => ({
                label: s,
                value: s,
              }))}
            />

            <TextInput
              placeholder="Comentario"
              value={comentario}
              onChangeText={setComentario}
            />

            <TouchableOpacity
              onPress={agendarCita}
              className="bg-orange-500 p-3 rounded-lg mt-3"
            >
              <Text className="text-white text-center">
                {loadingAgendar ? "Guardando..." : "Agendar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}