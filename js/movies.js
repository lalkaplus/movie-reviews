import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getGenreClass, formatDate, formatDateTime } from './utils.js';

const PAGE_SIZE = 9;

let movies = [];
let displayedMovies = 0;
let selectedGenres = ['all'];
let selectedRating = 'all';
let selectedGenresForm = [];
let currentMovieRating = 0;

// ==================== LOAD & RENDER ====================

export async function loadMovies() {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '<div class="col-span-full flex justify-center py-20"><div class="loader"></div></div>';

    try {
        const q = query(collection(db, "movies"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        movies = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // backward compat: single genre → array
            if (data.genre && !data.genres) data.genres = [data.genre];
            movies.push({ id: doc.id, ...data });
        });
        updateMovieStats();
        displayedMovies = 0;
        renderMovies();
    } catch (error) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-400">
            <div class="text-6xl mb-4">⚠️</div>
            <p class="font-bold mb-2">Ошибка загрузки</p>
            <p class="text-sm">${error.message}</p>
        </div>`;
        throw error;
    }
}

function updateMovieStats() {
    document.getElementById('totalMovies').textContent = movies.length;
    document.getElementById('lastMovie').textContent = movies.length > 0 ? movies[0].title : '-';
}

function getFilteredMovies() {
    let result = movies;
    if (!selectedGenres.includes('all')) {
        result = result.filter(m => {
            const mg = m.genres || (m.genre ? [m.genre] : []);
            return selectedGenres.some(g => mg.includes(g));
        });
    }
    if (selectedRating !== 'all') {
        const targetRating = parseInt(selectedRating);
        result = result.filter(m => (m.rating || 0) === targetRating);
    }
    return result;
}

function buildMovieCard(movie) {
    const genreTags = (movie.genres || []).map(g =>
        `<span class="genre-tag ${getGenreClass(g)}">${g}</span>`
    ).join('');
    const originClass = movie.origin === 'Русский' ? 'origin-russian' : 'origin-foreign';
    const originEmoji = movie.origin === 'Русский' ? '🇷🇺' : '🌍';
    const fallback = 'https://placehold.co/400x300/2d3748/718096?text=Нет+постера';

    return `
    <div class="movie-card bg-gray-800 rounded-2xl overflow-hidden border border-gray-700"
         onclick="window.openViewMovieModal('${movie.id}')">
        <div class="relative">
            <img src="${movie.posterUrl || fallback}" class="poster-img"
                 onerror="this.src='${fallback}'">
            <div class="origin-badge ${originClass}">${originEmoji} ${movie.origin || ''}</div>
            <div class="absolute top-3 right-3 rating-display">${movie.rating ?? 0}/10</div>
            <div class="absolute bottom-3 left-3 flex flex-wrap gap-1">${genreTags}</div>
        </div>
        <div class="p-5">
            <h3 class="text-lg font-bold mb-2 line-clamp-1">${movie.title}</h3>
            <p class="text-gray-400 text-sm line-clamp-3 mb-3">${movie.review}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <span>👤 ${movie.watcher || 'Аноним'}</span>
                <span>${formatDate(movie.date)}</span>
            </div>
        </div>
    </div>`;
}

export function renderMovies() {
    const grid = document.getElementById('moviesGrid');
    const filtered = getFilteredMovies();

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-20">
            <span class="text-6xl">🎬</span>
            <p class="text-gray-400 mt-4">Нет фильмов с такими фильтрами</p>
        </div>`;
        document.getElementById('loadMoreMoviesBtn').classList.add('hidden');
        return;
    }

    const toShow = filtered.slice(0, displayedMovies + PAGE_SIZE);
    grid.innerHTML = toShow.map(buildMovieCard).join('');
    displayedMovies = toShow.length;
    document.getElementById('loadMoreMoviesBtn').classList.toggle('hidden', filtered.length <= toShow.length);
}

export function loadMoreMovies() {
    renderMovies();
}

// ==================== FILTERS ====================

