import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config/api";
import { getUser } from "../utils/auth";

export default function DeliveryHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const user = await getUser();

      const res = await fetch(
        `${BASE_URL}/delivery/earnings?email=${encodeURIComponent(user.email)}`
      );

      const data = await res.json();

      setOrders(data.orders || []);
    } catch (err) {
      console.log("History load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 16 }}>
        Delivery History
      </Text>

      {orders.length === 0 && (
        <Text style={{ color: "#666" }}>
          No deliveries completed yet
        </Text>
      )}

      {orders.map((order) => (
        <View
          key={order._id}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <Text>
            <Text style={{ fontWeight: "bold" }}>Hostel:</Text>{" "}
            {order.hostelBlock}
          </Text>

          <Text>Delivery Fee: ₹{order.deliveryFee}</Text>

          {order.foodAmount > 0 && (
            <>
              <Text>Food Amount: ₹{order.foodAmount}</Text>
              <Text style={{ fontWeight: "bold" }}>
                Total: ₹{order.totalAmount}
              </Text>
            </>
          )}

          <Text style={{ marginTop: 6 }}>
            🕒 Delivered at:{" "}
            {order.deliveredAt
              ? new Date(order.deliveredAt).toLocaleString()
              : "-"}
          </Text>

          <Text style={{ marginTop: 6, color: "green" }}>
            Status: DELIVERED
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}