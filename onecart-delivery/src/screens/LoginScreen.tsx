import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { BASE_URL } from "../config/api";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");

  const sendOtp = async () => {
    await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    navigation.navigate("Otp", { email });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 16 }}>
        Delivery Login
      </Text>

      <TextInput
        placeholder="Delivery email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
        }}
      />

      <TouchableOpacity
        onPress={sendOtp}
        style={{
          backgroundColor: "#000",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
}
