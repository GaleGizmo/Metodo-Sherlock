# Método Sherlock — prototipo cliente-only

Pequeño prototipo para un juego de titulares que muestra un titular y tres botones (VERDADERO / FALSO / DUDOSO). Al votar se abre un modal con el veredicto y porcentajes calculados a partir de counts de ejemplo (seed). Todo funciona en el cliente, sin backend.

Cómo usar
- Abrir `MetodoSherlock/index.html` en tu navegador (doble clic o servidor estático).
- Pulsa una de las tres opciones para ver el modal con resultado y porcentajes.
- Pulsa "Siguiente titular" para avanzar.

Notas
- El fichero `headlines.json` contiene los titulares de ejemplo y los counts semilla.
- Los votos se guardan en `localStorage` por dispositivo y no se comparten.
- Para hacer porcentajes globales hay que conectar a un backend o BaaS como Firebase / Supabase.
