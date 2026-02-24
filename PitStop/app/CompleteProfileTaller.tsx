import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase.config";

const serviciosDisponibles = [
    'Mecánico general',
    'Eléctrico',
    'Cambio de aceite',
    'Frenos y suspensión',
    'Emergencias 24h',
    'Venta de repuestos',
];

const guardarServiciosTallerBackend = async ({
    servicios,
    domicilio,
}: {
    servicios: string[];
    domicilio: boolean;
}) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const token = await user.getIdToken();

    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/talleres`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ servicios, domicilio }),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando servicios del taller");
    }
};

export default function CompleteProfileTaller() {

    const router = useRouter();

    const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
    const [domicilio, setDomicilio] = useState(false);
    const [errorServicios, setErrorServicios] = useState(false); // Estado de error

    const toggleServicio = (nombre: string) => {
        const nuevosServicios = serviciosSeleccionados.includes(nombre)
            ? serviciosSeleccionados.filter((s) => s !== nombre)
            : [...serviciosSeleccionados, nombre];

        setServiciosSeleccionados(nuevosServicios);


        if (nuevosServicios.length > 0) {
            setErrorServicios(false);
        }
    };

    return (
        <View className="flex-1 bg-fondo p2">
            {/* Logo PitStop arriba a la izquierda */}
            <Image
                source={require('../assets/images/LogoPits.png')}
                className="items-start w-64 h-24 mt-8"
                resizeMode="contain"
            />

            <View className="p-6">
                <Text className="text-3xl font-bold text-center text-black mb-4">
                    Señala los servicios{'\n'}que ofrecen
                </Text>

                {errorServicios && (
                    <Text className="text-red-500 text-center mb-4">
                        Selecciona al menos un servicio
                    </Text>
                )}

                {serviciosDisponibles.map((servicio) => {
                    const isChecked = serviciosSeleccionados.includes(servicio);
                    return (
                        <TouchableOpacity
                            key={servicio}
                            className="flex-row items-center mb-4 mt-2"
                            onPress={() => toggleServicio(servicio)}
                        >
                            <View
                                className={`w-6 h-6 mr-3 rounded border items-center justify-center 
                                    ${isChecked ? 'bg-black border-black' : errorServicios ? 'border-red-500' : 'border-black'} 
                                    ${!isChecked ? 'bg-white' : ''}`}
                            >
                                {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
                            </View>
                            <Text className="text-base text-black">{servicio}</Text>
                        </TouchableOpacity>
                    );
                })}

                <View className="flex-row justify-between items-center mt-6">
                    <Text className="text-base text-black">Ofrece servicio a domicilio</Text>
                    <Switch
                        value={domicilio}
                        onValueChange={setDomicilio}
                        trackColor={{ false: '#D1D5DB', true: '#000000' }}
                        thumbColor={domicilio ? '#FFFFFF' : '#f4f3f4'}
                        style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
                    />
                </View>
            </View>

            <View className="flex-1 items-center mt-4">
                <TouchableOpacity
                    className="bg-fondoNaranja w-6/12 py-3 rounded-xl mt-2 items-center"
                    onPress={async () => {
                        if (serviciosSeleccionados.length === 0) {
                            setErrorServicios(true);
                        } else {
                            setErrorServicios(false);
                            try {
                                await guardarServiciosTallerBackend({
                                    servicios: serviciosSeleccionados,
                                    domicilio,
                                });
                                router.replace("/(taller)/home");
                            } catch (error) {
                                alert((error as Error).message);
                            }
                        }
                    }}
                >
                    <Text className="text-white text-base font-semibold">Guardar y Continuar</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}
