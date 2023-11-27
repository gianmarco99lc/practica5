# Usa una imagen oficial de Node.js como base
FROM node:14

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el package.json y el package-lock.json para instalar las dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Expón el puerto en el que tu aplicación escucha (ajusta según sea necesario)
EXPOSE 4000

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]