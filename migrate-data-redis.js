const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

// Configuração - Lê do arquivo .env se não estiver no ambiente
// Mas para scripts locais simples, podemos pedir para o usuário setar ou colar aqui
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Arquivos de dados
const dataDir = path.join(__dirname, 'data');
const filmsFile = path.join(dataDir, 'films.json');
const seriesFile = path.join(dataDir, 'series.json');
const categoriesFile = path.join(dataDir, 'categories.json');

async function migrateData() {
  console.log('🚀 Iniciando migração de dados para Upstash Redis (Vercel KV)...\n');

  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ ERRO: Você precisa definir as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN!');
    console.log('\nEssas informações estão no painel do Upstash Redis no Vercel.');
    console.log('\nNo PowerShell:');
    console.log('$env:UPSTASH_REDIS_REST_URL="sua_url"');
    console.log('$env:UPSTASH_REDIS_REST_TOKEN="seu_token"');
    console.log('node migrate-data-redis.js\n');
    process.exit(1);
  }

  const redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });

  try {
    // Migra filmes
    console.log('🎬 Migrando filmes...');
    if (fs.existsSync(filmsFile)) {
      const filmsData = JSON.parse(fs.readFileSync(filmsFile, 'utf-8'));
      if (filmsData.length > 0) {
        await redis.set('films', filmsData);
        console.log(`✓ ${filmsData.length} filme(s) migrado(s)\n`);
      } else {
        console.log('⚠ Nenhum filme encontrado\n');
      }
    } else {
      console.log('⚠ Arquivo films.json não encontrado\n');
    }

    // Migra séries
    console.log('📺 Migrando séries...');
    if (fs.existsSync(seriesFile)) {
      const seriesData = JSON.parse(fs.readFileSync(seriesFile, 'utf-8'));
      if (seriesData.length > 0) {
        await redis.set('series', seriesData);
        console.log(`✓ ${seriesData.length} série(s) migrada(s)\n`);
      } else {
        console.log('⚠ Nenhuma série encontrada\n');
      }
    } else {
      console.log('⚠ Arquivo series.json não encontrado\n');
    }

    // Migra categorias
    console.log('📁 Migrando categorias...');
    if (fs.existsSync(categoriesFile)) {
      const categoriesData = JSON.parse(fs.readFileSync(categoriesFile, 'utf-8'));
      if (categoriesData.length > 0) {
        await redis.set('categories', categoriesData);
        console.log(`✓ ${categoriesData.length} categoria(s) migrada(s)\n`);
      } else {
        console.log('⚠ Nenhuma categoria encontrada\n');
      }
    } else {
      console.log('⚠ Arquivo categories.json não encontrado\n');
    }

    console.log('✅ Migração concluída com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error.message);
    process.exit(1);
  }
}

// Executa a migração
migrateData();
