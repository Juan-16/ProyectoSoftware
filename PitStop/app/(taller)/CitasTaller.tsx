import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { auth, db } from "../../firebase.config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";

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
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "citas"), where("tallerId", "==", user.uid));
      const snapshot = await getDocs(q);

      const listaCitas: Cita[] = [];

      const hoy = new Date();
      const semana = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(hoy.getDate() + i);
        return d.toLocaleDateString("sv-SE");
      });

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (!semana.includes(data.fecha)) continue;

        let usuarioNombre = "Cliente";

        try {
          if (data.usuarioId) {
            const userDoc = await getDoc(doc(db, "usuarios", data.usuarioId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              usuarioNombre =
                userData?.datosPersonales?.nombre || "Cliente";
            }
          }
        } catch {
          usuarioNombre = "Cliente";
        }

        listaCitas.push({
          id: docSnap.id,
          usuarioNombre,
          vehiculoId: data.vehiculoId || "",
          fecha: data.fecha || "",
          hora: data.hora || "",
          servicio: data.servicio || "",
          estado: data.estado || "pendiente",
        });
      }

      listaCitas.sort((a, b) => {
        if (a.fecha === b.fecha) return a.hora > b.hora ? 1 : -1;
        return a.fecha > b.fecha ? 1 : -1;
      });

      setCitas(listaCitas);
    } catch (error) {
      console.error("❌ Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarCita = async (citaId: string) => {
    try {
      await updateDoc(doc(db, "citas", citaId), { estado: "confirmada" });
      Alert.alert("Cita confirmada");
      cargarCitas();
    } catch (error) {
      Alert.alert("Error", "No se pudo confirmar la cita");
    }
  };

  const cancelarCita = async (citaId: string) => {
    Alert.alert("Cancelar cita", "¿Seguro que quieres cancelar esta cita?", [
      { text: "No" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "citas", citaId), {
              estado: "cancelada",
            });
            Alert.alert("Cita cancelada");
            cargarCitas();
          } catch {
            Alert.alert("Error", "No se pudo cancelar la cita");
          }
        },
      },
    ]);
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
                 ${
              cita.estado === "confirmada"
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
                    onPress={() => cancelarCita(cita.id)}
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
                className={`font-bold mt-1 ${
                  cita.estado === "confirmada"
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