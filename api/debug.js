const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // CORS headers para permitir acesso do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    SUPABASE_URL_SET: !!process.env.SUPABASE_URL,
    SUPABASE_KEY_SET: !!process.env.SUPABASE_KEY,
  };

  let dbStatus = 'Not checked';
  let error = null;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    try {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
      const { data, error: dbError } = await supabase.from('films').select('count', { count: 'exact', head: true });
      
      if (dbError) {
        dbStatus = 'Connection Failed';
        error = dbError.message;
      } else {
        dbStatus = 'Connected Successfully';
      }
    } catch (e) {
      dbStatus = 'Connection Error';
      error = e.message;
    }
  } else {
    dbStatus = 'Missing Credentials';
  }

  res.status(200).json({
    message: 'Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: envStatus,
    database: {
      status: dbStatus,
      error: error
    }
  });
};
