const express = require("express");
const connectDB = require("../config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const companyRoutes = require("../routes/companyRoute");
const authRoute = require("../routes/authRoute");
const productRoute = require("../routes/productRoute");
const transactionRoute = require("../routes/transactionRoute");
const path = require("path");

dotenv.config();

connectDB();

const app = express();
app.use(express.json());

app.use(cors({origin:"https://dms-frontend-iusl.vercel.app, http://localhost:5173", optionsSuccessStatus: 200}));
// Routes
app.use("/api/companies", companyRoutes);
app.use("/api/auth", authRoute);
app.use("/api", productRoute);
app.get("/", (req, res) => {
    res.send("Server is running");
})
app.use("/api", transactionRoute);
app.use("/api", transactionRoute);

app.use("../uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
