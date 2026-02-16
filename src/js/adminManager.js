/**
 * Gerenciador de Dados Admin
 * CRUD completo para filmes e séries
 */

class AdminDataManager {
    constructor() {
        this.filmsKey = 'streamflix_films';
        this.seriesKey = 'streamflix_series';
        this.categoriesKey = 'streamflix_categories';
        this.categoriesBackupKey = 'streamflix_categories_backup';
        this.apiBase = (typeof window !== 'undefined' && window.API_BASE) ? window.API_BASE : '/api';
        this.initializeData();
    }

    /**
     * Salva categorias e mantém backup atualizado
     */
    saveCategories(categories) {
        localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
        localStorage.setItem(this.categoriesBackupKey, JSON.stringify(categories));
    }

    /**
     * Inicializa dados se não existirem no localStorage
     */
    initializeData() {
        // Backend garante dados iniciais
    }

    /**
     * Retorna modo de armazenamento de categorias
     */
    getCategoriesStorageMode() {
        return 'api';
    }

    /**
     * Helper para requisições
     */
    async request(path, options = {}) {
        try {
            const response = await fetch(`${this.apiBase}${path}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
                ...options
            });

            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');
            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                return data || { success: false, message: 'Erro na requisição' };
            }

            return data;
        } catch (error) {
            return { success: false, message: 'Não foi possível conectar ao backend.' };
        }
    }

    /**
     * Obtém todos os filmes
     */
    async getFilms() {
        const data = await this.request('/films');
        return Array.isArray(data) ? data : [];
    }

    /**
     * Obtém todas as séries
     */
    async getSeries() {
        const data = await this.request('/series');
        return Array.isArray(data) ? data : [];
    }

    /**
     * Adiciona um novo filme
     */
    async addFilm(film) {
        return this.request('/films', {
            method: 'POST',
            body: JSON.stringify(film)
        });
    }

    /**
     * Adiciona uma nova série
     */
    async addSeries(series) {
        return this.request('/series', {
            method: 'POST',
            body: JSON.stringify(series)
        });
    }

    /**
     * Atualiza um filme existente
     */
    async updateFilm(index, updatedFilm) {
        return this.request(`/films/${index}`, {
            method: 'PUT',
            body: JSON.stringify(updatedFilm)
        });
    }

    /**
     * Atualiza uma série existente
     */
    async updateSeries(index, updatedSeries) {
        return this.request(`/series/${index}`, {
            method: 'PUT',
            body: JSON.stringify(updatedSeries)
        });
    }

    /**
     * Remove um filme
     */
    async deleteFilm(index) {
        return this.request(`/films/${index}`, { method: 'DELETE' });
    }

    /**
     * Remove uma série
     */
    async deleteSeries(index) {
        return this.request(`/series/${index}`, { method: 'DELETE' });
    }

    /**
     * Busca filmes por título
     */
    async searchFilms(query) {
        const films = await this.getFilms();
        const searchTerm = query.toLowerCase().trim();
        return films.filter(film =>
            film.title.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Busca séries por título
     */
    async searchSeries(query) {
        const allSeries = await this.getSeries();
        const searchTerm = query.toLowerCase().trim();
        return allSeries.filter(series =>
            (series.title && series.title.toLowerCase().includes(searchTerm)) ||
            (series.name && series.name.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Reseta os dados para os valores originais
     */
    async resetToDefaults() {
        return { success: false, message: 'Reset não disponível via API.' };
    }

    /**
     * GERENCIAMENTO DE CATEGORIAS
     */

    /**
     * Obtém todas as categorias
     */
    async getCategories() {
        try {
            const data = await this.request('/categories');
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('[AdminManager] Erro ao ler categorias:', error);
            return [];
        }
    }

    /**
     * Adiciona nova categoria
     */
    async addCategory(category) {
        console.log('[AdminManager] addCategory chamada com:', category);
        const categories = await this.getCategories();
        console.log('[AdminManager] Categorias atuais antes de adicionar:', categories);
        
        if (!category.name) {
            const msg = 'Nome da categoria é obrigatório!';
            console.error('[AdminManager] Validação falhou:', msg);
            return { success: false, message: msg };
        }

        // Verifica duplicatas
        const exists = categories.some(c => c.name.toLowerCase() === category.name.toLowerCase());
        if (exists) {
            const msg = 'Já existe uma categoria com este nome!';
            console.error('[AdminManager] Duplicata detectada:', msg);
            return { success: false, message: msg };
        }

        // Gera ID único
        const id = category.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const storageKey = `streamflix_${id}`;
        console.log('[AdminManager] Novo ID:', id, 'Storage Key:', storageKey);

        const newCategory = {
            id: id,
            name: category.name.trim(),
            icon: category.icon ? category.icon.trim() : '',
            storageKey: storageKey,
            createdAt: new Date().toISOString(),
            items: []
        };

        categories.push(newCategory);
        console.log('[AdminManager] Categoria criada:', newCategory);
        console.log('[AdminManager] Array completo antes de salvar:', JSON.stringify(categories));

        return this.request('/categories', {
            method: 'POST',
            body: JSON.stringify({ name: category.name, icon: category.icon || '' })
        });
    }

    /**
     * Remove uma categoria
     */
    async deleteCategory(categoryId) {
        const categories = await this.getCategories();
        
        // Impede exclusão de categorias padrão
        if (categoryId === 'films' || categoryId === 'series') {
            return { success: false, message: 'Não é possível excluir categorias padrão!' };
        }

        const categoryIndex = categories.findIndex(c => c.id === categoryId);
        if (categoryIndex === -1) {
            return { success: false, message: 'Categoria não encontrada!' };
        }

        return this.request(`/categories/${categoryId}`, { method: 'DELETE' });
    }

    /**
     * Obtém itens de uma categoria específica
     */
    async getCategoryItems(categoryId) {
        const items = await this.request(`/categories/${categoryId}/items`);
        return Array.isArray(items) ? items : [];
    }

    /**
     * Adiciona item a uma categoria
     */
    async addItemToCategory(categoryId, item) {
        console.log('[AdminManager] addItemToCategory - categoryId:', categoryId, 'item:', item);
        const response = await this.request(`/categories/${categoryId}/items`, {
            method: 'POST',
            body: JSON.stringify(item)
        });
        console.log('[AdminManager] Resposta do backend:', response);
        return response;
    }

    /**
     * Atualiza item de uma categoria
     */
    async updateCategoryItem(categoryId, index, updatedItem) {
        return this.request(`/categories/${categoryId}/items/${index}`, {
            method: 'PUT',
            body: JSON.stringify(updatedItem)
        });
    }

    /**
     * Remove item de uma categoria
     */
    async deleteCategoryItem(categoryId, index) {
        return this.request(`/categories/${categoryId}/items/${index}`, { method: 'DELETE' });
    }
}

// Instância global
window.adminDataManager = new AdminDataManager();
