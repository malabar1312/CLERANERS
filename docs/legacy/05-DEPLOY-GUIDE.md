# 🚀 EMPIEZA AQUÍ

**Tu web online en 15 minutos. Sin programar nada.**

No te preocupes — está más fácil de lo que parece. Sigue los pasos en orden y al final tendrás tu web funcionando en internet.

---

## 🎯 Qué vas a conseguir

Al terminar tendrás:

- ✅ Tu código en **GitHub** (gratis, como Google Drive para webs)
- ✅ Tu web **online con HTTPS** en `cleaners-xxxx.vercel.app`
- ✅ Opcional: dominio propio tipo `cleaners.nl`

**Coste**: 0€. Solo si compras dominio propio: ~10€/año.

---

## 📦 Qué hay en esta carpeta

Estos 13 archivos son tu web completa:

```
📄 index.html              ← Web principal
📄 cleaner-signup.html     ← Registro de schoonmakers
📄 cleaner-dashboard.html  ← Dashboard interno

🎨 favicon.svg             ← Icono pestaña
🎨 apple-touch-icon.svg    ← Icono iPhone
🎨 og-image.svg            ← Preview al compartir

⚙️ vercel.json             ← Config hosting
⚙️ package.json
⚙️ site.webmanifest
⚙️ robots.txt              ← Para Google
⚙️ sitemap.xml             ← Para Google
⚙️ .gitignore

📘 EMPEZAR-AQUI.md         ← Estás aquí
📘 ROADMAP.md              ← Qué construir después
```

**Todo está aquí. No falta nada.**

---

# 🟢 PASO 1 — Cuenta GitHub (2 min)

GitHub es donde vivirá tu código.

1. Ve a 👉 **https://github.com/signup**
2. Email → contraseña fuerte → username (sugerencia: `cleaners-nl`)
3. Verifica el código que te llega al email
4. Cuando pregunte:
   - "How many people working with you?" → **Just me**
   - "Are you a student?" → **No**
5. Plan: **Free** (gratis)

✅ Cuenta lista.

---

# 🟢 PASO 2 — Crear repositorio (1 min)

Un "repo" = la carpeta online de tu proyecto.

1. Arriba a la derecha → botón **`+`** → **"New repository"**
2. Rellena:
   - **Repository name**: `cleaners`
   - **Description**: `Premium schoonmaak marketplace Amsterdam`
   - Visibilidad: **Public** (recomendado)
   - ❌ NO marques "Add a README"
   - ❌ NO marques ".gitignore"
   - ❌ NO marques "license"
3. Botón verde **"Create repository"**

✅ Repo creado.

---

# 🟢 PASO 3 — Subir archivos (3 min)

Es arrastrar y soltar. Sin terminal, sin comandos.

1. En la página del repo recién creado, busca:
   > "**uploading an existing file**" (link azul en el medio)
2. Click ahí.
3. **Abre la carpeta `cleaners-deploy/` en tu ordenador.**
4. ⚠️ **Selecciona TODOS los archivos de dentro** (NO la carpeta entera):
   - Mac: `⌘ + A`
   - Windows: `Ctrl + A`
5. Asegúrate que se vean también los archivos que empiezan con punto (`.gitignore`):
   - Mac: `⌘ + Shift + .` para mostrar ocultos
   - Windows: en Explorer → View → Hidden items
6. **Arrastra todo** al cuadrado de GitHub.
7. Espera 10-30 segundos a que suban.
8. Abajo → **Commit changes**:
   - Mensaje: `Initial commit`
   - Selección: "Commit directly to main branch"
9. Botón verde **"Commit changes"**

✅ Código en GitHub. Refresca y verás todos los archivos.

---

# 🟢 PASO 4 — Deploy en Vercel (3 min)

Vercel pone tu web online. Gratis. Sin tarjeta.

1. Ve a 👉 **https://vercel.com/signup**
2. Click **"Continue with GitHub"** (botón negro arriba) — así no creas otra contraseña
3. GitHub pregunta → **"Authorize Vercel"**
4. Vercel pide datos básicos → **Hobby plan** (gratis) → Continue
5. Dashboard de Vercel → **"Add New..."** → **"Project"**
6. Encuentra el repo **`cleaners`** → botón **"Import"**
7. ⚠️ **NO TOQUES NADA** de los settings:
   - Framework Preset: Other (déjalo)
   - Build settings: déjalo
   - Environment Variables: déjalo vacío
