# Examen Técnico Back APIs

API en Node.js y TypeScript con tres módulos: gestión de colaboradores, progreso por lección y carga de videos en almacenamiento local. No utiliza base de datos: los registros se cargan desde archivos del proyecto y se mantienen en memoria mientras el servidor está en ejecución.

## Requisitos

- Node.js 20 o superior

## Ejecución

```bash
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000/api`.

### Configuración

Las variables se definen en el entorno del proceso (por ejemplo, `set PORT=4000` en CMD antes de iniciar). El archivo `.env.example` documenta los valores disponibles.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `VIDEO_STORAGE_DIR` | Directorio donde se guardan los videos | `storage/videos` |
| `MAX_VIDEO_SIZE_MB` | Tamaño máximo por video, en megabytes | `50` |

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga automática |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run check` | Verifica tipos sin compilar |

## Pruebas

El procedimiento para verificar cada módulo con Insomnia o Postman, con los casos de éxito y de error esperados, está en [GUIA_DE_PRUEBAS.md](GUIA_DE_PRUEBAS.md).

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
│   ├── progreso/
│   └── videos/
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

## Módulo 3: Carga segura de videos

Los archivos se guardan en el disco local, en el directorio indicado por `VIDEO_STORAGE_DIR` (por defecto `storage/videos`, excluido del control de versiones). Los metadatos de cada video (identificador, colaborador, tamaño y fecha) se conservan en memoria.

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| POST | `/api/colaboradores/:colaboradorId/videos` | Sube un video (`multipart/form-data`, campo `video`) | 201, 400, 404, 413, 415 |
| GET | `/api/colaboradores/:colaboradorId/videos` | Lista los videos del colaborador | 200, 404 |
| GET | `/api/colaboradores/:colaboradorId/videos/:videoId` | Entrega el video; admite solicitudes por rango | 200, 206, 404 |

Ejemplo de carga:

```bash
curl -X POST http://localhost:3000/api/colaboradores/<id>/videos -F "video=@clip.mp4;type=video/mp4"
```

### Validaciones

Un archivo debe superar cuatro controles para quedar almacenado:

1. **Extensión y tipo declarado:** deben ser `.mp4` y `video/mp4`. Se verifican antes de escribir en disco; si no coinciden se responde 415.
2. **Contenido real:** la extensión y el tipo los declara el cliente y pueden falsificarse. Por ello se verifica la firma `ftyp` en los bytes 4 a 7 de la cabecera del archivo. Si no coincide se responde 415 y el archivo se elimina.
3. **Tamaño máximo:** 50 MB por defecto (configurable con `MAX_VIDEO_SIZE_MB`). Se considera adecuado para videos de capacitación breves y protege el espacio en disco. Al excederlo la carga se corta, se elimina lo recibido y se responde 413.
4. **Un solo archivo por solicitud**, en el campo `video`; de lo contrario se responde 400.

### Almacenamiento y acceso

- El nombre en disco es un UUID generado por el servidor más la extensión `.mp4`. El nombre original del cliente no se utiliza. Ese mismo UUID es el identificador único del video.
- La ruta del archivo se obtiene del registro del video, nunca de lo enviado en la URL, lo que evita el recorrido de rutas.
- Un video solo se entrega al colaborador que lo subió; en cualquier otro caso se responde 404.
- Todo archivo rechazado se elimina del disco.
- La respuesta incluye `X-Content-Type-Options: nosniff` y soporta solicitudes por rango, lo que permite reproducir y avanzar el video desde un navegador.

### Alcance

- Los metadatos están en memoria: tras reiniciar el servidor los archivos permanecen en disco, pero dejan de listarse.
- No se realiza análisis antivirus ni autenticación, ya que no forman parte de los requisitos.

## Decisiones técnicas

- **Express con TypeScript:** se eligieron por su compatibilidad con el stack de la vacante (Node.js y TypeScript). Express permite estructurar la API por capas con poca configuración y el modo estricto de TypeScript detecta errores antes de ejecutar.
- **Validación con Zod:** los esquemas describen el formato esperado y producen mensajes de error claros.
- **Errores centralizados:** los servicios lanzan errores HTTP tipados y un único middleware los convierte en respuesta.
- **Carga con Multer:** el archivo se transmite directamente a disco en lugar de mantenerse completo en memoria.
- **Persistencia en memoria:** al no existir base de datos, los cambios se pierden al reiniciar el servidor.
