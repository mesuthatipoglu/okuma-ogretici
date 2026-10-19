/**
 * Türkçe Okuma Öğretici - Temel Oyun Sınıfı
 * Tüm oyunlar bu sınıftan türetilir
 */
window.BaseGame = (function () {
    'use strict';

    var cheerMascots = ['dinozor', 'tekboynuz', 'astronot', 'aslan', 'panda', 'penguen', 'kelebek', 'yunus'];
    var cheerPhrases = ['Harikasın! 🌟', 'Süpersin! 🎉', 'Aferin Sana! 🥳', 'Çok Başarılı! 🏆', 'Şampiyon! 🚀'];

    function BaseGame(container, options) {
        this.container = container;
        this.options = options || {};
        this.maxGroup = options.maxGroup || window.Progress.getMaxGroup();
        this.running = false;
        this.score = 0;
        this.round = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.dims = null;
        this._resizeHandler = null;
        this._animationFrameId = null;
    }

    /**
     * Oyunu başlatır
     */
    BaseGame.prototype.init = function () {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.running = true;
        this.score = 0;
        this.round = 0;
        this.correctCount = 0;
        this.wrongCount = 0;

        this.updateDimensions();

        var self = this;
        this._resizeHandler = function () {
            self.updateDimensions();
            if (self.onResize) self.onResize();
        };
        window.addEventListener('resize', this._resizeHandler);

        window.AudioManager.init();
    };

    /**
     * Oyun alanı boyutlarını günceller
     */
    BaseGame.prototype.updateDimensions = function () {
        this.dims = window.Utils.getGameDimensions(this.container);
    };

    /**
     * Doğru cevap geri bildirimi (5 yaş grubu için zengin yıldız patlaması ve hızlı ödül)
     */
    BaseGame.prototype.showCorrectFeedback = function (element) {
        var self = this;
        this.correctCount++;
        this.score += 10;

        window.AudioManager.playCorrect();

        if (element) {
            window.Utils.bounceElement(element);
            try {
                var elRect = element.getBoundingClientRect();
                var contRect = this.container.getBoundingClientRect();
                if (elRect.width > 0 && contRect.width > 0) {
                    var cx = (elRect.left - contRect.left) + elRect.width / 2;
                    var cy = (elRect.top - contRect.top) + elRect.height / 2;
                    window.Utils.showStarBurst(this.container, cx, cy);
                }
            } catch (e) {}
        }

        // Her 3 doğru cevapta yıldız ödülü ver (5 yaşındaki çocuğun motivasyonu için sık ödül)
        if (this.correctCount % 3 === 0) {
            var gameId = this.options.gameId || this.gameId || 'unknown';
            window.Progress.addStar(gameId);
            this.updateStarDisplay();
            window.AudioManager.playStar();

            var starDiv = window.Utils.createElement('div', 'floating-star');
            starDiv.textContent = '🌟 +1 Yıldız!';
            starDiv.style.cssText =
                'position:absolute;font-size:clamp(28px,6vw,46px);font-weight:900;color:#FFD700;' +
                'text-shadow:0 4px 12px rgba(0,0,0,0.45);z-index:9999;pointer-events:none;' +
                'left:50%;top:50%;transform:translate(-50%,-50%);white-space:nowrap;' +
                'background:rgba(0,0,0,0.45);padding:10px 24px;border-radius:30px;border:3px solid #FFD700;';
            this.container.appendChild(starDiv);

            window.Utils.animate(starDiv, [
                { transform: 'translate(-50%,-50%) scale(0.2) rotate(-10deg)', opacity: 0 },
                { transform: 'translate(-50%,-50%) scale(1.2) rotate(5deg)', opacity: 1, offset: 0.4 },
                { transform: 'translate(-50%,-130%) scale(0.9) rotate(0deg)', opacity: 0 }
            ], { duration: 1250, easing: 'ease-out' }).then(function () {
                if (starDiv.parentNode) starDiv.remove();
            });
        }

        // Her 5 doğru cevapta gökkuşağı konfeti ve alkış
        if (this.correctCount % 5 === 0) {
            window.Utils.showConfetti(this.container);
            window.AudioManager.playApplause();
        }
    };

    /**
     * Yanlış cevap geri bildirimi
     */
    BaseGame.prototype.showWrongFeedback = function (element) {
        this.wrongCount++;
        window.AudioManager.playWrong();
        if (element) {
            window.Utils.shakeElement(element);
        }
    };

    /**
     * Sonraki tura geç
     */
    BaseGame.prototype.nextRound = function () {
        this.round++;
    };

    /**
     * Oyunu durdurur ve temizler
     */
    BaseGame.prototype.destroy = function () {
        this.running = false;

        if (this._introTimeout) {
            clearTimeout(this._introTimeout);
            this._introTimeout = null;
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }

        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }

        if (this.options.gameId) {
            window.Progress.markGamePlayed(this.options.gameId);
        }

        if (this.correctCount >= 3 && window.Progress.isSequentialMode()) {
            window.Progress.advanceSequentialStep();
        }

        this.container.innerHTML = '';
    };

    /**
     * Üst bilgi çubuğunu günceller
     */
    BaseGame.prototype.createHeader = function (title) {
        var titleBar = document.getElementById('game-title-bar');
        if (titleBar) {
            titleBar.textContent = title || '';
        }

        var starsBar = document.getElementById('game-stars-bar');
        if (starsBar) {
            var gameId = this.options.gameId || this.gameId || 'unknown';
            var starCount = window.Progress.getStars(gameId);
            starsBar.textContent = '⭐ ' + starCount;
        }

        this._starsEl = starsBar;
    };

    /**
     * Yıldız sayısını günceller
     */
    BaseGame.prototype.updateStarDisplay = function () {
        var starsBar = document.getElementById('game-stars-bar');
        if (starsBar) {
            var gameId = this.options.gameId || this.gameId || 'unknown';
            starsBar.textContent = '⭐ ' + window.Progress.getStars(gameId);
        }
    };

    /**
     * Yardım overlay'i gösterir
     */
    BaseGame.prototype.showHelp = function () {
        var helpText = this.helpText || 'Bu oyunu oyna ve öğren!';
        var helpIcon = this.helpIcon || '❓';

        var overlay = document.createElement('div');
        overlay.className = 'help-overlay';
        overlay.innerHTML =
            '<div class="help-content">' +
            '  <div class="help-icon">' + helpIcon + '</div>' +
            '  <div class="help-title">Nasıl Oynanır?</div>' +
            '  <div class="help-text">' + helpText + '</div>' +
            '  <button class="help-close-btn">Anladım! 👍</button>' +
            '</div>';

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.classList.contains('help-close-btn')) {
                overlay.remove();
            }
        });

        document.body.appendChild(overlay);
    };

    /**
     * Oyun öncesi resimli ve sesli tanıtım ekranı
     */
    BaseGame.prototype.showIntro = function (opts) {
        var self = this;
        opts = opts || {};
        var title = opts.title || 'Haydi Öğrenelim!';
        var icon = opts.icon || '📚';
        var description = opts.description || '';
        var voiceText = opts.voiceText || description || title;
        var examples = opts.examples || [];
        var onStart = opts.onStart || function () {};

        this.container.innerHTML = '';

        var introArea = window.Utils.createElement('div', 'intro-area');
        introArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'width:100%;height:100%;padding:16px;box-sizing:border-box;text-align:center;' +
            'background:linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04));' +
            'overflow-y:auto;-webkit-overflow-scrolling:touch;';

        // Büyük vektör ikon / maskot
        var iconWrap = window.Utils.createElement('div', 'intro-icon-wrap');
        iconWrap.style.cssText = 'margin-bottom:8px;';
        if (window.SvgLetters && window.SvgLetters.createObjectImage) {
            var badge = window.SvgLetters.createObjectImage(icon, 84, { animate: true });
            iconWrap.appendChild(badge);
        } else {
            var iconEl = window.Utils.createElement('div', 'intro-icon', icon);
            iconEl.style.cssText = 'font-size:clamp(46px,11vw,78px);';
            iconWrap.appendChild(iconEl);
        }
        introArea.appendChild(iconWrap);

        // Başlık
        var titleEl = window.Utils.createElement('div', 'intro-title', title);
        titleEl.style.cssText =
            'font-size:clamp(20px,4.5vw,32px);font-weight:900;color:white;' +
            'text-shadow:2px 2px 6px rgba(0,0,0,0.3);margin-bottom:8px;';
        introArea.appendChild(titleEl);

        // Açıklama
        if (description) {
            var descEl = window.Utils.createElement('div', 'intro-desc', description);
            descEl.style.cssText =
                'font-size:clamp(14px,2.8vw,19px);color:rgba(255,255,255,0.96);' +
                'line-height:1.45;margin-bottom:12px;max-width:540px;' +
                'background:rgba(0,0,0,0.22);padding:10px 18px;border-radius:18px;backdrop-filter:blur(5px);';
            introArea.appendChild(descEl);
        }

        // Sesli Dinle Butonu
        var voiceBtn = window.Utils.createElement('button', 'intro-voice-btn');
        voiceBtn.innerHTML = '🔊 <span>Sesli Dinle</span>';
        voiceBtn.style.cssText =
            'padding:8px 20px;border:2px solid rgba(255,255,255,0.5);border-radius:22px;background:rgba(255,255,255,0.22);' +
            'color:white;font-size:clamp(13px,2.6vw,16px);font-weight:800;cursor:pointer;' +
            'margin-bottom:12px;display:flex;align-items:center;gap:8px;transition:all 0.2s;';
        
        var speakIntro = function() {
            window.speechSynthesis.cancel();
            if (window.AudioManager && window.AudioManager.speakSentence) {
                window.AudioManager.speakSentence(voiceText);
            }
        };
        voiceBtn.addEventListener('click', function() {
            window.Utils.bounceElement(voiceBtn);
            speakIntro();
        });
        introArea.appendChild(voiceBtn);

        // Zengin Resimli Örnek Kartlar
        if (examples.length > 0) {
            var exTitle = window.Utils.createElement('div', 'intro-ex-title', '👇 Resimlere Dokun ve Sesini Dinle:');
            exTitle.style.cssText = 'font-size:clamp(13px,2.5vw,16px);color:#FFD54F;font-weight:800;margin-bottom:8px;';
            introArea.appendChild(exTitle);

            var exGrid = window.Utils.createElement('div', 'intro-examples');
            exGrid.style.cssText =
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:16px;max-width:620px;';

            examples.forEach(function (ex) {
                var exItem = window.Utils.createElement('div', 'intro-example');
                exItem.style.cssText =
                    'background:white;color:#222;border-radius:20px;padding:8px 16px;' +
                    'font-size:clamp(16px,3.6vw,22px);font-weight:900;' +
                    'display:flex;align-items:center;gap:10px;cursor:pointer;' +
                    'box-shadow:0 6px 16px rgba(0,0,0,0.22);transition:transform 0.15s;user-select:none;' +
                    'border:3px solid #FFD54F;';

                if (window.SvgLetters && window.SvgLetters.createObjectImage && (ex.image || ex.word || ex.emoji)) {
                    var miniObj = window.SvgLetters.createObjectImage(
                        { word: ex.word, emoji: ex.emoji, image: ex.image },
                        44,
                        { bg: false, animate: false }
                    );
                    exItem.appendChild(miniObj);
                }

                var txtSpan = document.createElement('span');
                txtSpan.textContent = ex.text;
                exItem.appendChild(txtSpan);
                
                exItem.addEventListener('click', function () {
                    window.Utils.bounceElement(exItem);
                    window.speechSynthesis.cancel();
                    var soundToSpeak = ex.sound || ex.rawText || ex.text;
                    if (ex.type === 'letter' && window.AudioManager.speakLetter) {
                        window.AudioManager.speakLetter(soundToSpeak);
                    } else if (ex.type === 'syllable' && window.AudioManager.speakSyllable) {
                        window.AudioManager.speakSyllable(soundToSpeak);
                    } else if (window.AudioManager.speakWord) {
                        window.AudioManager.speakWord(soundToSpeak);
                    }
                });
                exGrid.appendChild(exItem);
            });

            introArea.appendChild(exGrid);
        }

        // Başla butonu
        var startBtn = window.Utils.createElement('button', 'intro-start-btn', '🎮 Hemen Oynayalım!');
        startBtn.style.cssText =
            'padding:14px 44px;border:3px solid #FFF59D;border-radius:35px;' +
            'background:linear-gradient(135deg,#00E676,#00C853);color:white;' +
            'font-size:clamp(18px,3.8vw,25px);font-weight:900;cursor:pointer;' +
            'box-shadow:0 8px 24px rgba(0,200,83,0.5);transition:transform 0.15s;flex-shrink:0;' +
            'text-shadow:1px 1px 3px rgba(0,0,0,0.25);animation:pulse 1.8s infinite;';

        startBtn.addEventListener('click', function () {
            window.speechSynthesis.cancel();
            window.AudioManager.playClick();
            startBtn.style.transform = 'scale(0.95)';
            setTimeout(function () {
                onStart();
            }, 120);
        });

        introArea.appendChild(startBtn);
        this.container.appendChild(introArea);

        this._introTimeout = setTimeout(function() {
            if (!self.running) return;
            speakIntro();
        }, 300);
    };

    /**
     * Ekrana sevimli maskotlu ve konfetili kutlama overlay'i gösterir
     */
    BaseGame.prototype.showCorrectOverlay = function (text, customObject) {
        var self = this;
        window.Utils.showConfetti(this.container);

        var overlay = window.Utils.createElement('div', 'correct-overlay');
        overlay.style.cssText =
            'position:absolute;top:0;left:0;right:0;bottom:0;' +
            'display:flex;align-items:center;justify-content:center;' +
            'background:rgba(0,0,0,0.35);backdrop-filter:blur(3px);z-index:9998;pointer-events:none;';

        var card = window.Utils.createElement('div', 'correct-mascot-card');
        card.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;' +
            'padding:24px 38px;border-radius:32px;' +
            'background:linear-gradient(135deg, #43A047, #00C853);' +
            'border:5px solid #FFD700;box-shadow:0 16px 40px rgba(0,0,0,0.4);text-align:center;';

        var mascotSlug = customObject || window.Utils.randomItem(cheerMascots);
        if (window.SvgLetters && window.SvgLetters.createObjectImage) {
            var mascotEl = window.SvgLetters.createObjectImage(mascotSlug, 96, { animate: true });
            card.appendChild(mascotEl);
        }

        var msg = window.Utils.createElement('div', 'correct-msg', text || window.Utils.randomItem(cheerPhrases));
        msg.style.cssText =
            'font-size:clamp(26px, 6vw, 44px);font-weight:900;color:white;' +
            'text-shadow:2px 3px 6px rgba(0,0,0,0.35);';
        card.appendChild(msg);

        overlay.appendChild(card);
        this.container.appendChild(overlay);

        return window.Utils.animate(card, [
            { transform: 'scale(0.2) rotate(-12deg)', opacity: 0 },
            { transform: 'scale(1.15) rotate(4deg)', opacity: 1, offset: 0.35 },
            { transform: 'scale(1) rotate(0deg)', opacity: 1, offset: 0.75 },
            { transform: 'scale(0.85) translateY(-20px)', opacity: 0 }
        ], { duration: 1500, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }).then(function () {
            if (overlay.parentNode) overlay.remove();
        });
    };

    /**
     * Geçiş animasyonuyla yeni tur hazırlar
     */
    BaseGame.prototype.transitionToNextRound = function (setupFn) {
        var gameArea = this.container.querySelector('.game-area') || this.container;

        return window.Utils.animate(gameArea, [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.95)' }
        ], { duration: 180, easing: 'ease-in' }).then(function () {
            if (setupFn) setupFn();
            return window.Utils.animate(gameArea, [
                { opacity: 0, transform: 'scale(0.95)' },
                { opacity: 1, transform: 'scale(1)' }
            ], { duration: 220, easing: 'ease-out' });
        });
    };

    return BaseGame;
})();
