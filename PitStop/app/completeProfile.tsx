import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal from "react-native-modal";
import MapPicker from '../components/MapPicker';
import { uploadToCloudinary } from "../components/uploadToCloudinary";
import { auth, db } from "../firebase.config";



const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
];



export default function completeProfile() {

    const guardarDatosPersona = async () => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuario no autenticado");

            let imageUrl = "";

            if (logo) {
                const uploadedUrl = await uploadToCloudinary(logo);
                if (!uploadedUrl) throw new Error("No se pudo subir la imagen");
                imageUrl = uploadedUrl;
            }

            // 🔥 TOKEN DE FIREBASE (para que backend sepa quién es)
            const token = await user.getIdToken();

            const response = await fetch("http://10.179.5.80:3000/profile/persona", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nombre,
                    telefono,
                    direccion,
                    fechaNacimiento: fechaNacimiento?.toISOString(),
                    imageUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            router.push("/CompleteProfilePersona");

        } catch (error) {
            console.error("Error:", error);
            alert("Ocurrió un error al guardar tus datos.");
        }
    };


    const guardarDatosTaller = async () => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuario no autenticado");

            let imageUrl = "";

            if (logo) {
                const uploadedUrl = await uploadToCloudinary(logo);
                if (!uploadedUrl) throw new Error("No se pudo subir el logo");
                imageUrl = uploadedUrl;
            }

            const token = await user.getIdToken();

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile/taller`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nombreTaller,
                    telefonoTaller,
                    direccion,
                    horarios,
                    imageUrl,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            router.push("/CompleteProfileTaller");

        } catch (error) {
            console.error("Error:", error);
            alert("Ocurrió un error al guardar los datos del taller.");
        }
    };





    const router = useRouter();


    // Imagen de logo taller
    const [logo, setLogo] = useState<string | null>(null);

    const pickImage = async () => {

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Se necesita permiso para acceder a la galería.');
            return;
        }

        // Abre la galería
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // cuadrado
            quality: 1,
        });

        if (!result.canceled) {
            setLogo(result.assets[0].uri);
        }
    };

    const [modalVisible, setModalVisible] = useState(false);
    const [horarios, setHorarios] = useState(
        diasSemana.map(() => ({
            activo: true,
            inicio: "",
            fin: ""
        }))
    );

    const toggleDia = (index: number) => {
        const nuevosHorarios = [...horarios];
        nuevosHorarios[index].activo = !nuevosHorarios[index].activo;

        // Limpia los campos si se desactiva
        if (!nuevosHorarios[index].activo) {
            nuevosHorarios[index].inicio = "";
            nuevosHorarios[index].fin = "";
        }

        setHorarios(nuevosHorarios);
    };

    const handleHorarioChange = (
        index: number,
        campo: "inicio" | "fin",
        valor: string
    ) => {
        const nuevosHorarios = [...horarios];
        nuevosHorarios[index][campo] = valor;
        setHorarios(nuevosHorarios);
    };


    const [direccion, setDireccion] = useState<string>("");
    const [mostrarMapa, setMostrarMapa] = useState(false);
    const handleDireccionSeleccionada = (ubicacion: {
        latitude: number;
        longitude: number;
        direccion: string;
    }) => {
        setDireccion(ubicacion.direccion);
    };

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.warn("Permiso denegado para acceder a la ubicación");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const [place] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (place) {
                const sugerencia = `${place.street ?? ""} ${place.name ?? ""}, ${place.city ?? ""}, ${place.region ?? ""}`;
                setDireccion(sugerencia);
            }
        })();
    }, []);

    const [errorNombre, setErrorNombre] = useState(false);
    const [errorTelefono, setErrorTelefono] = useState(false);
    const [errorFechaNacimiento, setErrorFechaNacimiento] = useState(false);
    const [errorDireccion, setErrorDireccion] = useState(false);

    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
    const [mostrarFechaPicker, setMostrarFechaPicker] = useState(false);

    const validarCampos = (): boolean => {
        const nombreValido = nombre.trim().length > 0;
        const telefonoValido = /^[0-9]{7,10}$/.test(telefono.trim());
        const direccionValida = direccion.trim().length > 5;
        let fechaNacimientoValida = false;

        if (fechaNacimiento) {
            const hoy = new Date();
            let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

            const yaCumplio =
                hoy.getMonth() > fechaNacimiento.getMonth() ||
                (hoy.getMonth() === fechaNacimiento.getMonth() &&
                    hoy.getDate() >= fechaNacimiento.getDate());

            if (!yaCumplio) {
                edad = edad - 1;
            }

            if (fechaNacimiento > hoy) {

                fechaNacimientoValida = false;
            } else if (edad < 16) {

                fechaNacimientoValida = false;
            } else {

                fechaNacimientoValida = true;
            }
        } else {
            fechaNacimientoValida = false; // no seleccionó fecha
        }

        // setea errores
        setErrorNombre(!nombreValido);
        setErrorTelefono(!telefonoValido);
        setErrorDireccion(!direccionValida);
        setErrorFechaNacimiento(!fechaNacimientoValida);

        return (
            nombreValido &&
            telefonoValido &&
            direccionValida &&
            fechaNacimientoValida
        );
    };




    const [nombreTaller, setNombreTaller] = useState("");
    const [telefonoTaller, setTelefonoTaller] = useState("");
    const [errorNombreTaller, setErrorNombreTaller] = useState(false);
    const [errorTelefonoTaller, setErrorTelefonoTaller] = useState(false);
    const [errorDireccionTaller, setErrorDireccionTaller] = useState(false);

    const validarCamposTaller = (): boolean => {
        const nombreValido = nombreTaller.trim().length > 0;
        const telefonoValido = /^[0-9]{7,10}$/.test(telefonoTaller.trim());
        const direccionValida = direccion.trim().length > 5;

        setErrorNombreTaller(!nombreValido);
        setErrorTelefonoTaller(!telefonoValido);
        setErrorDireccionTaller(!direccionValida);

        return nombreValido && telefonoValido && direccionValida;
    };

    const [mostrarPicker, setMostrarPicker] = useState<null | { index: number; campo: "inicio" | "fin" }>(null);

    const formatearHoraAMPM = (hora: string): string => {
        const [h, m] = hora.split(":");
        if (!h || !m) return hora;

        const date = new Date();
        date.setHours(Number(h));
        date.setMinutes(Number(m));

        return date.toLocaleTimeString("es-CO", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const validarHorarios = (): boolean => {
        for (const h of horarios) {
            if (h.activo && h.inicio && h.fin) {
                const [hIni, mIni] = h.inicio.split(":").map(Number);
                const [hFin, mFin] = h.fin.split(":").map(Number);

                const minutosInicio = hIni * 60 + mIni;
                const minutosFin = hFin * 60 + mFin;

                if (minutosInicio >= minutosFin) {
                    alert("La hora de inicio debe ser menor que la hora de fin en todos los días activos.");
                    return false;
                }
            }
        }
        return true;
    };

    const [tipoSeleccionado, setTipoSeleccionado] = useState<"taller" | "persona">("persona");

    return (

        <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={100}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, position: 'relative' }}
        >
            {<View className="w-full items-center my-3">

                <Text className="text-2xl font-bold text-center text-black mb-6">
                    ¿Cómo desea usar la app?
                </Text>
                {/* Selector */}
                <View className="flex-row justify-center mb-6">



                    <TouchableOpacity
                        onPress={() => setTipoSeleccionado("persona")}
                        className={`min-w-[120px] py-3 rounded-xl mx-2 items-center ${tipoSeleccionado === "persona"
                            ? "bg-fondoNaranja"
                            : "bg-transparent border border-fondoNaranja"
                            }`}
                    >
                        <Text
                            className={`font-semibold ${tipoSeleccionado === "persona" ? "text-white" : "text-[#FF6D08]"
                                }`}
                        >
                            Persona
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setTipoSeleccionado("taller")}
                        className={`min-w-[120px] py-3 rounded-xl mx-2 items-center ${tipoSeleccionado === "taller"
                            ? "bg-fondoNaranja"
                            : "bg-transparent border border-fondoNaranja"
                            }`}
                    >
                        <Text
                            className={`font-semibold ${tipoSeleccionado === "taller" ? "text-white" : "text-[#FF6D08]"
                                }`}
                        >
                            Taller
                        </Text>
                    </TouchableOpacity>
                </View>

                { }
                <View className="w-11/12">
                    {tipoSeleccionado === "persona" ? (
                        <View className="items-center " >
                            <TouchableOpacity
                                className="w-40 h-40 rounded-full bg-gray-200 items-center justify-center overflow-hidden"
                                onPress={pickImage}
                            >
                                <Image
                                    source={
                                        logo
                                            ? { uri: logo }
                                            : require('../assets/images/defaultLogo.png')
                                    }
                                    style={{
                                        width: '128%',
                                        height: '128%',
                                        resizeMode: 'cover',
                                    }}
                                />
                            </TouchableOpacity>

                            <Text className="mt-2 text-sm text-gray-500 font-medium">Upload logo</Text>

                            <View className="items-center w-full px-4 mt-4">
                                <TextInput
                                    placeholder="Nombre de Usuario"
                                    placeholderTextColor="#9CA3AF"
                                    value={nombre}
                                    onChangeText={(text) => {
                                        setNombre(text);
                                        setErrorNombre(false);
                                    }}
                                    className={`w-10/12 bg-white text-black text-left px-4 py-3 rounded-xl my-3  ${errorNombre ? "border-red-500" : "border-transparent"}`}
                                />
                                {errorNombre && <Text className="text-red-500 text-sm w-10/12">El nombre es obligatorio</Text>}

                                <TextInput
                                    placeholder="Teléfono"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                    value={telefono}
                                    onChangeText={(text) => {
                                        setTelefono(text);
                                        setErrorTelefono(false);
                                    }}
                                    className={`w-10/12 bg-white text-black text-left px-4 py-3 rounded-xl my-3 border ${errorTelefono ? "border-red-500" : "border-transparent"}`}
                                />
                                {errorTelefono && <Text className="text-red-500 text-sm w-10/12">Teléfono inválido</Text>}

                                <View className="items-center w-full">
                                    <TouchableOpacity
                                        onPress={() => setMostrarFechaPicker(true)}
                                        className={`w-10/12 bg-white text-black text-left px-4 py-3 rounded-xl my-3 border ${errorFechaNacimiento ? "border-red-500" : "border-transparent"
                                            }`}
                                    >
                                        <Text className="text-black">
                                            {fechaNacimiento
                                                ? fechaNacimiento.toLocaleDateString("es-CO", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })
                                                : "Selecciona tu fecha de nacimiento"}
                                        </Text>
                                    </TouchableOpacity>

                                    {mostrarFechaPicker && (
                                        <DateTimePicker
                                            mode="date"
                                            value={fechaNacimiento || new Date(2000, 0, 1)}
                                            maximumDate={new Date()} // evita fechas futuras
                                            display={Platform.OS === "ios" ? "spinner" : "default"}
                                            onChange={(event, selectedDate) => {
                                                if (selectedDate) {
                                                    setFechaNacimiento(selectedDate);
                                                    setErrorFechaNacimiento(false);
                                                }
                                                setMostrarFechaPicker(false);
                                            }}
                                        />
                                    )}

                                    {errorFechaNacimiento && (
                                        <Text className="text-red-500 text-sm w-10/12 -mt-2">
                                            Debes ingresar una fecha válida y tener al menos 16 años
                                        </Text>
                                    )}
                                </View>

                            </View>



                            <View>

                                <TouchableOpacity
                                    onPress={() => setMostrarMapa(true)}
                                    className="bg-[#434343] py-3 px-6 rounded-xl mb-4"
                                >
                                    <Text className="text-white font-semibold text-center">Seleccionar dirección</Text>
                                </TouchableOpacity>

                                {/* Componente MapPicker */}
                                {mostrarMapa && (
                                    <MapPicker
                                        visible={true}
                                        onClose={() => setMostrarMapa(false)}
                                        onLocationSelected={handleDireccionSeleccionada}
                                    />
                                )}
                            </View>

                            <View className="w-full items-center mb-6">
                                <Text className="mb-2 font-semibold text-base">O escribe tu dirección manualmente</Text>
                                <TextInput
                                    className="border w-11/12 rounded-xl px-4 py-3"
                                    placeholder="Ej: Calle 123 #45-67, Bogotá"
                                    value={direccion}
                                    onChangeText={setDireccion}
                                />
                            </View>
                            <TouchableOpacity
                                className="bg-fondoNaranja w-6/12 py-3 rounded-xl  items-center"
                                onPress={() => {
                                    if (validarCampos()) {
                                        guardarDatosPersona();
                                    }
                                }}

                            >
                                <Text className="text-white text-base font-semibold">Continue</Text>
                            </TouchableOpacity>






                        </View>
                    ) : (
                        <View className="items-center " >
                            <TouchableOpacity
                                className="w-40 h-40 rounded-full bg-gray-200 items-center justify-center overflow-hidden"
                                onPress={pickImage}
                            >
                                <Image
                                    source={
                                        logo
                                            ? { uri: logo }
                                            : require('../assets/images/defaultLogo.png')
                                    }
                                    style={{
                                        width: '128%',
                                        height: '128%',
                                        resizeMode: 'cover',
                                    }}
                                />
                            </TouchableOpacity>

                            <Text className="mt-2 text-sm text-gray-500 font-medium">Upload logo</Text>

                            <View className="items-center w-full px-4 mt-4">
                                <TextInput
                                    placeholder="Nombre del taller"
                                    placeholderTextColor="#9CA3AF"
                                    value={nombreTaller}
                                    onChangeText={setNombreTaller}
                                    className={`w-10/12 bg-white text-black text-left px-4 py-3 rounded-xl my-3 ${errorNombreTaller ? "border border-red-500" : ""}`}
                                />
                                {errorNombreTaller && <Text className="text-red-500 text-sm ml-2 -mt-2">Campo requerido</Text>}

                                <TextInput
                                    placeholder="Teléfono"
                                    placeholderTextColor="#9CA3AF"
                                    value={telefonoTaller}
                                    onChangeText={setTelefonoTaller}
                                    keyboardType="phone-pad"
                                    className={`w-10/12 bg-white text-black text-left px-4 py-3 rounded-xl my-3 ${errorTelefonoTaller ? "border border-red-500" : ""}`}
                                />
                                {errorTelefonoTaller && (
                                    <Text className="text-red-500 text-sm ml-2 -mt-2">Teléfono inválido</Text>
                                )}
                            </View>

                            <View className="items-center my-4">
                                <TouchableOpacity
                                    onPress={() => setModalVisible(true)}
                                    className="bg-[#434343] py-3 px-6 rounded-xl"
                                >
                                    <Text className="text-white font-semibold">Seleccionar horarios de atención</Text>
                                </TouchableOpacity>

                                <Modal
                                    isVisible={modalVisible}
                                    onBackdropPress={() => setModalVisible(false)}
                                    style={{ justifyContent: 'flex-end', margin: 0 }}
                                >
                                    <View className="bg-white p-4 rounded-t-2xl max-h-[60%]">
                                        <Text className="text-lg font-bold mb-4 text-center">Horarios de Atención</Text>

                                        <ScrollView className="max-h-[420px]">
                                            {diasSemana.map((dia, index) => (
                                                <View key={dia} className="mb-4">
                                                    <TouchableOpacity onPress={() => toggleDia(index)}>
                                                        <Text
                                                            className={`text-base font-medium mb-2 ${horarios[index].activo ? "text-black" : "text-gray-400 line-through"
                                                                }`}
                                                        >
                                                            {dia}
                                                        </Text>
                                                    </TouchableOpacity>

                                                    {horarios[index].activo && (
                                                        <View className="flex-row justify-between">
                                                            {/* Desde */}
                                                            <TouchableOpacity
                                                                className={`border px-4 py-2 rounded-md w-36 ${horarios[index].inicio === "" && horarios[index].activo ? "border-red-500" : "border-gray-300"
                                                                    }`}
                                                                onPress={() => setMostrarPicker({ index, campo: "inicio" })}
                                                            >
                                                                <Text className="text-black">
                                                                    {horarios[index].inicio
                                                                        ? formatearHoraAMPM(horarios[index].inicio)
                                                                        : "Desde"}
                                                                </Text>
                                                            </TouchableOpacity>

                                                            {/* Hasta */}
                                                            <TouchableOpacity
                                                                className={`border px-4 py-2 rounded-md w-36 ${horarios[index].fin === "" && horarios[index].activo ? "border-red-500" : "border-gray-300"
                                                                    }`}
                                                                onPress={() => setMostrarPicker({ index, campo: "fin" })}
                                                            >
                                                                <Text className="text-black">
                                                                    {horarios[index].fin
                                                                        ? formatearHoraAMPM(horarios[index].fin)
                                                                        : "Hasta"}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    {/* Selector de hora */}
                                    {mostrarPicker && (
                                        <DateTimePicker
                                            mode="time"
                                            value={new Date()}
                                            display={Platform.OS === "ios" ? "spinner" : "default"}
                                            onChange={(event, selectedDate) => {
                                                if (selectedDate) {
                                                    const horaFormateada = selectedDate
                                                        .toLocaleTimeString("es-CO", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: false,
                                                        })
                                                        .padStart(5, "0");
                                                    const nuevos = [...horarios];
                                                    nuevos[mostrarPicker.index][mostrarPicker.campo] = horaFormateada;
                                                    setHorarios(nuevos);
                                                }
                                                setMostrarPicker(null); // cerrar
                                            }}
                                        />
                                    )}
                                </Modal>

                            </View>

                            <View>

                                <TouchableOpacity
                                    onPress={() => setMostrarMapa(true)}
                                    className="bg-[#434343] py-3 px-6 rounded-xl mb-4"
                                >
                                    <Text className="text-white font-semibold text-center">Seleccionar dirección</Text>
                                </TouchableOpacity>

                                {/* Componente MapPicker */}
                                {mostrarMapa && (
                                    <MapPicker
                                        visible={true}
                                        onClose={() => setMostrarMapa(false)}
                                        onLocationSelected={handleDireccionSeleccionada}
                                    />
                                )}
                            </View>

                            <View className="w-full items-center mb-6">
                                <Text className="mb-2 font-semibold text-base">O escribe tu dirección manualmente</Text>
                                <TextInput
                                    className="border w-11/12 rounded-xl px-4 py-3"
                                    placeholder="Ej: Calle 123 #45-67, Bogotá"
                                    value={direccion}
                                    onChangeText={setDireccion}
                                />
                            </View>
                            <TouchableOpacity
                                className="bg-fondoNaranja w-6/12 py-3 rounded-xl mt-2 items-center"
                                onPress={() => {
                                    const hayErrores = horarios.some((h) => h.activo && (h.inicio === "" || h.fin === ""));
                                    if (hayErrores) {
                                        alert("Completa todos los horarios activos");
                                        return;
                                    }

                                    if (!validarHorarios()) return;

                                    if (validarCamposTaller()) {
                                        guardarDatosTaller();
                                    }
                                }}

                            >
                                <Text className="text-white text-base font-semibold">Continue</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>


            </View>}
        </KeyboardAwareScrollView>

    );
}