import { Link, useRouter } from "expo-router";
import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function LogIn() {

  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [errorEmail, setErrorEmail] = React.useState(false);
  const [errorPassword, setErrorPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const handleSignIn = async () => {
    try {
      setErrorMessage("");

      const res = await fetch(
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciales incorrectas");
      }

      // 🔥 GUARDAR TOKEN (LO QUE TE FALTABA)
      await AsyncStorage.setItem("token", data.idToken);

      // 🔥 GUARDAR USER (opcional pero útil)
      await AsyncStorage.setItem("user", JSON.stringify(data));

      console.log("Login OK:", data);
      console.log("TOKEN:", data.idToken);

      // 🔥 REDIRECCIÓN SEGÚN TIPO
      if (data.tipo === "persona") {
        router.replace("/(persona)/home");
      } else if (data.tipo === "taller") {
        router.replace("/(taller)/home");
      } else {
        router.replace("/completeProfile");
      }

    } catch (err) {
      console.log(err);
      setErrorMessage("Credenciales incorrectas");
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
        Log In
      </Text>

      <TextInput
        onChangeText={(text) => {
          setEmail(text);
          setErrorEmail(false);
        }}
        placeholder="Email@domain.com"
        placeholderTextColor="#9CA3AF"
        className={`w-10/12 bg-white text-black text-left px-4 py-3 rounded-xl my-3 border ${errorEmail ? "border-red-500" : "border-transparent"}`}
      />
      {errorEmail && <Text className="text-red-500 text-sm w-10/12 text-left">Ingresa un correo válido</Text>}

      <TextInput
        onChangeText={(text) => {
          setPassword(text);
          setErrorPassword(false);
        }}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        className={`w-10/12 bg-white text-black text-left px-4 py-3 rounded-xl border ${errorPassword ? "border-red-500" : "border-transparent"}`}
      />
      {errorPassword && <Text className="text-red-500 text-sm w-10/12 text-left">La contraseña es obligatoria</Text>}
      <TouchableOpacity
        onPress={handleSignIn}
        className="bg-fondoNaranja w-10/12 py-3 rounded-xl mt-6 items-center"
      >
        <Text className="text-white text-base font-semibold">Continue</Text>
      </TouchableOpacity>
      {errorMessage !== "" && (
        <Text className="text-red-500 text-sm w-10/12 text-center mt-2">
          {errorMessage}
        </Text>
      )}


      <Text className="text-center text-sm text-gray-600 mb-6 my-2">
        Forgot your password?{" "}
        <Link href="/olvidarContrasena" className="text-blue-600 font-medium">Click Here</Link>
      </Text>

      <View className="flex-row items-center w-11/12  my-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500 font-medium">or</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>


      <View className="w-10/12 mt-2 space-y-2">
        {/* Google */}
        <TouchableOpacity className="flex-row items-center bg-fondoGris  py-3 rounded-xl px-4 mb-4">
          <Image
            source={require("../assets/images/google-icon.png")}
            className="w-5 h-5 mr-3"
          />
          <Text className="text-black text-base font-medium">
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>

      <View className="items-center w-10/12 mt-6 space-y-4">


        <Text className="text-center text-sm text-gray-600 mb-6">
          Dosn´t have an account?{" "}
          <Link href="/" className="text-blue-600 font-medium">Sign Up Here</Link>
        </Text>


        <Text className="text-center text-sm text-gray-500">
          By clicking continue, you agree to our{" "}
          <Text className="font-semibold text-black">Terms of Service</Text> and{" "}
          <Text className="font-semibold text-black">Privacy Policy</Text>.
        </Text>


      </View>

    </View>
  );
}