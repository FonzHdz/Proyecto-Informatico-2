document.getElementById('role').addEventListener('change', function() {
    if (!getQueryParam('invite')) {
        const role = this.value;
        const isChild = role === 'Hijo' || role === 'Hija';
        
        document.getElementById('familyCodeField').classList.toggle('hidden', !isChild);
        
        if (role === 'Padre' || role === 'Madre') {
            generarFamilyId();
        } else if (isChild) {
            document.getElementById('familyCode').value = '';
        }
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
            { value: 'Hijo', text: 'Hijo' },
            { value: 'Hija', text: 'Hija' }
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
    if (inviteCode) {
        document.getElementById('familyCode').value = inviteCode;
        document.getElementById('familyCode').readOnly = true;
        document.getElementById('familyCodeField').classList.remove('hidden');
        
        document.getElementById('familyCodeHelp').textContent = 
            'Estás registrándote con un código de invitación familiar';
    }
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

async function registrarUsuario() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const inviteCodeFromUrl = getQueryParam('invite');
    const role = document.getElementById('role').value;
    
    if (inviteCodeFromUrl && !(role === 'Hijo' || role === 'Hija')) {
        alert('Con código de invitación solo puedes registrarte como Hijo/Hija');
        return;
    }

    const cedulaExistente = await validarCedula();
    if (cedulaExistente) return;
    
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        gender: document.getElementById('gender').value,
        documentType: document.getElementById('documentType').value,
        documentNumber: document.getElementById('documentNumber').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value,
        password: password,
        role: document.getElementById('role').value,
        inviteCode: document.getElementById('familyCode').value || null
    };
    
    try {
        // Enviar datos al backend
        const response = await axios.post('http://localhost:8070/user/register', userData);
        
        if (userData.role === 'Padre' || userData.role === 'Madre') {
            document.getElementById('invitationSection').classList.remove('hidden');
            document.getElementById('invitationCode').value = 
                `${response.data.familyCode}`
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error en el registro:', error);
        alert(error.response?.data?.message || 'Error en el registro');
    }
}

function generarFamilyId() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'FAM-';
    
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    document.getElementById('familyCode').value = result;
    return result;
}

window.onload = function() {
    loadRoleOptions();
    handleInviteCodeFromUrl();
    let currentIndex = 0;
    const images = document.querySelectorAll('.carousel img');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');

    function updateCarousel() {
        images.forEach((img, index) => {
            img.style.display = index === currentIndex ? 'block' : 'none';
        });
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('bg-[#5F3195]', index === currentIndex);
        });
    }

    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        updateCarousel();
    }, 3000);

    updateCarousel();
};