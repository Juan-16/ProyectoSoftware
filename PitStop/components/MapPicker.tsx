import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Modal from "react-native-modal";
import * as Location from "expo-location";

interface Props {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (ubicacion: {
    latitude: number;
    longitude: number;
    direccion: string;
  }) => void;
}

export default function MapPicker({
  visible,
  onClose,
  onLocationSelected,
}: Props) {
  const [region, setRegion] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) cargarUbicacionInicial();
  }, [visible]);

  const cargarUbicacionInicial = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      setMarker({ latitude, longitude });

      obtenerDireccion(latitude, longitude);
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerDireccion = async (lat: number, lon: number) => {
    try {
      const [place] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });

      if (place) {
        const dir = `${place.street ?? ""} ${place.name ?? ""}, ${place.city ?? ""}, ${place.region ?? ""}`;
        setDireccion(dir);
      }
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
    }
  };

  const seleccionarUbicacion = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    setMarker({ latitude, longitude });
    obtenerDireccion(latitude, longitude);
  };

  const confirmar = () => {
    if (!marker) return;

    onLocationSelected({
      latitude: marker.latitude,
      longitude: marker.longitude,
      direccion,
    });

    onClose();
  };

  const usarUbicacionActual = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      setMarker({ latitude, longitude });
      obtenerDireccion(latitude, longitude);
    } catch (error) {
      console.error("Error ubicación actual:", error);
    }
  };

  return (
    <Modal isVisible={visible} style={{ margin: 0 }}>
      <View className="flex-1 bg-white">
        {/* HEADER */}
        <View className="p-4 bg-black">
          <Text className="text-white text-lg font-bold text-center">
            Selecciona tu ubicación
          </Text>
        </View>

        {/* MAPA */}
        {loading || !region ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="mt-2">Cargando mapa...</Text>
          </View>
        ) : (
          <MapView
            style={{ flex: 1 }}
            region={region}
            onPress={seleccionarUbicacion}
          >
            {marker && (
              <Marker coordinate={marker} draggable
                onDragEnd={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setMarker({ latitude, longitude });
                  obtenerDireccion(latitude, longitude);
                }}
              />
            )}
          </MapView>
        )}

        {/* DIRECCIÓN */}
        <View className="p-3 bg-gray-100">
          <Text className="text-gray-700 text-sm">
            📍 {direccion || "Selecciona una ubicación"}
          </Text>
        </View>

        {/* BOTONES */}
        <View className="p-4">
          <TouchableOpacity
            onPress={usarUbicacionActual}
            className="bg-gray-800 py-3 rounded-xl mb-3"
          >
            <Text className="text-white text-center font-semibold">
              Usar mi ubicación actual
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmar}
            className="bg-orange-500 py-3 rounded-xl mb-3"
          >
            <Text className="text-white text-center font-semibold">
              Confirmar ubicación
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-300 py-3 rounded-xl"
          >
            <Text className="text-center font-semibold">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}