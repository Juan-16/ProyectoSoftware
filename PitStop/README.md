<div align="center">

# PitStop

### Aplicación móvil para gestión de servicios automotrices

*Conecta personas con talleres. Gestiona vehículos, servicios y notificaciones desde un solo lugar.*

![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-Expo-0EA5E9?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>

-----

## Descripción

**PitStop** es una aplicación móvil Android que conecta a usuarios con talleres mecánicos, facilitando la gestión de vehículos, la creación de solicitudes de servicio y el envío de notificaciones en tiempo real. El repositorio incluye:

- **App móvil** — Frontend desarrollado con React Native + Expo (`app/`, `components/`)
- **Backend REST** — API Node.js ubicada en `Backend/`
- **Recursos estáticos** — Imágenes y assets en `assets/`

-----

## Características

|Módulo           |Descripción                                              |
|-----------------|---------------------------------------------------------|
|**Autenticación**|Registro y login para usuarios y talleres                |
|**Perfiles**     |Perfil de persona y taller con edición completa          |
|**Vehículos**    |Agregar y listar vehículos por usuario                   |
|**Servicios**    |Crear y administrar solicitudes de servicio para talleres|
|**Alertas**      |Notificaciones programadas y gestión de alertas          |
|**Mapas**        |Selección de ubicación mediante componente `MapPicker`   |

-----

## Requisitos previos

Antes de instalar el proyecto, asegúrate de contar con:

- **Node.js** `v24.13.0`
- **Expo CLI** — `npm install -g expo-cli`
- **Android** — La app móvil es exclusiva para Android (no compatible con iOS)
- Cuenta y proyecto configurado en **Firebase**

-----

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd PitStop
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd Backend && npm install
```

-----

## Configuración

### Variables de entorno

Crea un archivo `.env` en la **raíz del proyecto** con las siguientes variables:

```env
# URL del backend (reemplaza con tu IP local en desarrollo)
EXPO_PUBLIC_API_URL=http://<direccion_ip>:3000

# Firebase
FIREBASE_API_KEY=tu_firebase_api_key

# Correo electronico (para notificaciones)
EMAIL_USER=tu_correo@ejemplo.com
EMAIL_PASS=tu_contrasena
```

### Firebase

Configura las credenciales de Firebase en los siguientes archivos:

|Archivo                         |Descripción                                          |
|--------------------------------|-----------------------------------------------------|
|`firebase.config.ts`            |Configuración del SDK de Firebase para el cliente    |
|`Backend/serviceAccountKey.json`|Credenciales de la cuenta de servicio para el backend|


> **Importante:** Nunca subas `serviceAccountKey.json` ni tu `.env` al repositorio. Asegúrate de que ambos estén incluidos en `.gitignore`.

-----

## Ejecución en desarrollo

### Backend (Node.js)

```bash
cd Backend
node server.js
```

El servidor se levantará en `http://localhost:3000` por defecto.

### App móvil (Expo)

Desde la raíz del proyecto:

```bash
npx expo start -e
```

Escanea el código QR con la app **Expo Go** en tu dispositivo Android.

-----

## Estructura del proyecto

```
PitStop/
│
├── Backend/                        # Servidor Node.js
│   ├── middlewares/                # Middlewares (autenticacion, validacion)
│   ├── shared/
│   │   └── services/               # Servicios compartidos entre modulos
│   └── src/
│       ├── controllers/            # Logica de negocio por dominio
│       ├── routes/                 # Definicion de rutas REST
│       ├── services/               # Servicios de capa de datos
│       ├── app.js                  # Configuracion de Express
│       ├── firebaseAdmin.js        # Inicializacion de Firebase Admin SDK
│       ├── package.json
│       └── server.js               # Punto de entrada del backend
│
├── app/                            # Pantallas y navegacion (React Native / Expo Router)
├── assets/                         # Imagenes, iconos y recursos estaticos
├── components/                     # Componentes reutilizables del frontend
│
├── .gitignore
├── app.json                        # Configuracion de Expo
├── babel.config.js
├── eslint.config.js
├── firebase.config.ts              # Configuracion Firebase (cliente)
├── global.css
├── metro.config.js
├── nativewind-env.d.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json                    # Dependencias del frontend
└── README.md
```

-----

## Arquitectura

PitStop sigue una **arquitectura por capas** tanto en el frontend como en el backend.

```
[App Android (Expo)]
        |
        |  HTTP REST
        v
[Backend Node.js — Arquitectura por capas]
    +─────────────+
    │   Routes    │  <-- Enrutamiento y definicion de endpoints
    +─────────────+
    │ Controllers │  <-- Logica de negocio y manejo de requests
    +─────────────+
    │  Services   │  <-- Acceso a datos y logica de dominio
    +─────────────+
    │ Middlewares │  <-- Autenticacion JWT, validaciones
    +─────────────+
        |
        v
[Firebase / Firestore]
```

**Frontend:** organizado con pantallas en `app/` y componentes reutilizables en `components/`, usando Expo Router para la navegacion y NativeWind (Tailwind CSS) para estilos.

**Backend:** arquitectura en capas con separacion clara entre enrutamiento (`routes/`), logica de negocio (`controllers/`), acceso a datos (`services/`) y servicios compartidos (`shared/services/`).

-----

## API / Backend

La API REST se encuentra en `Backend/src/` y sigue la siguiente estructura por capas:

|Capa         |Ubicacion         |Descripcion                       |
|-------------|------------------|----------------------------------|
|Rutas        |`src/routes/`     |Definicion de endpoints REST      |
|Controladores|`src/controllers/`|Logica de negocio por dominio     |
|Servicios    |`src/services/`   |Acceso a datos y reglas de dominio|
|Middlewares  |`middlewares/`    |Autenticacion JWT y validaciones  |

**URL base en desarrollo:**

```
http://<tu_ip_local>:3000
```

> Configura `EXPO_PUBLIC_API_URL` en tu `.env` para que la app apunte al backend correcto.

-----

## Dependencias principales

### Frontend

Consulta el `package.json` en la raiz para ver las versiones exactas. Las principales son:

- `react-native` — Framework movil
- `expo` — Plataforma de desarrollo
- `nativewind` / `tailwindcss` — Estilos mediante clases utilitarias
- `firebase` — Autenticacion y servicios en la nube

### Backend

Consulta `Backend/package.json`. Las principales son:

- `express` — Framework HTTP
- `firebase-admin` — SDK de Firebase para el servidor
- `nodemailer` — Envio de correos electronicos

-----

## Contribucion

1. Haz un fork del repositorio
1. Crea tu rama de feature: `git checkout -b feature/nueva-funcionalidad`
1. Commitea tus cambios: `git commit -m 'feat: agrega nueva funcionalidad'`
1. Haz push a la rama: `git push origin feature/nueva-funcionalidad`
1. Abre un Pull Request

-----

<div align="center">

PitStop — Todos los derechos reservados

</div>
