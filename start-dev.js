const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

console.log(`${colors.bright}${colors.cyan}==========================================`);
console.log(`  Iniciando Backend + Frontend (Vite)`);
console.log(`==========================================${colors.reset}\n`);

// Função para verificar se a porta está em uso
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Porta em uso
      } else {
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true); // Porta livre
    });
    
    server.listen(port);
  });
}

// Função principal
async function startServers() {
  // Verificar se a porta 3000 está livre
  const port3000Free = await checkPort(3000);
  
  if (!port3000Free) {
    console.log(`${colors.red}[Erro]${colors.reset} A porta 3000 já está em uso!`);
    console.log(`${colors.yellow}[Dica]${colors.reset} Você já tem o servidor rodando em outra janela?`);
    console.log(`${colors.yellow}[Dica]${colors.reset} Feche a outra janela ou pressione Ctrl+C lá primeiro.\n`);
    
    // Tentar iniciar apenas o Vite
    console.log(`${colors.blue}[Frontend]${colors.reset} Iniciando apenas o Vite na porta 5173...\n`);
    
    const frontend = spawn('npx', ['vite'], {
      stdio: 'inherit',
      shell: true
    });
    
    frontend.on('close', (code) => {
      process.exit(code);
    });
    
    return;
  }
  
  // Iniciar o servidor backend
  console.log(`${colors.green}[Backend]${colors.reset} Iniciando servidor na porta 3000...`);
  const backend = spawn('node', ['server.js'], {
    stdio: 'pipe',
    shell: true
  });
  
  // Mostrar output do backend
  backend.stdout.on('data', (data) => {
    process.stdout.write(`${colors.green}[Backend]${colors.reset} ${data}`);
  });
  
  backend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.yellow}[Backend]${colors.reset} ${data}`);
  });
  
  // Aguardar 2 segundos antes de iniciar o Vite
  setTimeout(() => {
    console.log(`${colors.blue}[Frontend]${colors.reset} Iniciando Vite na porta 5173...\n`);
    
    const frontend = spawn('npx', ['vite'], {
      stdio: 'inherit',
      shell: true
    });
    
    // Tratamento de erros e encerramento
    frontend.on('error', (err) => {
      console.error(`${colors.yellow}[Frontend]${colors.reset} Erro:`, err);
    });
    
    frontend.on('close', (code) => {
      console.log(`\n${colors.blue}[Frontend]${colors.reset} Encerrado com código ${code}`);
      backend.kill();
      process.exit(code);
    });
  }, 2000);
  
  backend.on('error', (err) => {
    console.error(`${colors.yellow}[Backend]${colors.reset} Erro:`, err);
  });
  
  backend.on('close', (code) => {
    console.log(`\n${colors.green}[Backend]${colors.reset} Encerrado com código ${code}`);
    process.exit(code);
  });
  
  // Tratamento de Ctrl+C
  process.on('SIGINT', () => {
    console.log(`\n\n${colors.yellow}Encerrando servidores...${colors.reset}`);
    backend.kill('SIGINT');
    process.exit(0);
  });
  
  console.log(`\n${colors.bright}Dica:${colors.reset} Pressione Ctrl+C para parar ambos os servidores\n`);
}

// Executar
startServers();
