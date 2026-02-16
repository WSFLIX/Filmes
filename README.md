# StreamFlix - Catálogo de Filmes e Séries

Aplicação web para catalogar e organizar filmes e séries, com backend serverless hospedado no Vercel e banco de dados Supabase (PostgreSQL).

## 🚀 Tecnologias

- **Frontend:** HTML, CSS, JavaScript, Vite
- **Backend:** Vercel Serverless Functions
- **Banco de Dados:** Supabase (PostgreSQL)
- **Deploy:** Vercel

## 📋 Funcionalidades

- ✅ Catálogo de filmes e séries com paginação
- ✅ Busca por título
- ✅ Categorias customizadas
- ✅ Painel administrativo para gerenciar conteúdo
- ✅ Reprodução de vídeos integrada
- ✅ Persistência de dados robusta com Supabase

## 🛠️ Desenvolvimento Local

### Instalação

```bash
# Clone o repositório e instale dependências
npm install

# Configure as variáveis de ambiente no arquivo .env
# SUPABASE_URL=...
# SUPABASE_KEY=...
```

### Executar Localmente

**Use este comando único para rodar tudo:**

```bash
npm run dev
```

Isso inicia:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🌐 Deploy no Vercel com Supabase

Siga o guia completo em [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md)

### Resumo Rápido

1. **Crie Tabelas:**
   - Rode o script `supabase_schema.sql` no SQL Editor do Supabase.

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configurar Variáveis no Vercel:**
   - Adicione `SUPABASE_URL` e `SUPABASE_KEY` nas configurações do projeto no Vercel.

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

5. **(Opcional) Migrar Dados Locais:**
   ```bash
   node migrate-data-supabase.js
   ```

## 📁 Estrutura do Projeto

```
├── api/                    # Serverless Functions (Vercel)
│   ├── lib/
│   │   └── db.js          # Conexão Supabase
│   ├── films.js           # CRUD filmes
│   ├── ...
├── src/                   # Frontend
├── data/                  # Dados locais (apenas para migração)
├── supabase_schema.sql    # Script SQL para criar tabelas
├── migrate-data-supabase.js # Script de migração de dados
├── vercel.json            # Configuração Vercel
└── package.json
```

## 📝 Licença

MIT
