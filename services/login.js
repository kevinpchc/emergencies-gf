import { auth } from './firebase.js';
import { fetchSignInMethodsForEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Función para cerrar sesión
function logout() {
    // Mostrar el overlay y el loader
    const overlay = document.getElementById('overlay');
    const loader = document.getElementById('loader');
    if (overlay && loader) {
        overlay.style.display = 'block';
        loader.style.display = 'flex';
    }

    signOut(auth)
        .then(() => {
            console.log('Sesión cerrada correctamente');

            // Ocultar el overlay y el loader cuando la función termine
            if (overlay && loader) {
                overlay.style.display = 'none';
                loader.style.display = 'none';
            }

        //    alert('Sesión cerrada correctamente');
            window.location.href = '/index.html';
        })
        .catch((error) => {
            console.error('Error al cerrar sesión:', error);

            // Ocultar el overlay y el loader en caso de error
            if (overlay && loader) {
                overlay.style.display = 'none';
                loader.style.display = 'none';
            }

            alert('Error al cerrar sesión');
        });
}

// Asignar la función de cierre de sesión al botón con ID "cierrasesion"
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('cierrasesion'); // Selecciona el botón con ID "cierrasesion"
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); // Evita el comportamiento por defecto del botón
            logout(); // Llama a la función de cierre de sesión
        });
    } else {
        console.error('Botón de cierre de sesión no encontrado');
    }
});

// Código existente para inicio de sesión y registro
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Mostrar el overlay y el loader
    const overlay = document.getElementById('overlay');
    const loader = document.getElementById('loader');
    if (overlay && loader) {
        overlay.style.display = 'block';
        loader.style.display = 'flex';
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Inicio de sesión exitoso:', user);

            // Ocultar el overlay y el loader cuando la función termine
            if (overlay && loader) {
                overlay.style.display = 'none';
                loader.style.display = 'none';
            }

            // Redirigir según el tipo de usuario
            if (email === "kevinpchcrtg@gmail.com") {
                console.log('ingresa admin', user);
                window.location.href = './emergency/index.html';
            } else {
                console.log('no es admin', user);
                window.location.href = './emergency/index.html';
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error en el inicio de sesión:', errorCode, errorMessage);

            // Ocultar el overlay y el loader en caso de error
            if (overlay && loader) {
                overlay.style.display = 'none';
                loader.style.display = 'none';
            }

            // Manejar el caso de credenciales inválidas
            if (errorCode === 'auth/invalid-credential') {
                // Verificar si el correo existe en Firebase
                fetchSignInMethodsForEmail(auth, email)
                    .then((signInMethods) => {
                        if (signInMethods && signInMethods.length === 0) {
                            // El correo está registrado, pero la contraseña es incorrecta
                            alert('Verifica los datos ingresados y vuelve a intentarlo.');
                        } else {
                            // El correo no está registrado
                            alert('El correo electrónico no está registrado. Por favor, verifica tus datos.');
                        }
                    })
                    .catch((fetchError) => {
                        console.error('Error al verificar el correo:', fetchError);
                        alert('Error en el inicio de sesión: ' + errorMessage);
                    });
            } else {
                // Mostrar un mensaje genérico para otros errores
                alert('Error en el inicio de sesión: ' + errorMessage);
            }
        });
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Mostrar el overlay y el loader
    const overlay = document.getElementById('overlay');
    const loader = document.getElementById('loader');
    if (overlay && loader) {
        overlay.style.display = 'block';
        loader.style.display = 'flex';
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Usuario creado exitosamente:', user);

            // Ocultar el overlay y el loader cuando la función termine
            if (overlay && loader) {
                overlay.style.display = 'none';
                loader.style.display = 'none';
            }

            // Mostrar el successModal
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'block';
            }

            // Configurar el botón "Continuar" del successModal
            const continueButton = document.getElementById('continueButton');
            if (continueButton) {
                continueButton.addEventListener('click', function () {
                    // Ocultar el successModal
                    if (successModal) {
                        successModal.style.display = 'none';
                    }

                    // Redirigir a la pantalla de login inicial
                    window.location.href = '/index.html'; // Cambia esta ruta si es necesario
                });
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error en la creación de usuario:', errorCode, errorMessage);

            // Ocultar el overlay y el loader en caso de error
            if (overlay && loader) {
                overlay.style.display = 'none';
                loader.style.display = 'none';
            }


else {
                // Mostrar un mensaje genérico para otros errores
                alert('Error al crear el usuario: ' + errorMessage);
            }
        });
});