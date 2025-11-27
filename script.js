// script.js - работа с локальным Backendless
console.log("🚀 Загружен script.js");

let localDownloadCounts = {};
let backendlessAvailable = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log("🎯 Инициализация сайта...");
    
    // Проверяем Backendless
    backendlessAvailable = typeof Backendless !== 'undefined' && Backendless.isInitialized && Backendless.isInitialized();
    console.log("Backendless доступен:", backendlessAvailable);
    
    initLocalCounters();
    showStats();
    initSubscribeForm();
    
    // Загружаем данные из Backendless если доступен
    if (backendlessAvailable) {
        loadFromBackendless();
    }
});

function initLocalCounters() {
    const apps = [
        'Bar-Z Android', 'Finance Tracker Android', 'Weather Pro Android',
        'File Organizer Pro', 'Image Converter', 'Password Manager',
        'Space Adventure', 'Puzzle Master', 'Racing Extreme'
    ];
    
    apps.forEach(appName => {
        const count = localStorage.getItem(`download_${appName}`) || 0;
        localDownloadCounts[appName] = parseInt(count);
    });
    console.log("📊 Локальные счетчики:", localDownloadCounts);
}

async function loadFromBackendless() {
    try {
        console.log("🔄 Загружаем данные из Backendless...");
        
        // Загружаем статистику скачиваний
        const downloadsCount = await Backendless.Data.of("downloads_stats").getObjectCount();
        console.log("📥 Записей в downloads_stats:", downloadsCount);
        
        // Можно добавить загрузку отдельных счетчиков если нужно
        
    } catch (error) {
        console.log("⚠️ Не удалось загрузить из Backendless:", error);
    }
}

function showStats() {
    const total = Object.values(localDownloadCounts).reduce((a, b) => a + b, 0);
    updateElementText('total-downloads', `Всего скачиваний: ${total}`);
    
    let visits = parseInt(localStorage.getItem('page_visits') || 0);
    visits++;
    localStorage.setItem('page_visits', visits);
    updateElementText('visit-counter', `Посещений сайта: ${visits}`);
    
    updateAllAppCounters();
}

// ГЛАВНАЯ ФУНКЦИЯ СКАЧИВАНИЯ
async function trackDownload(appName, platform, fileUrl = null) {
    console.log(`📥 Скачивание: ${appName}`);
    
    // Локальный счетчик
    if (!localDownloadCounts[appName]) localDownloadCounts[appName] = 0;
    localDownloadCounts[appName]++;
    localStorage.setItem(`download_${appName}`, localDownloadCounts[appName]);
    
    // Сохраняем в Backendless
    if (backendlessAvailable) {
        try {
            await Backendless.Data.of("downloads_stats").save({
                app_name: appName,
                platform: platform,
                download_date: new Date(),
                user_agent: navigator.userAgent,
                ip_address: await getIPAddress()
            });
            console.log("✅ Данные сохранены в Backendless");
        } catch (error) {
            console.log("⚠️ Ошибка сохранения в Backendless:", error);
        }
    }
    
    // Обновляем интерфейс
    updateAppCounter(appName, localDownloadCounts[appName]);
    updateTotalDownloads();
    showNotification(`✅ Скачано: ${appName}`, 'success');
    
    // Скачивание файла
    setTimeout(() => {
        if (fileUrl) window.open(fileUrl, '_blank');
    }, 1000);
    
    return false;
}

// Вспомогательные функции
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = text;
}

function updateAllAppCounters() {
    for (const [appName, count] of Object.entries(localDownloadCounts)) {
        updateAppCounter(appName, count);
    }
}

function updateAppCounter(appName, count) {
    const counterId = getCounterId(appName);
    updateElementText(counterId, `Скачали: ${count} раз`);
}

function updateTotalDownloads() {
    const total = Object.values(localDownloadCounts).reduce((a, b) => a + b, 0);
    updateElementText('total-downloads', `Всего скачиваний: ${total}`);
}

function getCounterId(appName) {
    const idMap = {
        'Bar-Z Android': 'counter-bar-z',
        'Finance Tracker Android': 'counter-finance',
        'Weather Pro Android': 'counter-weather',
        'File Organizer Pro': 'counter-file-organizer',
        'Image Converter': 'counter-image-converter', 
        'Password Manager': 'counter-password-manager',
        'Space Adventure': 'counter-space-adventure',
        'Puzzle Master': 'counter-puzzle-master',
        'Racing Extreme': 'counter-racing-extreme'
    };
    return idMap[appName];
}

async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'local';
    }
}

// Остальные функции без изменений
function showCategoryPage(category) {
    const pages = {
        'android-apps': 'android-apps.html',
        'windows-apps': 'windows-apps.html', 
        'windows-games': 'windows-games.html'
    };
    if (pages[category]) window.location.href = pages[category];
}

function initSubscribeForm() {
    const form = document.getElementById('subscribe-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleSubscription();
        });
    }
}

async function handleSubscription() {
    const emailInput = document.getElementById('subscribe-email');
    const messageElement = document.getElementById('subscribe-message');
    const email = emailInput.value.trim();

    if (!email) {
        showFormMessage(messageElement, 'Введите email', 'error');
        return;
    }

    if (backendlessAvailable) {
        try {
            // Сохраняем в Backendless
            await Backendless.Data.of("subscribers").save({
                email: email,
                subscription_date: new Date(),
                is_active: true
            });
            showFormMessage(messageElement, 'Спасибо за подписку!', 'success');
            emailInput.value = '';
        } catch (error) {
            console.log("Ошибка подписки:", error);
            showFormMessage(messageElement, 'Ошибка подписки', 'error');
        }
    } else {
        // Локальное сохранение
        let subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        if (subscribers.includes(email)) {
            showFormMessage(messageElement, 'Email уже подписан', 'error');
        } else {
            subscribers.push(email);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
            showFormMessage(messageElement, 'Спасибо за подписку!', 'success');
            emailInput.value = '';
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 10px; z-index: 1000;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'}; color: white;
        animation: slideInRight 0.5s ease-out; max-width: 300px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showFormMessage(element, message, type) {
    if (element) {
        element.textContent = message;
        element.className = type + '-message';
        setTimeout(() => element.textContent = '', 5000);
    }
}

// Стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);