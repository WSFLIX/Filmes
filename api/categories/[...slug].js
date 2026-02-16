const { 
  getFilms, createFilm, 
  getSeries, createSeries, 
  getCategories, createCategoryItem, updateCategoryItem, deleteCategoryItem
} = require('../lib/db');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // URL format: /api/categories/:id/items/:index
    const pathParts = req.url.split('?')[0].split('/').filter(Boolean);
    const categoryId = pathParts[2];
    const itemIndex = pathParts[4] ? Number(pathParts[4]) : null;

    // Redirecionamento para filmes e séries
    if (categoryId === 'films') {
      return await handleStandardItems(req, res, getFilms, createFilm, itemIndex, 'Filme');
    }

    if (categoryId === 'series') {
      return await handleStandardItems(req, res, getSeries, createSeries, itemIndex, 'Série');
    }

    // Categorias customizadas
    const categories = await getCategories();
    const category = categories.find(c => c.id === categoryId);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Categoria não encontrada!' 
      });
    }

    // GET /api/categories/:id/items
    if (req.method === 'GET' && itemIndex === null) {
      const items = Array.isArray(category.items) ? category.items : [];
      return res.status(200).json(items);
    }

    // POST /api/categories/:id/items
    if (req.method === 'POST' && itemIndex === null) {
      const item = req.body;
      
      if (!item.title || !item.image || !item.url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos são obrigatórios!' 
        });
      }

      await createCategoryItem(categoryId, {
        title: item.title.trim(),
        image: item.image.trim(),
        url: item.url.trim(),
        summary: item.summary ? String(item.summary).trim() : '',
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Item adicionado com sucesso!' 
      });
    }

    // PUT /api/categories/:id/items/:index
    if (req.method === 'PUT' && itemIndex !== null) {
      const item = req.body;
      
      if (!item.title || !item.image || !item.url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos são obrigatórios!' 
        });
      }

      const items = Array.isArray(category.items) ? category.items : [];
      
      if (Number.isNaN(itemIndex) || itemIndex < 0 || itemIndex >= items.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Item não encontrado!' 
        });
      }

      const itemToUpdate = items[itemIndex];
      
      await updateCategoryItem(itemToUpdate.id, {
        title: item.title.trim(),
        image: item.image.trim(),
        url: item.url.trim(),
        summary: item.summary ? String(item.summary).trim() : '',
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Item atualizado com sucesso!' 
      });
    }

    // DELETE /api/categories/:id/items/:index
    if (req.method === 'DELETE' && itemIndex !== null) {
      const items = Array.isArray(category.items) ? category.items : [];
      
      if (Number.isNaN(itemIndex) || itemIndex < 0 || itemIndex >= items.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Item não encontrado!' 
        });
      }

      const itemToDelete = items[itemIndex];
      await deleteCategoryItem(itemToDelete.id);

      return res.status(200).json({ 
        success: true, 
        message: 'Item excluído com sucesso!' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in category items endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor', 
      error: error.message 
    });
  }
};

// Helper function para lidar com filmes e séries (apenas GET e POST nesta rota dinâmica)
// PUT e DELETE de filmes/séries são feitos pelas rotas diretas /api/films e /api/series
async function handleStandardItems(req, res, getFn, createFn, itemIndex, itemType) {
  const collection = await getFn();

  // GET - Lista itens
  if (req.method === 'GET' && itemIndex === null) {
    return res.status(200).json(collection);
  }

  // POST - Adiciona item
  if (req.method === 'POST' && itemIndex === null) {
    const item = req.body;
    
    if (!item.title || !item.image || !item.url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos os campos são obrigatórios!' 
      });
    }

    await createFn({
      title: item.title.trim(),
      image: item.image.trim(),
      url: item.url.trim(),
      summary: item.summary ? String(item.summary).trim() : '',
    });

    return res.status(200).json({ 
      success: true, 
      message: `${itemType} adicionad${itemType === 'Filme' ? 'o' : 'a'} com sucesso!` 
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
