import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth } from "../firebase.config";
import { useRouter } from "expo-router";

const guardarVehiculoBackend = async (data: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No auth");

  const token = await user.getIdToken();

  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error guardando vehículo");
};

export default function AgregarVehiculo() {
  const router = useRouter();

  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
  const [modelo, setModelo] = useState("");
  const [anoModelo, setAnoModelo] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [placa, setPlaca] = useState("");

  const [fechaSoat, setFechaSoat] = useState<Date | null>(null);
  const [fechaTecno, setFechaTecno] = useState<Date | null>(null);


  const [mostrarPicker, setMostrarPicker] =
    useState<null | "soat" | "tecno" >(null);

  const [errores, setErrores] = useState<any>({});
  const [errorFecha, setErrorFecha] = useState({
    soat: false,
    tecno: false,
  });

  const marcas = [
    { label: "Chevrolet", value: "chevrolet" },
    { label: "Renault", value: "renault" },
    { label: "Toyota", value: "toyota" },
    { label: "Mazda", value: "mazda" },
    { label: "Hyundai", value: "hyundai" },
    { label: "Kia", value: "kia" },
    { label: "Nissan", value: "nissan" },
  ];

  const validarCampos = () => {
    const añoActual = new Date().getFullYear();
    const nuevos: any = {};

    if (modelo.length < 2) nuevos.modelo = "Modelo inválido";
    if (!/^\d{4}$/.test(anoModelo) || Number(anoModelo) > añoActual)
      nuevos.anoModelo = "Año inválido";
    if (tipoVehiculo.length < 2) nuevos.tipoVehiculo = "Tipo requerido";
    if (!/^[A-Z0-9]{6,7}$/i.test(placa)) nuevos.placa = "Placa inválida";
    if (!marcaSeleccionada) nuevos.marca = "Selecciona una marca";

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const validarFechas = () => {
    const e = {
      soat: !fechaSoat,
      tecno: !fechaTecno,
    };
    setErrorFecha(e);
    return !Object.values(e).includes(true);
  };

  const formatDate = (d: Date | null) =>
    d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";

  const guardar = async () => {
    if (!validarCampos() || !validarFechas()) return;

    try {
      await guardarVehiculoBackend({
        marca: marcaSeleccionada,
        modelo,
        anoModelo,
        tipoVehiculo,
        placa,
        fechaSoat: formatDate(fechaSoat),
        fechaTecno: formatDate(fechaTecno),
      });

      Alert.alert("Éxito", "Vehículo agregado");
      router.back(); // vuelve a la lista
    } catch {
      Alert.alert("Error", "No se pudo guardar");
    }
  };

  const handleFechaChange = (_: any, selected?: Date) => {
    if (!selected) return setMostrarPicker(null);
    if (mostrarPicker === "soat") setFechaSoat(selected);
    if (mostrarPicker === "tecno") setFechaTecno(selected);
    setMostrarPicker(null);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="flex-1 items-center px-4 mt-10">
        <Text className="text-2xl font-bold mb-6">Agregar Vehículo</Text>

        <View className="w-48 bg-white rounded-xl px-2 mb-1 ">
          <RNPickerSelect
            placeholder={{ label: "Marca", value: null }}
            onValueChange={setMarcaSeleccionada}
            items={marcas}
            style={pickerSelectStyles}
          />
        </View>
        {errores.marca && <Text className="text-red-500">{errores.marca}</Text>}

        {/* Inputs */}
        <TextInput className="bg-white w-full rounded-xl px-4 py-3 mt-4" placeholder="Modelo" value={modelo} onChangeText={setModelo} />
        <TextInput className="bg-white w-full rounded-xl px-4 py-3 mt-4" placeholder="Año Modelo" keyboardType="numeric" value={anoModelo} onChangeText={setAnoModelo} />
        <TextInput className="bg-white w-full rounded-xl px-4 py-3 mt-4" placeholder="Tipo Vehículo" value={tipoVehiculo} onChangeText={setTipoVehiculo} />
        <TextInput className="bg-white w-full rounded-xl px-4 py-3 mt-4" placeholder="Placa" autoCapitalize="characters" value={placa} onChangeText={setPlaca} />

        {/* Fechas */}
        {["soat", "tecno"].map((t: any) => (
          <TouchableOpacity key={t} onPress={() => setMostrarPicker(t)} className="bg-white px-4 py-3 rounded-xl w-full mt-4">
            <Text>
              {t === "soat" && (fechaSoat?.toLocaleDateString() || "Fecha SOAT")}
              {t === "tecno" && (fechaTecno?.toLocaleDateString() || "Fecha Tecnomecánica")}
            </Text>
          </TouchableOpacity>
        ))}

        {mostrarPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleFechaChange}
          />
        )}

        <TouchableOpacity onPress={guardar} className="bg-fondoNaranja w-6/12 py-3 rounded-xl mt-8 items-center">
          <Text className="text-white font-semibold">Guardar Vehículo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 10, color: "#000" },
  inputAndroid: { fontSize: 16, paddingVertical: 10, color: "#000" },
});
