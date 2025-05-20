FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto que usará Railway
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]