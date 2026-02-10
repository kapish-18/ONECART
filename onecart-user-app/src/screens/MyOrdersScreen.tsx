import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config/api";
import { getUser } from "../utils/auth";

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const user = await getUser();

    const res = await fetch(
      `${BASE_URL}/orders/user/${encodeURIComponent(user.email)}`
    );

    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // 🔄 Auto refresh every 5s
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No orders yet</Text>
      </View>
    );
  }

  const statusColor = (status: string) => {
    if (status === "DELIVERED") return "green";
    if (status === "ASSIGNED") return "blue";
    return "orange"; // CREATED
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        My Orders
      </Text>

      {orders.map((order) => (
        <View
          key={order._id}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          {/* Status */}
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
            Status:{" "}
            <Text style={{ color: statusColor(order.status) }}>
              {order.status}
            </Text>
          </Text>

          {/* Timestamp */}
          <Text style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
            {new Date(order.createdAt).toLocaleString()}
          </Text>

          {/* Outlets */}
          {order.outlets.map((o: any, index: number) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: "600" }}>{o.outletName}</Text>
              <Text>{o.items || "No items"}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
