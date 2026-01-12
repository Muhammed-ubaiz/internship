import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./Database/Connetion.js";
import adminRoutes from "./Routes/AdminRoutes.js";
import studentroutes from "./Routes/StudentRoutes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

connectDB();

app.use("/admin", adminRoutes);
app.use("/student",studentroutes)



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
