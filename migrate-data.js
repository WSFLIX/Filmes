const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuração
const MONGODB_URI = process.env.MONGODB_URI || 'SUA_CONNECTION_STRING_AQUI';
const DB_NAME = 'streamflix';

// Arquivos de dados
const dataDir = path.join(__dirname, 'data');
const filmsFile = path.join(dataDir, 'films.json');
const seriesFile = path.join(dataDir, 'series.json');
const categoriesFile = path.join(dataDir, 'categories.json');

async function migrateData() {
  console.log('🚀 Iniciando migração de dados...\n');

  if (MONGODB_URI === 'SUA_CONNECTION_STRING_AQUI') {
    console.error('❌ ERRO: Você precisa definir a variável MONGODB_URI!');
    console.log('\nPara obter sua connection string:');
    console.log('1. Acesse https://www.mongodb.com/cloud/atlas');
    console.log('2. Crie uma conta gratuita');
    console.log('3. Crie um cluster (M0 - gratuito)');
    console.log('4. Clique em "Connect" > "Connect your application"');
    console.log('5. Copie a connection string');
    console.log('\nDefina a variável de ambiente:');
    console.log('Windows: set MONGODB_URI=sua_connection_string');
    console.log('Linux/Mac: export MONGODB_URI=sua_connection_string\n');
    process.exit(1);
  }

  let client;
  
  try {
    // Conecta ao MongoDB
    console.log('📡 Conectando ao MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✓ Conectado com sucesso!\n');

    const db = client.db(DB_NAME);

    // Migra filmes
    console.log('🎬 Migrando filmes...');
    if (fs.existsSync(filmsFile)) {
      const filmsData = JSON.parse(fs.readFileSync(filmsFile, 'utf-8'));
      if (filmsData.length > 0) {
        const filmsCollection = db.collection('films');
        await filmsCollection.deleteMany({}); // Limpa coleção
        await filmsCollection.insertMany(filmsData.map(film => ({
          ...film,
          createdAt: new Date(),
        })));
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
        const seriesCollection = db.collection('series');
        await seriesCollection.deleteMany({}); // Limpa coleção
        await seriesCollection.insertMany(seriesData.map(serie => ({
          ...serie,
          createdAt: new Date(),
        })));
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
        const categoriesCollection = db.collection('categories');
        await categoriesCollection.deleteMany({}); // Limpa coleção
        await categoriesCollection.insertMany(categoriesData.map(cat => ({
          ...cat,
          createdAt: new Date(),
        })));
        console.log(`✓ ${categoriesData.length} categoria(s) migrada(s)\n`);
      } else {
        console.log('⚠ Nenhuma categoria encontrada\n');
      }
    } else {
      console.log('⚠ Arquivo categories.json não encontrado\n');
    }

    console.log('✅ Migração concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   Banco de dados: ${DB_NAME}`);
    console.log(`   Filmes: ${await db.collection('films').countDocuments()}`);
    console.log(`   Séries: ${await db.collection('series').countDocuments()}`);
    console.log(`   Categorias: ${await db.collection('categories').countDocuments()}`);

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n📡 Conexão encerrada.');
    }
  }
}

// Executa a migração
migrateData();
