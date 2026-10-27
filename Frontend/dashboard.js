/* ============================================================
   SCRIPT DEL DASHBOARD (solo diseno / interaccion)
   ------------------------------------------------------------
   NOTA: el desplegar/contraer el menu vive ahora en menu.js
   (compartido con las subpaginas). Aqui queda solo lo propio
   del dashboard: el boton de control manual.

   PARA EL BACKEND:
     - Para pintar los datos reales desde JS puedes usar:
         document.getElementById('valor-temperatura').textContent = 32;
         document.getElementById('valor-humedad').textContent = 45;
         document.getElementById('valor-estado-riel').textContent = 'Dentro';
         document.getElementById('valor-dia').textContent = 'Lunes';
         document.getElementById('valor-hora').textContent = '14:30';
         document.getElementById('nombre-usuario').textContent = 'admin';
   ============================================================ */

// ---- CONTROL MANUAL (boton) ----
const botonManual = document.getElementById("modo-manual");
const estadoModo  = document.getElementById("estado-modo");
const indicador   = document.getElementById("indicador-sistema");

botonManual.addEventListener("click", function () {
    // Alternamos el estado activado/desactivado
    const activo = botonManual.classList.toggle("activo");

    // Actualizamos el texto y el circulo indicador (verde = activo)
    estadoModo.textContent = activo ? "Activado" : "Desactivado";
    indicador.classList.toggle("activo", activo);

    // ----- PUNTO DE CONEXION CON EL BACKEND -----
    // Ejemplo (descomentar y ajustar la URL cuando exista el servidor):
    //
    // fetch('/api/modo-manual', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ activo: activo })
    // });
});
