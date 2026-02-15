import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config/api";
import { getUser } from "../utils/auth";
import { useNavigation } from "@react-navigation/native";

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const navigation = useNavigation<any>();

  /* ================= FETCH ORDERS ================= */

  const fetchOrders = async () => {
    try {
      const user = await getUser();

      const res = await fetch(
        `${BASE_URL}/orders/user/${encodeURIComponent(user.email)}`
      );

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ================= LIVE TIMER ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================= LOADING ================= */

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

  /* ================= UI ================= */

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        My Orders
      </Text>

      {orders.map((order) => {
        const createdTime = new Date(order.createdAt).getTime();
        const timeLeftMs = 5 * 60 * 1000 - (now - createdTime);
        const secondsLeft = Math.max(Math.floor(timeLeftMs / 1000), 0);

        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;

        return (
          <View
            key={order._id}
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text>Status: {order.status}</Text>

            <Text>Delivery Fee: ₹{order.deliveryFee}</Text>

            {/* 🔥 SHOW TIMER ONLY FOR CREATED */}
            {order.status === "CREATED" && secondsLeft > 0 && (
              <>
                <Text style={{ marginTop: 8, color: "orange" }}>
                  ⏳ Order will auto-cancel in {minutes}m {seconds}s
                </Text>
                <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  If no delivery partner accepts within 5 minutes,
                  your order will be cancelled automatically.
                </Text>
              </>
            )}

            {order.status === "CANCELLED" && (
              <Text style={{ marginTop: 8, color: "red" }}>
                ❌ Order auto-cancelled (no delivery partner accepted)
              </Text>
            )}

            {order.foodAmount > 0 && (
              <>
                <Text style={{ marginTop: 8 }}>
                  Food Amount: ₹{order.foodAmount}
                </Text>
                <Text style={{ fontWeight: "bold" }}>
                  Total: ₹{order.totalAmount}
                </Text>
              </>
            )}

            {/* PAYMENT BUTTON */}
            {order.status === "ASSIGNED" &&
              order.totalAmount > 0 &&
              order.paymentStatus === "PENDING" && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Payment", {
                      orderId: order._id,
                    })
                  }
                  style={{
                    backgroundColor: "green",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 12,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Pay ₹{order.totalAmount}
                  </Text>
                </TouchableOpacity>
              )}

            {order.paymentStatus === "PAID" && (
              <Text style={{ color: "green", marginTop: 10 }}>
                ✅ Payment Completed
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}