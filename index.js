import express from "express";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import cors from 'cors'
dotenv.config();

const app = express()
app.use(express.json())
app.use(cors())
app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use("/", authRoutes)
app.use("/usuarios", authRoutes)



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
})