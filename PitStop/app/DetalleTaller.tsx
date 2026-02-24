import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db, auth } from "../firebase.config";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
} from "firebase/firestore";

export default function DetalleTaller() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [taller, setTaller] = useState<any | null>(null);
    const [horariosDisponibles, setHorariosDisponibles] = useState<
        { hora: string; disponibles: number }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [loadingAgendar, setLoadingAgendar] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
    const [vehiculos, setVehiculos] = useState<any[]>([]);
    const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");
    const [servicio, setServicio] = useState("");
    const [comentario, setComentario] = useState("");
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [mostrarCalendario, setMostrarCalendario] = useState(false);

    useEffect(() => {
        if (id) {
            cargarTaller();
            cargarVehiculos();
        }
    }, [id]);

    useEffect(() => {
        if (taller) generarHorariosDisponibles(taller, fechaSeleccionada);
    }, [fechaSeleccionada]);

    const cargarTaller = async () => {
        try {
            const docRef = doc(db, "talleres", id as string);
            const snap = await getDoc(docRef);

            if (!snap.exists()) {
                Alert.alert("Error", "No se encontró el taller.");
                router.back();
                return;
            }

            const data = snap.data();
            setTaller(data);

            if (data.horarios?.length && data.configuracionCitas) {
                generarHorariosDisponibles(data, fechaSeleccionada);
            }
        } catch (e) {
            console.error("Error cargando taller:", e);
            Alert.alert("Error", "No se pudo cargar la información del taller.");
        } finally {
            setLoading(false);
        }
    };

    const cargarVehiculos = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const docRef = doc(db, "usuarios", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.vehiculos) {
                    const listaVehiculos = Object.keys(data.vehiculos).map((placa) => ({
                        id: placa,
                        placa,
                        ...data.vehiculos[placa],
                    }));
                    setVehiculos(listaVehiculos);
                } else {
                    setVehiculos([]);
                }
            }
        } catch (error) {
            console.error("❌ Error cargando vehículos:", error);
        }
    };

    const generarHorariosDisponibles = async (data: any, fecha: Date) => {
        if (!data.horarios || !Array.isArray(data.horarios)) {
            setHorariosDisponibles([]);
            return;
        }

        const diaSemana = (fecha.getDay() + 6) % 7;
        const horario = data.horarios[diaSemana];

        if (!horario || horario.activo === false || horario.activo === "false") {
            setHorariosDisponibles([]);
            return;
        }

        const inicio = horario.inicio;
        const fin = horario.fin;
        const intervalo = data.configuracionCitas?.intervalo || 30;
        const cupos = data.configuracionCitas?.cuposPorIntervalo || 1;

        if (!inicio || !fin) {
            setHorariosDisponibles([]);
            return;
        }

        const listaHorarios: string[] = [];
        let horaActual = convertirAHoras(inicio);
        const horaFin = convertirAHoras(fin);

        while (horaActual < horaFin) {
            const horaStr = formatoHora(horaActual);
            listaHorarios.push(horaStr);
            horaActual += intervalo / 60;
        }

        const fechaISO = fecha.toISOString().split("T")[0];

        const q = query(
            collection(db, "citas"),
            where("tallerId", "==", id),
            where("fecha", "==", fechaISO)
        );

        const snap = await getDocs(q);
        const citasDeDia = snap.docs.map((d) => d.data());

        const horariosConCupos = listaHorarios.map((hora) => {
            const usadas = citasDeDia.filter((c) => c.hora === hora).length;
            return {
                hora,
                disponibles: Math.max(0, cupos - usadas),
            };
        });

        setHorariosDisponibles(horariosConCupos);
    };

    const convertirAHoras = (hora: string) => {
        const [h, m] = hora.split(":").map(Number);
        return h + m / 60;
    };

    const formatoHora = (decimal: number) => {
        const h = Math.floor(decimal);
        const m = Math.round((decimal - h) * 60);
        return `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}`;
    };

    const abrirModal = (hora: string) => {
        setHoraSeleccionada(hora);
        setModalVisible(true);
    };

    const agendarCita = async () => {
        if (!vehiculoSeleccionado || !servicio) {
            Alert.alert("Completa los datos", "Selecciona el vehículo y el servicio.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "Debes iniciar sesión.");
            return;
        }

        setLoadingAgendar(true);

        try {
            const fechaISO = fechaSeleccionada.toISOString().split("T")[0];

            const q = query(
                collection(db, "citas"),
                where("tallerId", "==", id),
                where("fecha", "==", fechaISO),
                where("hora", "==", horaSeleccionada)
            );

            const snap = await getDocs(q);
            const usados = snap.size;
            const cupos = taller.configuracionCitas.cuposPorIntervalo || 1;

            if (usados >= cupos) {
                Alert.alert("Cupo lleno", "Esta hora ya no está disponible.");
                generarHorariosDisponibles(taller, fechaSeleccionada);
                return;
            }

            await addDoc(collection(db, "citas"), {
                tallerId: id,
                usuarioId: user.uid,
                vehiculoId: vehiculoSeleccionado,
                servicio,
                comentario,
                fecha: fechaISO,
                hora: horaSeleccionada,
                estado: "pendiente",
                creadaEn: new Date().toISOString(),
            });

            Alert.alert(
                "✅ Cita agendada",
                `Tu cita fue reservada el ${fechaISO} a las ${horaSeleccionada}.`
            );

            setModalVisible(false);
            setVehiculoSeleccionado("");
            setServicio("");
            setComentario("");

            generarHorariosDisponibles(taller, fechaSeleccionada);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "No se pudo agendar la cita.");
        } finally {
            setLoadingAgendar(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="text-gray-600 mt-2">Cargando taller...</Text>
            </View>
        );
    }

    if (!taller) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500">
                    No se encontró información del taller
                </Text>
            </View>
        );
    }

    const datos = taller.datosPersonales || {};

    return (
        <ScrollView className="flex-1 bg-white p-5">
            <Text className="text-2xl font-bold mb-2">{datos.nombre}</Text>
            <Text className="text-gray-600 mb-1">📍 {datos.direccion}</Text>
            <Text className="text-gray-600 mb-4">
                Intervalo: {taller.configuracionCitas.intervalo} min | Cupos:{" "}
                {taller.configuracionCitas.cuposPorIntervalo}
            </Text>

            {/* Seleccionar fecha */}
            <TouchableOpacity
                onPress={() => setMostrarCalendario(true)}
                className="bg-orange-500 rounded-lg p-3 mb-3"
            >
                <Text className="text-white font-semibold text-center">
                    📅 Selecciona el día ({fechaSeleccionada.toLocaleDateString()})
                </Text>
            </TouchableOpacity>

            {mostrarCalendario && (
                <DateTimePicker
                    value={fechaSeleccionada}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(e, selectedDate) => {
                        setMostrarCalendario(false);
                        if (selectedDate) setFechaSeleccionada(selectedDate);
                    }}
                />
            )}

            <Text className="text-lg font-semibold mb-3">
                Horarios disponibles:
            </Text>

            {horariosDisponibles.length === 0 ? (
                <Text className="text-gray-500">
                    No hay horarios disponibles para este día.
                </Text>
            ) : (
                horariosDisponibles.map((h, idx) => (
                    <TouchableOpacity
                        key={idx}
                        disabled={h.disponibles <= 0 || loadingAgendar}
                        onPress={() => abrirModal(h.hora)}
                        className={`rounded-lg p-3 mb-2 ${h.disponibles > 0 ? "bg-orange-500" : "bg-gray-300"
                            }`}
                    >
                        <Text className="text-white font-semibold text-center">
                            {h.hora} —{" "}
                            {h.disponibles > 0
                                ? `${h.disponibles} cupos`
                                : "Sin cupo"}
                        </Text>
                    </TouchableOpacity>
                ))
            )}

            {/* MODAL */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-2xl p-5">
                        <Text className="text-lg font-bold mb-3">
                            Agendar cita — {horaSeleccionada}
                        </Text>

                        <Text className="font-semibold mb-1">Selecciona tu vehículo:</Text>
                        <RNPickerSelect
                            onValueChange={(value) => setVehiculoSeleccionado(value)}
                            placeholder={{ label: "Selecciona un vehículo...", value: "" }}
                            items={vehiculos.map((v) => ({
                                label: `${v.placa} (${v.modelo || v.tipoVehiculo || "Sin modelo"})`,
                                value: v.id,
                            }))}
                        />
                        <Text className="font-semibold mt-4 mb-1">Servicio:</Text>
                        <RNPickerSelect
                            onValueChange={setServicio}
                            placeholder={{
                                label: "Selecciona un servicio...",
                                value: "",
                            }}
                            items={[
                                { label: "Cambio de aceite", value: "Cambio de aceite" },
                                {
                                    label: "Mantenimiento general",
                                    value: "Mantenimiento general",
                                },
                                {
                                    label: "Revisión de frenos",
                                    value: "Revisión de frenos",
                                },
                                { label: "Otro", value: "Otro" },
                            ]}
                            value={servicio}
                        />

                        <Text className="font-semibold mt-4 mb-1">
                            Comentario (opcional):
                        </Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-2"
                            placeholder="Agrega un comentario..."
                            value={comentario}
                            onChangeText={setComentario}
                            multiline
                        />

                        <View className="flex-row justify-between mt-5">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="bg-gray-300 rounded-lg px-5 py-2"
                            >
                                <Text className="text-gray-800 font-semibold">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={agendarCita}
                                disabled={loadingAgendar}
                                className="bg-orange-500 rounded-lg px-5 py-2"
                            >
                                <Text className="text-white font-semibold">
                                    {loadingAgendar
                                        ? "Guardando..."
                                        : "Agendar cita"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}