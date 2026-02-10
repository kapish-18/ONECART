import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import outletRoutes from "./routes/outlet.routes.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use("/outlets", outletRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes);

console.log(process.env.MONGO_URI);
