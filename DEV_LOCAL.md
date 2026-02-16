# Ambiente de Desenvolvimento Local

Como agora o projeto usa Serverless Functions do Vercel, você tem duas opções para desenvolvimento local:

## Opção 1: Usar o Backend Original (Recomendado durante desenvolvimento)

Continue usando o `server.js` original para desenvolvimento local:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:vite
```

O Vite já está configurado para fazer proxy das requisições `/api/*` para `http://localhost:3000`.

## Opção 2: Simular Ambiente Serverless Localmente

Use o Vercel CLI para simular o ambiente de produção:

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm install -g vercel

# Configurar variável de ambiente localmente
# Crie um arquivo .env na raiz do projeto:
MONGODB_URI=sua_connection_string_aqui

# Iniciar servidor de desenvolvimento Vercel
vercel dev
```

Isso executará as funções serverless localmente na porta 3000.

## Quando Usar Cada Opção?

- **Opção 1 (server.js):** Mais rápido para desenvolvimento iterativo e debugging
- **Opção 2 (vercel dev):** Para testar o funcionamento exato da produção antes do deploy

## Resumo dos Comandos

```bash
# Desenvolvimento com backend original
npm run dev              # Apenas Vite (precisa do backend rodando)
npm run dev:vite         # Apenas Vite
npm run dev:server       # Apenas backend Express

# Build de produção
npm run build            # Gera pasta dist/

# Preview local do build
npm run preview          # Serve a pasta dist/ localmente
```
