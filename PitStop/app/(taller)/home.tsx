import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { auth, db } from "../../firebase.config";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";



const getUser = async () => {
  const userStr = await AsyncStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};


export default function TabsTalleresHome() {
  const [modalVisible, setModalVisible] = useState(false);
  const [intervalo, setIntervalo] = useState<number | null>(null);
  const [cupos, setCupos] = useState<number | null>(null);
  const [taller, setTaller] = useState<any>(null);
  const [citasHoy, setCitasHoy] = useState<any[]>([]);



  useFocusEffect(
    useCallback(() => {
      const fetchTaller = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
          const docRef = doc(db, "talleres", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setTaller(docSnap.data());
          }

          cargarCitasHoy();
        } catch (error) {
          console.error(error);
        }
      };

      fetchTaller();
      cargarCitasHoy();
    }, [])
  );


  const cargarCitasHoy = async () => {
    try {
       const user = await getUser();

      if (!user) throw new Error("Usuario no autenticado");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No autenticado");
      }


      const hoy = new Date().toLocaleDateString("sv-SE");

      const q = query(
        collection(db, "citas"),
        where("tallerId", "==", user.uid),
        where("fecha", "==", hoy)
      );

      const snapshot = await getDocs(q);

      const lista: any[] = [];

      snapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      lista.sort((a, b) => (a.hora > b.hora ? 1 : -1));

      setCitasHoy(lista);
    } catch (error) {
      console.error("Error cargando citas:", error);
    }
  };

  const guardarConfiguracion = async () => {
  try {
     const user = await getUser();

      if (!user) throw new Error("Usuario no autenticado");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No autenticado");
      }


    if (!intervalo || !cupos) {
      Alert.alert("Faltan datos", "Por favor selecciona ambas opciones.");
      return;
    }

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/taller/configuracion-citas`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intervalo,
          cupos,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    setModalVisible(false);

    Alert.alert(
      "✅ Configuración guardada",
      "La configuración se actualizó correctamente."
    );
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "No se pudo guardar la configuración.");
  }
};

  return (
    <View className="flex-1 bg-white p-6">
      <ScrollView>

        {/* Bienvenida */}
        <Text className="text-2xl font-bold mb-4 text-black">
          Bienvenido, {taller?.datosPersonales?.nombre || "Taller"}
        </Text>

        <Text className="text-gray-700 mb-6">
          Para comenzar, configura el intervalo de atención y la cantidad de carros que puedes
          atender en cada intervalo.
        </Text>

        {/* Botón configuración */}
        <TouchableOpacity
          className="bg-orange-500 py-3 px-4 rounded-lg mb-6"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white text-center font-semibold">
            Configurar citas
          </Text>
        </TouchableOpacity>

        {/* Citas de hoy */}
        <Text className="text-lg font-semibold mb-3">
          Citas de hoy ({citasHoy.length})
        </Text>

        {citasHoy.length === 0 ? (
          <Text className="text-gray-500 italic">
            No hay citas programadas para hoy.
          </Text>
        ) : (
          citasHoy.map((cita) => (
            <View
              key={cita.id}
              className={`
                p-3 mb-3 rounded-lg 
               ${
              cita.estado === "confirmada"
                ? "bg-[#2cc55852] "
                : cita.estado === "cancelada"
                ? "bg-[#6b010120]"
                : "bg-[#f59b0020]"
            }
              `}
            >
              <Text className="font-bold text-base">{cita.hora}</Text>

              <Text>Servicio: {cita.servicio}</Text>
              <Text>Vehículo: {cita.vehiculoId}</Text>

              <Text
                className={`font-bold mt-1 ${cita.estado === "confirmada"
                    ? "text-green-600"
                    : cita.estado === "cancelada"
                      ? "text-red-600"
                      : "text-orange-500"
                  }`}
              >
                {cita.estado === "confirmada"
                  ? "Confirmada"
                  : cita.estado === "cancelada"
                    ? "Cancelada"
                    : "Pendiente"}
              </Text>
            </View>
          ))
        )}

      </ScrollView>

      {/* Modal configuración */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text className="text-xl font-bold mb-4 text-center text-black">
              Configurar citas
            </Text>

            <Text className="text-gray-700 mb-2">
              Selecciona el intervalo de citas:
            </Text>

            <RNPickerSelect
              onValueChange={(value) => setIntervalo(value)}
              placeholder={{ label: "Selecciona intervalo", value: null }}
              items={[
                { label: "Cada 30 minutos", value: 30 },
                { label: "Cada 45 minutos", value: 45 },
                { label: "Cada 1 hora", value: 60 },
              ]}
            />

            <Text className="text-gray-700 mt-4 mb-2">
              Cantidad de carros por intervalo:
            </Text>

            <RNPickerSelect
              onValueChange={(value) => setCupos(value)}
              placeholder={{ label: "Selecciona cantidad", value: null }}
              items={[
                { label: "1 carro", value: 1 },
                { label: "2 carros", value: 2 },
                { label: "3 carros", value: 3 },
                { label: "4 carros", value: 4 },
                { label: "5 carros", value: 5 },
              ]}
            />

            <TouchableOpacity
              className="bg-orange-500 py-3 px-4 rounded-lg mt-6"
              onPress={guardarConfiguracion}
            >
              <Text className="text-white text-center font-semibold">
                Guardar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center text-gray-500">
                Cancelar
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
});