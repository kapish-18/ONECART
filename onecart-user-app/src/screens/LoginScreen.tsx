import { View, Text, TextInput, TouchableOpacity, Alert, Linking } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

const BASE_URL = "https://onecart-s238.onrender.com";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const sendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role: "user", // 👈 important
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.error || "Failed to send OTP");
        return;
      }

      Alert.alert("Success", "OTP sent to your email", [
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
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 12 }}>
        OneCart
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        Login with your email
      </Text>

      <TextInput
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
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
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>
          {loading ? "Sending..." : "Send OTP"}
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 12,
          color: "#666",
          textAlign: "center",
          marginTop: 24,
          lineHeight: 18,
        }}
      >
        By continuing, you agree to OneCart's{" "}
        <Text
          style={{ textDecorationLine: "underline", color: "#4f46e5" }}
          onPress={() => Linking.openURL(`${BASE_URL}/terms`)}
        >
          Terms of Service
        </Text>{" "}
        and{" "}
        <Text
          style={{ textDecorationLine: "underline", color: "#4f46e5" }}
          onPress={() => Linking.openURL(`${BASE_URL}/privacy`)}
        >
          Privacy Policy
        </Text>
        .
      </Text>
    </View>
  );
}