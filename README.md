# Examen Técnico Back APIs

API en Node.js y TypeScript con tres módulos: gestión de colaboradores, progreso por lección y carga de videos en almacenamiento local. No usa base de datos: los registros se cargan desde archivos del proyecto.

## Requisitos

- Node.js 20 o superior

## Ejecución

```bash
npm install
npm run dev
```

La API queda en `http://localhost:3000/api`. El puerto se cambia con la variable `PORT` (ver `.env.example`).

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor con recarga automática |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run check` | Revisa tipos sin compilar |

## Estructura

```
src/
├── config/        variables de entorno
├── errors/        errores HTTP con su código de estado
├── middlewares/   manejo de errores y rutas inexistentes
├── routes/        qué URL responde a qué controlador
├── app.ts         configura Express
└── server.ts      arranca el servidor
```

Cada módulo se organiza en capas: ruta → controlador → servicio → repositorio. El controlador solo traduce HTTP, el servicio contiene las reglas y el repositorio es el único que toca los datos.

## Decisiones

- **Express + TypeScript**, el stack pedido en la vacante.
- **Errores centralizados:** los servicios lanzan errores HTTP tipados y un único middleware los convierte en respuesta.
