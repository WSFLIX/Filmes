const { getAllSeries, saveAllSeries } = require('./lib/db');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // GET /api/series - Lista todas as séries
    if (req.method === 'GET') {
      const series = await getAllSeries();
      return res.status(200).json(series);
    }

    // POST /api/series - Adiciona nova série
    if (req.method === 'POST') {
      const series = await getAllSeries();
      const item = req.body;
      
      if (!item.title || !item.image || !item.url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos são obrigatórios!' 
        });
      }

      // Verifica se já existe
      if (series.some(s => s.title === item.title || s.name === item.title)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Já existe uma série com este título!' 
        });
      }

      // Adiciona nova série
      series.push({
        title: item.title.trim(),
        image: item.image.trim(),
        url: item.url.trim(),
        summary: item.summary ? String(item.summary).trim() : '',
      });

      await saveAllSeries(series);

      return res.status(200).json({ 
        success: true, 
        message: 'Série adicionada com sucesso!' 
      });
    }

    // PUT /api/series?index=X - Atualiza série
    if (req.method === 'PUT') {
      const { index } = req.query;
      const series = await getAllSeries();
      const item = req.body;

      if (!item.title || !item.image || !item.url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos são obrigatórios!' 
        });
      }

      const idx = Number(index);
      if (Number.isNaN(idx) || idx < 0 || idx >= series.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Série não encontrada!' 
        });
      }

      series[idx] = {
        title: item.title.trim(),
        image: item.image.trim(),
        url: item.url.trim(),
        summary: item.summary ? String(item.summary).trim() : '',
      };

      await saveAllSeries(series);

      return res.status(200).json({ 
        success: true, 
        message: 'Série atualizada com sucesso!' 
      });
    }

    // DELETE /api/series?index=X - Remove série
    if (req.method === 'DELETE') {
      const { index } = req.query;
      const series = await getAllSeries();

      const idx = Number(index);
      if (Number.isNaN(idx) || idx < 0 || idx >= series.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Série não encontrada!' 
        });
      }

      series.splice(idx, 1);
      await saveAllSeries(series);

      return res.status(200).json({ 
        success: true, 
        message: 'Série excluída com sucesso!' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in series endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor', 
      error: error.message 
    });
  }
};
