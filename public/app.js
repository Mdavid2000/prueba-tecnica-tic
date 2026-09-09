/**
 * Panel de inventario TIC.
 * Este archivo solo CONSUME la API: no necesitas modificarlo durante la prueba.
 * A medida que corrijas y agregues endpoints en server.js, la interfaz irá
 * mostrando la información completa.
 */

const ETIQUETAS = {
  'asignado': 'Asignado',
  'disponible': 'Disponible',
  'mantenimiento': 'En mantenimiento',
  'de baja': 'De baja'
};

const COLORES = {
  'asignado': '#2563A8',
  'disponible': '#1E7A4B',
  'mantenimiento': '#B4700A',
  'de baja': '#7C858F'
};

const $ = (sel) => document.querySelector(sel);
const clase = (estado) => 'es-' + String(estado).replace(/\s+/g, '-');

function mensaje(tipo, titulo, cuerpo) {
  return `<div class="mensaje mensaje--${tipo}">
    <p class="mensaje__titulo">${titulo}</p>
    <p>${cuerpo}</p>
  </div>`;
}

/** Llama a la API y devuelve { ok, estado, datos } sin lanzar excepciones. */
async function pedir(ruta) {
  try {
    const respuesta = await fetch(ruta);
    let datos = null;
    try { datos = await respuesta.json(); } catch (e) { datos = null; }
    return { ok: respuesta.ok, estado: respuesta.status, datos };
  } catch (e) {
    return { ok: false, estado: 0, datos: null, red: true };
  }
}

/* ── Resumen ─────────────────────────────────────────────────── */

async function cargarResumen() {
  const zona = $('#resumen-zona');
  const r = await pedir('/api/equipos/resumen');

  const valido = r.ok && r.datos && typeof r.datos.total === 'number' && r.datos.porEstado;

  if (!valido) {
    zona.innerHTML = mensaje(
      'pendiente',
      'El resumen todavía no está disponible',
      'El panel espera que <code>GET /api/equipos/resumen</code> devuelva el total de equipos y el conteo por estado. Mientras ese endpoint no exista, esta sección queda vacía.'
    );
    return false;
  }

  const entradas = Object.entries(r.datos.porEstado);
  const total = r.datos.total || entradas.reduce((s, [, n]) => s + n, 0) || 1;

  const partes = entradas.map(([estado, n]) =>
    `<div class="cinta__parte" style="width:${(n / total) * 100}%;background:${COLORES[estado] || '#B0B8C0'}"
          title="${ETIQUETAS[estado] || estado}: ${n}"></div>`
  ).join('');

  const leyenda = entradas.map(([estado, n]) =>
    `<li>
      <span class="leyenda__marca" style="background:${COLORES[estado] || '#B0B8C0'}"></span>
      ${ETIQUETAS[estado] || estado}
      <span class="leyenda__cifra">${n}</span>
    </li>`
  ).join('');

  zona.innerHTML = `
    <div class="total">
      <span class="total__cifra">${r.datos.total}</span>
      <span class="total__texto">equipos registrados</span>
    </div>
    <div class="cinta">${partes}</div>
    <ul class="leyenda">${leyenda}</ul>`;
  return true;
}

/* ── Listado ─────────────────────────────────────────────────── */

async function cargarListado() {
  const zona = $('#listado-zona');
  const aviso = $('#aviso-filtro');
  const estado = $('#filtro-estado').value;
  const tipo = $('#filtro-tipo').value;

  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  if (tipo) params.set('tipo', tipo);
  const consulta = params.toString();
  const ruta = '/api/equipos' + (consulta ? '?' + consulta : '');

  $('#consulta-actual').textContent = 'GET ' + ruta;

  const r = await pedir(ruta);

  if (!r.ok || !Array.isArray(r.datos)) {
    zona.innerHTML = mensaje('error', 'No se pudo obtener la lista',
      'El servidor respondió con el código <code>' + r.estado + '</code>. Revisa que esté levantado con <code>npm start</code>.');
    $('#conteo-listado').textContent = '';
    aviso.innerHTML = '';
    return;
  }

  const lista = r.datos;
  $('#conteo-listado').textContent = lista.length + ' de 10';

  // Aviso si se pidió un filtro y la API lo ignoró
  const seFiltro = Boolean(estado || tipo);
  const cumplen = lista.every((e) =>
    (!estado || e.estado === estado) && (!tipo || e.tipo === tipo));

  if (seFiltro && !cumplen) {
    aviso.innerHTML = mensaje('pendiente', 'El filtro no se aplicó',
      'La API devolvió equipos que no coinciden con lo solicitado, así que está ignorando los parámetros de la consulta.');
  } else if (seFiltro) {
    aviso.innerHTML = mensaje('ok', 'Filtro aplicado',
      'La API respondió con ' + lista.length + ' equipo(s) que coinciden con la consulta.');
  } else {
    aviso.innerHTML = '';
  }

  if (lista.length === 0) {
    zona.innerHTML = '<p class="cargando">Ningún equipo coincide con estos filtros.</p>';
    return;
  }

  zona.innerHTML = '<ul class="equipos">' + lista.map((e) => `
    <li class="equipo">
      <span class="equipo__codigo">${String(e.id).padStart(3, '0')}</span>
      <span class="equipo__nombre">${e.nombre}</span>
      <span class="equipo__estado ${clase(e.estado)}">${ETIQUETAS[e.estado] || e.estado}</span>
      <span class="equipo__meta">${e.sede} · ${e.responsable || 'sin responsable'} · ${e.anioCompra}</span>
    </li>`).join('') + '</ul>';
}

