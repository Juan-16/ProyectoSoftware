import { Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Index() {
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

  const router = useRouter();

  const validarCampos = () => {
    let valido = true;
    setEmailError("");
    setPasswordError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError("El correo es obligatorio.");
      valido = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Correo inválido.");
      valido = false;
    }

    if (!password) {
      setPasswordError("La contraseña es obligatoria.");
      valido = false;
    } else if (password.length < 6) {
      setPasswordError("Mínimo 6 caracteres.");
      valido = false;
    } else if (password.length > 20) {
      setPasswordError("Máximo 20 caracteres.");
      valido = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError("Debe contener al menos una mayúscula.");
      valido = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError("Debe contener un carácter especial.");
      valido = false;
    }

    return valido;
  };

  const handleCreateAccount = async () => {
    if (!validarCampos()) return;

    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();


      if (!res.ok) {
        throw new Error(data.error || "Error al registrar");
      }


      // 🔥 LOGIN AUTOMÁTICO
      const loginRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      

    

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.error || "Error en login");
      }

      if (!loginData.idToken) {
        throw new Error("No se recibió token");
      }

      console.log("LOGIN RES STATUS:", loginRes.status);
      console.log("LOGIN DATA:", loginData);

      await AsyncStorage.setItem("token", loginData.idToken);
      await AsyncStorage.setItem("user", JSON.stringify(loginData));

      console.log("Usuario logueado:", loginData);

      router.replace("/completeProfile");

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo crear la cuenta");
    }
  };

  return (
    <View className="flex-1 items-center pt-16 bg-fondo">
      <Image
        source={require("../assets/images/LogoPits.png")}
        className="w-68 h-28 mb-8"
        resizeMode="contain"
      />

      <Text className="text-xl font-bold text-center text-black mb-12">
        Create an account
      </Text>

      <TextInput
        onChangeText={setEmail}
        placeholder="Email@domain.com"
        placeholderTextColor="#9CA3AF"
        className={`w-10/12 bg-white text-black px-4 py-3 rounded-xl my-2 ${emailError ? "border border-red-500" : ""
          }`}
        value={email}
      />
      {emailError ? <Text className="text-red-500 text-sm w-10/12">{emailError}</Text> : null}

      <View className="w-10/12 relative">
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          className={`bg-white text-black px-4 py-3 rounded-xl my-2 pr-10 ${passwordError ? "border border-red-500" : ""
            }`}
          value={password}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-6"
        >
          <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
        </TouchableOpacity>

        {passwordError ? (
          <Text className="text-red-500 text-sm mt-1">{passwordError}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={handleCreateAccount}
        className="bg-fondoNaranja w-10/12 py-3 rounded-xl mt-4 items-center"
      >
        <Text className="text-white text-base font-semibold">Create Account</Text>
      </TouchableOpacity>

      <Text className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <Link href="/LogIn" className="text-blue-600 font-medium">Log in</Link>
      </Text>
    </View>
  );
}
