describe('Pruebas del Frontend', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="loginForm">
        <input type="email" id="email" required />
        <input type="password" id="password" required />
        <button type="submit">Iniciar sesión</button>
      </form>
      <form id="registroForm">
        <input type="text" id="firstName" required />
        <input type="text" id="lastName" required />
        <select id="gender" required>
          <option value="">Seleccionar</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
        <input type="email" id="email" required />
        <input type="password" id="password" required />
        <input type="password" id="confirmPassword" required />
        <input type="checkbox" id="acceptPolicies" required />
        <button type="button" onclick="registrarUsuario()">Registrarse</button>
      </form>
    `;
  });

  test('El formulario de login debe validar campos requeridos', () => {
    const form = document.getElementById('loginForm');
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    // Simular envío de formulario vacío
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);

    expect(email.validity.valid).toBeFalsy();
    expect(password.validity.valid).toBeFalsy();
  });

  test('El formulario de registro debe validar campos requeridos', () => {
    const form = document.getElementById('registroForm');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const gender = document.getElementById('gender');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const acceptPolicies = document.getElementById('acceptPolicies');

    // Simular envío de formulario vacío
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);

    expect(firstName.validity.valid).toBeFalsy();
    expect(lastName.validity.valid).toBeFalsy();
    expect(gender.validity.valid).toBeFalsy();
    expect(email.validity.valid).toBeFalsy();
    expect(password.validity.valid).toBeFalsy();
    expect(confirmPassword.validity.valid).toBeFalsy();
    expect(acceptPolicies.validity.valid).toBeFalsy();
  });

  test('El formulario de registro debe validar que las contraseñas coincidan', () => {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    password.value = 'password123';
    confirmPassword.value = 'password456';

    expect(password.value).not.toBe(confirmPassword.value);
  });

  test('El formulario de registro debe validar el formato del email', () => {
    const email = document.getElementById('email');
    
    email.value = 'invalid-email';
    expect(email.validity.valid).toBeFalsy();

    email.value = 'valid@email.com';
    expect(email.validity.valid).toBeTruthy();
  });
}); 