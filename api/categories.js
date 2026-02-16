const { getCategories, createCategory, deleteCategory } = require('./lib/db');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // GET /api/categories - Lista categorias
    if (req.method === 'GET') {
      const categories = await getCategories();
      return res.status(200).json(categories);
    }

    // POST /api/categories - Cria categoria
    if (req.method === 'POST') {
      const category = req.body;
      
      if (!category.name || !category.icon) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nome e ícone são obrigatórios!' 
        });
      }

      const id = String(category.name).toLowerCase().replace(/[^a-z0-9]/g, '_');
      const storageKey = `streamflix_${id}`;
      
      try {
        await createCategory({
          id,
          name: String(category.name).trim(),
          icon: String(category.icon).trim(),
          storage_key: storageKey,
          items: [] // itens são salvos em outra tabela, mas passamos aqui para compatibilidade
        });
      } catch (e) {
        if (e.code === '23505') { // Unique violation
          return res.status(400).json({ 
            success: false, 
            message: 'Já existe uma categoria com este ID/nome!' 
          });
        }
        throw e;
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Categoria adicionada com sucesso!' 
      });
    }

    // DELETE /api/categories?id=X - Remove categoria
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (id === 'films' || id === 'series') {
        return res.status(400).json({ 
          success: false, 
          message: 'Não é possível excluir categorias padrão!' 
        });
      }

      await deleteCategory(id);

      return res.status(200).json({ 
        success: true, 
        message: 'Categoria excluída com sucesso!' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in categories endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor', 
      error: error.message 
    });
  }
};
