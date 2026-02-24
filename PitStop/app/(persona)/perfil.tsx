import { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../firebase.config";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { signOut } from "firebase/auth";

export default function PerfilPersona() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      obtenerPerfil();
    }, [])
  );

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/LogIn");
  };

  const obtenerPerfil = async () => {
    try {
      setLoading(true); // 👈 agregado
      const user = auth.currentUser;
      if (!user) return;



      const token = await user.getIdToken();

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.tipo === "persona") {
        setPerfil(data.datosPersonales);
      }
    } catch (error) {
      console.log("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-fondo">
        <ActivityIndicator size="large" color="#FF6D08" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-fondo items-center px-6 pt-10">

      {/* LOGO EN LA ESQUINA */}
      <Image
        source={require("../../assets/images/LogoCarro.png")}
        className="w-20 h-10 absolute top-2 left-2 opacity-90 my-6"
      />

      <Text className="text-black text-2xl font-bold ">
        Mi Perfil
      </Text>

      {/* FOTO CENTRADA */}
      <Image
        source={
          perfil?.imageUrl
            ? { uri: perfil.imageUrl }
            : require("../../assets/images/defaultLogo.png")
        }
        className="w-44 h-44 rounded-full mb-2"
      />

      {/* TARJETA DE DATOS */}
      <View className="w-full bg-[#f59b0020] p-6 rounded-3xl">

        <Text className="text-black-400 text-lg font-semibold mb-1">Nombre</Text>
        <Text className="text-black text-lg  mb-4">
          {perfil?.nombre}
        </Text>

        <Text className="text-black-400 text-lg font-semibold mb-1">Teléfono</Text>
        <Text className="text-black text-lg  mb-4">
          {perfil?.telefono}
        </Text>

        <Text className="text-black-400 text-lg font-semibold mb-1">Dirección</Text>
        <Text className="text-black text-lg  mb-4">
          {perfil?.direccion}
        </Text>

        <Text className="text-black-400 text-lg font-semibold mb-1">Fecha de nacimiento</Text>
        <Text className="text-black text-lg ">
          {perfil?.fechaNacimiento
            ? new Date(perfil.fechaNacimiento).toLocaleDateString("es-CO")
            : "No registrada"}
        </Text>

      </View>

      {/* BOTÓN EDITAR */}
      <TouchableOpacity
        onPress={() => router.push("/EditarPerfilPersona")}
        className="mt-8 bg-fondoNaranja px-2 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold text-base">
          Editar Perfil
        </Text>
      </TouchableOpacity>

      {/* BOTÓN LOGOUT */}
      <TouchableOpacity
        onPress={handleLogout}
        className="absolute bottom-6 right-6 bg-red-500 px-6 py-3 rounded-xl shadow-lg my-2"
      >
        <Text className="text-white font-semibold">
          Logout
        </Text>
      </TouchableOpacity>

    </View>
  );
}
