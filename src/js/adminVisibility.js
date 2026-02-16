/**
 * Controle de Visibilidade do Botão Admin
 * Exibe o botão apenas quando o usuário está autenticado como admin
 */

(function() {
    'use strict';
    
    /**
     * Verifica se o usuário está autenticado como admin
     */
    function checkAdminAuth() {
        // Verifica se o authManager está disponível
        if (typeof authManager === 'undefined') {
            return false;
        }
        
        // Verifica se está autenticado
        return authManager.isAuthenticated();
    }
    
    /**
     * Controla a visibilidade dos links de admin
     */
    function toggleAdminLinks() {
        const isAdmin = checkAdminAuth();
        const adminLinks = document.querySelectorAll('.admin-link, [data-admin-only="true"]');
        
        adminLinks.forEach(link => {
            if (isAdmin) {
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        });
    }
    
    /**
     * Inicializa o controle quando o DOM estiver pronto
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', toggleAdminLinks);
    } else {
        toggleAdminLinks();
    }
    
    // Expõe função global para atualizar visibilidade
    window.updateAdminVisibility = toggleAdminLinks;
})();
