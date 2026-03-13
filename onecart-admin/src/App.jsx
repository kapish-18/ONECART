import { useEffect, useState } from "react";

const BASE_URL = "https://onecart-s238.onrender.com";
const SESSION_KEY = "onecart_admin_auth";

/* ================= HASH HELPER ================= */

async function hashPassword(input) {
  const msgBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ================= LOGIN GATE ================= */

function LoginGate({ onSuccess }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);

    const hashed = await hashPassword(input);
    const expectedHash = import.meta.env.VITE_ADMIN_HASH;

    if (hashed === expectedHash) {
      sessionStorage.setItem(SESSION_KEY, "true");
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
    }

    setChecking(false);
  };

  return (
    <div style={styles.overlay}>
      <form
        onSubmit={handleSubmit}
        style={{
          ...styles.loginBox,
          animation: shake ? "shake 0.4s ease" : "none",
        }}
      >
        <h2 style={styles.loginTitle}>🛒 OneCart Admin</h2>
        <p style={styles.loginSub}>Enter password to continue</p>

        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          autoFocus
          style={{
            ...styles.input,
            borderColor: error ? "#e53e3e" : "#d1d5db",
          }}
        />

        {error && <p style={styles.errorMsg}>Incorrect password. Try again.</p>}

        <button type="submit" style={styles.loginBtn} disabled={checking}>
          {checking ? "Checking..." : "Enter Dashboard →"}
        </button>
      </form>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}

/* ================= PAYOUT SECTION ================= */

