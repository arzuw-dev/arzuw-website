// backendless.js - улучшенная версия
(function(global) {
    'use strict';
    
    const REAL_BACKENDLESS_URL = 'https://api.backendless.com';
    
    var Backendless = {
        appId: null,
        jsApiKey: null,
        serverURL: null,
        initialized: false,
        
        initApp: function(config) {
            this.appId = config.APP_ID;
            this.jsApiKey = config.JS_API_KEY;
            this.serverURL = config.API_URL || REAL_BACKENDLESS_URL;
            this.initialized = true;
            
            console.log("✅ Backendless инициализирован");
            console.log("App ID:", this.appId);
            console.log("Server URL:", this.serverURL);
            
            // Тестируем подключение
            this.testConnection();
            
            return this;
        },
        
        isInitialized: function() {
            return this.initialized;
        },
        
        // Тест подключения к реальному Backendless
        testConnection: function() {
            fetch(`${this.serverURL}/${this.appId}/${this.jsApiKey}/data/downloads_stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log("🔗 Connection test:", response.status);
                if (response.ok) {
                    console.log("✅ Подключение к Backendless успешно!");
                } else {
                    console.log("⚠️ Backendless доступен, но с ошибкой:", response.status);
                }
            })
            .catch(error => {
                console.log("❌ Ошибка подключения к Backendless:", error.message);
            });
        },
        
        Data: {
            of: function(tableName) {
                return {
                    // РЕАЛЬНОЕ сохранение в Backendless
                    save: function(data) {
                        return new Promise((resolve, reject) => {
                            if (!Backendless.initialized) {
                                reject(new Error("Backendless не инициализирован"));
                                return;
                            }

                            const url = `${Backendless.serverURL}/${Backendless.appId}/${Backendless.jsApiKey}/data/${tableName}`;
                            
                            console.log("💾 Сохраняем в Backendless:", url);
                            console.log("Данные:", data);

                            fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(data)
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(result => {
                                console.log("✅ УСПЕХ: Данные сохранены в Backendless!", result);
                                
                                // Дублируем в localStorage для надежности
                                const localKey = 'backendless_' + tableName;
                                const existingData = JSON.parse(localStorage.getItem(localKey) || '[]');
                                existingData.push({...data, objectId: result.objectId, created: new Date()});
                                localStorage.setItem(localKey, JSON.stringify(existingData));
                                
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("❌ Ошибка сохранения в Backendless:", error);
                                
                                // Локальное сохранение как fallback
                                const localKey = 'backendless_' + tableName;
                                const existingData = JSON.parse(localStorage.getItem(localKey) || '[]');
                                const localItem = {
                                    ...data,
                                    objectId: 'local_' + Date.now(),
                                    created: new Date(),
                                    ___class: tableName,
                                    error: error.message
                                };
                                existingData.push(localItem);
                                localStorage.setItem(localKey, JSON.stringify(existingData));
                                
                                console.log("💾 Данные сохранены локально из-за ошибки");
                                resolve(localItem);
                            });
                        });
                    },
                    
                    // РЕАЛЬНЫЙ запрос количества
                    getObjectCount: function(queryBuilder) {
                        return new Promise((resolve, reject) => {
                            if (!Backendless.initialized) {
                                // Локальный fallback
                                const localKey = 'backendless_' + tableName;
                                const existingData = JSON.parse(localStorage.getItem(localKey) || '[]');
                                resolve(existingData.length);
                                return;
                            }

                            const url = `${Backendless.serverURL}/${Backendless.appId}/${Backendless.jsApiKey}/data/${tableName}/count`;
                            
                            fetch(url)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(result => {
                                console.log(`📊 Backendless: ${tableName} count =`, result);
                                resolve(result);
                            })
                            .catch(error => {
                                console.error("❌ Ошибка получения количества:", error);
                                // Локальный fallback
                                const localKey = 'backendless_' + tableName;
                                const existingData = JSON.parse(localStorage.getItem(localKey) || '[]');
                                resolve(existingData.length);
                            });
                        });
                    },
                    
                    find: function(queryBuilder) {
                        return new Promise((resolve, reject) => {
                            const localKey = 'backendless_' + tableName;
                            const existingData = JSON.parse(localStorage.getItem(localKey) || '[]');
                            resolve(existingData);
                        });
                    }
                };
            }
        },
        
        Logging: {
            debug: function(message) { console.debug("🔍 Backendless:", message); },
            info: function(message) { console.info("ℹ️ Backendless:", message); },
            warn: function(message) { console.warn("⚠️ Backendless:", message); },
            error: function(message) { console.error("❌ Backendless:", message); }
        }
    };

    // Экспортируем
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Backendless;
    } else {
        global.Backendless = Backendless;
    }
})(typeof window !== 'undefined' ? window : global);
