const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, 'data');
const filmsFile = path.join(dataDir, 'films.json');
const seriesFile = path.join(dataDir, 'series.json');
const categoriesFile = path.join(dataDir, 'categories.json');

// Middleware de log para depuração
app.use((req, res, next) => {
  console.log(`[Server] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.static(path.join(__dirname, 'src')));

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadJson(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function ensureDataFiles() {
  ensureDir(dataDir);

  if (!fs.existsSync(filmsFile)) {
    saveJson(filmsFile, []);
  }

  if (!fs.existsSync(seriesFile)) {
    saveJson(seriesFile, []);
  }

  if (!fs.existsSync(categoriesFile)) {
    saveJson(categoriesFile, [
      { id: 'films', name: 'Filmes', icon: '🎬', storageKey: 'streamflix_films', items: [] },
      { id: 'series', name: 'Séries', icon: '📺', storageKey: 'streamflix_series', items: [] }
    ]);
  }
}

ensureDataFiles();

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// FILMS
app.get('/api/films', (req, res) => {
  const data = loadJson(filmsFile, []);
  console.log(`[API] GET /api/films - Retornando ${data.length} itens`);
  res.json(data);
});

app.post('/api/films', (req, res) => {
  const films = loadJson(filmsFile, []);
  const film = req.body || {};
  if (!film.title || !film.image || !film.url) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
  }
  if (films.some(f => f.title === film.title)) {
    return res.status(400).json({ success: false, message: 'Já existe um filme com este título!' });
  }
  films.push({
    title: film.title.trim(),
    image: film.image.trim(),
    url: film.url.trim(),
    summary: film.summary ? String(film.summary).trim() : ''
  });
  saveJson(filmsFile, films);
  res.json({ success: true, message: 'Filme adicionado com sucesso!' });
});

app.put('/api/films/:index', (req, res) => {
  const films = loadJson(filmsFile, []);
  const index = Number(req.params.index);
  if (Number.isNaN(index) || index < 0 || index >= films.length) {
    return res.status(404).json({ success: false, message: 'Filme não encontrado!' });
  }
  const film = req.body || {};
  if (!film.title || !film.image || !film.url) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
  }
  films[index] = {
    title: film.title.trim(),
    image: film.image.trim(),
    url: film.url.trim(),
    summary: film.summary ? String(film.summary).trim() : ''
  };
  saveJson(filmsFile, films);
  res.json({ success: true, message: 'Filme atualizado com sucesso!' });
});

app.delete('/api/films/:index', (req, res) => {
  const films = loadJson(filmsFile, []);
  const index = Number(req.params.index);
  if (Number.isNaN(index) || index < 0 || index >= films.length) {
    return res.status(404).json({ success: false, message: 'Filme não encontrado!' });
  }
  films.splice(index, 1);
  saveJson(filmsFile, films);
  res.json({ success: true, message: 'Filme excluído com sucesso!' });
});

// SERIES
app.get('/api/series', (req, res) => {
  const data = loadJson(seriesFile, []);
  console.log(`[API] GET /api/series - Retornando ${data.length} itens`);
  res.json(data);
});

app.post('/api/series', (req, res) => {
  const series = loadJson(seriesFile, []);
  const item = req.body || {};
  if (!item.title || !item.image || !item.url) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
  }
  if (series.some(s => s.title === item.title || s.name === item.title)) {
    return res.status(400).json({ success: false, message: 'Já existe uma série com este título!' });
  }
  series.push({
    title: item.title.trim(),
    image: item.image.trim(),
    url: item.url.trim(),
    summary: item.summary ? String(item.summary).trim() : ''
  });
  saveJson(seriesFile, series);
  res.json({ success: true, message: 'Série adicionada com sucesso!' });
});

app.put('/api/series/:index', (req, res) => {
  const series = loadJson(seriesFile, []);
  const index = Number(req.params.index);
  if (Number.isNaN(index) || index < 0 || index >= series.length) {
    return res.status(404).json({ success: false, message: 'Série não encontrada!' });
  }
  const item = req.body || {};
  if (!item.title || !item.image || !item.url) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
  }
  series[index] = {
    title: item.title.trim(),
    image: item.image.trim(),
    url: item.url.trim(),
    summary: item.summary ? String(item.summary).trim() : ''
  };
  saveJson(seriesFile, series);
  res.json({ success: true, message: 'Série atualizada com sucesso!' });
});

app.delete('/api/series/:index', (req, res) => {
  const series = loadJson(seriesFile, []);
  const index = Number(req.params.index);
  if (Number.isNaN(index) || index < 0 || index >= series.length) {
    return res.status(404).json({ success: false, message: 'Série não encontrada!' });
  }
  series.splice(index, 1);
  saveJson(seriesFile, series);
  res.json({ success: true, message: 'Série excluída com sucesso!' });
});

// CATEGORIES
app.get('/api/categories', (req, res) => {
  const categories = loadJson(categoriesFile, []);
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const categories = loadJson(categoriesFile, []);
  const category = req.body || {};
  if (!category.name || !category.icon) {
    return res.status(400).json({ success: false, message: 'Nome e ícone são obrigatórios!' });
  }
  const exists = categories.some(c => c.name.toLowerCase() === String(category.name).toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'Já existe uma categoria com este nome!' });
  }
  const id = String(category.name).toLowerCase().replace(/[^a-z0-9]/g, '_');
  const storageKey = `streamflix_${id}`;
  const newCategory = {
    id,
    name: String(category.name).trim(),
    icon: String(category.icon).trim(),
    storageKey,
    createdAt: new Date().toISOString(),
    items: []
  };
  categories.push(newCategory);
  saveJson(categoriesFile, categories);
  res.json({ success: true, message: 'Categoria adicionada com sucesso!' });
});

app.delete('/api/categories/:id', (req, res) => {
  const categories = loadJson(categoriesFile, []);
  const categoryId = req.params.id;
  if (categoryId === 'films' || categoryId === 'series') {
    return res.status(400).json({ success: false, message: 'Não é possível excluir categorias padrão!' });
  }
  const index = categories.findIndex(c => c.id === categoryId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Categoria não encontrada!' });
  }
  categories.splice(index, 1);
  saveJson(categoriesFile, categories);
  res.json({ success: true, message: 'Categoria excluída com sucesso!' });
});

app.get('/api/categories/:id/items', (req, res) => {
  const categoryId = req.params.id;

  // Redirecionamento para arquivos de dados específicos
  if (categoryId === 'films') {
    const data = loadJson(filmsFile, []);
    return res.json(data);
  }
  if (categoryId === 'series') {
    const data = loadJson(seriesFile, []);
    return res.json(data);
  }

  const categories = loadJson(categoriesFile, []);
  const category = categories.find(c => c.id === categoryId);
  if (!category) return res.status(404).json([]);
  res.json(Array.isArray(category.items) ? category.items : []);
});

app.post('/api/categories/:id/items', (req, res) => {
  const categoryId = req.params.id;

  // Lógica para FILMES
  if (categoryId === 'films') {
    const films = loadJson(filmsFile, []);
    const film = req.body || {};
    if (!film.title || !film.image || !film.url) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
    }
    if (films.some(f => f.title === film.title)) {
      return res.status(400).json({ success: false, message: 'Já existe um filme com este título!' });
    }
    films.push({
      title: film.title.trim(),
      image: film.image.trim(),
      url: film.url.trim(),
      summary: film.summary ? String(film.summary).trim() : ''
    });
    saveJson(filmsFile, films);
    return res.json({ success: true, message: 'Filme adicionado à categoria global com sucesso!' });
  }

  // Lógica para SÉRIES
  if (categoryId === 'series') {
    const series = loadJson(seriesFile, []);
    const item = req.body || {};
    if (!item.title || !item.image || !item.url) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
    }
    if (series.some(s => s.title === item.title || s.name === item.title)) {
      return res.status(400).json({ success: false, message: 'Já existe uma série com este título!' });
    }
    series.push({
      title: item.title.trim(),
      image: item.image.trim(),
      url: item.url.trim(),
      summary: item.summary ? String(item.summary).trim() : ''
    });
    saveJson(seriesFile, series);
    return res.json({ success: true, message: 'Série adicionada à categoria global com sucesso!' });
  }

  // Lógica Padrão (Categorias Customizadas)
  const categories = loadJson(categoriesFile, []);
  const category = categories.find(c => c.id === categoryId);
  if (!category) return res.status(404).json({ success: false, message: 'Categoria não encontrada!' });

  const item = req.body || {};
  if (!item.title || !item.image || !item.url) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
  }
  const items = Array.isArray(category.items) ? category.items : [];
  const exists = items.some(i => i.title === item.title);
  if (exists) {
    return res.status(400).json({ success: false, message: 'Já existe um item com este título!' });
  }
  items.push({
    title: item.title.trim(),
    image: item.image.trim(),
    url: item.url.trim(),
    summary: item.summary ? String(item.summary).trim() : ''
  });
  category.items = items;
  saveJson(categoriesFile, categories);
  res.json({ success: true, message: 'Item adicionado com sucesso!' });
});

app.put('/api/categories/:id/items/:index', (req, res) => {
  const categoryId = req.params.id;
  const index = Number(req.params.index);

  // Lógica para FILMES
  if (categoryId === 'films') {
    const films = loadJson(filmsFile, []);
    if (Number.isNaN(index) || index < 0 || index >= films.length) {
      return res.status(404).json({ success: false, message: 'Filme não encontrado!' });
    }
    const film = req.body || {};
    if (!film.title || !film.image || !film.url) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
    }
    films[index] = {
      title: film.title.trim(),
      image: film.image.trim(),
      url: film.url.trim(),
      summary: film.summary ? String(film.summary).trim() : ''
    };
    saveJson(filmsFile, films);
    return res.json({ success: true, message: 'Filme atualizado com sucesso!' });
  }

  // Lógica para SÉRIES
  if (categoryId === 'series') {
    const series = loadJson(seriesFile, []);
    if (Number.isNaN(index) || index < 0 || index >= series.length) {
      return res.status(404).json({ success: false, message: 'Série não encontrada!' });
    }
    const item = req.body || {};
    if (!item.title || !item.image || !item.url) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
    }
    series[index] = {
      title: item.title.trim(),
      image: item.image.trim(),
      url: item.url.trim(),
      summary: item.summary ? String(item.summary).trim() : ''
    };
    saveJson(seriesFile, series);
    return res.json({ success: true, message: 'Série atualizada com sucesso!' });
  }

  // Lógica Padrão
  const categories = loadJson(categoriesFile, []);
  const category = categories.find(c => c.id === categoryId);
  if (!category) return res.status(404).json({ success: false, message: 'Categoria não encontrada!' });

  const items = Array.isArray(category.items) ? category.items : [];
  if (Number.isNaN(index) || index < 0 || index >= items.length) {
    return res.status(404).json({ success: false, message: 'Item não encontrado!' });
  }
  const item = req.body || {};
  if (!item.title || !item.image || !item.url) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
  }
  items[index] = {
    title: item.title.trim(),
    image: item.image.trim(),
    url: item.url.trim(),
    summary: item.summary ? String(item.summary).trim() : ''
  };
  category.items = items;
  saveJson(categoriesFile, categories);
  res.json({ success: true, message: 'Item atualizado com sucesso!' });
});

app.delete('/api/categories/:id/items/:index', (req, res) => {
  const categoryId = req.params.id;
  const index = Number(req.params.index);

  // Lógica para FILMES
  if (categoryId === 'films') {
    const films = loadJson(filmsFile, []);
    if (Number.isNaN(index) || index < 0 || index >= films.length) {
      return res.status(404).json({ success: false, message: 'Filme não encontrado!' });
    }
    films.splice(index, 1);
    saveJson(filmsFile, films);
    return res.json({ success: true, message: 'Filme excluído com sucesso!' });
  }

  // Lógica para SÉRIES
  if (categoryId === 'series') {
    const series = loadJson(seriesFile, []);
    if (Number.isNaN(index) || index < 0 || index >= series.length) {
      return res.status(404).json({ success: false, message: 'Série não encontrada!' });
    }
    series.splice(index, 1);
    saveJson(seriesFile, series);
    return res.json({ success: true, message: 'Série excluída com sucesso!' });
  }

  // Lógica Padrão
  const categories = loadJson(categoriesFile, []);
  const category = categories.find(c => c.id === categoryId);
  if (!category) return res.status(404).json({ success: false, message: 'Categoria não encontrada!' });

  const items = Array.isArray(category.items) ? category.items : [];
  if (Number.isNaN(index) || index < 0 || index >= items.length) {
    return res.status(404).json({ success: false, message: 'Item não encontrado!' });
  }
  items.splice(index, 1);
  category.items = items;
  saveJson(categoriesFile, categories);
  res.json({ success: true, message: 'Item excluído com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
