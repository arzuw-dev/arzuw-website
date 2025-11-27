// backendless.js - локальная имитация Backendless
(function(global) {
    'use strict';
    
    var Backendless = {
        appId: null,
        jsApiKey: null, 
        serverURL: null,
        initialized: false,
        
        initApp: function(config) {
            this.appId = config.APP_ID;
            this.jsApiKey = config.JS_API_KEY;
            this.serverURL = config.API_URL;
            this.initialized = true;
            
            console.log("✅ Backendless инициализирован (локальная версия)");
            console.log("App ID:", this.appId);
            console.log("Server URL:", this.serverURL);
            
            return this;
        },
        
        isInitialized: function() {
            return this.initialized;
        },
        
        Data: {
            of: function(tableName) {
                return {
                    save: function(data) {
                        return new Promise((resolve) => {
                            console.log("💾 Локальное сохранение в таблицу:", tableName);
                            console.log("Данные:", data);
                            
                            // Сохраняем в localStorage для отслеживания
                            var key = 'backendless_' + tableName;
                            var existingData = JSON.parse(localStorage.getItem(key) || '[]');
                            var newItem = {
                                ...data,
                                objectId: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                                created: new Date(),
                                ___class: tableName
                            };
                            
                            existingData.push(newItem);
                            localStorage.setItem(key, JSON.stringify(existingData));
                            
                            console.log("✅ Данные сохранены локально. ObjectId:", newItem.objectId);
                            resolve(newItem);
                        });
                    },
                    
                    getObjectCount: function(queryBuilder) {
                        return new Promise((resolve) => {
                            var key = 'backendless_' + tableName;
                            var existingData = JSON.parse(localStorage.getItem(key) || '[]');
                            
                            console.log("📊 Локальный запрос количества записей в", tableName + ":", existingData.length);
                            resolve(existingData.length);
                        });
                    },
                    
                    find: function(queryBuilder) {
                        return new Promise((resolve) => {
                            var key = 'backendless_' + tableName;
                            var existingData = JSON.parse(localStorage.getItem(key) || '[]');
                            
                            console.log("🔍 Локальный поиск в", tableName + ". Найдено:", existingData.length, "записей");
                            resolve(existingData);
                        });
                    },
                    
                    remove: function(object) {
                        return new Promise((resolve) => {
                            var key = 'backendless_' + tableName;
                            var existingData = JSON.parse(localStorage.getItem(key) || '[]');
                            var newData = existingData.filter(item => item.objectId !== object.objectId);
                            
                            localStorage.setItem(key, JSON.stringify(newData));
                            console.log("🗑️ Удалена запись из", tableName);
                            resolve({});
                        });
                    }
                };
            }
        },
        
        // Простые утилиты
        Logging: {
            debug: function(message) { console.debug("🔍 Backendless Debug:", message); },
            info: function(message) { console.info("ℹ️ Backendless Info:", message); },
            warn: function(message) { console.warn("⚠️ Backendless Warn:", message); },
            error: function(message) { console.error("❌ Backendless Error:", message); }
        },
        
        // Имитация пользователей
        UserService: {
            register: function(user) {
                return new Promise((resolve) => {
                    console.log("👤 Регистрация пользователя:", user.email);
                    var users = JSON.parse(localStorage.getItem('backendless_users') || '[]');
                    var newUser = {
                        ...user,
                        objectId: 'user_' + Date.now(),
                        created: new Date()
                    };
                    users.push(newUser);
                    localStorage.setItem('backendless_users', JSON.stringify(users));
                    resolve(newUser);
                });
            },
            
            login: function(email, password) {
                return new Promise((resolve, reject) => {
                    console.log("🔐 Вход пользователя:", email);
                    var users = JSON.parse(localStorage.getItem('backendless_users') || '[]');
                    var user = users.find(u => u.email === email && u.password === password);
                    if (user) {
                        resolve(user);
                    } else {
                        reject(new Error("Неверный email или пароль"));
                    }
                });
            }
        }
    };

    // Экспортируем в глобальную область видимости
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Backendless;
    } else {
        global.Backendless = Backendless;
        
        // Автоматическая инициализация при загрузке
        if (typeof window !== 'undefined') {
            window.addEventListener('DOMContentLoaded', function() {
                console.log("🎯 Backendless готов к использованию");
            });
        }
    }
})(typeof window !== 'undefined' ? window : global);