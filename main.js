// Main application entry point
import { db } from './firebase-config.js';
import { loadMovies, renderMovies, toggleGenre, toggleRating, loadMoreMovies, submitMovie, getMovies } from './movies.js';
import { loadGames, renderGames, toggleGenreGame, toggleRatingGame, loadMoreGames, submitGame, getGames } from './games.js';
import { 
    openAddModal, closeAddModal, openViewModal, closeViewModal, switchTab,
    setRatingMovie, setRatingGame, toggleGenreDropdown, toggleGenreGameDropdown,
    toggleGenreOption, toggleGenreGameOption,
    updateDraftBubble, saveMovieDraft, saveGameDraft, clearMovieDraft, clearGameDraft,
    getMovieDraft, getGameDraft, restoreMovieDraft, restoreGameDraft,
    hasMovieDraft, hasGameDraft
} from './ui.js';

// ===== GLOBAL STATE =====
let currentTab = 'movies';
let selectedGenresForm = [];
let selectedGameGenresForm = [];
let currentMovieRating = 0;
let currentGameRating = 0;

// ===== EXPOSE FUNCTIONS TO WINDOW (for onclick handlers) =====
window.switchTab = (tab) => {
    currentTab = tab;
    switchTab(tab);
};

window.toggleGenre = (genre, btn) => toggleGenre(genre, btn);
window.toggleRating = (rating, btn) => toggleRating(rating, btn);
window.toggleGenreGame = (genre, btn) => toggleGenreGame(genre, btn);
window.toggleRatingGame = (rating, btn) => toggleRatingGame(rating, btn);

window.loadMore = (type) => {
    if (type === 'movies') loadMoreMovies();
    else loadMoreGames();
};

window.openAddModal = (type) => {
    openAddModal(type);
    // If opening movie modal and we have a movie draft, restore it
    if (type === 'movie' && hasMovieDraft()) {
        selectedGenresForm = restoreMovieDraft();
        document.querySelectorAll('#genreDropdown input').forEach(cb => {
            cb.checked = selectedGenresForm.includes(cb.id.replace('genre-', ''));
        });
        document.getElementById('genreSelectedText').textContent = selectedGenresForm.length ? selectedGenresForm.join(', ') : 'Выберите жанры...';
    }
    // If opening game modal and we have a game draft, restore it
    if (type === 'game' && hasGameDraft()) {
        selectedGameGenresForm = restoreGameDraft();
        document.querySelectorAll('#genreGameDropdown input').forEach(cb => {
            cb.checked = selectedGameGenresForm.includes(cb.id.replace('gamegenre-', ''));
        });
        document.getElementById('genreGameSelectedText').textContent = selectedGameGenresForm.length ? selectedGameGenresForm.join(', ') : 'Выберите жанры...';
    }
};

window.closeAddModal = (type) => {
    closeAddModal(type);
    if (type === 'movie') {
        document.getElementById('addMovieForm').reset();
        currentMovieRating = setRatingMovie(0);
        selectedGenresForm = [];
        document.querySelectorAll('#genreDropdown input').forEach(cb => cb.checked = false);
        document.getElementById('genreSelectedText').textContent = 'Выберите жанры...';
    } else {
        document.getElementById('addGameForm').reset();
        currentGameRating = setRatingGame(0);
        selectedGameGenresForm = [];
        document.querySelectorAll('#genreGameDropdown input').forEach(cb => cb.checked = false);
        document.getElementById('genreGameSelectedText').textContent = 'Выберите жанры...';
    }
};

window.openViewModal = (type, id) => {
    openViewModal(type, id, getMovies(), getGames());
};

window.closeViewModal = (type) => closeViewModal(type);

window.setRatingMovie = (rating) => {
    currentMovieRating = setRatingMovie(rating);
    saveMovieDraftToStorage();
};

window.setRatingGame = (rating) => {
    currentGameRating = setRatingGame(rating);
    saveGameDraftToStorage();
};

