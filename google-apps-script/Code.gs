/**
 * Apps Script — RSVP Andrés & Ángela
 *
 * Cómo usarlo (resumen):
 * 1. Crea una Google Sheet vacía (ej. "RSVP Boda Andrés y Ángela").
 * 2. Extensiones → Apps Script → borra el código por defecto y pega ESTE archivo.
 * 3. Guardar (Ctrl+S).
 * 4. Implementar → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 5. Copia la URL (.../exec) y pégala en script.js → SHEETS_ENDPOINT
 *
 * IMPORTANTE: cada vez que cambies este código debes crear una
 * "Nueva versión" en Implementar → Administrar implementaciones.
 * Guardar solo no actualiza la URL /exec que usa la invitación.
 *
 * Columnas: Fecha | Nombre | Asistencia | Cantidad
 */

var SHEET_NAME = 'Respuestas';

var HEADERS = [
  'timestamp',
  'fullName',
  'attendance',
  'guests'
];

var HEADER_LABELS = [
  'Fecha',
  'Nombre',
  'Asistencia',
  'Cantidad'
];

function doGet() {
  return json_({ ok: true, service: 'rsvp-andres-angela', columns: HEADER_LABELS });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'Sin datos' });
    }

    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet_();

    ensureHeaders_(sheet);

    var row = HEADERS.map(function (key) {
      var value = data[key];
      if (Array.isArray(value)) return value.join(', ');
      return value == null ? '' : String(value);
    });

    sheet.appendRow(row);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function ensureHeaders_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), HEADER_LABELS.length);
  // Siempre sincroniza la fila 1 con las columnas actuales
  sheet.getRange(1, 1, 1, HEADER_LABELS.length).setValues([HEADER_LABELS]);
  sheet.getRange(1, 1, 1, HEADER_LABELS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Limpia encabezados viejos a la derecha (Email, Teléfono, etc.)
  if (lastCol > HEADER_LABELS.length) {
    sheet.getRange(1, HEADER_LABELS.length + 1, 1, lastCol).clearContent();
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
