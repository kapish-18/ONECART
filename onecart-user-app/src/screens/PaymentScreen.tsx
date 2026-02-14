import { View, Text, Alert, TouchableOpacity } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { BASE_URL } from "../config/api";

export default function PaymentScreen({ route, navigation }: any) {
  const { orderId } = route.params;

  const startPayment = async () => {
    try {
      console.log("🟡 Starting payment for order:", orderId);

      const res = await fetch(`${BASE_URL}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      console.log("🟢 Backend payment response:", data);

      if (!res.ok) {
        Alert.alert("Payment Error", data.error || "Failed to create payment");
        return;
      }

      if (!data.razorpayOrderId) {
        Alert.alert("Payment Error", "No Razorpay order ID received");
        return;
      }

      const options = {
        description: "OneCart Payment",
        currency: data.currency,
        key: data.key,
        amount: data.amount,
        order_id: data.razorpayOrderId,
        name: "OneCart",
        theme: { color: "#000" },
      };

      console.log("🔵 Opening Razorpay with options:", options);

      RazorpayCheckout.open(options)
        .then(async (paymentData: any) => {
          console.log("💰 Payment success data:", paymentData);

          const verifyRes = await fetch(`${BASE_URL}/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...paymentData,
              orderId,
            }),
          });

          const verifyData = await verifyRes.json();

          console.log("🟣 Verify response:", verifyData);

          if (!verifyRes.ok) {
            Alert.alert("Verification Failed");
            return;
          }

          Alert.alert("Payment Successful 🎉");
          navigation.goBack();
        })
        .catch((error: any) => {
          console.log("🔴 Razorpay error:", error);
          Alert.alert("Payment Cancelled or Failed");
        });

    } catch (err) {
      console.log("❌ Payment exception:", err);
      Alert.alert("Payment Failed - Network or Server Issue");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <TouchableOpacity
        onPress={startPayment}
        style={{
          backgroundColor: "#000",
          padding: 16,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Proceed to Pay
        </Text>
      </TouchableOpacity>
    </View>
  );
}