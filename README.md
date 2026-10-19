# Examen Técnico Back APIs

API en Node.js y TypeScript con tres módulos: gestión de colaboradores, progreso por lección y carga de videos en almacenamiento local. No utiliza base de datos: los registros se cargan desde archivos del proyecto y se mantienen en memoria mientras el servidor está en ejecución.

## Requisitos

- Node.js 20 o superior

## Ejecución

```bash
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000/api`. El puerto se modifica con la variable `PORT` (ver `.env.example`).

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga automática |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run check` | Verifica tipos sin compilar |

## Estructura

```
src/
├── config/        variables de entorno
├── errors/        errores HTTP con su código de estado
├── middlewares/   manejo de errores y rutas inexistentes
├── validation/    validación de datos de entrada
├── modules/       un directorio por módulo funcional
│   ├── colaboradores/
│   ├── cursos/
│   └── progreso/
├── routes/        registro de los módulos en la API
├── app.ts         configuración de Express
└── server.ts      arranque del servidor
```

Cada módulo se organiza en capas: ruta, controlador, servicio y repositorio. El controlador traduce HTTP, el servicio concentra las reglas de negocio y el repositorio es la única capa que accede a los datos. Las dependencias se inyectan por constructor y se ensamblan en el archivo `*.module.ts` de cada módulo.

## Módulo 1: Colaboradores

Los registros iniciales se cargan desde `src/modules/colaboradores/colaboradores.seed.json`.

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/colaboradores` | Lista los colaboradores activos | 200 |
| GET | `/api/colaboradores/:id` | Consulta un colaborador activo | 200, 404 |
| POST | `/api/colaboradores` | Crea un colaborador | 201, 400, 409 |
| POST | `/api/colaboradores/sincronizacion` | Sincroniza una lista de registros recibidos | 200, 400 |
| DELETE | `/api/colaboradores/:id` | Eliminación lógica | 204, 404 |

Los endpoints de consulta se incluyen para poder verificar el efecto de la creación, la sincronización y la eliminación.

### Reglas

- **Creación:** el servidor genera el identificador (UUID). El correo se normaliza a minúsculas y debe ser único entre colaboradores activos.
- **Eliminación lógica:** el registro se conserva y se marca con la fecha en `eliminadoEn`. Un colaborador eliminado deja de aparecer en las consultas y se responde 404 como si no existiera.
- **Sincronización:** cada registro debe incluir `id`, `nombre`, `correo` y `puesto`. Si el `id` existe se actualiza; si no, se crea. Los registros inválidos no detienen el proceso: se informan en `rechazados` con su posición y motivo. Se rechaza un registro cuando:
  - no cumple el formato esperado,
  - corresponde a un colaborador eliminado, o
  - su correo pertenece a otro colaborador activo.

Respuesta de ejemplo de la sincronización:

```json
{
  "creados": 1,
  "actualizados": 1,
  "rechazados": [
    { "posicion": 2, "motivo": "El colaborador fue eliminado y no puede sincronizarse" }
  ]
}
```

## Módulo 2: Progreso por lección

El catálogo de cursos y lecciones se carga desde `src/modules/cursos/cursos.seed.json` (cursos `seguridad` y `apis`). El progreso se conserva en memoria.

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| POST | `/api/progreso` | Registra el avance de un colaborador en una lección | 200, 400, 404 |
| GET | `/api/progreso/colaboradores/:colaboradorId/cursos/:cursoId` | Lecciones cursadas y no cursadas | 200, 404 |

Cuerpo de ejemplo para registrar avance:

```json
{
  "colaboradorId": "<id del colaborador>",
  "cursoId": "seguridad",
  "leccionId": "seg-01",
  "porcentaje": 50
}
```

### Reglas

- El porcentaje debe ser un entero entre 0 y 100.
- El colaborador debe estar activo, el curso debe existir y la lección debe pertenecer a ese curso; de lo contrario se responde 404.
- **El avance no disminuye:** se conserva el mayor porcentaje reportado. Así, un reenvío tardío o repetido no revierte una lección ya completada.
- **Lección cursada:** la que alcanzó el 100 %. Las demás se devuelven en `noCursadas` junto con su porcentaje parcial (0 si no tienen avance).
- No se exige un orden secuencial entre lecciones, ya que la prueba no lo establece.

Respuesta de ejemplo de la consulta:

```json
{
  "colaboradorId": "<id del colaborador>",
  "cursoId": "seguridad",
  "cursadas": [
    { "leccionId": "seg-01", "titulo": "Principios de seguridad", "orden": 1, "porcentaje": 100 }
  ],
  "noCursadas": [
    { "leccionId": "seg-02", "titulo": "Gestión de contraseñas", "orden": 2, "porcentaje": 0 },
    { "leccionId": "seg-03", "titulo": "Reconocimiento de phishing", "orden": 3, "porcentaje": 40 },
    { "leccionId": "seg-04", "titulo": "Manejo de incidentes", "orden": 4, "porcentaje": 0 }
  ]
}
```

## Decisiones técnicas

- **Express y TypeScript**, el stack solicitado en la vacante.
- **Validación con Zod:** los esquemas describen el formato esperado y producen mensajes de error claros.
- **Errores centralizados:** los servicios lanzan errores HTTP tipados y un único middleware los convierte en respuesta.
- **Persistencia en memoria:** al no existir base de datos, los cambios se pierden al reiniciar el servidor.
