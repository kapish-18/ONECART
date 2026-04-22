import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.route.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import orderRoutes from "./routes/order.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import systemRoutes from "./routes/system.routes.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js"; 
import adminUserRoutes from "./routes/admin.users.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminPayoutsRoutes from "./routes/admin.payouts.routes.js";
import publicStatsRoutes from "./routes/public.stats.route.js";

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */
app.use("/health", healthRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/admin/users", adminUserRoutes);
app.use("/orders", orderRoutes);
app.use("/delivery", deliveryRoutes);
app.use("/payment", paymentRoutes);
app.use("/system", systemRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes); 
app.use("/admin/payouts", adminPayoutsRoutes);
app.use("/stats", publicStatsRoutes);

export default app;
