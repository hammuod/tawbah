const readers = [  
    { name: "أحمد النفيس", baseUrl: "https://server16.mp3quran.net/nufais/Rewayat-Hafs-A-n-Assem/" },  
    { name: "أحمد خليل", baseUrl: "https://server13.mp3quran.net/khalil/Rewayat-Hafs-A-n-Assem/" },  
    { name: "ابراهيم الاخضر", baseUrl: "https://server6.mp3quran.net/akdr/" },  
    { name: "الزين محمد", baseUrl: "https://server11.mp3quran.net/alzain/" },  
    { name: "خالد الجهيم", baseUrl: "https://server13.mp3quran.net/alhaj/" },  
    { name: "خالد المهنا", baseUrl: "https://server11.mp3quran.net/almohanna/" },  
    { name: "خالد الطنيجي", baseUrl: "https://server13.mp3quran.net/altaniji/" },  
    { name: "سعد الغامدي", baseUrl: "https://server16.mp3quran.net/sag/Rewayat-Hafs-A-n-Assem/" },  
    { name: "سعود الشريم", baseUrl: "https://server11.mp3quran.net/sds/" },  
    { name: "شيخ ابو بكر الشاطري", baseUrl: "https://server16.mp3quran.net/shatri/Rewayat-Hafs-A-n-Assem/" },  
    { name: "صابر عبد الحكيم", baseUrl: "https://server11.mp3quran.net/saber/" },  
    { name: "عبد الباسط عبد الصمد", baseUrl: "https://server12.mp3quran.net/abs/" },  
    { name: "عبد الرحمن السديس", baseUrl: "https://server11.mp3quran.net/sudais/" },  
    { name: "عبد الرشيد صوفي", baseUrl: "https://server13.mp3quran.net/sufyy/" },  
    { name: "عبد العزيز الزهراني", baseUrl: "https://server12.mp3quran.net/aziz/" },  
    { name: "عبد الله الجهني", baseUrl: "https://server13.mp3quran.net/aljohani/" },  
    { name: "عبد الله بصفر", baseUrl: "https://server12.mp3quran.net/basfar/" },  
    { name: "عبدالله غيلان", baseUrl: "https://server11.mp3quran.net/gueilan/" },  
    { name: "علي الحذيفي", baseUrl: "https://server12.mp3quran.net/alhudhaifu/" },  
    { name: "علي جابر", baseUrl: "https://server12.mp3quran.net/ajbr/" },  
    { name: "عمر النعيم", baseUrl: "https://server11.mp3quran.net/omar/" },  
    { name: "ماهر المعيقلي", baseUrl: "https://server12.mp3quran.net/maher/" },  
    { name: "محمد ايوب", baseUrl: "https://server8.mp3quran.net/ayyub/" },  
    { name: "محمد اللحيدان", baseUrl: "https://server8.mp3quran.net/lhdan/" },  
    { name: "محمد صديق المنشاوي", baseUrl: "https://server12.mp3quran.net/alminshawi/" },  
    { name: "محمود خليل الحصري", baseUrl: "https://server12.mp3quran.net/alhussary/" },  
    { name: "محمود علي البنا", baseUrl: "https://server12.mp3quran.net/albanna/" },  
    { name: "مشاري العفاسي", baseUrl: "https://server12.mp3quran.net/mishari/" },  
    { name: "منصور السالمي", baseUrl: "https://server12.mp3quran.net/mansour/" },  
    { name: "ناصر القطامي", baseUrl: "https://server12.mp3quran.net/naqshbandi/" },  
    { name: "هيثم الدخين", baseUrl: "https://server12.mp3quran.net/hithamnour/" },  
    { name: "ياسر الدوسري", baseUrl: "https://server12.mp3quran.net/dosari/" },  
    { name: "ياسر سلامة", baseUrl: "https://server12.mp3quran.net/yaser/" }  
];

let audio = null;
let currentSurah = 1;
let currentReader = readers[0];
let surahsList = [];
let currentSurahAyahsCount = 0;
let ayahTimings = [];
let currentHighlightedAyah = null;

document.addEventListener('DOMContentLoaded', async () => {
    loadReadersList();
    await loadSurahsList();
    setupEventListeners();
    if (surahsList.length > 0) {
        loadSurah(currentSurah);
    }
    initScrollTopButton();
    initHamburgerMenu();
})

function loadReadersList() {
    const readerSelect = document.querySelector('.reader-select');
    if (!readerSelect) return;
    
    readerSelect.innerHTML = '';
    readers.forEach((reader, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = reader.name;
        if (index === 0) option.selected = true;
        readerSelect.appendChild(option);
    });
}

async function loadSurahsList() {
    try {
        const response = await axios.get('https://api.alquran.cloud/v1/surah');
        surahsList = response.data.data;
        const surahSelect = document.querySelector('.surah-select');
        surahSelect.innerHTML = '';
        surahsList.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.number;
            option.textContent = `${surah.englishName} - ${surah.name}`;
            if (surah.number === 1) option.selected = true;
            surahSelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        showNotification('حدث خطأ في تحميل قائمة السور', 'error');
    }
}

