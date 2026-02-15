import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
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

  /* ================= SMOOTH TIMER ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getRemainingTime = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const diff = 5 * 60 * 1000 - (now - createdTime);

    if (diff <= 0) return "00:00";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  /* ================= FIXED CANCEL ORDER ================= */

  const cancelOrder = async (orderId: string) => {
    try {
      const user = await getUser();

      const res = await fetch(`${BASE_URL}/orders/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(data.error || "Cancel failed");
        return;
      }

      fetchOrders();
    } catch (err) {
      Alert.alert("Cancel failed");
    }
  };

  /* ================= UI STATES ================= */

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

  /* ================= RENDER ================= */

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        My Orders
      </Text>

      {orders.map((order) => (
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

          {order.foodAmount > 0 && (
            <>
              <Text>Food Amount: ₹{order.foodAmount}</Text>
              <Text style={{ fontWeight: "bold" }}>
                Total: ₹{order.totalAmount}
              </Text>
            </>
          )}

          {/* ================= PAYMENT BUTTON ================= */}

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

          {/* ================= CANCEL LOGIC ================= */}

          {(order.status === "CREATED" ||
            (order.status === "ASSIGNED" &&
              order.paymentStatus === "PENDING")) && (
            <>
              {order.status === "CREATED" && (
                <Text style={{ color: "red", marginTop: 6 }}>
                  Auto cancelling in: {getRemainingTime(order.createdAt)}
                </Text>
              )}

              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Cancel Order",
                    "Are you sure you want to cancel this order?",
                    [
                      { text: "No" },
                      {
                        text: "Yes",
                        onPress: () => cancelOrder(order._id),
                      },
                    ]
                  )
                }
                style={{
                  backgroundColor: "red",
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 12,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  Cancel Order
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}