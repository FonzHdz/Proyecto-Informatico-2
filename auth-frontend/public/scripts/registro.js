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
    borderRadius: '8px',
  });

  Toast.fire({
    icon: 'success',
    title: message,
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
    borderRadius: '8px',
  });

  Toast.fire({
    icon: 'error',
    title: message || 'Error occurred!',
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
    background: '#007bff',
    iconColor: '#fff',
    color: '#fff',
    padding: '20px',
    borderRadius: '8px',
  });

  Toast.fire({
    icon: 'info',
    title: message || 'Information message!',
  });
}

// Funciones de validación

// Validar que no haya campos en blanco
function validarCamposNoVacios() {
  const fields = [
    { id: 'firstName', name: 'Nombre' },
    { id: 'lastName', name: 'Apellido' },
    { id: 'gender', name: 'Género' },
    { id: 'documentType', name: 'Tipo de Documento' },
    { id: 'documentNumber', name: 'Número de Documento' },
    { id: 'phoneNumber', name: 'Teléfono' },
    { id: 'email', name: 'Correo electrónico' },
    { id: 'password', name: 'Contraseña' },
    { id: 'confirmPassword', name: 'Confirmar Contraseña' }
  ];

  for (const field of fields) {
    const element = document.getElementById(field.id);
    if (!element || !element.value.trim()) {
      window.Swal.fire({
        icon: 'error',
        title: `El campo ${field.name} no puede estar vacío.`
      });
      return false;
    }
  }
  return true;
}

// Validar Nombre y Apellido
function validarNombreApellido(nombre) {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;
  return regex.test(nombre);
}

// Validar Número de Documento
function validarNumeroDocumento(numero) {
  const regex = /^\d{7,10}$/;
  return regex.test(numero);
}

// Validar Teléfono
function validarTelefono(telefono) {
  const regex = /^\d{7,10}$/; // 7 o 10 dígitos
  return regex.test(telefono);
}

// Validar Correo Electrónico
function validarCorreo(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato estándar de correo
  return regex.test(correo) && correo.length <= 100;
}

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const passwordRules = document.getElementById("passwordRules");
const matchMessage = document.getElementById("matchMessage");

const ruleLength = document.getElementById("ruleLength");
const ruleUpper = document.getElementById("ruleUpper");
const ruleLower = document.getElementById("ruleLower");
const ruleDigit = document.getElementById("ruleDigit");
const ruleSpecial = document.getElementById("ruleSpecial");

function validatePassword(password) {
  return {
    length: password.length >= 8 && password.length <= 20,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]]/.test(password),
  };
}

function updateRulesDisplay(password) {
  const rules = validatePassword(password);
  const colorOk = "text-purple-600";
  const colorBad = "text-gray-600";

  function updateRule(el, valid, text) {
    if (!el) return;
    el.textContent = `${valid ? '✔️' : '❌'} ${text}`;
    el.classList.remove(colorOk, colorBad);
    el.classList.add(valid ? colorOk : colorBad);
  }

  updateRule(ruleLength, rules.length, "Entre 8 y 20 caracteres.");
  updateRule(ruleUpper, rules.upper, "Al menos una letra mayúscula.");
  updateRule(ruleLower, rules.lower, "Al menos una letra minúscula.");
  updateRule(ruleDigit, rules.digit, "Al menos un número.");
  updateRule(ruleSpecial, rules.special, "Al menos un carácter especial.");
}

function checkPasswordsMatch() {
  if (!passwordInput || !confirmPasswordInput || !matchMessage) return;
  
  const pwd = passwordInput.value;
  const confirm = confirmPasswordInput.value;

  if (pwd && confirm) {
    matchMessage.classList.remove("hidden");
    if (pwd === confirm) {
      matchMessage.textContent = "✔️ Las contraseñas coinciden.";
      matchMessage.classList.remove("text-gray-600");
      matchMessage.classList.add("text-purple-600");
    } else {
      matchMessage.textContent = "❌ Las contraseñas no coinciden.";
      matchMessage.classList.remove("text-purple-600");
      matchMessage.classList.add("text-gray-600");
    }
  } else {
    matchMessage.classList.add("hidden");
  }
}

function setupPasswordValidation() {
  if (!passwordInput || !confirmPasswordInput || !passwordRules || !matchMessage) return;

  passwordInput.addEventListener("input", () => {
    const pwd = passwordInput.value;
    if (pwd.length > 0) {
      passwordRules.classList.remove("hidden");
      updateRulesDisplay(pwd);
    } else {
      passwordRules.classList.add("hidden");
    }
    checkPasswordsMatch();
  });

  confirmPasswordInput.addEventListener("input", checkPasswordsMatch);
}

