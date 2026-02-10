import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.route.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import orderRoutes from "./routes/order.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import systemRoutes from "./routes/system.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/delivery", deliveryRoutes);
app.use("/system", systemRoutes); // ✅ THIS WAS MISSING

export default app;
