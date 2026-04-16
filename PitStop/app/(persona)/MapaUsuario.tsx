import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Linking, Platform } from "react-native";

interface Taller {
  id: string;
  nombre: string;
  direccion: string;
  latitude: number;
  longitude: number;
  servicios: string[];
}

export default function MapaUsuario() {
  const [ubicacion, setUbicacion] = useState<any>(null);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicioFiltro, setServicioFiltro] = useState<string | null>(null);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<string[]>([]);

  const router = useRouter();

  // 📍 Obtener ubicación
  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setUbicacion(loc.coords);
  };

  // 🔥 Cargar talleres
  const cargarTalleres = async () => {
    try {
      const snapshot = await getDocs(collection(db, "talleres"));
      const lista: Taller[] = [];
      const serviciosSet = new Set<string>();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const datos = data.datosPersonales;

        if (!datos?.ubicacion) return;

        const servicios = data.servicios || [];

        servicios.forEach((s: string) => serviciosSet.add(s));

        lista.push({
          id: docSnap.id,
          nombre: datos.nombre || "Taller",
          direccion: datos.direccion || "",
          latitude: datos.ubicacion.lat,
          longitude: datos.ubicacion.lng,
          servicios,
        });
      });

      setTalleres(lista);
      setServiciosDisponibles(Array.from(serviciosSet));
    } catch (error) {
      console.error("Error cargando talleres:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirRuta = (lat: number, lng: number, nombre: string) => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    });

    Linking.openURL(url!);
  };

  // 📏 Calcular distancia (Haversine)
  const calcularDistancia = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 🔄 Recargar al enfocar pantalla
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      obtenerUbicacion();
      cargarTalleres();
    }, [])
  );

  // 🔍 Filtrar talleres
  const talleresFiltrados = servicioFiltro
    ? talleres.filter((t) => t.servicios?.includes(servicioFiltro))
    : talleres;

  if (loading || !ubicacion) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 🔍 FILTROS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtroContainer}
      >
        <TouchableOpacity
          onPress={() => setServicioFiltro(null)}
          style={[
            styles.filtroBtn,
            servicioFiltro === null && styles.filtroActivo,
          ]}
        >
          <Text style={styles.filtroText}>Todos</Text>
        </TouchableOpacity>

        {serviciosDisponibles.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setServicioFiltro(s)}
            style={[
              styles.filtroBtn,
              servicioFiltro === s && styles.filtroActivo,
            ]}
          >
            <Text style={styles.filtroText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🗺️ MAPA */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: ubicacion.latitude,
          longitude: ubicacion.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {talleresFiltrados.map((taller) => {
          const distancia = calcularDistancia(
            ubicacion.latitude,
            ubicacion.longitude,
            taller.latitude,
            taller.longitude
          );

          return (
            <Marker
              key={taller.id}
              coordinate={{
                latitude: taller.latitude,
                longitude: taller.longitude,
              }}
               pinColor="blue"
              title={taller.nombre}
              description={`Enrutar ${distancia.toFixed(2)} km`}
              onCalloutPress={() =>
                abrirRuta(taller.latitude, taller.longitude, taller.nombre)
              }
            />
            
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filtroContainer: {
    position: "absolute",
    top: 50,
    zIndex: 10,
    paddingHorizontal: 10,
  },
  filtroBtn: {
    backgroundColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filtroActivo: {
    backgroundColor: "#f97316",
  },
  filtroText: {
    color: "white",
    fontWeight: "600",
  },
  callout: {
    width: 180,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    borderColor: "#f97316",
    borderWidth: 1,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 12,
    color: "#555",
  },
  calloutBtn: {
    marginTop: 6,
    color: "#f97316",
    fontWeight: "bold",
  },
});