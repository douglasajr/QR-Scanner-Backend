import express from "express"
import { supabase } from "../supabase.js";

const router = express.Router()

router.get("/roles", async (req, res) => {
    const { data: roles, error } = await supabase
        .from("roles")
        .select("*")

    if (error) {
        console.log('error', error)
        return res.status(500).json({ error: "Error al obtener los roles" })
    }
    return res.status(200).json(roles)
})

export default router