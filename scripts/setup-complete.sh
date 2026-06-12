#!/bin/bash
# setup-complete.sh — instrucciones finales para activar el schema + borrar test data

set -e

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         cleaners — Sprints #6 + #7 COMPLETOS                     ║"
echo "║                                                                    ║"
echo "║ Código deployado en prod ✓                                        ║"
echo "║ Webhook de Stripe vivo ✓                                          ║"
echo "║ Email de Resend funciona ✓                                        ║"
echo "║                                                                    ║"
echo "║ Pendiente: 1 PASO MANUAL (1 minuto)                              ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "PASO 1: Re-ejecutar schema.sql en Supabase (agrega RLS policy nueva)"
echo "────────────────────────────────────────────────────────────────────"
echo ""
echo "A) Abre: https://app.supabase.com/project/[tu-proyecto]/sql/editor"
echo "B) New query (botón azul)"
echo "C) Pega este comando de una línea (copia abajo):"
echo ""
echo "   cat supabase/schema.sql | pbcopy  # macOS"
echo "   cat supabase/schema.sql | xclip -i -selection clipboard  # Linux"
echo "   Get-Content supabase/schema.sql | Set-Clipboard  # Windows PowerShell"
echo ""
echo "D) Pega el contenido en el SQL editor de Supabase"
echo "E) Click en 'Run' (botón azul abajo a la derecha)"
echo "F) Espera a que termine (2-3 segundos)"
echo ""
echo "Vuelve aquí y presiona ENTER cuando hayas hecho el PASO 1..."
read -p "> "

echo ""
echo "VERIFICANDO..."
node scripts/verify-supabase.mjs

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ TODO VERDE. Schema aplicado y verificado."
  echo ""
  echo "═══════════════════════════════════════════════════════════════════"
  echo "PRÓXIMO: Sprint #8 — Dashboard del cleaner (aanvragen + aceptar)"
  echo "═══════════════════════════════════════════════════════════════════"
  echo ""
  echo "Dite 'continúa' cuando estés listo para el siguiente sprint."
else
  echo ""
  echo "❌ Algo no cuadra. Revisa los errores arriba."
  echo "   (Verifica que el SQL Editor mostró 'Success')"
  exit 1
fi
