/* ============================================================
   SCRIPT DEL REGISTRO (solo diseno)
   ------------------------------------------------------------
   Hace:
     1. Mostrar / ocultar las dos contrasenas (botones del ojo).
     2. Avisar si las contrasenas coinciden.

   PARA EL BACKEND:
     - Mensajes: usa #registro-error (error) y #registro-ok (exito),
       agregandoles la clase 'visible'.
     - Para enviar sin recargar, captura el 'submit' del
       formulario #form-registro y usa fetch().
   ============================================================ */

// ---- 1. MOSTRAR / OCULTAR CONTRASENA ----
function configurarOjo(idOjo, idInput) {
    const ojo = document.getElementById(idOjo);
    const input = document.getElementById(idInput);
    ojo.addEventListener("click", function () {
        if (input.type === "password") {
            input.type = "text";
            ojo.style.opacity = "1";
        } else {
            input.type = "password";
            ojo.style.opacity = "0.6";
        }
    });
}

configurarOjo("ojo", "contrasena");
configurarOjo("ojo2", "contrasena2");


// ---- 2. VALIDAR QUE LAS CONTRASENAS COINCIDAN ----
const pass1 = document.getElementById("contrasena");
const pass2 = document.getElementById("contrasena2");
const aviso = document.getElementById("aviso-coincidencia");

function revisarCoincidencia() {
    if (pass2.value === "") {
        aviso.textContent = "";
        return;
    }
    if (pass1.value === pass2.value) {
        aviso.textContent = "\u2714 Las contrasenas coinciden";
        aviso.style.color = "#2e7d32";
    } else {
        aviso.textContent = "\u2716 Las contrasenas no coinciden";
        aviso.style.color = "#c0392b";
    }
}

pass1.addEventListener("input", revisarCoincidencia);
pass2.addEventListener("input", revisarCoincidencia);
