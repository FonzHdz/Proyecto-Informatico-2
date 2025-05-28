// Polyfills para TextEncoder y TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para SweetAlert2
window.Swal = {
  fire: jest.fn(),
  close: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
};

// Mock para axios
window.axios = {
  post: jest.fn(),
  get: jest.fn(),
}; 