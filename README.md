# 🔐 HarmoniChat - Red Social Familiar (Frontend Autenticación)

<div align="center">
  <img src="auth-frontend/public/Logo%20HarmoniChat.png" alt="HarmoniChat Logo" width="180"/>

  <br /><br />
  [![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express)](https://expressjs.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-20.0.0-339933?logo=node.js)](https://nodejs.org/)
  [![Jest](https://img.shields.io/badge/Jest-29.7.0-C21325?logo=jest)](https://jestjs.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-3.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  [![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?logo=railway)](https://auth-hc.up.railway.app/)
</div>

---

## 📝 Descripción

**HarmoniChat Auth** es el módulo de autenticación frontend para HarmoniChat, una red social privada diseñada para conectar a los miembros de una familia en un espacio digital íntimo. Este repositorio contiene la aplicación frontend de autenticación desarrollada con Express.js, HTML, CSS y JavaScript vanilla.

> Sistema de autenticación seguro que permite a los usuarios registrarse e iniciar sesión en HarmoniChat, con validaciones robustas y una experiencia de usuario moderna.

### 🌐 Demo en vivo

Puedes acceder a la aplicación desplegada en: [https://auth-hc.up.railway.app/](https://auth-hc.up.railway.app/)

---

## ✨ Funcionalidades Destacadas

### 🔐 Autenticación

- **Inicio de sesión seguro** con validación de credenciales
- **Registro de usuarios** con validaciones completas
- **Gestión de tokens** y sesiones
- **Redirección automática** a la aplicación principal tras autenticación exitosa

### 📋 Validaciones y Seguridad

- **Validación de contraseñas** con reglas de complejidad:
  - Mínimo 8 caracteres, máximo 20
  - Al menos una letra minúscula
  - Al menos una letra mayúscula
  - Al menos un número
  - Al menos un carácter especial (!@#$%^&*)
- **Validación de cédula** colombiana en tiempo real
- **Verificación de coincidencia** de contraseñas
- **Validación de campos** requeridos
- **Mensajes de error** claros y descriptivos

### 👨‍👩‍👧‍👦 Sistema Familiar

- **Códigos de invitación familiar** para unir miembros
- **Selección de roles familiares** (Padre, Madre, Hijo, Hija)
- **Registro con código de invitación** desde URL
- **Generación y copia** de códigos de invitación

### 🎨 Interfaz de Usuario

- **Diseño responsive** con Tailwind CSS
- **Carrusel de imágenes** en páginas de login y registro
- **Notificaciones toast** con SweetAlert2
- **Indicadores visuales** de validación en tiempo real
- **Loaders y estados de carga** durante las peticiones
- **Interfaz moderna** y amigable

### 🛠️ Características Generales

- **Integración con backend** mediante API REST
- **Manejo de errores** robusto
- **Feedback visual** inmediato al usuario
- **Soporte para múltiples tipos de documento**
- **Validación de email** y formato de datos

---

## ⚙️ Tecnologías & Herramientas

### 🔧 **Backend/Frontend**

- Express.js 4.18.2 - Servidor web para servir archivos estáticos
- Node.js 20.0.0+ - Entorno de ejecución
- HTML5/CSS3 - Estructura y estilos
- JavaScript (Vanilla) - Lógica del cliente

### 🎨 **Frontend Libraries**

- Tailwind CSS 3.0 - Framework de utilidades CSS
- SweetAlert2 11.7.32 - Alertas y notificaciones modernas
- Axios - Cliente HTTP para peticiones al backend
- Font Awesome 5.15.3 - Iconos

### 🧪 **Testing y Calidad**

- Jest 29.7.0 - Framework de testing
- Supertest 6.3.4 - Testing de endpoints HTTP
- Jest Environment JSDOM - Entorno DOM para tests

### 🐳 **Infraestructura**

- Docker para desarrollo y despliegue
- Railway para despliegue y hosting
- Node.js Alpine para imagen Docker optimizada

---

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/HarmoniChat-Auth.git
cd HarmoniChat-Auth/Proyecto-Informatico-2
git checkout front_auth
```

### 2. Instalar dependencias

```bash
cd auth-frontend
npm install
```

### 3. Iniciar entorno de desarrollo

```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

### 4. Despliegue en Railway

1. Instala Railway CLI:

```bash
npm i -g @railway/cli
```

2. Inicia sesión en Railway:

```bash
railway login
```

3. Vincula tu proyecto:

```bash
railway link
```

4. Despliega la aplicación:

```bash
railway up --service HC-Auth
```

---

## 📦 Scripts Disponibles

| Script               | Descripción                                  |
|----------------------|----------------------------------------------|
| `npm start`          | Inicia servidor de desarrollo (localhost:3000) |
| `npm test`           | Ejecuta pruebas unitarias y de integración   |
| `npm run test:watch` | Ejecuta pruebas en modo interactivo          |
| `npm run test:coverage` | Ejecuta pruebas con reporte de cobertura |

---

## 🧪 Testing

### Ejecutar pruebas unitarias:

```bash
npm test
```

### Modo watch (ideal para desarrollo):

```bash
npm run test:watch
```

### Con cobertura de código:

```bash
npm run test:coverage
```

### Archivos de prueba incluidos:

- `__tests__/login.test.js` - Pruebas de funcionalidad de login
- `__tests__/registro.test.js` - Pruebas de funcionalidad de registro
- `__tests__/routes.test.js` - Pruebas de rutas del servidor
- `__tests__/frontend.test.js` - Pruebas de componentes frontend
- `__tests__/integration.test.js` - Pruebas de integración

---

## 🐳 Docker

### Construcción de imagen

```bash
docker build -t harmonichat-auth-frontend ./auth-frontend
```

### Ejecución del contenedor

```bash
docker run -p 3000:3000 harmonichat-auth-frontend
```

---

## 🗂️ Estructura del Proyecto

```
Proyecto-Informatico-2/
├── auth-frontend/          # Aplicación frontend de autenticación
│   ├── public/             # Archivos estáticos
│   │   ├── Imagenes/       # Imágenes del carrusel y assets
│   │   ├── scripts/        # Scripts JavaScript
│   │   │   ├── config.js   # Configuración de URLs del backend
│   │   │   ├── login.js    # Lógica de inicio de sesión
│   │   │   └── registro.js # Lógica de registro
│   │   ├── styles/         # Estilos CSS
│   │   │   ├── login.css   # Estilos de la página de login
│   │   │   └── registro.css # Estilos de la página de registro
│   │   ├── login.html      # Página de inicio de sesión
│   │   └── register.html   # Página de registro
│   ├── __tests__/          # Pruebas unitarias y de integración
│   ├── __mocks__/          # Mocks para testing
│   ├── index.js            # Servidor Express
│   ├── Dockerfile          # Imagen dockerizable
│   ├── jest.config.js      # Configuración de Jest
│   ├── jest.setup.js       # Configuración inicial de Jest
│   └── package.json        # Dependencias y scripts
├── .github/                # Configuración de GitHub Actions
│   └── workflows/
│       └── front-auth.yml  # CI/CD para autenticación
└── .gitignore              # Archivos ignorados por Git
```

---

## 🔄 CI/CD

Este proyecto incluye un flujo de trabajo de integración y despliegue continuo con **GitHub Actions** y **Railway**. Cada push o pull request a la rama `front_auth` ejecuta automáticamente:

- Instalación de dependencias
- Validación de código
- Pruebas automatizadas (`jest`)
- Despliegue automático en Railway

### Configuración de CI/CD

El workflow se encuentra en: `.github/workflows/front-auth.yml`

---

## 🔗 Integración con Backend

El frontend se conecta con el backend de HarmoniChat mediante API REST:

- **Backend URL (desarrollo)**: `http://localhost:8080`
- **Backend URL (producción)**: `https://backend-hc.up.railway.app`
- **App URL (desarrollo)**: `http://localhost:3001`
- **App URL (producción)**: `https://app-hc.up.railway.app`

La configuración se encuentra en: `auth-frontend/public/scripts/config.js`

### Endpoints utilizados:

- `POST /user/login` - Inicio de sesión
- `POST /user/register` - Registro de usuario
- `GET /user/validate-document` - Validación de documento

---

## 📱 Páginas y Rutas

| Ruta          | Descripción                          |
|---------------|--------------------------------------|
| `/`           | Página de inicio de sesión           |
| `/registro`   | Página de registro de usuario        |

---

## 🔒 Seguridad

- Validación de contraseñas con requisitos de complejidad
- Validación de documentos de identidad
- Sanitización de inputs del usuario
- Comunicación segura con el backend mediante HTTPS en producción
- Manejo seguro de tokens de autenticación

---

## 👥 Autores

- Natalia Cajiao Castillo - [@natalia4566](https://github.com/natalia4566)
- Alfonso Miguel Hernández - [@FonzHdz](https://github.com/FonzHdz)
- Ricardo Stiven Hernández - [@Stivenhdez2308](https://github.com/Stivenhdez2308)
- Esteban Marini Viteri - [@EstebanMaVi](https://github.com/EstebanMaVi)
- Juan Sebastian Valderrama - [@Xunni1e](https://github.com/Xunni1e)

---

<div align="center">

  <sub>Construido con 💖 por el equipo de HarmoniChat</sub>

</div>

