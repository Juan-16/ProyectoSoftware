import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import MapPicker from '../components/MapPicker';
import AsyncStorage from "@react-native-async-storage/async-storage";



const getUser = async () => {
    const userStr = await AsyncStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
};


export default function EditarPerfilPersona() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);



    const [mostrarPicker, setMostrarPicker] = useState(false);

    const [errores, setErrores] = useState({
        nombre: "",
        telefono: "",
        direccion: "",
        edad: "",
    });

    type Ubicacion = {
        latitude: number;
        longitude: number;
        direccion: string;
    };

    const handleDireccionSeleccionada = (ubicacion: Ubicacion) => {
        setDireccion(ubicacion.direccion);
        setLat(ubicacion.latitude);
        setLng(ubicacion.longitude);
    };

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            const user = await getUser();

            if (!user) throw new Error("Usuario no autenticado");

            const token = await AsyncStorage.getItem("token");

            if (!token) {
                throw new Error("No autenticado");
            }


            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/persona/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (data.tipo === "persona") {
                const p = data.datosPersonales;
                setNombre(p.nombre);
                setTelefono(p.telefono);
                setDireccion(p.direccion);
                setImageUrl(p.imageUrl);
                if (p.fechaNacimiento) setFechaNacimiento(new Date(p.fechaNacimiento));
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    // 📸 seleccionar imagen
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUrl(result.assets[0].uri);
        }
    };

    // 🧠 VALIDACIONES
    const validar = () => {
        const nuevos: any = {};
        const hoy = new Date();

        if (nombre.length < 2) nuevos.nombre = "Nombre inválido";
        if (!/^[0-9]{10}$/.test(telefono))
            nuevos.telefono = "Teléfono debe tener 10 dígitos";
        if (direccion.length < 5) nuevos.direccion = "Dirección muy corta";

        if (fechaNacimiento) {
            const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            if (edad < 16) nuevos.edad = "Debes tener almenos 16 años";
        }

        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    // 💾 guardar cambios
    const guardarCambios = async () => {
        if (!validar()) return;

        try {
            setGuardando(true);

            const user = await getUser();

            if (!user) throw new Error("Usuario no autenticado");

            const token = await AsyncStorage.getItem("token");

            if (!token) {
                throw new Error("No autenticado");
            }
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/persona/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nombre,
                    telefono,
                    direccion,
                    lat,
                    lng,
                    fechaNacimiento: fechaNacimiento?.toISOString(),
                    imageUrl,
                }),
            });

            Alert.alert("Éxito", "Perfil actualizado");
            router.back();
        } catch (e) {
            Alert.alert("Error", "No se pudo actualizar");
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-fondo">
                <ActivityIndicator size="large" color="#FF6D08" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-fondo px-6 pt-10 items-center">

            {/* FOTO */}
            <TouchableOpacity onPress={pickImage} className="w-40 h-40 rounded-full overflow-hidden mb-4">
                <Image
                    source={
                        imageUrl
                            ? { uri: imageUrl }
                            : require("../assets/images/defaultLogo.png")
                    }
                    className="w-full h-full"
                />
            </TouchableOpacity>

            {/* NOMBRE */}
            <TextInput
                className="bg-white w-full rounded-xl px-4 py-3 mb-1"
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
            />
            {errores.nombre && <Text className="text-red-500">{errores.nombre}</Text>}

            {/* TELÉFONO */}
            <TextInput
                className="bg-white w-full rounded-xl px-4 py-3 mt-4 mb-1"
                placeholder="Teléfono"
                keyboardType="numeric"
                value={telefono}
                onChangeText={setTelefono}
            />
            {errores.telefono && <Text className="text-red-500">{errores.telefono}</Text>}

            <View>

                <TouchableOpacity
                    onPress={() => setMostrarMapa(true)}
                    className="bg-[#6e6e6e] py-3 px-6 rounded-xl mb-4 my-6"
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

            {/* FECHA NACIMIENTO */}
            <TouchableOpacity
                onPress={() => setMostrarPicker(true)}
                className="bg-white w-full rounded-xl px-4 py-3 mt-4"
            >
                <Text>
                    {fechaNacimiento
                        ? fechaNacimiento.toLocaleDateString()
                        : "Fecha de nacimiento"}
                </Text>
            </TouchableOpacity>
            {errores.edad && <Text className="text-red-500">{errores.edad}</Text>}

            {mostrarPicker && (
                <DateTimePicker
                    value={fechaNacimiento || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(e, d) => {
                        setMostrarPicker(false);
                        if (d) setFechaNacimiento(d);
                    }}
                />
            )}

            {/* BOTÓN */}
            <TouchableOpacity
                onPress={guardarCambios}
                className="bg-fondoNaranja w-full py-3 rounded-xl mt-8 items-center"
                disabled={guardando}
            >
                <Text className="text-white font-semibold">
                    {guardando ? "Guardando..." : "Guardar Cambios"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
