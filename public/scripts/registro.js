document.getElementById('role').addEventListener('change', function() {
    const role = this.value;
    const isChild = role === 'Hijo' || role === 'Hija';
    const hasInviteCheckbox = document.getElementById('hasInviteCode');
    const familyCodeField = document.getElementById('familyCodeField');
    
    if (isChild) {
        // Para hijos: checkbox marcado y deshabilitado
        hasInviteCheckbox.checked = true;
        hasInviteCheckbox.disabled = true;
        familyCodeField.classList.remove('hidden');
    } else {
        // Para otros roles: checkbox desmarcado y habilitado
        hasInviteCheckbox.checked = false;
        hasInviteCheckbox.disabled = false;
        familyCodeField.classList.add('hidden');
    }
});
function loadRoleOptions() {
    const roleSelect = document.getElementById('role');
    const inviteCode = getQueryParam('invite');
    
    roleSelect.innerHTML = '<option value="">Selecciona tu rol</option>';
    
    if (inviteCode) {
        const childOptions = [
            { value: 'Hijo', text: 'Hijo' },
            { value: 'Hija', text: 'Hija' }
        ];
        
        childOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            roleSelect.appendChild(optElement);
        });
    } 
    else {
        const allOptions = [
            { value: 'Padre', text: 'Padre' },
            { value: 'Madre', text: 'Madre' },
        ];
        
        allOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            roleSelect.appendChild(optElement);
        });
    }
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
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
    alert('Código copiado al portapapeles');
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
            alert('Esta cédula ya está registrada en nuestro sistema');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error validando cédula:', error);
        return false;
    }
}

async function validarContraseñas() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
        
    try {
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        return;
    } catch (error) {
        console.error('Error validando cédulas:', error);
    }
}

async function registrarUsuario() {
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

    // Validaciones
    if ((formData.role === 'Hijo' || formData.role === 'Hija') && !formData.inviteCode) {
        alert('Se requiere código de invitación para los hijos');
        return;
    }

    try {
        const response = await axios.post('http://localhost:8070/user/register', formData);
        
        // Solo mostrar código de invitación si es el creador de la familia
        if ((formData.role === 'Padre' || formData.role === 'Madre') && !formData.inviteCode) {
            document.getElementById('invitationSection').classList.remove('hidden');
            document.getElementById('invitationCode').value = response.data.familyCode;
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error en el registro:', error);
        if (error.response) {
            alert(error.response.data || 'Error en el registro. Verifica los datos e intenta nuevamente.');
        } else {
            alert('Error de conexión. Intenta nuevamente.');
        }
    }
}

// Modifica la función loadRoleOptions
function loadRoleOptions() {
    const roleSelect = document.getElementById('role');
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

window.onload = function() {
    loadRoleOptions();
    handleInviteCodeFromUrl();
    
    // Configuración inicial del checkbox
    document.getElementById('hasInviteCode').addEventListener('change', function() {
        document.getElementById('familyCodeField').classList.toggle('hidden', !this.checked);
    });
    
    // Si hay código en URL, forzar selección de hijo/hija
    if (getQueryParam('invite')) {
        document.getElementById('role').value = 'Hijo';
        document.getElementById('role').dispatchEvent(new Event('change'));
    }
    
    // Resto de tu inicialización (carrusel, etc.)
    initCarousel();
};