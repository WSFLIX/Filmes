/**
 * Controlador da Interface do Painel Admin
 * Gerencia toda a interação com o usuário
 */

// Verifica autenticação ao carregar
if (typeof authManager === 'undefined' || !authManager.isAuthenticated()) {
    alert('Acesso negado! Faça login primeiro.');
    window.location.href = 'login-admin.html';
    throw new Error('Não autenticado');
}

// Estado da aplicação
let currentSection = 'categories';
let currentEditIndex = null;
let currentEditType = null;
let currentCategoryId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    initializePanel();
    // await loadFilms(); // Removido
    // await loadSeries(); // Removido
    await loadCategories();
    // await updateCategoriesNav(); // Removido sidebar nav
    await updateStats();
    setupEventListeners();
    
    // Exibe nome do usuário
    const session = authManager.getSession();
    if (session) {
        document.getElementById('username-display').textContent = session.username;
    }
});

/**
 * Inicializa o painel
 */
function initializePanel() {
    // Carrega dados iniciais no localStorage se ainda não existirem
    adminDataManager.initializeData();
}

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // Mudar senha
    document.getElementById('btn-change-password').addEventListener('click', openPasswordModal);

    // Adicionar itens (Apenas via Categoria agora)
    // document.getElementById('btn-add-film').addEventListener('click', () => openAddModal('film'));
    // document.getElementById('btn-add-series').addEventListener('click', () => openAddModal('series'));

    // Categorias
    document.getElementById('btn-add-category').addEventListener('click', openCategoryModal);
    document.getElementById('btn-add-category-item').addEventListener('click', () => openAddModal('category'));
    document.getElementById('search-category-items').addEventListener('input', (e) => searchCategoryItems(e.target.value));
    const exportBtn = document.getElementById('btn-export-categories');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCategoriesToFile);
    }

    // Busca (Direct films/series search removed)
    // document.getElementById('search-films').addEventListener('input', (e) => searchItems('films', e.target.value));
    // document.getElementById('search-series').addEventListener('input', (e) => searchItems('series', e.target.value));

    // Modal principal
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    document.getElementById('item-form').addEventListener('submit', handleItemSubmit);

    // Modal de senha
    document.querySelectorAll('.modal-close-pwd').forEach(btn => {
        btn.addEventListener('click', closePasswordModal);
    });
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);

    // Modal de categoria
    document.querySelectorAll('.modal-close-cat').forEach(btn => {
        btn.addEventListener('click', closeCategoryModal);
    });
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);

    // Ações avançadas
    document.getElementById('btn-reset-data').addEventListener('click', handleResetData);
    document.getElementById('btn-back-home').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Fechar modal ao clicar fora
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });
    document.getElementById('modal-password').addEventListener('click', (e) => {
        if (e.target.id === 'modal-password') closePasswordModal();
    });
    document.getElementById('modal-category').addEventListener('click', (e) => {
        if (e.target.id === 'modal-category') closeCategoryModal();
    });
}

/**
 * Troca de seção
 */
async function switchSection(section) {
    currentSection = section;
    
    // Atualiza navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Atualiza conteúdo
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`section-${section}`).classList.add('active');
    
    // Atualiza dados se necessário
    if (section === 'stats') {
        await updateStats();
    } else if (section === 'categories') {
        await loadCategories();
        document.getElementById('categories-view').style.display = 'block';
        document.getElementById('category-content').style.display = 'none';
        currentCategoryId = null;
    }
}

/**
 * Carrega filmes
 */
