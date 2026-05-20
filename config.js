window.CLEANERS_CONFIG = {
  // ═══════════ SUPABASE (BACKEND REAL) ═══════════
  SUPABASE_URL: 'https://xrbvqasfdxaoomorapcm.supabase.co',          // Ej: https://xxxxx.supabase.co
  SUPABASE_ANON_KEY: 'sb_publishable_aUIdqMxiCWts4MtlSLAtHA_mBPxUCne',     // Ej: eyJhbG...
  
  // ═══════════ DOMINIO ═══════════
  SITE_URL: 'https://getcleaners.nl',
  
  // ═══════════ EMAIL CONTACTO ═══════════
  CONTACT_EMAIL: 'info@getcleaners.nl',
  PRESS_EMAIL: 'press@getcleaners.nl',
  
  // ═══════════ OPCIONAL — Activar más adelante ═══════════
  // GOOGLE_MAPS_KEY: '',        // Para mapa real (Google Cloud Console)
  // STRIPE_PUBLIC_KEY: '',      // Para pagos reales (stripe.com)
};

// Helper: detecta si estamos en modo real o demo
window.IS_REAL_MODE = !!(
  window.CLEANERS_CONFIG.SUPABASE_URL && 
  window.CLEANERS_CONFIG.SUPABASE_ANON_KEY &&
  window.CLEANERS_CONFIG.SUPABASE_URL.startsWith('https://')
);

// Inicializa cliente Supabase si está configurado
window.supabaseClient = null;
if (window.IS_REAL_MODE && typeof supabase !== 'undefined') {
  try {
    window.supabaseClient = supabase.createClient(
      window.CLEANERS_CONFIG.SUPABASE_URL,
      window.CLEANERS_CONFIG.SUPABASE_ANON_KEY
    );
    console.log('✓ cleaners: Modo REAL — Supabase conectado');
  } catch (e) {
    console.error('Error iniciando Supabase:', e);
    window.IS_REAL_MODE = false;
  }
} else {
  console.log('ℹ cleaners: Modo DEMO — datos solo en navegador');
}
