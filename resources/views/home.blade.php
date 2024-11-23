@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col">
            <div class="card">
                <div class="card-header text-end">
                    <button id="logoutBtn" class="btn btn-danger">Cerrar sesión</button>
                </div>
                <div class="card-body">
                    <div class="alert alert-success">
                        Bienvenido a la plataforma.
                    </div>

                    <h5 id="welcomeText">Bienvenido, Usuario desconocido</h5>
                    <p><strong>Correo:</strong> <span id="emailText">No disponible</span></p>
                    <p><strong>ID de Usuario:</strong> <span id="userIdText">No disponible</span></p>

                    <p><strong>Tu token:</strong> <code id="tokenText">No se proporcionó un token.</code></p>

                </div>
            </div>


    </div>
</div>
@endsection

<script>
    document.addEventListener('DOMContentLoaded', function () {

        const storedToken = localStorage.getItem('authToken');
        const sessionToken = @json(session('token'));
        const sessionUser = @json(session('user'));

        // Comprobación de tokens y redirección
        if (!storedToken && !sessionToken) {
            console.log('No se encontró un token en localStorage ni en la sesión. Redirigiendo al login...');
            window.location.href = '/login';
            return;
        }

        // Guardar token en localStorage si solo existe en la sesión
        if (!storedToken && sessionToken) {
            localStorage.setItem('authToken', sessionToken);
            console.log('Token de la sesión guardado en localStorage:', sessionToken);
        }

        if (!localStorage.getItem('authUser') && sessionUser) {
            localStorage.setItem('authUser', JSON.stringify(sessionUser));
            console.log('Datos del usuario guardados en localStorage:', sessionUser);
        }

        const user = JSON.parse(localStorage.getItem('authUser'));
        const token = localStorage.getItem('authToken');

        const welcomeText = document.getElementById('welcomeText');
        const emailText = document.getElementById('emailText');
        const userIdText = document.getElementById('userIdText');
        const tokenText = document.getElementById('tokenText');

        if (user) {
            welcomeText.textContent = `Bienvenido, ${user.name || 'Usuario desconocido'}`;
            emailText.textContent = user.email || 'No disponible';
            userIdText.textContent = user.id || 'No disponible';
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
        const tokenToValidate = token;
        axios.post('{{ url('api/validate-token') }}', {}, {
            headers: {
                'Authorization': `Bearer ${tokenToValidate}`,
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
                window.location.href = '/login';
            } else {
                console.error('Error al validar el token:', error);
            }
        });

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                console.log('Sesión cerrada. Redirigiendo a login...');
                window.location.href = '/login';
            });
        }
    });
</script>
