(function() {
    'use strict';

    /**
     * Cümle Treni 🚃
     * Kelimeleri sıraya dizerek anlamlı ve resimli cümleler oluşturma oyunu
     */
    function SentenceTrainGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.currentSentence = null;
        this.placedWords = 0;
        this.slots = [];
        this.wordCards = [];
    }

    SentenceTrainGame.prototype = Object.create(window.BaseGame.prototype);
    SentenceTrainGame.prototype.constructor = SentenceTrainGame;

    SentenceTrainGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Aşağıdaki kelime vagonlarına dokunarak veya sürükleyerek yukarıdaki cümle trenine doğru sırayla yerleştir!';
        this.helpIcon = '🚃';
        this.createHeader('Cümle Treni 🚃');

        var self = this;
        var allSentences = window.Utils.shuffle(window.GameData.getAvailableSentences(6).slice());
        var exList = allSentences.slice(0, 3).map(function(s) {
            return {
                text: s.text,
                sound: s.text,
                type: 'sentence',
                emoji: s.emoji || '🚃',
                asset: s.asset || null
            };
        });

        this.showIntro({
            title: 'Cümle Treni! 🚃',
            icon: '🚃',
            description: 'Kelimeleri sırayla tren vagonlarına yerleştirerek eğlenceli cümleler kuralım!\nKelimelere dokunabilir veya sürükleyebilirsin.',
            voiceText: 'Kelimeleri sırayla yerleştirerek cümleyi oluştur!',
            examples: exList,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    SentenceTrainGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Cümle Treni 🚃');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area sentence-train-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;padding:14px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this.setupRound();
    };

    SentenceTrainGame.prototype.setupRound = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        this.slots = [];
        this.wordCards = [];
        this.placedWords = 0;
        this.updateDimensions();

        var sentences = window.GameData.getAvailableSentences(this.maxGroup);
        this.currentSentence = window.GameData.getNextFromDeck('sentence-train-deck', sentences);
        var words = this.currentSentence.words.slice();

        // 1. Üst Kısım: Görsel + Cümle Dinleme Kartı
        var banner = window.Utils.createElement('div', 'sentence-banner');
        banner.style.cssText =
            'display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.95);' +
            'padding:10px 22px;border-radius:26px;box-shadow:0 8px 20px rgba(0,0,0,0.16);cursor:pointer;';

        var imgEl = window.SvgLetters.createEmojiImage(
            this.currentSentence.emoji || '🚃',
            Math.min(86, Math.max(62, Math.round(this.dims.height * 0.14))),
            this.currentSentence.asset
        );
        banner.appendChild(imgEl);
        this.bannerImg = imgEl;

        var rightCol = window.Utils.createElement('div', '');
        rightCol.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;gap:6px;';

        var listenBtn = window.Utils.createElement('button', 'sentence-listen-btn', '🔊 Cümleyi Dinle');
        listenBtn.style.cssText =
            'border:none;border-radius:20px;background:#4CAF50;color:white;font-weight:900;' +
            'padding:8px 18px;font-size:clamp(14px, 2.8vw, 18px);cursor:pointer;box-shadow:0 4px 10px rgba(76,175,80,0.35);';
        rightCol.appendChild(listenBtn);

        var hintText = window.Utils.createElement('div', '', '👆 Kelimeleri sırayla yerleştir!');
        hintText.style.cssText = 'font-size:clamp(12px, 2.4vw, 15px);font-weight:800;color:#546E7A;';
        rightCol.appendChild(hintText);

        banner.appendChild(rightCol);
        banner.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakSentence(self.currentSentence.text);
            window.Utils.celebrateElement(imgEl);
        });
        this.gameArea.appendChild(banner);

        // 2. Orta Kısım: Tren İstasyonu Yuvaları
        var trainRow = window.Utils.createElement('div', 'sentence-slots-row');
        trainRow.style.cssText =
            'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;' +
            'background:rgba(0,0,0,0.15);padding:14px 18px;border-radius:24px;border-bottom:6px solid #455A64;width:100%;max-width:680px;box-sizing:border-box;';

        var loco = window.Utils.createElement('div', '', '🚂');
        loco.style.cssText = 'font-size:clamp(34px, 7vw, 50px);margin-right:4px;';
        trainRow.appendChild(loco);

        var slotW = Math.min(145, Math.max(88, Math.floor((this.dims.width - 110) / Math.max(3, words.length))));
        var slotH = Math.max(58, Math.min(78, Math.round(slotW * 0.56)));

        for (var i = 0; i < words.length; i++) {
            var slot = window.Utils.createElement('div', 'sentence-slot');
            slot.style.cssText =
                'min-width:' + slotW + 'px;height:' + slotH + 'px;padding:4px 10px;' +
                'border:3px dashed rgba(255,255,255,0.85);border-radius:16px;' +
                'background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;' +
                'font-size:18px;font-weight:900;color:rgba(255,255,255,0.7);box-sizing:border-box;';
            slot.textContent = (i + 1) + '.';
            slot.dataset.word = words[i];
            slot.dataset.index = i;
            this.slots.push(slot);
            trainRow.appendChild(slot);
        }
        this.gameArea.appendChild(trainRow);

        // 3. Alt Kısım: Karışık Kelime Kartları
        var poolRow = window.Utils.createElement('div', 'sentence-pool-row');
        poolRow.style.cssText =
            'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:center;width:100%;max-width:650px;min-height:85px;';
        this.gameArea.appendChild(poolRow);

        var shuffledWords = window.Utils.shuffle(words.slice());
        // Kelimeler aynı sırada geldiyse ters çevir
        if (shuffledWords.length > 1 && shuffledWords.join(' ') === words.join(' ')) {
            shuffledWords.reverse();
        }

        shuffledWords.forEach(function(word) {
            var color = window.GameData.getRandomColor();
            var card = window.Utils.createElement('button', 'sentence-word-card');
            card.textContent = window.Utils.toUpperTR(word);
            card.style.cssText =
                'min-width:' + slotW + 'px;height:' + slotH + 'px;padding:8px 18px;' +
                'border-radius:18px;border:3px solid white;background:' + color + ';color:white;' +
                'font-size:clamp(18px, 4vw, 26px);font-weight:900;cursor:pointer;user-select:none;' +
                'box-shadow:0 6px 14px rgba(0,0,0,0.22);touch-action:none;transition:transform 0.15s;';
            card.dataset.word = word;

            self.makeInteractiveWord(card);
            self.wordCards.push(card);
            poolRow.appendChild(card);
        });

        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speakSentence(self.currentSentence.text);
        }, 400);
    };

    SentenceTrainGame.prototype.placeWordInSlot = function(card, slot) {
        var self = this;
        slot.dataset.filled = 'true';
        card.dataset.placed = 'true';
        card.style.position = 'static';
        card.style.left = 'auto';
        card.style.top = 'auto';
        card.style.transform = 'none';
        card.style.zIndex = '1';
        card.style.cursor = 'default';
        card.style.boxShadow = 'none';

        slot.innerHTML = '';
        slot.style.border = '3px solid #4CAF50';
        slot.style.background = 'rgba(76,175,80,0.3)';
        slot.appendChild(card);

        window.AudioManager.playCorrect();
        window.speechSynthesis.cancel();
        window.AudioManager.speakWord(card.dataset.word);
        window.Utils.bounceElement(card);

        this.placedWords++;
        if (this.placedWords === this.slots.length) {
            if (this.bannerImg) window.Utils.celebrateElement(this.bannerImg);
            setTimeout(function() {
                self.showCorrectFeedback(self.gameArea);
                window.speechSynthesis.cancel();
                window.AudioManager.speakSentence(self.currentSentence.text);
                self.showCorrectOverlay(self.currentSentence.text + ' 🎉');
                setTimeout(function() {
                    self.transitionToNextRound(function() {
                        self.setupRound();
                    });
                }, 2200);
            }, 450);
        }
    };

    SentenceTrainGame.prototype.makeInteractiveWord = function(el) {
        var self = this;
        var startX = 0, startY = 0, origLeft = 0, origTop = 0;
        var dragging = false;
        var moved = false;

        var onStart = function(e) {
            if (el.dataset.placed === 'true') return;
            if (e.cancelable) e.preventDefault();
            dragging = true;
            moved = false;

            var pt = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
            startX = pt.clientX;
            startY = pt.clientY;
            var rect = el.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;
        };

        var onMove = function(e) {
            if (!dragging) return;
            var pt = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
            var dx = pt.clientX - startX;
            var dy = pt.clientY - startY;

            if (!moved && Math.hypot(dx, dy) > 8) {
                moved = true;
                el.style.position = 'fixed';
                el.style.left = origLeft + 'px';
                el.style.top = origTop + 'px';
                el.style.zIndex = '1000';
                el.style.transform = 'scale(1.1)';
            }

            if (moved) {
                if (e.cancelable) e.preventDefault();
                el.style.left = (origLeft + dx) + 'px';
                el.style.top = (origTop + dy) + 'px';
            }
        };

        var onEnd = function() {
            if (!dragging) return;
            dragging = false;

            // Dokunarak yerleştirme (Tap-to-Place)
            if (!moved) {
                var nextSlot = null;
                for (var s = 0; s < self.slots.length; s++) {
                    if (self.slots[s].dataset.filled !== 'true') {
                        nextSlot = self.slots[s];
                        break;
                    }
                }
                if (nextSlot && nextSlot.dataset.word === el.dataset.word) {
                    self.placeWordInSlot(el, nextSlot);
                } else {
                    window.AudioManager.playWrong();
                    window.Utils.shakeElement(el);
                }
                return;
            }

            var rect = el.getBoundingClientRect();
            var centerX = rect.left + rect.width / 2;
            var centerY = rect.top + rect.height / 2;
            var matchedSlot = null;

            for (var i = 0; i < self.slots.length; i++) {
                var slot = self.slots[i];
                if (slot.dataset.filled === 'true') continue;
                var slotRect = slot.getBoundingClientRect();
                var pad = 30;
                if (centerX >= slotRect.left - pad && centerX <= slotRect.right + pad &&
                    centerY >= slotRect.top - pad && centerY <= slotRect.bottom + pad) {
                    matchedSlot = slot;
                    break;
                }
            }

            if (matchedSlot && matchedSlot.dataset.word === el.dataset.word) {
                self.placeWordInSlot(el, matchedSlot);
            } else {
                window.AudioManager.playWrong();
                window.Utils.shakeElement(el);
                el.style.position = 'static';
                el.style.left = 'auto';
                el.style.top = 'auto';
                el.style.transform = 'none';
                el.style.zIndex = '1';
            }
        };

        el.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        el.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    };

    SentenceTrainGame.prototype.destroy = function() {
        window.BaseGame.prototype.destroy.call(this);
    };

    window.SentenceTrainGame = SentenceTrainGame;
})();
