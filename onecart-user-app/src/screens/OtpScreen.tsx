import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRoute } from "@react-navigation/native";
import { saveUser } from "../utils/auth";
import { registerUserPushNotifications } from "../utils/notifications";
import { BASE_URL } from "../config/api";

export default function OtpScreen() {
  const route = useRoute<any>();
  const { email } = route.params;
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [hostelBlock, setHostelBlock] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, name, hostelBlock }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Error", data.error || "OTP failed");
        return;
      }
      await saveUser(data.user);
      // Register push token now that user is logged in
      await registerUserPushNotifications();
      Alert.alert("Success", "Logged in successfully");
    } catch (err) {
      Alert.alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 12 }}>Enter OTP</Text>
      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        style={{ borderWidth: 1, padding: 12, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 12, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Hostel Block (e.g. A, B, C)"
        value={hostelBlock}
        onChangeText={setHostelBlock}
        style={{ borderWidth: 1, padding: 12, marginBottom: 16 }}
      />
      <TouchableOpacity
        onPress={verifyOtp}
        style={{
          backgroundColor: "#000",
          padding: 14,
          borderRadius: 8,
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