window.toggleGenreDropdown = () => toggleGenreDropdown();
window.toggleGenreGameDropdown = () => toggleGenreGameDropdown();

window.toggleGenreOption = (genre) => {
    selectedGenresForm = toggleGenreOption(genre, selectedGenresForm);
    saveMovieDraftToStorage();
};

window.toggleGenreGameOption = (genre) => {
    selectedGameGenresForm = toggleGenreGameOption(genre, selectedGameGenresForm);
    saveGameDraftToStorage();
};

window.restoreDraft = () => {
    // Restore based on which draft exists
    if (hasMovieDraft()) {
        selectedGenresForm = restoreMovieDraft();
        document.querySelectorAll('#genreDropdown input').forEach(cb => {
            cb.checked = selectedGenresForm.includes(cb.id.replace('genre-', ''));
        });
    } else if (hasGameDraft()) {
        selectedGameGenresForm = restoreGameDraft();
        document.querySelectorAll('#genreGameDropdown input').forEach(cb => {
            cb.checked = selectedGameGenresForm.includes(cb.id.replace('gamegenre-', ''));
        });
    }
};

// ===== DRAFT HELPERS =====
function saveMovieDraftToStorage() {
    const origin = document.querySelector('input[name="movieOrigin"]:checked')?.value || '';
    const title = document.getElementById('movieTitle').value.trim();
    const review = document.getElementById('movieReview').value.trim();

    // Only save if there's actual content
    if (!title && !review && selectedGenresForm.length === 0 && currentMovieRating === 0 && !origin) {
        clearMovieDraft();
        return;
    }

    saveMovieDraft({
        title: title,
        origin: origin,
        genres: selectedGenresForm,
        rating: currentMovieRating,
        review: review,
        posterUrl: document.getElementById('moviePosterUrl').value,
        watcher: document.getElementById('movieWatcher').value
    });
}

function saveGameDraftToStorage() {
    const platforms = Array.from(document.querySelectorAll('input[name="gamePlatform"]:checked')).map(cb => cb.value);
    const title = document.getElementById('gameTitle').value.trim();
    const review = document.getElementById('gameReview').value.trim();

    // Only save if there's actual content
    if (!title && !review && selectedGameGenresForm.length === 0 && currentGameRating === 0 && platforms.length === 0) {
        clearGameDraft();
        return;
    }

    saveGameDraft({
        title: title,
        platforms: platforms,
        genres: selectedGameGenresForm,
        rating: currentGameRating,
        review: review,
        posterUrl: document.getElementById('gamePosterUrl').value,
        player: document.getElementById('gamePlayer').value
    });
}

// ===== EVENT LISTENERS =====
// Draft auto-save for movie form
['movieTitle', 'movieReview', 'moviePosterUrl', 'movieWatcher'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', saveMovieDraftToStorage);
});
document.querySelectorAll('input[name="movieOrigin"]').forEach(r => {
    r.addEventListener('change', saveMovieDraftToStorage);
});

// Draft auto-save for game form
['gameTitle', 'gameReview', 'gamePosterUrl', 'gamePlayer'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', saveGameDraftToStorage);
});
document.querySelectorAll('input[name="gamePlatform"]').forEach(r => {
    r.addEventListener('change', saveGameDraftToStorage);
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!document.getElementById('genreMultiSelect')?.contains(e.target)) {
        document.getElementById('genreDropdown')?.classList.remove('active');
    }
    if (!document.getElementById('genreGameMultiSelect')?.contains(e.target)) {
        document.getElementById('genreGameDropdown')?.classList.remove('active');
    }
});

// Modal backdrop clicks
document.getElementById('addMovieModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAddModal('movie');
});
document.getElementById('addGameModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAddModal('game');
});
document.getElementById('viewMovieModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeViewModal('movie');
});
document.getElementById('viewGameModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeViewModal('game');
});

