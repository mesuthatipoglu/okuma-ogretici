(function() {
    'use strict';

    /**
     * Acıkan Dinozor 🦖
     * Sevimli dinozora istediği sayıda meyve, tatlı ve yiyecek yedirme oyunu.
     * Ekran boyutuna göre tüm bileşenleri hesaplar ve oyun alanına sığdırır.
     */
    function MonsterFeedGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'monster-feed';
        this.level = (options && options.maxGroup) ? options.maxGroup : 1;
        this.targetCount = 3;
        this.fedCount = 0;
        this.currentFood = null;
        this._onResize = null;
    }

    MonsterFeedGame.prototype = Object.create(window.BaseGame.prototype);
    MonsterFeedGame.prototype.constructor = MonsterFeedGame;

    var FOOD_ITEMS = [
        { word: 'elma', emoji: '🍎', image: 'assets/images/objects/elma.svg' },
        { word: 'çilek', emoji: '🍓', image: 'assets/images/objects/cilek.svg' },
        { word: 'muz', emoji: '🍌', image: 'assets/images/objects/muz.svg' },
        { word: 'dondurma', emoji: '🍦', image: 'assets/images/objects/dondurma.svg' },
        { word: 'karpuz', emoji: '🍉', image: 'assets/images/objects/karpuz.svg' },
        { word: 'ananas', emoji: '🍍', image: 'assets/images/objects/ananas.svg' },
        { word: 'pasta', emoji: '🎂', image: 'assets/images/objects/pasta.svg' },
        { word: 'pizza', emoji: '🍕', image: 'assets/images/objects/pizza.svg' },
        { word: 'havuç', emoji: '🥕', image: 'assets/images/objects/havuc.svg' },
        { word: 'armut', emoji: '🍐', image: 'assets/images/objects/armut.svg' },
        { word: 'üzüm', emoji: '🍇', image: 'assets/images/objects/uzum.svg' },
        { word: 'kiraz', emoji: '🍒', image: 'assets/images/objects/kiraz.svg' }
    ];

    MonsterFeedGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Sevimli Dino çok acıkmış! Dinozorun istediği sayıda yiyeceğe tek tek dokunarak onu besle!';
        this.helpIcon = '🦖';
        this.createHeader('Acıkan Dinozor 🦖');

        var self = this;
        this.showIntro({
            title: 'Acıkan Dinozor! 🦖',
            icon: '🦖',
            description: 'Sevimli Dinozor çok acıkmış!\nİstediği sayıda meyve ve dondurmaya tek tek dokunarak onu besle!',
            voiceText: 'Sevimli dinozora istediği sayıda yiyecek yedir!',
            examples: [
                { text: '3 Elma Yedir', sound: '3', emoji: '🍎', image: 'assets/images/objects/elma.svg' },
                { text: '5 Çilek Yedir', sound: '5', emoji: '🍓', image: 'assets/images/objects/cilek.svg' },
                { text: '4 Dondurma Yedir', sound: '4', emoji: '🍦', image: 'assets/images/objects/dondurma.svg' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    MonsterFeedGame.prototype.startGameplay = function() {
        var self = this;
        this.container.innerHTML = '';
        this.createHeader('Acıkan Dinozor 🦖');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area monster-feed-area');
        this.gameArea.style.cssText =
            'position:relative;width:100%;height:100%;display:flex;flex-direction:column;' +
            'align-items:center;justify-content:space-between;padding:10px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this._onResize = function() {
            if (self.running && self.currentFood) {
                self.renderRoundLayout();
            }
        };
        window.addEventListener('resize', this._onResize);

        this.nextRound();
    };

    MonsterFeedGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        this.fedCount = 0;

        var maxTarget = this.level >= 2 ? 10 : 7;
        var possibleCounts = [];
        for (var c = 1; c <= maxTarget; c++) possibleCounts.push(c);

        this.targetCount = window.GameData.pickUniqueItems('dino-counts-' + this.level, possibleCounts, 1)[0];
        this.currentFood = window.GameData.pickUniqueItems('dino-foods', FOOD_ITEMS, 1)[0];

        this.renderRoundLayout();

        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speak('Bana ' + self.targetCount + ' tane ' + self.currentFood.word + ' ver!', 0.88, 1.1);
        }, 350);
    };

    MonsterFeedGame.prototype.renderRoundLayout = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        this.updateDimensions();

        // Cihazın ekranına göre oyun alanını hesapla ve bileşenleri sığdır
        var rect = this.gameArea.getBoundingClientRect();
        var areaW = rect.width || this.gameArea.clientWidth || window.innerWidth;
        var areaH = rect.height || this.gameArea.clientHeight || (window.innerHeight - 60);
        var isLandscape = areaW > areaH * 1.25;

        this.gameArea.style.flexDirection = isLandscape ? 'row' : 'column';

        var dinoBoxW = isLandscape ? Math.floor(areaW * 0.42) : Math.min(480, areaW - 20);
        var dinoImgSize = isLandscape
            ? Math.min(135, Math.max(80, Math.floor(areaH * 0.38)))
            : Math.min(115, Math.max(70, Math.floor(areaH * 0.22)));

        // 1. Dinozor Karakter Kartı ve Konuşma Balonu
        var dinoCard = window.Utils.createElement('div', 'dino-character-card');
        dinoCard.style.cssText =
            'width:' + dinoBoxW + 'px;background:rgba(255,255,255,0.95);border-radius:28px;padding:12px 18px;' +
            'display:flex;flex-direction:column;align-items:center;gap:8px;box-shadow:0 10px 26px rgba(0,0,0,0.2);' +
            'border:4px solid #66BB6A;box-sizing:border-box;flex-shrink:0;cursor:pointer;';

        var speechBubble = window.Utils.createElement('div', 'dino-speech-bubble');
        speechBubble.style.cssText =
            'background:#FFF8E1;border:3px solid #FFB300;border-radius:20px;padding:6px 16px;' +
            'font-size:clamp(15px, 3.2vw, 21px);font-weight:900;color:#E65100;text-align:center;width:100%;box-sizing:border-box;';
        speechBubble.textContent = '🦖 Bana ' + this.targetCount + ' tane ' + this.currentFood.word.toUpperCase() + ' yedir!';
        dinoCard.appendChild(speechBubble);

        var dinoRow = window.Utils.createElement('div', '');
        dinoRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:16px;';

        var dinoAvatar = window.SvgLetters.createObjectImage(
            { word: 'dinozor', emoji: '🦖', image: 'assets/images/objects/dinozor.svg' },
            dinoImgSize
        );
        dinoRow.appendChild(dinoAvatar);
        this.dinoAvatarEl = dinoAvatar;

        var counterBox = window.Utils.createElement('div', 'dino-counter-box');
        counterBox.style.cssText =
            'display:flex;flex-direction:column;align-items:center;background:#E8F5E9;padding:8px 16px;' +
            'border-radius:20px;border:3px solid #4CAF50;';
        var countBig = window.Utils.createElement('div', '', this.fedCount + ' / ' + this.targetCount);
        countBig.style.cssText = 'font-size:clamp(22px, 5vw, 34px);font-weight:900;color:#2E7D32;line-height:1;';
        this.countBigEl = countBig;
        var countSub = window.Utils.createElement('div', '', 'Yedirildi 🍽️');
        countSub.style.cssText = 'font-size:12px;font-weight:800;color:#388E3C;margin-top:2px;';
        counterBox.appendChild(countBig);
        counterBox.appendChild(countSub);
        dinoRow.appendChild(counterBox);

        dinoCard.appendChild(dinoRow);
        dinoCard.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speak('Bana ' + self.targetCount + ' tane ' + self.currentFood.word + ' ver!', 0.88, 1.1);
            window.Utils.celebrateElement(dinoAvatar);
        });
        this.gameArea.appendChild(dinoCard);

        // 2. Yiyecek Tepsisi (Tıklanarak Dinozora Uçan Yiyecekler)
        var totalTrayItems = Math.max(this.targetCount + 2, 6);
        var trayW = isLandscape ? Math.floor(areaW * 0.52) : Math.min(500, areaW - 20);
        var trayH = isLandscape ? Math.floor(areaH * 0.84) : Math.floor(areaH - (dinoImgSize + 125));
        trayH = Math.max(150, trayH);

        var cols = totalTrayItems <= 6 ? 3 : 4;
        var rows = Math.ceil(totalTrayItems / cols);
        var cellSize = Math.floor(Math.min((trayW - 40) / cols, (trayH - 36) / rows));
        cellSize = Math.max(54, Math.min(92, cellSize));

        var trayContainer = window.Utils.createElement('div', 'dino-food-tray');
        trayContainer.style.cssText =
            'width:' + trayW + 'px;max-height:' + trayH + 'px;background:rgba(255,255,255,0.88);' +
            'border-radius:26px;padding:12px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;' +
            'box-shadow:0 8px 20px rgba(0,0,0,0.15);border:4px solid #FFF59D;box-sizing:border-box;';

        for (var i = 0; i < totalTrayItems; i++) {
            (function(index) {
                var foodBtn = window.Utils.createElement('button', 'dino-food-item');
                foodBtn.style.cssText =
                    'width:' + cellSize + 'px;height:' + cellSize + 'px;border-radius:20px;background:white;' +
                    'border:3px solid #FFCA28;display:flex;align-items:center;justify-content:center;cursor:pointer;' +
                    'box-shadow:0 4px 10px rgba(0,0,0,0.12);transition:all 0.25s;padding:6px;box-sizing:border-box;';

                var foodSvg = window.SvgLetters.createObjectImage(self.currentFood, Math.round(cellSize * 0.74));
                foodBtn.appendChild(foodSvg);

                if (index < self.fedCount) {
                    foodBtn.dataset.eaten = 'true';
                    foodBtn.style.opacity = '0.2';
                    foodBtn.style.transform = 'scale(0.5)';
                    foodBtn.style.pointerEvents = 'none';
                }

                foodBtn.addEventListener('click', function() {
                    if (foodBtn.dataset.eaten === 'true' || self.fedCount >= self.targetCount) return;
                    foodBtn.dataset.eaten = 'true';
                    self.fedCount++;

                    foodBtn.style.transform = 'scale(1.35) translateY(-25px)';
                    foodBtn.style.opacity = '0.18';
                    foodBtn.style.pointerEvents = 'none';

                    if (self.countBigEl) {
                        self.countBigEl.textContent = self.fedCount + ' / ' + self.targetCount;
                    }
                    if (self.dinoAvatarEl) {
                        window.Utils.celebrateElement(self.dinoAvatarEl);
                    }

                    window.AudioManager.playPop();
                    window.speechSynthesis.cancel();
                    window.AudioManager.speakNumber(self.fedCount);

                    if (self.fedCount === self.targetCount) {
                        setTimeout(function() {
                            self.showCorrectFeedback(dinoCard);
                            self.showCorrectOverlay(self.targetCount + ' ' + window.Utils.toUpperTR(self.currentFood.word) + '! Afiyet Olsun! 🦖🎉');
                            setTimeout(function() {
                                self.nextRound();
                            }, 1900);
                        }, 450);
                    }
                });

                trayContainer.appendChild(foodBtn);
            })(i);
        }

        this.gameArea.appendChild(trayContainer);
    };

    MonsterFeedGame.prototype.destroy = function() {
        if (this._onResize) {
            window.removeEventListener('resize', this._onResize);
            this._onResize = null;
        }
        window.BaseGame.prototype.destroy.call(this);
    };

    window.MonsterFeedGame = MonsterFeedGame;
})();
