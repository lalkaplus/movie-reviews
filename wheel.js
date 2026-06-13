import { getGenreClass } from './utils.js';

// Запросы идут через Cloudflare Worker — токен хранится там, CORS решён
const PROXY_URL = 'https://autumn-meadow-ed8a.alexmilushkin100.workers.dev';

let wheelGenre = 'all';
let wheelRotation = 0;
let isSpinning = false;

const WHEEL_EMOJIS = ['🎬', '🍿', '🎞️', '📽️', '🎭', '🎪', '🎨', '🎤', '🎧', '🎸', '🎹', '🎺'];
const WHEEL_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#a855f7', '#d946ef', '#f59e0b'
];

// ==================== DRAW ====================

export function drawWheel() {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 150;
    const count = WHEEL_EMOJIS.length;
    const slice = (2 * Math.PI) / count;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < count; i++) {
        const startAngle = i * slice + wheelRotation;
        const endAngle = (i + 1) * slice + wheelRotation;

        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.stroke();

        const midAngle = startAngle + slice / 2;
        const tx = cx + Math.cos(midAngle) * radius * 0.6;
        const ty = cy + Math.sin(midAngle) * radius * 0.6;

        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(midAngle + Math.PI / 2);
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(WHEEL_EMOJIS[i], 0, 0);
        ctx.restore();
    }

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, 2 * Math.PI);
    ctx.fill();
}

// ==================== OPEN / CLOSE ====================

export function openWheelModal() {
    document.getElementById('wheelModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(drawWheel);
}

export function closeWheelModal() {
    document.getElementById('wheelModal').classList.remove('active');
    document.body.style.overflow = '';
}

export function setWheelGenre(genre, btn) {
    wheelGenre = genre;
    document.querySelectorAll('#wheelGenreFilters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('wheelResult').classList.add('hidden');
    document.getElementById('wheelError').classList.add('hidden');
}

// ==================== FETCH ====================

async function fetchRandomMovie() {
    const url = new URL(PROXY_URL);
    if (wheelGenre !== 'all') url.searchParams.set('genre', wheelGenre);

    const response = await fetch(url);

    if (response.status === 401) throw new Error('Токен в воркере недействителен (401).');
    if (response.status === 403) throw new Error('Доступ запрещён (403). Проверь тариф на kinopoisk.dev.');
    if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);

    return response.json();
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ==================== SPIN ====================

export async function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;

    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    spinBtn.classList.add('spinning');
    spinBtn.textContent = '...';
    document.getElementById('wheelResult').classList.add('hidden');
    document.getElementById('wheelError').classList.add('hidden');
    document.getElementById('wheelLoading').classList.remove('hidden');

    const duration = 3000;
    const startTime = performance.now();
    const startRotation = wheelRotation;
    const totalDelta = (5 + Math.random() * 3) * 2 * Math.PI;

    const animationDone = new Promise(resolve => {
        function frame(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            wheelRotation = startRotation + totalDelta * easeOutCubic(progress);
            drawWheel();
            if (progress < 1) requestAnimationFrame(frame);
            else resolve();
        }
        requestAnimationFrame(frame);
    });

    let movieData = null;
    let fetchError = null;
    try {
        [movieData] = await Promise.all([fetchRandomMovie(), animationDone]);
    } catch (err) {
        fetchError = err;
        await animationDone;
    }

    isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.classList.remove('spinning');
    spinBtn.textContent = 'КРУТИ';
    document.getElementById('wheelLoading').classList.add('hidden');

    if (fetchError) {
        const errEl = document.getElementById('wheelError');
        errEl.textContent = '⚠️ ' + fetchError.message;
        errEl.classList.remove('hidden');
        return;
    }

    showWheelResult(movieData);
}

// ==================== SHOW RESULT ====================

function showWheelResult(movie) {
    const fallback = 'https://placehold.co/96x144/2d3748/718096?text=Нет+постера';
    const posterUrl = movie.poster?.url || movie.poster?.previewUrl || '';
    const el = id => document.getElementById(id);

    el('wheelResultPoster').src = posterUrl || fallback;
    el('wheelResultPoster').onerror = function () { this.src = fallback; };
    el('wheelResultTitle').textContent = movie.name || movie.alternativeName || 'Без названия';

    let meta = movie.year ? `${movie.year} г.` : '';
    if (movie.movieLength) meta += ` • ${movie.movieLength} мин.`;
    if (movie.countries?.length) meta += ` • ${movie.countries.map(c => c.name).join(', ')}`;
    el('wheelResultYear').textContent = meta;

    const genres = (movie.genres || []).map(g => g.name);
    el('wheelResultGenres').innerHTML = genres.map(g => {
        const cap = g.charAt(0).toUpperCase() + g.slice(1);
        return `<span class="genre-tag ${getGenreClass(cap)}">${cap}</span>`;
    }).join('');

    const kp = movie.rating?.kp || 0;
    const imdb = movie.rating?.imdb || 0;
    el('wheelResultKpRating').textContent = kp ? kp.toFixed(1) : '—';
    el('wheelResultImdbRating').textContent = imdb ? imdb.toFixed(1) : '—';
    el('wheelResultDesc').textContent = movie.description || movie.shortDescription || 'Описание отсутствует';

    const kpId = movie.id || movie.kinopoiskId;
    el('wheelKpLink').href = kpId ? `https://www.kinopoisk.ru/film/${kpId}/` : '#';

    document.getElementById('wheelResult').classList.remove('hidden');
}
