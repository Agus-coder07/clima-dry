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
    admin: "dashboard-admin.html",
    tecnico: "dashboard-tecnico.html",
    cliente: "dashboard-cliente.html",
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
function requiereRol(rol) {
    return (req, res, next) => {
        if (!req.session.usuario) {
            return res.redirect("/login.html");
        }

        if (req.session.usuario.rol !== rol) {
            return res.redirect("/" + DASHBOARDS[req.session.usuario.rol]);
        }

        next();
    };
}

for (const [rol, archivo] of Object.entries(DASHBOARDS)) {
    app.get("/" + archivo, requiereRol(rol), (req, res) => {
        res.sendFile(path.join(frontendPath, archivo));
    });
}

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
            "SELECT id, nombre, correo, password, rol FROM usuarios WHERE correo = $1",
            [correo]
        );

        const usuario = resultado.rows[0];

        // Mismo mensaje en ambos casos para no revelar si el correo existe
        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
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
            id: usuario.id,
            nombre: usuario.nombre,
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