export function toggleGenre(genre, btn) {
    if (genre === 'all') {
        selectedGenres = ['all'];
        document.querySelectorAll('#genreFilters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    } else {
        if (selectedGenres.includes('all')) {
            selectedGenres = [];
            document.querySelectorAll('#genreFilters .filter-btn').forEach(b => b.classList.remove('active'));
        }
        if (selectedGenres.includes(genre)) {
            selectedGenres = selectedGenres.filter(g => g !== genre);
            btn.classList.remove('active');
        } else {
            selectedGenres.push(genre);
            btn.classList.add('active');
        }
        if (selectedGenres.length === 0) {
            selectedGenres = ['all'];
            document.querySelector('#genreFilters .filter-btn:first-child').classList.add('active');
        }
    }
    displayedMovies = 0;
    renderMovies();
}

export function toggleRating(rating, btn) {
    selectedRating = rating;
    document.querySelectorAll('#ratingFilters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    displayedMovies = 0;
    renderMovies();
}

// ==================== ADD MODAL ====================

export function openAddMovieModal() {
    document.getElementById('addMovieModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeAddMovieModal() {
    document.getElementById('addMovieModal').classList.remove('active');
    document.body.style.overflow = '';
}

export function setRatingMovie(rating) {
    currentMovieRating = rating;
    document.getElementById('movieRating').value = rating;
    document.getElementById('movieRatingDisplay').textContent = rating + ' / 10';
    document.querySelectorAll('#starInputMovie .star-btn').forEach((btn, i) => {
        btn.classList.toggle('text-yellow-400', i <= rating);
        btn.classList.toggle('text-gray-600', i > rating);
    });
    saveDraft();
}

export function toggleGenreDropdown() {
    document.getElementById('genreDropdown').classList.toggle('active');
}

export function toggleGenreOption(genre) {
    const cb = document.getElementById('genre-' + genre);
    cb.checked = !cb.checked;
    if (cb.checked) {
        if (!selectedGenresForm.includes(genre)) selectedGenresForm.push(genre);
    } else {
        selectedGenresForm = selectedGenresForm.filter(g => g !== genre);
    }
    document.getElementById('genreSelectedText').textContent =
        selectedGenresForm.length ? selectedGenresForm.join(', ') : 'Выберите жанры...';
    document.getElementById('movieGenres').value = selectedGenresForm.join(',');
    saveDraft();
}

export async function submitMovieForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const text = document.getElementById('submitMovieText');
    const loader = document.getElementById('submitMovieLoader');
    btn.disabled = true;
    text.textContent = 'Сохраняем...';
    loader.classList.remove('hidden');

    try {
        await addDoc(collection(db, "movies"), {
            title: document.getElementById('movieTitle').value.trim(),
            origin: document.querySelector('input[name="movieOrigin"]:checked')?.value || '',
            genres: selectedGenresForm,
            rating: parseInt(document.getElementById('movieRating').value) || 0,
            review: document.getElementById('movieReview').value.trim(),
            watcher: document.getElementById('movieWatcher').value.trim() || 'Аноним',
            posterUrl: document.getElementById('moviePosterUrl').value.trim() || '',
            date: new Date().toISOString()
        });
        clearDraft();
        e.target.reset();
        setRatingMovie(0);
        selectedGenresForm = [];
        document.querySelectorAll('#genreDropdown input').forEach(cb => cb.checked = false);
        document.getElementById('genreSelectedText').textContent = 'Выберите жанры...';
        closeAddMovieModal();
        await loadMovies();
    } catch (err) {
        alert('Ошибка: ' + err.message);
    } finally {
        btn.disabled = false;
        text.textContent = 'Добавить рецензию';
        loader.classList.add('hidden');
    }
}

// ==================== VIEW MODAL ====================

export function openViewMovieModal(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    const genreTags = (movie.genres || []).map(g =>
        `<span class="genre-tag ${getGenreClass(g)}">${g}</span>`
    ).join('');
    const originClass = movie.origin === 'Русский' ? 'origin-russian' : 'origin-foreign';
    const fallback = 'https://placehold.co/800x400/2d3748/718096?text=Нет+постера';

    document.getElementById('viewMoviePoster').src = movie.posterUrl || fallback;
    document.getElementById('viewMoviePoster').onerror = function () { this.src = fallback; };
    document.getElementById('viewMovieOrigin').className = `origin-badge ${originClass}`;
    document.getElementById('viewMovieOrigin').textContent =
        (movie.origin === 'Русский' ? '🇷🇺 ' : '🌍 ') + (movie.origin || '');
    document.getElementById('viewMovieTitle').textContent = movie.title;
    document.getElementById('viewMovieGenres').innerHTML = genreTags;
    document.getElementById('viewMovieWatcher').textContent = movie.watcher || 'Аноним';
    document.getElementById('viewMovieRating').textContent = (movie.rating ?? 0) + '/10';
    document.getElementById('viewMovieReview').textContent = movie.review;
    document.getElementById('viewMovieDate').textContent = formatDateTime(movie.date);

    document.getElementById('viewMovieModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeViewMovieModal() {
    document.getElementById('viewMovieModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== DRAFT ====================

export function saveDraft() {
    if (!document.getElementById('addMovieModal').classList.contains('active')) return;
    const origin = document.querySelector('input[name="movieOrigin"]:checked')?.value || '';
    const title = document.getElementById('movieTitle').value.trim();
    const review = document.getElementById('movieReview').value.trim();
    const hasContent = title || review || selectedGenresForm.length > 0 || currentMovieRating > 0
        || document.getElementById('moviePosterUrl').value.trim()
        || document.getElementById('movieWatcher').value.trim()
        || origin;
    if (!hasContent) {
        clearDraft();
        return;
    }
    const draft = {
        type: 'movie',
        title,
        origin,
        genres: selectedGenresForm,
        rating: currentMovieRating,
        review,
        posterUrl: document.getElementById('moviePosterUrl').value.trim(),
        watcher: document.getElementById('movieWatcher').value.trim()
    };
    localStorage.setItem('reviewDraft', JSON.stringify(draft));
    document.getElementById('draftBubble').classList.add('active');
}

export function checkAndRestoreDraft() {
    const saved = localStorage.getItem('reviewDraft');
    if (!saved) return;
    const draft = JSON.parse(saved);
    if (draft.type !== 'movie') return;
    return draft;
}

export function restoreMovieDraft(draft) {
    openAddMovieModal();
    document.getElementById('movieTitle').value = draft.title || '';
    if (draft.origin) {
        const r = document.querySelector(`input[name="movieOrigin"][value="${draft.origin}"]`);
        if (r) r.checked = true;
    }
    selectedGenresForm = [...(draft.genres || [])];
    document.querySelectorAll('#genreDropdown input').forEach(cb => {
        cb.checked = selectedGenresForm.includes(cb.id.replace('genre-', ''));
    });
    document.getElementById('genreSelectedText').textContent =
        selectedGenresForm.length ? selectedGenresForm.join(', ') : 'Выберите жанры...';
    document.getElementById('movieGenres').value = selectedGenresForm.join(',');
    if (draft.rating !== undefined) setRatingMovie(draft.rating);
    document.getElementById('movieReview').value = draft.review || '';
    document.getElementById('moviePosterUrl').value = draft.posterUrl || '';
    document.getElementById('movieWatcher').value = draft.watcher || '';
}

export function clearDraft() {
    localStorage.removeItem('reviewDraft');
    document.getElementById('draftBubble').classList.remove('active');
}
