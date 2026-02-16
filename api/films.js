const { getAllFilms, saveAllFilms } = require('./lib/db');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // GET /api/films - Lista todos os filmes
    if (req.method === 'GET') {
      const films = await getAllFilms();
      return res.status(200).json(films);
    }

    // POST /api/films - Adiciona novo filme
    if (req.method === 'POST') {
      const films = await getAllFilms();
      const film = req.body;
      
      if (!film.title || !film.image || !film.url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos são obrigatórios!' 
        });
      }

      // Verifica se já existe
      if (films.some(f => f.title === film.title)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Já existe um filme com este título!' 
        });
      }

      // Adiciona novo filme
      films.push({
        title: film.title.trim(),
        image: film.image.trim(),
        url: film.url.trim(),
        summary: film.summary ? String(film.summary).trim() : '',
      });

      await saveAllFilms(films);

      return res.status(200).json({ 
        success: true, 
        message: 'Filme adicionado com sucesso!' 
      });
    }

    // PUT /api/films?index=X - Atualiza filme
    if (req.method === 'PUT') {
      const { index } = req.query;
      const films = await getAllFilms();
      const film = req.body;

      if (!film.title || !film.image || !film.url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos são obrigatórios!' 
        });
      }

      const idx = Number(index);
      if (Number.isNaN(idx) || idx < 0 || idx >= films.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Filme não encontrado!' 
        });
      }

      films[idx] = {
        title: film.title.trim(),
        image: film.image.trim(),
        url: film.url.trim(),
        summary: film.summary ? String(film.summary).trim() : '',
      };

      await saveAllFilms(films);

      return res.status(200).json({ 
        success: true, 
        message: 'Filme atualizado com sucesso!' 
      });
    }

    // DELETE /api/films?index=X - Remove filme
    if (req.method === 'DELETE') {
      const { index } = req.query;
      const films = await getAllFilms();

      const idx = Number(index);
      if (Number.isNaN(idx) || idx < 0 || idx >= films.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Filme não encontrado!' 
        });
      }

      films.splice(idx, 1);
      await saveAllFilms(films);

      return res.status(200).json({ 
        success: true, 
        message: 'Filme excluído com sucesso!' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in films endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor', 
      error: error.message 
    });
  }
};
