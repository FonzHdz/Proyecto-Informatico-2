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

// Funciones para notificaciones Toast
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

// Funciones de validación
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function loadRoleOptions() {
    const roleSelect = document.getElementById('role');
    const inviteCode = getQueryParam('invite');
    
    roleSelect.innerHTML = '<option value="">Selecciona tu rol</option>';
    
    const roles = [
        { value: 'Padre', text: 'Padre' },
        { value: 'Madre', text: 'Madre' },
        { value: 'Hijo', text: 'Hijo' },
        { value: 'Hija', text: 'Hija' }
    ];
    
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.value;
        option.textContent = role.text;
        roleSelect.appendChild(option);
    });
}

function handleInviteCodeFromUrl() {
    const inviteCode = getQueryParam('invite');
    if (!inviteCode) return;
    
    const familyCodeInput = document.getElementById('familyCode');
    const hasInviteCheckbox = document.getElementById('hasInviteCode');
    
    familyCodeInput.value = inviteCode;
    familyCodeInput.readOnly = true;
    document.getElementById('familyCodeField').classList.remove('hidden');
    hasInviteCheckbox.checked = true;
    hasInviteCheckbox.disabled = true;
    
    document.getElementById('familyCodeHelp').textContent = 
        'Estás registrándote con un código de invitación familiar';
}

function copyInvitationCode() {
    const codeInput = document.getElementById('invitationCode');
    codeInput.select();
    document.execCommand('copy');
    showInfoToast('Código copiado al portapapeles');
}

async function validarCedula() {
    const documentType = document.getElementById('documentType').value;
    const documentNumber = document.getElementById('documentNumber').value;
    
    if (!documentNumber || !documentType) return false;
    
    try {
        const response = await axios.get('http://localhost:8070/user/check-document', {
            params: { documentType, documentNumber }
        });
        
        if (response.data.exists) {
            showErrorToast('Esta cédula ya está registrada');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error validando cédula:', error);
        showErrorToast('Error al validar documento');
        return false;
    }
}

async function validarContraseñas() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
        
    if (password !== confirmPassword) {
        showErrorToast('Las contraseñas no coinciden');
        return false;
    }
    return true;
}

// Función principal de registro
async function registrarUsuario() {
    // Validar contraseñas primero
    if (!await validarContraseñas()) return;
    
    // Validar cédula
    if (await validarCedula()) return;
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        gender: document.getElementById('gender').value,
        documentType: document.getElementById('documentType').value,
        documentNumber: document.getElementById('documentNumber').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        inviteCode: document.getElementById('familyCode').value || null
    };

    // Validación de rol hijo
    if ((formData.role === 'Hijo' || formData.role === 'Hija') && !formData.inviteCode) {
        showErrorToast('Se requiere código de invitación para los hijos');
        return;
    }

    // Mostrar loader durante el registro
    const loader = Swal.fire({
        title: 'Registrando usuario',
        html: 'Por favor espera...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await axios.post('http://localhost:8070/user/register', formData);
        
        // Cerrar loader
        await loader.close();
        
        // Mostrar notificación de éxito
        showSuccessToast('Registro exitoso!');
        
        // Manejo del código de invitación
        if ((formData.role === 'Padre' || formData.role === 'Madre') && !formData.inviteCode) {
            document.getElementById('invitationSection').classList.remove('hidden');
            document.getElementById('invitationCode').value = response.data.familyCode;
            
            // Mostrar modal con el código de invitación
        }
    } catch (error) {
        await loader.close();
        console.error('Error en el registro:', error);
        if (error.response) {
            showErrorToast(error.response.data.message || 'Error en el registro');
        } else {
            showErrorToast('Error de conexión. Intenta nuevamente');
        }
    }
}

// Event Listeners
document.getElementById('role').addEventListener('change', function() {
    const role = this.value;
    const isChild = role === 'Hijo' || role === 'Hija';
    const hasInviteCheckbox = document.getElementById('hasInviteCode');
    const familyCodeField = document.getElementById('familyCodeField');
    
    if (isChild) {
        hasInviteCheckbox.checked = true;
        hasInviteCheckbox.disabled = true;
        familyCodeField.classList.remove('hidden');
    } else {
        hasInviteCheckbox.checked = false;
        hasInviteCheckbox.disabled = false;
        familyCodeField.classList.add('hidden');
    }
});

document.getElementById('hasInviteCode').addEventListener('change', function() {
    document.getElementById('familyCodeField').classList.toggle('hidden', !this.checked);
});

// Inicialización al cargar la página
window.onload = function() {
    loadRoleOptions();
    handleInviteCodeFromUrl();
    
    // Si hay código en URL, forzar selección de hijo/hija
    if (getQueryParam('invite')) {
        document.getElementById('role').value = 'Hijo';
        document.getElementById('role').dispatchEvent(new Event('change'));
    }
};