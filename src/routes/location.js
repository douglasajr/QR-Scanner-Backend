import express from "express"
import { supabase } from "../supabase.js";

const router = express.Router()

router.get("/location", async (req, res) => {
    const { data: locaciones, error } = await supabase
        .from("location")
        .select("*")
        .single()

    if (error) {
        console.log('error', error)
        return res.status(500).json({ error: "Error al obtener locaciones" })
    }
    return res.status(200).json(locaciones)
})

export default router