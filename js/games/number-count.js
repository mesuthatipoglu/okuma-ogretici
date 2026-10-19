(function() {
    'use strict';

    /**
     * Say ve Bul 🍎
     * Ekrana gelen nesneleri sayıp doğru sayıyı bulma oyunu
     */
    function NumberCountGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'number-count';
        this.level = options.maxGroup || 1;
        this.targetNumber = 1;
        this.countedItems = 0;
    }

    NumberCountGame.prototype = Object.create(window.BaseGame.prototype);
    NumberCountGame.prototype.constructor = NumberCountGame;

    NumberCountGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.container.style.backgroundColor = '#e8f5e9';
        
        this.helpText = 'Ekranda kaç tane nesne olduğunu say! İstersen nesnelere dokunarak tek tek sayabilirsin. Sonra aşağıdaki doğru sayıya bas.';
        this.helpIcon = '🍎';
        this.createHeader('Say ve Bul 🍎');

        var self = this;
        this.showIntro({
            title: 'Say ve Bul! 🍎',
            icon: '🍎',
            description: 'Ekranda kaç tane nesne var?\nNesnelere tek tek dokunarak say, sonra doğru sayıyı seç!',
            voiceText: 'Ekranda kaç tane nesne olduğunu say ve doğru sayıyı seç!',
            examples: [
                { text: '3 Elma 🍎🍎🍎 → 3', sound: '3', emoji: '🍎' },
                { text: '5 Yıldız ⭐⭐⭐⭐⭐ → 5', sound: '5', emoji: '⭐' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    NumberCountGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Say ve Bul 🍎');
        
        this.gameArea = window.Utils.createElement('div', 'game-area number-count-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-between;' +
            'width:100%;height:100%;padding:14px;box-sizing:border-box;position:relative;overflow:hidden;';
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    NumberCountGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        this.gameArea.innerHTML = '';
        this.countedItems = 0;

        // Düzeye göre sayı aralığı belirle
        var numbersList = window.GameData.getNumbers(this.level);
        var targetItem = window.Utils.randomItem(numbersList);
        this.targetNumber = targetItem.num;
        var emoji = targetItem.emoji || '🍎';

        // 1. Üst Kısım: Soru ve Dinle Butonu
        var topSection = window.Utils.createElement('div', 'count-top-section');
        topSection.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin-bottom:8px;';

        var questionLabel = window.Utils.createElement('div', 'count-question-label', 'Kaç tane var?');
        questionLabel.style.cssText = 'font-size:clamp(18px, 4vw, 26px);font-weight:900;color:#2E7D32;';
        topSection.appendChild(questionLabel);

        var listenBtn = window.Utils.createElement('button', 'count-listen-btn', '🔊');
        listenBtn.style.cssText =
            'border:none;border-radius:50%;width:36px;height:36px;background:#4CAF50;color:white;' +
            'font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.15);';
        listenBtn.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakSentence('Kaç tane var? Nesneleri say ve bul!');
        });
        topSection.appendChild(listenBtn);
        this.gameArea.appendChild(topSection);

        // 2. Orta Kısım: Sayılacak Nesneler Alanı
        var objectsArea = window.Utils.createElement('div', 'count-objects-area');
        objectsArea.style.cssText =
            'flex:1;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;' +
            'width:100%;max-width:550px;background:white;border-radius:24px;padding:12px;box-sizing:border-box;' +
            'box-shadow:0 6px 18px rgba(0,0,0,0.08);overflow-y:auto;max-height:48vh;border:3px solid #C8E6C9;';

        var sizeClass = this.targetNumber > 18 ? 'clamp(22px, 5vw, 32px)' : (this.targetNumber > 10 ? 'clamp(28px, 6.5vw, 42px)' : 'clamp(36px, 8.5vw, 54px)');

        for (var i = 1; i <= this.targetNumber; i++) {
            (function(idx) {
                var objWrap = window.Utils.createElement('div', 'count-obj-wrap');
                objWrap.style.cssText =
                    'position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;' +
                    'padding:4px;transition:transform 0.15s;';

                var objEmoji = window.Utils.createElement('div', 'count-emoji', emoji);
                objEmoji.style.cssText = 'font-size:' + sizeClass + ';line-height:1;';
                objWrap.appendChild(objEmoji);

                // Dokunulduğunda çıkan sayı rozeti
                var badge = window.Utils.createElement('div', 'count-badge');
                badge.style.cssText =
                    'position:absolute;top:-4px;right:-4px;background:#FF5722;color:white;border-radius:50%;' +
                    'width:20px;height:20px;font-size:11px;font-weight:bold;display:none;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
                objWrap.appendChild(badge);

                objWrap.addEventListener('click', function() {
                    if (objWrap.dataset.counted !== 'true') {
                        objWrap.dataset.counted = 'true';
                        self.countedItems++;
                        badge.textContent = String(self.countedItems);
                        badge.style.display = 'flex';
                        window.Utils.bounceElement(objWrap);
                        window.AudioManager.playPop();
                        window.speechSynthesis.cancel();
                        window.AudioManager.speakNumber(self.countedItems);
                    } else {
                        window.Utils.pulseElement(objWrap);
                    }
                });

                objectsArea.appendChild(objWrap);
            })(i);
        }
        this.gameArea.appendChild(objectsArea);

        // 3. Alt Kısım: Seçenekler (4 Seçenek)
        var optionsContainer = window.Utils.createElement('div', 'count-options-container');
        optionsContainer.style.cssText =
            'display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;width:100%;max-width:480px;margin-top:12px;';

        // 3 çeldirici üret
        var distractors = [];
        var maxPossible = Math.max(10, Math.min(30, this.targetNumber + 5));
        var minPossible = Math.max(1, this.targetNumber - 5);

        while (distractors.length < 3) {
            var cand = window.Utils.randomInt(minPossible, maxPossible);
            if (cand !== this.targetNumber && distractors.indexOf(cand) === -1) {
                distractors.push(cand);
            }
        }

        var allChoices = [this.targetNumber].concat(distractors);
        allChoices = window.Utils.shuffle(allChoices);

        allChoices.forEach(function(choice) {
            var btn = window.Utils.createElement('button', 'count-choice-btn', String(choice));
            btn.style.cssText =
                'padding:12px 6px;border:4px solid #4CAF50;border-radius:18px;background:white;' +
                'color:#2E7D32;font-size:clamp(22px, 5.5vw, 36px);font-weight:900;cursor:pointer;' +
                'box-shadow:0 4px 10px rgba(0,0,0,0.1);transition:transform 0.15s, background-color 0.2s;user-select:none;';

            btn.addEventListener('click', function() {
                if (btn.dataset.disabled === 'true') return;

                if (choice === self.targetNumber) {
                    var allBtns = optionsContainer.querySelectorAll('button');
                    allBtns.forEach(function(b) { b.dataset.disabled = 'true'; });

                    btn.style.background = '#4CAF50';
                    btn.style.borderColor = '#2E7D32';
                    btn.style.color = 'white';

                    self.showCorrectFeedback(btn);
                    window.speechSynthesis.cancel();
                    window.AudioManager.speakNumber(choice);

                    setTimeout(function() {
                        self.nextRound();
                    }, 1400);
                } else {
                    btn.style.background = '#F44336';
                    btn.style.borderColor = '#C62828';
                    btn.style.color = 'white';

                    window.AudioManager.playWrong();
                    window.AudioManager.playZort();
                    window.Utils.shakeElement(btn);

                    setTimeout(function() {
                        btn.style.background = 'white';
                        btn.style.borderColor = '#4CAF50';
                        btn.style.color = '#2E7D32';
                    }, 800);
                }
            });

            optionsContainer.appendChild(btn);
        });

        this.gameArea.appendChild(optionsContainer);

        // Başlangıç yönergesi
        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speakSentence('Kaç tane var?');
        }, 300);
    };

    NumberCountGame.prototype.destroy = function() {
        window.BaseGame.prototype.destroy.call(this);
    };

    window.NumberCountGame = NumberCountGame;
})();
