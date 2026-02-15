import {
  View,
  Text,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
  TextInput,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../config/api";
import { getUser } from "../utils/auth";
import { useIsFocused, useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [assignedOrder, setAssignedOrder] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [foodAmountInput, setFoodAmountInput] = useState("");

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

  /* ================= AUTO REFRESH ASSIGNED ORDER ================= */

  useEffect(() => {
    if (!isFocused || !assignedOrder) return;

    const interval = setInterval(() => {
      loadAssignedOrder();
    }, 3000);

    return () => clearInterval(interval);
  }, [isFocused, assignedOrder]);

  /* ================= POLLING AVAILABLE ORDERS ================= */

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

    if (!res.ok) {
      setAssignedOrder(null);
      return;
    }

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

  /* ================= ACTIONS ================= */

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

  const setFoodAmount = async () => {
    if (!foodAmountInput) {
      Alert.alert("Enter food amount");
      return;
    }

    await fetch(`${BASE_URL}/delivery/set-food-amount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: assignedOrder._id,
        amount: Number(foodAmountInput),
      }),
    });

    Alert.alert("Food amount set");
    await loadAssignedOrder();
  };

  const cancelAssignedOrder = async () => {
    Alert.alert(
      "Cancel Delivery?",
      "This will release the order back to available pool.",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            const user = await getUser();

            await fetch(`${BASE_URL}/delivery/cancel-assigned`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: assignedOrder._id,
                deliveryEmail: user.email,
              }),
            });

            setAssignedOrder(null);
            setFoodAmountInput("");

            await fetchOrders(true);
          },
        },
      ]
    );
  };

  const markDelivered = async (orderId: string) => {
    if (assignedOrder.paymentStatus !== "PAID") {
      Alert.alert("Payment not completed yet");
      return;
    }

    await fetch(`${BASE_URL}/delivery/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    Alert.alert("Order Delivered 🎉");

    setAssignedOrder(null);
    setFoodAmountInput("");

    await Promise.all([
      loadTodayEarnings(),
      loadAssignedOrder(),
      fetchOrders(true),
    ]);
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isApproved) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>⏳ Waiting for admin approval</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>
        Delivery Dashboard
      </Text>

      <Text style={{ marginTop: 10 }}>
        💰 Today’s Earnings: ₹{todayEarnings}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("DeliveryHistory")}
        style={{
          backgroundColor: "#007bff",
          padding: 10,
          borderRadius: 8,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          View Delivery History
        </Text>
      </TouchableOpacity>

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

      {/* ASSIGNED ORDER */}

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
              Delivery Fee: ₹{assignedOrder.deliveryFee}
            </Text>

            <Text style={{ marginTop: 10, fontWeight: "bold" }}>
              Ordered Items:
            </Text>

            {assignedOrder.outlets?.map((outlet: any, index: number) => (
              <View key={index} style={{ marginTop: 6 }}>
                <Text style={{ fontWeight: "600" }}>
                  {outlet.outletName}
                </Text>
                <Text>{outlet.items}</Text>
              </View>
            ))}

            {assignedOrder.paymentStatus === "PENDING" && (
              <TouchableOpacity
                onPress={cancelAssignedOrder}
                style={{
                  backgroundColor: "#d9534f",
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 12,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  Cancel Delivery
                </Text>
              </TouchableOpacity>
            )}

            {assignedOrder.foodAmount === 0 && (
              <>
                <TextInput
                  placeholder="Enter food amount"
                  keyboardType="numeric"
                  value={foodAmountInput}
                  onChangeText={setFoodAmountInput}
                  style={{
                    borderWidth: 1,
                    marginTop: 12,
                    padding: 10,
                    borderRadius: 8,
                  }}
                />

                <TouchableOpacity
                  onPress={setFoodAmount}
                  style={{
                    backgroundColor: "#000",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Confirm Food Amount
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {assignedOrder.foodAmount > 0 && (
              <>
                <Text style={{ marginTop: 10 }}>
                  Food: ₹{assignedOrder.foodAmount}
                </Text>

                <Text style={{ fontWeight: "bold", marginTop: 6 }}>
                  Total: ₹{assignedOrder.totalAmount}
                </Text>

                <Text style={{ marginTop: 6 }}>
                  Payment: {assignedOrder.paymentStatus}
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
              </>
            )}
          </View>
        </>
      )}

      {/* PENDING ORDERS */}

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

              <Text>💵 Fee: ₹{order.deliveryFee}</Text>

              <Text style={{ marginTop: 6, fontWeight: "bold" }}>
                Ordered Items:
              </Text>

              {order.outlets?.map((outlet: any, index: number) => (
                <View key={index} style={{ marginTop: 4 }}>
                  <Text style={{ fontWeight: "600" }}>
                    {outlet.outletName}
                  </Text>
                  <Text>{outlet.items}</Text>
                </View>
              ))}

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
    </ScrollView>
  );
}