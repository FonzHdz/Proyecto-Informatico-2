import '@testing-library/jest-dom';
import React from 'react';

// Mock de window.matchMedia
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

// Mock global de axios
jest.mock('axios', () => ({
  create: () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() }),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock global de sockjs-client
jest.mock('sockjs-client', () => jest.fn());

// Mock global de @stomp/stompjs
jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation(() => ({ activate: jest.fn(), deactivate: jest.fn(), publish: jest.fn(), subscribe: jest.fn() })),
}));

// Mock global de date-fns/locale
jest.mock('date-fns/locale', () => ({
  es: {},
}));

// Mock global de react-markdown
jest.mock('react-markdown', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('div', null, 'Mocked ReactMarkdown'),
  };
}); 