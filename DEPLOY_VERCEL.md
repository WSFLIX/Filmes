# Instruções de Deploy no Vercel

## 1. Criar Conta MongoDB Atlas (GRÁTIS)

1. Acesse: https://www.mongodb.com/cloud/atlas
2. Clique em "Try Free"
3. Crie uma conta (Google/GitHub ou email)
4. Crie um novo cluster:
   - Selecione **M0 Free Tier** (gratuito)
   - Escolha uma região próxima ao Brasil
   - Clique em "Create Cluster"

## 2. Configurar MongoDB Atlas

1. **Criar Usuário do Banco de Dados:**
   - Clique em "Database Access" no menu lateral
   - Clique em "Add New Database User"
   - Defina um usuário e senha (anote-os!)
   - Permissões: "Read and write to any database"
   - Clique em "Add User"

2. **Permitir Acesso de Qualquer IP:**
   - Clique em "Network Access" no menu lateral
   - Clique em "Add IP Address"
   - Selecione "Allow Access from Anywhere" (0.0.0.0/0)
   - Clique em "Confirm"

3. **Obter Connection String:**
   - Volte para "Database" no menu lateral
   - Clique em "Connect" no seu cluster
   - Selecione "Connect your application"
   - Copie a connection string (parecida com):
     ```
     mongodb+srv://usuario:<password>@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Substitua `<password>` pela senha do usuário criado**

## 3. Migrar Dados Locais para MongoDB

Execute o script de migração:

```bash
# Windows (PowerShell)
$env:MONGODB_URI="sua_connection_string_aqui"
node migrate-data.js

# Windows (CMD)
set MONGODB_URI=sua_connection_string_aqui
node migrate-data.js
```

**Importante:** Substitua `sua_connection_string_aqui` pela connection string do passo 2.3

## 4. Deploy no Vercel

### 4.1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 4.2. Login no Vercel

```bash
vercel login
```

### 4.3. Deploy do Projeto

```bash
vercel
```

Durante o deploy, responda:
- **Set up and deploy?** → Yes
- **Which scope?** → Sua conta
- **Link to existing project?** → No
- **Project name?** → streamflix (ou outro nome)
- **In which directory is your code located?** → ./ (diretório atual)

### 4.4. Configurar Variáveis de Ambiente no Vercel

```bash
vercel env add MONGODB_URI
```

Cole a connection string do MongoDB quando solicitado.

Ou configure manualmente:
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em "Settings" > "Environment Variables"
4. Adicione:
   - **Name:** `MONGODB_URI`
   - **Value:** Sua connection string
   - **Environment:** Production, Preview, Development
5. Clique em "Save"

### 4.5. Fazer Deploy para Produção

```bash
vercel --prod
```

## 5. Testar a Aplicação

Após o deploy, o Vercel fornecerá uma URL (exemplo: `https://streamflix.vercel.app`).

Teste:
- Acesse a URL
- Verifique se filmes e séries carregam
- Teste o login admin
- Adicione/edite/remova um item para verificar persistência

## 6. Atualizações Futuras

Para atualizar o site após mudanças:

```bash
vercel --prod
```

## Troubleshooting

### API não funciona
- Verifique se a variável `MONGODB_URI` está configurada no Vercel
- Verifique se a connection string está correta
- Veja os logs: `vercel logs`

### Dados não aparecem
- Execute novamente o script de migração
- Verifique a conexão no MongoDB Atlas → "Collections"

### Erros de build
- Execute `npm run build` localmente para testar
- Verifique se todas as dependências estão no `package.json`
