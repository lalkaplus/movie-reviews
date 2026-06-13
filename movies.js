// Movies module - handles all movie-related functionality
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getGenreClass } from './ui.js';

let movies = [];
let displayedMovies = 0;
const PAGE_SIZE = 9;
let selectedGenres = ['all'];
let selectedRating = 'all';

export async function loadMovies() {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '<div class="col-span-full flex justify-center py-20"><div class="loader"></div></div>';
    try {
        const q = query(collection(db, "movies"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        movies = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.genre && !data.genres) data.genres = [data.genre];
            movies.push({ id: doc.id, ...data });
        });
        updateMovieStats();
        displayedMovies = 0;
        renderMovies();
    } catch (error) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-400">Ошибка: ${error.message}</div>`;
    }
}

function updateMovieStats() {
    document.getElementById('totalMovies').textContent = movies.length;
    if (movies.length > 0) document.getElementById('lastMovie').textContent = movies[0].title;
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

export function renderMovies() {
    const grid = document.getElementById('moviesGrid');
    const filtered = getFilteredMovies();
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-20"><span class="text-6xl">🎬</span><p class="text-gray-400 mt-4">Нет фильмов</p></div>`;
        document.getElementById('loadMoreMoviesBtn').classList.add('hidden');
        return;
    }
    const toShow = filtered.slice(0, displayedMovies + PAGE_SIZE);
    const hasMore = filtered.length > toShow.length;
    grid.innerHTML = toShow.map(movie => {
        const genreTags = (movie.genres || []).map(g => `<span class="genre-tag ${getGenreClass(g)}">${g}</span>`).join('');
        const originClass = movie.origin === 'Русский' ? 'origin-russian' : 'origin-foreign';
        return `<div class="movie-card bg-gray-800 rounded-2xl overflow-hidden border border-gray-700" onclick='window.openViewModal("movie", "${movie.id}")'>
            <div class="relative">
                <img src="${movie.posterUrl || 'https://placehold.co/400x300/2d3748/718096?text=Нет+постера'}" class="poster-img" onerror="this.src='https://placehold.co/400x300/2d3748/718096?text=Нет+постера'">
                <div class="origin-badge ${originClass}">${movie.origin === 'Русский' ? '🇷🇺' : '🌍'} ${movie.origin || ''}</div>
                <div class="absolute top-3 right-3 rating-display">${movie.rating || 0}/10</div>
                <div class="absolute bottom-3 left-3 flex flex-wrap gap-1">${genreTags}</div>
            </div>
            <div class="p-5">
                <h3 class="text-lg font-bold mb-2 line-clamp-1">${movie.title}</h3>
                <p class="text-gray-400 text-sm line-clamp-3 mb-3">${movie.review}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>👤 ${movie.watcher || 'Аноним'}</span>
                    <span>${movie.date ? new Date(movie.date).toLocaleDateString('ru-RU') : ''}</span>
                </div>
            </div>
        </div>`;
    }).join('');
    displayedMovies = toShow.length;
    document.getElementById('loadMoreMoviesBtn').classList.toggle('hidden', !hasMore);
}

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

export function loadMoreMovies() {
    renderMovies();
}

export function getMovies() {
    return movies;
}

export async function submitMovie(formData, selectedGenresForm, currentRating) {
    await addDoc(collection(db, "movies"), {
        title: formData.title,
        origin: formData.origin,
        genres: selectedGenresForm,
        rating: currentRating,
        review: formData.review,
        watcher: formData.watcher || 'Аноним',
        posterUrl: formData.posterUrl || '',
        date: new Date().toISOString()
    });
    await loadMovies();
}
