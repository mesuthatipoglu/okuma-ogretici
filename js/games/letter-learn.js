(function() {
    function LetterLearnGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.alphabet = window.GameData.getAllLetters();
        this.currentIndex = 0;
        this.autoPlayTimeout = null;
    }

    LetterLearnGame.prototype = Object.create(window.BaseGame.prototype);
    LetterLearnGame.prototype.constructor = LetterLearnGame;

    LetterLearnGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.container.style.background = 'linear-gradient(135deg, #4a148c, #7b1fa2)';
        
        this.helpText = 'Sevimli harf karakterine ve renkli nesne kartlarına dokunarak seslerini dinle! Her harf için birbirinden eğlenceli farklı nesneleri keşfet.';
        this.helpIcon = '🔤';
        this.createHeader('Harfleri Öğrenelim 🔤');

        var self = this;
        var introLetters = window.GameData.pickUniqueItems('learn_intro', this.alphabet, 3);
        var introExamples = introLetters.map(function(l) {
            var info = window.GameData.getLetterInfo(l);
            var ex = (info && info.examples && info.examples.length)
                ? window.GameData.pickUniqueItems('learn_intro_ex_' + l, info.examples, 1)[0]
                : { word: l, emoji: '⭐' };
            return {
                text: window.Utils.toUpperTR(l) + ' ' + l + ' (' + ex.word + ')',
                sound: l,
                type: 'letter',
                word: ex.word,
                emoji: ex.emoji,
                image: ex.image
            };
        });

        this.showIntro({
            title: 'Harfleri ve Nesneleri Keşfet! 🔤',
            icon: 'astronot',
            description: 'Alfabedeki 29 harfi eğlenceli hayvanlar ve nesnelerle öğreniyoruz! Harfe ve resimlere dokunarak seslerini dinle.',
            voiceText: 'Harfleri ve sevimli nesneleri öğreniyoruz! Resimlere dokunup seslerini dinle.',
            examples: introExamples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterLearnGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.gameArea = window.Utils.createElement('div', 'game-area learn-game-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-between;' +
            'width:100%;height:100%;padding:10px 14px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);
        
        this.renderCurrentLetter();
    };

    LetterLearnGame.prototype.onResize = function() {
        if (this.gameArea && this.running) {
            this.renderCurrentLetter(true);
        }
    };

    LetterLearnGame.prototype.renderCurrentLetter = function(skipAudio) {
        var self = this;
        if (!this.gameArea) return;
        this.gameArea.innerHTML = '';
        if (this.autoPlayTimeout) clearTimeout(this.autoPlayTimeout);

        var rect = this.gameArea.getBoundingClientRect();
        var w = rect.width || window.innerWidth;
        var h = rect.height || window.innerHeight;
        var isLandscape = w > h;

        var currentLetter = this.alphabet[this.currentIndex];
        var info = window.GameData.getLetterInfo(currentLetter) || { sound: currentLetter, color: '#9C27B0', examples: [] };
        var allExamples = info.examples || [];
        // Ekrana sığacak şekilde 4 farklı eğlenceli örnek seç (veya Yenile butonuyla değiştir)
        var shownExamples = window.GameData.pickUniqueItems('letter_learn_ex_' + currentLetter, allExamples, Math.min(4, allExamples.length));

        // 1. Üst Bar: Harf Seçici + İlerleme + Yenile/Dinle
        var topRow = window.Utils.createElement('div', 'learn-top-row');
        topRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;max-width:680px;gap:8px;flex-shrink:0;';
        
        var progressBadge = window.Utils.createElement('div', 'learn-progress-badge');
        progressBadge.textContent = '🔤 Harf ' + (this.currentIndex + 1) + ' / ' + this.alphabet.length;
        progressBadge.style.cssText =
            'font-size:clamp(13px, 2.5vw, 16px);font-weight:900;color:#4A148C;background:white;' +
            'padding:6px 14px;border-radius:18px;box-shadow:0 3px 8px rgba(0,0,0,0.18);';
        topRow.appendChild(progressBadge);

        if (allExamples.length > 3) {
            var shuffleExBtn = window.Utils.createElement('button', 'learn-shuffle-btn');
            shuffleExBtn.innerHTML = '🎲 <span>Farklı Nesneler</span>';
            shuffleExBtn.style.cssText =
                'border:none;border-radius:18px;background:#FF9800;color:white;font-weight:800;' +
                'padding:6px 14px;font-size:clamp(12px, 2.4vw, 15px);cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,0.2);';
            shuffleExBtn.addEventListener('click', function() {
                window.AudioManager.playPop();
                self.renderCurrentLetter(true);
            });
            topRow.appendChild(shuffleExBtn);
        }

        var soundBadge = window.Utils.createElement('button', 'learn-sound-btn');
        soundBadge.innerHTML = '🔊 <span>Dinle</span>';
        soundBadge.style.cssText =
            'border:none;border-radius:18px;background:#00E676;color:#1B5E20;font-weight:900;' +
            'padding:6px 14px;font-size:clamp(13px, 2.5vw, 16px);cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 3px 8px rgba(0,0,0,0.2);';
        soundBadge.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(currentLetter);
            window.Utils.bounceElement(letterHeroWrap);
        });
        topRow.appendChild(soundBadge);
        this.gameArea.appendChild(topRow);

        // 2. Orta Kısım: Sevimli Harf Karakteri + Büyük Harf Kartı
        var charHeight = Math.max(85, Math.min(h * 0.26, 150));
        var letterHeroWrap = window.Utils.createElement('div', 'learn-hero-wrap');
        letterHeroWrap.style.cssText =
            'display:flex;align-items:center;justify-content:center;gap:clamp(12px, 3vw, 24px);' +
            'background:rgba(255,255,255,0.95);border-radius:28px;padding:10px 26px;' +
            'box-shadow:0 10px 28px rgba(0,0,0,0.25);cursor:pointer;border:4px solid ' + info.color + ';flex-shrink:0;';

        var cuteChar = window.SvgLetters.createLetter(currentLetter, charHeight * 0.78, info.color);
        letterHeroWrap.appendChild(cuteChar);

        var textCol = window.Utils.createElement('div', 'learn-text-col');
        textCol.style.cssText = 'display:flex;flex-direction:column;align-items:center;';

        var displayUpper = window.Utils.toUpperTR(currentLetter);
        var letterText = window.Utils.createElement('div', 'learn-letter-text');
        letterText.textContent = displayUpper + ' ' + currentLetter;
        letterText.style.cssText =
            'font-size:' + Math.round(charHeight * 0.56) + 'px;font-weight:900;color:' + info.color + ';' +
            'text-shadow:2px 3px 6px rgba(0,0,0,0.12);user-select:none;line-height:1;';
        textCol.appendChild(letterText);

        var tapHint = window.Utils.createElement('div', 'learn-tap-hint', '👆 Dokun ve Sesini Duy!');
        tapHint.style.cssText = 'font-size:clamp(11px, 2.2vw, 14px);color:#666;font-weight:700;margin-top:4px;';
        textCol.appendChild(tapHint);

        letterHeroWrap.appendChild(textCol);

        letterHeroWrap.addEventListener('click', function() {
            window.Utils.bounceElement(letterHeroWrap);
            window.Utils.showStarBurst(self.container, w / 2, h * 0.28);
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(currentLetter);
        });
        this.gameArea.appendChild(letterHeroWrap);

        // 3. Zengin SVG Nesne Kartları Izgarası (Ekran boyutuna göre otomatik hesaplanır)
        var gridCols = isLandscape ? shownExamples.length : 2;
        var gridRows = Math.ceil(shownExamples.length / gridCols);
        var availH = Math.max(130, h - charHeight - 135);
        var availW = Math.min(w - 24, 680);
        var cardW = Math.floor((availW - (gridCols - 1) * 12) / gridCols);
        var cardH = Math.floor((availH - (gridRows - 1) * 12) / gridRows);
        var objSize = Math.max(42, Math.min(cardW * 0.58, cardH * 0.58, 92));

        var examplesContainer = window.Utils.createElement('div', 'learn-examples-container');
        examplesContainer.style.cssText =
            'display:grid;grid-template-columns:repeat(' + gridCols + ', 1fr);gap:12px;' +
            'width:100%;max-width:680px;justify-items:center;align-items:center;flex-shrink:0;';

        shownExamples.forEach(function(ex) {
            var exCard = window.Utils.createElement('div', 'learn-ex-card animate-slideIn');
            exCard.style.cssText =
                'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                'background:white;border-radius:22px;padding:8px 10px;width:100%;height:' + cardH + 'px;' +
                'box-sizing:border-box;box-shadow:0 6px 16px rgba(0,0,0,0.18);cursor:pointer;' +
                'border:4px solid ' + info.color + ';transition:transform 0.15s;';

            var svgObj = window.SvgLetters.createObjectImage(ex, objSize, { bg: false, animate: true });
            exCard.appendChild(svgObj);

            // Kelime içinde hedef harfi renkli vurgula
            var exWord = window.Utils.createElement('div', 'learn-ex-word');
            exWord.style.cssText = 'font-size:' + Math.max(15, Math.min(24, Math.round(cardH * 0.22))) + 'px;font-weight:900;color:#222;margin-top:4px;letter-spacing:0.5px;';
            var highlightedHtml = '';
            for (var cIdx = 0; cIdx < ex.word.length; cIdx++) {
                var ch = ex.word.charAt(cIdx);
                if (window.Utils.toLowerTR(ch) === currentLetter) {
                    highlightedHtml += '<span style="color:' + info.color + ';font-size:1.15em;text-decoration:underline;">' + window.Utils.toUpperTR(ch) + '</span>';
                } else {
                    highlightedHtml += ch;
                }
            }
            exWord.innerHTML = highlightedHtml;
            exCard.appendChild(exWord);

            exCard.addEventListener('click', function() {
                window.Utils.bounceElement(exCard);
                var cRect = exCard.getBoundingClientRect();
                var contRect = self.container.getBoundingClientRect();
                window.Utils.showStarBurst(self.container, (cRect.left - contRect.left) + cRect.width / 2, (cRect.top - contRect.top) + cRect.height / 2);
                window.speechSynthesis.cancel();
                window.AudioManager.speakWord(ex.word);
            });

            examplesContainer.appendChild(exCard);
        });
        this.gameArea.appendChild(examplesContainer);

        // 4. Alt Gezinme Butonları
        var navContainer = window.Utils.createElement('div', 'learn-nav-container');
        navContainer.style.cssText =
            'display:flex;gap:14px;justify-content:center;align-items:center;width:100%;max-width:550px;flex-shrink:0;';

        if (this.currentIndex > 0) {
            var prevBtn = window.Utils.createElement('button', 'learn-prev-btn', '◀ Önceki');
            prevBtn.style.cssText =
                'padding:10px 22px;border:none;border-radius:25px;background:rgba(255,255,255,0.25);color:white;' +
                'font-size:clamp(14px, 2.8vw, 18px);font-weight:800;cursor:pointer;border:2px solid rgba(255,255,255,0.5);';
            prevBtn.addEventListener('click', function() {
                window.AudioManager.playClick();
                self.currentIndex--;
                self.renderCurrentLetter();
            });
            navContainer.appendChild(prevBtn);
        }

        var nextBtn = window.Utils.createElement('button', 'learn-next-btn');
        var isLast = (this.currentIndex === this.alphabet.length - 1);
        nextBtn.textContent = isLast ? 'Tebrikler! Başa Dön 🔄' : 'Sonraki Harf ▶';
        nextBtn.style.cssText =
            'padding:11px 30px;border:3px solid #FFF59D;border-radius:28px;' +
            'background:linear-gradient(135deg,#00E676,#00C853);color:white;' +
            'font-size:clamp(15px, 3.2vw, 20px);font-weight:900;cursor:pointer;' +
            'box-shadow:0 6px 16px rgba(0,200,83,0.4);transition:transform 0.15s;';

        nextBtn.addEventListener('click', function() {
            self.showCorrectFeedback(letterHeroWrap);
            setTimeout(function() {
                if (isLast) {
                    self.currentIndex = 0;
                } else {
                    self.currentIndex++;
                }
                self.renderCurrentLetter();
            }, 650);
        });
        navContainer.appendChild(nextBtn);

        this.gameArea.appendChild(navContainer);

        if (!skipAudio) {
            this.autoPlayTimeout = setTimeout(function() {
                if (!self.running) return;
                window.speechSynthesis.cancel();
                window.AudioManager.speakLetter(currentLetter);
                window.Utils.pulseElement(letterHeroWrap);
            }, 250);
        }
    };

    LetterLearnGame.prototype.destroy = function() {
        if (this.autoPlayTimeout) clearTimeout(this.autoPlayTimeout);
        window.BaseGame.prototype.destroy.call(this);
    };

    window.LetterLearnGame = LetterLearnGame;
})();
