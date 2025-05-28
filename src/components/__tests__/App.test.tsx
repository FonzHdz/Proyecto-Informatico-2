import React from 'react';
import { render } from '@testing-library/react';
import App from '../../App';

describe('App Component', () => {
  test('la aplicación se inicia sin errores', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
}); 