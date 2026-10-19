(function () {
    'use strict';

    /**
     * Hece Treni 🚂
     * Harfleri birleştirerek hece oluşturma oyunu
     */
    function SyllableTrainGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'syllable-train';
        this.targetSyllable = '';
        this.completed = false;
        this.car1 = null;
        this.car2 = null;
        this.slot1 = null;
        this.slot2 = null;
        this.carSize = 80;
        this._lastSyllable = null;
        this._hintTimeout = null;
        this.selectedCar = null;
    }

    SyllableTrainGame.prototype = Object.create(window.BaseGame.prototype);
    SyllableTrainGame.prototype.constructor = SyllableTrainGame;

    SyllableTrainGame.prototype.init = function () {
        window.BaseGame.prototype.init.call(this);
        
        this.helpText = 'Harf vagonlarını trenin arkasındaki boş yuvalara sürükle veya dokunarak yerleştir!';
        this.helpIcon = '🚂';
        this.createHeader('Hece Treni 🚂');

        var self = this;
        var allSyls = window.Utils.shuffle(window.GameData.generateSyllables(6).slice());
        var exSyls = allSyls.slice(0, 3);
        var examples = exSyls.map(function(s) {
            var obj = window.GameData.getSyllableObject(s.text);
            return {
                text: s.letters[0].toUpperCase() + ' + ' + s.letters[1].toUpperCase() + ' = ' + s.text.toUpperCase() + ' (' + obj.word + ')',
                type: 'syllable',
                sound: s.text,
                emoji: obj.emoji,
                asset: obj.asset
            };
        });

        this.showIntro({
            title: 'Hece Treni! 🚂',
            description: 'Trenin arkasındaki vagonlara harfleri koyarak heceyi ve sevimli nesnesini oluşturalım!\nVagonları sürükleyebilir veya dokunup yuvaya yerleştirebilirsin.',
            voiceText: 'Harfleri trene yerleştir ve heceyi oluştur!',
            icon: '🚂',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    SyllableTrainGame.prototype.startGameplay = function () {
        this.container.innerHTML = '';
        this.createHeader('Hece Treni 🚂');
        this.updateDimensions();
        
        this.gameArea = window.Utils.createElement('div', 'game-area syllable-train-area');
        this.gameArea.style.cssText =
            'position:relative;width:100%;height:100%;display:flex;flex-direction:column;' +
            'align-items:center;justify-content:space-evenly;padding:12px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);
        
        this.startRound();
    };

    SyllableTrainGame.prototype.startRound = function () {
        this.gameArea.innerHTML = '';
        this.completed = false;
        this.selectedCar = null;
        if (this._hintTimeout) clearTimeout(this._hintTimeout);
        this.updateDimensions();
        
        var allSyllables = window.GameData.generateSyllables(this.maxGroup);
        var picked = window.GameData.getNextFromDeck('syllable-train-deck', allSyllables);
        this.targetSyllable = picked.text;
        var firstLetter = picked.letters[0];
        var secondLetter = picked.letters[1];
        var sylObj = window.GameData.getSyllableObject(this.targetSyllable);
        
        var areaW = this.gameArea.clientWidth || window.innerWidth;
        var areaH = this.gameArea.clientHeight || window.innerHeight;
        var carSize = Math.max(54, Math.min(areaW / 4.2, areaH / 4.6, 92));
        this.carSize = carSize;

        // 1. Üst Kısım: Hece Nesnesi + İpucu Kartı
        var topBanner = window.Utils.createElement('div', 'syllable-station-banner');
        topBanner.style.cssText =
            'display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.92);' +
            'padding:8px 20px;border-radius:24px;box-shadow:0 6px 16px rgba(0,0,0,0.18);cursor:pointer;';

        var objImg = window.SvgLetters.createEmojiImage(sylObj.emoji, Math.round(carSize * 0.78), sylObj.asset);
        topBanner.appendChild(objImg);

        var textCol = window.Utils.createElement('div', '');
        textCol.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;';
        var hintTitle = window.Utils.createElement('div', 'syllable-hint-title');
        hintTitle.textContent = window.Utils.toUpperTR(firstLetter) + ' + ' + window.Utils.toUpperTR(secondLetter) + ' = ' + window.Utils.toUpperTR(this.targetSyllable);
        hintTitle.style.cssText = 'font-size:clamp(20px, 4.2vw, 30px);font-weight:900;color:#0277BD;';

        var hintWord = window.Utils.createElement('div', 'syllable-hint-word');
        hintWord.textContent = '✨ ' + sylObj.word + ' (' + window.Utils.toUpperTR(this.targetSyllable) + ')';
        hintWord.style.cssText = 'font-size:clamp(13px, 2.6vw, 17px);font-weight:800;color:#546E7A;';

        textCol.appendChild(hintTitle);
        textCol.appendChild(hintWord);
        topBanner.appendChild(textCol);

        topBanner.addEventListener('click', function() {
            window.Utils.celebrateElement(topBanner);
            window.speechSynthesis.cancel();
            window.AudioManager.speakSyllable(picked.text);
        });
        this.gameArea.appendChild(topBanner);

        // 2. Orta Kısım: Tren İstasyonu / Ray Alanı
        var stationContainer = window.Utils.createElement('div', 'train-station');
        stationContainer.style.cssText =
            'position:relative;width:100%;max-width:' + (carSize * 4.2) + 'px;' +
            'height:' + (carSize * 1.3) + 'px;display:flex;align-items:center;justify-content:center;' +
            'gap:clamp(4px, 1vw, 8px);padding:6px;box-sizing:border-box;' +
            'background:rgba(0,0,0,0.12);border-radius:22px;border-bottom:6px solid #546E7A;';
        this.gameArea.appendChild(stationContainer);

        var engine = window.SvgLetters.createTrainCar('🚂', carSize, '#0288D1', true);
        engine.style.flexShrink = '0';
        stationContainer.appendChild(engine);

        var slot1 = window.Utils.createElement('div', 'train-slot slot-1');
        slot1.style.cssText =
            'width:' + carSize + 'px;height:' + (carSize * 0.8) + 'px;flex-shrink:0;' +
            'border:3px dashed rgba(255,255,255,0.85);border-radius:14px;' +
            'background:rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;' +
            'box-sizing:border-box;cursor:pointer;transition:all 0.2s;';
        slot1.dataset.targetId = '1';
        stationContainer.appendChild(slot1);

        var slot2 = window.Utils.createElement('div', 'train-slot slot-2');
        slot2.style.cssText =
            'width:' + carSize + 'px;height:' + (carSize * 0.8) + 'px;flex-shrink:0;' +
            'border:3px dashed rgba(255,255,255,0.85);border-radius:14px;' +
            'background:rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;' +
            'box-sizing:border-box;cursor:pointer;transition:all 0.2s;';
        slot2.dataset.targetId = '2';
        stationContainer.appendChild(slot2);

        // 3. Alt Kısım: Sürüklenebilir / Dokunulabilir Harf Vagonları Alanı
        var poolContainer = window.Utils.createElement('div', 'car-pool-area');
        poolContainer.style.cssText =
            'position:relative;width:100%;max-width:' + (carSize * 4) + 'px;' +
            'height:' + (carSize * 1.45) + 'px;display:flex;align-items:center;justify-content:space-around;' +
            'padding:10px;box-sizing:border-box;background:rgba(255,255,255,0.18);border-radius:24px;';
        this.gameArea.appendChild(poolContainer);

        var car1Color = window.GameData.getLetterColor(firstLetter) || '#FF9800';
        var car2Color = window.GameData.getLetterColor(secondLetter) || '#4CAF50';
        
        var car1 = window.SvgLetters.createTrainCar(firstLetter, carSize, car1Color, false);
        var car2 = window.SvgLetters.createTrainCar(secondLetter, carSize, car2Color, false);
        
        car1.dataset.targetId = '1';
        car1.dataset.letter = firstLetter;
        car2.dataset.targetId = '2';
        car2.dataset.letter = secondLetter;

        var letters = [car1, car2];
        if (Math.random() > 0.5) letters.reverse();

        letters.forEach(function(cEl) {
            cEl.style.boxShadow = '0 6px 14px rgba(0,0,0,0.2)';
            cEl.style.borderRadius = '12px';
            poolContainer.appendChild(cEl);
        });

        this.car1 = car1;
        this.car2 = car2;
        this.slot1 = slot1;
        this.slot2 = slot2;
        this.stationContainer = stationContainer;
        this.poolContainer = poolContainer;
        this.currentSylObj = sylObj;

        this.setupCarInteraction(car1, slot1);
        this.setupCarInteraction(car2, slot2);

        setTimeout(function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speak(firstLetter + ' ve ' + secondLetter + ' harflerini birleştir, ' + picked.text, 0.8, 1.05);
        }, 450);
    };

    SyllableTrainGame.prototype.setupCarInteraction = function(carEl, targetSlot) {
        var self = this;
        var isDragging = false;
        var isSnapped = false;
        var startPointerX = 0, startPointerY = 0;

        carEl.addEventListener('click', function() {
            if (isSnapped || self.completed || isDragging) return;
            self.selectCarForPlacement(carEl, targetSlot);
        });

        targetSlot.addEventListener('click', function() {
            if (self.selectedCar === carEl && !isSnapped && !self.completed) {
                isSnapped = true;
                self.snapCarIntoSlot(carEl, targetSlot);
                self.selectedCar = null;
            }
        });

        function onPointerStart(e) {
            if (isSnapped || self.completed) return;
            
            var touch = e.touches ? e.touches[0] : e;
            startPointerX = touch.clientX;
            startPointerY = touch.clientY;

            isDragging = true;
            carEl.style.zIndex = '1000';
            carEl.style.transform = 'scale(1.15)';
            carEl.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';

            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(carEl.dataset.letter);

            window.addEventListener('mousemove', onPointerMove, { passive: false });
            window.addEventListener('mouseup', onPointerEnd);
            window.addEventListener('touchmove', onPointerMove, { passive: false });
            window.addEventListener('touchend', onPointerEnd);

            if (e.cancelable) e.preventDefault();
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            if (e.cancelable) e.preventDefault();

            var touch = e.touches ? e.touches[0] : e;
            var dx = touch.clientX - startPointerX;
            var dy = touch.clientY - startPointerY;

            carEl.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0) scale(1.15)';
        }

        function onPointerEnd() {
            if (!isDragging) return;
            isDragging = false;

            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('mouseup', onPointerEnd);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('touchend', onPointerEnd);

            var carRect = carEl.getBoundingClientRect();
            var slotRect = targetSlot.getBoundingClientRect();

            var carCenterX = carRect.left + carRect.width / 2;
            var carCenterY = carRect.top + carRect.height / 2;
            var slotCenterX = slotRect.left + slotRect.width / 2;
            var slotCenterY = slotRect.top + slotRect.height / 2;

            var dist = window.Utils.distance(carCenterX, carCenterY, slotCenterX, slotCenterY);

            if (dist < self.carSize * 1.35) {
                isSnapped = true;
                self.snapCarIntoSlot(carEl, targetSlot);
            } else {
                window.AudioManager.playWrong();
                window.Utils.shakeElement(carEl);

                carEl.style.transition = 'transform 0.25s ease-out';
                carEl.style.transform = 'translate3d(0, 0, 0) scale(1)';
                setTimeout(function() {
                    carEl.style.transition = '';
                    carEl.style.zIndex = '1';
                    carEl.style.boxShadow = '0 6px 14px rgba(0,0,0,0.2)';
                }, 250);
            }
        }

        carEl.addEventListener('mousedown', onPointerStart);
        carEl.addEventListener('touchstart', onPointerStart, { passive: false });
    };

    SyllableTrainGame.prototype.selectCarForPlacement = function(carEl, targetSlot) {
        if (this.selectedCar === carEl) {
            this.selectedCar = null;
            carEl.style.transform = 'scale(1)';
        } else {
            if (this.selectedCar) {
                this.selectedCar.style.transform = 'scale(1)';
            }
            this.selectedCar = carEl;
            carEl.style.transform = 'scale(1.15)';
            carEl.style.boxShadow = '0 8px 18px rgba(0,0,0,0.25)';
            window.AudioManager.playClick();
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(carEl.dataset.letter);

            targetSlot.style.borderColor = '#00E676';
            targetSlot.style.background = 'rgba(0, 230, 118, 0.25)';
        }
    };

    SyllableTrainGame.prototype.snapCarIntoSlot = function(carEl, slot) {
        carEl.dataset.snapped = 'true';
        carEl.style.transform = 'none';
        carEl.style.transition = 'all 0.2s ease-out';
        carEl.style.cursor = 'default';
        carEl.style.boxShadow = 'none';
        carEl.style.zIndex = '10';

        slot.innerHTML = '';
        slot.appendChild(carEl);
        slot.style.border = '3px solid #4CAF50';
        slot.style.background = 'rgba(76, 175, 80, 0.35)';

        window.AudioManager.playPop();
        window.AudioManager.playCorrect();
        window.Utils.bounceElement(slot);

        this.checkConnection();
    };

    SyllableTrainGame.prototype.checkConnection = function () {
        if (this.completed) return;
        var self = this;

        if (this.car1.dataset.snapped === 'true' && this.car2.dataset.snapped === 'true') {
            this.completed = true;
            this.showCorrectFeedback(this.stationContainer);
            window.Utils.celebrateElement(this.stationContainer);
            
            window.speechSynthesis.cancel();
            setTimeout(function () {
                var objWord = self.currentSylObj ? self.currentSylObj.word : '';
                window.AudioManager.speak(self.targetSyllable + ', ' + objWord, 0.85, 1.1);
                self.showCorrectOverlay(window.Utils.toUpperTR(self.targetSyllable) + ' 🚂 ' + objWord);
            }, 300);
            
            setTimeout(function () {
                self.startRound();
            }, 2100);
        }
    };

    SyllableTrainGame.prototype.destroy = function () {
        if (this._hintTimeout) clearTimeout(this._hintTimeout);
        window.BaseGame.prototype.destroy.call(this);
    };

    window.SyllableTrainGame = SyllableTrainGame;
})();
