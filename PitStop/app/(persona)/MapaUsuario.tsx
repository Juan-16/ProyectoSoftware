import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { useFocusEffect } from "@react-navigation/native";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Taller {
  id: string;
  nombre: string;
  direccion: string;
  latitude: number;
  longitude: number;
  servicios: string[];
}

const getUser = async () => {
  const userStr = await AsyncStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export default function MapaUsuario() {
  const [ubicacion, setUbicacion] = useState<any>(null);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicioFiltro, setServicioFiltro] = useState<string | null>(null);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<string[]>([]);


  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [ubicacionTaller, setUbicacionTaller] = useState<any>(null);
  const [estadoSolicitud, setEstadoSolicitud] = useState<string | null>(null);


  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setUbicacion(loc.coords);
  };




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
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const generarCodigo = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4 dígitos
  };



  const pedirAyuda = async () => {
    try {
      const user = await getUser();

      if (!user || !ubicacion) {
        Alert.alert("Error", "No se pudo obtener tu ubicación");
        return;
      }

      const codigo = generarCodigo();
      const docRef = await addDoc(collection(db, "solicitudesAyuda"), {
        usuarioId: user.uid,
        estado: "pendiente",
        codigoConfirmacion: codigo, 
        ubicacionUsuario: {
          lat: ubicacion.latitude,
          lng: ubicacion.longitude,
        },
        tallerId: null,
        ubicacionTaller: null,
        creadaEn: new Date(),
      });

      setSolicitudId(docRef.id);

      Alert.alert(
        "Solicitud enviada",
        `Tu código es: ${codigo} \nPuedes ver el estado de tu solicitud en el apartado de alertas, espera a que un taller la acepte.`
      );

    } catch (error) {
      console.log(error);
    }
  };

 
  useEffect(() => {
    if (!solicitudId) return;

    const unsub = onSnapshot(
      doc(db, "solicitudesAyuda", solicitudId),
      (docSnap) => {
        const data = docSnap.data();
        if (!data) return;

    
        if (data.estado === "completada" || data.estado === "cancelada") {
          setSolicitudId(null);
          setEstadoSolicitud(null);
          setUbicacionTaller(null);

          Alert.alert("Servicio finalizado", "Tu servicio ha sido completado.");
          return;
        }

        setEstadoSolicitud(data.estado);

        if (data.ubicacionTaller) {
          setUbicacionTaller(data.ubicacionTaller);
        }

        if (data.estado === "en_camino") {
          Alert.alert("Taller en camino", "Un taller ha aceptado tu solicitud y está en camino hacia ti porfavor quedese en el mismo lugar.");
        }
      }
    );

    return () => unsub();
  }, [solicitudId]);

  
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([
        obtenerUbicacion(),
        cargarTalleres(),
        verificarSolicitudActiva(), 
      ]).finally(() => setLoading(false));
    }, [])
  );

  const abrirRuta = (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    });

    Linking.openURL(url!);
  };



  const verificarSolicitudActiva = async () => {
    try {
      const user = await getUser();
      if (!user) return;

      const q = query(
        collection(db, "solicitudesAyuda"),
        where("usuarioId", "==", user.uid),
        where("estado", "in", ["pendiente", "en_camino"])
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setSolicitudId(docSnap.id);

        const data = docSnap.data();
        setEstadoSolicitud(data.estado);

        if (data.ubicacionTaller) {
          setUbicacionTaller(data.ubicacionTaller);
        }
      } else {
        setSolicitudId(null);
        setEstadoSolicitud(null);
        setUbicacionTaller(null); 
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calcularDistancia = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

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
      {/* FILTROS */}
      <ScrollView horizontal style={styles.filtroContainer}>
        <TouchableOpacity
          onPress={() => setServicioFiltro(null)}
          style={[styles.filtroBtn, !servicioFiltro && styles.filtroActivo]}
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

      {/* MAPA */}
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
              description={`${distancia.toFixed(2)} km`}
              onCalloutPress={() =>
                abrirRuta(taller.latitude, taller.longitude)
              }
            />
          );
        })}

        {/* 🚗 TALLER EN CAMINO */}
        {ubicacionTaller && (
          <Marker
            coordinate={{
              latitude: ubicacionTaller.lat,
              longitude: ubicacionTaller.lng,
            }}
            pinColor="green"
            title="Taller en camino"
          />
        )}
      </MapView>

      {/* ESTADO */}
      {estadoSolicitud && (
        <View style={styles.estado}>
          <Text style={{ color: "white" }}>
            Estado: {estadoSolicitud}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.btn,
          solicitudId && { backgroundColor: "#999" } 
        ]}
        onPress={pedirAyuda}
        disabled={!!solicitudId} 
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {solicitudId ? "Servicio en curso..." : "🚨 Pedir ayuda"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  filtroContainer: {
    position: "absolute",
    top: 50,
    zIndex: 10,
    paddingHorizontal: 10,
  },
  filtroBtn: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filtroActivo: { backgroundColor: "#f97316" },
  filtroText: { color: "white", fontWeight: "600" },
  btn: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#f97316",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  estado: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "black",
    padding: 10,
    borderRadius: 10,
  },
});