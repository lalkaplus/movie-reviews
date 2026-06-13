// UI utilities and shared helpers

// ===== GENRE MAPPING =====
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
        'PC': 'platform-pc', 
        'PlayStation': 'platform-ps', 
        'Xbox': 'platform-xbox', 
        'Switch': 'platform-switch', 
        'Mobile': 'platform-mobile' 
    };
    return map[p] || 'platform-pc';
}

// ===== MODAL MANAGEMENT =====
export function openAddModal(type) {
    document.getElementById('add' + (type === 'movie' ? 'Movie' : 'Game') + 'Modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeAddModal(type) {
    document.getElementById('add' + (type === 'movie' ? 'Movie' : 'Game') + 'Modal').classList.remove('active');
    document.body.style.overflow = '';
}

export function openViewModal(type, id, movies, games) {
    const item = type === 'movie' ? movies.find(m => m.id === id) : games.find(g => g.id === id);
    if (!item) return;

    if (type === 'movie') {
        const genreTags = (item.genres || []).map(g => `<span class="genre-tag ${getGenreClass(g)}">${g}</span>`).join('');
        const originClass = item.origin === 'Русский' ? 'origin-russian' : 'origin-foreign';
        document.getElementById('viewMoviePoster').src = item.posterUrl || 'https://placehold.co/800x400/2d3748/718096?text=Нет+постера';
        document.getElementById('viewMovieOrigin').className = `origin-badge ${originClass}`;
        document.getElementById('viewMovieOrigin').textContent = (item.origin === 'Русский' ? '🇷🇺 ' : '🌍 ') + (item.origin || '');
        document.getElementById('viewMovieTitle').textContent = item.title;
        document.getElementById('viewMovieGenres').innerHTML = genreTags;
        document.getElementById('viewMovieWatcher').textContent = item.watcher || 'Аноним';
        document.getElementById('viewMovieRating').textContent = (item.rating || 0) + '/10';
        document.getElementById('viewMovieReview').textContent = item.review;
        document.getElementById('viewMovieDate').textContent = item.date ? 'Добавлено: ' + new Date(item.date).toLocaleString('ru-RU') : '';
        document.getElementById('viewMovieModal').classList.add('active');
    } else {
        const genreTags = (item.genres || []).map(g => `<span class="genre-tag ${getGenreClass(g)}">${g}</span>`).join('');
        const platformTags = (item.platforms || []).map(p => `<span class="platform-tag ${getPlatformClass(p)}">${p}</span>`).join('');
        document.getElementById('viewGamePoster').src = item.posterUrl || 'https://placehold.co/800x400/2d3748/718096?text=Нет+постера';
        document.getElementById('viewGamePlatforms').innerHTML = platformTags;
        document.getElementById('viewGameTitle').textContent = item.title;
        document.getElementById('viewGameGenres').innerHTML = genreTags;
        document.getElementById('viewGamePlayer').textContent = item.player || 'Аноним';
        document.getElementById('viewGameRating').textContent = (item.rating || 0) + '/10';
        document.getElementById('viewGameReview').textContent = item.review;
        document.getElementById('viewGameDate').textContent = item.date ? 'Добавлено: ' + new Date(item.date).toLocaleString('ru-RU') : '';
        document.getElementById('viewGameModal').classList.add('active');
    }
    document.body.style.overflow = 'hidden';
}

export function closeViewModal(type) {
    document.getElementById('view' + (type === 'movie' ? 'Movie' : 'Game') + 'Modal').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== TAB SWITCHING =====
export function switchTab(tab) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tab + 'Section').classList.add('active');
    event.target.classList.add('active');
}

// ===== RATING STARS =====
export function setRatingMovie(rating) {
    document.getElementById('movieRating').value = rating;
    document.getElementById('movieRatingDisplay').textContent = rating + ' / 10';
    document.querySelectorAll('#starInputMovie .star-btn').forEach((btn, i) => {
        btn.classList.toggle('text-yellow-400', i <= rating);
        btn.classList.toggle('text-gray-600', i > rating);
    });
    return rating;
}

export function setRatingGame(rating) {
    document.getElementById('gameRating').value = rating;
    document.getElementById('gameRatingDisplay').textContent = rating + ' / 10';
    document.querySelectorAll('#starInputGame .star-btn').forEach((btn, i) => {
        btn.classList.toggle('text-yellow-400', i <= rating);
        btn.classList.toggle('text-gray-600', i > rating);
    });
    return rating;
}

// ===== MULTI-SELECT DROPDOWNS =====
export function toggleGenreDropdown() {
    document.getElementById('genreDropdown').classList.toggle('active');
}

export function toggleGenreGameDropdown() {
    document.getElementById('genreGameDropdown').classList.toggle('active');
}

