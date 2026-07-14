# Tarjeta de Invitación Virtual · Andrés & Ángela

Invitación de boda 100% web (HTML + CSS + JS puros, sin dependencias).
Diseño elegante con la paleta **Dusty Blue · Sage Green · Gray · Cream**,
totalmente responsive y con formulario RSVP funcional.

> Boda: **Sábado 29 de agosto de 2026 · 5:30 PM**
> Restaurante Tres Amores · Vía Tuluá – Tres Esquinas

---

## Estructura del proyecto

```
Tarjeta_Invitacion_Virtual/
├── index.html        ← Estructura completa de la invitación
├── styles.css        ← Estilos (paleta, layout, animaciones)
├── script.js         ← Cuenta regresiva, validaciones, RSVP
├── Colores_Base/
│   └── Colores Boda.jpeg
└── Instrucciones_Creacion/
    └── instrucciones.txt
```

---

## Cómo abrirla

Solo abre `index.html` en cualquier navegador moderno.

> Recomendación: usa un servidor local para evitar bloqueos del navegador con `localStorage`.
>
> **PowerShell + Python:**
> ```powershell
> cd C:\Users\andre\Desktop\Tarjeta_Invitacion_Virtual
> python -m http.server 8080
> ```
> Luego visita: <http://localhost:8080>

---

## Secciones incluidas

1. **Hero** con nombres en script, fecha y **cuenta regresiva** en vivo.
2. **Detalles del evento** (fecha, hora, lugar, link a Google Maps).
3. **Ceremonia** con badge circular y botón "Cómo llegar".
4. **Recepción** con timeline (cóctel, cena, brindis, fiesta).
5. **Dress Code** formal + paleta sugerida en chips.
6. **Hospedaje** con 3 hoteles recomendados.
7. **Transporte y parqueo**.
8. **Regalos** (lluvia de sobres + registro).
9. **Formulario RSVP** completo con 11 campos.

---

## Formulario RSVP

Incluye **todos los campos pedidos** con validaciones:

| # | Campo | Tipo | Obligatorio | Validación |
|---|-------|------|-------------|------------|
| 1 | Nombre completo | text | Sí | min. 3 caracteres |
| 2 | Email | email | Sí | formato válido |
| 3 | Teléfono | tel | No | formato válido si se llena |
| 4 | ¿Asistes? | radio | Sí | sí / no / quizás |
| 5 | # acompañantes | select | Sí (si asiste) | 0–4 |
| 6 | Nombres acompañantes | textarea | Sí (si #>0) | uno por línea |
| 7 | Restricciones dietéticas | checkbox | No | múltiples |
| 8 | Otra restricción | textarea | Condicional | max 200 chars |
| 9 | ¿Cómo nos conocemos? | select | No | — |
| 10 | Mensaje | textarea | No | max 500 chars |
| 11 | Nivel de confirmación | radio | Sí | 3 opciones |

**Mensajes de error y éxito** según las instrucciones,
con un modal de confirmación al enviar.

---

## ¿Dónde se guardan las respuestas?

Por defecto, las respuestas se almacenan en el **`localStorage` del navegador**
del invitado (para no requerir backend).

### Ver / exportar respuestas (modo admin)

1. Abre la invitación.
2. Presiona **`Ctrl + Shift + R`** → aparece un botón flotante "Ver respuestas".
3. Click → descarga un **CSV** con todas las confirmaciones.

> ⚠️ Como cada navegador guarda solo sus propias respuestas locales,
> si quieres centralizar las confirmaciones de todos los invitados,
> habilita una de las opciones siguientes.

---

## Opciones para centralizar respuestas

### Opción A — Google Forms embebido (la más simple)

1. Crea un Google Form privado con los mismos campos.
2. En Google Forms → **Enviar → `<>`** copia el código `<iframe>`.
3. Reemplaza la sección `<form id="rsvpForm" …>` en `index.html` por:

   ```html
   <iframe src="https://docs.google.com/forms/d/e/.../viewform?embedded=true"
           width="100%" height="900" frameborder="0">Cargando…</iframe>
   ```

4. Las respuestas aparecen automáticamente en Google Sheets.

> Pierdes el diseño y validaciones personalizadas, pero ganas simplicidad total.

---

### Opción B — Google Sheets + Apps Script (recomendado) ✅

Mantiene el **diseño y validaciones personalizadas**, y envía cada respuesta
a una hoja de cálculo. El código listo está en `google-apps-script/Code.gs`.

**1. Crear la hoja y el script:**

1. Abre [Google Sheets](https://sheets.google.com) → **Hoja de cálculo en blanco**.
2. Ponle un nombre, ej. `RSVP Boda Andrés y Ángela`.
3. Menú **Extensiones → Apps Script**.
4. Borra el código por defecto y pega todo el contenido de `google-apps-script/Code.gs`.
5. Guarda el proyecto (Ctrl+S) y ponle un nombre al script.

**2. Publicar como aplicación web:**

1. En Apps Script: **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Descripción: `RSVP v1` (opcional).
4. Ejecutar como: **Yo**.
5. Quién tiene acceso: **Cualquier persona**.
6. **Implementar** → autoriza con tu cuenta de Google (acepta los permisos).
7. Copia la **URL de la aplicación web** (termina en `/exec`).

**3. Conectar con la invitación:**

Abre `script.js` y pega la URL:

```javascript
const SHEETS_ENDPOINT = "https://script.google.com/macros/s/TU_ID_AQUI/exec";
```

**4. Probar:**

1. Abre la invitación y envía una confirmación de prueba.
2. En la Google Sheet debe aparecer la pestaña **Respuestas** con una fila nueva.
3. Si cambias el Apps Script después, crea una **Nueva implementación** (o nueva versión) y actualiza la URL si cambia.

Cada confirmación se guarda en Google Sheets **y** como respaldo en `localStorage`.
---

### Opción C — Backend personalizado (Firebase / Node.js)

Si necesitas más control (notificaciones por email, dashboard propio, etc.):

- Crea un endpoint REST `POST /rsvp`.
- En `script.js`, ajusta la función `sendToSheets` para apuntar a tu API.
- Considera proteger con CAPTCHA si la invitación se vuelve pública.

---

## Personalización rápida

| Quiero cambiar... | Archivo | Dónde |
|-------------------|---------|-------|
| Nombres / fecha / hora | `index.html` | Sección hero y detalles |
| Fecha del countdown | `script.js` | constante `WEDDING_DATE` |
| Colores | `styles.css` | variables `:root` |
| Hoteles | `index.html` | sección `#hospedaje` |
| Cuenta bancaria | `index.html` | sección `#regalos` |

---

## Despliegue

Cualquiera de estos servicios la publica gratis:

- **GitHub Pages**: sube los 3 archivos a un repo y activa Pages.
- **Netlify Drop**: arrastra la carpeta a <https://app.netlify.com/drop>.
- **Vercel**: `vercel deploy` desde la carpeta.
- **Cloudflare Pages** o **Firebase Hosting**.

---

## Compatibilidad

- Funciona en Chrome, Edge, Firefox, Safari (incluyendo iOS y Android).
- Sin librerías externas (solo Google Fonts).
- Responsive 360 px → 1440 px.

---

¡Felicidades por la boda! 💍
