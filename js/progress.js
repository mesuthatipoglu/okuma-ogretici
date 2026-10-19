/**
 * Türkçe Okuma Öğretici - İlerleme Takibi
 * localStorage ile kalıcı ilerleme kaydı
 */
window.Progress = (function () {
    'use strict';

    var STORAGE_KEY = 'okuma-ogretici-progress';

    var defaultData = {
        maxGroup: 6,
        sequentialMode: false,
        sequentialStep: 0,
        stars: {},
        gamesPlayed: {},
        learntLetters: [],
        totalStars: 0,
        settings: {
            volume: 1.0,
            muted: false
        }
    };

    /**
     * Veriyi localStorage'dan yükler
     */
    function load() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                var parsed = JSON.parse(stored);
                return Object.assign({}, defaultData, parsed, { maxGroup: 6 });
            }
        } catch (e) {
            console.warn('İlerleme verisi yüklenemedi:', e);
        }
        return Object.assign({}, defaultData);
    }

    /**
     * Veriyi localStorage'a kaydeder
     */
    function save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('İlerleme verisi kaydedilemedi:', e);
        }
    }

    var data = load();

    // ────────────────────────────────────────────
    // Harf Grubu İlerlemesi
    // ────────────────────────────────────────────

    function getMaxGroup() {
        return 6;
    }

    function setMaxGroup(group) {
        if (group > data.maxGroup) {
            data.maxGroup = group;
            save(data);
        }
    }

    function unlockNextGroup() {
        if (data.maxGroup < 6) {
            data.maxGroup++;
            save(data);
            return data.maxGroup;
        }
        return 6;
    }

    // ────────────────────────────────────────────
    // Yıldız Sistemi
    // ────────────────────────────────────────────

    function getStars(gameId) {
        return data.stars[gameId] || 0;
    }

    function addStar(gameId) {
        if (!data.stars[gameId]) data.stars[gameId] = 0;
        data.stars[gameId]++;
        data.totalStars++;
        save(data);
        return data.stars[gameId];
    }

    function getTotalStars() {
        return data.totalStars || 0;
    }

    // ────────────────────────────────────────────
    // Oyun Takibi
    // ────────────────────────────────────────────

    function markGamePlayed(gameId) {
        if (!data.gamesPlayed[gameId]) data.gamesPlayed[gameId] = 0;
        data.gamesPlayed[gameId]++;
        save(data);
    }

    function getGamesPlayed(gameId) {
        return data.gamesPlayed[gameId] || 0;
    }

    // ────────────────────────────────────────────
    // Öğrenilen Harfler
    // ────────────────────────────────────────────

    function getLearntLetters() {
        return data.learntLetters || [];
    }

    function markLetterLearnt(letter) {
        if (!data.learntLetters) data.learntLetters = [];
        if (!data.learntLetters.includes(letter)) {
            data.learntLetters.push(letter);
            save(data);
        }
    }

    function isLetterLearnt(letter) {
        return (data.learntLetters || []).includes(letter);
    }

    // ────────────────────────────────────────────
    // Sıralı Öğrenme Modu
    // ────────────────────────────────────────────

    function isSequentialMode() {
        return data.sequentialMode || false;
    }

    function setSequentialMode(mode) {
        data.sequentialMode = mode;
        save(data);
    }

    function getSequentialStep() {
        return data.sequentialStep || 0;
    }

    function setSequentialStep(step) {
        data.sequentialStep = step;
        save(data);
    }

    function advanceSequentialStep() {
        data.sequentialStep = (data.sequentialStep || 0) + 1;
        save(data);
        return data.sequentialStep;
    }

    // ────────────────────────────────────────────
    // Ayarlar
    // ────────────────────────────────────────────

    function getSettings() {
        return data.settings || defaultData.settings;
    }

    function updateSettings(newSettings) {
        data.settings = Object.assign({}, data.settings, newSettings);
        save(data);
    }

    // ────────────────────────────────────────────
    // Sıfırlama
    // ────────────────────────────────────────────

    function reset() {
        data = Object.assign({}, defaultData);
        data.stars = {};
        data.gamesPlayed = {};
        data.learntLetters = [];
        save(data);
    }

    // ────────────────────────────────────────────
    // Public API
    // ────────────────────────────────────────────
    return {
        getMaxGroup: getMaxGroup,
        setMaxGroup: setMaxGroup,
        unlockNextGroup: unlockNextGroup,
        getStars: getStars,
        addStar: addStar,
        getTotalStars: getTotalStars,
        markGamePlayed: markGamePlayed,
        getGamesPlayed: getGamesPlayed,
        getLearntLetters: getLearntLetters,
        markLetterLearnt: markLetterLearnt,
        isLetterLearnt: isLetterLearnt,
        isSequentialMode: isSequentialMode,
        setSequentialMode: setSequentialMode,
        getSequentialStep: getSequentialStep,
        setSequentialStep: setSequentialStep,
        advanceSequentialStep: advanceSequentialStep,
        getSettings: getSettings,
        updateSettings: updateSettings,
        reset: reset
    };
})();
