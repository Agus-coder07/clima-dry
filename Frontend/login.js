
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-login");
    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");
    const ojo = document.getElementById("ojo");
    const cajaError = document.getElementById("login-error");
    const boton = form.querySelector('button[type="submit"]');

    // Mostrar u ocultar contraseña
    ojo.addEventListener("click", () => {
        const mostrar = contrasena.type === "password";
        contrasena.type = mostrar ? "text" : "password";
        ojo.style.opacity = mostrar ? "1" : "0.6";
    });

    // Enviar credenciales al backend
    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        cajaError.textContent = "";
        cajaError.style.display = "none";
        boton.disabled = true;

        try {
            const respuesta = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    correo: correo.value.trim(),
                    password: contrasena.value
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.mensaje || "No se pudo iniciar sesión");
            }

            window.location.href = datos.redirigir;

        } catch (error) {
            cajaError.textContent =
                error.message || "No se pudo conectar con el servidor";

            cajaError.style.display = "block";
        } finally {
            boton.disabled = false;
        }
    });
});
