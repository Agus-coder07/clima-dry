
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const pool = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const frontendPath = path.join(__dirname, "../Frontend");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir los archivos del frontend sin modificar su estructura
app.use(express.static(frontendPath));

// Resolver las rutas CSS y JS que utiliza el HTML actual
app.get("/css/:archivo", (req, res, next) => {
    const archivo = path.basename(req.params.archivo);
    const ruta = path.join(frontendPath, archivo);

    if (fs.existsSync(ruta) && fs.statSync(ruta).isFile()) {
        return res.sendFile(ruta);
    }

    next();
});

app.get("/js/:archivo", (req, res, next) => {
    const archivo = path.basename(req.params.archivo);
    const ruta = path.join(frontendPath, archivo);

    if (fs.existsSync(ruta) && fs.statSync(ruta).isFile()) {
        return res.sendFile(ruta);
    }

    next();
});

// Página principal
app.get("/", (req, res) => {
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
            ...resultado.rows[0]
        });
    } catch (error) {
        console.error("Error de PostgreSQL:", error.message);

        res.status(500).json({
            conectado: false,
            mensaje: "No se pudo conectar con PostgreSQL"
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de CLIMA-DRY en http://localhost:${PORT}`);
});
