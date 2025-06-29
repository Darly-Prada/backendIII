# 🐾 API de Adopción de Mascotas

Backend de una aplicación para gestión de usuarios y autenticación en un sistema de adopción de mascotas. Incluye estructura escalable, documentación Swagger y pruebas automáticas.

---

## 📌 Descripción General

Este proyecto está desarrollado en **Node.js** y **Express**, utilizando **MongoDB** como base de datos y **Mongoose** para el ODM. La API permite registrar, autenticar y gestionar usuarios, y está preparada para incluir más módulos fácilmente.

---

## ⚙️ Tecnologías y Librerías

- **Node.js / Express**: Framework base del backend.
- **Mongoose**: Modelado de datos para MongoDB.
- **express-session**: Manejo de sesiones.
- **bcrypt**: Hasheo de contraseñas.
- **Swagger**: Documentación de la API.
- **Winston**: Logger profesional.
- **Mocha / Chai / MongoMemoryServer**: Testing de endpoints.

---

## 🏗️ Estructura del Proyecto

src/
  app.js                     → Punto de entrada del servidor
  controllers/
    users.controller.js      → Controlador para usuarios
    sessions.controller.js   → Controlador para sesiones
  dao/models/
    User.js                  → Modelo de usuario con Mongoose
  middlewares/
    logger.middleware.js     → Middleware para logging
  routes/
    users.router.js          → Rutas de usuario
    sessions.routes.js       → Rutas de sesión
  test/
    users.test.js            → Test de endpoints de usuario
    sessions.test.js         → Test de endpoints de sesión
  utils/
    logger.js                → Configuración de Winston logger
  docs/
    swagger.js               → Configuración de Swagger

## 📘 Documentación con Swagger 
- El proyecto incluye documentación interactiva con Swagger. 