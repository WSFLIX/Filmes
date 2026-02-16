const { getSeries, createSeries, updateSeries, deleteSeries } = require('./lib/db');

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
      const series = await getSeries();
      return res.status(200).json(series);
    }

    // POST /api/series - Adiciona nova série
    if (req.method === 'POST') {
      const item = req.body;
      
      if (!item.title || !item.image || !item.url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos são obrigatórios!' 
        });
      }

      await createSeries({
        title: item.title.trim(),
        image: item.image.trim(),
        url: item.url.trim(),
        summary: item.summary ? String(item.summary).trim() : '',
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Série adicionada com sucesso!' 
      });
    }

    // PUT /api/series?index=X - Atualiza série
    if (req.method === 'PUT') {
      const { index } = req.query;
      const item = req.body;

      if (!item.title || !item.image || !item.url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos são obrigatórios!' 
        });
      }

      const series = await getSeries();
      const idx = Number(index);
      
      if (Number.isNaN(idx) || idx < 0 || idx >= series.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Série não encontrada!' 
        });
      }

      const seriesToUpdate = series[idx];
      
      await updateSeries(seriesToUpdate.id, {
        title: item.title.trim(),
        image: item.image.trim(),
        url: item.url.trim(),
        summary: item.summary ? String(item.summary).trim() : '',
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Série atualizada com sucesso!' 
      });
    }

    // DELETE /api/series?index=X - Remove série
    if (req.method === 'DELETE') {
      const { index } = req.query;
      const series = await getSeries();

      const idx = Number(index);
      if (Number.isNaN(idx) || idx < 0 || idx >= series.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Série não encontrada!' 
        });
      }

      const seriesToDelete = series[idx];
      await deleteSeries(seriesToDelete.id);

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
