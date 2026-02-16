const { 
  getAllFilms, saveAllFilms,
  getAllSeries, saveAllSeries,
  getAllCategories, saveAllCategories
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
    // pathParts = ['api', 'categories', ':id', 'items', ':index']
    
    const categoryId = pathParts[2];
    const itemIndex = pathParts[4] ? Number(pathParts[4]) : null;

    // Redirecionamento para filmes e séries
    if (categoryId === 'films') {
      return await handleCategoryItems(req, res, getAllFilms, saveAllFilms, itemIndex, 'Filme');
    }

    if (categoryId === 'series') {
      return await handleCategoryItems(req, res, getAllSeries, saveAllSeries, itemIndex, 'Série');
    }

    // Categorias customizadas
    const categories = await getAllCategories();
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

      const items = Array.isArray(category.items) ? category.items : [];
      const exists = items.some(i => i.title === item.title);
      
      if (exists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Já existe um item com este título!' 
        });
      }

      items.push({
        title: item.title.trim(),
        image: item.image.trim(),
        url: item.url.trim(),
        summary: item.summary ? String(item.summary).trim() : '',
      });

      // Atualiza a categoria dentro do array de categorias
      const catIndex = categories.findIndex(c => c.id === categoryId);
      if (catIndex !== -1) {
        categories[catIndex] = category;
        await saveAllCategories(categories);
      }

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

      items[itemIndex] = {
        title: item.title.trim(),
        image: item.image.trim(),
        url: item.url.trim(),
        summary: item.summary ? String(item.summary).trim() : '',
      };

      // Atualiza a categoria dentro do array de categorias
      const catIndex = categories.findIndex(c => c.id === categoryId);
      if (catIndex !== -1) {
        categories[catIndex] = category;
        await saveAllCategories(categories);
      }

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

      items.splice(itemIndex, 1);

      // Atualiza a categoria dentro do array de categorias
      const catIndex = categories.findIndex(c => c.id === categoryId);
      if (catIndex !== -1) {
        categories[catIndex] = category;
        await saveAllCategories(categories);
      }

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

// Helper function para lidar com filmes e séries
async function handleCategoryItems(req, res, getFn, saveFn, itemIndex, itemType) {
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

    const existing = collection.find(i => i.title === item.title);
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Já existe ${itemType === 'Filme' ? 'um filme' : 'uma série'} com este título!` 
      });
    }

    collection.push({
      title: item.title.trim(),
      image: item.image.trim(),
      url: item.url.trim(),
      summary: item.summary ? String(item.summary).trim() : '',
    });

    await saveFn(collection);

    return res.status(200).json({ 
      success: true, 
      message: `${itemType} adicionad${itemType === 'Filme' ? 'o' : 'a'} com sucesso!` 
    });
  }

  // PUT - Atualiza item
  if (req.method === 'PUT' && itemIndex !== null) {
    const item = req.body;
    
    if (!item.title || !item.image || !item.url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos os campos são obrigatórios!' 
      });
    }
    
    if (Number.isNaN(itemIndex) || itemIndex < 0 || itemIndex >= collection.length) {
      return res.status(404).json({ 
        success: false, 
        message: `${itemType} não encontrad${itemType === 'Filme' ? 'o' : 'a'}!` 
      });
    }

    collection[itemIndex] = {
      title: item.title.trim(),
      image: item.image.trim(),
      url: item.url.trim(),
      summary: item.summary ? String(item.summary).trim() : '',
    };

    await saveFn(collection);

    return res.status(200).json({ 
      success: true, 
      message: `${itemType} atualizad${itemType === 'Filme' ? 'o' : 'a'} com sucesso!` 
    });
  }

  // DELETE - Remove item
  if (req.method === 'DELETE' && itemIndex !== null) {
    if (Number.isNaN(itemIndex) || itemIndex < 0 || itemIndex >= collection.length) {
      return res.status(404).json({ 
        success: false, 
        message: `${itemType} não encontrad${itemType === 'Filme' ? 'o' : 'a'}!` 
      });
    }

    collection.splice(itemIndex, 1);
    await saveFn(collection);

    return res.status(200).json({ 
      success: true, 
      message: `${itemType} excluid${itemType === 'Filme' ? 'o' : 'a'} com sucesso!` 
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
