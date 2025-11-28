// config.js - исправленная версия для онлайн
console.log("🎯 Инициализация Backendless...");

// Функция для проверки инициализации
function waitForBackendless() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (typeof Backendless !== 'undefined' && Backendless.initApp) {
                clearInterval(checkInterval);
                resolve(true);
            }
        }, 100);
        
        // Таймаут 5 секунд
        setTimeout(() => {
            clearInterval(checkInterval);
            resolve(false);
        }, 5000);
    });
}

// Основная инициализация
async function initializeBackendless() {
    try {
        const backendlessLoaded = await waitForBackendless();
        
        if (!backendlessLoaded) {
            console.error("❌ Backendless не загрузился");
            return false;
        }

        const config = {
            APP_ID: "70683950-CA8A-40D4-9E35-735748BE65CF",
            JS_API_KEY: "0E23A285-AA17-46C7-9F9A-59F4F9E37FF2",
            API_URL: "https://api.backendless.com"
        };

        console.log("🔧 Инициализируем с конфигом:", config);
        
        Backendless.initApp(config);
        
        if (Backendless.isInitialized()) {
            console.log("✅ Backendless инициализирован!");
            return true;
        } else {
            console.error("❌ Backendless не инициализирован");
            return false;
        }
        
    } catch (error) {
        console.error("💥 Ошибка инициализации:", error);
        return false;
    }
}

// Запускаем инициализацию
let backendlessInitialized = false;

document.addEventListener('DOMContentLoaded', async function() {
    console.log("🚀 DOM загружен, запускаем Backendless...");
    backendlessInitialized = await initializeBackendless();
});
