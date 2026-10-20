# Guía de pruebas manuales

Procedimiento para verificar cada módulo con un cliente HTTP (Insomnia o Postman). Todas las rutas parten de `http://localhost:3000/api` con el servidor iniciado mediante `npm run dev`.

Los datos viven en memoria: al reiniciar el servidor se restauran los registros semilla y se pierde lo creado durante la prueba.

## Preparación

1. Iniciar el servidor: `npm run dev`.
2. Verificar `GET /api/health`. Debe responder 200.
3. Obtener identificadores con `GET /api/colaboradores` y copiar el `id` de cualquier colaborador. En adelante se indica como `<id>`.

Para las pruebas de video, crear los archivos de apoyo fuera del proyecto (CMD):

```
cd %USERPROFILE%\Desktop
echo contenido de prueba > prueba.txt
copy prueba.txt falso.mp4
```

Además se necesita cualquier archivo MP4 real.

## Módulo 1: Colaboradores

En las peticiones con cuerpo: Body de tipo JSON.

### Crear colaborador

`POST /api/colaboradores`

```json
{ "nombre": "Ana Ruiz", "correo": "ana@empresa.com", "puesto": "Analista" }
```

| Caso | Esperado |
|---|---|
| Cuerpo válido | 201 con el colaborador y su `id` generado |
| Repetir la misma petición | 409, correo duplicado |
| Omitir `nombre` o enviar un correo inválido | 400 con el detalle de los campos |

### Sincronizar registros

`POST /api/colaboradores/sincronizacion`

Sustituir el primer `id` y su correo por los de un colaborador existente.

```json
{
  "colaboradores": [
    { "id": "<id existente>", "nombre": "Nombre actualizado", "correo": "<correo existente>", "puesto": "Nuevo puesto" },
    { "id": "nuevo-001", "nombre": "Pedro Lara", "correo": "pedro@empresa.mx", "puesto": "Soporte" },
    { "id": "nuevo-002", "nombre": "", "correo": "no-es-correo", "puesto": "" }
  ]
}
```

Esperado: 200 con `creados: 1`, `actualizados: 1` y un elemento en `rechazados` con `posicion: 3` y su motivo. Enviar un cuerpo sin la lista `colaboradores` responde 400.

### Eliminación lógica

1. `DELETE /api/colaboradores/<id>` responde 204 sin cuerpo.
2. `GET /api/colaboradores/<id>` responde 404.
3. `GET /api/colaboradores` ya no incluye al colaborador.
4. Repetir el `DELETE` responde 404.

## Módulo 2: Progreso por lección

Cursos disponibles: `seguridad` (lecciones `seg-01` a `seg-04`) y `apis` (lecciones `api-01` a `api-05`).

### Registrar avance

`POST /api/progreso`

```json
{ "colaboradorId": "<id>", "cursoId": "seguridad", "leccionId": "seg-01", "porcentaje": 100 }
```

| Caso | Esperado |
|---|---|
| Datos válidos | 200 con el avance registrado |
| `porcentaje` de 150 o decimal | 400 |
| Colaborador inexistente o eliminado | 404 |
| Curso inexistente | 404 |
| Lección que pertenece a otro curso (`api-01` en `seguridad`) | 404 |
| Enviar 40 después de haber registrado 100 | 200, se conserva 100 |

### Consultar lecciones

`GET /api/progreso/colaboradores/<id>/cursos/seguridad`

Esperado: 200 con `seg-01` en `cursadas` y el resto en `noCursadas`, cada una con su porcentaje parcial. Un curso inexistente responde 404.

## Módulo 3: Videos

### Subir un video

`POST /api/colaboradores/<id>/videos`

- Insomnia: Body, Multipart Form; agregar el campo `video` y cambiar su tipo a File.
- Postman: Body, form-data; clave `video`, tipo File.

| Caso | Esperado |
|---|---|
| MP4 real | 201 con `id` (UUID), `nombreArchivo`, `tamanioBytes` y `creadoEn` |
| `prueba.txt` | 415, formato no admitido |
| `falso.mp4` (texto con extensión MP4) | 415, el contenido no corresponde a un MP4 |
| Sin archivo | 400 |
| Campo con nombre distinto de `video` | 400 |
| Colaborador inexistente | 404 |
| MP4 mayor al límite | 413 |

Para comprobar el límite sin un archivo grande, reiniciar el servidor con un límite menor y subir un MP4 más pesado (CMD, dentro del proyecto):

```
set MAX_VIDEO_SIZE_MB=1 && npm run dev
```

Si el cliente muestra un corte de conexión en lugar del 413, repetir con un archivo de pocos megabytes: el servidor interrumpe la recepción al superar el límite y algunos clientes cierran antes de leer la respuesta.

### Listar y obtener videos

1. `GET /api/colaboradores/<id>/videos` devuelve la lista de videos del colaborador.
2. `GET /api/colaboradores/<id>/videos/<videoId>` entrega el archivo. El cliente puede reproducirlo en la vista previa, o puede abrirse la URL en el navegador.
3. Usar el `<videoId>` con el id de otro colaborador responde 404.
4. Un `<videoId>` inexistente responde 404.

## Verificación estática

```
npm run check
npm run build
```

Ambos comandos deben terminar sin errores.
