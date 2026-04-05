import express from "express";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import pasesRoutes from "./src/routes/pases.js";
import registrosRoutes from "./src/routes/registros.js";
import locationRoutes from "./src/routes/location.js";
import rolesRoutes from "./src/routes/roles.js";
import deptosRoutes from "./src/routes/departamentos.js";

import cors from 'cors'
dotenv.config();

const app = express()
app.use(cors({ origin: '*' }))
// app.use(cors({ origin: 'https://lorrie-flecky-totally.ngrok-free.dev' }))

app.use(express.json())
app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use("/auth", authRoutes)
app.use("/", pasesRoutes)
app.use("/", registrosRoutes)
app.use("/", locationRoutes)
app.use("/", rolesRoutes)
app.use("/", deptosRoutes)


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
})