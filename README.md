# Clima DRY 🌦️

**Sistema de monitoreo y control climático**

Clima DRY es un proyecto orientado al monitoreo de condiciones climáticas y al control de un sistema de riel automatizado. Integra una interfaz de usuario, un servidor backend, una base de datos y componentes electrónicos para gestionar mediciones ambientales y ejecutar acciones de control.

## 📋 Descripción del proyecto

El objetivo de Clima DRY es desarrollar un sistema capaz de registrar variables ambientales, consultar pronósticos meteorológicos y gestionar el funcionamiento del riel de acuerdo con las condiciones detectadas y la configuración establecida.

El sistema contempla el almacenamiento de lecturas, el registro de eventos, la generación de alertas y la consulta de información histórica.

## 🏗️ Arquitectura del sistema

El proyecto se organiza en los siguientes componentes:

- **Frontend:** interfaz de usuario para visualizar información y utilizar las funciones del sistema.
- **Backend:** lógica de negocio y API para procesar solicitudes y comunicar los componentes.
- **Base de datos:** almacenamiento y gestión de usuarios, dispositivos, umbrales, lecturas, eventos, alertas, notificaciones, reportes y pronósticos climáticos.
- **Hardware:** componentes electrónicos y sensores destinados al monitoreo ambiental y al control del riel.

La comunicación entre los componentes se definirá de acuerdo con la arquitectura de integración del proyecto.

## 📁 Estructura del repositorio

```text
clima-dry/
├── Backend/
│   └── README.md
├── DataBase/
│   └── README.md
├── DOCS/
│   └── README.md
├── Frontend/
│   └── README.md
├── .gitignore
└── README.md
```

> La estructura mostrada corresponde a la organización inicial del repositorio. Los archivos y subdirectorios adicionales se incorporarán conforme avance la implementación.

## 🗄️ Base de datos

El diseño de la base de datos contempla 11 tablas:

1. `ROL`
2. `USUARIO`
3. `DISPOSITIVO`
4. `UMBRAL`
5. `LECTURA`
6. `EVENTO`
7. `ALERTA`
8. `DESTINATARIO`
9. `NOTIFICACION`
10. `REPORTE`
11. `PRONOSTICO_CLIMA`

El modelo contempla claves primarias, claves foráneas, restricciones de integridad y la separación entre las mediciones físicas y los pronósticos meteorológicos.

El gestor de base de datos se confirmará durante la implementación.

## 📚 Documentación

La carpeta `DOCS/` está destinada a la documentación técnica y académica del proyecto, incluidos los requisitos, diagramas y modelos de diseño que correspondan.

## 🚧 Estado del proyecto

**En desarrollo.** El proyecto avanza por etapas de análisis, diseño, implementación e integración de sus componentes.

## 👥 Colaboración

El repositorio se utiliza para organizar los archivos del proyecto y facilitar el trabajo colaborativo mediante Git y GitHub.

---

**Clima DRY** — Monitoreo inteligente, protección en cada clima.
