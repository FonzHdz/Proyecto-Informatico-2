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
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      if (!email || !password) {
        window.Swal.fire({
          icon: 'error',
          title: 'Por favor completa todos los campos'
        });
        return;
      }

      let loader;
      try {
        loader = await window.Swal.fire({
          title: 'Iniciando sesión',
          html: 'Validando tus credenciales...',
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          },
          background: '#f8fafc',
          backdrop: 'rgba(0,0,0,0.4)'
        });

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
        const data = await response.json();
        
        if (!response.ok) {
          await window.Swal.close();
          window.Swal.fire({
            icon: 'error',
            title: data.message || 'Credenciales incorrectas'
          });
          return;
        }

        await window.Swal.close();
        const gender = data.user.gender;
        if (gender === 'Masculino') {
          window.Swal.fire({
            icon: 'success',
            title: `¡Bienvenido ${data.user.firstName}!`
          });
        } else if (gender === 'Femenino') {
          window.Swal.fire({
            icon: 'success',
            title: `¡Bienvenida ${data.user.firstName}!`
          });
        } else {
          window.Swal.fire({
            icon: 'success',
            title: '¡Bienvenido a HarmoniChat!'
          });
        }

        localStorage.setItem('harmonichat_user', JSON.stringify(data.user));
        const userData = encodeURIComponent(JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = `${APP_URL}/?user=${userData}`;
        }, 1500);
      } catch (error) {
        if (loader) {
          await window.Swal.close();
        }
        console.error('Error:', error);
        window.Swal.fire({
          icon: 'error',
          title: 'Error al conectar con el servidor'
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
        window.Swal.fire({
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