/**
 * MediaCatalogManager - Sistema modular de paginação e filtragem para catálogos de mídia
 * 
 * Uso:
 *   const manager = new MediaCatalogManager({
 *       items: [{ title: 'Filme 1', ... }, ...],
 *       itemsPerPage: 50,
 *       containerSelector: '.content-grid',
 *       renderItem: (item) => HTML string
 *   });
 *   manager.initialize();
 */

window.MediaCatalogManager = class MediaCatalogManager {
    constructor(config) {
        this.allItems = config.items || [];
        this.itemsPerPage = config.itemsPerPage || 50;
        this.containerSelector = config.containerSelector || '.content-grid';
        this.renderItem = config.renderItem || this.defaultRender;
        
        this.filteredItems = [...this.allItems];
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.allItems.length / this.itemsPerPage);
        
        this.container = null;
        this.searchInput = null;
        this.paginationContainer = null;
    }

    /**
     * Inicializa o gerenciador - cria elementos e configura eventos
     */
    initialize() {
        this.container = document.querySelector(this.containerSelector);
        if (!this.container) {
            console.error(`Container "${this.containerSelector}" não encontrado`);
            return;
        }

        // Insere a search-bar antes do container
        this.createSearchBar();
        
        // Renderiza primeira página
        this.render();

        // Cria controles de paginação depois do container
        this.createPaginationControls();
    }

    /**
     * Cria a barra de busca
     */
    createSearchBar() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        
        searchContainer.innerHTML = `
            <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input 
                    type="text" 
                    id="search-input" 
                    class="search-input"
                    placeholder="Pesquisar por título..."
                >
                <button class="clear-search" aria-label="Limpar busca">✕</button>
            </div>
        `;

        this.container.parentElement.insertBefore(searchContainer, this.container);
        
        this.searchInput = document.getElementById('search-input');
        const clearBtn = searchContainer.querySelector('.clear-search');

        // Event listeners
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        clearBtn.addEventListener('click', () => this.clearSearch());
    }

    /**
     * Manipula a busca de itens
     */
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            this.filteredItems = [...this.allItems];
        } else {
            this.filteredItems = this.allItems.filter(item =>
                (item.title && item.title.toLowerCase().includes(searchTerm)) ||
                (item.name && item.name.toLowerCase().includes(searchTerm))
            );
        }

        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
        this.render();
        this.updatePaginationControls();
    }

    /**
     * Limpa a busca
     */
    clearSearch() {
        this.searchInput.value = '';
        this.filteredItems = [...this.allItems];
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.allItems.length / this.itemsPerPage);
        this.render();
        this.updatePaginationControls();
        this.searchInput.focus();
    }

    /**
     * Renderiza os itens da página atual
     */
    render() {
        // Calcula índices
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageItems = this.filteredItems.slice(startIndex, endIndex);

        console.log(`[MediaCatalogManager] Renderizando container: ${this.containerSelector}`);
        console.log(`[MediaCatalogManager] Itens totais: ${this.allItems.length}, Filtrados: ${this.filteredItems.length}, Na página: ${pageItems.length}`);

        // Limpa container
        this.container.innerHTML = '';

        if (pageItems.length === 0) {
            console.warn(`[MediaCatalogManager] Nenhum item para renderizar em ${this.containerSelector}`);
            this.container.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1;">
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Tente ajustar sua busca</p>
                </div>
            `;
            return;
        }

        // Renderiza cada item
        let html = '';
        pageItems.forEach(item => {
            html += this.renderItem(item);
        });
        this.container.innerHTML = html;
        console.log(`[MediaCatalogManager] Renderização concluída para ${this.containerSelector}`);
    }

    /**
     * Cria os controles de paginação
     */
    createPaginationControls() {
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        paginationContainer.id = 'pagination-controls';

        this.container.parentElement.insertBefore(
            paginationContainer,
            this.container.nextSibling
        );

        this.paginationContainer = paginationContainer;
        this.updatePaginationControls();
    }

    /**
     * Atualiza os controles de paginação
     */
    updatePaginationControls() {
        if (!this.paginationContainer) return;

        this.paginationContainer.innerHTML = '';

        // Botão Anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn nav-btn';
        prevBtn.textContent = '← Anterior';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => this.goToPage(this.currentPage - 1);
        this.paginationContainer.appendChild(prevBtn);

        // Números de página
        this.createPageNumbers();

        // Botão Próximo
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn nav-btn';
        nextBtn.textContent = 'Próximo →';
        nextBtn.disabled = this.currentPage === this.totalPages;
        nextBtn.onclick = () => this.goToPage(this.currentPage + 1);
        this.paginationContainer.appendChild(nextBtn);

        // Informação de página
        const info = document.createElement('div');
        info.className = 'pagination-info';
        info.textContent = `Página ${this.currentPage} de ${this.totalPages} (${this.filteredItems.length} itens)`;
        this.paginationContainer.appendChild(info);
    }

    /**
     * Cria os botões de números de página (com paginação inteligente)
     */
    createPageNumbers() {
        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(this.totalPages, startPage + maxButtons - 1);

        // Ajusta se estamos perto do fim
        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // Botão para primeira página (se não está visível)
        if (startPage > 1) {
            const firstBtn = document.createElement('button');
            firstBtn.className = 'pagination-btn';
            firstBtn.textContent = '1';
            firstBtn.onclick = () => this.goToPage(1);
            this.paginationContainer.appendChild(firstBtn);

            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.color = 'rgba(255, 255, 255, 0.5)';
                dots.style.padding = '0 5px';
                this.paginationContainer.appendChild(dots);
            }
        }

        // Números de página visíveis
        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.className = 'pagination-btn' + (i === this.currentPage ? ' active' : '');
            btn.textContent = i;
            btn.onclick = () => this.goToPage(i);
            this.paginationContainer.appendChild(btn);
        }

        // Botão para última página (se não está visível)
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.color = 'rgba(255, 255, 255, 0.5)';
                dots.style.padding = '0 5px';
                this.paginationContainer.appendChild(dots);
            }

            const lastBtn = document.createElement('button');
            lastBtn.className = 'pagination-btn';
            lastBtn.textContent = this.totalPages;
            lastBtn.onclick = () => this.goToPage(this.totalPages);
            this.paginationContainer.appendChild(lastBtn);
        }
    }

    /**
     * Vai para uma página específica
     */
    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages) return;
        
        this.currentPage = pageNumber;
        this.render();
        this.updatePaginationControls();

        // Scroll até o topo da seção
        this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Renderizador padrão de item
     */
    defaultRender(item) {
        return `
            <div class="item-card" onclick="abrirPlayer('${item.title}', '${item.url}')">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-overlay"><span>${item.title}</span></div>
            </div>
        `;
    }

    /**
     * Atualiza os dados (útil se os dados forem carregados dinamicamente)
     */
    updateItems(newItems) {
        this.allItems = newItems;
        this.filteredItems = [...this.allItems];
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.allItems.length / this.itemsPerPage);
        this.render();
        this.updatePaginationControls();
    }
}
