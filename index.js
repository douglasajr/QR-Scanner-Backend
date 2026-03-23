import express from "express";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import pasesRoutes from "./src/routes/pases.js";
import cors from 'cors'
dotenv.config();

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use("/auth", authRoutes)
app.use("/", pasesRoutes)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
})