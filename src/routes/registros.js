import express from "express"
import { supabase } from "../supabase.js";

const router = express.Router()

router.get("/registros/stats", async (req, res) => {
    const { data: registros, error } = await supabase
        .from("registros")
        .select("*")

    if (error) {
        console.log({ error });
        return res.status(500).json({ error: "Error al obtener estadísticas" })
    }

    const totalRegistros = registros.length
    const registrosEntrada = registros.filter(registro => registro.tipo === "entrada").length
    const registrosSalida = registros.filter(registro => registro.tipo === "salida").length

    console.log({ totalRegistros, registrosEntrada, registrosSalida })

    return res.json({
        totalRegistros,
        registrosEntrada,
        registrosSalida
    })
})

router.get("/registros", async (req, res) => {
    const { data: registro, error } = await supabase
        .from('registros')
        .select('*, pases(nombre_visitante, apellido_visitante, telefono, motivo, dni, codigo), usuarios(nombre_usuario), location(nombre_location)')


    if (error) {
        console.log({ error });
        return res.status(500).json({ error: 'Error al obtener registro' })
    }

    return res.json(registro)
})

router.post("/registro", async (req, res) => {
    const { id_pase, tipo, usuario_id, locacion_id } = req.body
    if (!id_pase || !tipo || !usuario_id || !locacion_id) {
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

router.get("/registros/stats/daily", async (req, res) => {
    const hoy = new Date()
    const diaSemana = hoy.getDay()
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1

    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - diasDesdeLunes)
    lunes.setHours(0, 0, 0, 0)

    const domingo = new Date(lunes)
    domingo.setDate(lunes.getDate() + 6)
    domingo.setHours(23, 59, 59, 999)

    const { data: registros, error } = await supabase
        .from("registros")
        .select("*")
        .gte("created_at", lunes.toISOString())
        .lte("created_at", domingo.toISOString())

    if (error) {
        console.log({ error })
        return res.status(500).json({ error: "Error al obtener estadísticas diarias" })
    }

    const diasSemana = [
        { label: "Lunes",     entradas: 0, salidas: 0 },
        { label: "Martes",    entradas: 0, salidas: 0 },
        { label: "Miercoles", entradas: 0, salidas: 0 },
        { label: "Jueves",    entradas: 0, salidas: 0 },
        { label: "Viernes",   entradas: 0, salidas: 0 },
        { label: "Sabado",    entradas: 0, salidas: 0 },
        { label: "Domingo",   entradas: 0, salidas: 0 },
    ]

    const mapDia = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 }

    let totalEntradas = 0
    let totalSalidas = 0
    
    registros.forEach(registro => {
        // Convertir UTC a hora local de Honduras (UTC-6)
        const fechaUTC = new Date(registro.created_at)
        const fechaHonduras = new Date(fechaUTC.getTime() - (6 * 60 * 60 * 1000))
        const indice = mapDia[fechaHonduras.getDay()]

        if (registro.tipo === "entrada") {
            diasSemana[indice].entradas++
            totalEntradas++
        } else if (registro.tipo === "salida") {
            diasSemana[indice].salidas++
            totalSalidas++
        }
    })

    const accessData = [
        { label: "Entradas", count: totalEntradas, color: "#0a873f" },
        { label: "Salidas",  count: totalSalidas,  color: "#FF5252" },
    ]

    return res.json({ dailyData: diasSemana, accessData })
})

export default router