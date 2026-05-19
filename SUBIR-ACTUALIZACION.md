# 🚀 SUBIR ACTUALIZACIÓN A GITHUB

**Tiempo: 10 minutos.** No necesitas saber programar.

Esta guía te lleva paso a paso para subir TODOS los cambios nuevos a GitHub. Vercel re-publicará tu web automáticamente en 1 minuto.

---

## 📦 Qué vas a subir

### Archivos ACTUALIZADOS (los antiguos serán reemplazados)
- `index.html` — home limpia, sin WhatsApp, conectada a Supabase
- `cleaner-signup.html` — flujo de registro con email REAL via Supabase
- `cleaner-dashboard.html` — escritorio con datos del usuario reales
- `vercel.json` — config corregida
- `package.json`
- `ROADMAP.md` — actualizado con próximos pasos
- `EMPEZAR-AQUI.md`

### Archivos NUEVOS (no existen aún en tu repo)
- 🆕 **`config.js`** — donde irán tus claves de Supabase
- 🆕 **`supabase-setup.sql`** — el SQL que ya ejecutaste
- 🆕 **`SUPABASE-SETUP.md`** — guía Supabase

### Archivos VIEJOS que puedes borrar (opcional, ya no se usan)
- `START-HERE.md`
- `CHECKLIST.md`
- `ENV-VARS.md`
- `DEPLOY-GUIDE.md`
- `DOMAIN-GUIDE.md`
- `README.md`

---

# 🟢 PASO 1 — Descargar nueva versión

1. Descarga **`cleaners-deploy.zip`** que te he preparado
2. Descomprímelo en tu Escritorio (o donde quieras)
3. Verás una carpeta `cleaners-deploy/` con 17 archivos dentro

✅ Listo.

---

# 🟢 PASO 2 — Subir todos los archivos a GitHub

1. Ve a **https://github.com** y entra a tu repo `cleaners`
2. En la página del repo, busca el botón **"Add file"** arriba (a la derecha de los archivos)
3. Click → **"Upload files"**
4. Verás un cuadrado grande "Drag files here"
5. **Abre la carpeta `cleaners-deploy/` descomprimida en tu ordenador**
6. **Selecciona TODOS los archivos de dentro:**
   - Mac: `⌘ + A`
   - Windows: `Ctrl + A`
7. Asegúrate que están visibles los archivos ocultos (los que empiezan con punto, como `.gitignore`):
   - Mac: `⌘ + Shift + .` para mostrar ocultos
   - Windows: en Explorer → View → Hidden items
8. **Arrastra todo** al cuadrado de GitHub
9. Espera 30 segundos a que suban todos
10. Abajo de la página, **"Commit changes"**:
    - Mensaje: `Actualización: sin WhatsApp + Supabase + flujo signup real`
    - Selección: "Commit directly to the **main** branch"
11. Botón verde **"Commit changes"**

⚠️ GitHub te dirá que algunos archivos ya existen → **eso es normal, los va a reemplazar**. Confirma.

✅ Subido. Vercel detectará el cambio automáticamente.

---

# 🟢 PASO 3 — Pegar tus claves Supabase en config.js (5 min)

⚠️ **MUY IMPORTANTE.** Sin este paso, la web sigue en modo demo aunque Supabase esté configurado.

1. En GitHub, en tu repo, busca el archivo **`config.js`** en la lista
2. Click en él → se abre y verás su contenido
3. Click en el icono de **lápiz ✏️** arriba a la derecha → "Edit this file"
4. Busca estas dos líneas (están vacías):

```js
SUPABASE_URL: '',
SUPABASE_ANON_KEY: '',
```

5. Pega tus claves de Supabase. Si no las tienes apuntadas:
   - Ve a tu proyecto en https://supabase.com
   - Settings (⚙️) → API
   - Copia **"Project URL"** y **"anon public"**

6. Pégalas así (mantén las comillas `'`):

```js
SUPABASE_URL: 'https://abcdefgh.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.muchas-letras-aqui...',
```

7. Abajo de la página → **"Commit changes"** → confirma con el mensaje "Conectar Supabase"

⚠️ La clave "anon" es **diseñada para ser pública** — no es un secreto. La seguridad real está en las políticas RLS que ya configuraste en Supabase. Tranquilo.

❌ **NUNCA subas la "service_role secret key"** — esa NO va aquí.

---

# 🟢 PASO 4 — Verificar que funciona (2 min)

Vercel re-publica automáticamente cuando subes a GitHub. Toma 30-60 segundos.

