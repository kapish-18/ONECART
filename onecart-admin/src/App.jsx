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
        style={{ ...styles.loginBox, animation: shake ? "shake 0.4s ease" : "none" }}
      >
        <h2 style={styles.loginTitle}>🛒 OneCart Admin</h2>
        <p style={styles.loginSub}>Enter password to continue</p>
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          placeholder="Password"
          autoFocus
          style={{ ...styles.input, borderColor: error ? "#e53e3e" : "#d1d5db" }}
        />
        {error && <p style={styles.errorMsg}>Incorrect password. Try again.</p>}
        <button type="submit" style={styles.loginBtn} disabled={checking}>
          {checking ? "Checking..." : "Enter Dashboard →"}
        </button>
      </form>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)}
          40%{transform:translateX(10px)}
          60%{transform:translateX(-8px)}
          80%{transform:translateX(8px)}
        }
      `}</style>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatDate(iso) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

/* ================= PAYOUTS SECTION ================= */

function PayoutsSection({ baseUrl }) {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingQr, setEditingQr] = useState(null); // { email, value, saving }
  const [confirmPaid, setConfirmPaid] = useState(null); // email string
  const [markingPaid, setMarkingPaid] = useState(null); // email being processed

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

  useEffect(() => { fetchPayouts(period); }, [period]);

  const saveQr = async () => {
    if (!editingQr) return;
    setEditingQr((prev) => ({ ...prev, saving: true }));
    await fetch(`${baseUrl}/admin/payouts/qr`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: editingQr.email, qrCode: editingQr.value }),
    });
    setEditingQr(null);
    fetchPayouts(period);
  };

  const markPaid = async (email) => {
    setMarkingPaid(email);
    setConfirmPaid(null);
    await fetch(`${baseUrl}/admin/payouts/mark-paid`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMarkingPaid(null);
    fetchPayouts(period);
  };

  const periods = [
    { key: "today", label: "Today" },
    { key: "week", label: "Last 7 days" },
    { key: "month", label: "Last 30 days" },
    { key: "all", label: "All time" },
  ];

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ marginBottom: 12, color: "#111827" }}>💸 Payouts</h2>

      {/* Period tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {periods.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: period === key ? "#111827" : "#d1d5db",
              cursor: "pointer",
              fontWeight: period === key ? 700 : 500,
              fontSize: 13,
              backgroundColor: period === key ? "#111827" : "#ffffff",
              color: period === key ? "#ffffff" : "#374151",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "#6b7280", fontSize: 14 }}>Loading payouts...</p>}

      {/* Summary banner */}
      {data && !loading && (
        <div style={{
          display: "flex", gap: 32, flexWrap: "wrap",
          padding: "16px 20px",
          backgroundColor: "#fffbeb",
          border: "1.5px solid #fcd34d",
          borderRadius: 10, marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e", textTransform: "uppercase", letterSpacing: 0.5 }}>Total you owe</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#b45309" }}>₹{data.summary.totalOwed}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Orders</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>{data.summary.totalOrders}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#065f46", textTransform: "uppercase", letterSpacing: 0.5 }}>Your revenue</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#059669" }}>₹{data.summary.yourRevenue}</div>
          </div>
        </div>
      )}

      {data && !loading && data.partners.length === 0 && (
        <p style={{ color: "#6b7280", fontSize: 14 }}>No delivered orders in this period.</p>
      )}

      {/* Partner cards */}
      {data && !loading && data.partners.map((partner) => (
        <div key={partner.email} style={{
          ...styles.card,
          display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start",
          backgroundColor: partner.youOwe > 0 ? "#fff" : "#f9fafb",
          borderColor: partner.youOwe > 0 ? "#e5e7eb" : "#e5e7eb",
        }}>

          {/* Left: breakdown */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 16, color: "#111827" }}>
                  {partner.name || partner.email}
                </p>
                <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>{partner.email}</p>
                <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: 12 }}>
                  Last paid: {formatDate(partner.lastPaidAt)}
                </p>
              </div>

              {/* Mark Paid button */}
              {partner.youOwe > 0 && (
                <button
                  onClick={() => setConfirmPaid(partner.email)}
                  disabled={markingPaid === partner.email}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#059669",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    opacity: markingPaid === partner.email ? 0.6 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {markingPaid === partner.email ? "Marking..." : "✓ Mark Paid"}
                </button>
              )}
              {partner.youOwe <= 0 && (
                <span style={{
                  padding: "6px 14px",
                  backgroundColor: "#d1fae5",
                  color: "#065f46",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  ✓ All settled
                </span>
              )}
            </div>

            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
              <tbody>
                <tr>
                  <td style={styles.td}>Orders delivered</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#111827", textAlign: "right" }}>{partner.ordersDelivered}</td>
                </tr>
                <tr>
                  <td style={styles.td}>Food they fronted</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#111827", textAlign: "right" }}>₹{partner.foodAmountFronted}</td>
                </tr>
                <tr>
                  <td style={styles.td}>Delivery fee earned</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#111827", textAlign: "right" }}>₹{partner.deliveryFeesEarned}</td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, color: "#6b7280" }}>Your cut (₹9 × {partner.ordersDelivered})</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#059669", textAlign: "right" }}>−₹{partner.ordersDelivered * 9}</td>
                </tr>
                <tr style={{ backgroundColor: partner.youOwe > 0 ? "#fffbeb" : "#f0fdf4" }}>
                  <td style={{ ...styles.td, fontWeight: 700, color: "#111827", fontSize: 15 }}>You owe</td>
                  <td style={{
                    ...styles.td, fontWeight: 800, fontSize: 18, textAlign: "right",
                    color: partner.youOwe > 0 ? "#b45309" : "#059669",
                  }}>
                    ₹{partner.youOwe}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: QR code */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 150 }}>
            {partner.qrCode ? (
              <>
                <img
                  src={partner.qrCode}
                  alt="UPI QR"
                  style={{ width: 140, height: 140, objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "#fff" }}
                />
                <button
                  onClick={() => setEditingQr({ email: partner.email, value: partner.qrCode, saving: false })}
                  style={styles.ghostBtn}
                >
                  Change QR
                </button>
              </>
            ) : (
              <>
                <div style={{
                  width: 140, height: 140,
                  border: "2px dashed #d1d5db", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#9ca3af", fontSize: 12, textAlign: "center", padding: 12,
                  backgroundColor: "#f9fafb",
                }}>
                  No QR code yet
                </div>
                <button
                  onClick={() => setEditingQr({ email: partner.email, value: "", saving: false })}
                  style={styles.ghostBtn}
                >
                  + Add QR
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* ===== CONFIRM PAID MODAL ===== */}
      {confirmPaid && (() => {
        const partner = data?.partners.find((p) => p.email === confirmPaid);
        return (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={{ margin: "0 0 8px", color: "#111827" }}>Confirm payment</h3>
              <p style={{ margin: "0 0 4px", color: "#374151", fontSize: 15 }}>
                Mark <strong>{partner?.name || confirmPaid}</strong> as paid?
              </p>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b7280" }}>
                This records that you've paid them <strong style={{ color: "#b45309" }}>₹{partner?.youOwe}</strong>.
                Their outstanding balance will reset to ₹0.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setConfirmPaid(null)} style={styles.ghostBtn}>Cancel</button>
                <button
                  onClick={() => markPaid(confirmPaid)}
                  style={{ ...styles.loginBtn, padding: "9px 22px", marginTop: 0, backgroundColor: "#059669" }}
                >
                  Yes, mark paid
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== QR EDIT MODAL ===== */}
      {editingQr && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ margin: "0 0 8px", color: "#111827" }}>Set QR Code</h3>
            <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: 13 }}>
              Upload to imgbb.com or any image host and paste the direct image URL.
            </p>
            <input
              autoFocus
              type="text"
              placeholder="https://i.ibb.co/..."
              value={editingQr.value}
              onChange={(e) => setEditingQr((prev) => ({ ...prev, value: e.target.value }))}
              style={{ ...styles.input, fontSize: 13, marginBottom: 12 }}
            />
            {editingQr.value && (
              <img
                src={editingQr.value}
                alt="preview"
                style={{ width: 110, height: 110, objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 6, display: "block", margin: "0 auto 14px" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditingQr(null)} style={styles.ghostBtn}>Cancel</button>
              <button
                onClick={saveQr}
                disabled={editingQr.saving || !editingQr.value}
                style={{ ...styles.loginBtn, padding: "9px 22px", marginTop: 0, opacity: editingQr.saving ? 0.6 : 1 }}
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

  const fetchOrders = () =>
    fetch(`${BASE_URL}/orders`).then((r) => r.json()).then(setOrders);

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
    fetchOrders(); fetchSystemStatus(); fetchAnalytics(); fetchPendingDelivery();
    const interval = setInterval(() => {
      fetchOrders(); fetchSystemStatus(); fetchAnalytics(); fetchPendingDelivery();
    }, 5000);
    return () => clearInterval(interval);
  }, [authed]);

  const toggleAcceptingOrders = async () => {
    const v = !acceptingOrders;
    setAcceptingOrders(v);
    await fetch(`${BASE_URL}/system`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptingOrders: v }),
    });
  };

  const togglePeakMode = async () => {
    const v = !peakMode;
    setPeakMode(v);
    await fetch(`${BASE_URL}/system`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peakMode: v }),
    });
  };

  const updateStatus = async (orderId, status) => {
    await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders(); fetchAnalytics();
  };

  const approveDelivery = async (email) => {
    await fetch(`${BASE_URL}/admin/users/approve-delivery`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    fetchPendingDelivery();
  };

  const handleLogout = () => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); };

  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;

  const newOrders = orders.filter((o) => o.status === "CREATED");
  const ongoingOrders = orders.filter((o) => o.status === "ASSIGNED");
  const completedOrders = orders.filter((o) => o.status === "DELIVERED");

  const renderOrderCard = (order) => (
    <div key={order._id} style={styles.card}>
      <p style={styles.label}><b>Order ID:</b> <span style={styles.value}>{order._id}</span></p>
      <p style={styles.label}><b>User:</b> <span style={styles.value}>{order.user?.email}</span></p>
      <p style={styles.label}><b>Hostel:</b> <span style={styles.value}>{order.hostelBlock}</span></p>
      <p style={styles.label}><b>Status:</b> <span style={styles.value}>{order.status}</span></p>
      <hr style={{ borderColor: "#e5e7eb", margin: "10px 0" }} />
      <p style={styles.label}><b>Delivery Fee:</b> <span style={styles.value}>₹{order.deliveryFee || 0}</span></p>
      {order.foodAmount > 0 && <p style={styles.label}><b>Food Amount:</b> <span style={styles.value}>₹{order.foodAmount}</span></p>}
      {order.totalAmount > 0 && <p style={styles.label}><b>Total Amount:</b> <span style={{ ...styles.value, fontWeight: 700 }}>₹{order.totalAmount}</span></p>}
      {order.paymentStatus && (
        <p style={styles.label}>
          <b>Payment:</b>{" "}
          <span style={{ fontWeight: 700, color: order.paymentStatus === "PAID" ? "#059669" : "#dc2626" }}>
            {order.paymentStatus}
          </span>
        </p>
      )}
      <div style={{ marginTop: 10 }}>
        {order.status === "CREATED" && (
          <button onClick={() => updateStatus(order._id, "ASSIGNED")} style={styles.actionBtn}>
            Mark Assigned
          </button>
        )}
        {order.status === "ASSIGNED" && (
          <button onClick={() => updateStatus(order._id, "DELIVERED")} style={styles.actionBtn}>
            Mark Delivered
          </button>
        )}
      </div>
      <hr style={{ borderColor: "#e5e7eb", margin: "10px 0" }} />
      <p style={styles.label}><b>Outlets:</b></p>
      <ul style={{ margin: "4px 0 0 0", paddingLeft: 18 }}>
        {order.outlets.map((o, i) => (
          <li key={i} style={{ fontSize: 14, color: "#374151", marginBottom: 2 }}>
            <b>{o.outletName}:</b> {o.items}
          </li>
        ))}
      </ul>
      {order.deliveryPerson && <p style={{ ...styles.label, marginTop: 8 }}><b>Delivery:</b> <span style={styles.value}>{order.deliveryPerson.email}</span></p>}
    </div>
  );

  return (
    <div style={{ padding: 24, fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>🛒 OneCart Admin</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>

        {/* Analytics */}
        {analytics && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
            {[
              { label: "Total Orders", value: analytics.totalOrders },
              { label: "Delivered", value: analytics.deliveredOrders },
              { label: "Active Partners", value: analytics.activeDeliveryPartners },
              { label: "Total Earnings", value: `₹${analytics.totalEarnings}` },
              { label: "Avg Delivery", value: `${analytics.avgDeliveryTimeMinutes} min` },
            ].map(({ label, value }) => (
              <div key={label} style={{
                backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
                padding: "12px 18px", flex: "1 1 150px",
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* System toggles */}
        <div style={{ ...styles.card, marginBottom: 28, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: 6 }}>Accepting Orders</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: acceptingOrders ? "#059669" : "#dc2626", marginBottom: 10 }}>
              {acceptingOrders ? "● ON" : "● OFF"}
            </div>
            <button onClick={toggleAcceptingOrders} style={styles.actionBtn}>
              Turn {acceptingOrders ? "OFF" : "ON"}
            </button>
          </div>
          <div style={{ width: 1, backgroundColor: "#e5e7eb" }} />
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: 6 }}>Peak Mode</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: peakMode ? "#d97706" : "#9ca3af", marginBottom: 10 }}>
              {peakMode ? "● ON (+₹10)" : "● OFF"}
            </div>
            <button onClick={togglePeakMode} style={styles.actionBtn}>
              Turn {peakMode ? "OFF" : "ON"}
            </button>
          </div>
        </div>

        {/* Payouts */}
        <PayoutsSection baseUrl={BASE_URL} />

        {/* Delivery Approvals */}
        <h2 style={styles.sectionHeader}>🛂 Pending Approvals <span style={styles.badge}>{pendingDelivery.length}</span></h2>
        {pendingDelivery.length === 0 ? (
          <p style={styles.empty}>No pending approvals</p>
        ) : (
          pendingDelivery.map((user) => (
            <div key={user._id} style={styles.card}>
              <p style={styles.label}><b>Email:</b> <span style={styles.value}>{user.email}</span></p>
              <button onClick={() => approveDelivery(user.email)} style={styles.actionBtn}>Approve</button>
            </div>
          ))
        )}

        {/* New Orders */}
        <h2 style={styles.sectionHeader}>🆕 New Orders <span style={styles.badge}>{newOrders.length}</span></h2>
        {newOrders.length === 0 ? <p style={styles.empty}>No new orders</p> : newOrders.map(renderOrderCard)}

        {/* Ongoing */}
        <h2 style={styles.sectionHeader}>🚴 Ongoing Deliveries <span style={styles.badge}>{ongoingOrders.length}</span></h2>
        {ongoingOrders.length === 0 ? <p style={styles.empty}>No ongoing deliveries</p> : ongoingOrders.map(renderOrderCard)}

        {/* Completed */}
        <h2 style={styles.sectionHeader}>✅ Completed Orders <span style={styles.badge}>{completedOrders.length}</span></h2>
        {completedOrders.length === 0 ? <p style={styles.empty}>No completed orders</p> : completedOrders.map(renderOrderCard)}

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  overlay: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: "#f3f4f6", fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
  },
  loginBox: {
    backgroundColor: "#fff", padding: "40px 32px", borderRadius: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)", width: "100%", maxWidth: 360,
    display: "flex", flexDirection: "column", gap: 12,
  },
  loginTitle: { margin: 0, fontSize: 22, fontWeight: 700, textAlign: "center", color: "#111827" },
  loginSub: { margin: 0, color: "#6b7280", textAlign: "center", fontSize: 14 },
  input: {
    padding: "10px 14px", fontSize: 15, borderRadius: 8,
    border: "1px solid #d1d5db", outline: "none", width: "100%", boxSizing: "border-box",
    color: "#111827", backgroundColor: "#fff",
  },
  errorMsg: { color: "#e53e3e", fontSize: 13, margin: 0 },
  loginBtn: {
    padding: "10px 0", backgroundColor: "#111827", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 4,
  },
  logoutBtn: {
    padding: "6px 14px", backgroundColor: "#fff", border: "1px solid #d1d5db",
    borderRadius: 6, fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500,
  },
  card: {
    backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: 18, marginBottom: 14,
  },
  td: {
    padding: "6px 10px", borderBottom: "1px solid #f3f4f6",
    color: "#374151", fontSize: 14,
  },
  label: { margin: "4px 0", fontSize: 14, color: "#374151" },
  value: { color: "#111827" },
  sectionHeader: { fontSize: 17, fontWeight: 700, color: "#111827", marginTop: 32, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 },
  badge: {
    display: "inline-block", backgroundColor: "#e5e7eb", color: "#374151",
    fontSize: 12, fontWeight: 700, borderRadius: 20, padding: "2px 9px",
  },
  empty: { color: "#9ca3af", fontSize: 14, marginTop: 4 },
  actionBtn: {
    padding: "7px 16px", backgroundColor: "#111827", color: "#fff",
    border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", marginRight: 8,
  },
  ghostBtn: {
    padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: 7,
    backgroundColor: "#f9fafb", cursor: "pointer", fontSize: 12, color: "#374151", fontWeight: 500,
  },
  modalOverlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff", borderRadius: 12, padding: "28px 28px 24px",
    width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  },
};