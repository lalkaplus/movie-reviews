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
export function switchTab(tab, moviesSection, gamesSection) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tab + 'Section').classList.add('active');
    event.target.classList.add('active');
}

// ===== RATING STARS =====
export function setRatingMovie(rating, currentMovieRating) {
    currentMovieRating = rating;
    document.getElementById('movieRating').value = rating;
    document.getElementById('movieRatingDisplay').textContent = rating + ' / 10';
    document.querySelectorAll('#starInputMovie .star-btn').forEach((btn, i) => {
        btn.classList.toggle('text-yellow-400', i <= rating);
        btn.classList.toggle('text-gray-600', i > rating);
    });
    return currentMovieRating;
}

export function setRatingGame(rating, currentGameRating) {
    currentGameRating = rating;
    document.getElementById('gameRating').value = rating;
    document.getElementById('gameRatingDisplay').textContent = rating + ' / 10';
    document.querySelectorAll('#starInputGame .star-btn').forEach((btn, i) => {
        btn.classList.toggle('text-yellow-400', i <= rating);
        btn.classList.toggle('text-gray-600', i > rating);
    });
    return currentGameRating;
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
export function checkDraft() {
    const saved = localStorage.getItem('movieDraft');
    if (saved) {
        document.getElementById('draftBubble').classList.add('active');
        return JSON.parse(saved);
    }
    return null;
}

export function saveDraft(type, data) {
    localStorage.setItem('movieDraft', JSON.stringify({ type, ...data }));
    document.getElementById('draftBubble').classList.add('active');
}

export function clearDraft() {
    localStorage.removeItem('movieDraft');
    document.getElementById('draftBubble').classList.remove('active');
}

export function restoreDraft(draftData) {
    if (!draftData || draftData.type !== 'movie') return;
    openAddModal('movie');
    document.getElementById('movieTitle').value = draftData.title || '';
    if (draftData.origin) {
        const r = document.querySelector(`input[name="movieOrigin"][value="${draftData.origin}"]`);
        if (r) r.checked = true;
    }
    if (draftData.rating) {
        setRatingMovie(draftData.rating, 0);
    }
    document.getElementById('movieReview').value = draftData.review || '';
    document.getElementById('moviePosterUrl').value = draftData.posterUrl || '';
    document.getElementById('movieWatcher').value = draftData.watcher || '';
    return draftData.genres || [];
}
