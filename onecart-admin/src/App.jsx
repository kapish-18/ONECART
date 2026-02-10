import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000"; // or ngrok

export default function App() {
  const [orders, setOrders] = useState([]);
  const [acceptingOrders, setAcceptingOrders] = useState(null);
  const [loadingSystem, setLoadingSystem] = useState(true);

  // 🔄 Fetch orders
  const fetchOrders = () => {
    fetch(`${BASE_URL}/orders`)
      .then((res) => res.json())
      .then(setOrders);
  };

  // 🔄 Fetch system status (FIXED)
  const fetchSystemStatus = async () => {
    const res = await fetch(`${BASE_URL}/system/status`);
    const data = await res.json();

    setAcceptingOrders(data.adminEnabled); // IMPORTANT
    setLoadingSystem(false);
  };

  useEffect(() => {
    fetchOrders();
    fetchSystemStatus();

    const interval = setInterval(() => {
      fetchOrders();
      fetchSystemStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🔘 Toggle admin ordering
  const toggleAcceptingOrders = async () => {
    const newValue = !acceptingOrders;

    setAcceptingOrders(newValue); // optimistic UI

    await fetch(`${BASE_URL}/system`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptingOrders: newValue }),
    });
  };

  const updateStatus = async (orderId, status) => {
    await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    fetchOrders();
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>OneCart Admin Dashboard</h1>

      {/* SYSTEM TOGGLE */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
          maxWidth: 400,
        }}
      >
        <p>
          <b>Accepting Orders:</b>{" "}
          {loadingSystem ? (
            "Loading..."
          ) : (
            <span
              style={{
                color: acceptingOrders ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {acceptingOrders ? "ON" : "OFF"}
            </span>
          )}
        </p>

        <button
          onClick={toggleAcceptingOrders}
          disabled={loadingSystem}
          style={{ marginTop: 8 }}
        >
          Turn {acceptingOrders ? "OFF" : "ON"}
        </button>
      </div>

      {/* ORDERS */}
      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <p><b>Order ID:</b> {order._id}</p>
          <p><b>User:</b> {order.user?.email}</p>
          <p><b>Hostel:</b> {order.hostelBlock}</p>
          <p><b>Status:</b> {order.status}</p>

          <div style={{ marginBottom: 12 }}>
            {order.status === "CREATED" && (
              <button
                onClick={() => updateStatus(order._id, "ASSIGNED")}
                style={{ marginRight: 8 }}
              >
                Mark Assigned
              </button>
            )}

            {order.status === "ASSIGNED" && (
              <button
                onClick={() => updateStatus(order._id, "DELIVERED")}
              >
                Mark Delivered
              </button>
            )}
          </div>

          <p><b>Outlets:</b></p>
          <ul>
            {order.outlets.map((o, i) => (
              <li key={i}>
                <b>{o.outletName}:</b> {o.items}
              </li>
            ))}
          </ul>

          {order.deliveryPerson && (
            <p>
              <b>Delivery:</b> {order.deliveryPerson.email}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
