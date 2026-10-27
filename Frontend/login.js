/* ============================================================
   SCRIPT DEL LOGIN / ACCESO (solo diseno)
   ------------------------------------------------------------
   Solo hace una cosa: mostrar / ocultar la contrasena.

   PARA EL BACKEND:
     - Para mostrar un error de credenciales:
         const e = document.getElementById('login-error');
         e.textContent = 'Usuario o contrasena incorrectos';
         e.classList.add('visible');
     - Para enviar sin recargar, captura el 'submit' del
       formulario #form-login y usa fetch().
   ============================================================ */

const ojo = document.getElementById("ojo");
const input = document.getElementById("contrasena");

ojo.addEventListener("click", function () {
    if (input.type === "password") {
        input.type = "text";
        ojo.style.opacity = "1";
    } else {
        input.type = "password";
        ojo.style.opacity = "0.6";
    }
});
