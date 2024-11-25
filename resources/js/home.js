document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.sessionData === 'undefined') {
        console.error('Los datos de sesión no están disponibles.');
        return;
    }

    const { token, user, validateTokenUrl, loginUrl } = window.sessionData;

    // Redirigir si no hay token
    if (!token) {
        console.log('Token no disponible. Redirigiendo...');
        window.location.href = loginUrl;
        return;
    }

    // Actualizar elementos en el DOM
    const welcomeText = document.getElementById('welcomeText');
    const emailText = document.getElementById('emailText');
    const userIdText = document.getElementById('userIdText');
    const rolldText = document.getElementById('rolldText');
    const tokenText = document.getElementById('tokenText');
    const root = document.getElementById('root');
    const tabla = document.getElementById('tabla');

    if (user) {
        welcomeText.textContent = `Bienvenido(a), ${user.name || 'Usuario desconocido'}`;
        emailText.textContent = user.email || 'No disponible';
        userIdText.textContent = user.id || 'No disponible';
        rolldText.textContent = user.role || 'No disponible';

        // Mostrar/ocultar elementos según el rol
        if (user.role === 'admin') {
            root.style.display = 'block';
            tabla.style.display = 'block';
        } else if (user.role === 'user') {
            root.style.display = 'none';
            tabla.style.display = 'block';
        }
    } else {
        welcomeText.textContent = 'Bienvenido, Usuario desconocido';
        emailText.textContent = 'No disponible';
        userIdText.textContent = 'No disponible';
    }

    if (token) {
        tokenText.textContent = token;
    } else {
        tokenText.textContent = 'No se proporcionó un token.';
    }

    // Validar el token
    axios
        .post(validateTokenUrl, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            console.log('Token válido:', response.data.message);
        })
        .catch(error => {
            if (error.response && error.response.status === 401) {
                console.warn('Token inválido o expirado. Redirigiendo a login...');
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                window.location.href = loginUrl;
            } else {
                console.error('Error al validar el token:', error);
            }
        });

    // Manejar el cierre de sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            console.log('Sesión cerrada. Redirigiendo a login...');
            window.location.href = loginUrl;
        });
    }
});
