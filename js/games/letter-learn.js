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
        this.container.style.backgroundColor = '#f3e5f5';
        
        this.helpText = 'Harfe dokunarak sesini dinle! Ardından örnek kelimelere dokun ve nasıl okunduğunu öğren.';
        this.helpIcon = '🔤';
        this.createHeader('Harfleri Öğrenelim 🔤');

        var self = this;
        this.showIntro({
            title: 'Harfleri Öğrenelim! 🔤',
            icon: '🔤',
            description: 'Alfabedeki tüm harfleri sırayla öğreneceğiz! Harfe dokun, sesini dinle ve örnek kelimeleri keşfet.',
            voiceText: 'Harfleri sırayla öğreniyoruz! Harfe ve resimlere dokunup seslerini dinle.',
            examples: [
                { text: 'A a (At 🐴)', sound: 'a', type: 'letter', emoji: '🐴' },
                { text: 'B b (Balık 🐟)', sound: 'be', type: 'letter', emoji: '🐟' },
                { text: 'C c (Civciv 🐥)', sound: 'ce', type: 'letter', emoji: '🐥' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterLearnGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.gameArea = window.Utils.createElement('div', 'learn-game-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-between;' +
            'width:100%;height:100%;padding:14px;box-sizing:border-box;overflow-y:auto;';
        this.container.appendChild(this.gameArea);
        
        this.renderCurrentLetter();
    };

    LetterLearnGame.prototype.renderCurrentLetter = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        if (this.autoPlayTimeout) clearTimeout(this.autoPlayTimeout);

        var currentLetter = this.alphabet[this.currentIndex];
        var info = window.GameData.getLetterInfo(currentLetter) || { sound: currentLetter, color: '#9C27B0', examples: [] };
        var examples = info.examples || [];

        // 1. Üst Kısım: İlerleme Göstergesi (Örn: "Harf: 1 / 29")
        var topRow = window.Utils.createElement('div', 'learn-top-row');
        topRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;max-width:550px;';
        
        var progressBadge = window.Utils.createElement('div', 'learn-progress-badge');
        progressBadge.textContent = 'Harf: ' + (this.currentIndex + 1) + ' / ' + this.alphabet.length;
        progressBadge.style.cssText =
            'font-size:clamp(13px, 2.8vw, 17px);font-weight:bold;color:#7B1FA2;background:rgba(255,255,255,0.7);' +
            'padding:6px 14px;border-radius:15px;box-shadow:0 2px 5px rgba(0,0,0,0.08);';
        topRow.appendChild(progressBadge);

        var soundBadge = window.Utils.createElement('button', 'learn-sound-btn');
        soundBadge.innerHTML = '🔊 <span>Tekrar Dinle</span>';
        soundBadge.style.cssText =
            'border:none;border-radius:15px;background:#9C27B0;color:white;font-weight:bold;' +
            'padding:6px 14px;font-size:clamp(13px, 2.8vw, 16px);cursor:pointer;display:flex;align-items:center;gap:6px;';
        soundBadge.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(currentLetter);
            window.Utils.pulseElement(letterCard);
        });
        topRow.appendChild(soundBadge);
        this.gameArea.appendChild(topRow);

        // 2. Orta Kısım: Büyük Harf Kartı
        var letterCard = window.Utils.createElement('div', 'learn-letter-card');
        letterCard.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'background:white;border-radius:28px;padding:16px 36px;margin:8px 0;' +
            'box-shadow:0 8px 24px rgba(156,39,176,0.2);cursor:pointer;transition:transform 0.2s;' +
            'border:4px solid ' + info.color + ';';
        
        var displayUpper = window.Utils.toUpperTR(currentLetter);
        var letterText = window.Utils.createElement('div', 'learn-letter-text');
        letterText.textContent = displayUpper + ' ' + currentLetter;
        letterText.style.cssText =
            'font-size:clamp(55px, 12vw, 85px);font-weight:900;color:' + info.color + ';' +
            'text-shadow:2px 3px 6px rgba(0,0,0,0.1);user-select:none;line-height:1.1;';
        
        var tapHint = window.Utils.createElement('div', 'learn-tap-hint', '👆 Harfe Dokun!');
        tapHint.style.cssText = 'font-size:clamp(12px, 2.5vw, 15px);color:#888;font-weight:600;margin-top:4px;';

        letterCard.appendChild(letterText);
        letterCard.appendChild(tapHint);

        letterCard.addEventListener('click', function() {
            window.Utils.bounceElement(letterCard);
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(currentLetter);
        });
        this.gameArea.appendChild(letterCard);

        // 3. Örnek Kelimeler Alanı (3 Örnek Resimli Kart)
        var examplesContainer = window.Utils.createElement('div', 'learn-examples-container');
        examplesContainer.style.cssText =
            'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:center;' +
            'width:100%;max-width:600px;margin:8px 0;';

        examples.forEach(function(ex) {
            var exCard = window.Utils.createElement('div', 'learn-ex-card');
            exCard.style.cssText =
                'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                'background:white;border-radius:20px;padding:12px 18px;min-width:110px;' +
                'box-shadow:0 4px 12px rgba(0,0,0,0.1);cursor:pointer;transition:transform 0.15s;' +
                'border:3px solid #E0E0E0;';

            var exEmoji = window.Utils.createElement('div', 'learn-ex-emoji');
            exEmoji.textContent = ex.emoji || '⭐';
            exEmoji.style.cssText = 'font-size:clamp(34px, 7vw, 48px);margin-bottom:4px;';

            var exWord = window.Utils.createElement('div', 'learn-ex-word');
            exWord.textContent = ex.word;
            exWord.style.cssText = 'font-size:clamp(20px, 5vw, 30px);font-weight:bold;color:#333;';

            exCard.appendChild(exEmoji);
            exCard.appendChild(exWord);

            exCard.addEventListener('click', function() {
                window.Utils.bounceElement(exCard);
                window.speechSynthesis.cancel();
                window.AudioManager.speakWord(ex.word);
            });

            examplesContainer.appendChild(exCard);
        });
        this.gameArea.appendChild(examplesContainer);

        // 4. Alt Gezinme Butonları (Önceki, Tamamla/Sonraki)
        var navContainer = window.Utils.createElement('div', 'learn-nav-container');
        navContainer.style.cssText =
            'display:flex;gap:16px;justify-content:center;align-items:center;width:100%;max-width:550px;margin-top:10px;';

        if (this.currentIndex > 0) {
            var prevBtn = window.Utils.createElement('button', 'learn-prev-btn', '◀ Önceki');
            prevBtn.style.cssText =
                'padding:12px 24px;border:none;border-radius:25px;background:#78909C;color:white;' +
                'font-size:clamp(15px, 3vw, 19px);font-weight:bold;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,0.15);';
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
            'padding:14px 34px;border:none;border-radius:30px;' +
            'background:linear-gradient(135deg,#4CAF50,#2E7D32);color:white;' +
            'font-size:clamp(16px, 3.5vw, 22px);font-weight:bold;cursor:pointer;' +
            'box-shadow:0 5px 15px rgba(46,125,50,0.4);transition:transform 0.15s;';

        nextBtn.addEventListener('click', function() {
            window.AudioManager.playStar();
            window.Utils.showConfetti(self.container);
            self.showCorrectFeedback(letterCard);
            
            setTimeout(function() {
                if (isLast) {
                    self.currentIndex = 0;
                } else {
                    self.currentIndex++;
                }
                self.renderCurrentLetter();
            }, 1000);
        });
        navContainer.appendChild(nextBtn);

        this.gameArea.appendChild(navContainer);

        // Sayfa açıldığında harfi seslendir
        setTimeout(function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(currentLetter);
            window.Utils.pulseElement(letterCard);
        }, 300);
    };

    LetterLearnGame.prototype.destroy = function() {
        if (this.autoPlayTimeout) clearTimeout(this.autoPlayTimeout);
        window.BaseGame.prototype.destroy.call(this);
    };

    window.LetterLearnGame = LetterLearnGame;
})();
