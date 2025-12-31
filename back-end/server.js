import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./Database/Connetion.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors())
app.use(express.json());

connectDB()


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
