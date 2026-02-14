import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import outletRoutes from "./routes/outlet.routes.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js";



const PORT = process.env.PORT || 5000;

connectDB();

/* ✅ ROUTES MUST COME BEFORE listen */
app.use("/outlets", outletRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
