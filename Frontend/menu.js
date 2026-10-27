/* ============================================================
   MENU.JS  (compartido por el dashboard y las subpaginas)
   ------------------------------------------------------------
   Unica funcion: desplegar / contraer la barra de iconos.
   Al incluir este archivo en cualquier pagina, el boton ☰
   funciona igual en todas.
   ============================================================ */

const menuIconos    = document.getElementById("menu-iconos");
const botonDesplegar = document.getElementById("boton-desplegar");

if (botonDesplegar && menuIconos) {
    botonDesplegar.addEventListener("click", function () {
        menuIconos.classList.toggle("expandido");
    });
}