function PayoutsSection({ baseUrl }) {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // QR editing state: { email, value, saving }
  const [editingQr, setEditingQr] = useState(null);

  const fetchPayouts = async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/admin/payouts?period=${p}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch payouts", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayouts(period);
  }, [period]);

  const saveQr = async (email) => {
    if (!editingQr) return;
    setEditingQr((prev) => ({ ...prev, saving: true }));
    await fetch(`${baseUrl}/admin/payouts/qr`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, qrCode: editingQr.value }),
    });
    setEditingQr(null);
    fetchPayouts(period);
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ marginBottom: 8 }}>💸 Payouts</h2>

      {/* Period selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["today", "week", "month", "all"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              cursor: "pointer",
              fontWeight: period === p ? 700 : 400,
              backgroundColor: period === p ? "#111827" : "#f9fafb",
              color: period === p ? "#fff" : "#374151",
            }}
          >
            {p === "today" ? "Today" : p === "week" ? "Last 7 days" : p === "month" ? "Last 30 days" : "All time"}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}

      {/* Summary banner */}
      {data && !loading && (
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            padding: "14px 20px",
            backgroundColor: "#fef9c3",
            border: "1px solid #fde68a",
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <div>
            <span style={{ color: "#6b7280", fontSize: 13 }}>Total you owe</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#b45309" }}>
              ₹{data.summary.totalOwed}
            </div>
          </div>
          <div>
            <span style={{ color: "#6b7280", fontSize: 13 }}>Orders in period</span>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.summary.totalOrders}</div>
          </div>
          <div>
            <span style={{ color: "#6b7280", fontSize: 13 }}>Your revenue (₹9 × orders)</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#15803d" }}>
              ₹{data.summary.yourRevenue}
            </div>
          </div>
        </div>
      )}

      {/* Per-partner cards */}
      {data && !loading && data.partners.length === 0 && (
        <p style={{ color: "#6b7280" }}>No delivered orders in this period.</p>
      )}

      {data &&
        !loading &&
        data.partners.map((partner) => (
          <div
            key={partner.email}
            style={{
              ...styles.card,
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            {/* Left: info */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 16 }}>
                {partner.name || partner.email}
              </p>
              <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: 13 }}>
                {partner.email}
              </p>

              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
                <tbody>
                  <tr>
                    <td style={styles.td}>Orders delivered</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{partner.ordersDelivered}</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Food they fronted</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>₹{partner.foodAmountFronted}</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Delivery fee earned</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>₹{partner.deliveryFeesEarned}</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Your cut (₹9 × {partner.ordersDelivered})</td>
                    <td style={{ ...styles.td, fontWeight: 600, color: "#15803d" }}>
                      −₹{partner.ordersDelivered * 9}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: "#fef9c3" }}>
                    <td style={{ ...styles.td, fontWeight: 700 }}>You owe</td>
                    <td style={{ ...styles.td, fontWeight: 700, fontSize: 18, color: "#b45309" }}>
                      ₹{partner.youOwe}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: QR code */}
            <div style={{ minWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {partner.qrCode ? (
                <>
                  <img
                    src={partner.qrCode}
                    alt="QR Code"
                    style={{ width: 140, height: 140, objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 6 }}
                  />
                  <button
                    onClick={() => setEditingQr({ email: partner.email, value: partner.qrCode || "", saving: false })}
                    style={styles.smallBtn}
                  >
                    Change QR
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 140,
                      height: 140,
                      border: "2px dashed #d1d5db",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      fontSize: 13,
                      textAlign: "center",
                      padding: 8,
                    }}
                  >
                    No QR yet
                  </div>
                  <button
                    onClick={() => setEditingQr({ email: partner.email, value: "", saving: false })}
                    style={styles.smallBtn}
                  >
                    Add QR URL
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

      {/* QR edit modal */}
      {editingQr && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 28,
              width: "100%",
              maxWidth: 420,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>Set QR Code URL</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
              Upload the QR image to any image host (e.g. imgbb.com, Cloudinary) and paste the direct image URL below.
            </p>
            <input
              autoFocus
              type="text"
              placeholder="https://i.ibb.co/..."
              value={editingQr.value}
              onChange={(e) => setEditingQr((prev) => ({ ...prev, value: e.target.value }))}
              style={{ ...styles.input, fontSize: 13 }}
            />
            {editingQr.value && (
              <img
                src={editingQr.value}
                alt="preview"
                style={{ width: 120, height: 120, objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 6, alignSelf: "center" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditingQr(null)} style={styles.smallBtn}>
                Cancel
              </button>
              <button
                onClick={() => saveQr(editingQr.email)}
                disabled={editingQr.saving || !editingQr.value}
                style={{ ...styles.loginBtn, padding: "8px 20px", marginTop: 0, opacity: editingQr.saving ? 0.6 : 1 }}
              >
                {editingQr.saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= MAIN APP ================= */

export default function App() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );

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
    if (!authed) return;

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
  }, [authed]);

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

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  /* ================= GATE CHECK ================= */

  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;

  /* ================= GROUPING ================= */

  const newOrders = orders.filter((o) => o.status === "CREATED");
  const ongoingOrders = orders.filter((o) => o.status === "ASSIGNED");
  const completedOrders = orders.filter((o) => o.status === "DELIVERED");

  /* ================= ORDER CARD ================= */

  const renderOrderCard = (order) => (
    <div key={order._id} style={styles.card}>
      <p><b>Order ID:</b> {order._id}</p>
      <p><b>User:</b> {order.user?.email}</p>
      <p><b>Hostel:</b> {order.hostelBlock}</p>
      <p><b>Status:</b> {order.status}</p>

      <hr />
      <p><b>Delivery Fee:</b> ₹{order.deliveryFee || 0}</p>
      {order.foodAmount > 0 && <p><b>Food Amount:</b> ₹{order.foodAmount}</p>}
      {order.totalAmount > 0 && (
        <p style={{ fontWeight: "bold" }}>
          <b>Total Amount:</b> ₹{order.totalAmount}
        </p>
      )}
      {order.paymentStatus && (
        <p>
          <b>Payment:</b>{" "}
          <span style={{ color: order.paymentStatus === "PAID" ? "green" : "red", fontWeight: "bold" }}>
            {order.paymentStatus}
          </span>
        </p>
      )}

      {order.status === "CREATED" && (
        <button onClick={() => updateStatus(order._id, "ASSIGNED")} style={{ marginRight: 8 }}>
          Mark Assigned
        </button>
      )}
      {order.status === "ASSIGNED" && (
        <button onClick={() => updateStatus(order._id, "DELIVERED")}>
          Mark Delivered
        </button>
      )}

      <hr />
      <p><b>Outlets:</b></p>
      <ul>
        {order.outlets.map((o, i) => (
          <li key={i}><b>{o.outletName}:</b> {o.items}</li>
        ))}
      </ul>
      {order.deliveryPerson && <p><b>Delivery:</b> {order.deliveryPerson.email}</p>}
    </div>
  );

  /* ================= UI ================= */

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>OneCart Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* ================= ANALYTICS ================= */}
      {analytics && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32, border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
          <div><b>Total Orders:</b> {analytics.totalOrders}</div>
          <div><b>Delivered:</b> {analytics.deliveredOrders}</div>
          <div><b>Active Delivery Partners:</b> {analytics.activeDeliveryPartners}</div>
          <div><b>Total Earnings:</b> ₹{analytics.totalEarnings}</div>
          <div><b>Avg Delivery Time:</b> {analytics.avgDeliveryTimeMinutes} min</div>
        </div>
      )}

      {/* ================= SYSTEM TOGGLES ================= */}
      <div style={{ marginBottom: 32, padding: 16, border: "1px solid #ccc", borderRadius: 8, maxWidth: 400 }}>
        <p>
          <b>Accepting Orders:</b>{" "}
          <span style={{ color: acceptingOrders ? "green" : "red" }}>
            {acceptingOrders ? "ON" : "OFF"}
          </span>
        </p>
        <button onClick={toggleAcceptingOrders}>Turn {acceptingOrders ? "OFF" : "ON"}</button>

        <hr style={{ margin: "16px 0" }} />

        <p>
          <b>Peak Mode:</b>{" "}
          <span style={{ color: peakMode ? "orange" : "gray" }}>
            {peakMode ? "ON (+₹10)" : "OFF"}
          </span>
        </p>
        <button onClick={togglePeakMode}>Turn {peakMode ? "OFF" : "ON"}</button>
      </div>

      {/* ================= PAYOUTS ================= */}
      <PayoutsSection baseUrl={BASE_URL} />

      {/* ================= DELIVERY APPROVALS ================= */}
      <h2>🛂 Pending Delivery Approvals ({pendingDelivery.length})</h2>
      {pendingDelivery.length === 0 ? (
        <p>No pending approvals</p>
      ) : (
        pendingDelivery.map((user) => (
          <div key={user._id} style={styles.card}>
            <p><b>Email:</b> {user.email}</p>
            <button onClick={() => approveDelivery(user.email)}>Approve</button>
          </div>
        ))
      )}

      {/* ================= NEW ORDERS ================= */}
      <h2>🆕 New Orders ({newOrders.length})</h2>
      {newOrders.length === 0 ? <p>No new orders</p> : newOrders.map(renderOrderCard)}

      {/* ================= ONGOING ================= */}
      <h2>🚴 Ongoing Deliveries ({ongoingOrders.length})</h2>
      {ongoingOrders.length === 0 ? <p>No ongoing deliveries</p> : ongoingOrders.map(renderOrderCard)}

      {/* ================= COMPLETED ================= */}
      <h2>✅ Completed Orders ({completedOrders.length})</h2>
      {completedOrders.length === 0 ? <p>No completed orders</p> : completedOrders.map(renderOrderCard)}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  overlay: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    fontFamily: "sans-serif",
  },
  loginBox: {
    backgroundColor: "#fff",
    padding: "40px 32px",
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  loginTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    textAlign: "center",
  },
  loginSub: {
    margin: 0,
    color: "#6b7280",
    textAlign: "center",
    fontSize: 14,
  },
  input: {
    padding: "10px 14px",
    fontSize: 15,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  errorMsg: {
    color: "#e53e3e",
    fontSize: 13,
    margin: 0,
  },
  loginBtn: {
    padding: "10px 0",
    backgroundColor: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 4,
  },
  logoutBtn: {
    padding: "6px 14px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    color: "#374151",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  td: {
    padding: "5px 8px",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
  },
  smallBtn: {
    padding: "5px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    fontSize: 12,
    color: "#374151",
  },
};