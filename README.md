# API de Inventario TIC — Prueba Técnica

Mini API en Node.js + Express que expone el inventario de equipos del área de TIC.

## Requisitos

- Node.js 18 o superior
- npm
- Git

## Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd prueba-tecnica-tic
npm install
npm start
```

El servidor queda levantado en `http://localhost:3000`.

Verifica que funcione abriendo `http://localhost:3000/api/equipos` en el navegador.

## Endpoints actuales

| Método | Ruta                | Descripción                    |
|--------|---------------------|--------------------------------|
| GET    | `/`                 | Mensaje de bienvenida          |
| GET    | `/api/equipos`      | Lista completa de equipos      |
| GET    | `/api/equipos/:id`  | Un equipo por su id            |

## Estructura

```
prueba-tecnica-tic/
├── data/
│   └── equipos.json      <- datos de ejemplo (no hace falta modificarlo)
├── server.js             <- toda la lógica de la API
├── package.json
└── README.md
```

## Antes de empezar

Crea tu propia rama de trabajo:

```bash
git checkout -b prueba-<tu-nombre>
```

Haz un commit por cada tarea que completes, con un mensaje que describa el cambio.
No necesitas hacer `push`: al final mostrarás tu historial con `git log --oneline`.