// ===== FORM SUBMISSIONS =====
document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const text = document.getElementById('submitMovieText');
    const loader = document.getElementById('submitMovieLoader');
    btn.disabled = true;
    text.textContent = 'Сохраняем...';
    loader.classList.remove('hidden');

    try {
        await submitMovie({
            title: document.getElementById('movieTitle').value,
            origin: document.querySelector('input[name="movieOrigin"]:checked')?.value || '',
            review: document.getElementById('movieReview').value,
            watcher: document.getElementById('movieWatcher').value,
            posterUrl: document.getElementById('moviePosterUrl').value
        }, selectedGenresForm, currentMovieRating);

        clearMovieDraft();
        e.target.reset();
        currentMovieRating = setRatingMovie(0);
        selectedGenresForm = [];
        document.querySelectorAll('#genreDropdown input').forEach(cb => cb.checked = false);
        document.getElementById('genreSelectedText').textContent = 'Выберите жанры...';
        closeAddModal('movie');
    } catch (error) {
        alert('Ошибка: ' + error.message);
    } finally {
        btn.disabled = false;
        text.textContent = 'Добавить рецензию';
        loader.classList.add('hidden');
    }
});

document.getElementById('addGameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const text = document.getElementById('submitGameText');
    const loader = document.getElementById('submitGameLoader');
    btn.disabled = true;
    text.textContent = 'Сохраняем...';
    loader.classList.remove('hidden');

    const platforms = Array.from(document.querySelectorAll('input[name="gamePlatform"]:checked')).map(cb => cb.value);

    try {
        await submitGame({
            title: document.getElementById('gameTitle').value,
            platforms: platforms,
            review: document.getElementById('gameReview').value,
            player: document.getElementById('gamePlayer').value,
            posterUrl: document.getElementById('gamePosterUrl').value
        }, selectedGameGenresForm, currentGameRating);

        clearGameDraft();
        e.target.reset();
        currentGameRating = setRatingGame(0);
        selectedGameGenresForm = [];
        document.querySelectorAll('#genreGameDropdown input').forEach(cb => cb.checked = false);
        document.getElementById('genreGameSelectedText').textContent = 'Выберите жанры...';
        closeAddModal('game');
    } catch (error) {
        alert('Ошибка: ' + error.message);
    } finally {
        btn.disabled = false;
        text.textContent = 'Добавить рецензию';
        loader.classList.add('hidden');
    }
});

// ===== INIT =====
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

const loadTimeout = setTimeout(() => {
    const moviesGrid = document.getElementById('moviesGrid');
    const gamesGrid = document.getElementById('gamesGrid');
    if (moviesGrid && moviesGrid.innerHTML.includes('loader')) {
        moviesGrid.innerHTML = `<div class="col-span-full text-center py-20"><div class="text-6xl mb-4">⚠️</div><p class="text-red-400 font-bold mb-2">Не удалось загрузить данные</p><p class="text-gray-400 text-sm max-w-md mx-auto">Проверьте консоль (F12 → Console) для деталей ошибки. Возможно, проблема с Firebase или CORS.</p></div>`;
    }
    if (gamesGrid && gamesGrid.innerHTML.includes('loader')) {
        gamesGrid.innerHTML = `<div class="col-span-full text-center py-20"><div class="text-6xl mb-4">⚠️</div><p class="text-red-400 font-bold mb-2">Не удалось загрузить данные</p><p class="text-gray-400 text-sm max-w-md mx-auto">Проверьте консоль (F12 → Console) для деталей ошибки.</p></div>`;
    }
}, 10000);

// Check drafts on init
updateDraftBubble();

// Initial load
loadMovies().then(() => clearTimeout(loadTimeout)).catch(() => clearTimeout(loadTimeout));
loadGames().then(() => clearTimeout(loadTimeout)).catch(() => clearTimeout(loadTimeout));
