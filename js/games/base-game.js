/**
 * Türkçe Okuma Öğretici - Temel Oyun Sınıfı
 * Tüm oyunlar bu sınıftan türetilir
 */
window.BaseGame = (function () {
    'use strict';

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

        // Boyutları hesapla
        this.updateDimensions();

        // Resize dinle
        var self = this;
        this._resizeHandler = function () {
            self.updateDimensions();
            if (self.onResize) self.onResize();
        };
        window.addEventListener('resize', this._resizeHandler);

        // Audio başlat
        window.AudioManager.init();
    };

    /**
     * Oyun alanı boyutlarını günceller
     */
    BaseGame.prototype.updateDimensions = function () {
        this.dims = window.Utils.getGameDimensions(this.container);
    };

    /**
     * Doğru cevap geri bildirimi
     */
    BaseGame.prototype.showCorrectFeedback = function (element) {
        var self = this;
        this.correctCount++;
        this.score += 10;

        window.AudioManager.playCorrect();

        if (element) {
            window.Utils.bounceElement(element);
        }

        // Her 5 doğru cevapta yıldız ver
        if (this.correctCount % 5 === 0) {
            var gameId = this.options.gameId || 'unknown';
            window.Progress.addStar(gameId);
            window.AudioManager.playStar();

            // Yıldız animasyonu göster
            var starDiv = window.Utils.createElement('div', 'floating-star');
            starDiv.textContent = '⭐';
            starDiv.style.cssText =
                'position:absolute;font-size:60px;z-index:9999;pointer-events:none;' +
                'left:50%;top:50%;transform:translate(-50%,-50%);';
            this.container.appendChild(starDiv);

            window.Utils.animate(starDiv, [
                { transform: 'translate(-50%,-50%) scale(0) rotate(0deg)', opacity: 0 },
                { transform: 'translate(-50%,-50%) scale(1.5) rotate(360deg)', opacity: 1, offset: 0.5 },
                { transform: 'translate(-50%,-150%) scale(0.5) rotate(720deg)', opacity: 0 }
            ], { duration: 1200, easing: 'ease-out' }).then(function () {
                starDiv.remove();
            });
        }

        // Her 10 doğru cevapta konfeti
        if (this.correctCount % 10 === 0) {
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
        // Alt sınıf tarafından override edilecek
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

        // Oyun istatistiklerini kaydet
        if (this.options.gameId) {
            window.Progress.markGamePlayed(this.options.gameId);
        }

        // Sıralı modda yıldız kazanıldıysa adımı ilerlet
        if (this.stars > 0 && window.Progress.isSequentialMode()) {
            window.Progress.advanceSequentialStep();
        }

        this.container.innerHTML = '';
    };

    /**
     * Üst bilgi çubuğunu günceller (global #game-top-bar kullanır, YENİ element oluşturmaz)
     */
    BaseGame.prototype.createHeader = function (title) {
        // Global HTML başlığını güncelle (index.html'deki #game-top-bar)
        var titleBar = document.getElementById('game-title-bar');
        if (titleBar) {
            titleBar.textContent = title || '';
        }

        var starsBar = document.getElementById('game-stars-bar');
        if (starsBar) {
            var gameId = this.options.gameId || 'unknown';
            var starCount = window.Progress.getStars(gameId);
            starsBar.textContent = '⭐ ' + starCount;
        }

        // Referansları sakla (yıldız güncelleme için)
        this._starsEl = starsBar;
    };

    /**
     * Yıldız sayısını günceller (global bar'ı günceller)
     */
    BaseGame.prototype.updateStarDisplay = function () {
        var starsBar = document.getElementById('game-stars-bar');
        if (starsBar) {
            var gameId = this.options.gameId || 'unknown';
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
     * Oyun öncesi kısa eğitim/tanıtım ve konu anlatımı ekranı gösterir
     * Çocuğa ne öğreneceğini sesli ve görsel olarak anlatır
     * @param {Object} opts - { title, icon, description, voiceText, examples, onStart }
     */
    BaseGame.prototype.showIntro = function (opts) {
        var self = this;
        opts = opts || {};
        var title = opts.title || 'Haydi Öğrenelim!';
        var icon = opts.icon || '📚';
        var description = opts.description || '';
        var voiceText = opts.voiceText || description || title;
        var examples = opts.examples || []; // [{text, emoji, sound}]
        var onStart = opts.onStart || function () {};

        this.container.innerHTML = '';

        var introArea = window.Utils.createElement('div', 'intro-area');
        introArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'width:100%;height:100%;padding:20px;box-sizing:border-box;text-align:center;' +
            'background:linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05));' +
            'overflow-y:auto;-webkit-overflow-scrolling:touch;';

        // İkon (büyük ve sevimli)
        var iconEl = window.Utils.createElement('div', 'intro-icon', icon);
        iconEl.style.cssText = 'font-size:clamp(50px,12vw,85px);margin-bottom:12px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.2));';
        introArea.appendChild(iconEl);

        // Başlık
        var titleEl = window.Utils.createElement('div', 'intro-title', title);
        titleEl.style.cssText =
            'font-size:clamp(20px,4.5vw,34px);font-weight:800;color:white;' +
            'text-shadow:2px 2px 6px rgba(0,0,0,0.3);margin-bottom:10px;';
        introArea.appendChild(titleEl);

        // Konu Anlatımı / Açıklama
        if (description) {
            var descEl = window.Utils.createElement('div', 'intro-desc', description);
            descEl.style.cssText =
                'font-size:clamp(15px,3vw,20px);color:rgba(255,255,255,0.95);' +
                'line-height:1.5;margin-bottom:16px;max-width:550px;' +
                'background:rgba(0,0,0,0.2);padding:12px 20px;border-radius:18px;backdrop-filter:blur(5px);';
            introArea.appendChild(descEl);
        }

        // Sesli Anlatım Butonu (Dinle)
        var voiceBtn = window.Utils.createElement('button', 'intro-voice-btn');
        voiceBtn.innerHTML = '🔊 <span>Sesli Dinle</span>';
        voiceBtn.style.cssText =
            'padding:8px 20px;border:none;border-radius:20px;background:rgba(255,255,255,0.25);' +
            'color:white;font-size:clamp(14px,2.8vw,17px);font-weight:700;cursor:pointer;' +
            'margin-bottom:16px;display:flex;align-items:center;gap:8px;transition:all 0.2s;';
        
        var speakIntro = function() {
            window.speechSynthesis.cancel();
            if (window.AudioManager && window.AudioManager.speakSentence) {
                window.AudioManager.speakSentence(voiceText);
            }
        };
        voiceBtn.addEventListener('click', function() {
            window.Utils.pulseElement(voiceBtn);
            speakIntro();
        });
        introArea.appendChild(voiceBtn);

        // Örnekler (Çocuğun dokunarak sesini dinleyebileceği kartlar)
        if (examples.length > 0) {
            var exTitle = window.Utils.createElement('div', 'intro-ex-title', '👇 Dokun ve Sesini Duy:');
            exTitle.style.cssText = 'font-size:clamp(13px,2.5vw,16px);color:#FFD54F;font-weight:700;margin-bottom:8px;';
            introArea.appendChild(exTitle);

            var exGrid = window.Utils.createElement('div', 'intro-examples');
            exGrid.style.cssText =
                'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:20px;max-width:600px;';

            examples.forEach(function (ex) {
                var exItem = window.Utils.createElement('div', 'intro-example');
                exItem.style.cssText =
                    'background:white;color:#333;border-radius:16px;padding:10px 18px;' +
                    'font-size:clamp(18px,4vw,26px);font-weight:800;' +
                    'display:flex;align-items:center;gap:8px;cursor:pointer;' +
                    'box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:transform 0.15s;user-select:none;';
                exItem.innerHTML = (ex.emoji ? '<span style="font-size:1.2em">' + ex.emoji + '</span> ' : '') + ex.text;
                
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
        var startBtn = window.Utils.createElement('button', 'intro-start-btn', '🎮 Oyuna Başla!');
        startBtn.style.cssText =
            'padding:14px 44px;border:none;border-radius:30px;' +
            'background:linear-gradient(135deg,#4CAF50,#2E7D32);color:white;' +
            'font-size:clamp(17px,3.8vw,24px);font-weight:800;cursor:pointer;' +
            'box-shadow:0 6px 20px rgba(46,125,50,0.5);transition:transform 0.15s;flex-shrink:0;';

        startBtn.addEventListener('click', function () {
            window.speechSynthesis.cancel();
            window.AudioManager.playClick();
            startBtn.style.transform = 'scale(0.95)';
            setTimeout(function () {
                onStart();
            }, 150);
        });

        introArea.appendChild(startBtn);
        this.container.appendChild(introArea);

        // Ekran açıldıktan hemen sonra hafif gecikmeyle seslendir
        this._introTimeout = setTimeout(function() {
            if (!self.running) return;
            speakIntro();
        }, 300);
    };

    /**
     * Ekrana "Doğru!" overlay'i gösterir
     */
    BaseGame.prototype.showCorrectOverlay = function (text) {
        var self = this;
        var overlay = window.Utils.createElement('div', 'correct-overlay');
        overlay.style.cssText =
            'position:absolute;top:0;left:0;right:0;bottom:0;' +
            'display:flex;align-items:center;justify-content:center;' +
            'background:rgba(76,175,80,0.3);z-index:9998;pointer-events:none;';

        var msg = window.Utils.createElement('div', 'correct-msg', text || 'Aferin! 🎉');
        msg.style.cssText =
            'font-size:' + (this.dims ? this.dims.fontSize.xxlarge : '48px') + ';' +
            'font-weight:bold;color:white;' +
            'text-shadow:2px 2px 8px rgba(0,0,0,0.3);' +
            'padding:20px 40px;border-radius:20px;' +
            'background:rgba(76,175,80,0.8);';

        overlay.appendChild(msg);
        this.container.appendChild(overlay);

        return window.Utils.animate(msg, [
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1.2)', opacity: 1, offset: 0.4 },
            { transform: 'scale(1)', opacity: 1, offset: 0.6 },
            { transform: 'scale(1)', opacity: 0 }
        ], { duration: 1500, easing: 'ease-out' }).then(function () {
            overlay.remove();
        });
    };

    /**
     * Geçiş animasyonuyla yeni tur hazırlar
     */
    BaseGame.prototype.transitionToNextRound = function (setupFn) {
        var self = this;
        var gameArea = this.container.querySelector('.game-area') || this.container;

        return window.Utils.animate(gameArea, [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.95)' }
        ], { duration: 200, easing: 'ease-in' }).then(function () {
            if (setupFn) setupFn();
            return window.Utils.animate(gameArea, [
                { opacity: 0, transform: 'scale(0.95)' },
                { opacity: 1, transform: 'scale(1)' }
            ], { duration: 200, easing: 'ease-out' });
        });
    };

    return BaseGame;
})();
