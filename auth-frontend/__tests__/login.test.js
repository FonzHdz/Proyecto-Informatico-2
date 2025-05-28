const {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  setupLoginForm,
  setupPasswordVisibility
} = require('../public/scripts/login.js');

describe('Pruebas de funcionalidad de login', () => {
  beforeEach(() => {
    // Definir BACKEND_URL para las pruebas
    global.BACKEND_URL = 'http://localhost:3000';
    global.APP_URL = 'http://localhost:8080';

    document.body.innerHTML = `
      <form id="loginForm">
        <input type="email" id="email" required />
        <input type="password" id="password" required />
        <button type="submit">Iniciar sesión</button>
      </form>
      <i class="fi-ss-eye-crossed"></i>
    `;

    // Mock de localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;

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

    // Configurar los event listeners
    setupLoginForm();
    setupPasswordVisibility();
  });

  test('Debería mostrar error cuando los campos están vacíos', async () => {
    const form = document.getElementById('loginForm');
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(window.Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        title: 'Por favor completa todos los campos'
      })
    );
  });

  test('Debería cambiar la visibilidad de la contraseña al hacer clic en el ícono', () => {
    const passwordInput = document.getElementById('password');
    const icon = document.querySelector('.fi-ss-eye-crossed');
    const clickEvent = new Event('click');
    icon.dispatchEvent(clickEvent);
    expect(passwordInput.type).toBe('text');
    expect(icon.classList.contains('fi-ss-eye')).toBe(true);
    icon.dispatchEvent(clickEvent);
    expect(passwordInput.type).toBe('password');
    expect(icon.classList.contains('fi-ss-eye-crossed')).toBe(true);
  });

  test('Debería mostrar mensaje de bienvenida según el género del usuario', async () => {
    const form = document.getElementById('loginForm');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    email.value = 'test@example.com';
    password.value = 'password123';
    
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          user: {
            firstName: 'Juan',
            gender: 'Masculino'
          }
        })
      })
    );

    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    
    // Esperar a que se resuelvan todas las promesas
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verificar que se llamó a Swal.fire con el mensaje de bienvenida
    expect(window.Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'success',
        title: '¡Bienvenido Juan!'
      })
    );
  });

  test('Debería manejar errores de conexión', async () => {
    const form = document.getElementById('loginForm');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    email.value = 'test@example.com';
    password.value = 'password123';
    
    // Mock del error de red
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    
    // Esperar a que se resuelvan todas las promesas
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verificar que se llamó a Swal.fire con el mensaje de error
    expect(window.Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        title: 'Error al conectar con el servidor'
      })
    );

    // Restaurar el console.error original
    consoleSpy.mockRestore();
  });

  test('Debería mostrar mensaje de información desde la URL', () => {
    window.location.search = '?message=Test%20message';
    const loadEvent = new Event('load');
    window.dispatchEvent(loadEvent);
    expect(window.Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'info',
        title: 'Test message'
      })
    );
  });
}); 