// script.js - работа с локальным Backendless
console.log("🚀 Загружен script.js");

// script.js - исправленные функции для Backendless

let localDownloadCounts = {};
let backendlessAvailable = false;

document.addEventListener('DOMContentLoaded', async function() {
    console.log("🚀 Инициализация сайта...");
    
    // Ждем инициализации Backendless
    setTimeout(async () => {
        backendlessAvailable = typeof Backendless !== 'undefined' && Backendless.isInitialized && Backendless.isInitialized();
        console.log("Backendless доступен:", backendlessAvailable);
        
        initLocalCounters();
        await showStats();
        initSubscribeForm();
    }, 1000);
});

async function showStats() {
    // Сначала загружаем из Backendless
    await updateAppCountersFromBackendless();
    
    // Затем локальные (как fallback)
    const total = Object.values(localDownloadCounts).reduce((a, b) => a + b, 0);
    updateElementText('total-downloads', `Всего скачиваний: ${total}`);
    
    // Счетчик посещений (локальный)
    let visits = parseInt(localStorage.getItem('page_visits') || 0);
    visits++;
    localStorage.setItem('page_visits', visits);
    updateElementText('visit-counter', `Посещений сайта: ${visits}`);
}

// ОСНОВНАЯ ФУНКЦИЯ СКАЧИВАНИЯ
async function trackDownload(appName, platform, fileUrl = null) {
    console.log(`📥 Скачивание: ${appName}`);
    
    // Локальный счетчик
    if (!localDownloadCounts[appName]) localDownloadCounts[appName] = 0;
    localDownloadCounts[appName]++;
    localStorage.setItem(`download_${appName}`, localDownloadCounts[appName]);
    
    // СОХРАНЕНИЕ В BACKENDLESS
    if (backendlessAvailable) {
        try {
            console.log("🔄 Сохраняем в Backendless...");
            
            const downloadData = {
                app_name: appName,
                platform: platform,
                download_date: new Date(),
                user_agent: navigator.userAgent.substring(0, 250), // Ограничение длины
                ip_address: await getIPAddress()
            };
            
            const result = await Backendless.Data.of("downloads_stats").save(downloadData);
            console.log("✅ УСПЕХ: Данные сохранены в Backendless!", result);
            
        } catch (error) {
            console.error("❌ Ошибка сохранения в Backendless:", error);
        }
    } else {
        console.log("⚠️ Backendless недоступен, сохраняем только локально");
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

// Загрузка счетчиков из Backendless
// Загрузка счетчиков из Backendless
async function updateAppCountersFromBackendless() {
    if (!backendlessAvailable) {
        updateAllAppCounters();
        return;
    }
    
    try {
        console.log("🔄 Загружаем статистику из Backendless...");
        
        // Получаем ВСЕ записи скачиваний
        const allDownloads = await Backendless.Data.of("downloads_stats").find();
        console.log("📊 Все записи из Backendless:", allDownloads);
        
        // Считаем скачивания по каждому приложению
        const backendlessCounts = {};
        allDownloads.forEach(download => {
            const appName = download.app_name;
            backendlessCounts[appName] = (backendlessCounts[appName] || 0) + 1;
        });
        
        console.log("🎯 Счетчики из Backendless:", backendlessCounts);
        
        // ОБНОВЛЯЕМ СЧЕТЧИКИ НА САЙТЕ ИЗ BACKENDLESS
        for (const [appName, count] of Object.entries(backendlessCounts)) {
            updateAppCounter(appName, count);
            // Также обновляем локально для синхронизации
            localDownloadCounts[appName] = count;
            localStorage.setItem(`download_${appName}`, count);
        }
        
        // Обновляем общий счетчик
        const totalFromBackendless = Object.values(backendlessCounts).reduce((a, b) => a + b, 0);
        updateElementText('total-downloads', `Всего скачиваний: ${totalFromBackendless}`);
        
    } catch (error) {
        console.log("⚠️ Не удалось загрузить из Backendless:", error);
        updateAllAppCounters(); // Fallback на локальные
    }
}

// Функция подписки (исправленная)
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
            console.log("🔄 Сохраняем подписчика в Backendless...");
            
            await Backendless.Data.of("subscribers").save({
                email: email,
                subscription_date: new Date(),
                is_active: true
            });
            
            showFormMessage(messageElement, 'Спасибо за подписку! Данные сохранены.', 'success');
            emailInput.value = '';
            
        } catch (error) {
            console.error("❌ Ошибка сохранения подписчика:", error);
            showFormMessage(messageElement, 'Ошибка подписки. Попробуйте позже.', 'error');
        }
    } else {
        // Локальное сохранение
        let subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        if (subscribers.includes(email)) {
            showFormMessage(messageElement, 'Email уже подписан', 'error');
        } else {
            subscribers.push(email);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
            showFormMessage(messageElement, 'Спасибо за подписку! (локально)', 'success');
            emailInput.value = '';
        }
    }
}

// Остальные функции без изменений...
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
        return 'unknown';
    }
}

function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = text;
}

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
