# Deploy no Vercel com Banco Supabase

O Supabase é um banco de dados SQL (PostgreSQL) muito poderoso e gratuito.

## 1. Configurar Supabase

1. Crie uma conta em: https://supabase.com
2. Crie um novo projeto
3. Vá em **Project Settings** > **API** e copie:
   - **Project URL**
   - **Project API keys (anon public)**

## 2. Criar Tabelas no Supabase

1. Vá em **SQL Editor** no painel do Supabase.
2. Copie o conteúdo do arquivo `supabase_schema.sql` deste projeto.
3. Cole no editor e clique em **Run**.

Isso criará as tabelas `films`, `series`, `categories`, etc.

## 3. Deploy no Vercel

```bash
vercel
```

Se tiver falha no build/deploy inicial, não se preocupe, precisamos configurar as variáveis.

## 4. Configurar Variáveis no Vercel

1. Acesse seu projeto no painel do Vercel.
2. Vá em **Settings** > **Environment Variables**.
3. Adicione duas variáveis:
   - `SUPABASE_URL`: (Cole a URL do passo 1)
   - `SUPABASE_KEY`: (Cole a anon key do passo 1)
4. Salve.

## 5. Redeploy

Para aplicar as novas variáveis:

```bash
vercel --prod
```

## 6. Migrar seus dados locais (Opcional)

Para enviar seus filmes/séries locais para o Supabase:

No terminal local (PowerShell):
```powershell
$env:SUPABASE_URL="sua_url_aqui"
$env:SUPABASE_KEY="sua_chave_aqui"
node migrate-data-supabase.js
```

Pronto! Seu site agora usa um banco de dados profissional.
