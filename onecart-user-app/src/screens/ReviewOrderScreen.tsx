import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config/api";
import { getUser } from "../utils/auth";

export default function ReviewOrderScreen({ route, navigation }: any) {
  const { order } = route.params;

  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [peakAdded, setPeakAdded] = useState(false);

  /* ================= LOAD DELIVERY FEE PREVIEW ================= */

  useEffect(() => {
    previewFee();
  }, []);

  const previewFee = async () => {
    try {
      const res = await fetch(`${BASE_URL}/orders/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlets: order.outlets,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setDeliveryFee(data.deliveryFee);
        setTotalItems(data.totalItems);
        setPeakAdded(data.peakAdded);
      }
    } catch (err) {
      console.log("Fee preview failed");
    }
  };

  /* ================= PLACE ORDER ================= */

  const placeOrder = async () => {
    try {
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

      Alert.alert(
        "Order Placed 🎉",
        `Delivery Fee: ₹${data.deliveryFee}`
      );

      navigation.popToTop();
    } catch (err) {
      Alert.alert("Network Error", "Could not connect to server.");
    }
  };

  /* ================= UI ================= */

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

      {/* ================= DELIVERY SUMMARY ================= */}

      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          Total Items: {totalItems}
        </Text>

        <Text style={{ fontSize: 16, marginTop: 6 }}>
          Delivery Fee: ₹{deliveryFee ?? "..."}
        </Text>

        {peakAdded && (
          <Text style={{ color: "red", marginTop: 6 }}>
            🔥 Peak Time Fee Applied
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={placeOrder}
        style={{
          backgroundColor: "#000",
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Place Order
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}