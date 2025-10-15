# Método Sherlock — React + Vite

Instrucciones rápidas para ejecutar el prototipo convertido a React + Vite.

Requisitos: Node 18+ y npm o yarn.

Pasos:

1. Desde la carpeta `c:\Proyectos\MetodoSherlock` instala dependencias:

```powershell
npm install
```

2. Ejecuta el servidor de desarrollo:

```powershell
npm run dev
```

3. Abre la URL que muestre Vite (por defecto http://localhost:5173)

Notas:
- Los assets están en `assets/images` y `headlines.json` está en la raíz del proyecto para que Vite los sirva en desarrollo.
- Los votos se guardan en `localStorage` con clave `ms_vote_<id>`.
