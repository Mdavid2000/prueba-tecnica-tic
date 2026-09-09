# Panel de Inventario TIC — Prueba Técnica

Aplicación en Node.js + Express que expone el inventario de equipos del área de
TIC a través de una API, con un panel web que consume esa API.

## Requisitos

- Node.js 18 o superior
- npm
- Git

## Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd prueba-tecnica-tic
npm install
npm run dev
```

Abre `http://localhost:3000` en tu navegador: ahí está el panel.

> `npm run dev` reinicia el servidor solo cada vez que guardas un cambio.
> Si prefieres arrancarlo sin recarga automática, usa `npm start` (en ese caso
> debes detenerlo con Ctrl+C y volver a levantarlo tras cada modificación).

## Cómo está organizado

```
prueba-tecnica-tic/
├── data/
│   └── equipos.json      <- datos de ejemplo (no hace falta modificarlo)
├── public/               <- panel web (no hace falta modificarlo)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js             <- toda la lógica de la API: aquí trabajas
├── package.json
└── README.md
```

**Solo necesitas modificar `server.js`.** El panel de `public/` ya está hecho y
solo consume la API: a medida que corrijas y agregues endpoints, la interfaz irá
mostrando la información completa por sí sola.

## Endpoints actuales

| Método | Ruta                | Descripción                    |
|--------|---------------------|--------------------------------|
| GET    | `/`                 | Panel web                      |
| GET    | `/api`              | Información de la API          |
| GET    | `/api/equipos`      | Lista completa de equipos      |
| GET    | `/api/equipos/:id`  | Un equipo por su id            |

## Cómo saber si vas bien

Al final del panel hay una sección **Estado de la API** que revisa qué responde
el servidor en ese momento. Recarga la página después de cada cambio: lo que
esté pendiente pasará a "Responde" cuando el endpoint funcione.

## Antes de empezar

Crea tu propia rama de trabajo:

```bash
git checkout -b prueba_<tu-nombre>
```

Haz un commit por cada tarea que completes, con un mensaje que describa el
cambio. No necesitas hacer `push`: al final mostrarás tu historial con
`git log --oneline`.

## Verificar tu avance

Con el servidor levantado en una terminal, abre otra y ejecuta:

```bash
npm run verificar
```

Revisa el comportamiento de la API y te dice, tarea por tarea, qué responde
correctamente y qué falta. No revisa cómo escribiste el código: cualquier
solución que devuelva el resultado esperado pasa la revisión.
