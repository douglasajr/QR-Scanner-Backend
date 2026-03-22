import express from "express"
import { supabase } from "../supabase.js";

const router = express.Router()



router.get("/pases", async (req, res) => {
    const { data: pases, error } = await supabase
        .from("pases")
        .select("*, tipo_pase(id, nombre_pase)")
        .order("created_at", { ascending: false })

    if (error) {
        console.log('error', error)
        return res.status(500).json({ error: "Error al obtener pases" })
    }
    return res.status(200).json( pases )
})

router.post("/pases", async (req, res) => {
    const { tipo_pase_id, nombre_visitante, apellido_visitante, telefono, motivo, duracion, duracion_unidad, creado_por, dni } = req.body
    console.log('datos recibidos:', req.body) // Agrega este log para verificar los datos recibidos
    if (!nombre_visitante || !apellido_visitante || !tipo_pase_id || !telefono || !motivo || !duracion || !duracion_unidad || !creado_por || !dni) {
        return res.status(400).json({ error: "Todos los campos son requeridos" })
    }

    const { data: nuevoPase, error } = await supabase
        .from("pases")
        .insert({
            tipo_pase_id,
            nombre_visitante,
            apellido_visitante,
            telefono,
            motivo,
            creado_por,
            duracion,
            duracion_unidad,
            dni,
        })
        .select("*")
        .single()

    if (error) {
        console.log('error', error)
        return res.status(500).json({ error: "Error al crear pase" })
    }
    return res.status(201).json({ nuevoPase, message: "Pase creado exitosamente" })

})

router.get("/pases/:id", async (req, res) => {
    const { id } = req.params

    const { data: pase, error } = await supabase
        .from("pases")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {
        console.log('error', error)
        return res.status(500).json({ error: "Error al obtener pase" })
    }
    if (!pase) {
        return res.status(404).json({ error: "Pase no encontrado" })
    }
    return res.status(200).json({ pase })
})

router.patch("/pases/:id", async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    const { data: paseActualizado, error } = await supabase
        .from("pases")
        .update({
            status
        })
        .eq("id", id)
        .select("*")
        .single()

    if (error) {
        console.log('error', error)
        return res.status(500).json({ error: "Error al actualizar pase" })
    }
    if (!paseActualizado) {
        return res.status(404).json({ error: "Pase no encontrado" })
    }
    return res.status(200).json({ paseActualizado, message: "Pase actualizado exitosamente" })
})
export default router