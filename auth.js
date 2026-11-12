/*
  Prototipo de autenticación SIN servidor.
  Guarda los usuarios en localStorage del navegador.
  IMPORTANTE: las contraseñas se guardan en texto plano. Esto es solo para
  una demo; en un proyecto real la autenticación va en un backend con hash.
*/
(function () {
    var CLAVE_USUARIOS = 'sugarrush_usuarios';
    var CLAVE_SESION = 'sugarrush_sesion';

    function leer(clave, porDefecto) {
        try {
            var v = localStorage.getItem(clave);
            return v ? JSON.parse(v) : porDefecto;
        } catch (e) {
            return porDefecto;
        }
    }
    function guardar(clave, valor) {
        localStorage.setItem(clave, JSON.stringify(valor));
    }

    function mostrarMensaje(texto, ok) {
        var m = document.getElementById('mensaje');
        if (!m) return;
        m.textContent = texto;
        m.className = 'mensaje' + (ok ? ' ok' : '');
    }

    function marcarInvalido(idInput, invalido) {
        var input = document.getElementById(idInput);
        if (input) input.closest('.campo').classList.toggle('invalido', invalido);
    }

    function correoValido(correo) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    }

    // --- Mostrar / ocultar contraseña ---
    document.querySelectorAll('.ver-clave').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var input = document.getElementById(btn.dataset.ver);
            var visible = input.type === 'text';
            input.type = visible ? 'password' : 'text';
            btn.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
            btn.firstElementChild.className = visible ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
        });
    });

    // --- Registro ---
    var formRegistro = document.getElementById('form-registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', function (e) {
            e.preventDefault();
            var nombre = document.getElementById('nombre').value.trim();
            var correo = document.getElementById('correo').value.trim().toLowerCase();
            var clave = document.getElementById('clave').value;
            var clave2 = document.getElementById('clave2').value;
            var terminos = document.getElementById('terminos').checked;

            ['nombre', 'correo', 'clave', 'clave2'].forEach(function (id) { marcarInvalido(id, false); });

            if (!nombre) { marcarInvalido('nombre', true); return mostrarMensaje('Escribe tu nombre.'); }
            if (!correoValido(correo)) { marcarInvalido('correo', true); return mostrarMensaje('Escribe un correo válido, por ejemplo nombre@correo.com.'); }
            if (clave.length < 6) { marcarInvalido('clave', true); return mostrarMensaje('La contraseña debe tener al menos 6 caracteres.'); }
            if (clave !== clave2) { marcarInvalido('clave2', true); return mostrarMensaje('Las contraseñas no coinciden.'); }
            if (!terminos) return mostrarMensaje('Acepta los términos y condiciones para continuar.');

            var usuarios = leer(CLAVE_USUARIOS, []);
            var existe = usuarios.some(function (u) { return u.correo === correo; });
            if (existe) { marcarInvalido('correo', true); return mostrarMensaje('Ese correo ya tiene una cuenta. Inicia sesión.'); }

            usuarios.push({ nombre: nombre, correo: correo, clave: clave });
            guardar(CLAVE_USUARIOS, usuarios);
            mostrarMensaje('Cuenta creada. Te llevamos a iniciar sesión...', true);
            setTimeout(function () { window.location.href = 'login.html'; }, 1200);
        });
    }

    // --- Login ---
    var formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', function (e) {
            e.preventDefault();
            var correo = document.getElementById('correo').value.trim().toLowerCase();
            var clave = document.getElementById('clave').value;

            ['correo', 'clave'].forEach(function (id) { marcarInvalido(id, false); });

            if (!correoValido(correo)) { marcarInvalido('correo', true); return mostrarMensaje('Escribe un correo válido.'); }
            if (!clave) { marcarInvalido('clave', true); return mostrarMensaje('Escribe tu contraseña.'); }

            var usuarios = leer(CLAVE_USUARIOS, []);
            var usuario = usuarios.find(function (u) { return u.correo === correo && u.clave === clave; });
            if (!usuario) return mostrarMensaje('Correo o contraseña incorrectos.');

            guardar(CLAVE_SESION, { nombre: usuario.nombre, correo: usuario.correo });
            mostrarMensaje('Bienvenido, ' + usuario.nombre + '.', true);
            setTimeout(function () { window.location.href = 'index.html'; }, 800);
        });
    }

    // --- Barra superior: si hay sesión, muestra el nombre y permite cerrarla ---
    var enlaceSesion = document.querySelector('[data-sesion]');
    var sesion = leer(CLAVE_SESION, null);
    if (enlaceSesion && sesion) {
        enlaceSesion.querySelector('span').textContent = sesion.nombre + ' (Salir)';
        enlaceSesion.setAttribute('href', '#');
        enlaceSesion.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem(CLAVE_SESION);
            window.location.href = 'index.html';
        });
    }
})();
