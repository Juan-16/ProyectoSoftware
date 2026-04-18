import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function Home() {
  const [talleres, setTalleres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


    useFocusEffect(
      useCallback(() => {
           cargarTalleresCercanos();
      }, [])
    );
  

  const cargarTalleresCercanos = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permiso denegado");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/taller/cercanos?lat=${latitude}&lng=${longitude}`
    );

    const data = await res.json();

    setTalleres(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-600 mt-2">
          Cargando talleres cercanos...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4 text-center">
        🔧 Talleres cercanos
      </Text>

      {talleres.length === 0 ? (
        <Text className="text-gray-500 text-center">
          No hay talleres cercanos disponibles.
        </Text>
      ) : (
        talleres.map((t) => (
          <TouchableOpacity
            key={t.id}
            className="flex-row items-center bg-orange-50 border border-orange-200 rounded-xl mb-4 p-3"
            onPress={() =>
              router.push(`/DetalleTaller?id=${t.id}`)
            }
          >
            {t.imageUrl ? (
              <Image
                source={{ uri: t.imageUrl }}
                className="w-16 h-16 rounded-lg mr-4"
              />
            ) : (
              <View className="w-16 h-16 bg-gray-200 rounded-lg mr-4" />
            )}

            <View className="flex-1">
              <Text className="text-lg font-semibold text-black">
                {t.nombre}
              </Text>
              <Text className="text-gray-600">
                {t.direccion}
              </Text>

              {t.distancia && (
                <Text className="text-gray-400 text-sm">
                  📍 {t.distancia.toFixed(1)} km
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}