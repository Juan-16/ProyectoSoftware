import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { auth } from "../../firebase.config";

export default function Vehiculos() {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarVehiculos = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile/vehiculos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setVehiculos(data);
    } catch (e) {
      console.log("Error cargando vehículos", e);
    } finally {
      setLoading(false);
    }
  };

  const eliminarVehiculo = async (placa: string) => {
    Alert.alert(
      "Eliminar vehículo",
      "¿Seguro que quieres eliminar este vehículo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              const token = await user!.getIdToken();

              await fetch(`${process.env.EXPO_PUBLIC_API_URL}/vehicles/${placa}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              setVehiculos((prev) =>
                prev.filter((v) => v.placa !== placa)
              );
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar");
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarVehiculos();
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-fondo">
        <ActivityIndicator size="large" color="#FF6D08" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-fondo px-5 pt-8">
      <Text className="text-2xl font-bold text-black mb-6">
        Mis Vehículos
      </Text>

      <ScrollView>
        {vehiculos.length === 0 ? (
          <Text className="text-gray-600 text-center mt-10">
            No tienes vehículos registrados
          </Text>
        ) : (
          vehiculos.map((v) => (
            <View
              key={v.placa}
              className="bg-[#f59b0020] rounded-2xl p-5 mb-4"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-bold text-black flex-1 pr-2">
                  {v.marca.toUpperCase()} {v.modelo}
                </Text>

                {/* BOTÓN ELIMINAR */}
                <TouchableOpacity
                  onPress={() => eliminarVehiculo(v.placa)}
                  className="bg-red-500 px-3 py-1 rounded-lg self-start"
                >
                  <Text className="text-white font-semibold text-sm">
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>

              <Text>🚘 Placa: {v.placa}</Text>
              <Text>📅 Año: {v.anoModelo}</Text>
              <Text>🔧 Tipo: {v.tipoVehiculo}</Text>

              <View className="mt-3">
                <Text className="text-sm text-gray-700">
                  SOAT: {v.fechaSoat || "No registrado"}
                </Text>
                <Text className="text-sm text-gray-700">
                  Tecnomecánica: {v.fechaTecno || "No registrado"}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* BOTÓN AGREGAR */}
      <TouchableOpacity
        onPress={() => router.push("../agregarVehiculo")}
        className="bg-fondoNaranja self-end rounded-xl mb-6 px-4 py-2"
      >
        <Text className="text-white font-bold text-lg">
          Agregar Vehículo
        </Text>
      </TouchableOpacity>
    </View>
  );
}
