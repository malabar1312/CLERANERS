# 🔐 SETUP SUPABASE — Para que usuarios reales se registren

**Sin esto la web funciona en modo demo (datos solo en navegador, no envía emails).**
**Con esto: emails reales, base de datos real, usuarios reales.**

⏱️ **Tiempo: 8 minutos.** No necesitas saber programar.

---

## 🎯 Lo que vas a hacer

1. Crear cuenta gratis en Supabase (2 min)
2. Crear un proyecto (1 min)
3. Copiar 2 valores secretos (1 min)
4. Pegar SQL para crear las tablas (2 min)
5. Configurar URLs de redirect (1 min)
6. Pegar tus claves en `config.js` (1 min)

---

# 🟢 PASO 1 — Cuenta Supabase (2 min)

1. Ve a **https://supabase.com**
2. Click **"Start your project"** arriba derecha
3. **"Sign in with GitHub"** (usa la cuenta GitHub que ya creaste para Vercel)
4. Autoriza Supabase

✅ Cuenta lista.

---

# 🟢 PASO 2 — Crear proyecto (2 min)

1. Click **"New project"** (botón verde)
2. Si te pide crear una "Organization", ponle nombre `cleaners` y plan **Free**
3. Rellena:
   - **Name**: `cleaners-prod` (o lo que quieras)
   - **Database Password**: genera una fuerte → **GUÁRDALA en un sitio seguro** (1Password, notas, etc)
   - **Region**: **Frankfurt (eu-central-1)** — más rápido para Holanda
   - **Pricing Plan**: Free
4. Click **"Create new project"**
5. Espera 1-2 min mientras crea la base de datos

✅ Proyecto creado.

---

# 🟢 PASO 3 — Copiar tus claves (1 min)

En tu proyecto Supabase:

1. Menú izquierda → icono ⚙️ **Settings** (abajo)
2. Click **"API"**
3. Verás dos cosas que necesitas copiar:

   **"Project URL"** (algo como `https://xxxxxxxx.supabase.co`)  
   → cópialo

   **"anon public"** (es muy largo, empieza con `eyJ...`)  
   → cópialo (botón Copy a la derecha)

⚠️ **NO copies la "service_role secret key"** — esa nunca debe salir de tu ordenador.

---

# 🟢 PASO 4 — Crear las tablas (3 min)

1. En Supabase, menú izquierda → icono **`<>`** **"SQL Editor"**
2. Click **"+ New query"** arriba derecha
3. Abre el archivo **`supabase-setup.sql`** de tu carpeta `cleaners-deploy/` con cualquier editor (TextEdit, Notepad)
4. **Selecciona todo** (Ctrl+A / Cmd+A) y **copia** (Ctrl+C / Cmd+C)
5. **Pega** en el SQL Editor de Supabase
6. Abajo derecha → botón verde **"Run"** (o `Ctrl+Enter`)
7. Espera 5 segundos

Verás:
```
Success. No rows returned
```

✅ Base de datos lista con todas las tablas.

---

# 🟢 PASO 5 — Configurar URLs de redirect (1 min)

Esto es para que cuando el usuario clique en el email de verificación, vuelva a tu web.

1. Menú izquierda → icono 🛡️ **"Authentication"**
2. Menú izquierda dentro de Auth → **"URL Configuration"**
3. Rellena:

   **Site URL**:
   ```
   https://getcleaners.nl
   ```

   **Redirect URLs** (añade ambas, una por línea):
   ```
   https://getcleaners.nl/cleaner-signup.html?verified=1
   https://getcleaners.nl/cleaner-dashboard.html
   ```

4. Click **"Save"** abajo

---

# 🟢 PASO 6 — Pegar claves en `config.js` (1 min)

1. Abre el archivo **`config.js`** de tu carpeta `cleaners-deploy/`
2. Busca estas dos líneas vacías:

   ```js
   SUPABASE_URL: '',
   SUPABASE_ANON_KEY: '',
   ```

3. Pega los valores que copiaste en el Paso 3:

   ```js
   SUPABASE_URL: 'https://xxxxxxxx.supabase.co',
   SUPABASE_ANON_KEY: 'eyJhbG...',
   ```

   ⚠️ Mantén las **comillas simples `'`** alrededor de cada valor.

4. Guarda el archivo

---

# 🟢 PASO 7 — Subir a GitHub (1 min)

1. Ve a GitHub → tu repo `cleaners`
2. Click en `config.js`
3. Icono lápiz ✏️ arriba derecha
4. Borra todo el contenido y pega el archivo nuevo (el modificado en Paso 6)
5. Abajo → **"Commit changes"**

Vercel re-publica solo en 1 minuto.

---

# ✅ VERIFICAR QUE FUNCIONA

1. Abre **https://getcleaners.nl/cleaner-signup.html** en pestaña incógnita
2. **Abre la consola del navegador** (F12 → Console)
3. Deberías ver: `✓ cleaners: Modo REAL — Supabase conectado`
4. Si ves `ℹ cleaners: Modo DEMO` → revisa Paso 6 (las claves no se pegaron bien)
5. Rellena el formulario con un email tuyo REAL
6. Click "Verstuur bevestiging"
7. Te pedirá una **contraseña**
8. Verás "Email wordt verstuurd..." y luego ✓
9. **Ve a tu inbox** → recibirás un email de Supabase
10. Click en el link → vuelve a tu web → continúa al paso 4

🎉 **Si funciona = los usuarios reales ya se pueden registrar.**

---

# 🐛 SI ALGO FALLA

### "Modo DEMO sigue saliendo"
→ Las claves de `config.js` no se subieron bien. Verifica en GitHub que están bien pegadas con comillas.

### "Email no llega"
→ Mira en spam.
→ En Supabase: Authentication → Logs → mira si hubo error.
→ Supabase tiene un límite de 3 emails/hora en plan gratis. Pasa rápido.

### "Error: Database error saving new user"
→ El SQL no se ejecutó. Vuelve al Paso 4.

### "User already registered"
→ Ese email ya existe. Usa otro o ve a Authentication → Users → borra el viejo.

### Otra cosa
→ Mándame screenshot de la consola del navegador (F12 → Console) y te ayudo.

---

# 🎨 OPCIONAL — Personalizar emails

En Supabase → Authentication → **Email Templates**:

Puedes editar el HTML de:
- Confirm signup
- Reset password
- Magic link

Cambia "cleaners" por tu marca, colores, logo. Tarda 5 minutos extra.

---

¿Listo? **Cuando lo tengas funcionando avísame** y pasamos a Stripe (pagos reales).
