/**
 * Türkçe Okuma Öğretici - Ses Yönetimi
 * Web Speech API (TTS) + Web Audio API (efektler)
 */
window.AudioManager = (function () {
    'use strict';

    let audioCtx = null;
    let initialized = false;
    let volume = 1.0;
    let muted = false;

    /**
     * AudioContext'i başlatır (kullanıcı etkileşimi gerektirir)
     */
    function init() {
        if (initialized) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            initialized = true;
        } catch (e) {
            console.warn('Web Audio API desteklenmiyor:', e);
        }
    }

    /**
     * AudioContext'in çalıştığından emin ol
     */
    function ensureContext() {
        if (!audioCtx) init();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // ────────────────────────────────────────────
    // Web Speech API - Türkçe Konuşma
    // ────────────────────────────────────────────

    /**
     * Verilen metni Türkçe olarak seslendirir
     */
    function speak(text, rate, pitch) {
        if (muted) return Promise.resolve();
        return new Promise(function (resolve) {
            if (!('speechSynthesis' in window)) {
                resolve();
                return;
            }
            // Önceki konuşmayı durdur
            window.speechSynthesis.cancel();

            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            utterance.rate = rate || 0.8;   // Çocuk için yavaş
            utterance.pitch = pitch || 1.1; // Biraz tiz
            utterance.volume = volume;

            // Türkçe ses bul
            var voices = window.speechSynthesis.getVoices();
            var trVoice = voices.find(function (v) {
                return v.lang && v.lang.startsWith('tr');
            });
            if (trVoice) utterance.voice = trVoice;

            utterance.onend = resolve;
            utterance.onerror = resolve;

            // Timeout - 5 saniyede hala bitmezse devam et
            var timeout = setTimeout(resolve, 5000);
            utterance.onend = function () {
                clearTimeout(timeout);
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        });
    }

    /**
     * Harf sesini söyler (Standart Türkçe fonetik)
     */
    function speakLetter(letter) {
        if (!letter) return Promise.resolve();
        var key = letter.toLowerCase();
        var info = window.GameData.getLetterInfo(key);
        var soundText = info ? info.sound : key;

        // Tek harf ünsüz ise ve info yoksa 'e' ekleyerek seslendir (TTS'in I/1 diye okumasını engeller)
        var fallbackConsonants = {
            'b': 'be', 'c': 'ce', 'ç': 'çe', 'd': 'de', 'f': 'fe', 'g': 'ge', 'ğ': 'yumuşak ge',
            'h': 'he', 'j': 'je', 'k': 'ke', 'l': 'le', 'm': 'me', 'n': 'ne', 'p': 'pe',
            'r': 're', 's': 'se', 'ş': 'şe', 't': 'te', 'v': 've', 'y': 'ye', 'z': 'ze'
        };
        if (!info && fallbackConsonants[key]) {
            soundText = fallbackConsonants[key];
        }

        return speak(soundText, 0.8, 1.05);
    }

    /**
     * Heceyi söyler
     */
    function speakSyllable(syllable) {
        var text = typeof syllable === 'object' ? syllable.text : syllable;
        // Bazen 2 harfli heceleri (örneğin "al", "el") kısaltma sanıp A L diye kodlayabiliyor. 
        // Bunu önlemek için küçük harfe çevirebiliriz.
        if (text) {
            text = text.toLowerCase();
        }
        return speak(text, 0.7, 1.1);
    }

    /**
     * Kelimeyi söyler
     */
    function speakWord(word) {
        return speak(word, 0.75, 1.0);
    }

    /**
     * Cümleyi söyler
     */
    function speakSentence(sentence) {
        return speak(sentence, 0.7, 1.0);
    }

    /**
     * Sayıyı söyler (1-30 Türkçe fonetik telaffuz)
     */
    function speakNumber(num) {
        var n = parseInt(num, 10);
        var words = {
            1: 'bir', 2: 'iki', 3: 'üç', 4: 'dört', 5: 'beş',
            6: 'altı', 7: 'yedi', 8: 'sekiz', 9: 'dokuz', 10: 'on',
            11: 'on bir', 12: 'on iki', 13: 'on üç', 14: 'on dört', 15: 'on beş',
            16: 'on altı', 17: 'on yedi', 18: 'on sekiz', 19: 'on dokuz', 20: 'yirmi',
            21: 'yirmi bir', 22: 'yirmi iki', 23: 'yirmi üç', 24: 'yirmi dört', 25: 'yirmi beş',
            26: 'yirmi altı', 27: 'yirmi yedi', 28: 'yirmi sekiz', 29: 'yirmi dokuz', 30: 'otuz'
        };
        var text = words[n] || String(num);
        return speak(text, 0.75, 1.05);
    }

    // ────────────────────────────────────────────
    // Web Audio API - Efekt Sesleri
    // ────────────────────────────────────────────

    /**
     * Basit ton çalar
     */
    function playTone(freq, duration, type, gainValue) {
        if (muted || !audioCtx) return;
        ensureContext();

        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime((gainValue || 0.3) * volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    }

    /**
     * Çoklu ton dizisi çalar
     */
    function playToneSequence(tones) {
        if (muted || !audioCtx) return;
        ensureContext();

        var time = audioCtx.currentTime;
        tones.forEach(function (tone) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();

            osc.type = tone.type || 'sine';
            osc.frequency.setValueAtTime(tone.freq, time + tone.start);

            gain.gain.setValueAtTime(0, time + tone.start);
            gain.gain.linearRampToValueAtTime((tone.gain || 0.3) * volume, time + tone.start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + tone.start + tone.duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(time + tone.start);
            osc.stop(time + tone.start + tone.duration);
        });
    }

    /**
     * Gürültü çalar (pop, click efektleri için)
     */
    function playNoise(duration, gainValue) {
        if (muted || !audioCtx) return;
        ensureContext();

        var bufferSize = audioCtx.sampleRate * duration;
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        var source = audioCtx.createBufferSource();
        source.buffer = buffer;

        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime((gainValue || 0.2) * volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        // Bandpass filtre
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        filter.Q.setValueAtTime(1, audioCtx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        source.start();
    }

    // ────────────────────────────────────────────
    // Hazır Efekt Sesleri
    // ────────────────────────────────────────────

    /** Doğru cevap sesi - neşeli ve net üç nota */
    function playCorrect() {
        playToneSequence([
            { freq: 523, start: 0, duration: 0.15, type: 'sine', gain: 0.55 },
            { freq: 659, start: 0.12, duration: 0.25, type: 'sine', gain: 0.55 },
            { freq: 784, start: 0.25, duration: 0.35, type: 'sine', gain: 0.5 }
        ]);
    }

    /** Yanlış cevap sesi - net ve nazik */
    function playWrong() {
        playToneSequence([
            { freq: 220, start: 0, duration: 0.18, type: 'triangle', gain: 0.35 },
            { freq: 160, start: 0.15, duration: 0.25, type: 'triangle', gain: 0.35 }
        ]);
    }

    /** Komik "zort" sesi - yanlış cevaplarda eğlenceli olumsuz geri bildirim */
    function playZort() {
        if (muted || !audioCtx) return;
        ensureContext();

        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.35 * volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.25);
    }

    /** Balon/baloncuk patlatma sesi */
    function playPop() {
        playNoise(0.08, 0.25);
        playTone(800, 0.1, 'sine', 0.25);
    }

    /** Tıklama / kart çevirme sesi - hafif ve geri bildirimi bastırmayan yumuşak ses */
    function playClick() {
        playTone(1200, 0.04, 'sine', 0.06);
    }

    /** Yıldız/ödül sesi */
    function playStar() {
        playToneSequence([
            { freq: 784, start: 0, duration: 0.1, type: 'sine', gain: 0.3 },
            { freq: 988, start: 0.08, duration: 0.1, type: 'sine', gain: 0.3 },
            { freq: 1175, start: 0.16, duration: 0.15, type: 'sine', gain: 0.25 },
            { freq: 1568, start: 0.25, duration: 0.3, type: 'sine', gain: 0.2 }
        ]);
    }

    /** Alkış/tebrik sesi (uzun) */
    function playApplause() {
        // Fanfar melodisi
        playToneSequence([
            { freq: 523, start: 0, duration: 0.2, type: 'square', gain: 0.15 },
            { freq: 659, start: 0.15, duration: 0.2, type: 'square', gain: 0.15 },
            { freq: 784, start: 0.3, duration: 0.2, type: 'square', gain: 0.15 },
            { freq: 1047, start: 0.45, duration: 0.5, type: 'square', gain: 0.2 },
            { freq: 784, start: 0.55, duration: 0.15, type: 'square', gain: 0.12 },
            { freq: 1047, start: 0.65, duration: 0.6, type: 'sine', gain: 0.25 }
        ]);
        // Gürültü alkış efekti
        for (var i = 0; i < 8; i++) {
            setTimeout(function () {
                playNoise(0.06, 0.08);
            }, i * 120 + 200);
        }
    }

    /** Seviye tamamlama sesi */
    function playLevelUp() {
        playToneSequence([
            { freq: 392, start: 0, duration: 0.15, type: 'sine', gain: 0.3 },
            { freq: 494, start: 0.12, duration: 0.15, type: 'sine', gain: 0.3 },
            { freq: 587, start: 0.24, duration: 0.15, type: 'sine', gain: 0.3 },
            { freq: 784, start: 0.36, duration: 0.15, type: 'sine', gain: 0.3 },
            { freq: 988, start: 0.48, duration: 0.15, type: 'sine', gain: 0.3 },
            { freq: 1175, start: 0.6, duration: 0.4, type: 'sine', gain: 0.35 }
        ]);
    }

    /** Geçiş sesi (whoosh) */
    function playWhoosh() {
        if (muted || !audioCtx) return;
        ensureContext();

        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        var filter = audioCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.2);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(4000, audioCtx.currentTime + 0.15);
        filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.08 * volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    }

    /** Birleşme sesi (hece oluşturma) */
    function playMerge() {
        playToneSequence([
            { freq: 400, start: 0, duration: 0.1, type: 'sine', gain: 0.2 },
            { freq: 600, start: 0.08, duration: 0.15, type: 'sine', gain: 0.25 },
            { freq: 900, start: 0.18, duration: 0.2, type: 'sine', gain: 0.2 }
        ]);
    }

    // ────────────────────────────────────────────
    // Ses Kontrolleri
    // ────────────────────────────────────────────

    function setVolume(v) {
        volume = Math.max(0, Math.min(1, v));
    }

    function getVolume() {
        return volume;
    }

    function setMuted(m) {
        muted = m;
    }

    function isMuted() {
        return muted;
    }

    // Sayfa yüklendiğinde sesleri yüklemeye çalış
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = function () {
            window.speechSynthesis.getVoices();
        };
    }

    return {
        init: init,
        speak: speak,
        speakLetter: speakLetter,
        speakSyllable: speakSyllable,
        speakWord: speakWord,
        speakSentence: speakSentence,
        speakNumber: speakNumber,
        playCorrect: playCorrect,
        playWrong: playWrong,
        playZort: playZort,
        playPop: playPop,
        playClick: playClick,
        playStar: playStar,
        playApplause: playApplause,
        playLevelUp: playLevelUp,
        playWhoosh: playWhoosh,
        playMerge: playMerge,
        setVolume: setVolume,
        getVolume: getVolume,
        setMuted: setMuted,
        isMuted: isMuted
    };
})();