1. Abre **https://getcleaners.nl** en una pestaña **incógnito** (importante: sin caché)
2. Abre la consola del navegador: `F12` → pestaña **"Console"**
3. Deberías ver uno de estos mensajes:

   ✅ **Modo REAL activado:**
   ```
   ✓ cleaners: Modo REAL — Supabase conectado
   ```

   ❌ **Modo demo (algo falla):**
   ```
   ℹ cleaners: Modo DEMO — datos solo en navegador
   ```

Si ves "Modo DEMO":
- Revisa el paso 3: las claves de `config.js` están mal pegadas
- Vuelve a GitHub → `config.js` → verifica que las comillas están bien

---

# 🟢 PASO 5 — Prueba el registro REAL

1. En la web → click **"Word schoonmaker"** o **"Voor schoonmakers"**
2. Rellena el formulario con un email **TUYO REAL** (no @demo.com)
3. Click "Verstuur bevestiging"
4. Te pedirá una **contraseña** (mínimo 8 chars, 1 mayúscula, 1 número)
5. Verás "📨 Email wordt verstuurd..." → luego "✓ Bevestigingsmail verstuurd!"
6. **Abre tu email real** → recibirás un correo de Supabase
7. Click en el botón "Confirm your email"
8. Te llevará de vuelta a getcleaners.nl en el paso 4
9. Termina los pasos 4-6 (profesional, KYC, beschikbaarheid)
10. Llegas al dashboard con tus datos REALES

🎉 Si todo funciona = **usuarios reales pueden registrarse en tu plataforma.**

---

# 🟢 PASO 6 (OPCIONAL) — Limpiar archivos viejos del repo

Si quieres dejar el repo limpio, borra los markdowns antiguos:

En GitHub, repo cleaners, click en cada uno y borra:
- `START-HERE.md` (si existe)
- `CHECKLIST.md` (si existe)
- `ENV-VARS.md` (si existe)
- `DEPLOY-GUIDE.md` (si existe)
- `DOMAIN-GUIDE.md` (si existe)
- `README.md` (si existe)

Para cada uno:
1. Click en el archivo
2. Icono de basura 🗑️ arriba derecha
3. "Commit changes"

⚠️ NO borres ninguno de estos:
- `EMPEZAR-AQUI.md` ✅ Vigente
- `ROADMAP.md` ✅ Vigente
- `SUPABASE-SETUP.md` ✅ Vigente
- Cualquier `.html`, `.svg`, `.json`, `.xml`, `.txt` ✅
- `config.js` ✅
- `supabase-setup.sql` ✅

---

# 🔧 SI ALGO FALLA

### ❓ "GitHub no me deja subir, dice 'too large'"
→ El ZIP es 81KB, no es eso. Es probable que arrastraras la carpeta entera en vez del contenido. **Selecciona los archivos DENTRO de `cleaners-deploy/`, no la carpeta misma.**

### ❓ "Veo el HTML como texto plano en getcleaners.nl"
→ Olvidaste subir el archivo `index.html`, o se rompió. Vuelve al paso 2 y verifica que `index.html` está en el listado del repo en GitHub.

### ❓ "Vercel no re-publica"
→ Vercel → tu proyecto → pestaña **"Deployments"** → ¿hay uno nuevo "Building..."? Si no, click "Redeploy" en el último.

### ❓ "El email de confirmación no llega"
→ Mira en SPAM primero.
→ Supabase limita a 3 emails/hora en plan gratis. Espera 1 hora si abusaste.
→ En Supabase: Authentication → Logs → mira si hay errores.

### ❓ "Error: Email rate limit exceeded"
→ Pasaste el límite. Espera 1 hora. Para producción, conecta un servicio SMTP propio (Resend) en Supabase → Settings → Email.

### ❓ "Error: Database error saving new user"
→ El SQL `supabase-setup.sql` no se ejecutó completamente. Vuelve a Supabase → SQL Editor → ejecútalo de nuevo.

### ❓ "User already registered"
→ Estás usando un email que ya probaste. Usa otro o ve a Supabase → Authentication → Users → borra el viejo.

### ❓ Otra cosa
→ Mándame screenshot de la consola del navegador (F12 → Console) y te ayudo.

---

# 🎯 RESUMEN ULTRA RÁPIDO

```
1. Descarga ZIP nuevo → descomprime
2. GitHub → Add file → Upload files → arrastra todo
3. Commit
4. En GitHub, edita config.js y pega tus claves Supabase
5. Commit
6. Espera 1 min → abre getcleaners.nl en incógnito
7. F12 → debería decir "Modo REAL — Supabase conectado"
8. Prueba registro con tu email real
9. Llega email → click → completa flujo
10. ¡Estás operando! 🎉
```

---

**Avísame cuando termines y veas "Modo REAL" en la consola.** Si te atascas en cualquier paso, screenshot y voy.

🚀 Vamos.
