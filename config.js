// config.js - конфигурация для локального Backendless
console.log("🎯 Загружаем конфигурацию...");

function initializeBackendless() {
    if (typeof Backendless === 'undefined') {
        console.error("❌ Backendless не загружен!");
        return false;
    }

    try {
        var config = {
            APP_ID: "70683950-CA8A-40D4-9E35-735748BE65CF",
            JS_API_KEY: "0E23A285-AA17-46C7-9F9A-59F4F9E37FF2", 
            API_URL: "https://api.backendless.com"
        };

        Backendless.initApp(config);
        
        console.log("✅ Backendless успешно инициализирован!");
        console.log("📍 Режим: Локальное хранилище");
        return true;
        
    } catch (error) {
        console.error("💥 Ошибка инициализации Backendless:", error);
        return false;
    }
}

// Автоматическая инициализация
var backendlessInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 DOM загружен, инициализируем Backendless...");
    backendlessInitialized = initializeBackendless();
    
    if (backendlessInitialized) {
        console.log("🎉 Backendless готов к работе!");
    } else {
        console.log("⚠️ Backendless не инициализирован, используем локальные счетчики");
    }
});