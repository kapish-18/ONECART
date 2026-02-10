import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config/api";
import { getUser } from "../utils/auth";

export default function EarningsScreen() {
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const user = await getUser();

      const res = await fetch(
        `${BASE_URL}/delivery/earnings?email=${encodeURIComponent(
          user.email
        )}`
      );

      const data = await res.json();

      setTotalEarnings(data.totalEarnings);
      setTotalOrders(data.totalOrders);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to load earnings", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 16 }}>
        My Earnings 💰
      </Text>

      {/* SUMMARY */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#000",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          Total Deliveries: <Text style={{ fontWeight: "bold" }}>{totalOrders}</Text>
        </Text>

        <Text style={{ fontSize: 18, marginTop: 8 }}>
          Total Earned:{" "}
          <Text style={{ fontWeight: "bold" }}>₹{totalEarnings}</Text>
        </Text>
      </View>

      {/* ORDERS LIST */}
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        Delivery History
      </Text>

      {orders.length === 0 && (
        <Text style={{ color: "#666" }}>No completed deliveries yet</Text>
      )}

      {orders.map((order) => (
        <View
          key={order._id}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text>
            <Text style={{ fontWeight: "bold" }}>Hostel:</Text>{" "}
            {order.hostelBlock}
          </Text>

          <Text>
            <Text style={{ fontWeight: "bold" }}>Earned:</Text>{" "}
            ₹{order.deliveryFee}
          </Text>

          <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            {new Date(order.deliveredAt).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
