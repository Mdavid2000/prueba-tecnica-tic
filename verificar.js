/**
 * Verificador de la API del inventario TIC.
 *
 * Comprueba QUÉ responde el servidor, no CÓMO está escrito el código.
 * Cualquier solución que cumpla el comportamiento esperado pasa la revisión,
 * sin importar si se resolvió con filter, reduce, forEach, un for clásico,
 * Number(), parseInt() o el operador ==.
 *
 * Uso:
 *   1. En una terminal:  npm run dev
 *   2. En otra terminal: npm run verificar
 */

const BASE = process.env.BASE || 'http://localhost:3000';

async function pedir(ruta) {
  try {
    const r = await fetch(BASE + ruta);
    let datos = null;
    try { datos = await r.json(); } catch (e) { datos = null; }
    return { ok: r.ok, estado: r.status, datos };
  } catch (e) {
    return { ok: false, estado: 0, datos: null, red: true };
  }
}

const pruebas = [];
const prueba = (tarea, nombre, fn) => pruebas.push({ tarea, nombre, fn });

// ── Base: no se debe romper lo que ya funcionaba ──────────────────
prueba('Base', 'GET /api/equipos devuelve los 10 equipos', async () => {
  const r = await pedir('/api/equipos');
  if (!Array.isArray(r.datos)) return 'No devolvió una lista (HTTP ' + r.estado + ')';
  if (r.datos.length !== 10) return 'Devolvió ' + r.datos.length + ' equipos en lugar de 10';
  return true;
});

// ── Tarea 1 ───────────────────────────────────────────────────────
prueba('Tarea 1', 'GET /api/equipos/1 devuelve el equipo correcto', async () => {
  const r = await pedir('/api/equipos/1');
  if (r.estado === 404) return 'Responde 404: el equipo existe, pero no lo encuentra';
  if (!r.ok) return 'Responde HTTP ' + r.estado;
  if (!r.datos || Number(r.datos.id) !== 1) return 'No devolvió el equipo con id 1';
  return true;
});

prueba('Tarea 1', 'GET /api/equipos/7 también funciona', async () => {
  const r = await pedir('/api/equipos/7');
  if (!r.ok || !r.datos || Number(r.datos.id) !== 7) return 'No devolvió el equipo con id 7';
  return true;
});

prueba('Tarea 1', 'Un id inexistente sigue respondiendo 404', async () => {
  const r = await pedir('/api/equipos/999');
  if (r.estado !== 404) return 'Respondió HTTP ' + r.estado + ' en lugar de 404';
  return true;
});

// ── Tarea 2 ───────────────────────────────────────────────────────
prueba('Tarea 2', 'Filtra por estado', async () => {
  const r = await pedir('/api/equipos?estado=disponible');
  if (!Array.isArray(r.datos)) return 'No devolvió una lista';
  if (r.datos.length !== 4) return 'Devolvió ' + r.datos.length + ' equipos, se esperaban 4';
  if (!r.datos.every((e) => e.estado === 'disponible')) return 'Incluyó equipos con otro estado';
  return true;
});

prueba('Tarea 2', 'Filtra por tipo', async () => {
  const r = await pedir('/api/equipos?tipo=laptop');
  if (!Array.isArray(r.datos)) return 'No devolvió una lista';
  if (r.datos.length !== 3) return 'Devolvió ' + r.datos.length + ' equipos, se esperaban 3';
  if (!r.datos.every((e) => e.tipo === 'laptop')) return 'Incluyó equipos de otro tipo';
  return true;
});

prueba('Tarea 2', 'Combina ambos filtros', async () => {
  const r = await pedir('/api/equipos?estado=disponible&tipo=laptop');
  if (!Array.isArray(r.datos)) return 'No devolvió una lista';
  if (r.datos.length !== 1) return 'Devolvió ' + r.datos.length + ' equipos, se esperaba 1';
  return true;
});

prueba('Tarea 2', 'Sin parámetros sigue devolviendo todo', async () => {
  const r = await pedir('/api/equipos');
  if (!Array.isArray(r.datos) || r.datos.length !== 10) return 'La lista completa dejó de funcionar';
  return true;
});

// ── Tarea 3 ───────────────────────────────────────────────────────
prueba('Tarea 3', 'GET /api/equipos/resumen responde', async () => {
  const r = await pedir('/api/equipos/resumen');
  if (r.estado === 404) return 'Responde 404. Si el endpoint ya existe, revisa el orden de las rutas';
  if (!r.ok) return 'Responde HTTP ' + r.estado;
  return true;
});

prueba('Tarea 3', 'El resumen trae el total y el conteo por estado', async () => {
  const r = await pedir('/api/equipos/resumen');
  if (!r.datos) return 'No devolvió datos';
  if (Number(r.datos.total) !== 10) return 'total = ' + r.datos.total + ', se esperaba 10';
  const p = r.datos.porEstado;
  if (!p || typeof p !== 'object') return 'Falta el objeto porEstado';
  const esperado = { asignado: 4, disponible: 4, mantenimiento: 1, 'de baja': 1 };
  for (const [clave, valor] of Object.entries(esperado)) {
    if (Number(p[clave]) !== valor) return 'porEstado["' + clave + '"] = ' + p[clave] + ', se esperaba ' + valor;
  }
  return true;
});

// ── Ejecución ─────────────────────────────────────────────────────
(async () => {
  const sondeo = await pedir('/api/equipos');
  if (sondeo.red) {
    console.log('\nNo hay respuesta en ' + BASE + '. Levanta el servidor con npm run dev y vuelve a intentarlo.\n');
    process.exit(1);
  }

  console.log('\nVerificando la API en ' + BASE + '\n');

  const conteo = {};
  let tareaActual = '';

  for (const p of pruebas) {
    if (p.tarea !== tareaActual) {
      tareaActual = p.tarea;
      console.log('  ' + tareaActual);
    }
    const r = await p.fn();
    const bien = r === true;
    conteo[p.tarea] = conteo[p.tarea] || { bien: 0, total: 0 };
    conteo[p.tarea].total++;
    if (bien) conteo[p.tarea].bien++;
    console.log('    ' + (bien ? '[ OK ]' : '[FALLA]') + ' ' + p.nombre + (bien ? '' : '\n           -> ' + r));
  }

  console.log('\n  Resultado por tarea');
  for (const [tarea, c] of Object.entries(conteo)) {
    console.log('    ' + tarea.padEnd(9) + c.bien + ' de ' + c.total + (c.bien === c.total ? '  completa' : '  incompleta'));
  }
  console.log('');
})();
