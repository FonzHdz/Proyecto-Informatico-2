import React from 'react';
import { render } from '@testing-library/react';

describe('DummyComponent', () => {
  test('renderiza un div con texto', () => {
    const { getByText } = render(<div>Hola, soy un componente de prueba</div>);
    expect(getByText('Hola, soy un componente de prueba')).toBeInTheDocument();
  });
}); 