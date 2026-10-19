(function() {
    'use strict';

    /**
     * Sayıları Tanıyalım 🔢
     * 1'den 30'a kadar sayıları sesli, yazılı ve eğlenceli vektör nesnelerle tanıtır.
     */
    function NumberLearnGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'number-learn';
        this.level = options.maxGroup || 1;
        this.numbers = window.GameData.getNumbers(this.level);
        this.currentIndex = 0;
        this.customObject = null;
    }

    NumberLearnGame.prototype = Object.create(window.BaseGame.prototype);
    NumberLearnGame.prototype.constructor = NumberLearnGame;

    NumberLearnGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.container.style.backgroundColor = '#fce4ec';
        
        this.helpText = 'Sayıya ve nesnelere dokunarak seslerini dinle! Nesne Değiştir butonuyla farklı oyuncaklar ve hayvanlar sayabilirsin.';
        this.helpIcon = '🔢';
        this.createHeader('Sayıları Tanıyalım 🔢');

        var self = this;
        this.showIntro({
            title: 'Sayıları Tanıyalım! 🔢',
            icon: '🔢',
            description: 'Sayıları ve eğlenceli nesneleri keşfediyoruz! Nesnelere tek tek dokunarak saymayı öğren.',
            voiceText: 'Sayıları sırayla öğreniyoruz! Sayılara ve nesnelere dokunup seslerini dinle.',
            examples: [
                { text: '1 (Bir Elma)', sound: '1', emoji: '🍎', asset: 'assets/images/objects/elma.svg' },
                { text: '5 (Beş Roket)', sound: '5', emoji: '🚀', asset: 'assets/images/objects/roket.svg' },
                { text: '10 (On Yıldız)', sound: '10', emoji: '⭐', asset: 'assets/images/objects/yildiz.svg' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    NumberLearnGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Sayıları Tanıyalım 🔢');
        this.updateDimensions();
        
        this.gameArea = window.Utils.createElement('div', 'learn-game-area number-learn-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-between;' +
            'width:100%;height:100%;padding:12px;box-sizing:border-box;overflow-y:auto;-webkit-overflow-scrolling:touch;';
        this.container.appendChild(this.gameArea);
        
        this.renderCurrentNumber();
    };

    NumberLearnGame.prototype.renderCurrentNumber = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        this.updateDimensions();

        var currentItem = this.numbers[this.currentIndex];
        var num = currentItem.num;
        var word = currentItem.word.toLocaleUpperCase('tr-TR');
        var activeObj = this.customObject || currentItem;
        var emoji = activeObj.emoji || '⭐';
        var asset = activeObj.asset || null;
        var objName = activeObj.name || '';

        // 1. Üst Kısım: İlerleme, Nesne Değiştir ve Ses Butonu
        var topRow = window.Utils.createElement('div', 'number-top-row');
        topRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;max-width:560px;gap:8px;flex-wrap:wrap;';

        var progressBadge = window.Utils.createElement('div', 'number-progress-badge');
        progressBadge.textContent = 'Sayı: ' + (this.currentIndex + 1) + ' / ' + this.numbers.length;
        progressBadge.style.cssText =
            'font-size:clamp(13px, 2.6vw, 16px);font-weight:bold;color:#C2185B;background:rgba(255,255,255,0.9);' +
            'padding:6px 14px;border-radius:16px;box-shadow:0 2px 6px rgba(0,0,0,0.08);';
        topRow.appendChild(progressBadge);

        var changeObjBtn = window.Utils.createElement('button', 'number-change-obj-btn', '🎲 Başka Nesne');
        changeObjBtn.style.cssText =
            'border:none;border-radius:16px;background:#7B1FA2;color:white;font-weight:bold;' +
            'padding:6px 14px;font-size:clamp(12px, 2.5vw, 15px);cursor:pointer;box-shadow:0 3px 8px rgba(123,31,162,0.3);';
        changeObjBtn.addEventListener('click', function() {
            window.AudioManager.playClick();
            self.customObject = window.GameData.getRandomNumberObject();
            self.renderCurrentNumber();
        });
        topRow.appendChild(changeObjBtn);

        var soundBtn = window.Utils.createElement('button', 'number-sound-btn');
        soundBtn.innerHTML = '🔊 <span>Dinle</span>';
        soundBtn.style.cssText =
            'border:none;border-radius:16px;background:#E91E63;color:white;font-weight:bold;' +
            'padding:6px 16px;font-size:clamp(13px, 2.6vw, 16px);cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 3px 8px rgba(233,30,99,0.3);';
        soundBtn.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakNumber(num);
            window.Utils.celebrateElement(numberCard);
        });
        topRow.appendChild(soundBtn);
        this.gameArea.appendChild(topRow);

        // 2. Büyük Sayı Kartı
        var numberCard = window.Utils.createElement('div', 'number-display-card');
        numberCard.style.cssText =
            'display:flex;align-items:center;justify-content:center;gap:18px;' +
            'background:white;border-radius:26px;padding:10px 28px;margin:6px 0;width:100%;max-width:360px;' +
            'box-shadow:0 8px 22px rgba(233,30,99,0.18);cursor:pointer;border:4px solid #EC407A;transition:transform 0.15s;';

        var numberText = window.Utils.createElement('div', 'number-big-text', String(num));
        numberText.style.cssText =
            'font-size:clamp(46px, 11vw, 76px);font-weight:900;color:#C2185B;line-height:1;';
        numberCard.appendChild(numberText);

        var rightInfo = window.Utils.createElement('div', '');
        rightInfo.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;';
        var numberWord = window.Utils.createElement('div', 'number-word-text', word);
        numberWord.style.cssText =
            'font-size:clamp(18px, 4vw, 26px);font-weight:900;color:#37474F;letter-spacing:1px;';
        rightInfo.appendChild(numberWord);
        if (objName) {
            var objSub = window.Utils.createElement('div', '', num + ' ' + objName);
            objSub.style.cssText = 'font-size:clamp(12px, 2.5vw, 15px);font-weight:800;color:#8E24AA;';
            rightInfo.appendChild(objSub);
        }
        numberCard.appendChild(rightInfo);

        numberCard.addEventListener('click', function() {
            window.Utils.celebrateElement(numberCard);
            window.speechSynthesis.cancel();
            window.AudioManager.speakNumber(num);
        });
        this.gameArea.appendChild(numberCard);

        // 3. Nesneler Alanı (Sayılabilir Vektör Görseller)
        var objectsContainer = window.Utils.createElement('div', 'number-objects-container');
        objectsContainer.style.cssText =
            'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;' +
            'width:100%;max-width:560px;min-height:90px;max-height:38vh;overflow-y:auto;padding:12px;' +
            'background:rgba(255,255,255,0.75);border-radius:24px;box-shadow:inset 0 2px 8px rgba(0,0,0,0.06);';

        var itemPx = num > 20 ? 38 : (num > 10 ? 48 : 62);

        for (var i = 1; i <= num; i++) {
            (function(idx) {
                var itemEl = window.Utils.createElement('div', 'count-item-pill');
                itemEl.style.cssText =
                    'cursor:pointer;user-select:none;transition:transform 0.15s;' +
                    'display:flex;align-items:center;justify-content:center;position:relative;';
                var svgObj = window.SvgLetters.createEmojiImage(emoji, itemPx, asset);
                itemEl.appendChild(svgObj);

                var numBadge = window.Utils.createElement('span', '', String(idx));
                numBadge.style.cssText =
                    'position:absolute;bottom:-4px;right:-4px;background:#E91E63;color:white;' +
                    'font-size:11px;font-weight:900;border-radius:10px;padding:1px 5px;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
                itemEl.appendChild(numBadge);

                itemEl.addEventListener('click', function(e) {
                    e.stopPropagation();
                    window.Utils.celebrateElement(itemEl);
                    window.speechSynthesis.cancel();
                    window.AudioManager.speakNumber(idx);
                });

                objectsContainer.appendChild(itemEl);
            })(i);
        }
        this.gameArea.appendChild(objectsContainer);

        // 4. Gezinme Butonları
        var navContainer = window.Utils.createElement('div', 'number-nav-container');
        navContainer.style.cssText =
            'display:flex;gap:14px;justify-content:center;align-items:center;width:100%;max-width:500px;margin-top:8px;';

        if (this.currentIndex > 0) {
            var prevBtn = window.Utils.createElement('button', 'number-prev-btn', '◀ Önceki');
            prevBtn.style.cssText =
                'padding:10px 20px;border:none;border-radius:22px;background:#78909C;color:white;' +
                'font-size:clamp(14px, 3vw, 18px);font-weight:bold;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,0.15);';
            prevBtn.addEventListener('click', function() {
                window.AudioManager.playClick();
                self.customObject = null;
                self.currentIndex--;
                self.renderCurrentNumber();
            });
            navContainer.appendChild(prevBtn);
        }

        var isLast = (this.currentIndex === this.numbers.length - 1);
        var nextBtn = window.Utils.createElement('button', 'number-next-btn', isLast ? 'Başa Dön 🔄' : 'Sonraki ▶');
        nextBtn.style.cssText =
            'padding:12px 28px;border:none;border-radius:25px;' +
            'background:linear-gradient(135deg,#4CAF50,#2E7D32);color:white;' +
            'font-size:clamp(15px, 3.5vw, 20px);font-weight:bold;cursor:pointer;' +
            'box-shadow:0 4px 12px rgba(46,125,50,0.35);';

        nextBtn.addEventListener('click', function() {
            window.AudioManager.playStar();
            window.Utils.bounceElement(numberCard);
            
            setTimeout(function() {
                self.customObject = null;
                if (isLast) {
                    self.currentIndex = 0;
                } else {
                    self.currentIndex++;
                }
                self.renderCurrentNumber();
            }, 300);
        });
        navContainer.appendChild(nextBtn);

        this.gameArea.appendChild(navContainer);

        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speakNumber(num);
            window.Utils.pulseElement(numberCard);
        }, 300);
    };

    NumberLearnGame.prototype.destroy = function() {
        window.BaseGame.prototype.destroy.call(this);
    };

    window.NumberLearnGame = NumberLearnGame;
})();
