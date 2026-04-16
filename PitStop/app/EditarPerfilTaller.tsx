import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    Image,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { auth } from "../firebase.config";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileTaller() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [domicilio, setDomicilio] = useState(false);

    const [servicios, setServicios] = useState<string[]>([]);
    const [horarios, setHorarios] = useState<any[]>([]);

    const serviciosDisponibles = [
        "Mecánico general",
        "Eléctrico",
        "Cambio de aceite",
        "Frenos y suspensión",
        "Emergencias 24h",
        "Venta de repuestos",
    ];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUrl(result.assets[0].uri);
        }
    };

    // 🔹 Obtener perfil actual
    const obtenerPerfil = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();

            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/profile/tallerInfo`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setNombre(data.datosPersonales?.nombre || "");
            setTelefono(data.datosPersonales?.telefono || "");
            setDireccion(data.datosPersonales?.direccion || "");
            setImageUrl(data.datosPersonales?.imageUrl || "");
            setDomicilio(data.datosPersonales?.domicilio || false);
            setServicios(data.servicios || []);
            setHorarios(data.horarios || []);

        } catch (error) {
            alert((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerPerfil();
    }, []);

    // 🔹 Toggle servicios
    const toggleServicio = (servicio: string) => {
        if (servicios.includes(servicio)) {
            setServicios(servicios.filter((s) => s !== servicio));
        } else {
            setServicios([...servicios, servicio]);
        }
    };

    // 🔹 Actualizar perfil
    const actualizarPerfil = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();

            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/profile/taller`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nombre,
                        telefono,
                        direccion,
                        imageUrl,
                        domicilio,
                        servicios,
                        horarios,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            alert("Perfil actualizado correctamente");
            router.back();

        } catch (error) {
            alert((error as Error).message);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white p-6">

            {/* FOTO */}
            <TouchableOpacity onPress={pickImage} className="w-40 h-40 rounded-full overflow-hidden mb-4 mx-auto">
                <Image
                    source={
                        imageUrl
                            ? { uri: imageUrl }
                            : require("../assets/images/defaultLogo.png")
                    }
                    className="w-full h-full"
                />
            </TouchableOpacity>

            {/* Nombre */}
            <Text className="mb-2 font-semibold">Nombre del Taller</Text>
            <TextInput
                value={nombre}
                onChangeText={setNombre}
                className=" p-3 rounded mb-4"
            />

            {/* Teléfono */}
            <Text className="mb-2 font-semibold">Teléfono</Text>
            <TextInput
            
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                className=" p-3 rounded mb-4"
            />

            {/* Dirección */}
            <Text className="mb-2 font-semibold">Dirección</Text>
            <TextInput
                value={direccion}
                onChangeText={setDireccion}
                className=" p-3 rounded mb-4"
            />

            {/* Servicios */}
            <Text className="mb-2 font-semibold mt-4">Servicios</Text>

            {serviciosDisponibles.map((servicio) => {
                const seleccionado = servicios.includes(servicio);

                return (
                    <TouchableOpacity
                        key={servicio}
                        onPress={() => toggleServicio(servicio)}
                        className="flex-row items-center mb-3"
                    >
                        <View
                            className={`w-6 h-6 mr-3 rounded border items-center justify-center
              ${seleccionado ? "bg-black border-black" : "border-gray-400"}`}
                        >
                            {seleccionado && (
                                <Text className="text-white font-bold">✓</Text>
                            )}
                        </View>
                        <Text>{servicio}</Text>
                    </TouchableOpacity>
                );
            })}

            {/* Domicilio */}
            <View className="flex-row justify-between items-center mt-6 mb-6">
                <Text className="font-semibold">Servicio a domicilio</Text>
                <Switch value={domicilio} onValueChange={setDomicilio} />
            </View>

            {/* Guardar */}
            <TouchableOpacity
                onPress={actualizarPerfil}
                className="bg-fondoNaranja py-3 rounded-xl items-center mb-10"
            >
                <Text className="text-white font-semibold">
                    Guardar Cambios
                </Text>
            </TouchableOpacity>

        </ScrollView>
    );
}