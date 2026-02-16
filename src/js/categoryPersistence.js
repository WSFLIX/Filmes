/**
 * Gerenciador de Persistência de Categorias
 * Garante que as categorias sejam mantidas no localStorage
 */

class CategoryPersistenceManager {
    constructor() {
        this.categoriesKey = 'streamflix_categories';
        this.categoriesBackupKey = 'streamflix_categories_backup';
        this.lastCheck = 0;
        this.checkInterval = 5000; // 5 segundos
    }

    isFileMode() {
        return typeof window !== 'undefined' && (window.CATEGORIES_STORAGE_MODE === 'file' || !!window.API_BASE);
    }

    /**
     * Tenta restaurar categorias a partir do backup
     */
    restoreFromBackup() {
        try {
            const backupData = localStorage.getItem(this.categoriesBackupKey);
            if (!backupData) return null;

            const backupCategories = JSON.parse(backupData);
            if (!Array.isArray(backupCategories)) return null;

            console.log('[CategoryPersistence] Backup válido encontrado, restaurando...');
            return backupCategories;
        } catch (error) {
            console.error('[CategoryPersistence] Erro ao restaurar backup:', error);
            return null;
        }
    }

    /**
     * Garante que categorias padrão existam sem apagar as personalizadas
     */
    ensureDefaultCategories(categories) {
        const updated = Array.isArray(categories) ? [...categories] : [];

        const hasFilms = updated.some(c => c.id === 'films');
        const hasSeries = updated.some(c => c.id === 'series');

        if (!hasFilms) {
            updated.unshift({
                id: 'films',
                name: 'Filmes',
                icon: '🎬',
                storageKey: 'streamflix_films',
                createdAt: new Date().toISOString(),
                items: []
            });
        }

        if (!hasSeries) {
            updated.unshift({
                id: 'series',
                name: 'Séries',
                icon: '📺',
                storageKey: 'streamflix_series',
                createdAt: new Date().toISOString(),
                items: []
            });
        }

        return updated;
    }

    /**
     * Salva categorias e mantém backup atualizado
     */
    saveCategories(categories) {
        localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
        localStorage.setItem(this.categoriesBackupKey, JSON.stringify(categories));
    }

    /**
     * Verifica e consolida as categorias no localStorage
     */
    verifyAndFixCategories() {
        if (this.isFileMode()) {
            return;
        }
        try {
            const data = localStorage.getItem(this.categoriesKey);
            
            if (!data) {
                console.warn('[CategoryPersistence] Nenhuma categoria no localStorage, inicializando...');
                const backup = this.restoreFromBackup();
                if (backup) {
                    const merged = this.ensureDefaultCategories(backup);
                    this.saveCategories(merged);
                    return;
                }
                this.initializeDefaultCategories();
                return;
            }

            const categories = JSON.parse(data);
            
            if (!Array.isArray(categories)) {
                console.warn('[CategoryPersistence] Dados corrompidos, reinicializando...');
                const backup = this.restoreFromBackup();
                if (backup) {
                    const merged = this.ensureDefaultCategories(backup);
                    this.saveCategories(merged);
                    return;
                }
                this.initializeDefaultCategories();
                return;
            }

            // Verifica se as categorias padrão existem
            const hasFilms = categories.some(c => c.id === 'films');
            const hasSeries = categories.some(c => c.id === 'series');

            if (!hasFilms || !hasSeries) {
                console.log('[CategoryPersistence] Categorias padrão não encontradas, mesclando...');
                const merged = this.ensureDefaultCategories(categories);
                this.saveCategories(merged);
                return;
            }

            console.log('[CategoryPersistence] Categorias verificadas:', categories.length);
        } catch (error) {
            console.error('[CategoryPersistence] Erro ao verificar categorias:', error);
            const backup = this.restoreFromBackup();
            if (backup) {
                const merged = this.ensureDefaultCategories(backup);
                this.saveCategories(merged);
                return;
            }
            this.initializeDefaultCategories();
        }
    }

    /**
     * Inicializa as categorias padrão
     */
    initializeDefaultCategories() {
        const defaultCategories = [
            { 
                id: 'films', 
                name: 'Filmes', 
                icon: '🎬', 
                storageKey: 'streamflix_films',
                createdAt: new Date().toISOString(),
                items: []
            },
            { 
                id: 'series', 
                name: 'Séries', 
                icon: '📺', 
                storageKey: 'streamflix_series',
                createdAt: new Date().toISOString(),
                items: []
            }
        ];

        this.saveCategories(defaultCategories);
        console.log('[CategoryPersistence] Categorias padrão inicializadas');
    }

    /**
     * Obtém todas as categorias
     */
    getCategories() {
        try {
            const data = localStorage.getItem(this.categoriesKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[CategoryPersistence] Erro ao obter categorias:', error);
            return [];
        }
    }

    /**
     * Executa verificação periódica
     */
    startMonitoring() {
        if (this.isFileMode()) {
            console.log('[CategoryPersistence] Modo arquivo ativo, monitoramento desabilitado');
            return;
        }
        console.log('[CategoryPersistence] Iniciando monitoramento');

        // Verifica ao carregar
        this.verifyAndFixCategories();

        // Verifica periodicamente
        setInterval(() => {
            this.verifyAndFixCategories();
        }, this.checkInterval);

        // Verifica quando o usuário volta para a página
        window.addEventListener('pageshow', () => {
            console.log('[CategoryPersistence] Página ativa, verificando categorias');
            this.verifyAndFixCategories();
        });

        // Verifica quando a página fica visível
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('[CategoryPersistence] Página visível, verificando categorias');
                this.verifyAndFixCategories();
            }
        });

        // Monitora mudanças no localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === this.categoriesKey) {
                console.log('[CategoryPersistence] Categorias alteradas em outra aba');
                this.verifyAndFixCategories();
            }
        });
    }
}

// Cria instância global
window.categoryPersistenceManager = new CategoryPersistenceManager();

// Inicia monitoramento quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[CategoryPersistence] DOM carregado, iniciando monitoramento');
        categoryPersistenceManager.startMonitoring();
    });
} else {
    // DOM já carregado
    console.log('[CategoryPersistence] DOM já carregado, iniciando monitoramento');
    categoryPersistenceManager.startMonitoring();
}
