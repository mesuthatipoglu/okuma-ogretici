(function() {
    'use strict';

    /**
     * Sayı Treni 🚂
     * Sayı sıralama ve ardışık dizideki eksik sayıyı bulma oyunu
     */
    function NumberOrderGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'number-order';
        this.level = options.maxGroup || 1;
        this.missingNumber = 0;
        this.sequence = [];
    }

    NumberOrderGame.prototype = Object.create(window.BaseGame.prototype);
    NumberOrderGame.prototype.constructor = NumberOrderGame;

    NumberOrderGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.container.style.backgroundColor = '#e0f2f1';
        
        this.helpText = 'Trenin vagonlarındaki sayılara bak ve eksik vagonu bul! Aşağıdaki sayılardan doğru olanına dokun.';
        this.helpIcon = '🚂';
        this.createHeader('Sayı Treni 🚂');

        var self = this;
        this.showIntro({
            title: 'Sayı Treni! 🚂',
            icon: '🚂',
            description: 'Trenin vagonlarındaki sayılar sırayla gidiyor.\nSoru işaretli boş vagona hangi sayı gelmeli?',
            voiceText: 'Trene bak ve eksik sayıyı bul!',
            examples: [
                { text: '1 - 2 - [ ? ] - 4 → 3', sound: '3', emoji: '🚂' },
                { text: '10 - [ ? ] - 12 - 13 → 11', sound: '11', emoji: '🚃' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    NumberOrderGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Sayı Treni 🚂');
        
        this.gameArea = window.Utils.createElement('div', 'game-area number-order-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;padding:12px;box-sizing:border-box;position:relative;overflow:hidden;';
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    NumberOrderGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        this.gameArea.innerHTML = '';

        // Düzeye göre 4 ardışık sayı seç
        var minVal = 1, maxVal = 27;
        if (this.level === 1) { minVal = 1; maxVal = 7; }
        else if (this.level === 2) { minVal = 11; maxVal = 17; }
        else if (this.level === 3) { minVal = 21; maxVal = 27; }
        else if (this.level === 4) { minVal = 1; maxVal = 27; }

        var startNum = window.Utils.randomInt(minVal, maxVal);
        this.sequence = [startNum, startNum + 1, startNum + 2, startNum + 3];

        // Rastgele bir vagonu eksik yap (genelde 1, 2 veya 3. vagon)
        var missingIdx = window.Utils.randomInt(1, 2);
        if (Math.random() > 0.7) missingIdx = 3;
        this.missingNumber = this.sequence[missingIdx];

        // 1. Üst Kısım: Soru Başlığı
        var questionTitle = window.Utils.createElement('div', 'order-title', '❓ Eksik Sayı Hangisi?');
        questionTitle.style.cssText =
            'font-size:clamp(18px, 4vw, 26px);font-weight:900;color:#00695C;text-shadow:1px 1px 3px rgba(0,0,0,0.15);';
        this.gameArea.appendChild(questionTitle);

        // 2. Tren Alanı (Lokomotif + 4 Vagon)
        var trainContainer = window.Utils.createElement('div', 'train-row');
        trainContainer.style.cssText =
            'display:flex;align-items:center;justify-content:center;gap:clamp(4px, 1vw, 10px);' +
            'width:100%;max-width:650px;padding:8px;box-sizing:border-box;';

        var areaW = this.gameArea.clientWidth || window.innerWidth;
        var carSize = Math.max(55, Math.min(95, Math.floor((areaW - 60) / 5)));

        // Lokomotif
        var engine = window.SvgLetters.createTrainCar('🚂', carSize, '#00897B', true);
        engine.style.flexShrink = '0';
        trainContainer.appendChild(engine);

        // 4 Vagon
        var missingSlotEl = null;

        for (var i = 0; i < this.sequence.length; i++) {
            var numVal = this.sequence[i];
            var isMissing = (i === missingIdx);

            var carWrapper = window.Utils.createElement('div', 'train-car-wrapper');
            carWrapper.style.cssText =
                'position:relative;width:' + carSize + 'px;height:' + carSize + 'px;flex-shrink:0;';

            if (isMissing) {
                // Soru işaretli boş yuva
                var slot = window.Utils.createElement('div', 'missing-train-slot', '?');
                slot.style.cssText =
                    'width:100%;height:100%;border:4px dashed #FF9800;border-radius:16px;background:rgba(255,152,0,0.2);' +
                    'display:flex;align-items:center;justify-content:center;font-size:clamp(24px, 5vw, 40px);font-weight:900;' +
                    'color:#E65100;box-sizing:border-box;box-shadow:0 3px 8px rgba(0,0,0,0.1);animation:pulse 1.5s infinite;';
                carWrapper.appendChild(slot);
                missingSlotEl = slot;
            } else {
                var carSvg = window.SvgLetters.createTrainCar(String(numVal), carSize, '#26A69A', false);
                carWrapper.appendChild(carSvg);
            }

            trainContainer.appendChild(carWrapper);
        }

        this.gameArea.appendChild(trainContainer);

        // 3. Seçenek Butonları (4 Seçenek)
        var optionsContainer = window.Utils.createElement('div', 'order-options');
        optionsContainer.style.cssText =
            'display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;width:100%;max-width:480px;margin-top:16px;';

        var distractors = [];
        while (distractors.length < 3) {
            var cand = window.Utils.randomInt(Math.max(1, this.missingNumber - 4), Math.min(30, this.missingNumber + 4));
            if (cand !== this.missingNumber && distractors.indexOf(cand) === -1) {
                distractors.push(cand);
            }
        }

        var allChoices = [this.missingNumber].concat(distractors);
        allChoices = window.Utils.shuffle(allChoices);

        allChoices.forEach(function(choice) {
            var btn = window.Utils.createElement('button', 'order-choice-btn', String(choice));
            btn.style.cssText =
                'padding:14px 6px;border:4px solid #00897B;border-radius:20px;background:white;' +
                'color:#004D40;font-size:clamp(24px, 5.5vw, 38px);font-weight:900;cursor:pointer;' +
                'box-shadow:0 4px 12px rgba(0,0,0,0.12);transition:transform 0.15s;user-select:none;';

            btn.addEventListener('click', function() {
                if (btn.dataset.disabled === 'true') return;

                if (choice === self.missingNumber) {
                    var allBtns = optionsContainer.querySelectorAll('button');
                    allBtns.forEach(function(b) { b.dataset.disabled = 'true'; });

                    btn.style.background = '#4CAF50';
                    btn.style.borderColor = '#2E7D32';
                    btn.style.color = 'white';

                    // Vagon içine yerleşsin
                    if (missingSlotEl) {
                        missingSlotEl.textContent = String(choice);
                        missingSlotEl.style.background = '#4CAF50';
                        missingSlotEl.style.borderColor = '#2E7D32';
                        missingSlotEl.style.color = 'white';
                        missingSlotEl.style.borderStyle = 'solid';
                        window.Utils.bounceElement(missingSlotEl);
                    }

                    window.AudioManager.playCorrect();
                    window.speechSynthesis.cancel();
                    window.AudioManager.speakNumber(choice);
                    self.showCorrectFeedback(trainContainer);

                    setTimeout(function() {
                        self.showCorrectOverlay(String(choice) + ' Harika! 🎉');
                        setTimeout(function() {
                            self.nextRound();
                        }, 1600);
                    }, 400);
                } else {
                    btn.style.background = '#F44336';
                    btn.style.borderColor = '#C62828';
                    btn.style.color = 'white';

                    window.AudioManager.playWrong();
                    window.AudioManager.playZort();
                    window.Utils.shakeElement(btn);

                    setTimeout(function() {
                        btn.style.background = 'white';
                        btn.style.borderColor = '#00897B';
                        btn.style.color = '#004D40';
                    }, 800);
                }
            });

            optionsContainer.appendChild(btn);
        });

        this.gameArea.appendChild(optionsContainer);
    };

    NumberOrderGame.prototype.destroy = function() {
        window.BaseGame.prototype.destroy.call(this);
    };

    window.NumberOrderGame = NumberOrderGame;
})();
