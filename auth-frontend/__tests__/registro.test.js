const {
  validarCamposNoVacios,
  validarNombreApellido,
  validarNumeroDocumento,
  validarTelefono,
  validarCorreo,
  validarContraseña,
  handleInviteCodeFromUrl,
  validarContraseñas,
  setupPoliciesModal
} = require('../public/scripts/registro.js');

describe('Pruebas de funcionalidad de registro', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="registroForm">
        <input type="text" id="firstName" />
        <label>Nombre</label>
        <input type="text" id="lastName" />
        <label>Apellido</label>
        <select id="gender">
          <option value="">Seleccionar</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
        <label>Género</label>
        <select id="documentType">
          <option value="">Seleccionar</option>
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="TI">Tarjeta de Identidad</option>
          <option value="CE">Cédula de Extranjería</option>
        </select>
        <label>Tipo de Documento</label>
        <input type="text" id="documentNumber" />
        <label>Número de Documento</label>
        <input type="tel" id="phoneNumber" />
        <label>Teléfono</label>
        <input type="email" id="email" />
        <label>Correo electrónico</label>
        <select id="role">
          <option value="">Selecciona tu rol</option>
        </select>
        <label>Rol en la Familia</label>
        <input type="password" id="password" />
        <label>Contraseña</label>
        <input type="password" id="confirmPassword" />
        <label>Confirmar Contraseña</label>
        <input type="checkbox" id="acceptPolicies" />
        <label>Aceptar políticas</label>
        <div id="familyCodeField" class="hidden">
          <input type="text" id="familyCode" />
          <p id="familyCodeHelp"></p>
        </div>
        <input type="checkbox" id="hasInviteCode" />
        <label>¿Tienes un código de invitación?</label>
      </form>
      <div id="policiesModal" class="hidden">
        <button id="closePolicies">Cerrar</button>
      </div>
      <a href="#" id="openPolicies">políticas de privacidad</a>
    `;

    // Mock de window.location
    delete window.location;
    window.location = {
      search: '',
      pathname: '/registro'
    };

    // Mock de SweetAlert2
    window.Swal = {
      fire: jest.fn(),
      close: jest.fn(),
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      mixin: jest.fn().mockReturnValue({
        fire: jest.fn()
      })
    };
  });

  test('Debería validar campos no vacíos', () => {
    const result = validarCamposNoVacios();
    expect(result).toBe(false);
    expect(window.Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        title: expect.stringContaining('no puede estar vacío')
      })
    );
  });

  test('Debería validar formato de nombre y apellido', () => {
    expect(validarNombreApellido('Juan')).toBe(true);
    expect(validarNombreApellido('Juan123')).toBe(false);
    expect(validarNombreApellido('J')).toBe(false);
    expect(validarNombreApellido('Juan Pérez')).toBe(true);
  });

  test('Debería validar formato de número de documento', () => {
    expect(validarNumeroDocumento('1234567890')).toBe(true);
    expect(validarNumeroDocumento('123456789')).toBe(true);
    expect(validarNumeroDocumento('12345678')).toBe(true);
    expect(validarNumeroDocumento('1234567')).toBe(true);
    expect(validarNumeroDocumento('12345678901')).toBe(false);
    expect(validarNumeroDocumento('123456')).toBe(false);
  });

  test('Debería validar formato de teléfono', () => {
    expect(validarTelefono('1234567')).toBe(true);
    expect(validarTelefono('1234567890')).toBe(true);
    expect(validarTelefono('123456')).toBe(false);
    expect(validarTelefono('12345678901')).toBe(false);
  });

  test('Debería validar formato de correo electrónico', () => {
    expect(validarCorreo('test@example.com')).toBe(true);
    expect(validarCorreo('invalid-email')).toBe(false);
    expect(validarCorreo('test@')).toBe(false);
    expect(validarCorreo('@example.com')).toBe(false);
  });

  test('Debería validar formato de contraseña', () => {
    expect(validarContraseña('Password')).toBe(false);
    expect(validarContraseña('password123')).toBe(false);
    expect(validarContraseña('Pass123!')).toBe(true);
    expect(validarContraseña('Pass123!@')).toBe(true);
  });

  test('Debería manejar código de invitación desde URL', () => {
    window.location.search = '?invite=ABC123';
    handleInviteCodeFromUrl();
    
    const familyCodeInput = document.getElementById('familyCode');
    const hasInviteCheckbox = document.getElementById('hasInviteCode');
    
    expect(familyCodeInput.value).toBe('ABC123');
    expect(familyCodeInput.readOnly).toBe(true);
    expect(hasInviteCheckbox.checked).toBe(true);
    expect(hasInviteCheckbox.disabled).toBe(true);
    expect(document.getElementById('familyCodeField').classList.contains('hidden')).toBe(false);
  });

  test('Debería mostrar/ocultar modal de políticas', () => {
    setupPoliciesModal();
    const openButton = document.getElementById('openPolicies');
    const closeButton = document.getElementById('closePolicies');
    const modal = document.getElementById('policiesModal');
    
    openButton.click();
    expect(modal.classList.contains('hidden')).toBe(false);
    
    closeButton.click();
    expect(modal.classList.contains('hidden')).toBe(true);
  });

  test('Debería validar coincidencia de contraseñas', async () => {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    passwordInput.value = 'Test123!';
    confirmPasswordInput.value = 'Test456!';
    
    const result = await validarContraseñas();
    expect(result).toBe(false);
    expect(window.Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        title: 'Las contraseñas no coinciden'
      })
    );
  });
}); 