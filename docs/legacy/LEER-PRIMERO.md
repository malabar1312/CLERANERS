# 🚀 LÉEME PRIMERO · Cómo retomar en Proyecto Claude

**Tiempo total**: 10 min para configurarlo todo.

---

## ¿Por qué un Proyecto Claude (no chat)?

- ✅ **Memoria persistente**: los archivos uploaded están siempre disponibles
- ✅ **Custom instructions**: defines cómo Claude trabaja contigo de entrada
- ✅ **Múltiples conversaciones**: cada conversación dentro del proyecto comparte el contexto
- ✅ **No pierdes contexto**: al cerrar el chat, todo sigue ahí

---

## 📋 PASO 1 — Crear el proyecto (1 min)

1. Ve a https://claude.ai
2. Sidebar izquierda → **"Projects"**
3. Click **"+ New Project"**
4. Nombre: **`cleaners`**
5. Description: **`Marketplace premium schoonmaak Amsterdam — getcleaners.nl`**
6. Click **"Create Project"**

---

## 📋 PASO 2 — Pegar las custom instructions (2 min)

1. Dentro del proyecto, click **"Edit"** en la sección de instrucciones (a la izquierda)
2. Abre el archivo **`00-INSTRUCCIONES-PROYECTO-CLAUDE.md`** con TextEdit
3. Copia el bloque entre las líneas de **`⬇ COPIA DESDE LA SIGUIENTE LÍNEA`** y **`⬆ COPIA HASTA AQUÍ`** (todo lo que está entre esas líneas)
4. Pega en el cuadro de instructions
5. **Save**

---

## 📋 PASO 3 — Subir todos los archivos del proyecto (3 min)

En el proyecto Claude:
1. Click **"+ Add content"** o el icono de subir archivos
2. Selecciona TODOS los archivos del ZIP descomprimido **excepto**:
   - El ZIP en sí mismo
   - `.DS_Store` (sistema Mac)
   - `node_modules` (si existiera)

Recomendado subir:

### Documentación (críticos)
- `00-INSTRUCCIONES-PROYECTO-CLAUDE.md`
- `01-ESTADO-ACTUAL.md`
- `02-TAREAS-PENDIENTES.md`
- `STRIPE-PLAN.md`
- `ROADMAP.md`
- `EMPEZAR-AQUI.md` (deploy original)
- `SUPABASE-SETUP.md`

### Código fuente (todos)
- `index.html`
- `cleaner-signup.html`
- `cleaner-dashboard.html`
- `client-dashboard.html`
- `admin.html`
- `config.js`
- `vercel.json`
- `package.json`

### SQL (para referencia)
- `supabase-setup.sql`
- `admin-setup.sql`

### Templates
- `email-template-confirm.html`

### Assets (opcional)
- `robots.txt`
- `sitemap.xml`
- `favicon.svg`
- `apple-touch-icon.svg`
- `og-image.svg`
- `site.webmanifest`

---

## 📋 PASO 4 — Primer mensaje en el proyecto (1 min)

Una vez todo subido, abre una nueva conversación en el proyecto y escribe **literalmente**:

> Hola. Leí los archivos del proyecto. Confirma que tienes el contexto y propón siguiente acción.

Claude debe responder:
- Resumen breve del estado del proyecto
- Lista de tus pendientes (subir archivos, ejecutar SQL)
- Propuesta concreta de próximo paso

Si no responde así, repite con: **"Lee `01-ESTADO-ACTUAL.md` y `02-TAREAS-PENDIENTES.md` antes de responder"**.

---

## 🎯 Cómo trabajar en el proyecto

### Conversaciones múltiples
Dentro del proyecto puedes tener varias conversaciones simultáneas:
- "Implementación Stripe FASE 1"
- "Recover password flow"
- "Reviews UI"

Cada una mantiene el contexto del proyecto pero es independiente.

### Cuando vuelvas después de horas/días

Solo abre una nueva conversación y escribe:
> Sigamos donde lo dejamos. ¿Qué hay pendiente?

Claude leerá los archivos y arrancará al instante.

### Si haces cambios fuera del chat (en GitHub, en Supabase)

Avísale en la conversación:
> Hice X en GitHub. Subí Y a Supabase. ¿Siguiente paso?

Claude se entera y sigue.

### Si quieres preservar el progreso

Cuando termines una iteración importante, pídele:
> Actualiza `01-ESTADO-ACTUAL.md` con lo que acabamos de hacer

Y luego sube el archivo actualizado al proyecto (reemplaza el viejo).

---

## 🔄 Mantener el proyecto al día

Cada cierto tiempo (cada 2-3 iteraciones):
1. Pídele a Claude que actualice los archivos `.md` del proyecto
2. Descarga el ZIP nuevo
3. En el proyecto, **borra** los `.md` antiguos
4. **Sube** los nuevos
5. Los archivos de código se reemplazan al subir el nuevo ZIP

---

## ⚠️ Información sensible

**SÍ** puedes subir al proyecto:
- ✅ `config.js` (anon key es público por diseño)
- ✅ Todos los `.md` y `.sql`
- ✅ Todos los archivos HTML

**NO** subas:
- ❌ Service role key de Supabase (debe vivir en variables de entorno)
- ❌ Secret key de Stripe (`sk_...`) cuando la tengas → solo en Vercel env
- ❌ Contraseñas de tus cuentas

Si en algún momento Claude te pide credenciales sensibles, dale solo lo mínimo necesario y déjalas en variables de entorno de Vercel, no en código.

---

## 🆘 Problemas comunes

### "Claude no se acuerda de las decisiones"
→ Verifica que pegaste las custom instructions del paso 2.

### "Claude no encuentra el archivo X"
→ Verifica que subiste el archivo. En la sidebar del proyecto debería listarlo.

### "Claude propone cosas que ya hicimos"
→ Pídele "Lee `01-ESTADO-ACTUAL.md` antes de proponer".

### "Claude usa otro idioma/tono"
→ Recuérdale "Lee `00-INSTRUCCIONES-PROYECTO-CLAUDE.md` para conocer mi estilo".

### "Necesito empezar una conversación desde cero pero con todo el contexto"
→ Eso es exactamente lo que hace el proyecto. Nueva conversación dentro del proyecto = contexto completo, historial vacío.

---

## 📞 Pendientes ahora mismo (resumen)

1. ✅ Crear proyecto + custom instructions + subir archivos
2. ⏳ Ejecutar `admin-setup.sql` con tu email
3. ⏳ Subir `index.html`, `admin.html`, `cleaner-signup.html`, `cleaner-dashboard.html` a GitHub
4. ⏳ Probar `/admin.html` con tu cuenta
5. ⏳ Empezar Stripe (cuando estés listo)

Lee `02-TAREAS-PENDIENTES.md` para el detalle.

---

## 🎬 Y a partir de aquí…

Tu próxima conversación con Claude empezará así:

```
Tú: Sigamos. ¿Próximo paso?

Claude: Veo que tienes pendiente: subir 4 archivos a GitHub + 
ejecutar admin-setup.sql + probar /admin.html.

¿Hago algo autónomo mientras tú haces esos pasos? 
Propuestas:
- A) Recover password flow
- B) Profile photo upload a Storage
- C) Booking system request-only

¿Cuál prefieres o me delego de nuevo?
```

Y volvemos a la dinámica de siempre. 🚀
