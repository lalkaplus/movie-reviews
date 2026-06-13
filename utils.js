// ==================== SHARED UTILITIES ====================

export function getGenreClass(genre) {
    const map = {
        'Боевик': 'genre-action', 'Комедия': 'genre-comedy', 'Драма': 'genre-drama',
        'Ужасы': 'genre-horror', 'Фантастика': 'genre-scifi', 'Триллер': 'genre-thriller',
        'Мелодрама': 'genre-romance', 'Приключения': 'genre-adventure',
        'Мультфильм': 'genre-animation', 'Документальный': 'genre-documentary', 'Рофл': 'genre-rofl',
        'Экшен': 'genre-action', 'RPG': 'genre-drama', 'Стратегия': 'genre-thriller',
        'Хоррор': 'genre-horror', 'Гонки': 'genre-adventure', 'Спорт': 'genre-action',
        'Платформер': 'genre-animation', 'Головоломка': 'genre-scifi', 'Симулятор': 'genre-documentary'
    };
    return map[genre] || 'genre-documentary';
}

export function getPlatformClass(p) {
    const map = {
        'PC': 'platform-pc', 'PlayStation': 'platform-ps',
        'Xbox': 'platform-xbox', 'Switch': 'platform-switch', 'Mobile': 'platform-mobile'
    };
    return map[p] || 'platform-pc';
}

export function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('ru-RU');
}

export function formatDateTime(isoString) {
    if (!isoString) return '';
    return 'Добавлено: ' + new Date(isoString).toLocaleString('ru-RU');
}
