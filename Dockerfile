# Etapa de compilación
FROM node:20.15.0-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . 
RUN npm run build 

# Etapa de producción
FROM node:alpine as production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=builder /app/dist ./dist

# Configurar entorno de producción
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD [ "node", "dist/app.js" ]