export function toggleGenreOption(genre, selectedGenresForm) {
    const cb = document.getElementById('genre-' + genre);
    cb.checked = !cb.checked;
    if (cb.checked) { 
        if (!selectedGenresForm.includes(genre)) selectedGenresForm.push(genre); 
    } else { 
        selectedGenresForm = selectedGenresForm.filter(g => g !== genre); 
    }
    document.getElementById('genreSelectedText').textContent = selectedGenresForm.length ? selectedGenresForm.join(', ') : 'Выберите жанры...';
    document.getElementById('movieGenres').value = selectedGenresForm.join(',');
    return selectedGenresForm;
}

export function toggleGenreGameOption(genre, selectedGameGenresForm) {
    const cb = document.getElementById('gamegenre-' + genre);
    cb.checked = !cb.checked;
    if (cb.checked) { 
        if (!selectedGameGenresForm.includes(genre)) selectedGameGenresForm.push(genre); 
    } else { 
        selectedGameGenresForm = selectedGameGenresForm.filter(g => g !== genre); 
    }
    document.getElementById('genreGameSelectedText').textContent = selectedGameGenresForm.length ? selectedGameGenresForm.join(', ') : 'Выберите жанры...';
    document.getElementById('gameGenres').value = selectedGameGenresForm.join(',');
    return selectedGameGenresForm;
}

// ===== DRAFT MANAGEMENT =====
const MOVIE_DRAFT_KEY = 'movieDraft';
const GAME_DRAFT_KEY = 'gameDraft';

export function hasMovieDraft() {
    const saved = localStorage.getItem(MOVIE_DRAFT_KEY);
    if (!saved) return false;
    try {
        const data = JSON.parse(saved);
        // Check if draft has actual content
        return !!(data.title || data.review || data.genres?.length > 0 || data.rating > 0);
    } catch { return false; }
}

export function hasGameDraft() {
    const saved = localStorage.getItem(GAME_DRAFT_KEY);
    if (!saved) return false;
    try {
        const data = JSON.parse(saved);
        return !!(data.title || data.review || data.genres?.length > 0 || data.rating > 0 || data.platforms?.length > 0);
    } catch { return false; }
}

export function updateDraftBubble() {
    const bubble = document.getElementById('draftBubble');
    const hasMovie = hasMovieDraft();
    const hasGame = hasGameDraft();

    if (hasMovie || hasGame) {
        bubble.classList.add('active');
        const badge = document.getElementById('draftBadge');
        if (hasMovie && hasGame) badge.textContent = '2';
        else badge.textContent = '!';
    } else {
        bubble.classList.remove('active');
    }
}

export function saveMovieDraft(data) {
    localStorage.setItem(MOVIE_DRAFT_KEY, JSON.stringify(data));
    updateDraftBubble();
}

export function saveGameDraft(data) {
    localStorage.setItem(GAME_DRAFT_KEY, JSON.stringify(data));
    updateDraftBubble();
}

export function clearMovieDraft() {
    localStorage.removeItem(MOVIE_DRAFT_KEY);
    updateDraftBubble();
}

export function clearGameDraft() {
    localStorage.removeItem(GAME_DRAFT_KEY);
    updateDraftBubble();
}

export function getMovieDraft() {
    const saved = localStorage.getItem(MOVIE_DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
}

export function getGameDraft() {
    const saved = localStorage.getItem(GAME_DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
}

export function restoreMovieDraft() {
    const draft = getMovieDraft();
    if (!draft) return [];

    openAddModal('movie');
    document.getElementById('movieTitle').value = draft.title || '';
    if (draft.origin) {
        const r = document.querySelector(`input[name="movieOrigin"][value="${draft.origin}"]`);
        if (r) r.checked = true;
    }
    if (draft.rating !== undefined) {
        setRatingMovie(draft.rating);
    }
    document.getElementById('movieReview').value = draft.review || '';
    document.getElementById('moviePosterUrl').value = draft.posterUrl || '';
    document.getElementById('movieWatcher').value = draft.watcher || '';

    return draft.genres || [];
}

export function restoreGameDraft() {
    const draft = getGameDraft();
    if (!draft) return [];

    openAddModal('game');
    document.getElementById('gameTitle').value = draft.title || '';

    // Restore platforms
    if (draft.platforms) {
        document.querySelectorAll('input[name="gamePlatform"]').forEach(cb => {
            cb.checked = draft.platforms.includes(cb.value);
        });
    }

    if (draft.rating !== undefined) {
        setRatingGame(draft.rating);
    }
    document.getElementById('gameReview').value = draft.review || '';
    document.getElementById('gamePosterUrl').value = draft.posterUrl || '';
    document.getElementById('gamePlayer').value = draft.player || '';

    return draft.genres || [];
}
