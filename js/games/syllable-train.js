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
        this.showIntro({
            title: 'Hece Treni! 🚂',
            description: 'Trenin arkasındaki vagonlara harfleri koyarak hece oluşturalım!\nVagonları sürükleyebilir veya dokunup yuvaya yerleştirebilirsin.',
            voiceText: 'Harfleri trene yerleştir ve heceyi oluştur!',
            icon: '🚂',
            examples: [
                { text: 'E + L = EL', type: 'syllable', sound: 'el', emoji: '🚂' },
                { text: 'L + A = LA', type: 'syllable', sound: 'la', emoji: '🚃' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    SyllableTrainGame.prototype.startGameplay = function () {
        this.container.innerHTML = '';
        this.createHeader('Hece Treni 🚂');
        
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
        
        var consonants = window.GameData.getAvailableConsonants(this.maxGroup);
        var vowels = window.GameData.getAvailableVowels(this.maxGroup);
        
        if (consonants.length === 0 || vowels.length === 0) {
            consonants = ['l'];
            vowels = ['e', 'a'];
        }
        
        // Tekrar eden heceyi engelle
        var attempts = 0;
        var c, v, isCv, newSyllable;
        do {
            c = window.Utils.randomItem(consonants);
            v = window.Utils.randomItem(vowels);
            isCv = Math.random() > 0.5;
            newSyllable = isCv ? c + v : v + c;
            attempts++;
        } while (newSyllable === this._lastSyllable && attempts < 20);
        
        this.targetSyllable = newSyllable;
        this._lastSyllable = newSyllable;
        
        var firstLetter = isCv ? c : v;
        var secondLetter = isCv ? v : c;
        
        // Adaptif boyut: Tren alanı (lokomotif + 2 vagon = ~3.6 * carSize)
        var areaW = this.gameArea.clientWidth || window.innerWidth;
        var areaH = this.gameArea.clientHeight || window.innerHeight;
        var carSize = Math.max(50, Math.min(areaW / 4.2, areaH / 4.5, 90));
        this.carSize = carSize;

        // 1. Üst Kısım: Hece İpucu (Gecikmeli Görünecek)
        var hintEl = window.Utils.createElement('div', 'syllable-hint');
        hintEl.textContent = '💡 ' + firstLetter.toUpperCase() + ' + ' + secondLetter.toUpperCase() + ' = ' + this.targetSyllable.toUpperCase();
        hintEl.style.cssText = 
            'font-size:clamp(16px, 3.8vw, 24px);font-weight:900;color:white;' +
            'background:rgba(0,0,0,0.3);padding:8px 22px;border-radius:20px;' +
            'opacity:0;transition:opacity 0.5s ease-in;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
        this.gameArea.appendChild(hintEl);
        
        this._hintTimeout = setTimeout(function() {
            if (hintEl.parentNode) {
                hintEl.style.opacity = '1';
            }
        }, 3000);

        // 2. Orta Kısım: Tren İstasyonu / Ray Alanı
        var stationContainer = window.Utils.createElement('div', 'train-station');
        stationContainer.style.cssText =
            'position:relative;width:100%;max-width:' + (carSize * 4.2) + 'px;' +
            'height:' + (carSize * 1.3) + 'px;display:flex;align-items:center;justify-content:center;' +
            'gap:clamp(4px, 1vw, 8px);padding:6px;box-sizing:border-box;' +
            'background:rgba(0,0,0,0.12);border-radius:22px;border-bottom:6px solid #546E7A;';
        this.gameArea.appendChild(stationContainer);

        // Lokomotif
        var engine = window.SvgLetters.createTrainCar('🚂', carSize, '#0288D1', true);
        engine.style.flexShrink = '0';
        stationContainer.appendChild(engine);

        // 1. Yuva (Sol)
        var slot1 = window.Utils.createElement('div', 'train-slot slot-1');
        slot1.style.cssText =
            'width:' + carSize + 'px;height:' + (carSize * 0.8) + 'px;flex-shrink:0;' +
            'border:3px dashed rgba(255,255,255,0.8);border-radius:14px;' +
            'background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;' +
            'box-sizing:border-box;cursor:pointer;transition:all 0.2s;';
        slot1.dataset.targetId = '1';
        stationContainer.appendChild(slot1);

        // 2. Yuva (Sağ)
        var slot2 = window.Utils.createElement('div', 'train-slot slot-2');
        slot2.style.cssText =
            'width:' + carSize + 'px;height:' + (carSize * 0.8) + 'px;flex-shrink:0;' +
            'border:3px dashed rgba(255,255,255,0.8);border-radius:14px;' +
            'background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;' +
            'box-sizing:border-box;cursor:pointer;transition:all 0.2s;';
        slot2.dataset.targetId = '2';
        stationContainer.appendChild(slot2);

        // 3. Alt Kısım: Sürüklenebilir / Dokunulabilir Harf Vagonları Alanı
        var poolContainer = window.Utils.createElement('div', 'car-pool-area');
        poolContainer.style.cssText =
            'position:relative;width:100%;max-width:' + (carSize * 4) + 'px;' +
            'height:' + (carSize * 1.5) + 'px;display:flex;align-items:center;justify-content:space-around;' +
            'padding:10px;box-sizing:border-box;background:rgba(255,255,255,0.15);border-radius:24px;';
        this.gameArea.appendChild(poolContainer);

        var car1Color = window.GameData.getLetterColor(firstLetter) || '#FF9800';
        var car2Color = window.GameData.getLetterColor(secondLetter) || '#4CAF50';
        
        var car1 = window.SvgLetters.createTrainCar(firstLetter, carSize, car1Color, false);
        var car2 = window.SvgLetters.createTrainCar(secondLetter, carSize, car2Color, false);
        
        car1.dataset.targetId = '1';
        car1.dataset.letter = firstLetter;
        car2.dataset.targetId = '2';
        car2.dataset.letter = secondLetter;

        // Vagonları yerleştir
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

        // Hem sürükleme hem dokunma etkileşimi ekle
        this.setupCarInteraction(car1, slot1);
        this.setupCarInteraction(car2, slot2);

        // Başlangıç sesli yönergesi
        setTimeout(function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speak(firstLetter + " ve " + secondLetter + " hecesini oluştur", 0.75, 1.05);
        }, 500);
    };

    /**
     * Vagon etkileşimi: Parmağın ucunda tam senkron sürükleme VE dokunarak yerleştirme (Tap-to-Place)
     */
    SyllableTrainGame.prototype.setupCarInteraction = function(carEl, targetSlot) {
        var self = this;
        var isDragging = false;
        var isSnapped = false;
        var startPointerX = 0, startPointerY = 0;
        var origRect = null;
        var origParent = null;

        // Dokunma (Tap-to-Place)
        carEl.addEventListener('click', function(e) {
            if (isSnapped || self.completed || isDragging) return;
            self.selectCarForPlacement(carEl, targetSlot);
        });

        targetSlot.addEventListener('click', function() {
            if (self.selectedCar === carEl && !isSnapped && !self.completed) {
                self.snapCarIntoSlot(carEl, targetSlot);
                self.selectedCar = null;
            }
        });

        // Sürükleme (Drag & Drop)
        function onPointerStart(e) {
            if (isSnapped || self.completed) return;
            
            var touch = e.touches ? e.touches[0] : e;
            startPointerX = touch.clientX;
            startPointerY = touch.clientY;
            origRect = carEl.getBoundingClientRect();
            origParent = carEl.parentNode;

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

            // GPU destekli translate: hiçbir zaman sıçrama yapmaz, tam parmakla hareket eder!
            carEl.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0) scale(1.15)';
        }

        function onPointerEnd(e) {
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

            // Genişletilmiş temas mesafesi (size * 1.3)
            if (dist < self.carSize * 1.3) {
                // Yuvaya oturt!
                isSnapped = true;
                self.snapCarIntoSlot(carEl, targetSlot);
            } else {
                // Eski yerine yumuşakça geri dön
                window.AudioManager.playWrong();
                window.AudioManager.playZort();
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
        var self = this;
        if (this.selectedCar === carEl) {
            this.selectedCar = null;
            carEl.style.transform = 'scale(1)';
            carEl.style.border = 'none';
        } else {
            if (this.selectedCar) {
                this.selectedCar.style.transform = 'scale(1)';
                this.selectedCar.style.border = 'none';
            }
            this.selectedCar = carEl;
            carEl.style.transform = 'scale(1.15)';
            carEl.style.boxShadow = '0 8px 18px rgba(0,0,0,0.25)';
            window.AudioManager.playClick();
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(carEl.dataset.letter);

            // Hedef yuvayı vurgula
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
            
            window.speechSynthesis.cancel();
            setTimeout(function () {
                window.AudioManager.speakSyllable(self.targetSyllable);
                self.showCorrectOverlay(self.targetSyllable.toUpperCase() + ' 🚂💨');
            }, 300);
            
            setTimeout(function () {
                self.startRound();
            }, 2000);
        }
    };

    SyllableTrainGame.prototype.destroy = function () {
        if (this._hintTimeout) clearTimeout(this._hintTimeout);
        window.BaseGame.prototype.destroy.call(this);
    };

    window.SyllableTrainGame = SyllableTrainGame;
})();
