/**
 * Gerenciador de Menu de Categorias Dinâmicas
 * Carrega e mantém categorias personalizadas no menu do site
 */

class CategoriesMenuManager {
    constructor() {
        this.categoriesKey = 'streamflix_categories';
        this.navContainerId = 'dynamic-categories-nav';
        this.apiBase = (typeof window !== 'undefined' && window.API_BASE) ? window.API_BASE : '/api';
    }

    /**
     * Obtém todas as categorias do localStorage
     */
    async getCategories() {
        try {
            const response = await fetch(`${this.apiBase}/categories`);
            if (!response.ok) return [];
            const categories = await response.json();
            console.log('[CategoriesMenu] Categorias carregadas:', categories);
            return Array.isArray(categories) ? categories : [];
        } catch (error) {
            console.error('[CategoriesMenu] Erro ao carregar categorias:', error);
            return [];
        }
    }

    /**
     * Valida se o container existe
     */
    validateContainer() {
        const container = document.getElementById(this.navContainerId);
        if (!container) {
            console.warn('[CategoriesMenu] Container não encontrado:', this.navContainerId);
            return false;
        }
        return container;
    }

    /**
     * Atualiza o menu com categorias dinâmicas
     */
    async updateMenu() {
        console.log('[CategoriesMenu] updateMenu() chamada');
        
        if (!this.navContainerId) return;

        const navContainer = document.getElementById(this.navContainerId);
        if (!navContainer) {
            console.warn('[CategoriesMenu] Container de navegação não encontrado:', this.navContainerId);
            return;
        }

        try {
            // Tenta obter categorias da API
            let categories = [];
            
            if (typeof adminDataManager !== 'undefined') {
                categories = await adminDataManager.getCategories();
            } else {
                const base = window.API_BASE || '/api';
                const res = await fetch(`${base}/categories`);
                if (res.ok) {
                    categories = await res.json();
                }
            }
            
            if (!Array.isArray(categories) || categories.length === 0) {
                 console.log('[CategoriesMenu] Nenhuma categoria encontrada na API.');
                 navContainer.innerHTML = '';
                 return;
            }

            // Filtra categorias padrões
            const customCategories = categories.filter(c => c.id !== 'films' && c.id !== 'series');
            
            const isComponentsPage = window.location.pathname.includes('/components/');
            const basePath = isComponentsPage ? 'categoria.html' : 'components/categoria.html';
            
            console.log('[CategoriesMenu] Renderizando', customCategories.length, 'categorias. BasePath:', basePath);
            const html = customCategories.map(category => {
                const link = `${basePath}?id=${category.id}`;
                console.log('[CategoriesMenu] Criando link:', link, 'para:', category.name, 'Icon:', category.icon);
                const iconHtml = category.icon ? `${category.icon} ` : '';
                return `
                    <li style="display: inline;">
                        <a href="${link}" title="${category.name}" style="color: inherit; text-decoration: none; transition: color 0.3s;">
                            ${iconHtml}${category.name}
                        </a>
                    </li>
                `;
            }).join('');

            navContainer.innerHTML = html;

            // Adiciona hover effect
            const links = navContainer.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('mouseenter', function() {
                    this.style.color = '#991818';
                });
                link.addEventListener('mouseleave', function() {
                    this.style.color = 'inherit';
                });
            });

        } catch (error) {
            console.error('[CategoriesMenu] Erro ao atualizar menu:', error);
            navContainer.innerHTML = '';
        }
    }

    /**
     * Espera pelo container estar disponível
     */
    waitForContainer(callback, attempts = 0, maxAttempts = 20) {
        const container = document.getElementById(this.navContainerId);
        
        if (container) {
            console.log('[CategoriesMenu] Container encontrado na tentativa', attempts);
            callback();
        } else if (attempts < maxAttempts) {
            console.log('[CategoriesMenu] Aguardando container... tentativa', attempts);
            setTimeout(() => {
                this.waitForContainer(callback, attempts + 1, maxAttempts);
            }, 100);
        } else {
            console.warn('[CategoriesMenu] Container não encontrado após', attempts, 'tentativas');
        }
    }

    /**
     * Inicializa o gerenciador
     */
    async initialize() {
        console.log('[CategoriesMenu] initialize() chamada');

        // Aguarda o container estar disponível antes de atualizar
        this.waitForContainer(async () => {
            await this.updateMenu();

            // Monitora a cada 5 segundos se há mudanças via API
            setInterval(() => {
                this.updateMenu();
            }, 5000);
        });
    }

    /**
     * Recarrega as categorias manualmente
     */
    async reload() {
        console.log('[CategoriesMenu] reload() chamada');
        await this.updateMenu();
    }
}

// Cria instância global
window.categoriesMenuManager = new CategoriesMenuManager();

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('[CategoriesMenu] DOMContentLoaded disparado');
    categoriesMenuManager.initialize();
});

// Também tenta inicializar imediatamente em caso de cache
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        categoriesMenuManager.initialize();
    });
} else {
    // DOM já carregado
    categoriesMenuManager.initialize();
}

// Listener para quando voltamos para a página
window.addEventListener('pageshow', () => {
    console.log('[CategoriesMenu] pageshow disparado, recarregando categorias');
    categoriesMenuManager.reload();
});

// Listener para visibilidade da página
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('[CategoriesMenu] Página visível novamente, recarregando categorias');
        categoriesMenuManager.reload();
    }
});

