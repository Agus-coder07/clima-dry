
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-registro");

    const nombre = document.getElementById("nombre");
    const apellido = document.getElementById("apellido");
    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");

    const ojo = document.getElementById("ojo");
    const cajaError = document.getElementById("registro-error");
    const cajaOk = document.getElementById("registro-ok");
    const boton = form.querySelector('button[type="submit"]');

    // Mostrar u ocultar contraseña
    if (ojo && contrasena) {
        ojo.addEventListener("click", () => {
            const mostrar = contrasena.type === "password";

            contrasena.type = mostrar ? "text" : "password";
            ojo.style.opacity = mostrar ? "1" : "0.6";
        });
    }

    // Enviar registro al backend
    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        limpiarMensajes();

        const datosUsuario = {
            nombre: nombre.value.trim(),
            apellido: apellido.value.trim(),
            correo: correo.value.trim(),
            password: contrasena.value
        };

        if (
            !datosUsuario.nombre ||
            !datosUsuario.apellido ||
            !datosUsuario.correo ||
            !datosUsuario.password
        ) {
            mostrarError("Por favor completa todos los campos.");
            return;
        }

        const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!patronCorreo.test(datosUsuario.correo)) {
            mostrarError("Escribe un correo electrónico válido.");
            return;
        }

        boton.disabled = true;

        try {
            const respuesta = await fetch("/api/registro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosUsuario)
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.mensaje || "No se pudo crear la cuenta."
                );
            }

            mostrarOk(
                datos.mensaje || "Cuenta creada correctamente. Ya puedes iniciar sesión."
            );

            form.reset();

        } catch (error) {
            mostrarError(
                error.message || "No se pudo conectar con el servidor."
            );
        } finally {
            boton.disabled = false;
        }
    });

    function mostrarError(texto) {
        cajaError.textContent = texto;
        cajaError.style.display = "block";
    }

    function mostrarOk(texto) {
        cajaOk.textContent = texto;
        cajaOk.style.display = "block";
    }

    function limpiarMensajes() {
        cajaError.textContent = "";
        cajaError.style.display = "none";

        cajaOk.textContent = "";
        cajaOk.style.display = "none";
    }
});
