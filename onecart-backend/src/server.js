import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import outletRoutes from "./routes/outlet.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use("/outlets", outletRoutes);

console.log(process.env.MONGO_URI);
