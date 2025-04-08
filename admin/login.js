document.addEventListener('DOMContentLoaded', function() {
    // Базовый URL API
    const API_URL = 'http://localhost:5000/api';
    
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    // Проверяем доступность сервера при загрузке
    checkServerAvailability();
    
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
            const demoToken = 'demo_token_' + Date.now();
            localStorage.setItem('adminToken', demoToken);
            localStorage.setItem('isDemoMode', 'true');
            
            // Отображаем сообщение об успешном входе
            showSuccess('Вход в демо-режим успешен, переадресация...');
            
            // Добавляем небольшую задержку для отображения сообщения
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
        
        // Добавляем кнопку после формы
        loginForm.after(demoModeButton);
        
        // Создаем элемент для сообщения об успехе
        const successMessage = document.createElement('div');
        successMessage.id = 'successMessage';
        successMessage.style.display = 'none';
        successMessage.style.marginBottom = '15px';
        successMessage.style.color = '#28a745';
        successMessage.style.textAlign = 'center';
        loginForm.before(successMessage);
    }
    
    // Заполняем форму демо-данными для удобства
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput && passwordInput) {
        usernameInput.value = 'admin';
        passwordInput.value = 'admin123';
        
        // Добавляем подсказку под формой
        const hintElement = document.createElement('div');
        hintElement.className = 'login-hint';
        hintElement.textContent = 'Демо: admin/admin123';
        hintElement.style.textAlign = 'center';
        hintElement.style.fontSize = '12px';
        hintElement.style.color = '#6c757d';
        hintElement.style.marginTop = '10px';
        loginForm.after(hintElement);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Скрываем сообщения
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
            if (document.getElementById('successMessage')) {
                document.getElementById('successMessage').style.display = 'none';
            }
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                // Валидация
                if (!username || !password) {
                    showError('Пожалуйста, введите имя пользователя и пароль');
                    return;
                }
                
                // Показываем индикатор загрузки
                showLoading(true);
                
                // Проверяем, доступен ли сервер
                const isServerAvailable = await checkServerAvailability();
                
                if (!isServerAvailable) {
                    // Если сервер недоступен, проверяем демо-данные
                    if (username === 'admin' && password === 'admin123') {
                        const demoToken = 'demo_token_' + Date.now();
                        localStorage.setItem('adminToken', demoToken);
                        localStorage.setItem('isDemoMode', 'true');
                        
                        showLoading(false);
                        showSuccess('Вход в демо-режим успешен, переадресация...');
                        
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                        return;
                    } else {
                        showLoading(false);
                        showError('Неверное имя пользователя или пароль (Демо: admin/admin123)');
                        return;
                    }
                }
                
                // Отправка запроса на сервер
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                showLoading(false);
                
                const data = await response.json();
                
                if (!response.ok) {
                    // Если сервер вернул ошибку, проверяем демо-данные
                    if (username === 'admin' && password === 'admin123') {
                        const demoToken = 'demo_token_' + Date.now();
                        localStorage.setItem('adminToken', demoToken);
                        localStorage.setItem('isDemoMode', 'true');
                        
                        showSuccess('Вход в демо-режим успешен, переадресация...');
                        
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                        return;
                    }
                    showError(data.message || 'Ошибка авторизации');
                    return;
                }
                
                // Сохраняем токен в localStorage
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('isDemoMode', 'false');
                
                showSuccess('Вход выполнен успешно, переадресация...');
                
                // Перенаправляем на дашборд
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (error) {
                console.error('Login error:', error);
                showLoading(false);
                
                // Для демонстрации при отсутствии работающего бэкенда
                if (username === 'admin' && password === 'admin123') {
                    // Устанавливаем фейковый токен для демо-режима
                    const demoToken = 'demo_token_' + Date.now();
                    localStorage.setItem('adminToken', demoToken);
                    localStorage.setItem('isDemoMode', 'true');
                    
                    showSuccess('Вход в демо-режим успешен, переадресация...');
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showError('Неверное имя пользователя или пароль (Демо: admin/admin123)');
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
    
    // Функция для отображения сообщения об успехе
    function showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
    }
    
    // Функция для отображения индикатора загрузки
    function showLoading(isLoading) {
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            if (isLoading) {
                submitButton.textContent = 'Загрузка...';
                submitButton.disabled = true;
            } else {
                submitButton.textContent = 'Войти';
                submitButton.disabled = false;
            }
        }
    }
    
    // Проверка доступности сервера
    async function checkServerAvailability() {
        try {
            const response = await fetch(`${API_URL}/health-check`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Server availability check error:', error);
            return false;
        }
    }
    
    // Проверяем, не авторизован ли уже пользователь
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Проверяем валидность токена или перенаправляем на дашборд
        if (token.startsWith('demo_token') || localStorage.getItem('isDemoMode') === 'true') {
            // Для демо-токена сразу перенаправляем
            window.location.href = 'dashboard.html';
        } else {
            // Для обычного токена проверяем валидность
            checkToken(token);
        }
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
            if (token.startsWith('demo_token')) {
                localStorage.setItem('isDemoMode', 'true');
                window.location.href = 'dashboard.html';
            } else {
                localStorage.removeItem('isDemoMode');
            }
        }
    }
}); 