async function loadFilms() {
    const films = await adminDataManager.getFilms();
    const grid = document.getElementById('films-grid');
    
    if (films.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>Nenhum filme cadastrado</h3><p>Clique em "Adicionar Filme" para começar</p></div>';
        return;
    }
    
    grid.innerHTML = films.map((film, index) => `
        <div class="item-card">
            <img src="${film.image}" alt="${film.title}" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Imagem'">
            <div class="item-info">
                <div class="item-title">${film.title}</div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="openEditModal('film', ${index})">✏️ Editar</button>
                    <button class="btn-delete" onclick="deleteItem('film', ${index})">🗑️ Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Carrega séries
 */
async function loadSeries() {
    const series = await adminDataManager.getSeries();
    const grid = document.getElementById('series-grid');
    
    if (series.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>Nenhuma série cadastrada</h3><p>Clique em "Adicionar Série" para começar</p></div>';
        return;
    }
    
    grid.innerHTML = series.map((item, index) => `
        <div class="item-card">
            <img src="${item.image}" alt="${item.title || item.name}" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Imagem'">
            <div class="item-info">
                <div class="item-title">${item.title || item.name}</div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="openEditModal('series', ${index})">✏️ Editar</button>
                    <button class="btn-delete" onclick="deleteItem('series', ${index})">🗑️ Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Atualiza estatísticas
 */
async function updateStats() {
    const films = await adminDataManager.getFilms();
    const series = await adminDataManager.getSeries();
    const categories = await adminDataManager.getCategories();
    
    // Calcula total de itens de todas as categorias
    let totalItems = 0;
    const itemsPerCategory = await Promise.all(
        categories.map(cat => adminDataManager.getCategoryItems(cat.id))
    );
    itemsPerCategory.forEach(items => {
        totalItems += items.length;
    });
    
    document.getElementById('total-films').textContent = films.length;
    document.getElementById('total-series').textContent = series.length;
    document.getElementById('total-items').textContent = totalItems;
}

/**
 * Busca itens
 */
async function searchItems(type, query) {
    if (type === 'films') {
        const results = query.trim() === '' ? 
            await adminDataManager.getFilms() : 
            await adminDataManager.searchFilms(query);
        
        const grid = document.getElementById('films-grid');
        if (results.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>Nenhum filme encontrado</h3></div>';
        } else {
            const allFilms = await adminDataManager.getFilms();
            grid.innerHTML = results.map((film, index) => {
                // Precisa encontrar o índice real
                const realIndex = allFilms.findIndex(f => f.title === film.title);
                return `
                    <div class="item-card">
                        <img src="${film.image}" alt="${film.title}" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Imagem'">
                        <div class="item-info">
                            <div class="item-title">${film.title}</div>
                            <div class="item-actions">
                                <button class="btn-edit" onclick="openEditModal('film', ${realIndex})">✏️ Editar</button>
                                <button class="btn-delete" onclick="deleteItem('film', ${realIndex})">🗑️ Excluir</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } else {
        const results = query.trim() === '' ? 
            await adminDataManager.getSeries() : 
            await adminDataManager.searchSeries(query);
        
        const grid = document.getElementById('series-grid');
        if (results.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>Nenhuma série encontrada</h3></div>';
        } else {
            const allSeries = await adminDataManager.getSeries();
            grid.innerHTML = results.map((item) => {
                const realIndex = allSeries.findIndex(s => 
                    (s.title === item.title) || (s.name === item.name)
                );
                return `
                    <div class="item-card">
                        <img src="${item.image}" alt="${item.title || item.name}" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Imagem'">
                        <div class="item-info">
                            <div class="item-title">${item.title || item.name}</div>
                            <div class="item-actions">
                                <button class="btn-edit" onclick="openEditModal('series', ${realIndex})">✏️ Editar</button>
                                <button class="btn-delete" onclick="deleteItem('series', ${realIndex})">🗑️ Excluir</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

/**
 * Abre modal para adicionar
 */
function openAddModal(type) {
    console.log('[AdminPanel] openAddModal - type:', type, 'currentCategoryId:', currentCategoryId);
    currentEditType = type;
    currentEditIndex = null;
    
    if (type === 'category') {
        document.getElementById('modal-title').textContent = 'Adicionar Item à Categoria';
    } else {
        document.getElementById('modal-title').textContent = 
            type === 'film' ? 'Adicionar Filme' : 'Adicionar Série';
    }
    
    document.getElementById('item-form').reset();
    document.getElementById('modal').classList.add('show');
}

/**
 * Abre modal para editar
 */
async function openEditModal(type, index) {
    currentEditType = type;
    currentEditIndex = index;
    
    const item = type === 'film' ? 
        (await adminDataManager.getFilms())[index] : 
        (await adminDataManager.getSeries())[index];
    
    document.getElementById('modal-title').textContent = 
        type === 'film' ? 'Editar Filme' : 'Editar Série';
    
    document.getElementById('item-title').value = item.title || item.name || '';
    document.getElementById('item-image').value = item.image || '';
    document.getElementById('item-url').value = item.url || '';
    document.getElementById('item-summary').value = item.summary || '';
    
    document.getElementById('modal').classList.add('show');
}

/**
 * Fecha modal
 */
function closeModal() {
    document.getElementById('modal').classList.remove('show');
    document.getElementById('item-form').reset();
    currentEditType = null;
    currentEditIndex = null;
}

/**
 * Submete formulário de item
 */
async function handleItemSubmit(e) {
    console.log('[AdminPanel] handleItemSubmit - type:', currentEditType, 'categoryId:', currentCategoryId);
    e.preventDefault();
    
    const itemData = {
        title: document.getElementById('item-title').value,
        image: document.getElementById('item-image').value,
        url: document.getElementById('item-url').value,
        summary: document.getElementById('item-summary').value
    };
    
    console.log('[AdminPanel] itemData:', itemData);
    let result;
    
    if (currentEditIndex === null) {
        // Adicionar novo
        if (currentEditType === 'film') {
            result = await adminDataManager.addFilm(itemData);
        } else if (currentEditType === 'series') {
            result = await adminDataManager.addSeries(itemData);
        } else if (currentEditType === 'category') {
            console.log('[AdminPanel] Adicionando item à categoria:', currentCategoryId);
            result = await adminDataManager.addItemToCategory(currentCategoryId, itemData);
        }
    } else {
        // Editar existente
        if (currentEditType === 'film') {
            result = await adminDataManager.updateFilm(currentEditIndex, itemData);
        } else if (currentEditType === 'series') {
            result = await adminDataManager.updateSeries(currentEditIndex, itemData);
        } else if (currentEditType === 'category') {
            result = await adminDataManager.updateCategoryItem(currentCategoryId, currentEditIndex, itemData);
        }
    }
    
    console.log('[AdminPanel] Resultado:', result);
    showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        closeModal();
        if (currentEditType === 'film') {
            await loadFilms();
        } else if (currentEditType === 'series') {
            await loadSeries();
        } else if (currentEditType === 'category') {
            await loadCategoryItems();
        }
        await updateStats();
    }
}

/**
 * Exclui um item
 */
async function deleteItem(type, index) {
    const films = await adminDataManager.getFilms();
    const series = await adminDataManager.getSeries();
    const itemName = type === 'film' ? 
        films[index].title : 
        (series[index].title || series[index].name);
    
    if (!confirm(`Tem certeza que deseja excluir "${itemName}"?`)) {
        return;
    }
    
    const result = type === 'film' ? 
        await adminDataManager.deleteFilm(index) : 
        await adminDataManager.deleteSeries(index);
    
    showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        if (type === 'film') {
            await loadFilms();
        } else {
            await loadSeries();
        }
        await updateStats();
    }
}

/**
 * Abre modal de senha
 */
function openPasswordModal() {
    document.getElementById('password-form').reset();
    document.getElementById('modal-password').classList.add('show');
}

/**
 * Fecha modal de senha
 */
function closePasswordModal() {
    document.getElementById('modal-password').classList.remove('show');
    document.getElementById('password-form').reset();
}

/**
 * Altera a senha
 */
function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showToast('As senhas não coincidem!', 'error');
        return;
    }
    
    const result = authManager.changePassword(currentPassword, newPassword);
    showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        closePasswordModal();
    }
}

/**
 * Faz logout
 */
function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        authManager.logout();
        window.location.href = '../index.html';
    }
}

