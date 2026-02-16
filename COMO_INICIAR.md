# 🚀 Como Iniciar o WS FLIX (Backend + Frontend)

## Tutorial Passo a Passo para Iniciantes

Este tutorial vai te ensinar como iniciar o servidor da sua aplicação WS FLIX de forma simples e rápida.

---

## ✅ Opção 1: Iniciar Backend + Frontend Juntos (RECOMENDADO)

### 🎯 Usando o arquivo .bat (Mais Fácil!)

1. **Duplo clique** no arquivo `INICIAR_DEV.bat`
2. Duas janelas serão abertas:
   - Uma para o **Backend** (servidor na porta 3000)
   - Outra para o **Frontend/Vite** (interface na porta 5173)
3. **⚠️ NÃO FECHE** as janelas enquanto estiver desenvolvendo
4. Abra seu navegador e acesse: **http://localhost:5173**

### 💻 Usando o PowerShell/Terminal

1. Pressione a tecla **Windows** (⊞) no seu teclado
2. Digite: **PowerShell**
3. Clique em **Windows PowerShell** quando aparecer
4. Na janela que abrir, digite:

```powershell
cd "c:\Users\bielm\OneDrive\Documentos\Projetos\Filmes e Séries - VITE"
```

5. Depois execute:

```powershell
npm run dev
```

6. Aguarde até ver ambos os servidores iniciados
7. Abra seu navegador e acesse: **http://localhost:5173**

> 💡 **Dica**: Você pode **copiar** e **colar** esses comandos no PowerShell!
> - Para colar no PowerShell, clique com botão direito do mouse

---

## 🔧 Opção 2: Iniciar Backend e Frontend Separadamente

### Iniciar apenas o Backend (servidor)
```powershell
npm run dev:server
```
ou
```powershell
node server.js
```

### Iniciar apenas o Frontend (Vite)
```powershell
npm run dev:vite
```

> ⚠️ **Importante**: Para a aplicação funcionar completamente, você precisa rodar AMBOS!

---

## 🌐 Onde Acessar a Aplicação

### Desenvolvimento (com Vite - Hot Reload)
- **Frontend**: http://localhost:5173
  - Página Inicial: http://localhost:5173/
  - Filmes: http://localhost:5173/components/filmes.html
  - Séries: http://localhost:5173/components/series.html
  - Admin: http://localhost:5173/components/admin.html

### Backend API (servidor Express)
- **API**: http://localhost:3000
  - Endpoint filmes: http://localhost:3000/api/filmes
  - Endpoint séries: http://localhost:3000/api/series

---

## 🛑 Como Parar os Servidores

- **Se usou o arquivo .bat**: Feche ambas as janelas do prompt
- **Se usou o PowerShell**: Pressione **Ctrl + C** em cada janela

---

## 📦 Opção 3: Modo Produção (Backend com arquivos estáticos)

1. Primeiro, faça o **build** do frontend:
   ```powershell
   npm run build
   ```

2. Depois inicie o servidor:
   ```powershell
   npm start
   ```

3. Acesse apenas: **http://localhost:3000**

> 💡 Neste modo, o backend serve os arquivos estáticos do frontend já compilados.

---

## ❓ Problemas Comuns

### "node não é reconhecido como comando"

**Solução**: Você precisa ter o Node.js instalado. 
- Baixe em: https://nodejs.org
- Instale e reinicie o PowerShell

### "npm não é reconhecido como comando"

**Solução**: Instale o Node.js (vem com npm incluído)
- Baixe em: https://nodejs.org
- Após instalar, reinicie o PowerShell

### "Porta 3000 já está em uso"

**Solução**: Você já tem um servidor rodando!
1. Encontre a janela do PowerShell/Prompt que está rodando o servidor
2. Pressione **Ctrl + C** para parar
3. Ou reinicie o computador

### "Porta 5173 já está em uso"

**Solução**: Você já tem o Vite rodando!
1. Procure a janela que está rodando o Vite
2. Pressione **Ctrl + C** para parar
3. Ou o Vite vai automaticamente usar a porta 5174

### "Página não carrega no navegador"

**Solução**: 
- Verifique se AMBOS os servidores estão rodando (Backend E Frontend)
- Confirme que está acessando http://localhost:5173
- Verifique se não há erros nas janelas do terminal

### "Erro de permissão ao executar scripts"

**Solução**: 
1. Abra o PowerShell **como Administrador**
2. Execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Tente novamente

---

## 📝 Resumo Rápido

Para usar a aplicação sempre:

1. **Opção Rápida**: Duplo clique em `INICIAR_DEV.bat`

**OU**

1. Abrir PowerShell
2. Executar: `cd "c:\Users\bielm\OneDrive\Documentos\Projetos\Filmes e Séries - VITE"`
3. Executar: `npm run dev`
4. Abrir navegador e acessar: **http://localhost:5173**

---

## 💡 Entendendo a Estrutura

- **Backend (server.js)**: Roda na porta 3000, serve a API REST com os dados dos filmes e séries
- **Frontend (Vite)**: Roda na porta 5173, serve a interface visual e faz Hot Module Replacement (atualização automática)
- **Em Desenvolvimento**: Use porta 5173 (Vite) para ter hot reload
- **Em Produção**: Use porta 3000 (servidor serve tudo junto)

---

🎬 **Aproveite sua aplicação WS FLIX!** 📺
