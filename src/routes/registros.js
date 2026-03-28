import express from "express"
import { supabase } from "../supabase.js";

const router = express.Router()

router.get("/registros", async (req, res) => {
    const { data: registro, error } = await supabase
        .from('registros')
        .select('*, pases(nombre_visitante, apellido_visitante, telefono, motivo), usuarios(nombre_usuario)')
        .single()

    if (error) {
        console.log({ error });
        return res.status(500).json({ error: 'Error al obtener registro' })
    }

    return res.json(registro)
})

router.post("/registro/:id", async (req, res) => {
    const { id: id_pase } = req.params
    const { tipo, usuario_id, locacion_id } = req.body
    if (!tipo || !usuario_id || !locacion_id) {
        return res.status(400).json({ error: "Todos los campos son requeridos" })
    }

    if (!["entrada", "salida"].includes(tipo.toLowerCase())) {
        return res.status(400).json({ error: "El tipo debe ser 'entrada' o 'salida'" })
    }

    const { data: pase, error: paseError } = await supabase
        .from("pases")
        .select("*")
        .eq("id", id_pase)
        .single()

    if (paseError) {
        console.log({ paseError });
        return res.status(500).json({ error: "Error al obtener pase" })
    }

    if (!pase) {
        return res.status(404).json({ error: "Pase no encontrado" })
    }

    if (!pase.status) {
        return res.status(400).json({ error: "El pase no está activo" })
    }

    if (pase.duracion > 0) {
        const ahora = new Date()
        const fechaExpiracion = new Date(pase.created_at)

        if (pase.duracion_unidad === "horas") {
            fechaExpiracion.setHours(fechaExpiracion.getHours() + pase.duracion)
            if (ahora > fechaExpiracion) {
                return res.status(400).json({ error: "El pase ha expirado" })
            }
        } else if (pase.duracion_unidad === "dias") {
            const fechaExpiracion = new Date(pase.created_at)
            fechaExpiracion.setDate(fechaExpiracion.getDate() + pase.duracion)
            if (ahora > fechaExpiracion) {
                return res.status(400).json({ error: "El pase ha expirado" })
            }
        }
    }

    if (pase.duracion <= 0) {
        return res.status(400).json({ error: "La duración del pase no puede ser cero o negativa" })
    }


    const { data: nuevoRegistro, error } = await supabase
        .from("registros")
        .insert({
            pase_id: id_pase,
            tipo: tipo.toLowerCase(),
            usuario_id,
            locacion_id
        })
        .select("*")
        .single()

    if (error) {
        console.log({ error });
        return res.status(500).json({ error: "Error al crear registro" })
    }

    return res.status(201).json({ nuevoRegistro, message: "Registro creado exitosamente" })
})

export default router