import React, { useEffect, useState } from "react";
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
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default function TabsTalleresHome() {
  const [modalVisible, setModalVisible] = useState(false);
  const [intervalo, setIntervalo] = useState<number | null>(null);
  const [cupos, setCupos] = useState<number | null>(null);
  const [taller, setTaller] = useState<any>(null);

  useEffect(() => {
    const fetchTaller = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "talleres", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTaller(docSnap.data());
      }
    };

    fetchTaller();
  }, []);

  const guardarConfiguracion = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      if (!intervalo || !cupos) {
        Alert.alert("Faltan datos", "Por favor selecciona ambas opciones.");
        return;
      }

      await updateDoc(doc(db, "talleres", user.uid), {
        configuracionCitas: {
          intervalo,
          cupos,
        },
      });

      setModalVisible(false);
      Alert.alert("✅ Configuración guardada", "La configuración se actualizó correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar la configuración.");
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      <ScrollView>
        <Text className="text-2xl font-bold mb-4 text-black">
          Bienvenido, {taller?.datosPersonales?.nombre || "Taller"}
        </Text>

        <Text className="text-gray-700 mb-6">
          Para comenzar, configura el intervalo de atención y la cantidad de carros que puedes
          atender en cada intervalo.
        </Text>

        <TouchableOpacity
          className="bg-orange-500 py-3 px-4 rounded-lg mb-6"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white text-center font-semibold">
            Configurar citas
          </Text>
        </TouchableOpacity>

        {/* Ejemplo de citas del día */}
        <Text className="text-lg font-semibold mb-2">Citas de hoy</Text>
        <Text className="text-gray-500 italic">
          (Aquí se mostrarán las citas programadas para hoy una vez implementemos esa parte)
        </Text>
      </ScrollView>

      {/* Modal de configuración */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text className="text-xl font-bold mb-4 text-center text-black">
              Configurar citas
            </Text>

            <Text className="text-gray-700 mb-2">Selecciona el intervalo de citas:</Text>
            <RNPickerSelect
              onValueChange={(value) => setIntervalo(value)}
              placeholder={{ label: "Selecciona intervalo", value: null }}
              items={[
                { label: "Cada 30 minutos", value: 30 },
                { label: "Cada 45 minutos", value: 45 },
                { label: "Cada 1 hora", value: 60 },
              ]}
            />

            <Text className="text-gray-700 mt-4 mb-2">Cantidad de carros por intervalo:</Text>
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
              <Text className="text-white text-center font-semibold">Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center text-gray-500">Cancelar</Text>
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