/* ── Detalle por código ──────────────────────────────────────── */

async function buscarPorId() {
  const zona = $('#detalle-zona');
  const id = $('#entrada-id').value.trim();
  if (!id) { zona.innerHTML = ''; return; }

  const r = await pedir('/api/equipos/' + id);

  if (!r.ok || !r.datos || !r.datos.nombre) {
    zona.innerHTML = mensaje('error', 'El servidor no devolvió el equipo',
      'La consulta <code>GET /api/equipos/' + id + '</code> respondió con el código <code>' +
      r.estado + '</code>: <code>' + JSON.stringify(r.datos) + '</code>');
    return;
  }

  const e = r.datos;
  zona.innerHTML = `<div class="ficha">
    <div class="ficha__dato"><span>Código</span><strong>${String(e.id).padStart(3, '0')}</strong></div>
    <div class="ficha__dato"><span>Equipo</span><strong>${e.nombre}</strong></div>
    <div class="ficha__dato"><span>Tipo</span><strong>${e.tipo}</strong></div>
    <div class="ficha__dato"><span>Estado</span><strong>${ETIQUETAS[e.estado] || e.estado}</strong></div>
    <div class="ficha__dato"><span>Sede</span><strong>${e.sede}</strong></div>
    <div class="ficha__dato"><span>Responsable</span><strong>${e.responsable || 'sin responsable'}</strong></div>
    <div class="ficha__dato"><span>Año de compra</span><strong>${e.anioCompra}</strong></div>
  </div>`;
}

/* ── Diagnóstico ─────────────────────────────────────────────── */

async function revisarApi() {
  const detalle = await pedir('/api/equipos/1');
  const filtro = await pedir('/api/equipos?estado=disponible');
  const resumen = await pedir('/api/equipos/resumen');

  const okDetalle = detalle.ok && detalle.datos && detalle.datos.nombre;
  const okFiltro = filtro.ok && Array.isArray(filtro.datos) &&
    filtro.datos.length > 0 && filtro.datos.every((e) => e.estado === 'disponible');
  const okResumen = resumen.ok && resumen.datos &&
    typeof resumen.datos.total === 'number' && resumen.datos.porEstado;

  const filas = [
    [okDetalle, 'Consultar un equipo por su código', 'GET /api/equipos/1'],
    [okFiltro, 'Filtrar el listado por estado y tipo', 'GET /api/equipos?estado=disponible'],
    [okResumen, 'Obtener el resumen por estado', 'GET /api/equipos/resumen']
  ];

  $('#diagnostico-zona').innerHTML = filas.map(([ok, texto, ruta]) => `
    <li>
      <span class="marca ${ok ? 'marca--ok' : 'marca--falta'}">${ok ? 'Responde' : 'Pendiente'}</span>
      <span>${texto}<br><code>${ruta}</code></span>
    </li>`).join('');
}

/* ── Arranque ────────────────────────────────────────────────── */

function refrescar() {
  cargarResumen();
  cargarListado();
  revisarApi();
}

$('#filtro-estado').addEventListener('change', cargarListado);
$('#filtro-tipo').addEventListener('change', cargarListado);
$('#btn-buscar').addEventListener('click', buscarPorId);
$('#entrada-id').addEventListener('keydown', (e) => { if (e.key === 'Enter') buscarPorId(); });
$('#btn-recargar').addEventListener('click', () => { refrescar(); buscarPorId(); });

refrescar();
buscarPorId();
