import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { BASE_URL } from "../config/api";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Enter delivery email");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: "delivery", // 👈 important
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.error || "Failed to send OTP");
        return;
      }

      Alert.alert("OTP Sent", "Check your email", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Otp", { email }),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 16 }}>
        Delivery Login
      </Text>

      <TextInput
        placeholder="Enter delivery email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
        }}
      />

      <TouchableOpacity
        onPress={sendOtp}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#666" : "#000",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>
          {loading ? "Sending..." : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}