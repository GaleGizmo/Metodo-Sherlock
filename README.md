# Método Sherlock

Juego de detección de noticias falsas para uso en talleres y sesiones en grupo. Los participantes leen titulares y votan si son verdaderos o falsos; al final el moderador activa la visualización de resultados y cada usuario ve su puntuación comparada con la media de la sesión y la media global.

## Stack

- **React 18 + Vite**
- **Supabase** — base de datos PostgreSQL + Realtime (websockets)
- **Vercel** — despliegue (SPA rewrite configurado en `vercel.json`)

## Funcionalidades

### Participante
- Acceso mediante nombre de usuario y código de sesión (validados contra Supabase)
- Navegación entre casos con botones ANTERIOR / SIGUIENTE en el footer
- Votación por caso: VERDADERO / FALSO (un único voto por caso, no reversible)
- Overlay visual sobre cada imagen al activarse los resultados (VERDADERA / FALSA)
- Modal de resultados con:
  - Tabla de aciertos/errores por caso con badges de color
  - Puntuación personal (fracción + porcentaje)
  - Comparativa con la media de la sesión y la media global
- La puntuación se envía a Supabase automáticamente al votar el último caso
- Los resultados se activan en tiempo real sin necesidad de recargar la página

### Panel del moderador
- Acceso mediante URL `?mod=<PIN>` (PIN configurado en `.env`)
- Crear, activar/desactivar y borrar sesiones
- Reiniciar puntuaciones de una sesión (los participantes pueden volver a registrarse)
- **Mostrar/ocultar resultados** por sesión — los clientes conectados los reciben instantáneamente vía Supabase Realtime
- Ranking en vivo de la sesión activa (actualización automática por websocket)
- Diálogos de confirmación personalizados para acciones destructivas

## Estructura del proyecto

```
src/
  App.jsx                  — raíz, separa GameApp de ModeratorPanel
  constants.js             — constantes compartidas (longitudes, códigos PG)
  supabaseClient.js        — cliente Supabase
  components/
    Header.jsx             — barra superior con botón de resultados
    Footer.jsx             — navegación + badges de usuario/sesión
    HeadlineCard.jsx       — tarjeta de caso con imagen, overlay y botones de voto
    Percentages.jsx        — barras de porcentaje por opción
    UsernameModal.jsx      — login de participante (nombre + código de sesión)
    ResultsSummaryModal.jsx — modal de resultados finales
    ModeratorPanel.jsx     — panel de gestión de sesiones y ranking
    ConfirmModal.jsx       — diálogo de confirmación reutilizable
  styles/
    main.css               — variables CSS (:root) e imports
    header.css / footer.css / card.css / buttons.css
    modal.css / results.css / moderator.css
headlines.json             — datos de los casos (texto, imagen, verdad)
```

## Base de datos (Supabase)

### Tabla `sessions`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `code` | text unique | Código de sesión (ej: TALLER2026) |
| `is_active` | boolean | Si acepta nuevos participantes |
| `results_enabled` | boolean | Si los participantes pueden ver sus resultados |
| `created_at` | timestamptz | — |

### Tabla `scores`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid | PK |
| `username` | text | Nombre del participante |
| `session_code` | text | Código de sesión |
| `pct` | integer | Porcentaje de acierto (null hasta terminar) |
| `correct_count` | integer | Número de aciertos |
| `total` | integer | Total de casos |

**RLS:** anon puede insertar y leer `sessions`; anon puede insertar, leer y actualizar `scores`.

## Variables de entorno

Crear un fichero `.env` en la raíz (no se sube a git):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_MOD_PIN=tu_pin_secreto
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Despliegue

```bash
npm run build   # genera dist/
```

Compatible con Vercel y Caprover (incluye `captain-definition` si aplica). El `vercel.json` redirige todas las rutas al `index.html` para que funcione el routing SPA.

