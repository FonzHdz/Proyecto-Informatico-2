const {
  setupLoginForm,
  setupPasswordVisibility
} = require('../public/scripts/login.js');

const {
  validarCamposNoVacios,
  validarNombreApellido,
  validarNumeroDocumento,
  validarTelefono,
  validarCorreo,
  validarContraseña,
  setupPoliciesModal
} = require('../public/scripts/registro.js');

describe('Pruebas de Integración', () => {
  beforeEach(() => {
    // Configuración global
    global.BACKEND_URL = 'http://localhost:3000';
    global.APP_URL = 'http://localhost:8080';

    // Mock de localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Mock de window.location
    delete window.location;
    window.location = {
      href: '',
      pathname: '/',
      search: '',
      replaceState: jest.fn()
    };

    // Mock de SweetAlert2
    window.Swal = {
      fire: jest.fn().mockImplementation((options) => {
        if (options.didOpen) {
          options.didOpen();
        }
        return Promise.resolve();
      }),
      close: jest.fn(),
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      mixin: jest.fn().mockReturnValue({
        fire: jest.fn()
      })
    };

    // Mock de fetch
    global.fetch = jest.fn();
  });

  describe('Flujo completo de registro y login', () => {
    beforeEach(() => {
      // Configurar el DOM para el registro
      document.body.innerHTML = `
        <form id="registroForm">
          <input type="text" id="firstName" />
          <input type="text" id="lastName" />
          <select id="gender">
            <option value="Masculino">Masculino</option>
          </select>
          <select id="documentType">
            <option value="CC">Cédula de Ciudadanía</option>
          </select>
          <input type="text" id="documentNumber" />
          <input type="tel" id="phoneNumber" />
          <input type="email" id="email" />
          <select id="role">
            <option value="Padre">Padre</option>
          </select>
          <input type="password" id="password" />
          <input type="password" id="confirmPassword" />
          <input type="checkbox" id="acceptPolicies" />
        </form>
      `;

      // Configurar el event listener para el formulario de registro
      const registroForm = document.getElementById('registroForm');
      registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validar campos no vacíos
        if (!validarCamposNoVacios()) {
          window.Swal.fire({
            icon: 'error',
            title: 'Por favor completa todos los campos'
          });
          return;
        }

        // Validar formato de datos
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const documentNumber = document.getElementById('documentNumber').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!validarNombreApellido(firstName) || !validarNombreApellido(lastName)) {
          window.Swal.fire({
            icon: 'error',
            title: 'El nombre y apellido deben contener solo letras'
          });
          return;
        }

        if (!validarNumeroDocumento(documentNumber)) {
          window.Swal.fire({
            icon: 'error',
            title: 'El número de documento debe tener 10 dígitos'
          });
          return;
        }

        if (!validarTelefono(phoneNumber)) {
          window.Swal.fire({
            icon: 'error',
            title: 'El teléfono debe tener 7 o 10 dígitos'
          });
          return;
        }

        if (!validarCorreo(email)) {
          window.Swal.fire({
            icon: 'error',
            title: 'El correo electrónico no es válido'
          });
          return;
        }

        if (!validarContraseña(password)) {
          window.Swal.fire({
            icon: 'error',
            title: 'La contraseña no cumple con los requisitos'
          });
          return;
        }

        // Mostrar loader
        const loader = await window.Swal.fire({
          title: 'Registrando usuario',
          html: 'Por favor espera...',
          allowOutsideClick: false,
          didOpen: () => {
            window.Swal.showLoading();
          }
        });

        try {
          // Simular llamada al backend
          const response = await fetch(`${BACKEND_URL}/user/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              firstName,
              lastName,
              gender: document.getElementById('gender').value,
              documentType: document.getElementById('documentType').value,
              documentNumber,
              phoneNumber,
              email,
              password,
              role: document.getElementById('role').value
            })
          });

          const data = await response.json();
          
          if (!response.ok) {
            await window.Swal.close();
            window.Swal.fire({
              icon: 'error',
              title: data.message || 'Error en el registro'
            });
            return;
          }

          await window.Swal.close();
          window.Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!'
          });

        } catch (error) {
          await window.Swal.close();
          window.Swal.fire({
            icon: 'error',
            title: 'Error al conectar con el servidor'
          });
        }
      });
    });

    test('Debería permitir el registro y login exitoso', async () => {
      // 1. Completar el formulario de registro
      document.getElementById('firstName').value = 'Juan';
      document.getElementById('lastName').value = 'Pérez';
      document.getElementById('gender').value = 'Masculino';
      document.getElementById('documentType').value = 'CC';
      document.getElementById('documentNumber').value = '1234567890';
      document.getElementById('phoneNumber').value = '1234567890';
      document.getElementById('email').value = 'juan@example.com';
      document.getElementById('role').value = 'Padre';
      document.getElementById('password').value = 'Test123!@';
      document.getElementById('confirmPassword').value = 'Test123!@';
      document.getElementById('acceptPolicies').checked = true;

      // 2. Mock de la respuesta del registro
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: {
              firstName: 'Juan',
              lastName: 'Pérez',
              email: 'juan@example.com',
              familyCode: 'ABC123'
            }
          })
        })
      );

      // 3. Simular el envío del formulario de registro
      const registroForm = document.getElementById('registroForm');
      const registroEvent = new Event('submit');
      registroForm.dispatchEvent(registroEvent);

      // 4. Esperar a que se complete el registro
      await new Promise(resolve => setTimeout(resolve, 100));

      // 5. Configurar el DOM para el login
      document.body.innerHTML = `
        <form id="loginForm">
          <input type="email" id="email" />
          <input type="password" id="password" />
          <button type="submit">Iniciar sesión</button>
        </form>
      `;

      // 6. Configurar el formulario de login
      setupLoginForm();

      // 7. Completar el formulario de login
      document.getElementById('email').value = 'juan@example.com';
      document.getElementById('password').value = 'Test123!@';

      // 8. Mock de la respuesta del login
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: {
              firstName: 'Juan',
              lastName: 'Pérez',
              email: 'juan@example.com',
              gender: 'Masculino'
            }
          })
        })
      );

      // 9. Simular el envío del formulario de login
      const loginForm = document.getElementById('loginForm');
      const loginEvent = new Event('submit');
      loginForm.dispatchEvent(loginEvent);

      // 10. Esperar a que se complete el login
      await new Promise(resolve => setTimeout(resolve, 100));

      // 11. Verificar que se guardó el usuario en localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'harmonichat_user',
        expect.any(String)
      );

      // 12. Verificar que se mostró el mensaje de bienvenida
      const swalCalls = window.Swal.fire.mock.calls;
      const welcomeCall = swalCalls.find(call => 
        call[0].icon === 'success' && 
        call[0].title === '¡Bienvenido Juan!'
      );
      expect(welcomeCall).toBeTruthy();
    });

    test('Debería manejar errores en el flujo de registro y login', async () => {
      // 1. Completar el formulario de registro con datos inválidos
      document.getElementById('firstName').value = 'Juan';
      document.getElementById('lastName').value = 'Pérez';
      document.getElementById('gender').value = 'Masculino';
      document.getElementById('documentType').value = 'CC';
      document.getElementById('documentNumber').value = '123'; // Inválido
      document.getElementById('phoneNumber').value = '123'; // Inválido
      document.getElementById('email').value = 'invalid-email';
      document.getElementById('role').value = 'Padre';
      document.getElementById('password').value = 'weak';
      document.getElementById('confirmPassword').value = 'weak';
      document.getElementById('acceptPolicies').checked = true;

      // 2. Simular el envío del formulario de registro
      const registroForm = document.getElementById('registroForm');
      const registroEvent = new Event('submit');
      registroForm.dispatchEvent(registroEvent);

      // 3. Esperar a que se complete la validación
      await new Promise(resolve => setTimeout(resolve, 100));

      // 4. Verificar que se mostraron los mensajes de error apropiados
      const swalCalls = window.Swal.fire.mock.calls;
      const errorCall = swalCalls.find(call => 
        call[0].icon === 'error' && 
        (call[0].title === 'El número de documento debe tener 10 dígitos' ||
         call[0].title === 'El teléfono debe tener 7 o 10 dígitos' ||
         call[0].title === 'El correo electrónico no es válido' ||
         call[0].title === 'La contraseña no cumple con los requisitos')
      );
      expect(errorCall).toBeTruthy();

      // Limpiar las llamadas anteriores
      window.Swal.fire.mockClear();

      // 5. Configurar el DOM para el login
      document.body.innerHTML = `
        <form id="loginForm">
          <input type="email" id="email" />
          <input type="password" id="password" />
          <button type="submit">Iniciar sesión</button>
        </form>
      `;

      // 6. Configurar el formulario de login
      setupLoginForm();

      // 7. Completar el formulario de login con credenciales incorrectas
      document.getElementById('email').value = 'juan@example.com';
      document.getElementById('password').value = 'wrong-password';

      // 8. Mock de la respuesta de error del login
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            message: 'Credenciales incorrectas'
          })
        })
      );

      // 9. Simular el envío del formulario de login
      const loginForm = document.getElementById('loginForm');
      const loginEvent = new Event('submit');
      loginForm.dispatchEvent(loginEvent);

      // 10. Esperar a que se complete el login
      await new Promise(resolve => setTimeout(resolve, 100));

      // 11. Verificar que se mostró el mensaje de error
      const loginSwalCalls = window.Swal.fire.mock.calls;
      const loginErrorCall = loginSwalCalls.find(call => 
        call[0].icon === 'error' && 
        call[0].title === 'Credenciales incorrectas'
      );
      expect(loginErrorCall).toBeTruthy();
    });
  });
}); 