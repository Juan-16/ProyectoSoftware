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
    Image
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";



const getUser = async () => {
  const userStr = await AsyncStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

const guardarVehiculoBackend = async (data: any) => {
    const user = await getUser();

    if (!user) throw new Error("Usuario no autenticado");

    const token = await AsyncStorage.getItem("token");

    if (!token) {
        throw new Error("No autenticado");
    }

    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/vehiculos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error guardando vehículo");
};



export default function CompleteProfilePersona() {

    const router = useRouter();

    const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
    const [modelo, setModelo] = useState("");
    const [anoModelo, setAnoModelo] = useState("");
    const [tipoVehiculo, setTipoVehiculo] = useState("");
    const [placa, setPlaca] = useState("");

    // Errores
    const [errores, setErrores] = useState({
        modelo: "",
        anoModelo: "",
        tipoVehiculo: "",
        placa: "",
        marca: "",
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
        const nuevosErrores: any = {};

        if (!modelo || modelo.length < 2) {
            nuevosErrores.modelo = "Modelo inválido";
        }

        if (!/^\d{4}$/.test(anoModelo) || Number(anoModelo) < 1950 || Number(anoModelo) > añoActual) {
            nuevosErrores.anoModelo = "Año fuera de rango";
        }

        if (!tipoVehiculo || tipoVehiculo.length < 2) {
            nuevosErrores.tipoVehiculo = "Tipo requerido";
        }

        if (!/^[A-Z0-9]{6,7}$/i.test(placa)) {
            nuevosErrores.placa = "Placa inválida";
        }

        if (!marcaSeleccionada) {
            nuevosErrores.marca = "Selecciona una marca";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const validarFechas = () => {
        const errores = {
            soat: !fechaSoat,
            tecno: !fechaTecno,
        };
        setErrorFecha(errores);
        return !Object.values(errores).includes(true);
    };


    const handleContinuar = async () => {
        const camposValidos = validarCampos();
        const fechasValidas = validarFechas();

        if (!camposValidos || !fechasValidas) {
            return;
        }

        const formatDate = (date: Date | null) => {
            if (!date) return "";

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        try {
            const datosVehiculo = {
                marca: marcaSeleccionada!,
                modelo,
                anoModelo,
                tipoVehiculo,
                placa,
                fechaSoat: formatDate(fechaSoat),
                fechaTecno: formatDate(fechaTecno),
            };

            await guardarVehiculoBackend(datosVehiculo);
            router.replace("/(persona)/home");
        } catch (error) {
            console.error("Error al guardar vehículo o crear alertas:", error);
            Alert.alert("Error", "Hubo un problema al guardar los datos.");
        }
    };



    const [fechaSoat, setFechaSoat] = useState<Date | null>(null);
    const [fechaTecno, setFechaTecno] = useState<Date | null>(null);
   



    const [mostrarPicker, setMostrarPicker] = useState<null | "soat" | "tecno">(null);
    const [errorFecha, setErrorFecha] = useState({
        soat: false,
        tecno: false,

    });

    const handleFechaChange = (event: any, selectedDate?: Date) => {
        if (!selectedDate) {
            setMostrarPicker(null);
            return;
        }

        if (mostrarPicker === "soat") {
            setFechaSoat(selectedDate);
            setErrorFecha((prev) => ({ ...prev, soat: false }));
        } else if (mostrarPicker === "tecno") {
            setFechaTecno(selectedDate);
            setErrorFecha((prev) => ({ ...prev, tecno: false }));
        }

        setMostrarPicker(null);
    };

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <View className="flex-1 items-center px-4 mt-10">
                <Text className="text-2xl font-bold text-center mb-6">
                    Información del vehículo
                </Text>

                {/* Dropdown de marcas */}
                <View
                    className={`w-48 h-18 bg-white rounded-xl  px-2  mb-1 {
            errores.marca ? "border-red-500" : "border"
          }`}
                >
                    <RNPickerSelect
                        placeholder={{ label: "Marca", value: null }}
                        onValueChange={(value) => {
                            setMarcaSeleccionada(value);
                            setErrores((prev) => ({ ...prev, marca: "" }));
                        }}
                        items={marcas}
                        value={marcaSeleccionada}
                        style={pickerSelectStyles}
                    />
                </View>
                {errores.marca && (
                    <Text className="text-red-500 text-xs mb-4">{errores.marca}</Text>
                )}

                {/* Inputs en filas */}
                <View className="flex-row justify-between w-full mb-2 mt-8">
                    <View className="w-[48%]">
                        <TextInput
                            className={`bg-white  rounded-xl px-4 py-3 ${errores.modelo ? "border-red-500" : ""
                                }`}
                            placeholder="Modelo"
                            placeholderTextColor="#9CA3AF"
                            value={modelo}
                            onChangeText={(text) => {
                                setModelo(text);
                                setErrores((prev) => ({ ...prev, modelo: "" }));
                            }}
                        />
                        {errores.modelo && (
                            <Text className="text-red-500 text-xs mt-1">{errores.modelo}</Text>
                        )}
                    </View>

                    <View className="w-[48%]">
                        <TextInput
                            className={`bg-white  rounded-xl px-4 py-3 ${errores.anoModelo ? "border-red-500" : ""
                                }`}
                            placeholder="Año Modelo"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={anoModelo}
                            onChangeText={(text) => {
                                setAnoModelo(text);
                                setErrores((prev) => ({ ...prev, anoModelo: "" }));
                            }}
                        />
                        {errores.anoModelo && (
                            <Text className="text-red-500 text-xs mt-1">{errores.anoModelo}</Text>
                        )}
                    </View>
                </View>

                <View className="flex-row justify-between w-full mb-4 mt-4">
                    <View className="w-[48%]">
                        <TextInput
                            className={`bg-white  rounded-xl px-4 py-3 ${errores.tipoVehiculo ? "border-red-500" : ""
                                }`}
                            placeholder="Tipo Vehículo"
                            placeholderTextColor="#9CA3AF"
                            value={tipoVehiculo}
                            onChangeText={(text) => {
                                setTipoVehiculo(text);
                                setErrores((prev) => ({ ...prev, tipoVehiculo: "" }));
                            }}
                        />
                        {errores.tipoVehiculo && (
                            <Text className="text-red-500 text-xs mt-1">{errores.tipoVehiculo}</Text>
                        )}
                    </View>

                    <View className="w-[48%]">
                        <TextInput
                            className={`bg-white  rounded-xl px-4 py-3 ${errores.placa ? "border-red-500" : ""
                                }`}
                            placeholder="Placa"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="characters"
                            value={placa}
                            onChangeText={(text) => {
                                setPlaca(text);
                                setErrores((prev) => ({ ...prev, placa: "" }));
                            }}
                        />
                        {errores.placa && (
                            <Text className="text-red-500 text-xs mt-1">{errores.placa}</Text>
                        )}
                    </View>
                </View>

                <View className="w-full items-start mb-4 mt-4">
                    <Text className="text-base mb-2">Fecha de vencimiento del SOAT</Text>
                    <TouchableOpacity
                        onPress={() => setMostrarPicker("soat")}
                        className={`bg-white border px-4 py-3 rounded-xl w-full ${errorFecha.soat ? "border-red-500" : "border-gray-300"}`}
                    >
                        <Text className={`text-gray-700 ${!fechaSoat && errorFecha.soat ? "text-red-500" : ""}`}>
                            {fechaSoat ? fechaSoat.toLocaleDateString() : "Seleccionar fecha"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="w-full items-start mb-4 mt-4">
                    <Text className="text-base mb-2">Fecha de vencimiento Tecnomecánica</Text>
                    <TouchableOpacity
                        onPress={() => setMostrarPicker("tecno")}
                        className={`bg-white border px-4 py-3 rounded-xl w-full ${errorFecha.tecno ? "border-red-500" : "border-gray-300"}`}
                    >
                        <Text className={`text-gray-700 ${!fechaTecno && errorFecha.tecno ? "text-red-500" : ""}`}>
                            {fechaTecno ? fechaTecno.toLocaleDateString() : "Seleccionar fecha"}
                        </Text>
                    </TouchableOpacity>
                </View>


                {/* DateTimePicker */}
                {mostrarPicker && (
                    <DateTimePicker
                        value={
                            mostrarPicker === "soat"
                                ? fechaSoat || new Date()
                                : fechaTecno || new Date()
                        }
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleFechaChange}
                    />
                )}

                {/* Botón continuar */}
                <TouchableOpacity
                    onPress={handleContinuar}
                    className="bg-fondoNaranja w-6/12 py-3 rounded-xl mt-6 items-center"
                >
                    <Text className="text-white text-base font-semibold">Guardar y Continuar</Text>
                </TouchableOpacity>

                <View className="items-start w-11/12  space-y-4 mt-20">
                    <Image
                        source={require('../assets/images/LogoCarro.png')}
                        className="w-24 h-16 absolute"
                        resizeMode="contain"
                    />
                </View>
            </View>


        </ScrollView>
    );
}

// Estilos personalizados para el Picker
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 10,
        color: "#000",
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 10,
        color: "#000",
    },
});