8. Abajo → **"Deploy"**
9. Espera 30-60 segundos. Verás confeti 🎉

✅ Vercel te muestra tu URL:
```
https://cleaners-xxxx.vercel.app
```

**Click → tu web LIVE en internet.** Compártela en WhatsApp, ábrela en el móvil, todo funciona.

---

# 🟢 PASO 5 (OPCIONAL) — Dominio propio

Si quieres `cleaners.nl` en vez de `cleaners-xxxx.vercel.app`:

## A) Comprar dominio (5 min, ~10€/año)

Recomendados:
- 🥇 **Porkbun.com** — más barato, UI limpia
- 🥈 **TransIP.nl** — holandés, mejor para .nl
- 🥉 **Cloudflare** Registrar — al coste

Busca `cleaners.nl` (o lo que quieras) → carrito → pagar.

## B) Conectarlo a Vercel (5 min + esperar)

**En Vercel:**
1. Tu proyecto → **Settings** (engranaje arriba)
2. Menú izquierda → **Domains**
3. Escribe `cleaners.nl` → **Add**
4. Vercel te muestra valores tipo:
   ```
   A Record:   76.76.21.21
   CNAME:      cname.vercel-dns.com
   ```

**En tu registrar (donde compraste):**
1. Panel del dominio → **DNS settings**
2. Añadir 2 registros:

   | Tipo | Nombre/Host | Valor | TTL |
   |------|-------------|-------|-----|
   | `A` | `@` | `76.76.21.21` | default |
   | `CNAME` | `www` | `cname.vercel-dns.com` | default |

3. Guardar.
4. Espera 5-30 min (a veces hasta 1h).
5. Refresca Vercel → verás ✓ verde "Valid Configuration"

✅ **`https://cleaners.nl` funcionando** con HTTPS automático.

---

# 🔧 Si algo falla

### ❓ "No veo mi repo en Vercel"
→ Vercel → Settings → Git → Configure GitHub App → Edit access → activa `cleaners`

### ❓ "Error 404 Not Found"
→ Verifica que tengas un archivo llamado **exactamente** `index.html` (minúsculas). Si subiste `Index.html` o falta, vuelve al paso 3.

### ❓ "Veo HTML como texto plano"
→ Subiste solo un archivo. Tienes que subir TODOS. Vuelve al paso 3.

### ❓ "Dominio no funciona después de 1h"
→ Ve a https://dnschecker.org → pega tu dominio → verifica que el A record apunte a `76.76.21.21`
→ Si está mal, vuelve a DNS settings del registrar

### ❓ "Cómo edito la web después?"

**Opción A (cambio rápido):**
1. Ve al archivo en GitHub
2. Click en el lápiz ✏️ arriba derecha
3. Edita → "Commit changes"
4. Vercel re-publica auto en 1 min

**Opción B (varios cambios):**
1. Instala **GitHub Desktop** → https://desktop.github.com
2. Clone el repo
3. Edita en tu ordenador con cualquier editor (sublime, vscode, hasta TextEdit)
4. GitHub Desktop sube los cambios → Vercel re-publica

### ❓ "Cómo veo cuánta gente entra"
→ Vercel → tu proyecto → **Analytics** (gratis con plan Hobby)

### ❓ Otra cosa
→ Mándame mensaje con screenshot. Te ayudo.

---

# 🎬 Después de tenerla online

1. **Compártela** — LinkedIn, Instagram, WhatsApp grupos schoonmakers
2. **Outreach manual** — contacta 5-10 schoonmakers reales que conozcas
3. **Configura WhatsApp Business** con el número que pusiste en el botón flotante
4. **Lee `ROADMAP.md`** — para entender los próximos pasos técnicos (backend, pagos, etc.)
5. **Avísame cuando esté live** — vamos por la siguiente fase

---

# 🆘 Checklist final

Antes de compartir tu web:

- [ ] Abrir la URL en el móvil — ¿se ve bien?
- [ ] Probar la calculadora de precio — ¿calcula?
- [ ] Click "Wil je werken?" → ¿abre el signup?
- [ ] Completar el signup → ¿llega al dashboard?
- [ ] Probar una reserva ficticia hasta el final
- [ ] Probar el botón WhatsApp — ¿abre WhatsApp con tu número?
- [ ] ⚠️ **Cambiar el número de WhatsApp** en `index.html`: buscar `31600000000` y reemplazar con el tuyo

---

🎉 **Cuando tu web esté online, mándame screenshot. Pasamos a la siguiente fase.**
