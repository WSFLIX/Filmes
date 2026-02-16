const { Redis } = require('@upstash/redis');

// Cria o cliente Redis
// Em produção no Vercel, as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
// são automaticamente preenchidas quando você adiciona Upstash Redis no dashboard
let redis;

try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'example_token',
  });
} catch (error) {
  console.warn('Redis not configured, using fallback');
  redis = null;
}

// Funções auxiliares para trabalhar com Upstash Redis

async function getAllFilms() {
  if (!redis) return [];
  const films = await redis.get('films');
  return films || [];
}

async function saveAllFilms(films) {
  if (!redis) return;
  await redis.set('films', films);
}

async function getAllSeries() {
  if (!redis) return [];
  const series = await redis.get('series');
  return series || [];
}

async function saveAllSeries(series) {
  if (!redis) return;
  await redis.set('series', series);
}

async function getAllCategories() {
  if (!redis) {
    return getDefaultCategories();
  }
  
  const categories = await redis.get('categories');
  
  // Se não houver categorias, retorna as padrão
  if (!categories || categories.length === 0) {
    const defaultCategories = getDefaultCategories();
    await redis.set('categories', defaultCategories);
    return defaultCategories;
  }
  
  return categories;
}

async function saveAllCategories(categories) {
  if (!redis) return;
  await redis.set('categories', categories);
}

function getDefaultCategories() {
  return [
    { 
      id: 'films', 
      name: 'Filmes', 
      icon: '🎬', 
      storageKey: 'streamflix_films', 
      items: [] 
    },
    { 
      id: 'series', 
      name: 'Séries', 
      icon: '📺', 
      storageKey: 'streamflix_series', 
      items: [] 
    }
  ];
}

module.exports = {
  getAllFilms,
  saveAllFilms,
  getAllSeries,
  saveAllSeries,
  getAllCategories,
  saveAllCategories,
};
