// Mock de Swal para los tests
if (typeof window.Swal === 'undefined') {
  window.Swal = {
    fire: jest.fn(),
    close: jest.fn(),
    showLoading: jest.fn(),
    hideLoading: jest.fn(),
    mixin: jest.fn().mockReturnValue({
      fire: jest.fn()
    })
  };
}

// Configuración inicial del carrusel
let currentIndex = 0;
const images = document.querySelectorAll('.carousel img');
const indicators = document.querySelectorAll('.carousel-indicators .indicator');

function updateCarousel() {
    images.forEach((img, index) => {
        img.style.transform = `translateX(-${100 * currentIndex}%)`;
    });
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
}, 3000);

updateCarousel();

function showSuccessToast(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        background: '#4caf50',
        iconColor: '#fff',
        color: '#fff',
        padding: '20px',
        borderRadius: '8px'
    });

    Toast.fire({
        icon: 'success',
        title: message
    });
}

function showErrorToast(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        background: '#f87171',
        iconColor: '#fff',
        color: '#fff',
        padding: '20px',
        borderRadius: '8px'
    });
    
    Toast.fire({
        icon: 'error',
        title: message || 'Error occurred!'
    });
}

function showInfoToast(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        background: '#eff6ff',
        iconColor: '#2563eb',
        color: '#1e40af'
    });
    
    Toast.fire({
        icon: 'info',
        title: message
    });
}

function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Iniciando proceso de login...');
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      if (!email || !password) {
        Swal.fire({
          icon: 'error',
          title: 'Por favor completa todos los campos'
        });
        return;
      }

      try {
        console.log('Verificando SweetAlert2:', typeof Swal);
        console.log('Mostrando loader...');
        
        // Mostrar el loader de forma más simple
        Swal.fire({
          title: 'Iniciando sesión',
          text: 'Validando tus credenciales...',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            console.log('Loader abierto');
            Swal.showLoading();
          }
        });

        console.log('Intentando conectar con el backend:', `${BACKEND_URL}/user/login`);
        const response = await fetch(`${BACKEND_URL}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        });
        console.log('Respuesta recibida:', response.status);
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (!response.ok) {
          console.log('Error en la respuesta:', data);
          await Swal.close();
          Swal.fire({
            icon: 'error',
            title: data.message || 'Credenciales incorrectas'
          });
          return;
        }

        console.log('Login exitoso, cerrando loader...');
        await Swal.close();
        
        const gender = data.user.gender;
        let welcomeMessage = '¡Bienvenido a HarmoniChat!';
        if (gender === 'Masculino') {
          welcomeMessage = `¡Bienvenido ${data.user.firstName}!`;
        } else if (gender === 'Femenino') {
          welcomeMessage = `¡Bienvenida ${data.user.firstName}!`;
        }

        console.log('Mostrando mensaje de bienvenida...');
        await Swal.fire({
          icon: 'success',
          title: welcomeMessage,
          timer: 1500,
          showConfirmButton: false
        });

        console.log('Guardando datos del usuario...');
        localStorage.setItem('harmonichat_user', JSON.stringify(data.user));
        const userData = encodeURIComponent(JSON.stringify(data.user));
        
        console.log('Redirigiendo a la aplicación...');
        window.location.href = `${APP_URL}/?user=${userData}`;
      } catch (error) {
        console.error('Error detallado:', error);
        await Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error al conectar con el servidor',
          text: error.message
        });
      }
    });
  }
}

function setupPasswordVisibility() {
  const eyeIcon = document.querySelector('.fi-ss-eye-crossed');
  if (eyeIcon) {
    eyeIcon.addEventListener('click', function() {
      const passwordInput = document.getElementById('password');
      const icon = this;
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fi-ss-eye-crossed');
        icon.classList.add('fi-ss-eye');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fi-ss-eye');
        icon.classList.add('fi-ss-eye-crossed');
      }
    });
  }
}

// Inicialización al cargar la página
window.onload = function() {
    setupLoginForm();
    setupPasswordVisibility();
    
    // Verificar si hay mensaje en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message) {
        Swal.fire({
            icon: 'info',
            title: decodeURIComponent(message)
        });
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
};

if (typeof module !== 'undefined') {
  module.exports = {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    setupLoginForm,
    setupPasswordVisibility
  };
}