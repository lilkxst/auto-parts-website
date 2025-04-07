document.addEventListener('DOMContentLoaded', function() {
    // Базовый URL API
    const API_URL = 'http://localhost:5000/api';
    
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    // Добавляем кнопку для явного включения демо-режима
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
        const demoModeButton = document.createElement('button');
        demoModeButton.type = 'button';
        demoModeButton.className = 'demo-mode-button';
        demoModeButton.textContent = 'Войти в демо-режим';
        demoModeButton.style.marginTop = '15px';
        demoModeButton.style.backgroundColor = '#17a2b8';
        demoModeButton.style.color = 'white';
        demoModeButton.style.border = 'none';
        demoModeButton.style.padding = '8px 15px';
        demoModeButton.style.borderRadius = '4px';
        demoModeButton.style.cursor = 'pointer';
        demoModeButton.style.width = '100%';
        
        demoModeButton.addEventListener('click', function() {
            // Устанавливаем демо-режим
            localStorage.setItem('adminToken', 'demo_token');
            localStorage.setItem('isDemoMode', 'true');
            window.location.href = 'dashboard.html';
        });
        
        // Добавляем кнопку после формы
        loginForm.after(demoModeButton);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Скрываем сообщение об ошибке
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                // Валидация
                if (!username || !password) {
                    showError('Пожалуйста, введите имя пользователя и пароль');
                    return;
                }
                
                // Отправка запроса на сервер
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    if (username === 'admin' && password === 'admin123') {
                        // Если сервер вернул ошибку, но учетные данные верны, используем демо-режим
                        localStorage.setItem('adminToken', 'demo_token');
                        localStorage.setItem('isDemoMode', 'true');
                        window.location.href = 'dashboard.html';
                        return;
                    }
                    showError(data.message || 'Ошибка авторизации');
                    return;
                }
                
                // Сохраняем токен в localStorage
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('isDemoMode', 'false');
                
                // Перенаправляем на дашборд
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Login error:', error);
                
                // Для демонстрации при отсутствии работающего бэкенда
                if (username === 'admin' && password === 'admin123') {
                    // Устанавливаем фейковый токен для демо-режима
                    localStorage.setItem('adminToken', 'demo_token');
                    localStorage.setItem('isDemoMode', 'true');
                    window.location.href = 'dashboard.html';
                } else {
                    showError('Ошибка при попытке входа. Пожалуйста, проверьте подключение к серверу.');
                }
            }
        });
    }
    
    // Функция для отображения ошибки
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
    
    // Проверяем, не авторизован ли уже пользователь
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Проверяем валидность токена
        checkToken(token);
    }
    
    // Функция проверки токена
    async function checkToken(token) {
        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                // Если токен валидный, перенаправляем на дашборд
                window.location.href = 'dashboard.html';
            } else {
                // Если токен невалидный, удаляем его
                localStorage.removeItem('adminToken');
                localStorage.removeItem('isDemoMode');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            // При ошибке проверки считаем токен невалидным
            localStorage.removeItem('adminToken');
            
            // Если это демо-токен, сохраняем его
            if (token === 'demo_token') {
                localStorage.setItem('adminToken', 'demo_token');
                localStorage.setItem('isDemoMode', 'true');
                window.location.href = 'dashboard.html';
            } else {
                localStorage.removeItem('isDemoMode');
            }
        }
    }
}); 