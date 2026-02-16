# Deploy Simplificado no Vercel (com Banco Integrado)

Este guia usa o **Upstash Redis** (integrado no Vercel) para banco de dados, que é muito mais fácil de configurar que o MongoDB.

## 1. Deploy no Vercel

Abra o terminal na pasta do projeto e execute:

```bash
# Se não tiver o vercel instalado
npm install -g vercel

# Login (se não estiver logado)
vercel login

# Fazer o deploy
vercel
```

Responda as perguntas:
- **Set up and deploy?** → `y` (Yes)
- **Which scope?** → Sua conta
- **Link to existing project?** → `n` (No)
- **Project name?** → `streamflix` (ou outro nome único)
- **In which directory is your code located?** → `./` (Enter)

❗ **IMPORTANTE:** Durante o primeiro deploy, o site vai funcionar o frontend, mas o backend (adicionar filmes, etc) vai falhar porque ainda não configuramos o banco. **Isso é normal.**

## 2. Configurar o Banco de Dados (Upstash Redis)

1. Acesse o painel do seu projeto no Vercel: https://vercel.com/dashboard
2. Clique no projeto **streamflix** (ou o nome que você deu)
3. Vá na aba **Storage**
4. Clique em **Connect Store** (ou Create Database)
5. Selecione **Upstash Redis**
6. Clique em **Create**
   - Dê um nome (ex: `streamflix-db`)
   - Escolha a região (use `us-east-1` ou a mais próxima)
7. Clique em **Connect**
   - Marque para conectar nos ambientes "Production", "Preview" e "Development"

**Pronto!** O Vercel vai criar as variáveis de ambiente (`UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`) automaticamente no seu projeto.

## 3. Redeploy (Para aplicar o banco)

Agora que o banco está conectado, precisamos fazer um novo deploy para que o aplicativo "pegue" as novas variáveis.

No terminal:
```bash
vercel --prod
```

## 4. Migrar seus dados locais (Opcional)

Se você quiser enviar os filmes/séries que já tem no seu PC para o Vercel:

1. No painel do Vercel, vá em **Settings** > **Environment Variables**
2. Copie os valores de `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (clique no "olho" para ver o valor)
3. No seu terminal local (PowerShell), execute:

```powershell
$env:UPSTASH_REDIS_REST_URL="cole_a_url_aqui"
$env:UPSTASH_REDIS_REST_TOKEN="cole_o_token_aqui"
node migrate-data-redis.js
```

Seus dados aparecerão no site!

## Resumo dos Comandos

- Rodar localmente (Front + Back): `npm run dev`
- Deploy para produção: `vercel --prod`
