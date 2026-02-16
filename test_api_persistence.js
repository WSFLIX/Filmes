// Usando fetch nativo do Node.js

const API_BASE = 'http://localhost:3000/api';

async function testPersistence() {
    console.log('--- INICIANDO TESTE DE PERSISTÊNCIA ---');

    // 1. Criar Categoria Teste
    const catName = 'Teste_' + Date.now();
    console.log(`1. Criando categoria: ${catName}`);
    
    let res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName, icon: '🧪' })
    });
    let data = await res.json();
    console.log('Criar Categoria:', data);

    if (!data.success) {
        console.error('Falha ao criar categoria');
        return;
    }

    // 2. Buscar Categorias para pegar o ID
    res = await fetch(`${API_BASE}/categories`);
    const categories = await res.json();
    const myCat = categories.find(c => c.name === catName);
    
    if (!myCat) {
        console.error('Categoria criada não encontrada na lista!');
        return;
    }
    console.log(`2. Categoria encontrada. ID: ${myCat.id}`);

    // 3. Adicionar Item
    console.log('3. Adicionando item à categoria...');
    const item = {
        title: 'Filme Teste ' + Date.now(),
        image: 'http://img.com',
        url: 'http://video.com',
        summary: 'Resumo teste'
    };

    res = await fetch(`${API_BASE}/categories/${myCat.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    });
    data = await res.json();
    console.log('Adicionar Item:', data);

    // 4. Verificar Itens na Categoria
    console.log('4. Verificando itens...');
    res = await fetch(`${API_BASE}/categories/${myCat.id}/items`);
    const items = await res.json();
    console.log(`Itens retornados: ${items.length}`);
    
    if (items.length > 0) {
        console.log('SUCESSO: O item foi persistido!');
    } else {
        console.error('FALHA: O item foi adicionado mas a lista retornou vazia!');
    }

    // 5. Cleanup
    console.log('5. Limpando...');
    await fetch(`${API_BASE}/categories/${myCat.id}`, { method: 'DELETE' });
    console.log('Teste concluído.');
}

testPersistence();
