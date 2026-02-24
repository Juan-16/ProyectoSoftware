import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase.config";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

const handlePasswordReset = async () => {
  const emailValid = !!email.trim() && email.includes("@");

  setErrorEmail(!emailValid);
  setSuccessMessage("");

  if (!emailValid) {
    setErrorMessage("Ingresa un correo válido.");
    return;
  }

  try {
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSuccessMessage("Link enviado! Revisa tu correo.");

  } catch (error) {
    setErrorMessage("No pudimos enviar el correo.");
  }
};

  return (
    <View className="flex-1 items-center pt-20 px-6 bg-white">
      {/* Imagen ilustrativa */}
      <Image
        source={require("../assets/images/ForgotPassword.png")}
        className="w-48 h-48 mb-6"
        resizeMode="contain"
      />

      <Text className="text-xl font-bold text-center text-black mb-4">
        Forgot your password?
      </Text>

      <TextInput
        onChangeText={(text) => {
          setEmail(text);
          setErrorEmail(false);
        }}
        placeholder="Enter your email address"
        placeholderTextColor="#9CA3AF"
        className={`w-full bg-gray-100 text-black px-4 py-3 rounded-xl border ${
          errorEmail ? "border-red-500" : "border-transparent"
        }`}
      />

      {errorEmail && (
        <Text className="text-red-500 text-sm w-full text-left mt-1">
          Ingresa un correo válido
        </Text>
      )}

      {errorMessage !== "" && (
        <Text className="text-red-500 text-sm text-center mt-2">
          {errorMessage}
        </Text>
      )}

      {successMessage !== "" && (
        <Text className="text-green-600 text-sm text-center mt-2">
          {successMessage}
        </Text>
      )}

      <TouchableOpacity
        onPress={handlePasswordReset}
        className="bg-orange-500 w-full py-3 rounded-xl mt-6 items-center"
      >
        <Text className="text-white text-base font-semibold">
          Send password reset link
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-sm text-gray-500 mt-6">
        Check your spam folder if you don’t see the email
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/LogIn")}
        className="mt-8"
      >
        <Text className="text-blue-600 font-medium">Back to Log In</Text>
      </TouchableOpacity>
    </View>
  );
}
