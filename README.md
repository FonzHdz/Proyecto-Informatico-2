# 👨‍👩‍👧‍👦 HarmoniChat - Red Social Familiar (Frontend)

<div align="center">
  <img src="public/Logo.png" alt="HarmoniChat Logo" width="180"/>

  <br /><br />

  [![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Styled Components](https://img.shields.io/badge/Styled--Components-6.1.8-DB7093?logo=styled-components)](https://styled-components.com/)
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  [![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?logo=railway)](https://auth-hc.up.railway.app/)
</div>

---

## 📝 Descripción

**HarmoniChat** es una red social privada y segura diseñada para conectar a los miembros de una familia en un espacio digital íntimo. Este repositorio contiene la aplicación frontend desarrollada con React y TypeScript.

> Ideal para familias que desean mantenerse unidas a pesar de la distancia, sin depender de redes sociales públicas.

### 🌐 Demo en vivo
Puedes acceder a la aplicación desplegada en: [https://auth-hc.up.railway.app/](https://auth-hc.up.railway.app/)

---

## ✨ Funcionalidades Destacadas

### 👤 Perfil y Autenticación
- Perfiles familiares personalizados
- Sistema de autenticación seguro
- Gestión de grupos y miembros familiares
- Personalización de avatar y datos personales

### 💬 Comunicación
- Chat en tiempo real vía WebSockets
- ChatBot integrado para asistencia
- Mensajes con soporte para Markdown
- Notificaciones en tiempo real

### 🎭 Diario Emocional
- Registro diario de emociones
- Seguimiento del estado de ánimo
- Estadísticas y gráficos de emociones
- Consejos personalizados según el estado emocional

### 🖼️ Galería y Recuerdos
- Álbum familiar compartido
- Compartir fotos y momentos especiales
- Organización por categorías y fechas
- Comentarios y reacciones en las publicaciones

### 📱 Muro Social
- Publicaciones con formato enriquecido
- Interacción mediante likes y comentarios
- Compartir ubicaciones
- Integración de emojis y contenido multimedia

### 🛠️ Características Generales
- Interfaz moderna y responsive
- Modo oscuro/claro
- Notificaciones push
- Sistema de alertas y popups
- Integración con servicios de ubicación
- Soporte para múltiples idiomas

---

## ⚙️ Tecnologías & Herramientas

### 🔧 **Frontend**
- React 18.2.0 + TypeScript 4.9.5
- React Router DOM 7.5.3
- Styled Components 6.1.8
- Socket.IO Client 4.8.1
- Emoji Mart para selección de emojis
- React Places Autocomplete para ubicaciones
- React Markdown para contenido enriquecido

### 🧪 **Testing y Calidad**
- Jest + React Testing Library
- ESLint + Prettier
- Babel para transpilación

### 🐳 **Infraestructura**
- Docker para desarrollo y despliegue
- Nginx para servidor web
- Railway para despliegue y hosting

---

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/HarmoniChat-App.git
cd HarmoniChat-App/Proyecto-Informatico-2
git checkout front_app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar entorno de desarrollo
```bash
npm start
```

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
railway up
```

---

## 📦 Scripts Disponibles

| Script               | Descripción                                  |
|----------------------|----------------------------------------------|
| `npm start`          | Inicia servidor de desarrollo (localhost:3001) |
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

---

## 🐳 Docker

### Construcción de imagen
```bash
docker build -t harmonichat-frontend .
```

### Ejecución del contenedor
```bash
docker run -p 3001:3001 harmonichat-frontend
```

---

## 🗂️ Estructura del Proyecto

```
Proyecto-Informatico-2/
├── public/               # Archivos estáticos
├── src/                  # Código fuente principal
│   ├── components/       # Componentes reutilizables
│   ├── context/         # Contextos de React
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Funciones utilitarias
│   ├── App.tsx          # Componente principal
│   ├── index.tsx        # Punto de entrada
│   └── index.css        # Estilos globales
├── .github/             # Configuración de GitHub Actions
├── Dockerfile           # Imagen dockerizable
├── nginx.conf           # Configuración de Nginx
├── jest.config.js       # Configuración de Jest
├── babel.config.js      # Configuración de Babel
├── tsconfig.json        # Configuración de TypeScript
└── package.json         # Dependencias y scripts
```

---

## 🔄 CI/CD

Este proyecto incluye un flujo de trabajo de integración y despliegue continuo con **GitHub Actions** y **Railway**. Cada push o pull request ejecuta automáticamente:

- Validación de código (`lint`)
- Pruebas automatizadas (`jest`)
- Build de producción (`npm run build`)
- Despliegue automático en Railway

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