async function loadSurah(surahNumber) {
    const quranText = document.getElementById('quran-text');
    quranText.innerHTML = `<p>جاري تحميل السورة...</p>`;
    try {
        const surahInfo = surahsList.find(s => s.number == surahNumber);
        document.querySelector('.surah-name').textContent = surahInfo.name;

        const ayahsResponse = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
        const ayahs = ayahsResponse.data.data.ayahs;
        currentSurahAyahsCount = ayahs.length;
        generateAyahTimings(ayahs.length);

        let html = '<div class="ayahs-container">';
        if (surahNumber !== 9) html += '<div class="bismillah">بِسْمِ اللَّهُ الرَّحْمَٰنِ الرَّحِيمِ</div>';

        ayahs.forEach(ayah => {
            html += `
                <span class="ayah" data-ayah="${ayah.numberInSurah}" data-surah="${surahNumber}">
                    ${ayah.text}
                    <span class="ayah-number">${ayah.numberInSurah}</span>
                    <div class="tafsir-popup" id="tafsir-${surahNumber}-${ayah.numberInSurah}">تحميل التفسير...</div>
                </span>`;
        });

        html += '</div>';
        quranText.innerHTML = html;
        loadTafsirForSurah(surahNumber);
        setupAyahHover();
    } catch (error) {
        console.error(error);
        quranText.innerHTML = '<div class="error-message">تعذر تحميل السورة</div>';
    }
}

function generateAyahTimings(totalAyahs) {
    ayahTimings = [];
    for (let i = 0; i < totalAyahs; i++) {
        ayahTimings.push({ start: (i / totalAyahs) * 100, end: ((i + 1) / totalAyahs) * 100 });
    }
}

async function loadTafsirForSurah(surahNumber) {
    for (let i = 1; i <= currentSurahAyahsCount; i++) {
        try {
            const tafsirEl = document.getElementById(`tafsir-${surahNumber}-${i}`);
            if (!tafsirEl) continue;
            
            const response = await axios.get(`https://quranenc.com/api/v1/translation/aya/arabic_moyassar/${surahNumber}/${i}`);
            tafsirEl.textContent = response.data.result.translation || 'لا يوجد تفسير';
        } catch (err) {
            const tafsirEl = document.getElementById(`tafsir-${surahNumber}-${i}`);
            if (tafsirEl) tafsirEl.textContent = 'تعذر تحميل التفسير';
        }
    }
}

function setupAyahHover() {
    document.querySelectorAll('.ayah').forEach(ayahEl => {
        ayahEl.addEventListener('mouseenter', () => {
            ayahEl.querySelector('.tafsir-popup').style.display = 'block';
        });
        ayahEl.addEventListener('mouseleave', () => {
            ayahEl.querySelector('.tafsir-popup').style.display = 'none';
        });
    });
}

async function playSurah() {
    // إيقاف الصوت القديم
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
    }

    currentReader = readers[document.querySelector('.reader-select').selectedIndex];
    currentSurah = document.querySelector('.surah-select').value;

    const audioPath = `${currentReader.baseUrl}${currentSurah.toString().padStart(3,'0')}.mp3`;
    console.log('محاولة تشغيل:', audioPath);
    
    audio = new Audio(audioPath);
    audio.crossOrigin = "anonymous";
    
    audio.addEventListener('error', (e) => {
        console.error('خطأ في التحميل:', e);
        showNotification('تعذر تشغيل الصوت - جرب قارئ آخر', 'error');
        togglePlayPauseButtons(false);
    });

    audio.play().catch((err) => {
        console.error('خطأ في التشغيل:', err);
        showNotification('تعذر تشغيل الصوت - جرب قارئ آخر', 'error');
        togglePlayPauseButtons(false);
    });

    audio.addEventListener('play', () => togglePlayPauseButtons(true));
    audio.addEventListener('pause', () => togglePlayPauseButtons(false));
    audio.addEventListener('ended', () => togglePlayPauseButtons(false));

    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            highlightCurrentAyah(progress);
        }
    });
}

function highlightCurrentAyah(progress) {
    if (!ayahTimings.length) return;
    const idx = ayahTimings.findIndex(t => progress >= t.start && progress < t.end);
    if (idx === -1) return;

    const ayahEl = document.querySelector(`.ayah[data-ayah="${idx + 1}"]`);
    if (ayahEl && ayahEl !== currentHighlightedAyah) {
        if (currentHighlightedAyah) currentHighlightedAyah.classList.remove('highlighted');
        ayahEl.classList.add('highlighted');
        currentHighlightedAyah = ayahEl;
    }
}

function togglePlayPauseButtons(isPlaying) {
    const playBtn = document.querySelector('.play-btn');
    const pauseBtn = document.querySelector('.pause-btn');
    
    if (isPlaying) {
        if (playBtn) playBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'block';
    } else {
        if (playBtn) playBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
    }
}

function setupEventListeners() {
    const playBtn = document.querySelector('.play-btn');
    const pauseBtn = document.querySelector('.pause-btn');
    const surahSelect = document.querySelector('.surah-select');
    const readerSelect = document.querySelector('.reader-select');
    
    console.log('Event listeners setup:', { playBtn, pauseBtn, surahSelect, readerSelect });
    
    if (playBtn) playBtn.addEventListener('click', playSurah);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseAudio);
    if (surahSelect) surahSelect.addEventListener('change', e => loadSurah(e.target.value));
    if (readerSelect) readerSelect.addEventListener('change', () => console.log('Reader changed'));
}

function pauseAudio() {
    if (audio) {
        audio.pause();
        togglePlayPauseButtons(false);
        showNotification('تم إيقاف التشغيل', 'success');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
        color: white;
        border-radius: 4px;
        z-index: 9999;
        font-size: 14px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease-out;
    `;
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 500);
}
A
function initScrollTopButton() {
    const scrollBtn = document.querySelector('.scroll-top-btn');
    if (!scrollBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
    if (!hamburger || !menu) return;
    
    hamburger.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hamburger') && !e.target.closest('.menu')) {
            menu.classList.remove('active');
        }
    });
}