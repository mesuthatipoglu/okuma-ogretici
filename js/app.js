/**
 * Türkçe Okuma Öğretici - Uygulama Yöneticisi
 * Ekran yönlendirme, menü oluşturma, oyun başlatma
 */
window.App = (function () {
    'use strict';

    var APP_VERSION = 'v2.1.0 (2026-10-20 00:30)';

    var currentScreen = 'menu';
    var currentSection = null;
    var currentGame = null;
    var currentGameInstance = null;
    var selectedGroup = 1;

    // Oyun sınıfları haritası
    var gameClasses = {
        'letter-learn': window.LetterLearnGame,
        'first-letter': window.FirstLetterGame,
        'balloon-pop': window.BalloonPopGame,
        'letter-hunt': window.LetterHuntGame,
        'letter-paint': window.LetterPaintGame,
        'letter-match': window.LetterMatchGame,
        'letter-sort': window.LetterSortGame,
        'syllable-train': window.SyllableTrainGame,
        'syllable-wheel': window.SyllableWheelGame,
        'syllable-match': window.SyllableMatchGame,
        'syllable-pop': window.SyllablePopGame,
        'syllable-box': window.SyllableBoxGame,
        'missing-syllable': window.MissingSyllableGame,
        'word-puzzle': window.WordPuzzleGame,
        'word-match': window.WordMatchGame,
        'word-hunt': window.WordHuntGame,
        'word-memory': window.WordMemoryGame,
        'number-learn': window.NumberLearnGame,
        'number-count': window.NumberCountGame,
        'number-order': window.NumberOrderGame,
        'number-pop': window.NumberPopGame,
        'sentence-train': window.SentenceTrainGame,
        'story-reader': window.StoryReaderGame,
        'shadow-match': window.ShadowMatchGame,
        'odd-one-out': window.OddOneOutGame
    };

    // ────────────────────────────────────────────
    // Ekran Yönetimi
    // ────────────────────────────────────────────

    function showScreen(name) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        document.querySelectorAll('.screen').forEach(function (s) {
            s.classList.remove('active');
        });
        var screen = document.getElementById('screen-' + name);
        if (screen) {
            screen.classList.add('active');
            currentScreen = name;
        }
    }

    // ────────────────────────────────────────────
    // Ana Menü
    // ────────────────────────────────────────────

    function buildMainMenu() {
        var container = document.getElementById('menu-sections');
        container.innerHTML = '';

        // 1. Sıralı Öğrenme Kartı (Ana Menüde)
        var seqBtn = document.createElement('button');
        seqBtn.className = 'menu-section-btn';
        seqBtn.style.background = 'linear-gradient(135deg, #FF6F00, #E65100)';
        
        var seqStep = window.Progress.getSequentialStep();
        var totalSteps = (window.GameData.sequentialSteps && window.GameData.sequentialSteps.length) || 22;
        
        seqBtn.innerHTML =
            '<span class="icon">🚀</span>' +
            '<span>Sıralı Öğrenme</span>' +
            '<span class="stars-badge">Adım: ' + (seqStep + 1) + '/' + totalSteps + '</span>';

        seqBtn.addEventListener('click', function () {
            window.AudioManager.init();
            window.AudioManager.playClick();
            startSequentialLearning();
        });

        container.appendChild(seqBtn);

        var maxGroup = window.Progress.getMaxGroup();

        window.GameData.sections.forEach(function (section, index) {
            var btn = document.createElement('button');
            btn.className = 'menu-section-btn';
            btn.style.background = section.bgGradient;

            // Kilit durumu kontrolü (sıralı modda ilk bölüm hariç kilitli olabilir)
            // Serbest modda hepsi açık
            var isLocked = false;
            // Basit erişim: hep açık (ama grup seçiminde sınırlama var)

            btn.innerHTML =
                '<span class="icon">' + section.icon + '</span>' +
                '<span>' + section.title + '</span>';

            // Yıldız sayısı
            var totalSectionStars = 0;
            section.games.forEach(function (g) {
                totalSectionStars += window.Progress.getStars(g.id);
            });
            if (totalSectionStars > 0) {
                btn.innerHTML += '<span class="stars-badge">⭐' + totalSectionStars + '</span>';
            }

            btn.addEventListener('click', function () {
                window.AudioManager.init();
                window.AudioManager.playClick();
                openSection(section.id);
            });

            container.appendChild(btn);
        });

        // Toplam yıldız güncelle
        document.getElementById('total-stars').textContent = '⭐ ' + window.Progress.getTotalStars();

        // Versiyon bilgisi
        document.getElementById('version-info').textContent = APP_VERSION;
    }

    // ────────────────────────────────────────────
    // Bölüm Menüsü
    // ────────────────────────────────────────────

    function showAppComingSoon(message) {
        var overlay = window.Utils.createElement('div', 'coming-soon-overlay');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        overlay.style.color = '#FFCA28';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontSize = 'clamp(24px, 6vw, 40px)';
        overlay.style.fontWeight = 'bold';
        overlay.style.textAlign = 'center';
        overlay.style.zIndex = '9999';
        overlay.style.padding = '20px';
        overlay.innerText = message || "Bu bölüm yakında eklenecek!\n🚀";
        
        document.body.appendChild(overlay);
        
        setTimeout(function() {
            if (overlay.parentNode) {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.5s';
                setTimeout(function() {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 500);
            }
        }, 2000);
    }

    function openSection(sectionId) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        var section = window.GameData.sections.find(function (s) { return s.id === sectionId; });
        if (!section) return;

        currentSection = section;
        selectedGroup = (sectionId === 'numbers') ? 1 : window.Progress.getMaxGroup();

        // Header stilini ayarla
        var header = document.getElementById('section-header');
        header.style.background = section.bgGradient;

        document.getElementById('section-title').textContent = section.icon + ' ' + section.title;

        // Grup seçici
        buildGroupSelector();

        // Oyun listesi
        buildGameList(section);

        showScreen('section');
    }

    function buildGroupSelector() {
        var container = document.getElementById('group-selector');
        container.innerHTML = '';

        // Sayılar Bölümü için Düzey Seçici (1-10, 11-20, 21-30, 1-30)
        if (currentSection && currentSection.id === 'numbers') {
            var numberLevels = window.GameData.numberLevels || [
                { id: 1, name: '1-10', color: '#4CAF50', emoji: '🌱' },
                { id: 2, name: '11-20', color: '#2196F3', emoji: '🌊' },
                { id: 3, name: '21-30', color: '#FF9800', emoji: '🌞' },
                { id: 4, name: '1-30', color: '#9C27B0', emoji: '⭐' }
            ];

            numberLevels.forEach(function (lvl) {
                var btn = document.createElement('button');
                btn.className = 'group-btn';
                if (lvl.id === selectedGroup) btn.classList.add('active');

                btn.style.color = lvl.id === selectedGroup ? lvl.color : 'white';
                if (lvl.id === selectedGroup) {
                    btn.style.background = 'white';
                }

                btn.textContent = lvl.emoji + ' ' + lvl.name;

                btn.addEventListener('click', function () {
                    window.AudioManager.playClick();
                    selectedGroup = lvl.id;
                    buildGroupSelector();
                    buildGameList(currentSection);
                });

                container.appendChild(btn);
            });
            return;
        }

        var maxGroup = window.Progress.getMaxGroup();

        window.GameData.letterGroups.forEach(function (group) {
            var btn = document.createElement('button');
            btn.className = 'group-btn';
            if (group.id === selectedGroup) btn.classList.add('active');
            if (group.id > maxGroup) btn.classList.add('locked');

            btn.style.color = group.id === selectedGroup ? group.color : 'white';
            if (group.id === selectedGroup) {
                btn.style.background = 'white';
            }

            btn.textContent = group.emoji + ' ' + group.name;

            btn.addEventListener('click', function () {
                if (group.id > maxGroup) return;
                window.AudioManager.playClick();
                selectedGroup = group.id;
                buildGroupSelector();
                buildGameList(currentSection);
            });

            container.appendChild(btn);
        });
    }

    function buildGameList(section) {
        var container = document.getElementById('game-list');
        container.innerHTML = '';

        section.games.forEach(function (game) {
            var card = document.createElement('div');
            card.className = 'game-card animate-slideIn';

            var stars = window.Progress.getStars(game.id);

            card.innerHTML =
                '<span class="game-icon">' + game.icon + '</span>' +
                '<div class="game-info">' +
                '  <h3>' + game.title + '</h3>' +
                '  <p>' + game.description + '</p>' +
                '</div>' +
                '<span class="game-stars">⭐ ' + stars + '</span>';

            card.addEventListener('click', function () {
                window.AudioManager.playClick();
                startGame(game.id, game.title);
            });

            container.appendChild(card);
        });
    }

    // ────────────────────────────────────────────
    // Oyun Başlatma
    // ────────────────────────────────────────────

    function startGame(gameId, title) {
        var GameClass = gameClasses[gameId];
        if (!GameClass) {
            console.error('Oyun bulunamadı:', gameId);
            return;
        }

        currentGame = gameId;
        document.getElementById('game-title-bar').textContent = title || gameId;

        var container = document.getElementById('game-container');

        // Bölüm rengine göre arka plan
        var sectionColors = {
            'letter-learn': 'linear-gradient(135deg, #4a148c, #7b1fa2)',
            'first-letter': 'linear-gradient(135deg, #ad1457, #d81b60)',
            'balloon-pop': 'linear-gradient(135deg, #1a237e, #4a148c)',
            'letter-hunt': 'linear-gradient(135deg, #004d40, #1b5e20)',
            'letter-paint': 'linear-gradient(135deg, #e65100, #bf360c)',
            'letter-match': 'linear-gradient(135deg, #1565c0, #0d47a1)',
            'letter-sort': 'linear-gradient(135deg, #2e7d32, #1b5e20)',
            'syllable-train': 'linear-gradient(135deg, #01579b, #006064)',
            'syllable-wheel': 'linear-gradient(135deg, #311b92, #6a1b9a)',
            'syllable-match': 'linear-gradient(135deg, #4a148c, #880e4f)',
            'syllable-pop': 'linear-gradient(135deg, #1a237e, #311b92)',
            'syllable-box': 'linear-gradient(135deg, #0d47a1, #1565c0)',
            'missing-syllable': 'linear-gradient(135deg, #006064, #00838f)',
            'word-puzzle': 'linear-gradient(135deg, #e65100, #f57f17)',
            'word-match': 'linear-gradient(135deg, #33691e, #827717)',
            'word-hunt': 'linear-gradient(135deg, #bf360c, #e65100)',
            'word-memory': 'linear-gradient(135deg, #e65100, #bf360c)',
            'number-learn': 'linear-gradient(135deg, #c2185b, #ad1457)',
            'number-count': 'linear-gradient(135deg, #2e7d32, #1b5e20)',
            'number-order': 'linear-gradient(135deg, #00695c, #004d40)',
            'number-pop': 'linear-gradient(135deg, #303f9f, #1a237e)',
            'sentence-train': 'linear-gradient(135deg, #4a148c, #6a1b9a)',
            'story-reader': 'linear-gradient(135deg, #283593, #1565c0)',
            'shadow-match': 'linear-gradient(135deg, #311b92, #512da8)',
            'odd-one-out': 'linear-gradient(135deg, #880e4f, #c2185b)'
        };
        container.style.background = sectionColors[gameId] || 'linear-gradient(135deg, #1a237e, #4a148c)';

        // ÖNCE ekranı göster ki getBoundingClientRect gerçek boyutları döndürsün
        showScreen('game');
        window.AudioManager.playWhoosh();

        // Layout hesaplanmasını bekle, SONRA oyunu başlat
        requestAnimationFrame(function() {
            currentGameInstance = new GameClass(container, {
                gameId: gameId,
                maxGroup: selectedGroup
            });
            currentGameInstance.init();
        });
    }

    function stopGame() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (currentGameInstance) {
            currentGameInstance.destroy();
            currentGameInstance = null;
        }
        currentGame = null;
    }

    // ────────────────────────────────────────────
    // Sıralı Öğrenme
    // ────────────────────────────────────────────

    function startSequentialLearning() {
        var step = window.Progress.getSequentialStep();
        var steps = window.GameData.sequentialSteps;

        if (step >= steps.length) {
            step = 0;
            window.Progress.setSequentialStep(0);
        }

        var currentStep = steps[step];
        selectedGroup = currentStep.group;
        currentSection = null; // Sıralı modda bölüm bağımsızdır

        // Grubu aç
        window.Progress.setMaxGroup(Math.max(window.Progress.getMaxGroup(), currentStep.group));

        // Sıralı modu aktif et
        window.Progress.setSequentialMode(true);

        startGame(currentStep.game, 'Adım ' + (step + 1) + ': ' + currentStep.title);
    }

    // ────────────────────────────────────────────
    // Ayarlar Modalı
    // ────────────────────────────────────────────

    function showSettings() {
        var settings = window.Progress.getSettings();

        var overlay = window.Utils.createElement('div', 'modal-overlay');
        var content = window.Utils.createElement('div', 'modal-content');

        content.innerHTML =
            '<h2>⚙️ Ayarlar</h2>' +
            '<div class="modal-row">' +
            '  <label>🔊 Ses Seviyesi</label>' +
            '  <input type="range" id="setting-volume" min="0" max="100" value="' + ((settings.volume || 1) * 100) + '">' +
            '</div>' +
            '<div class="modal-row">' +
            '  <label>📊 Toplam Yıldız</label>' +
            '  <span>⭐ ' + window.Progress.getTotalStars() + '</span>' +
            '</div>' +
            '<div class="modal-row">' +
            '  <label>🔤 Açık Grup</label>' +
            '  <span>' + window.Progress.getMaxGroup() + '. Grup</span>' +
            '</div>' +
            '<div class="modal-row">' +
            '  <label>🌐 Çevrimdışı Çalışma</label>' +
            '  <span style="color:#48bb78;font-weight:700;">✅ Hazır (Sunucusuz)</span>' +
            '</div>' +
            '<div class="modal-row">' +
            '  <label>🔓 Sonraki Grubu Aç</label>' +
            '  <button class="modal-btn modal-btn-primary" id="btn-unlock" style="width:auto;padding:8px 16px;margin:0;">Aç</button>' +
            '</div>' +
            '<button class="modal-btn modal-btn-danger" id="btn-reset">🗑️ İlerlemeyi Sıfırla</button>' +
            '<button class="modal-btn modal-btn-secondary" id="btn-close-settings">Kapat</button>';

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Volume
        document.getElementById('setting-volume').addEventListener('input', function () {
            var vol = parseInt(this.value) / 100;
            window.AudioManager.setVolume(vol);
            window.Progress.updateSettings({ volume: vol });
        });

        // Unlock
        document.getElementById('btn-unlock').addEventListener('click', function () {
            var newGroup = window.Progress.unlockNextGroup();
            window.AudioManager.playLevelUp();
            overlay.remove();
            showSettings(); // Yenile
            buildMainMenu();
        });

        // Reset
        document.getElementById('btn-reset').addEventListener('click', function () {
            if (confirm('Tüm ilerleme silinecek. Emin misiniz?')) {
                window.Progress.reset();
                window.AudioManager.playClick();
                overlay.remove();
                buildMainMenu();
            }
        });

        // Close
        document.getElementById('btn-close-settings').addEventListener('click', function () {
            overlay.remove();
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    // ────────────────────────────────────────────
    // Olay Dinleyicileri
    // ────────────────────────────────────────────

    function bindEvents() {
        // Geri butonları
        document.getElementById('btn-back-section').addEventListener('click', function () {
            window.AudioManager.playClick();
            currentSection = null;
            buildMainMenu();
            showScreen('menu');
        });

        document.getElementById('btn-back-game').addEventListener('click', function () {
            window.AudioManager.playClick();
            stopGame();

            // Sıralı moddan çıkılıyorsa doğrudan ana menüye dön
            if (window.Progress.isSequentialMode()) {
                window.Progress.setSequentialMode(false);
                currentSection = null;
                buildMainMenu();
                showScreen('menu');
                return;
            }

            if (currentSection) {
                buildGameList(currentSection);
                showScreen('section');
            } else {
                currentSection = null;
                buildMainMenu();
                showScreen('menu');
            }
        });

        document.getElementById('btn-help-game').addEventListener('click', function () {
            if (currentGameInstance && currentGameInstance.showHelp) {
                currentGameInstance.showHelp();
            }
        });

        // Sıralı öğrenme butonu (eğer sayfada varsa)
        var btnSeq = document.getElementById('btn-sequential');
        if (btnSeq) {
            btnSeq.addEventListener('click', function () {
                window.AudioManager.init();
                window.AudioManager.playClick();
                startSequentialLearning();
            });
        }

        // PWA Yükleme Butonu
        var btnInstall = document.getElementById('btn-install-pwa');
        if (btnInstall) {
            btnInstall.addEventListener('click', function () {
                window.AudioManager.playClick();
                if (window.deferredInstallPrompt) {
                    window.deferredInstallPrompt.prompt();
                    window.deferredInstallPrompt.userChoice.then(function (choice) {
                        if (choice && choice.outcome === 'accepted') {
                            btnInstall.style.display = 'none';
                        }
                        window.deferredInstallPrompt = null;
                    });
                } else {
                    if (window.showAppToast) {
                        window.showAppToast('Uygulamayı tarayıcınızın menüsünden "Ana Ekrana Ekle" seçerek de yükleyebilirsiniz.', 4000);
                    }
                }
            });
        }

        // Ayarlar
        document.getElementById('btn-settings').addEventListener('click', function () {
            window.AudioManager.playClick();
            showSettings();
        });

        // Tam ekran
        document.getElementById('btn-fullscreen').addEventListener('click', function () {
            window.AudioManager.playClick();
            window.Utils.toggleFullscreen();
        });

        // Donanım geri tuşu (Android)
        window.addEventListener('popstate', function () {
            if (currentScreen === 'game') {
                stopGame();
                if (window.Progress.isSequentialMode()) {
                    window.Progress.setSequentialMode(false);
                    currentSection = null;
                    showScreen('menu');
                } else if (currentSection) {
                    showScreen('section');
                } else {
                    currentSection = null;
                    showScreen('menu');
                }
            } else if (currentScreen === 'section') {
                currentSection = null;
                buildMainMenu();
                showScreen('menu');
            }
        });

        // İlk dokunuşta audio başlat
        document.addEventListener('touchstart', function initTouch() {
            window.AudioManager.init();
            document.removeEventListener('touchstart', initTouch);
        }, { once: true });

        document.addEventListener('click', function initClick() {
            window.AudioManager.init();
            document.removeEventListener('click', initClick);
        }, { once: true });
    }

    // ────────────────────────────────────────────
    // Başlatma
    // ────────────────────────────────────────────

    function init() {
        // Ayarları yükle
        var settings = window.Progress.getSettings();
        window.AudioManager.setVolume(settings.volume || 1.0);

        // Menüyü oluştur
        buildMainMenu();

        // Olayları bağla
        bindEvents();

        console.log('Okuma Öğreniyorum başlatıldı - ' + APP_VERSION);
    }

    // DOM hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        showScreen: showScreen,
        openSection: openSection,
        startGame: startGame,
        stopGame: stopGame,
        buildMainMenu: buildMainMenu,
        APP_VERSION: APP_VERSION
    };
})();
