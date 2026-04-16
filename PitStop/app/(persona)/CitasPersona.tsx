import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { auth, db } from "../../firebase.config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { TouchableOpacity, Alert } from "react-native";

interface Cita {
  id: string;
  tallerNombre: string;
  vehiculoId: string;
  fecha: string;
  hora: string;
  servicio: string;
  estado: "pendiente" | "confirmada" | "cancelada";
}

export default function CitasPersona() {
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

      const q = query(
        collection(db, "citas"),
        where("usuarioId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const listaCitas: Cita[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        listaCitas.push({
          id: doc.id,
          tallerNombre: data.tallerNombre || "Taller",
          vehiculoId: data.vehiculoId || "",
          fecha: data.fecha || "",
          hora: data.hora || "",
          servicio: data.servicio || "",
          estado: data.estado || "pendiente",
        });
      });

      listaCitas.sort((a, b) => {
        if (a.fecha === b.fecha) return a.hora > b.hora ? 1 : -1;
        return a.fecha > b.fecha ? 1 : -1;
      });

      setCitas(listaCitas);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelarCita = async (id: string) => {
    try {
      await updateDoc(doc(db, "citas", id), {
        estado: "cancelada",
      });

      cargarCitas(); // refresca
    } catch (error) {
      console.error("Error cancelando cita:", error);
    }
  };

  const eliminarCita = async (id: string) => {
    try {
      await deleteDoc(doc(db, "citas", id));
      cargarCitas();
    } catch (error) {
      console.error("Error eliminando cita:", error);
    }
  };

  const confirmarEliminar = (id: string) => {
    Alert.alert(
      "Eliminar cita",
      "¿Seguro que deseas eliminar esta cita?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => eliminarCita(id), style: "destructive" },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-600">Cargando citas...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-center mb-4">
        Mis Citas
      </Text>

      {citas.length === 0 && (
        <Text className="text-center text-gray-500 mt-10">
          No tienes citas registradas.
        </Text>
      )}

      {citas.map((cita) => (
        <View
          key={cita.id}
          className={`
            p-4 mb-3 rounded-lg 
           ${cita.estado === "confirmada"
              ? "bg-[#2cc55852] "
              : cita.estado === "cancelada"
                ? "bg-[#6b010120]"
                : "bg-[#f59b0020]"
            }
          `}
        >
          <Text className="font-bold text-base mb-1">
            {cita.tallerNombre}
          </Text>

          <Text>Vehículo: {cita.vehiculoId}</Text>
          <Text>Servicio: {cita.servicio}</Text>
          <Text>Fecha: {cita.fecha}</Text>
          <Text>Hora: {cita.hora}</Text>

          <Text
            className={`font-bold mt-2 ${cita.estado === "confirmada"
              ? "text-green-600"
              : cita.estado === "cancelada"
                ? "text-red-600"
                : "text-orange-500"
              }`}
          >
            {cita.estado === "confirmada"
              ? "Confirmada"
              : cita.estado === "cancelada"
                ? "Cita Cancelada"
                : "Pendiente de confirmación"}
          </Text>

          <View className="flex-row mt-3 justify-end gap-2">

            {/* Botón Cancelar */}
            {(cita.estado === "pendiente" || cita.estado === "confirmada") && (
              <TouchableOpacity
                onPress={() => cancelarCita(cita.id)}
                className="bg-red-500 px-3 py-2 rounded"
              >
                <Text className="text-white font-bold">Cancelar</Text>
              </TouchableOpacity>
            )}

            {/* Botón Eliminar */}
            {cita.estado === "cancelada" && (
              <TouchableOpacity
                onPress={() => confirmarEliminar(cita.id)}
                className="bg-gray-700 px-3 py-2 rounded"
              >
                <Text className="text-white font-bold">Eliminar</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      ))}
    </ScrollView>
  );
}