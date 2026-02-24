import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { db } from "../../firebase.config";
import { collection, getDocs } from "firebase/firestore";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

export default function Home() {
  const [talleres, setTalleres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarTalleresCercanos();
  }, []);

  const cargarTalleresCercanos = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "No se pudo obtener tu ubicación."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const snapshot = await getDocs(collection(db, "talleres"));
      const lista: any[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const datos = data.datosPersonales || {};

        const taller = {
          id: docSnap.id,
          nombre: datos.nombre,
          direccion: datos.direccion,
          imageUrl: datos.imageUrl,
          lat: datos.lat,
          lon: datos.lon,
        };

        // Si el taller tiene ubicación registrada, calculamos la distancia
        if (taller.lat && taller.lon) {
          const dist = calcularDistancia(
            latitude,
            longitude,
            taller.lat,
            taller.lon
          );

          if (dist <= 10) {
            lista.push({ ...taller, distancia: dist });
          }
        } else {
          lista.push({ ...taller, distancia: null });
        }
      });

      setTalleres(lista);
    } catch (err) {
      console.error("Error cargando talleres:", err);
    } finally {
      setLoading(false);
    }
  };

  const calcularDistancia = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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