import express from "express"
import { supabase } from "../supabase.js";

const router = express.Router()

router.get("/departamentos", async (req, res) => {
    const { data: deptos, error } = await supabase
        .from("departamento")
        .select("*")

    if (error) {
        console.log('error', error)
        return res.status(500).json({ error: "Error al obtener los departamentos" })
    }
    return res.status(200).json(deptos)
})

export default router