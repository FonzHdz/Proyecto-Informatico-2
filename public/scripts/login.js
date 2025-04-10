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
        background: '#f0fdf4',
        iconColor: '#16a34a',
        color: '#166534'
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
        background: '#fef2f2',
        iconColor: '#dc2626',
        color: '#b91c1c'
    });
    
    Toast.fire({
        icon: 'error',
        title: message
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

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showErrorToast('Por favor completa todos los campos');
        return;
    }
    
    const loader = Swal.fire({
        title: 'Iniciando sesión',
        html: 'Validando tus credenciales...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
        background: '#f8fafc',
        backdrop: 'rgba(0,0,0,0.4)'
    });
    
    try {
        const response = await fetch('http://localhost:8070/user/login', {
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
            await loader.close();
            showErrorToast(data.message || 'Credenciales incorrectas');
            return;
        }
        
        await loader.close();
        
        const gender = data.user.gender;
        console.log('Usuario:', gender);
        if (gender === 'Masculino') {
            showSuccessToast(`¡Bienvenido ${data.user.firstName}!`);
        }
        if (gender === 'Femenino') {
            showSuccessToast(`¡Bienvenida ${data.user.firstName}!`);
        }
        if (gender === 'Otro') {
            showSuccessToast(`¡Bienvenido a HarmoniChat!`);
        }
        
        // Almacenar solo el objeto user
        localStorage.setItem('harmonichat_user', JSON.stringify(data.user));
        const userData = encodeURIComponent(JSON.stringify(data.user));
        
        setTimeout(() => {
            window.location.href = `http://localhost:3001?user=${userData}`;
        }, 1500);
        
    } catch (error) {
        await loader.close();
        console.error('Error:', error);
        showErrorToast('Error al conectar con el servidor');
    }
});

document.querySelector('.fi-ss-eye-crossed').addEventListener('click', function() {
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

// Inicialización al cargar la página
window.onload = function() {
    // Verificar si hay mensaje en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message) {
        showInfoToast(decodeURIComponent(message));
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
};