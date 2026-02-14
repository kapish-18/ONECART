import {
  View,
  Text,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../config/api";
import { getUser } from "../utils/auth";
import { useNavigation, useIsFocused } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [assignedOrder, setAssignedOrder] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);

  const lastOrderCountRef = useRef(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      await Promise.all([
        loadStatus(),
        loadAssignedOrder(),
        loadTodayEarnings(),
      ]);
    } catch (err) {
      console.log("Init error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= POLLING ================= */
  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (!isFocused || !isAvailable || assignedOrder || !isApproved) return;

    fetchOrders(true);

    pollingRef.current = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isFocused, isAvailable, assignedOrder, isApproved]);

  /* ================= LOADERS ================= */

  const loadStatus = async () => {
    const user = await getUser();

    const res = await fetch(
      `${BASE_URL}/delivery/me?email=${encodeURIComponent(user.email)}`
    );

    if (res.status === 403) {
      setIsApproved(false);
      return;
    }

    const data = await res.json();
    setIsApproved(true);
    setIsAvailable(!!data.isAvailable);
  };

  const loadAssignedOrder = async () => {
    const user = await getUser();

    const res = await fetch(
      `${BASE_URL}/delivery/my-order?email=${encodeURIComponent(user.email)}`
    );

    if (!res.ok) return;

    const data = await res.json();
    setAssignedOrder(data || null);
  };

  const loadTodayEarnings = async () => {
    const user = await getUser();

    const res = await fetch(
      `${BASE_URL}/delivery/earnings?email=${encodeURIComponent(user.email)}`
    );

    if (!res.ok) return;

    const data = await res.json();
    setTodayEarnings(data.todayEarnings || 0);
  };

  /* ================= ORDERS ================= */

  const fetchOrders = async (initial = false) => {
    const res = await fetch(`${BASE_URL}/delivery/orders`);
    if (!res.ok) return;

    const data = await res.json();

    if (!initial && data.length > lastOrderCountRef.current) {
      Alert.alert("🚨 New Order", "A delivery order is available");
      Vibration.vibrate(500);
    }

    lastOrderCountRef.current = data.length;
    setOrders(data);
  };

  /* ================= AVAILABILITY ================= */

  const toggleAvailability = async () => {
    if (assignedOrder) return;

    const user = await getUser();
    const newValue = !isAvailable;
    setIsAvailable(newValue);

    await fetch(`${BASE_URL}/delivery/availability`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, isAvailable: newValue }),
    });

    if (!newValue) {
      setOrders([]);
      lastOrderCountRef.current = 0;
    }
  };

  /* ================= ACTIONS ================= */

  const acceptOrder = async (orderId: string) => {
    const user = await getUser();

    const res = await fetch(`${BASE_URL}/delivery/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        deliveryEmail: user.email,
      }),
    });

    if (!res.ok) {
      Alert.alert("Error", "Could not accept order");
      return;
    }

    Alert.alert("Order Accepted");
    setOrders([]);
    lastOrderCountRef.current = 0;
    await loadAssignedOrder();
  };

  const markDelivered = async (orderId: string) => {
    await fetch(`${BASE_URL}/delivery/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    Alert.alert("Order Delivered 🎉");

    setAssignedOrder(null);
    await Promise.all([
      loadTodayEarnings(),
      loadAssignedOrder(),
      fetchOrders(true),
    ]);
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ================= NOT APPROVED ================= */

  if (!isApproved) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ fontSize: 18, textAlign: "center" }}>
          ⏳ Waiting for admin approval
        </Text>
        <Text style={{ marginTop: 10, textAlign: "center", color: "#666" }}>
          You will be able to deliver orders once approved.
        </Text>
      </View>
    );
  }

  /* ================= UI ================= */

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>
        Delivery Dashboard
      </Text>

      <Text style={{ fontSize: 16, marginTop: 12 }}>
        💰 Today’s Earnings: ₹{todayEarnings}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: 16,
        }}
      >
        <Text>{isAvailable ? "AVAILABLE" : "NOT AVAILABLE"}</Text>
        <Switch
          value={isAvailable}
          onValueChange={toggleAvailability}
          disabled={!!assignedOrder}
        />
      </View>

      {/* ================= ASSIGNED ORDER ================= */}

      {assignedOrder && (
        <>
          <Text style={{ fontSize: 18, marginTop: 12 }}>
            Current Delivery
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              marginTop: 12,
            }}
          >
            <Text>
              <Text style={{ fontWeight: "bold" }}>Hostel:</Text>{" "}
              {assignedOrder.user?.hostelBlock}
            </Text>

            <Text style={{ marginTop: 6 }}>
              💵 Fee: ₹{assignedOrder.deliveryFee || 30}
            </Text>

            <TouchableOpacity
              onPress={() => markDelivered(assignedOrder._id)}
              style={{
                backgroundColor: "green",
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                Mark Delivered
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ================= PENDING ORDERS ================= */}

      {!assignedOrder && isAvailable && orders.length > 0 && (
        <>
          <Text style={{ fontSize: 18, marginTop: 20 }}>
            Pending Orders
          </Text>

          {orders.map((order) => (
            <View
              key={order._id}
              style={{
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginTop: 12,
              }}
            >
              <Text>
                <Text style={{ fontWeight: "bold" }}>Hostel:</Text>{" "}
                {order.user?.hostelBlock}
              </Text>

              <Text>💵 Fee: ₹{order.deliveryFee || 30}</Text>

              <TouchableOpacity
                onPress={() => acceptOrder(order._id)}
                style={{
                  backgroundColor: "#000",
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 12,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  Accept Order
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {!assignedOrder && isAvailable && orders.length === 0 && (
        <Text style={{ marginTop: 20, color: "#666" }}>
          No orders right now
        </Text>
      )}
    </ScrollView>
  );
}