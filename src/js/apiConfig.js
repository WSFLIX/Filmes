// Configuração da API
// Em produção (Vercel), o backend e frontend rodam na mesma origem
// Em desenvolvimento local, o Vite faz proxy de /api para localhost:3000

window.API_BASE = '/api';

console.log('[API Config] Base URL definida para:', window.API_BASE);

// Diagnóstico simples
if (window.location.hostname.includes('vercel.app')) {
    console.log('[API Config] Ambiente: VERCEL (Produção)');
} else {
    console.log('[API Config] Ambiente: LOCALHOST (Desenvolvimento)');
}
