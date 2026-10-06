# Chronicles of Astra

MMORPG de navegador (HTML5 canvas, sin dependencias ni paso de build) con cuentas, hasta 6 personajes por cuenta, 8 clases, personalización de apariencia, guardado en base de datos y multijugador en tiempo real sobre **Supabase**. Se despliega como sitio estático en **Vercel**.

Historia y mundo: [LORE.md](LORE.md).

## Qué incluye

- **Cuentas**: correo + contraseña (Supabase Auth). Fondo con un acercamiento animado a Villa Alba.
- **Personajes**: hasta 6 por cuenta, selección, creación y borrado con confirmación. Los personajes guardados "viven" en el mundo como residentes en el lugar donde se quedaron.
- **8 clases**: Paladín, Guerrero, Mago, Sacerdote, Pícaro, Cazador, Nigromante y Druida, con recursos propios (Fe, Ira, Maná, Energía, Foco).
- **Apariencia**: piel, peinado (7), color de pelo, barba, ojos, marcas, color del atuendo y casco.
- **Persistencia**: nivel, XP, oro, inventario, equipo, misiones, mapa explorado, posición y opciones.
- **Multijugador**: presencia, movimiento interpolado y chat global (con historial) mediante Supabase Realtime.

## Puesta en marcha

### 1. Base de datos (Supabase)
1. En tu proyecto: **SQL Editor → New query**, pega `supabase/schema.sql` y pulsa **Run**. Es idempotente.
2. **Authentication → Providers → Email**: desactiva **Confirm email** si quieres que los jugadores entren al instante (si lo dejas activo, deberán confirmar el correo antes de entrar).
3. **Realtime → Settings**: deja activado el acceso público (valor por defecto).
4. Opcional: activa `pg_cron` y programa la limpieza del chat (comentada al final del SQL).

### 2. Configuración
`config.js` contiene la URL del proyecto y la clave **anon** (pública por diseño; la seguridad la dan las políticas RLS del SQL).
**Nunca** pongas la clave `service_role` en el repositorio ni en el navegador.

### 3. Vercel
1. En vercel.com: **Add New → Project → Import** el repositorio `Chronicles-of-Astra`.
2. *Framework Preset*: **Other**. Sin comando de build ni directorio de salida (la raíz se sirve tal cual).
3. **Deploy**. Cada `git push` a `main` vuelve a desplegar.
4. En Supabase → **Authentication → URL Configuration**, añade tu dominio de Vercel como *Site URL* (necesario si activas la confirmación por correo).

### Desarrollo local
```sh
./build.sh                    # regenera index.html desde src/
python3 -m http.server 8000   # y abre http://localhost:8000/?local=1
```
`?local=1` usa un servidor simulado en el navegador (localStorage + BroadcastChannel entre pestañas) sin tocar Supabase.
`node tools/mock-supabase.js 8124` levanta un Supabase falso (Auth, REST, WebSocket) para probar el cliente real.

> `index.html` es un archivo generado: edita los fuentes de `src/` y ejecuta `./build.sh` antes de hacer commit.

## Límites conocidos (versión actual)
- Los **monstruos son locales** a cada jugador: no se comparten (ni sus muertes, ni el botín). Lo compartido es la presencia, el movimiento y el chat.
- El juego es **autoritativo en el cliente**: un jugador con conocimientos podría manipular su propio progreso. Para un lanzamiento público hay que mover combate y botín a un servidor (Edge Functions o un servidor de juego).
- Un solo canal de Realtime para todo el mundo: adecuado para decenas de jugadores simultáneos; para más hay que dividirlo por zonas.
- Si un personaje se abre en dos dispositivos a la vez, gana el último guardado.
