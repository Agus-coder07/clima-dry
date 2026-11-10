require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const pool = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const frontendPath = path.join(__dirname, "../Frontend");

// Dashboard que corresponde a cada rol (ajusta los nombres a tus archivos)
const DASHBOARDS = {
    Administrador: "dashboard.html",
    Operador: "dashboard.html",
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "cambia-este-secreto",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 8, // 8 horas
        },
    })
);

// Protección de dashboards: va ANTES de express.static
// Protección del dashboard: va ANTES de express.static
function requiereSesion(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect("/login.html");
    }

    next();
}

app.get("/dashboard.html", requiereSesion, (req, res) => {
    res.sendFile(path.join(frontendPath, "dashboard.html"));
});


// Servir los archivos del frontend sin modificar su estructura
app.use(express.static(frontendPath));

// Resuelve /css/archivo y /js/archivo buscando primero en la subcarpeta
// (Frontend/css, Frontend/js) y después en la raíz de Frontend
function servirRecurso(carpeta) {
    return (req, res, next) => {
        const archivo = path.basename(req.params.archivo);
        const rutas = [
            path.join(frontendPath, carpeta, archivo),
            path.join(frontendPath, archivo),
        ];

        const ruta = rutas.find(
            (r) => fs.existsSync(r) && fs.statSync(r).isFile()
        );

        if (ruta) {
            return res.sendFile(ruta);
        }

        next();
    };
}

app.get("/css/:archivo", servirRecurso("css"));
app.get("/js/:archivo", servirRecurso("js"));

// Página principal
app.get("/", (req, res) => {
    if (req.session.usuario) {
        return res.redirect("/" + DASHBOARDS[req.session.usuario.rol]);
    }
    res.sendFile(path.join(frontendPath, "login.html"));
});

// Comprobar la conexión con PostgreSQL
app.get("/api/health/db", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT current_database() AS base_datos, NOW() AS fecha_servidor"
        );

        res.json({
            conectado: true,
            ...resultado.rows[0],
        });
    } catch (error) {
        console.error("Error de PostgreSQL:", error.message);

        res.status(500).json({
            conectado: false,
            mensaje: "No se pudo conectar con PostgreSQL",
        });
    }
});

// REGISTRO DE NUEVOS USUARIOS
app.post("/api/registro", async (req, res) => {
    try {
        const { nombre, apellido, correo, password } = req.body || {};

        // Validar que todos los campos sean texto
        if (
            typeof nombre !== "string" ||
            typeof apellido !== "string" ||
            typeof correo !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios."
            });
        }

        const nombreLimpio = nombre.trim();
        const apellidoLimpio = apellido.trim();
        const correoLimpio = correo.trim().toLowerCase();

        // Validar campos vacíos y longitudes
        if (
            !nombreLimpio ||
            !apellidoLimpio ||
            !correoLimpio ||
            !password
        ) {
            return res.status(400).json({
                mensaje: "Por favor completa todos los campos."
            });
        }

        if (nombreLimpio.length > 50 || apellidoLimpio.length > 50) {
            return res.status(400).json({
                mensaje: "El nombre y el apellido no deben superar 50 caracteres."
            });
        }

        if (correoLimpio.length > 254) {
            return res.status(400).json({
                mensaje: "El correo electrónico es demasiado largo."
            });
        }

        const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!patronCorreo.test(correoLimpio)) {
            return res.status(400).json({
                mensaje: "Escribe un correo electrónico válido."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                mensaje: "La contraseña debe tener al menos 8 caracteres."
            });
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                mensaje: "La contraseña es demasiado larga."
            });
        }

        // Cifrar la contraseña antes de guardarla
        const contrasenaCifrada = await bcrypt.hash(password, 12);

        // El rol Operador se asigna exclusivamente desde el servidor
        const resultado = await pool.query(
            `INSERT INTO public.usuario (
                id_rol,
                nombre,
                apellido,
                correo,
                contrasena_cifrada
            )
            SELECT
                id_rol,
                $1,
                $2,
                $3,
                $4
            FROM public.rol
            WHERE nombre = 'Operador'
            RETURNING id_usuario, nombre, apellido, correo`,
            [
                nombreLimpio,
                apellidoLimpio,
                correoLimpio,
                contrasenaCifrada
            ]
        );

        if (resultado.rowCount === 0) {
            console.error("No se encontró el rol Operador en la base de datos.");

            return res.status(500).json({
                mensaje: "No se pudo completar el registro. Verifica la configuración de roles."
            });
        }

        return res.status(201).json({
            mensaje: "Cuenta creada correctamente. Ya puedes iniciar sesión.",
            usuario: resultado.rows[0]
        });

    } catch (error) {
        // Correo duplicado
        if (error.code === "23505") {
            return res.status(409).json({
                mensaje: "Ese correo electrónico ya está registrado."
            });
        }

        console.error("Error al registrar usuario:", error.message);

        return res.status(500).json({
            mensaje: "Ocurrió un error al crear la cuenta."
        });
    }
});



// Iniciar sesión
app.post("/api/login", async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res
                .status(400)
                .json({ mensaje: "Correo y contraseña son obligatorios" });
        }

        const resultado = await pool.query(
    `SELECT
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.correo,
        u.contrasena_cifrada,
        r.nombre AS rol
     FROM public.usuario AS u
     INNER JOIN public.rol AS r
        ON u.id_rol = r.id_rol
     WHERE LOWER(u.correo) = LOWER($1)
     LIMIT 1`,
    [correo.trim()]
);

const usuario = resultado.rows[0];


        // Mismo mensaje en ambos casos para no revelar si el correo existe
        if (!usuario || !(await bcrypt.compare(password, usuario.contrasena_cifrada))){
            return res
                .status(401)
                .json({ mensaje: "Correo o contraseña incorrectos" });
        }

        const destino = DASHBOARDS[usuario.rol];

        if (!destino) {
            return res
                .status(403)
                .json({ mensaje: "Tu usuario no tiene un rol válido" });
        }

        req.session.usuario = {
    id: usuario.id_usuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correo: usuario.correo,
    rol: usuario.rol,
};

        res.json({
            mensaje: "Inicio de sesión correcto",
            usuario: req.session.usuario,
            redirigir: "/" + destino,
        });
    } catch (error) {
        console.error("Error en login:", error.message);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// Datos del usuario con sesión activa
app.get("/api/sesion", (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ mensaje: "No has iniciado sesión" });
    }
    res.json({ usuario: req.session.usuario });
});

// Cerrar sesión
app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ mensaje: "Sesión cerrada" });
    });
});

// Ruta de API inexistente
app.use("/api", (req, res) => {
    res.status(404).json({ mensaje: "Ruta de API no encontrada" });
});

// Manejador
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor AXIS ejecutándose en http://localhost:${PORT}`);
});