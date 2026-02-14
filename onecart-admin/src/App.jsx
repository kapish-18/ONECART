import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [acceptingOrders, setAcceptingOrders] = useState(null);
  const [peakMode, setPeakMode] = useState(false);
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
    setPeakMode(data.peakMode);
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

  const togglePeakMode = async () => {
    const newValue = !peakMode;
    setPeakMode(newValue);

    await fetch(`${BASE_URL}/system`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peakMode: newValue }),
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

  const newOrders = orders.filter((o) => o.status === "CREATED");
  const ongoingOrders = orders.filter((o) => o.status === "ASSIGNED");
  const completedOrders = orders.filter((o) => o.status === "DELIVERED");

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

      {/* 💰 PAYMENT DETAILS */}
      <hr />
      <p><b>Delivery Fee:</b> ₹{order.deliveryFee || 0}</p>

      {order.foodAmount > 0 && (
        <p><b>Food Amount:</b> ₹{order.foodAmount}</p>
      )}

      {order.totalAmount > 0 && (
        <p style={{ fontWeight: "bold" }}>
          <b>Total Amount:</b> ₹{order.totalAmount}
        </p>
      )}

      {order.paymentStatus && (
        <p>
          <b>Payment:</b>{" "}
          <span
            style={{
              color: order.paymentStatus === "PAID" ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {order.paymentStatus}
          </span>
        </p>
      )}

      {/* STATUS BUTTONS */}
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

      <hr />

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

      {/* ================= SYSTEM TOGGLES ================= */}
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
          <span style={{ color: acceptingOrders ? "green" : "red" }}>
            {acceptingOrders ? "ON" : "OFF"}
          </span>
        </p>

        <button onClick={toggleAcceptingOrders}>
          Turn {acceptingOrders ? "OFF" : "ON"}
        </button>

        <hr style={{ margin: "16px 0" }} />

        <p>
          <b>Peak Mode:</b>{" "}
          <span style={{ color: peakMode ? "orange" : "gray" }}>
            {peakMode ? "ON (+₹10)" : "OFF"}
          </span>
        </p>

        <button onClick={togglePeakMode}>
          Turn {peakMode ? "OFF" : "ON"}
        </button>
      </div>

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