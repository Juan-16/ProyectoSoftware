import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { auth } from "../../firebase.config";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function VerProfileTaller() {
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);
  const [mostrarServicios, setMostrarServicios] = useState(false);
  const [mostrarHorarios, setMostrarHorarios] = useState(false);

  const obtenerPerfil = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile/tallerInfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPerfil(data);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      obtenerPerfil();
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No se encontró información del taller</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">

      {/* Nombre */}
      <Text className="text-2xl font-bold text-left ">
        {perfil.datosPersonales?.nombre}
      </Text>


      {/* Imagen */}
      {perfil.datosPersonales?.imageUrl && (
        <Image
          source={{ uri: perfil.datosPersonales.imageUrl }}
          className="w-32 h-32 rounded-full self-center"
        />
      )}



      {/* Información básica */}
      <View className="mb-4">
        <Text className="font-semibold text-lg">Teléfono:</Text>
        <Text>{perfil.datosPersonales?.telefono}</Text>
      </View>

      <View className="mb-4">
        <Text className="font-semibold text-lg">Dirección:</Text>
        <Text>{perfil.datosPersonales?.direccion}</Text>
      </View>

      <View className="mb-4">
        <Text className="font-semibold text-lg">Servicio a domicilio:</Text>
        <Text>
          {perfil.datosPersonales?.domicilio ? "Sí ofrece domicilio" : "No ofrece domicilio"}
        </Text>
      </View>

      {/* Servicios */}
      <View className="mb-6">
        <TouchableOpacity
          onPress={() => setMostrarServicios(!mostrarServicios)}
          className="flex-row justify-between items-center"
        >
          <Text className="font-semibold text-lg">
            Servicios
          </Text>

          <Text className="text-xl">
            {mostrarServicios ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {mostrarServicios && (
          <View className="mt-2">
            {perfil.servicios?.map((servicio: string, index: number) => (
              <Text key={index} className="mb-1">
                • {servicio}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Horarios */}
      <View className="mb-6">
        <TouchableOpacity
          onPress={() => setMostrarHorarios(!mostrarHorarios)}
          className="flex-row justify-between items-center"
        >
          <Text className="font-semibold text-lg">
            Horarios
          </Text>

          <Text className="text-xl">
            {mostrarHorarios ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {mostrarHorarios && (
          <View className="mt-2">
            {perfil.horarios?.map((dia: any, index: number) => {
              if (!dia.activo) return null;

              return (
                <Text key={index} className="mb-1">
                  {diasSemana[index]}: {dia.inicio} - {dia.fin}
                </Text>
              );
            })}
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => router.push("/EditarPerfilTaller")}
        className="bg-fondoNaranja py-3 px-5 rounded-xl flex-row items-left self-end my-2 "
      >
        <Ionicons name="create-outline" size={18} color="white" />
        <Text className="text-white font-semibold ml-2">
          Editar Perfil
        </Text>
      </TouchableOpacity>



    </ScrollView>
  );
}