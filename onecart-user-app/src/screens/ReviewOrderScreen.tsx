import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { BASE_URL } from "../config/api";
import { getUser } from "../utils/auth";

export default function ReviewOrderScreen({ route, navigation }: any) {
  const { order } = route.params;

  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    try {
      setPlacing(true);

      const user = await getUser();

      const res = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          outlets: order.outlets,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Order Failed", data.error || "Unable to place order");
        return;
      }

      // 🔥 Capture backend fee
      setDeliveryFee(data.deliveryFee);

      Alert.alert(
        "Order Placed 🎉",
        `Delivery Fee: ₹${data.deliveryFee}`
      );

      navigation.popToTop();

    } catch (err) {
      Alert.alert("Network Error", "Could not connect to server.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        Review Your Order
      </Text>

      {order.outlets.map((o: any, index: number) => (
        <View key={index} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {o.outletName}
          </Text>
          <Text style={{ marginTop: 8, fontSize: 16 }}>
            {o.items || "No items entered"}
          </Text>
        </View>
      ))}

      {/* Show fee if already placed */}
      {deliveryFee !== null && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16 }}>
            Delivery Fee: ₹{deliveryFee}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={placeOrder}
        disabled={placing}
        style={{
          backgroundColor: "#000",
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {placing ? "Placing..." : "Place Order"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}