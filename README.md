# FIFA Mundial 2026 Tracker

App de seguimiento del Mundial FIFA 2026 — grupos, posiciones en tiempo real, Drama Index y bracket automático.

## Stack
- React 18
- Firebase Realtime Database (sincronización en tiempo real)
- Vercel (despliegue)

## Pasos para correr localmente

```bash
npm install
npm start
```

## Pasos para desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub
2. Ve a vercel.com → "Add New Project"
3. Importa el repositorio
4. Vercel detecta React automáticamente → clic en Deploy
5. ¡Listo! Tu app queda en una URL pública

## Reglas de Firebase (después del período de prueba)

En Firebase Console → Realtime Database → Rules, reemplaza las reglas con:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Esto mantiene el acceso abierto permanentemente para lectura y escritura.
