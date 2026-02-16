/**
 * Sistema de Autenticação
 * Gerencia login, logout, sessões e mudança de senha
 */

class AuthManager {
    constructor() {
        this.storageKey = 'streamflix_admin';
        this.sessionKey = 'streamflix_session';
        this.initializeAdmin();
    }

    /**
     * Inicializa credenciais padrão admin/admin
     */
    initializeAdmin() {
        const admin = localStorage.getItem(this.storageKey);
        if (!admin) {
            const defaultCredentials = {
                username: 'admin',
                password: this.hashPassword('admin')
            };
            localStorage.setItem(this.storageKey, JSON.stringify(defaultCredentials));
        }
    }

    /**
     * Hash simples para senha (para ambiente de desenvolvimento)
     * Em produção, usar bcrypt ou similar no backend
     */
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    /**
     * Realiza o login
     */
    login(username, password) {
        const adminData = JSON.parse(localStorage.getItem(this.storageKey));
        
        if (username === adminData.username && 
            this.hashPassword(password) === adminData.password) {
            
            const session = {
                username: username,
                loginTime: new Date().getTime(),
                token: this.generateToken()
            };
            
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            return { success: true, message: 'Login realizado com sucesso!' };
        }
        
        return { success: false, message: 'Usuário ou senha incorretos!' };
    }

    /**
     * Gera token de sessão
     */
    generateToken() {
        return Math.random().toString(36).substring(2) + 
               Date.now().toString(36);
    }

    /**
     * Verifica se o usuário está logado
     */
    isAuthenticated() {
        const session = localStorage.getItem(this.sessionKey);
        if (!session) return false;

        try {
            const sessionData = JSON.parse(session);
            // Sessão válida por 24 horas
            const sessionAge = Date.now() - sessionData.loginTime;
            const maxAge = 24 * 60 * 60 * 1000; // 24 horas
            
            if (sessionAge > maxAge) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Retorna dados da sessão
     */
    getSession() {
        const session = localStorage.getItem(this.sessionKey);
        return session ? JSON.parse(session) : null;
    }

    /**
     * Realiza o logout
     */
    logout() {
        localStorage.removeItem(this.sessionKey);
    }

    /**
     * Altera a senha do administrador
     */
    changePassword(currentPassword, newPassword) {
        const adminData = JSON.parse(localStorage.getItem(this.storageKey));
        
        if (this.hashPassword(currentPassword) !== adminData.password) {
            return { success: false, message: 'Senha atual incorreta!' };
        }

        if (newPassword.length < 4) {
            return { success: false, message: 'A nova senha deve ter pelo menos 4 caracteres!' };
        }

        adminData.password = this.hashPassword(newPassword);
        localStorage.setItem(this.storageKey, JSON.stringify(adminData));
        
        return { success: true, message: 'Senha alterada com sucesso!' };
    }

    /**
     * Protege uma página - redireciona se não estiver autenticado
     */
    requireAuth(redirectUrl = '../index.html') {
        if (!this.isAuthenticated()) {
            alert('Acesso negado! Faça login primeiro.');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}

// Instância global
window.authManager = new AuthManager();
