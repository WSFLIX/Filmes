# StreamFlix - Catálogo de Filmes e Séries

Aplicação web para catalogar e organizar filmes e séries, agora com backend serverless hospedado no Vercel.

## 🚀 Tecnologias

- **Frontend:** HTML, CSS, JavaScript, Vite
- **Backend:** Vercel Serverless Functions
- **Banco de Dados:** Upstash Redis (Integrado ao Vercel)
- **Deploy:** Vercel

## 📋 Funcionalidades

- ✅ Catálogo de filmes e séries com paginação
- ✅ Busca por título
- ✅ Categorias customizadas
- ✅ Painel administrativo para gerenciar conteúdo
- ✅ Reprodução de vídeos integrada
- ✅ Persistência de dados no Redis (rápido e simples)
- ✅ API REST serverless

## 🛠️ Desenvolvimento Local

### Instalação

```bash
# Clone o repositório e instale dependências
npm install
```

### Executar Localmente

**Use este comando único para rodar tudo:**

```bash
npm run dev
```

Isso inicia:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🌐 Deploy no Vercel (Simples)

Siga o guia rápido em [DEPLOY_VERCEL_SIMPLES.md](./DEPLOY_VERCEL_SIMPLES.md)

### Resumo Rápido

1. **Deploy:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configurar Banco:**
   - No painel do Vercel, vá em **Storage**
   - Crie um banco **Upstash Redis**
   - Conecte ao seu projeto

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

4. **(Opcional) Migrar Dados:**
   ```bash
   node migrate-data-redis.js
   ```

## 📁 Estrutura do Projeto

```
├── api/                    # Serverless Functions (Vercel)
│   ├── lib/
│   │   └── db.js          # Conexão Redis
│   ├── films.js           # CRUD filmes
│   ├── ...
├── src/                   # Frontend
├── data/                  # Dados locais (apenas dev)
├── server.js              # Backend Express (dev local)
├── vercel.json            # Configuração Vercel
├── migrate-data-redis.js  # Script de migração
└── package.json
```

## 📝 Licença

MIT