/**
 * Reseta dados
 */
async function handleResetData() {
    if (confirm('⚠️ ATENÇÃO: Esta ação irá restaurar todos os dados originais e apagar suas modificações. Deseja continuar?')) {
        const result = await adminDataManager.resetToDefaults();
        showToast(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            await loadFilms();
            await loadSeries();
            await updateStats();
        }
    }
}

/**
 * GERENCIAMENTO DE CATEGORIAS
 */

/**
 * Carrega as categorias
 */
async function loadCategories() {
    console.log('[AdminPanel] loadCategories() chamada');
    const categories = await adminDataManager.getCategories();
    console.log('[AdminPanel] Categorias carregadas:', categories);
    const container = document.getElementById('categories-list');
    
    if (categories.length === 0) {
        console.warn('[AdminPanel] Nenhuma categoria encontrada');
        container.innerHTML = '<div class="empty-state"><h3>Nenhuma categoria cadastrada</h3></div>';
        return;
    }
    
    console.log('[AdminPanel] Renderizando', categories.length, 'categorias');
    
    const itemsPerCategory = await Promise.all(
        categories.map(async category => {
            const items = await adminDataManager.getCategoryItems(category.id);
            console.log(`[AdminPanel] Categoria ${category.name} (${category.id}) tem ${items.length} itens (API)`);
            return items;
        })
    );

    container.innerHTML = categories.map((category, idx) => {
        const items = itemsPerCategory[idx] || [];
        const isDefault = category.id === 'films' || category.id === 'series';
        
        return `
            <div class="category-card ${isDefault ? 'default' : ''}">
                <div class="category-header">
                    <div class="category-title">
                        <span class="category-icon">${category.icon}</span>
                        <span class="category-name">${category.name}</span>
                    </div>
                </div>
                <div class="category-stats">
                    <span>${items.length} ${items.length === 1 ? 'item' : 'itens'}</span>
                    ${isDefault ? '<span style="color: var(--warning);">Categoria padrão</span>' : ''}
                </div>
                <div class="category-actions">
                    <button class="btn-view" onclick="viewCategoryContent('${category.id}')">👁️ Ver Conteúdo</button>
                    <button class="btn-delete-cat" onclick="deleteCategory('${category.id}')" ${isDefault ? 'disabled' : ''}>🗑️ Excluir</button>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('[AdminPanel] Categorias renderizadas com sucesso');
}

/**
 * Visualiza conteúdo de uma categoria
 */
async function viewCategoryContent(categoryId) {
    console.log('[AdminPanel] viewCategoryContent - categoryId:', categoryId);
    currentCategoryId = categoryId;
    const categories = await adminDataManager.getCategories();
    const category = categories.find(c => c.id === categoryId);
    console.log('[AdminPanel] Categoria:', category);
    
    if (!category) {
        console.error('[AdminPanel] Categoria não encontrada!');
        return;
    }
    
    // Oculta lista de categorias e mostra conteúdo
    document.getElementById('categories-view').style.display = 'none';
    document.getElementById('category-content').style.display = 'block';
    document.getElementById('category-content-title').textContent = `${category.icon} ${category.name}`;
    
    await loadCategoryItems();
}

/**
 * Carrega itens de uma categoria
 */
async function loadCategoryItems() {
    if (!currentCategoryId) return;

    const items = await adminDataManager.getCategoryItems(currentCategoryId);
    const grid = document.getElementById('category-items-grid');
    
    if (items.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>Nenhum item nesta categoria</h3><p>Clique em "Adicionar Item" para começar</p></div>';
        return;
    }
    
    grid.innerHTML = items.map((item, index) => `
        <div class="item-card">
            <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Imagem'">
            <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="openEditCategoryItemModal(${index})">✏️ Editar</button>
                    <button class="btn-delete" onclick="deleteCategoryItem(${index})">🗑️ Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Busca itens na categoria
 */
async function searchCategoryItems(query) {
    if (!currentCategoryId) return;

    const allItems = await adminDataManager.getCategoryItems(currentCategoryId);
    const searchTerm = query.toLowerCase().trim();
    
    const results = searchTerm === '' ? allItems : allItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm)
    );
    
    const grid = document.getElementById('category-items-grid');
    if (results.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>Nenhum item encontrado</h3></div>';
    } else {
        grid.innerHTML = results.map((item) => {
            const realIndex = allItems.findIndex(i => i.title === item.title);
            return `
                <div class="item-card">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Imagem'">
                    <div class="item-info">
                        <div class="item-title">${item.title}</div>
                        <div class="item-actions">
                            <button class="btn-edit" onclick="openEditCategoryItemModal(${realIndex})">✏️ Editar</button>
                            <button class="btn-delete" onclick="deleteCategoryItem(${realIndex})">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

/**
 * Atualiza o menu de navegação com categorias personalizadas
 */
async function updateCategoriesNav() {
    console.log('[AdminPanel] updateCategoriesNav() chamada');
    const categories = await adminDataManager.getCategories();
    console.log('[AdminPanel] Categorias para nav:', categories);
    const navContainer = document.getElementById('custom-categories-nav');
    
    // Filtra apenas categorias personalizadas (não padrão)
    const customCategories = categories.filter(c => c.id !== 'films' && c.id !== 'series');
    console.log('[AdminPanel] Categorias personalizadas:', customCategories);
    
    if (customCategories.length === 0) {
        console.log('[AdminPanel] Nenhuma categoria personalizada');
        navContainer.innerHTML = '';
        return;
    }
    
    navContainer.innerHTML = customCategories.map(category => `
        <button class="nav-btn" data-section="category-${category.id}" onclick="switchToCategory('${category.id}')">
            ${category.icon} ${category.name}
        </button>
    `).join('');
    
    console.log('[AdminPanel] Menu de navegação atualizado com', customCategories.length, 'categorias');
}

/**
 * Alterna para uma categoria específica via menu
 */
async function switchToCategory(categoryId) {
    await switchSection('categories');
    await viewCategoryContent(categoryId);
}

/**
 * Abre modal para adicionar categoria
 */
function openCategoryModal() {
    document.getElementById('category-form').reset();
    document.getElementById('modal-category').classList.add('show');
}

/**
 * Fecha modal de categoria
 */
function closeCategoryModal() {
    document.getElementById('modal-category').classList.remove('show');
    document.getElementById('category-form').reset();
}

/**
 * Submete formulário de categoria
 */
async function handleCategorySubmit(e) {
    console.log('[AdminPanel] handleCategorySubmit chamada');
    e.preventDefault();
    
    const categoryName = document.getElementById('category-name').value.trim();
    const categoryIcon = document.getElementById('category-icon').value.trim();
    
    console.log('[AdminPanel] Nome:', categoryName, 'Ícone:', categoryIcon);
    
    if (!categoryName || !categoryIcon) {
        console.warn('[AdminPanel] Campos vazios!');
        showToast('Preencha todos os campos!', 'error');
        return;
    }
    
    const categoryData = {
        name: categoryName,
        icon: categoryIcon
    };
    
    console.log('[AdminPanel] Enviando para adminDataManager:', categoryData);
    const result = await adminDataManager.addCategory(categoryData);
    console.log('[AdminPanel] Resultado:', result);
    showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        console.log('[AdminPanel] Sucesso! Atualizando UI...');
        closeCategoryModal();
        await loadCategories();
        await updateCategoriesNav();
        await updateStats();

        // Salvo via API
        
        // Notifica o gerenciador de menu para recarregar as categorias
        if (typeof categoriesMenuManager !== 'undefined') {
            console.log('[AdminPanel] Recarregando menu de categorias do site');
            categoriesMenuManager.reload();
        }
    }
}

/**
 * Exporta categorias para um arquivo JS (categoriesData.js)
 */
async function exportCategoriesToFile() {
    const categories = await adminDataManager.getCategories();
    const fileContent = `/**\n * Dados das categorias para o catálogo\n * Cada categoria contém: id, name, icon, storageKey\n */\n\nwindow.CATEGORIES_STORAGE_MODE = 'file';\n\nconst categoriesData = ${JSON.stringify(categories, null, 2)};\n`;

    const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'categoriesData.js';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast('Arquivo categoriesData.js gerado. Substitua em src/js/', 'success');
}

/**
 * Exclui uma categoria
 */
async function deleteCategory(categoryId) {
    const categories = await adminDataManager.getCategories();
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) return;
    
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}" e todo seu conteúdo?`)) {
        return;
    }
    
    const result = await adminDataManager.deleteCategory(categoryId);
    showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        await loadCategories();
        await updateCategoriesNav();
        await updateStats();
        // Esconde conteúdo se estava visualizando a categoria excluída
        if (currentCategoryId === categoryId) {
            document.getElementById('category-content').style.display = 'none';
            currentCategoryId = null;
        }
        
        // Notifica o gerenciador de menu para recarregar as categorias
        if (typeof categoriesMenuManager !== 'undefined') {
            console.log('[AdminPanel] Categoria excluída, recarregando menu');
            categoriesMenuManager.reload();
        }
    }
}

/**
 * Abre modal para editar item de categoria
 */
async function openEditCategoryItemModal(index) {
    currentEditType = 'category';
    currentEditIndex = index;
    
    const items = await adminDataManager.getCategoryItems(currentCategoryId);
    const categories = await adminDataManager.getCategories();
    const item = items[index];
    const category = categories.find(c => c.id === currentCategoryId);
    
    document.getElementById('modal-title').textContent = `Editar Item de ${category.name}`;
    
    document.getElementById('item-title').value = item.title || '';
    document.getElementById('item-image').value = item.image || '';
    document.getElementById('item-url').value = item.url || '';
    document.getElementById('item-summary').value = item.summary || '';
    
    document.getElementById('modal').classList.add('show');
}

/**
 * Exclui item de categoria
 */
async function deleteCategoryItem(index) {
    const items = await adminDataManager.getCategoryItems(currentCategoryId);
    const item = items[index];
    
    if (!confirm(`Tem certeza que deseja excluir "${item.title}"?`)) {
        return;
    }
    
    const result = await adminDataManager.deleteCategoryItem(currentCategoryId, index);
    showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        await loadCategoryItems();
        await updateStats();
    }
}

/**
 * Exibe notificação toast
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
