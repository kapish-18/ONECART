import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { saveUser } from "../utils/auth";

const BASE_URL = "https://xochitl-regional-enzymatically.ngrok-free.dev"; // same as LoginScreen

export default function OtpScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { email } = route.params;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          name: "Kapish",       // temporary
          hostelBlock: "B",     // temporary
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.error || "OTP verification failed");
        return;
      }

      await saveUser(data.user);
      Alert.alert("Success", "Logged in successfully");

    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 12 }}>
        Enter OTP
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        OTP sent to {email}
      </Text>

      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      />

      <TouchableOpacity
        onPress={verifyOtp}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#666" : "#000",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
