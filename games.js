import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getGenreClass, getPlatformClass, formatDate, formatDateTime } from './utils.js';

const PAGE_SIZE = 9;

let games = [];
let displayedGames = 0;
let selectedGameGenres = ['all'];
let selectedGameRating = 'all';
let selectedGameGenresForm = [];
let currentGameRating = 0;

// ==================== LOAD & RENDER ====================

export async function loadGames() {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = '<div class="col-span-full flex justify-center py-20"><div class="loader"></div></div>';

    try {
        const q = query(collection(db, "games"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        games = [];
        snapshot.forEach(doc => games.push({ id: doc.id, ...doc.data() }));
        updateGameStats();
        displayedGames = 0;
        renderGames();
    } catch (error) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-400">
            <div class="text-6xl mb-4">⚠️</div>
            <p class="font-bold mb-2">Ошибка загрузки</p>
            <p class="text-sm">${error.message}</p>
        </div>`;
        throw error;
    }
}

function updateGameStats() {
    document.getElementById('totalGames').textContent = games.length;
    document.getElementById('lastGame').textContent = games.length > 0 ? games[0].title : '-';
}

function getFilteredGames() {
    let result = games;
    if (!selectedGameGenres.includes('all')) {
        result = result.filter(g => {
            const gg = g.genres || [];
            return selectedGameGenres.some(genre => gg.includes(genre));
        });
    }
    if (selectedGameRating !== 'all') {
        const targetRating = parseInt(selectedGameRating);
        result = result.filter(g => (g.rating || 0) === targetRating);
    }
    return result;
}

function buildGameCard(game) {
    const genreTags = (game.genres || []).map(g =>
        `<span class="genre-tag ${getGenreClass(g)}">${g}</span>`
    ).join('');
    const platformTags = (game.platforms || []).map(p =>
        `<span class="platform-tag ${getPlatformClass(p)}">${p}</span>`
    ).join('');
    const fallback = 'https://placehold.co/400x300/2d3748/718096?text=Нет+постера';

    return `
    <div class="game-card bg-gray-800 rounded-2xl overflow-hidden border border-gray-700"
         onclick="window.openViewGameModal('${game.id}')">
        <div class="relative">
            <img src="${game.posterUrl || fallback}" class="poster-img"
                 onerror="this.src='${fallback}'">
            <div class="absolute top-3 left-3 flex flex-wrap gap-1">${platformTags}</div>
            <div class="absolute top-3 right-3 rating-display">${game.rating ?? 0}/10</div>
            <div class="absolute bottom-3 left-3 flex flex-wrap gap-1">${genreTags}</div>
        </div>
        <div class="p-5">
            <h3 class="text-lg font-bold mb-2 line-clamp-1">${game.title}</h3>
            <p class="text-gray-400 text-sm line-clamp-3 mb-3">${game.review}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <span>👤 ${game.player || 'Аноним'}</span>
                <span>${formatDate(game.date)}</span>
            </div>
        </div>
    </div>`;
}

export function renderGames() {
    const grid = document.getElementById('gamesGrid');
    const filtered = getFilteredGames();

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-20">
            <span class="text-6xl">🎮</span>
            <p class="text-gray-400 mt-4">Нет игр с такими фильтрами</p>
        </div>`;
        document.getElementById('loadMoreGamesBtn').classList.add('hidden');
        return;
    }

    const toShow = filtered.slice(0, displayedGames + PAGE_SIZE);
    grid.innerHTML = toShow.map(buildGameCard).join('');
    displayedGames = toShow.length;
    document.getElementById('loadMoreGamesBtn').classList.toggle('hidden', filtered.length <= toShow.length);
}

export function loadMoreGames() {
    renderGames();
}

// ==================== FILTERS ====================

export function toggleGenreGame(genre, btn) {
    if (genre === 'all') {
        selectedGameGenres = ['all'];
        document.querySelectorAll('#genreFiltersGames .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    } else {
        if (selectedGameGenres.includes('all')) {
            selectedGameGenres = [];
            document.querySelectorAll('#genreFiltersGames .filter-btn').forEach(b => b.classList.remove('active'));
        }
        if (selectedGameGenres.includes(genre)) {
            selectedGameGenres = selectedGameGenres.filter(g => g !== genre);
            btn.classList.remove('active');
        } else {
            selectedGameGenres.push(genre);
            btn.classList.add('active');
        }
        if (selectedGameGenres.length === 0) {
            selectedGameGenres = ['all'];
            document.querySelector('#genreFiltersGames .filter-btn:first-child').classList.add('active');
        }
    }
    displayedGames = 0;
    renderGames();
}

export function toggleRatingGame(rating, btn) {
    selectedGameRating = rating;
    document.querySelectorAll('#ratingFiltersGames .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    displayedGames = 0;
    renderGames();
}

// ==================== ADD MODAL ====================

export function openAddGameModal() {
    document.getElementById('addGameModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeAddGameModal() {
    document.getElementById('addGameModal').classList.remove('active');
    document.body.style.overflow = '';
}

export function setRatingGame(rating) {
    currentGameRating = rating;
    document.getElementById('gameRating').value = rating;
    document.getElementById('gameRatingDisplay').textContent = rating + ' / 10';
    document.querySelectorAll('#starInputGame .star-btn').forEach((btn, i) => {
        btn.classList.toggle('text-yellow-400', i <= rating);
        btn.classList.toggle('text-gray-600', i > rating);
    });
}

export function toggleGenreGameDropdown() {
    document.getElementById('genreGameDropdown').classList.toggle('active');
}

export function toggleGenreGameOption(genre) {
    const cb = document.getElementById('gamegenre-' + genre);
    cb.checked = !cb.checked;
    if (cb.checked) {
        if (!selectedGameGenresForm.includes(genre)) selectedGameGenresForm.push(genre);
    } else {
        selectedGameGenresForm = selectedGameGenresForm.filter(g => g !== genre);
    }
    document.getElementById('genreGameSelectedText').textContent =
        selectedGameGenresForm.length ? selectedGameGenresForm.join(', ') : 'Выберите жанры...';
    document.getElementById('gameGenres').value = selectedGameGenresForm.join(',');
}

export async function submitGameForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const text = document.getElementById('submitGameText');
    const loader = document.getElementById('submitGameLoader');
    btn.disabled = true;
    text.textContent = 'Сохраняем...';
    loader.classList.remove('hidden');

    const platforms = Array.from(
        document.querySelectorAll('input[name="gamePlatform"]:checked')
    ).map(cb => cb.value);

    try {
        await addDoc(collection(db, "games"), {
            title: document.getElementById('gameTitle').value.trim(),
            platforms,
            genres: selectedGameGenresForm,
            rating: parseInt(document.getElementById('gameRating').value) || 0,
            review: document.getElementById('gameReview').value.trim(),
            player: document.getElementById('gamePlayer').value.trim() || 'Аноним',
            posterUrl: document.getElementById('gamePosterUrl').value.trim() || '',
            date: new Date().toISOString()
        });
        e.target.reset();
        setRatingGame(0);
        selectedGameGenresForm = [];
        document.querySelectorAll('#genreGameDropdown input').forEach(cb => cb.checked = false);
        document.getElementById('genreGameSelectedText').textContent = 'Выберите жанры...';
        closeAddGameModal();
        await loadGames();
    } catch (err) {
        alert('Ошибка: ' + err.message);
    } finally {
        btn.disabled = false;
        text.textContent = 'Добавить рецензию';
        loader.classList.add('hidden');
    }
}

// ==================== VIEW MODAL ====================

export function openViewGameModal(id) {
    const game = games.find(g => g.id === id);
    if (!game) return;

    const genreTags = (game.genres || []).map(g =>
        `<span class="genre-tag ${getGenreClass(g)}">${g}</span>`
    ).join('');
    const platformTags = (game.platforms || []).map(p =>
        `<span class="platform-tag ${getPlatformClass(p)}">${p}</span>`
    ).join('');
    const fallback = 'https://placehold.co/800x400/2d3748/718096?text=Нет+постера';

    document.getElementById('viewGamePoster').src = game.posterUrl || fallback;
    document.getElementById('viewGamePoster').onerror = function () { this.src = fallback; };
    document.getElementById('viewGamePlatforms').innerHTML = platformTags;
    document.getElementById('viewGameTitle').textContent = game.title;
    document.getElementById('viewGameGenres').innerHTML = genreTags;
    document.getElementById('viewGamePlayer').textContent = game.player || 'Аноним';
    document.getElementById('viewGameRating').textContent = (game.rating ?? 0) + '/10';
    document.getElementById('viewGameReview').textContent = game.review;
    document.getElementById('viewGameDate').textContent = formatDateTime(game.date);

    document.getElementById('viewGameModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeViewGameModal() {
    document.getElementById('viewGameModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== DRAFT ====================

export function saveGameDraft() {
    if (!document.getElementById('addGameModal').classList.contains('active')) return;
    const platforms = Array.from(
        document.querySelectorAll('input[name="gamePlatform"]:checked')
    ).map(cb => cb.value);
    const draft = {
        type: 'game',
        title: document.getElementById('gameTitle').value,
        platforms,
        genres: selectedGameGenresForm,
        rating: currentGameRating,
        review: document.getElementById('gameReview').value,
        posterUrl: document.getElementById('gamePosterUrl').value,
        player: document.getElementById('gamePlayer').value
    };
    localStorage.setItem('reviewDraft', JSON.stringify(draft));
    document.getElementById('draftBubble').classList.add('active');
}

export function checkAndRestoreGameDraft() {
    const saved = localStorage.getItem('reviewDraft');
    if (!saved) return;
    const draft = JSON.parse(saved);
    if (draft.type !== 'game') return;
    return draft;
}

export function restoreGameDraft(draft) {
    openAddGameModal();
    document.getElementById('gameTitle').value = draft.title || '';
    if (draft.platforms && draft.platforms.length) {
        draft.platforms.forEach(p => {
            const cb = document.querySelector(`input[name="gamePlatform"][value="${p}"]`);
            if (cb) cb.checked = true;
        });
    }
    selectedGameGenresForm = [...(draft.genres || [])];
    document.querySelectorAll('#genreGameDropdown input').forEach(cb => {
        cb.checked = selectedGameGenresForm.includes(cb.id.replace('gamegenre-', ''));
    });
    document.getElementById('genreGameSelectedText').textContent =
        selectedGameGenresForm.length ? selectedGameGenresForm.join(', ') : 'Выберите жанры...';
    document.getElementById('gameGenres').value = selectedGameGenresForm.join(',');
    if (draft.rating !== undefined) setRatingGame(draft.rating);
    document.getElementById('gameReview').value = draft.review || '';
    document.getElementById('gamePosterUrl').value = draft.posterUrl || '';
    document.getElementById('gamePlayer').value = draft.player || '';
}

export function clearGameDraft() {
    localStorage.removeItem('reviewDraft');
    document.getElementById('draftBubble').classList.remove('active');
}
