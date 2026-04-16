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
import { useLocalSearchParams, useRouter } from "expo-router";
import { db, auth } from "../firebase.config";
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
  
export default function DetalleTaller() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [taller, setTaller] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [horariosDisponibles, setHorariosDisponibles] = useState<{ hora: string; disponibles: number }[]>([]);
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
    if (taller) generarHorariosDisponibles(fechaSeleccionada);
  }, [fechaSeleccionada, taller]);

  const cargarTaller = async () => {
    try {
      const docRef = doc(db, "talleres", id as string);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        Alert.alert("Error", "No se encontró el taller.");
        router.back();
        return;
      }

      const data = snap.data();
      setTaller(data);

      // 🔥 NUEVO: cargar servicios dinámicos
      if (data.servicios && Array.isArray(data.servicios)) {
        setServiciosDisponibles(data.servicios);
      } else {
        setServiciosDisponibles([]);
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo cargar la información del taller.");
    } finally {
      setLoading(false);
    }
  };
  const cargarVehiculos = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.vehiculos) {
          const listaVehiculos = Object.keys(data.vehiculos).map((placa) => ({
            id: placa,
            placa,
            ...data.vehiculos[placa],
          }));
          setVehiculos(listaVehiculos);
        }
      }
    } catch (error) {
      console.error("❌ Error cargando vehículos:", error);
    }
  };

  const generarHorariosDisponibles = async (fecha: Date) => {
    if (!taller?.horarios || !taller.configuracionCitas) {
      setHorariosDisponibles([]);
      return;
    }

    const diaSemana = (fecha.getDay() + 6) % 7; // lunes=0
    const horarioDia = taller.horarios[diaSemana];

    if (!horarioDia?.activo) {
      setHorariosDisponibles([]);
      return;
    }

    const inicio = convertirAHoras(horarioDia.inicio);
    const fin = convertirAHoras(horarioDia.fin);
    const intervalo = taller.configuracionCitas.intervalo || 30;
    const cupos = taller.configuracionCitas.cupos || 1;

    const listaHorarios: string[] = [];
    let horaActual = inicio;
    while (horaActual < fin) {
      listaHorarios.push(formatoHora(horaActual));
      horaActual += intervalo / 60;
    }

    // Consultar citas existentes para esa fecha y taller
    const fechaISO = fechaSeleccionada.toLocaleDateString("sv-SE");
    const q = query(collection(db, "citas"), where("tallerId", "==", id), where("fecha", "==", fechaISO));
    const snap = await getDocs(q);
    const citasDeDia = snap.docs.map((d) => d.data());

    const horariosConCupos = listaHorarios.map((hora) => {
      const usadas = citasDeDia.filter((c: any) => c.hora === hora && c.estado !== "cancelada").length;
      return { hora, disponibles: Math.max(0, cupos - usadas) };
    });

    setHorariosDisponibles(horariosConCupos);
  };

  const convertirAHoras = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return h + m / 60;
  };

  const formatoHora = (decimal: number) => {
    const h = Math.floor(decimal);
    const m = Math.round((decimal - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const abrirModal = (hora: string) => {
    setHoraSeleccionada(hora);
    setModalVisible(true);
  };

  const agendarCita = async () => {
    if (!vehiculoSeleccionado || !servicio || !horaSeleccionada) {
      Alert.alert("Completa los datos", "Selecciona vehículo, servicio y hora.");
      return;
    }

    setLoadingAgendar(true);

    try {
      const fechaISO = fechaSeleccionada.toLocaleDateString("sv-SE");
      // Verificar nuevamente cupos antes de guardar
      const q = query(collection(db, "citas"), where("tallerId", "==", id), where("fecha", "==", fechaISO), where("hora", "==", horaSeleccionada));
      const snap = await getDocs(q);
      const usadas = snap.docs.filter((d) => d.data().estado !== "cancelada").length;
      const cupos = taller.configuracionCitas.cupos || 1;

      if (usadas >= cupos) {
        Alert.alert("Cupo lleno", "Esta hora ya no está disponible.");
        generarHorariosDisponibles(fechaSeleccionada);
        return;
      }

      const user = auth.currentUser;
      if (!user) return Alert.alert("Error", "Debes iniciar sesión.");

      await addDoc(collection(db, "citas"), {
        tallerId: id,
        usuarioId: user.uid,
        vehiculoId: vehiculoSeleccionado,
        servicio,
        comentario,
        fecha: fechaISO,
        hora: horaSeleccionada,
        estado: "pendiente",
        creadaEn: new Date().toISOString(),
      });

      Alert.alert("✅ Cita agendada", `Tu cita fue reservada el ${fechaISO} a las ${horaSeleccionada}, espera la confirmación del taller.`);
      setModalVisible(false);
      setVehiculoSeleccionado("");
      setServicio("");
      setComentario("");
      generarHorariosDisponibles(fechaSeleccionada);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo agendar la cita.");
    } finally {
      setLoadingAgendar(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-600 mt-2">Cargando taller...</Text>
      </View>
    );
  }

  if (!taller) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">No se encontró información del taller</Text>
      </View>
    );
  }

  const datos = taller.datosPersonales || {};

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-2">{datos.nombre}</Text>
      <Text className="text-gray-600 mb-1">📍 {datos.direccion}</Text>
      <Text className="text-gray-600 mb-4">Intervalo: {taller.configuracionCitas.intervalo} min | Cupos: {taller.configuracionCitas.cupos}</Text>

      {/* Seleccionar fecha */}
      <TouchableOpacity
        onPress={() => setMostrarCalendario(true)}
        className="bg-orange-500 rounded-lg p-3 mb-3"
      >
        <Text className="text-white font-semibold text-center">📅 Selecciona el día ({fechaSeleccionada.toLocaleDateString()})</Text>
      </TouchableOpacity>

      {mostrarCalendario && (
        <DateTimePicker
          value={fechaSeleccionada}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(e, selectedDate) => {
            setMostrarCalendario(false);
            if (selectedDate) setFechaSeleccionada(selectedDate);
          }}
        />
      )}

      <Text className="text-lg font-semibold mb-3">Horarios disponibles:</Text>
      {taller?.horarios &&
        !taller.horarios[(fechaSeleccionada.getDay() === 0 ? 6 : fechaSeleccionada.getDay() - 1)]?.activo ? (
        <Text className="text-red-500">🚫 El taller está cerrado este día.</Text>
      ) : horariosDisponibles.length === 0 ? (
        <Text className="text-gray-500">No hay horarios disponibles para este día.</Text>
      ) : (
        horariosDisponibles.map((h, idx) => (
          <TouchableOpacity
            key={idx}
            disabled={h.disponibles <= 0 || loadingAgendar}
            onPress={() => abrirModal(h.hora)}
            className={`rounded-lg p-3 mb-2 ${h.disponibles > 0 ? "bg-orange-500" : "bg-gray-300"}`}
          >
            <Text className="text-white font-semibold text-center">{h.hora} — {h.disponibles > 0 ? `${h.disponibles} cupos` : "Sin cupo"}</Text>
          </TouchableOpacity>
        ))
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl p-5">
            <Text className="text-lg font-bold mb-3">Agendar cita — {horaSeleccionada}</Text>

            <Text className="font-semibold mb-1">Selecciona tu vehículo:</Text>
            <RNPickerSelect
              onValueChange={(value) => setVehiculoSeleccionado(value)}
              placeholder={{ label: "Selecciona un vehículo...", value: "" }}
              items={vehiculos.map((v) => ({ label: `${v.placa} (${v.modelo || v.tipoVehiculo || "Sin modelo"})`, value: v.id }))}
            />

            <Text className="font-semibold mt-4 mb-1">Servicio:</Text>
            <RNPickerSelect
              onValueChange={setServicio}
              placeholder={{ label: "Selecciona un servicio...", value: "" }}
              items={
                serviciosDisponibles.length > 0
                  ? serviciosDisponibles.map((s) => ({
                    label: s,
                    value: s,
                  }))
                  : [{ label: "No hay servicios disponibles", value: "" }]
              }
              value={servicio}
            />

            <Text className="font-semibold mt-4 mb-1">Comentario (opcional):</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-2"
              placeholder="Agrega un comentario..."
              value={comentario}
              onChangeText={setComentario}
              multiline
            />

            <View className="flex-row justify-between mt-5">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-300 rounded-lg px-5 py-2"
              >
                <Text className="text-gray-800 font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={agendarCita}
                disabled={loadingAgendar}
                className="bg-orange-500 rounded-lg px-5 py-2"
              >
                <Text className="text-white font-semibold">{loadingAgendar ? "Guardando..." : "Agendar cita"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}