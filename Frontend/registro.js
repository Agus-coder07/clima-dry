/* ============================================================
   REGISTRO.JS (solo diseno) - AXIS
   ------------------------------------------------------------
   Logica minima de la pantalla de registro:
     1) Boton "ojo" para mostrar/ocultar la contrasena.
     2) Validacion basica en el navegador (campos vacios y
        formato de correo) antes de enviar.

   Se quito el "confirmar contrasena", por eso ya NO hay
   contrasena2, ojo2 ni aviso-coincidencia.

   >>> PUNTO DE CONEXION BACKEND <<<
   Donde dice "ENVIAR AL BACKEND" tu companero reemplaza el
   bloque por una llamada real (fetch) o deja que el <form>
   haga el POST a la URL del servidor.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    // --- Referencias a los elementos de la pantalla ---
    var form      = document.getElementById("form-registro");
    var nombre    = document.getElementById("nombre");
    var apellido  = document.getElementById("apellido");
    var correo    = document.getElementById("correo");
    var telefono  = document.getElementById("telefono");
    var usuario   = document.getElementById("usuario");
    var contrasena= document.getElementById("contrasena");
    var ojo       = document.getElementById("ojo");
    var cajaError = document.getElementById("registro-error");
    var cajaOk    = document.getElementById("registro-ok");

    // --- 1) Mostrar / ocultar contrasena con el boton del ojo ---
    if (ojo && contrasena) {
        ojo.addEventListener("click", function () {
            contrasena.type = (contrasena.type === "password") ? "text" : "password";
        });
    }

    // --- 2) Validacion basica al enviar el formulario ---
    if (form) {
        form.addEventListener("submit", function (evento) {
            evento.preventDefault();   // evita recargar la pagina (solo diseno)
            limpiarMensajes();

            // Campos obligatorios vacios
            if (!nombre.value || !apellido.value || !correo.value ||
                !telefono.value || !usuario.value || !contrasena.value) {
                mostrarError("Por favor completa todos los campos.");
                return;
            }

            // Formato de correo sencillo
            var patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!patronCorreo.test(correo.value)) {
                mostrarError("Escribe un correo valido.");
                return;
            }

            // ============================================
            //  >>> ENVIAR AL BACKEND <<<
            //  Aqui tu companero conecta el servidor, ej:
            //
            //  fetch("/registro", {
            //      method: "POST",
            //      headers: { "Content-Type": "application/json" },
            //      body: JSON.stringify({
            //          nombre:    nombre.value,
            //          apellido:  apellido.value,
            //          correo:    correo.value,
            //          telefono:  telefono.value,
            //          usuario:   usuario.value,
            //          contrasena: contrasena.value
            //      })
            //  });
            // ============================================

            // Mensaje de exito de ejemplo (solo diseno)
            mostrarOk("Cuenta creada (demo). Conecta el backend aqui.");
        });
    }

    // --- Utilidades para mostrar mensajes ---
    function mostrarError(texto) {
        if (cajaError) { cajaError.textContent = texto; cajaError.style.display = "block"; }
    }
    function mostrarOk(texto) {
        if (cajaOk) { cajaOk.textContent = texto; cajaOk.style.display = "block"; }
    }
    function limpiarMensajes() {
        if (cajaError) { cajaError.textContent = ""; cajaError.style.display = "none"; }
        if (cajaOk)    { cajaOk.textContent = "";    cajaOk.style.display = "none"; }
    }
});
