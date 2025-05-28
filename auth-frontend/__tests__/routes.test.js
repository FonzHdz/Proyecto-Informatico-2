const request = require('supertest');
const express = require('express');
const path = require('path');

describe('Pruebas de rutas', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.static(path.join(__dirname, '..', 'public')));

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
    });

    app.get('/registro', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
    });
  });

  test('GET / debería devolver la página de login', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.type).toContain('text/html');
  });

  test('GET /registro debería devolver la página de registro', async () => {
    const response = await request(app).get('/registro');
    expect(response.status).toBe(200);
    expect(response.type).toContain('text/html');
  });

  test('GET /ruta-inexistente debería devolver 404', async () => {
    const response = await request(app).get('/ruta-inexistente');
    expect(response.status).toBe(404);
  });
}); 