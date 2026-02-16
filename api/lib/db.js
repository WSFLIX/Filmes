const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
// Variáveis de ambiente definidas no Vercel (e localmente no .env)
// Configuração manual (Perdão pela segurança, mas resolve o problema!)
const SUPABASE_URL = 'https://ssvvgkzxbbzpsgrrnrfe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdnZna3p4YmJ6cHNncnJucmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjY0MDgsImV4cCI6MjA4Njg0MjQwOH0.JRgek0PBagl_-NLpRJays5UhIK4xWRVn_DXQjqcRESM'; // <-- SUBSTITUA ISSO AQUI!

let supabase;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn('❌ Supabase não configurado! Defina SUPABASE_URL e SUPABASE_KEY.');
}

// Helper para verificar configuração
function checkSupabase() {
  if (!supabase) {
    throw new Error('Supabase não configurado corretamente.');
  }
  return supabase;
}

// FILMES
async function getFilms() {
  const db = checkSupabase();
  const { data, error } = await db
    .from('films')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

async function createFilm(film) {
  const db = checkSupabase();
  const { data, error } = await db
    .from('films')
    .insert([film])
    .select();
    
  if (error) throw error;
  return data[0];
}

async function updateFilm(id, film) {
  const db = checkSupabase();
  const { data, error } = await db
    .from('films')
    .update(film)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
}

async function deleteFilm(id) {
  const db = checkSupabase();
  const { error } = await db
    .from('films')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

// SÉRIES
async function getSeries() {
  const db = checkSupabase();
  const { data, error } = await db
    .from('series')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

async function createSeries(item) {
  const db = checkSupabase();
  const { data, error } = await db
    .from('series')
    .insert([item])
    .select();
    
  if (error) throw error;
  return data[0];
}

async function updateSeries(id, item) {
  const db = checkSupabase();
  const { data, error } = await db
    .from('series')
    .update(item)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
}

async function deleteSeries(id) {
  const db = checkSupabase();
  const { error } = await db
    .from('series')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

// CATEGORIAS
async function getCategories() {
  const db = checkSupabase();
  const { data: categories, error } = await db
    .from('categories')
    .select('*');
    
  if (error) throw error;
  
  // Buscar itens para cada categoria (poderia ser otimizado com join, mas mantendo simples)
  // Para manter compatibilidade com o frontend atual, precisamos estruturar como antes
  const results = [];
  
  for (const cat of categories) {
    const { data: items, error: itemsError } = await db
      .from('category_items')
      .select('*')
      .eq('category_id', cat.id);
      
    if (itemsError) console.error(`Erro ao buscar itens da categoria ${cat.id}`, itemsError);
    
    results.push({
      ...cat,
      items: items || []
    });
  }
  
  return results;
}

async function createCategory(category) {
  const db = checkSupabase();
  
  // Remove items do objeto antes de salvar na tabela categories
  const { items, ...catData } = category;
  
  const { data, error } = await db
    .from('categories')
    .insert([catData])
    .select();
    
  if (error) throw error;
  return data[0];
}

async function deleteCategory(id) {
  const db = checkSupabase();
  const { error } = await db
    .from('categories')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

// ITENS DE CATEGORIA
async function createCategoryItem(categoryId, item) {
  const db = checkSupabase();
  
  const itemData = {
    ...item,
    category_id: categoryId
  };
  
  const { data, error } = await db
    .from('category_items')
    .insert([itemData])
    .select();
    
  if (error) throw error;
  return data[0];
}

async function updateCategoryItem(id, item) {
  const db = checkSupabase();
  const { data, error } = await db
    .from('category_items')
    .update(item)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
}

async function deleteCategoryItem(id) {
  const db = checkSupabase();
  const { error } = await db
    .from('category_items')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

module.exports = {
  checkSupabase,
  getFilms, createFilm, updateFilm, deleteFilm,
  getSeries, createSeries, updateSeries, deleteSeries,
  getCategories, createCategory, deleteCategory,
  createCategoryItem, updateCategoryItem, deleteCategoryItem
};
