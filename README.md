# 👨‍👩‍👧‍👦 HarmoniChat - Red Social Familiar (Backend)

<div align="center">

  <img src="Logo%20HarmoniChat.png" alt="HarmoniChat Logo" width="180"/>

  <br /><br />

  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
  [![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk)](https://www.oracle.com/java/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?logo=postgresql)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

</div>

---

## 📝 Descripción

**HarmoniChat Backend** es la API REST que potencia la red social familiar HarmoniChat. Proporciona un backend robusto y escalable construido con Spring Boot, ofreciendo servicios de autenticación, gestión de usuarios, comunicación en tiempo real, almacenamiento de archivos, análisis de imágenes con IA y mucho más.

> Backend diseñado para soportar una red social privada y segura que conecta a los miembros de una familia en un espacio digital íntimo.

---

## ✨ Funcionalidades Destacadas

- 🔐 **Sistema de autenticación JWT** - Autenticación segura con tokens JWT
- 👤 **Gestión de usuarios y perfiles** - CRUD completo de usuarios y familias
- 💬 **Chat en tiempo real** - WebSockets para comunicación instantánea
- 🤖 **Chatbot con IA** - Integración con Google Gemini para asistencia inteligente
- 📸 **Álbumes automáticos** - Generación inteligente de álbumes usando Azure Computer Vision y análisis de texto
- 📝 **Sistema de posts y comentarios** - Publicaciones con likes, reacciones y comentarios en tiempo real
- 📅 **Diario de emociones** - Registro y seguimiento del estado emocional de los usuarios
- 🖼️ **Almacenamiento en la nube** - Azure Blob Storage para imágenes y archivos multimedia
- 📧 **Servicio de correo electrónico** - Notificaciones y verificación de emails
- 🔄 **Caché inteligente** - Optimización de rendimiento con Caffeine Cache
- 🔁 **Reintentos automáticos** - Manejo resiliente de errores con Spring Retry

---

## ⚙️ Tecnologías & Herramientas

### 🔧 **Backend Core**
- Spring Boot 3.4.3
- Java 21
- Spring Data JPA
- Spring WebFlux
- Spring WebSocket

### 🗄️ **Base de Datos**
- PostgreSQL 16
- Flyway (migraciones de base de datos)
- HikariCP (pool de conexiones)

### 🔐 **Seguridad & Autenticación**
- JWT (JSON Web Tokens)
- Spring Security (configuración personalizada)

### ☁️ **Servicios en la Nube**
- **Azure Blob Storage** - Almacenamiento de archivos
- **Azure Computer Vision** - Análisis de imágenes
- **Azure Text Analytics** - Análisis de texto
- **Google Cloud Vertex AI (Gemini)** - Chatbot con IA

### 🛠️ **Utilidades**
- Lombok - Reducción de código boilerplate
- Spring Retry - Reintentos automáticos
- Caffeine Cache - Sistema de caché en memoria
- Spring Mail - Envío de correos electrónicos
- Apache Commons Lang & Text - Utilidades de texto

### 🧪 **Testing**
- JUnit 5
- Mockito
- Spring Boot Test

### 🐳 **Infraestructura**
- Docker para contenedorización
- GitHub Actions (CI/CD)
- Railway para despliegue

---

## 🛠️ Instalación

### Prerrequisitos

- Java 21 o superior
- Maven 3.9+ 
- PostgreSQL 16+
- Docker (opcional, para ejecución con contenedores)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/HarmoniChat-Backend.git
cd HarmoniChat-Backend
```

### 2. Configurar la base de datos

Crear una base de datos PostgreSQL y configurar las credenciales en `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app_hc
    username: tu_usuario
    password: tu_contraseña
```

### 3. Configurar variables de entorno

Configurar las credenciales de los servicios en la nube en `application.yml`:
- Azure Blob Storage
- Azure Computer Vision
- Azure Text Analytics
- Google Cloud Vertex AI (Gemini)
- Configuración de SMTP para emails

### 4. Ejecutar migraciones

Las migraciones de Flyway se ejecutan automáticamente al iniciar la aplicación.

### 5. Compilar y ejecutar

```bash
# Compilar el proyecto
mvn clean install

# Ejecutar la aplicación
mvn spring-boot:run
```

La aplicación estará disponible en `http://localhost:8080`

---

## 📦 Scripts Disponibles

| Comando                    | Descripción                                          |
|----------------------------|------------------------------------------------------|
| `mvn clean install`        | Compila el proyecto y ejecuta tests                 |
| `mvn spring-boot:run`      | Inicia la aplicación en modo desarrollo             |
| `mvn clean package`        | Genera el JAR ejecutable para producción            |
| `mvn test`                 | Ejecuta todas las pruebas unitarias                 |
| `mvn clean test`           | Limpia y ejecuta las pruebas                        |
| `mvn flyway:migrate`       | Ejecuta migraciones de base de datos manualmente    |
| `mvn flyway:info`          | Muestra información sobre el estado de migraciones  |

---

## 🧪 Testing

### Ejecutar pruebas unitarias:

```bash
mvn test
```

### Ejecutar pruebas con cobertura:

```bash
mvn clean test jacoco:report
```

### Estructura de tests

Los tests se encuentran en `src/test/java` y cubren:
- Servicios de comentarios
- Servicios de emociones
- Servicios de posts y likes
- Servicios de reacciones

---

## 🐳 Docker

### Construcción de imagen

```bash
docker build -t harmonichat-backend .
```

### Ejecución del contenedor

```bash
docker run -p 8080:8080 harmonichat-backend
```

### Docker Compose (con PostgreSQL)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: app_hc
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  
  backend:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/app_hc
```

---

## 🗂️ Estructura del Proyecto

```
HarmoniChat-Backend/
├── src/
│   ├── main/
│   │   ├── java/com/harmoniChat/app_hc/
│   │   │   ├── api/v1/controllers/      # Controladores REST y WebSocket
│   │   │   │   ├── album/               # Gestión de álbumes
│   │   │   │   ├── auth/                # Autenticación
│   │   │   │   ├── blob_storage/        # Almacenamiento de archivos
│   │   │   │   ├── chat/                # Chat en tiempo real
│   │   │   │   ├── chatbot/            # Chatbot con IA
│   │   │   │   ├── comment/            # Comentarios
│   │   │   │   ├── emotion_diary/      # Diario de emociones
│   │   │   │   ├── family/             # Gestión de familias
│   │   │   │   ├── post/               # Posts y likes
│   │   │   │   ├── reaction/           # Reacciones
│   │   │   │   └── user/               # Gestión de usuarios
│   │   │   ├── configuration/          # Configuraciones Spring
│   │   │   │   ├── BlobStorageConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── GeminiConfig.java
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── WebSocketConfig.java
│   │   │   ├── entities_repositories_and_services/
│   │   │   │   ├── album/              # Entidades y servicios de álbumes
│   │   │   │   ├── auth/               # Autenticación y JWT
│   │   │   │   ├── blob_storage/     # Servicio de almacenamiento
│   │   │   │   ├── chat/              # Mensajería
│   │   │   │   ├── chatbot/           # Servicio de chatbot
│   │   │   │   ├── comment/           # Comentarios
│   │   │   │   ├── email/             # Servicio de correo
│   │   │   │   ├── emotion_diary/     # Diario de emociones
│   │   │   │   ├── family/            # Familias
│   │   │   │   ├── post/              # Posts y likes
│   │   │   │   ├── reaction/          # Reacciones
│   │   │   │   └── user/              # Usuarios
│   │   │   └── exceptions/            # Excepciones personalizadas
│   │   └── resources/
│   │       ├── application.yml        # Configuración de la aplicación
│   │       └── db/migration/          # Scripts de migración Flyway
│   │           ├── V1__create_users_table.sql
│   │           ├── V2__create_emotions_table.sql
│   │           └── ...
│   └── test/
│       └── java/com/harmoniChat/app_hc/
│           └── entities_repositories_and_services/
│               └── ...                 # Tests unitarios
├── .github/
│   └── workflows/
│       └── backend.yml                 # Pipeline CI/CD
├── Dockerfile                          # Imagen Docker
├── pom.xml                             # Dependencias Maven
└── README.md
```

---

## 🔄 CI/CD

Este proyecto incluye un flujo de trabajo de integración y despliegue continuo con **GitHub Actions**. Cada push o pull request a la rama `main` ejecuta automáticamente:

- ✅ Instalación de dependencias (`mvn clean install`)
- 🧪 Ejecución de pruebas (`mvn clean test`)
- 🚀 Despliegue automático a Railway

El pipeline está configurado en `.github/workflows/backend.yml`.

---

## 📡 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registro de nuevos usuarios
- `POST /auth/login` - Inicio de sesión

### Usuarios
- `GET /users` - Listar usuarios
- `GET /users/{id}` - Obtener usuario por ID
- `PUT /users/{id}` - Actualizar usuario

### Familias
- `GET /families` - Listar familias
- `POST /families` - Crear familia
- `GET /families/{id}` - Obtener familia por ID

### Posts
- `GET /posts` - Listar posts
- `POST /posts` - Crear post
- `GET /posts/{id}` - Obtener post por ID
- `POST /posts/{id}/like` - Dar like a un post

### Chat
- `GET /chat/messages` - Obtener mensajes
- `POST /chat/messages` - Enviar mensaje
- WebSocket: `/ws/chat` - Chat en tiempo real

### Chatbot
- `POST /chatbot/chat` - Enviar mensaje al chatbot
- WebSocket: `/ws/chatbot` - Chatbot en tiempo real

### Álbumes
- `GET /albums/family/{familyId}` - Obtener álbumes de una familia
- `POST /albums/generate/{familyId}` - Generar álbumes automáticos
- `POST /albums/create` - Crear álbum manual

### Diario de Emociones
- `GET /emotions/user/{userId}` - Obtener emociones de un usuario
- `POST /emotions` - Registrar nueva emoción

---

## 🔒 Seguridad

- Autenticación basada en JWT
- Configuración CORS personalizada
- Validación de datos con Bean Validation
- Manejo seguro de archivos en Azure Blob Storage
- Tokens de acceso con expiración configurable

---

## 🚀 Despliegue

### Railway

El proyecto está configurado para desplegarse automáticamente en Railway mediante GitHub Actions. Las variables de entorno necesarias deben configurarse en Railway:

- `PORT` - Puerto de la aplicación
- `SPRING_DATASOURCE_URL` - URL de conexión a PostgreSQL
- `SPRING_DATASOURCE_USERNAME` - Usuario de PostgreSQL
- `SPRING_DATASOURCE_PASSWORD` - Contraseña de PostgreSQL
- Credenciales de Azure y Google Cloud

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
