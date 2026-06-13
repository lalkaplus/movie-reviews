import { loadMovies, renderMovies, loadMoreMovies, toggleGenre, toggleRating,
         openAddMovieModal, closeAddMovieModal, setRatingMovie, toggleGenreDropdown,
         toggleGenreOption, submitMovieForm,
         openViewMovieModal, closeViewMovieModal,
         saveMovieDraft, hasMovieDraft, restoreMovieDraft, clearMovieDraft } from './movies.js';

import { loadGames, renderGames, loadMoreGames, toggleGenreGame, toggleRatingGame,
         openAddGameModal, closeAddGameModal, setRatingGame, toggleGenreGameDropdown,
         toggleGenreGameOption, submitGameForm,
         openViewGameModal, closeViewGameModal,
         saveGameDraft, hasGameDraft, restoreGameDraft, clearGameDraft } from './games.js';

import { openWheelModal, closeWheelModal, setWheelGenre, spinWheel } from './wheel.js';

// ==================== TAB SWITCHING ====================

function switchTab(tab) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tab + 'Section').classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(btn => {
        if (btn.dataset.tab === tab) btn.classList.add('active');
    });
}

// ==================== DRAFT BUBBLE ====================

function updateDraftBubble() {
    const bubble = document.getElementById('draftBubble');
    const label = document.getElementById('draftLabel');
    const badge = document.getElementById('draftBadge');
    const hasMovie = hasMovieDraft();
    const hasGame = hasGameDraft();

    if (hasMovie || hasGame) {
        bubble.classList.add('active');
        if (hasMovie && hasGame) {
            label.textContent = 'Черновики';
            badge.textContent = '2';
        } else if (hasMovie) {
            label.textContent = 'Фильм';
            badge.textContent = '!';
        } else {
            label.textContent = 'Игра';
            badge.textContent = '!';
        }
    } else {
        bubble.classList.remove('active');
    }
}

function handleDraftRestore() {
    const hasMovie = hasMovieDraft();
    const hasGame = hasGameDraft();
    if (!hasMovie && !hasGame) return;
    if (hasMovie) restoreMovieDraft();
    else restoreGameDraft();
}

// ==================== GLOBAL EXPORTS ====================

window.switchTab = switchTab;

// Movies
window.toggleGenre = toggleGenre;
window.toggleRating = toggleRating;
window.openAddMovieModal = () => openAddMovieModal();
window.closeAddMovieModal = () => closeAddMovieModal();
window.setRatingMovie = setRatingMovie;
window.toggleGenreDropdown = toggleGenreDropdown;
window.toggleGenreOption = toggleGenreOption;
window.openViewMovieModal = openViewMovieModal;
window.closeViewMovieModal = closeViewMovieModal;
window.loadMoreMovies = loadMoreMovies;

// Games
window.toggleGenreGame = toggleGenreGame;
window.toggleRatingGame = toggleRatingGame;
window.openAddGameModal = () => openAddGameModal();
window.closeAddGameModal = () => closeAddGameModal();
window.setRatingGame = setRatingGame;
window.toggleGenreGameDropdown = toggleGenreGameDropdown;
window.toggleGenreGameOption = toggleGenreGameOption;
window.openViewGameModal = openViewGameModal;
window.closeViewGameModal = closeViewGameModal;
window.loadMoreGames = loadMoreGames;

// Wheel
window.openWheelModal = openWheelModal;
window.closeWheelModal = closeWheelModal;
window.setWheelGenre = setWheelGenre;
window.spinWheel = spinWheel;

// ==================== BACKDROP CLOSE ====================

function backdropClose(modalId, closeFn) {
    document.getElementById(modalId)?.addEventListener('click', e => {
        if (e.target === e.currentTarget) closeFn();
    });
}

backdropClose('addMovieModal', closeAddMovieModal);
backdropClose('addGameModal', closeAddGameModal);
backdropClose('viewMovieModal', closeViewMovieModal);
backdropClose('viewGameModal', closeViewGameModal);
backdropClose('wheelModal', closeWheelModal);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeAddMovieModal(); closeAddGameModal();
        closeViewMovieModal(); closeViewGameModal();
        closeWheelModal();
    }
});

// ==================== FORM SUBMITS ====================

document.getElementById('addMovieForm').addEventListener('submit', submitMovieForm);
document.getElementById('addGameForm').addEventListener('submit', submitGameForm);

// ==================== DRAFT AUTO-SAVE ====================

// Movie form
['movieTitle', 'movieReview', 'moviePosterUrl', 'movieWatcher'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
        saveMovieDraft();
        updateDraftBubble();
    });
});
document.querySelectorAll('input[name="movieOrigin"]').forEach(r =>
    r.addEventListener('change', () => { saveMovieDraft(); updateDraftBubble(); })
);

// Game form
['gameTitle', 'gameReview', 'gamePosterUrl', 'gamePlayer'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
        saveGameDraft();
        updateDraftBubble();
    });
});
document.querySelectorAll('input[name="gamePlatform"]').forEach(r =>
    r.addEventListener('change', () => { saveGameDraft(); updateDraftBubble(); })
);

// Draft bubble click
document.getElementById('draftBubble').addEventListener('click', handleDraftRestore);

// ==================== DROPDOWN CLOSE ON OUTSIDE CLICK ====================

document.addEventListener('click', e => {
    if (!document.getElementById('genreMultiSelect')?.contains(e.target)) {
        document.getElementById('genreDropdown')?.classList.remove('active');
    }
    if (!document.getElementById('genreGameMultiSelect')?.contains(e.target)) {
        document.getElementById('genreGameDropdown')?.classList.remove('active');
    }
});

// ==================== NAV TABS ====================

document.querySelectorAll('.nav-tab[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ==================== INIT ====================

async function init() {
    // Clear old draft keys
    localStorage.removeItem('movieDraft');
    localStorage.removeItem('reviewDraft');

    updateDraftBubble();

    const TIMEOUT = 10_000;
    const timeout = id => setTimeout(() => {
        const grid = document.getElementById(id);
        if (grid?.innerHTML.includes('loader')) {
            grid.innerHTML = `<div class="col-span-full text-center py-20">
                <div class="text-6xl mb-4">⚠️</div>
                <p class="text-red-400 font-bold mb-2">Не удалось загрузить данные</p>
                <p class="text-gray-400 text-sm">Проверьте консоль (F12) для деталей ошибки.</p>
            </div>`;
        }
    }, TIMEOUT);

    const t1 = timeout('moviesGrid');
    const t2 = timeout('gamesGrid');

    await Promise.allSettled([
        loadMovies().finally(() => clearTimeout(t1)),
        loadGames().finally(() => clearTimeout(t2))
    ]);
}

init();
