# 👨‍👩‍👧‍👦 HarmoniChat - Red Social Familiar

<div align="center">
  <img src="Logo%20HarmoniChat.png" alt="HarmoniChat Logo" width="180"/>
  <br /><br />

  [![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Styled Components](https://img.shields.io/badge/Styled--Components-6.1.8-DB7093?logo=styled-components)](https://styled-components.com/)
</div>

---

## 📝 Descripción

**HarmoniChat** es una red social privada y segura diseñada para conectar a los miembros de una familia en un espacio digital íntimo. Ofrece herramientas de comunicación en tiempo real, organización de eventos, gestión de miembros y mucho más, todo con un diseño accesible, moderno y responsive.

> Ideal para familias que desean mantenerse unidas a pesar de la distancia, sin depender de redes sociales públicas.

---

## ✨ Funcionalidades Destacadas

- 👤 **Perfiles familiares personalizados**
- 🖼️ **Galería para compartir momentos en fotos**
- 💬 **Chat en tiempo real vía WebSockets**
- 🔐 **Sistema de autenticación seguro**
- 👪 **Gestión de grupos y miembros familiares**
- 🛠️ **Pipeline de integración continua con validación automática**

---

## ⚙️ Tecnologías & Herramientas

### 🔧 **Frontend**
- React 18.2.0 + TypeScript 4.9.5
- React Router DOM 7.5.3
- Styled Components 6.1.8
- Socket.IO Client 4.8.1

### 🧪 **Testing y Calidad**
- Jest + React Testing Library
- ESLint + Prettier
- Husky + lint-staged para validaciones en `pre-commit`
- Babel & Webpack

### 🐳 **Infraestructura**
- Docker para desarrollo y despliegue
- GitHub Actions (CI/CD)

---

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/HarmoniChat-App.git
cd HarmoniChat-App/Proyecto-Informatico-2
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar entorno de desarrollo
```bash
npm start
```

---

## 📦 Scripts Disponibles

| Script               | Descripción                                  |
|----------------------|----------------------------------------------|
| `npm start`          | Inicia servidor de desarrollo (localhost:3000) |
| `npm build`          | Compila el proyecto para producción          |
| `npm test`           | Ejecuta pruebas unitarias y de integración   |
| `npm run lint`       | Analiza el código con ESLint                 |
| `npm run lint:fix`   | Arregla errores de lint automáticamente      |
| `npm run test:watch` | Ejecuta pruebas en modo interactivo          |

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

### Validación automática con Husky:
Al realizar un commit, se ejecutan automáticamente:
- Lint (`eslint`)
- Pruebas (`jest`)
- Formateo (`prettier`)

Configurado en `.husky/pre-commit`.

---

## 🐳 Docker

### Construcción de imagen
```bash
docker build -t harmonichat .
```

### Ejecución del contenedor
```bash
docker run -p 3000:3000 harmonichat
```

---

## 🗂️ Estructura del Proyecto

```
Proyecto-Informatico-2/
├── public/               # Archivos estáticos
├── src/                  # Código fuente principal
│   ├── assets/           # Imágenes y recursos multimedia
│   ├── components/       # Componentes reutilizables
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Vistas principales (Home, Chat, etc.)
│   ├── services/         # API y lógica de conexión
│   ├── styles/           # Estilos globales
│   └── utils/            # Funciones utilitarias
├── .github/              # Configuración de GitHub Actions
├── .husky/               # Hooks de git para validaciones
├── Dockerfile            # Imagen dockerizable
├── jest.config.js        # Configuración de Jest
├── babel.config.js       # Configuración de Babel
├── tsconfig.json         # Configuración de TypeScript
├── package.json          # Dependencias y scripts
└── README.md
```

---

## 🔄 CI/CD

Este proyecto incluye un flujo de trabajo de integración y despliegue continuo con **GitHub Actions**. Cada push o pull request ejecuta automáticamente:

- Validación de código (`lint`)
- Pruebas automatizadas (`jest`)
- Build de producción (`npm run build`)
- (Opcional) Deploy automático con Docker o Vercel/Netlify

---

## 👥 Autores

- Natalia Cajiao Castillo - [@natalia4566](https://github.com/natalia4566)
- Alfonso Miguel Hernánez - [@FonzHdz](https://github.com/FonzHdz)
- Ricardo Stiven Hernández - [@Stivenhdez2308](https://github.com/Stivenhdez2308)
- Esteban Marini Viteri - [@EstebanMaVi](https://github.com/EstebanMaVi)
- Juan Sebastian Valderrama - [@Xunni1e](https://github.com/Xunni1e)

---

<div align="center">
  <sub>Construido con 💖 por el equipo de HarmoniChat</sub>
</div>
