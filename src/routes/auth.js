import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { supabase } from "../supabase.js";
const router = express.Router()

// Rutas de autenticación y gestión de usuarios
router.get("/usuarios", async (req, res) => {
    const { data: usuarios, error } = await supabase
        .from("usuarios")
        .select("id, nombre_usuario, rol_id, depto_id, activo, created_at, roles(nombre), departamento(nombre_depto)")
        .order("created_at", { ascending: false })
    if (error) {
        return res.status(500).json({ error: "Error al obtener usuarios" })
    }
    console.log(usuarios)
    res.json(usuarios)
})

// Ruta de login
router.post("/login", async (req, res) => {
    const { usuario, contrasenia } = req.body

    if (!usuario || !contrasenia) {
        return res.status(400).json({ error: "Nombre de usuario y contraseña son requeridos" })
    }

    const { data: user, error } = await supabase
        .from("usuarios")
        .select("*, roles(nombre), departamento(nombre_depto)")
        .eq("nombre_usuario", usuario)
        .eq("activo", true)
        .single()

    console.log("nombre buscado:", usuario)
    console.log("user:", user)
    console.log("error:", error)

    if (error || !user) {
        return res.status(401).json({ error: "Usuario no encontrado o inactivo" })
    }

    const isPasswordValid = await bcrypt.compare(contrasenia, user.contrasenia)

    if (!isPasswordValid) {
        return res.status(401).json({ error: "Contraseña incorrecta" })
    }

    const token = jwt.sign(
        {
            id: user.id,
            nombre_usuario: user.nombre_usuario,
            rol_id: user.rol_id,
            depto_id: user.depto_id
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    )

    res.json({
        token,
        user: {
            id: user.id,
            nombre_usuario: user.nombre_usuario,
            rol_id: user.rol_id,
            depto_id: user.depto_id
        },
        message: "Login exitoso"
    })


})

// Ruta para crear un nuevo usuario
router.post("/usuarios", async (req, res) => {
    const { nombre_usuario, contrasenia, rol_id, depto_id } = req.body

    if (!nombre_usuario || !contrasenia || !rol_id || !depto_id) {
        return res.status(400).json({ error: "Todos los campos son requeridos" })
    }

    const hashsedPassword = await bcrypt.hash(contrasenia, 10)

    const { data: nuevoUSuario, error } = await supabase
        .from("usuarios")
        .insert({
            nombre_usuario,
            contrasenia: hashsedPassword,
            rol_id,
            depto_id,
            activo: true
        })
        .select("*")
        .single()

    if (error) {
        if (error.code === "23505") {
            return res.status(400).json({ error: "El nombre de usuario ya existe" })
        }
        console.log('error', error)
        return res.status(500).json({ error: "Error al crear usuario" })
    }

    console.log("Nuevo usuario creado:", nuevoUSuario)

    res.status(201).json({ nuevoUSuario, message: "Usuario creado exitosamente" })
})

// Ruta para actualizar un usuario existente
router.put("/usuarios/:id", async (req, res) => {
    const { id } = req.params
    const { nombre_usuario, contrasenia, rol_id, depto_id, activo } = req.body

    const campos = {}
    if (nombre_usuario) campos.nombre_usuario = nombre_usuario
    if (contrasenia) campos.contrasenia = await bcrypt.hash(contrasenia, 10)
    if (rol_id) campos.rol_id = rol_id
    if (depto_id) campos.depto_id = depto_id
    if (activo !== undefined) campos.activo = activo

    const { data: usuarioActualizado, error } = await supabase
        .from("usuarios")
        .update(campos)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        if (error.code === "23505") {
            return res.status(400).json({ error: "El nombre de usuario ya existe" })
        }
        console.log('error', error)
        return res.status(500).json({ error: "Error al actualizar usuario" })
    }

    console.log("Usuario actualizado:", usuarioActualizado)

    res.json({ usuarioActualizado, message: "Usuario actualizado exitosamente" })
})


export default router




