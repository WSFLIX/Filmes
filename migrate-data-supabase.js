const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Arquivos de dados
const dataDir = path.join(__dirname, 'data');
const filmsFile = path.join(dataDir, 'films.json');
const seriesFile = path.join(dataDir, 'series.json');
const categoriesFile = path.join(dataDir, 'categories.json');

async function migrateData() {
  console.log('🚀 Iniciando migração de dados para Supabase...\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ ERRO: Você precisa definir as variáveis SUPABASE_URL e SUPABASE_KEY!');
    console.log('\nEssas informações estão no painel do Supabase (Project Settings > API).');
    console.log('\nNo PowerShell:');
    console.log('$env:SUPABASE_URL="sua_url"');
    console.log('$env:SUPABASE_KEY="sua_anon_key"');
    console.log('node migrate-data-supabase.js\n');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Migra filmes
    console.log('🎬 Migrando filmes...');
    if (fs.existsSync(filmsFile)) {
      const filmsData = JSON.parse(fs.readFileSync(filmsFile, 'utf-8'));
      if (filmsData.length > 0) {
        // Limpa tabela (opcional, comente se quiser manter)
        // await supabase.from('films').delete().neq('id', 0);
        
        const { error } = await supabase.from('films').insert(
          filmsData.map(f => ({
            title: f.title,
            image: f.image,
            url: f.url,
            summary: f.summary
          }))
        );
        
        if (error) throw error;
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
        const { error } = await supabase.from('series').insert(
          seriesData.map(s => ({
            title: s.title || s.name, // Compatibilidade
            image: s.image,
            url: s.url,
            summary: s.summary
          }))
        );
        
        if (error) throw error;
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
      
      const customCategories = categoriesData.filter(c => c.id !== 'films' && c.id !== 'series');
      
      if (customCategories.length > 0) {
        for (const cat of customCategories) {
          // Cria categoria
          const { error: catError } = await supabase.from('categories').insert([{
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            storage_key: cat.storageKey
          }]);
          
          if (catError && catError.code !== '23505') throw catError; // Ignora duplicação

          // Cria itens da categoria
          if (cat.items && cat.items.length > 0) {
            const { error: itemsError } = await supabase.from('category_items').insert(
              cat.items.map(i => ({
                category_id: cat.id,
                title: i.title,
                image: i.image,
                url: i.url,
                summary: i.summary
              }))
            );
            
            if (itemsError) throw itemsError;
          }
        }
        console.log(`✓ ${customCategories.length} categoria(s) migrada(s)\n`);
      } else {
        console.log('⚠ Nenhuma categoria customizada encontrada\n');
      }
    } else {
      console.log('⚠ Arquivo categories.json não encontrado\n');
    }

    console.log('✅ Migração para Supabase concluída com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executa a migração
migrateData();
