import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [acceptingOrders, setAcceptingOrders] = useState(null);
  const [loadingSystem, setLoadingSystem] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [pendingDelivery, setPendingDelivery] = useState([]);

  /* ================= FETCHERS ================= */

  const fetchOrders = () => {
    fetch(`${BASE_URL}/orders`)
      .then((res) => res.json())
      .then(setOrders);
  };

  const fetchSystemStatus = async () => {
    const res = await fetch(`${BASE_URL}/system/status`);
    const data = await res.json();
    setAcceptingOrders(data.adminEnabled);
    setLoadingSystem(false);
  };

  const fetchAnalytics = async () => {
    const res = await fetch(`${BASE_URL}/admin/analytics/summary`);
    const data = await res.json();
    setAnalytics(data);
  };

  const fetchPendingDelivery = async () => {
    const res = await fetch(`${BASE_URL}/admin/users/pending-delivery`);
    const data = await res.json();
    setPendingDelivery(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchSystemStatus();
    fetchAnalytics();
    fetchPendingDelivery();

    const interval = setInterval(() => {
      fetchOrders();
      fetchSystemStatus();
      fetchAnalytics();
      fetchPendingDelivery();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ================= ACTIONS ================= */

  const toggleAcceptingOrders = async () => {
    const newValue = !acceptingOrders;
    setAcceptingOrders(newValue);

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
    fetchAnalytics();
  };

  const approveDelivery = async (email) => {
    await fetch(`${BASE_URL}/admin/users/approve-delivery`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    fetchPendingDelivery();
  };

  /* ================= GROUPING ================= */

  const newOrders = orders.filter(o => o.status === "CREATED");
  const ongoingOrders = orders.filter(o => o.status === "ASSIGNED");
  const completedOrders = orders.filter(o => o.status === "DELIVERED");

  /* ================= ORDER CARD ================= */

  const renderOrderCard = (order) => (
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

      <p><b>Outlets:</b></p>
      <ul>
        {order.outlets.map((o, i) => (
          <li key={i}>
            <b>{o.outletName}:</b> {o.items}
          </li>
        ))}
      </ul>

      {order.deliveryPerson && (
        <p><b>Delivery:</b> {order.deliveryPerson.email}</p>
      )}
    </div>
  );

  /* ================= UI ================= */

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>OneCart Admin Dashboard</h1>

      {/* ================= ANALYTICS ================= */}
      {analytics && (
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 32,
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div><b>Total Orders:</b> {analytics.totalOrders}</div>
          <div><b>Delivered:</b> {analytics.deliveredOrders}</div>
          <div><b>Active Delivery Partners:</b> {analytics.activeDeliveryPartners}</div>
          <div><b>Total Earnings:</b> ₹{analytics.totalEarnings}</div>
          <div><b>Avg Delivery Time:</b> {analytics.avgDeliveryTimeMinutes} min</div>
        </div>
      )}

      {/* ================= DELIVERY APPROVALS ================= */}
      <h2>🛂 Pending Delivery Approvals ({pendingDelivery.length})</h2>

      {pendingDelivery.length === 0 ? (
        <p>No pending approvals</p>
      ) : (
        pendingDelivery.map(user => (
          <div
            key={user._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <p><b>Email:</b> {user.email}</p>
            <button onClick={() => approveDelivery(user.email)}>
              Approve
            </button>
          </div>
        ))
      )}

      {/* ================= SYSTEM TOGGLE ================= */}
      <div
        style={{
          marginBottom: 32,
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

        <button onClick={toggleAcceptingOrders} disabled={loadingSystem}>
          Turn {acceptingOrders ? "OFF" : "ON"}
        </button>
      </div>

      {/* ================= NEW ORDERS ================= */}
      <h2>🆕 New Orders ({newOrders.length})</h2>
      {newOrders.length === 0
        ? <p>No new orders</p>
        : newOrders.map(renderOrderCard)}

      {/* ================= ONGOING ================= */}
      <h2>🚴 Ongoing Deliveries ({ongoingOrders.length})</h2>
      {ongoingOrders.length === 0
        ? <p>No ongoing deliveries</p>
        : ongoingOrders.map(renderOrderCard)}

      {/* ================= COMPLETED ================= */}
      <h2>✅ Completed Orders ({completedOrders.length})</h2>
      {completedOrders.length === 0
        ? <p>No completed orders</p>
        : completedOrders.map(renderOrderCard)}

    </div>
  );
}