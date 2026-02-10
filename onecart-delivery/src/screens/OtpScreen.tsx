import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { BASE_URL } from "../config/api";
import { saveUser } from "../utils/auth";
import { registerForPushNotifications } from "../utils/notifications";

export default function OtpScreen({ route }: any) {
  const { email } = route.params;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "Invalid OTP");
        return;
      }

      if (data.user.role !== "delivery") {
        Alert.alert("Access Denied", "Not a delivery account");
        return;
      }

      // ✅ Save logged-in user
      await saveUser(data.user);

      // ✅ REGISTER PUSH TOKEN **AFTER LOGIN**
      await registerForPushNotifications();

      // ❌ Do NOT navigate manually
      // AppNavigator will auto-switch based on auth state

    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 22, marginBottom: 16 }}>
        Enter OTP
      </Text>

      <TextInput
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        placeholder="6-digit OTP"
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
        }}
      />

      <TouchableOpacity
        onPress={verifyOtp}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#aaa" : "#000",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>
          {loading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