// Validar Contraseña
function validarContraseña(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    return regex.test(password);
}

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
    { value: 'Hija', text: 'Hija' },
  ];

  roles.forEach((role) => {
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

  document.getElementById('familyCodeHelp').textContent = 'Estás registrándote con un código de invitación familiar';
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
    const response = await axios.get(`${BACKEND_URL}/user/check-document`, {
      params: { documentType, documentNumber },
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

  if (!password || !confirmPassword) {
    window.Swal.fire({
      icon: 'error',
      title: 'Por favor ingresa ambas contraseñas'
    });
    return false;
  }

  if (password !== confirmPassword) {
    window.Swal.fire({
      icon: 'error',
      title: 'Las contraseñas no coinciden'
    });
    return false;
  }
  return true;
}

// Manejar la apertura y cierre del modal de políticas
function setupPoliciesModal() {
  const openPolicies = document.getElementById('openPolicies');
  const closePolicies = document.getElementById('closePolicies');
  const modal = document.getElementById('policiesModal');

  if (openPolicies) {
    openPolicies.addEventListener('click', (event) => {
      event.preventDefault();
      modal.classList.remove('hidden');
    });
  }

  if (closePolicies) {
    closePolicies.addEventListener('click', (event) => {
      event.preventDefault();
      modal.classList.add('hidden');
    });
  }
}

// Modificar la función de registro para verificar la aceptación de políticas
async function registrarUsuario() {
  // Validar campos no vacíos
  if (!validarCamposNoVacios()) return;

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const documentNumber = document.getElementById('documentNumber').value;
  const phoneNumber = document.getElementById('phoneNumber').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validaciones
  if (!validarNombreApellido(firstName)) {
    showErrorToast('El nombre debe tener entre 2 y 50 caracteres y solo contener letras.');
    return;
  }
  if (!validarNombreApellido(lastName)) {
    showErrorToast('El apellido debe tener entre 2 y 50 caracteres y solo contener letras.');
    return;
  }
  if (!validarNumeroDocumento(documentNumber)) {
    showErrorToast('El número de documento debe tener entre 7 y 10 dígitos.');
    return;
  }
  if (!validarTelefono(phoneNumber)) {
    showErrorToast('El teléfono debe tener 7 o 10 dígitos.');
    return;
  }
  if (!validarCorreo(email)) {
    showErrorToast('El correo electrónico no es válido o excede los 100 caracteres.');
    return;
  }
  if (!validarContraseña(password)) {
    showErrorToast('La contraseña debe tener entre 8 y 20 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.');
    return;
  }
  // Validar que se acepten las políticas
  if (!document.getElementById('acceptPolicies').checked) {
    showErrorToast('Debes aceptar las políticas de privacidad para registrarte.');
    return;
  }

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
    inviteCode: document.getElementById('familyCode').value || null,
  };

  // Validación de rol hijo
  if ((formData.role === 'Hijo' || formData.role === 'Hija') && !formData.inviteCode) {
    showErrorToast('Se requiere código de invitación para los hijos');
    return;
  }

  // Mostrar loader durante el registro
  const loader = Swal.fire({
    title: 'Registrando usuario',
    html: `
            <div class="loader-container">
                <svg id="loaderHeart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100" height="100">
                    <path class="heart-path" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <div>Por favor espera...</div>
            </div>
        `,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await axios.post(`${BACKEND_URL}/user/register`, formData);

    // Cerrar loader
    await loader.close();

    // Mostrar notificación de éxito
    showSuccessToast('¡Registro exitoso!');

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
const roleSelect = document.getElementById('role');
if (roleSelect) {
  roleSelect.addEventListener('change', function () {
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
}

const hasInviteCheckbox = document.getElementById('hasInviteCode');
if (hasInviteCheckbox) {
  hasInviteCheckbox.addEventListener('change', function () {
    document.getElementById('familyCodeField').classList.toggle('hidden', !this.checked);
  });
}

// Inicialización al cargar la página
window.onload = function () {
  loadRoleOptions();
  handleInviteCodeFromUrl();
  setupPoliciesModal();
  setupPasswordValidation();

  // Si hay código en URL, forzar selección de hijo/hija
  if (getQueryParam('invite')) {
    document.getElementById('role').value = 'Hijo';
    document.getElementById('role').dispatchEvent(new Event('change'));
  }
};

if (typeof module !== 'undefined') {
  module.exports = {
    validarCamposNoVacios,
    validarNombreApellido,
    validarNumeroDocumento,
    validarTelefono,
    validarCorreo,
    validarContraseña,
    handleInviteCodeFromUrl,
    validarContraseñas,
    setupPoliciesModal,
    setupPasswordValidation
  };
}