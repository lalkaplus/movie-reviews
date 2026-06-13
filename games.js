// Games module - handles all game-related functionality
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getGenreClass, getPlatformClass } from './ui.js';

let games = [];
let displayedGames = 0;
const PAGE_SIZE = 9;
let selectedGameGenres = ['all'];
let selectedGameRating = 'all';

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
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-400">Ошибка: ${error.message}</div>`;
    }
}

function updateGameStats() {
    document.getElementById('totalGames').textContent = games.length;
    if (games.length > 0) document.getElementById('lastGame').textContent = games[0].title;
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

export function renderGames() {
    const grid = document.getElementById('gamesGrid');
    const filtered = getFilteredGames();
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-20"><span class="text-6xl">🎮</span><p class="text-gray-400 mt-4">Нет игр</p></div>`;
        document.getElementById('loadMoreGamesBtn').classList.add('hidden');
        return;
    }
    const toShow = filtered.slice(0, displayedGames + PAGE_SIZE);
    const hasMore = filtered.length > toShow.length;
    grid.innerHTML = toShow.map(game => {
        const genreTags = (game.genres || []).map(g => `<span class="genre-tag ${getGenreClass(g)}">${g}</span>`).join('');
        const platformTags = (game.platforms || []).map(p => `<span class="platform-tag ${getPlatformClass(p)}">${p}</span>`).join('');
        return `<div class="game-card bg-gray-800 rounded-2xl overflow-hidden border border-gray-700" onclick='window.openViewModal("game", "${game.id}")'>
            <div class="relative">
                <img src="${game.posterUrl || 'https://placehold.co/400x300/2d3748/718096?text=Нет+постера'}" class="poster-img" onerror="this.src='https://placehold.co/400x300/2d3748/718096?text=Нет+постера'">
                <div class="absolute top-3 left-3 flex flex-wrap gap-1">${platformTags}</div>
                <div class="absolute top-3 right-3 rating-display">${game.rating || 0}/10</div>
                <div class="absolute bottom-3 left-3 flex flex-wrap gap-1">${genreTags}</div>
            </div>
            <div class="p-5">
                <h3 class="text-lg font-bold mb-2 line-clamp-1">${game.title}</h3>
                <p class="text-gray-400 text-sm line-clamp-3 mb-3">${game.review}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>👤 ${game.player || 'Аноним'}</span>
                    <span>${game.date ? new Date(game.date).toLocaleDateString('ru-RU') : ''}</span>
                </div>
            </div>
        </div>`;
    }).join('');
    displayedGames = toShow.length;
    document.getElementById('loadMoreGamesBtn').classList.toggle('hidden', !hasMore);
}

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

export function loadMoreGames() {
    renderGames();
}

export function getGames() {
    return games;
}

export async function submitGame(formData, selectedGameGenresForm, currentRating) {
    await addDoc(collection(db, "games"), {
        title: formData.title,
        platforms: formData.platforms,
        genres: selectedGameGenresForm,
        rating: currentRating,
        review: formData.review,
        player: formData.player || 'Аноним',
        posterUrl: formData.posterUrl || '',
        date: new Date().toISOString()
    });
    await loadGames();
}
