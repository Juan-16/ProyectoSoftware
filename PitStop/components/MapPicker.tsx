import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import * as Location from "expo-location";

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    direccion: string;
  }) => void;
}

export default function MapPicker({ visible, onClose, onLocationSelected }: MapPickerProps) {
  const [region, setRegion] = useState<Region | null>(null);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permiso denegado para acceder a la ubicación");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
      })();
    }
  }, [visible]);

  const handlePress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });

    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place) {
      const direccion = `${place.street ?? ""} ${place.name ?? ""}, ${place.city ?? ""}, ${place.region ?? ""}`;
      onLocationSelected({ latitude, longitude, direccion });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 }}>
        {loading || !region ? (
          <ActivityIndicator size="large" style={{ marginTop: 100 }} />
        ) : (
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={region}
            onPress={handlePress}
          >
            {marker && <Marker coordinate={marker} />}
          </MapView>
        )}

        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 40,
            right: 20,
            backgroundColor: "white",
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}