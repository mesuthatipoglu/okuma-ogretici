(function() {
    function WordPuzzleGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.currentWord = null;
        this.slots = [];
        this.draggableCards = [];
        this.filledCount = 0;
    }

    WordPuzzleGame.prototype = Object.create(window.BaseGame.prototype);
    WordPuzzleGame.prototype.constructor = WordPuzzleGame;

    WordPuzzleGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        
        this.helpText = 'Hecelere dokunarak veya sürükleyerek yukarıdaki boş kutulara doğru sırayla yerleştir ve kelimeyi oluştur!';
        this.helpIcon = '🧩';
        this.createHeader('Kelime Yapboz 🧩');

        var self = this;
        var words = window.Utils.shuffle(window.GameData.getAllWords().slice());
        var exWords = words.slice(0, 3);
        var examples = exWords.map(function(w) {
            return {
                text: window.Utils.toUpperTR(w.word) + ' (' + w.syllables.join('-').toUpperCase() + ')',
                sound: w.word,
                type: 'word',
                emoji: w.emoji || '🧩',
                asset: w.asset || null
            };
        });

        this.showIntro({
            title: 'Kelimeleri Oluşturalım! 🧩',
            icon: '🧩',
            description: 'Kelimeleri hecelerine ayırdık! Aşağıdaki hecelere dokunarak veya kutulara sürükleyerek kelimeleri tamamla.',
            voiceText: 'Aşağıdaki heceleri kutucuklara yerleştir ve kelimeleri tamamla!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    WordPuzzleGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.updateDimensions();
        this.gameArea = window.Utils.createElement('div', 'game-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;position:relative;padding:14px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    WordPuzzleGame.prototype.nextRound = function() {
        var self = this;
        window.BaseGame.prototype.nextRound.call(this);
        this.filledCount = 0;
        this.slots = [];
        this.draggableCards = [];
        this.updateDimensions();
        
        var availableWords = window.GameData.getAllWords();
        this.currentWord = window.GameData.getNextFromDeck('word-puzzle-deck', availableWords);
        
        this.transitionToNextRound(function() {
            self.renderGame();
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentWord.word);
        });
    };

    WordPuzzleGame.prototype.renderGame = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        
        // 1. Üst Kısım: Vektör Resim ve Ses Dinleme
        var imageArea = window.Utils.createElement('div', 'puzzle-image-area');
        imageArea.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;';
        
        var imgSize = Math.min(115, Math.max(80, Math.round(this.dims.height * 0.2)));
        var emojiObj = window.SvgLetters.createEmojiImage(this.currentWord.emoji || '❓', imgSize, this.currentWord.asset);
        emojiObj.style.cursor = 'pointer';
        emojiObj.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentWord.word);
            window.Utils.celebrateElement(emojiObj);
        });
        imageArea.appendChild(emojiObj);
        this.currentImageEl = emojiObj;

        var soundHint = window.Utils.createElement('button', 'puzzle-sound-btn', '🔊 Dinle');
        soundHint.style.cssText =
            'border:none;border-radius:20px;background:#FF9800;color:white;font-weight:bold;' +
            'padding:6px 18px;cursor:pointer;box-shadow:0 3px 6px rgba(0,0,0,0.15);font-size:15px;';
        soundHint.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentWord.word);
            window.Utils.celebrateElement(emojiObj);
        });
        imageArea.appendChild(soundHint);

        this.gameArea.appendChild(imageArea);
        
        // 2. Orta Kısım: Hedef Boş Yuvalar (Slots)
        var syllables = this.currentWord.syllables || [this.currentWord.word];
        var slotWidth = Math.min(130, Math.max(78, Math.floor((this.dims.width - 60) / Math.max(2, syllables.length))));
        var slotHeight = Math.floor(slotWidth * 0.82);

        var wordArea = window.Utils.createElement('div', 'puzzle-word-area');
        wordArea.style.cssText =
            'display:flex;gap:12px;justify-content:center;align-items:center;min-height:' + (slotHeight + 16) + 'px;';
        this.gameArea.appendChild(wordArea);
        
        // 3. Alt Kısım: Havuz Alanı (Draggable / Tappable Syllable Cards)
        var poolArea = window.Utils.createElement('div', 'puzzle-pool-area');
        poolArea.style.cssText =
            'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:center;min-height:' + (slotHeight + 16) + 'px;';
        this.gameArea.appendChild(poolArea);
        
        for (var i = 0; i < syllables.length; i++) {
            var slot = window.Utils.createElement('div', 'puzzle-slot');
            slot.style.cssText =
                'width:' + slotWidth + 'px;height:' + slotHeight + 'px;' +
                'border:4px dashed rgba(255,255,255,0.8);border-radius:20px;' +
                'background:rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;' +
                'box-sizing:border-box;transition:all 0.2s;';
            slot.dataset.expectedIndex = i;
            slot.dataset.expectedSyllable = syllables[i];
            wordArea.appendChild(slot);
            this.slots.push(slot);
        }
        
        var poolItems = syllables.map(function(s, idx) {
            return { syllable: s, correctIndex: idx };
        });

        if (syllables.length === 1) {
            var allSyllables = window.GameData.generateSyllables(this.maxGroup);
            var distractor = 'el';
            for (var d = 0; d < allSyllables.length; d++) {
                if (allSyllables[d].text !== syllables[0]) {
                    distractor = allSyllables[d].text;
                    break;
                }
            }
            poolItems.push({ syllable: distractor, correctIndex: -1 });
        }

        window.Utils.shuffle(poolItems);

        poolItems.forEach(function(item) {
            var color = window.GameData.getRandomColor();
            var card = window.Utils.createElement('div', 'puzzle-draggable-card');
            card.textContent = window.Utils.toUpperTR(item.syllable);
            card.style.cssText =
                'width:' + slotWidth + 'px;height:' + slotHeight + 'px;' +
                'border-radius:20px;background:' + color + ';color:white;font-weight:900;' +
                'font-size:clamp(22px, 5vw, 34px);display:flex;align-items:center;justify-content:center;' +
                'box-shadow:0 6px 14px rgba(0,0,0,0.2);cursor:pointer;user-select:none;touch-action:none;' +
                'transition:transform 0.15s;border:3px solid white;';

            card.dataset.syllable = item.syllable;
            card.dataset.correctIndex = item.correctIndex;

            self.makeInteractive(card, poolArea);
            poolArea.appendChild(card);
            self.draggableCards.push(card);
        });
    };

    WordPuzzleGame.prototype.placeCardIntoSlot = function(el, slot) {
        var self = this;
        slot.dataset.filled = 'true';
        el.dataset.placed = 'true';
        el.style.position = 'static';
        el.style.left = 'auto';
        el.style.top = 'auto';
        el.style.transform = 'none';
        el.style.zIndex = 'auto';
        el.style.cursor = 'default';
        el.style.boxShadow = 'none';

        slot.innerHTML = '';
        slot.appendChild(el);
        slot.style.border = '4px solid #4CAF50';
        slot.style.background = 'rgba(76,175,80,0.3)';

        window.AudioManager.playCorrect();
        window.Utils.bounceElement(el);

        this.filledCount++;
        var syllables = this.currentWord.syllables || [this.currentWord.word];

        if (this.filledCount === syllables.length) {
            if (this.currentImageEl) {
                window.Utils.celebrateElement(this.currentImageEl);
            }
            setTimeout(function() {
                window.speechSynthesis.cancel();
                window.AudioManager.speakWord(self.currentWord.word);
                self.showCorrectFeedback(self.gameArea);
                self.showCorrectOverlay(window.Utils.toUpperTR(self.currentWord.word) + ' 🎉');

                setTimeout(function() {
                    self.nextRound();
                }, 1800);
            }, 400);
        }
    };

    WordPuzzleGame.prototype.makeInteractive = function(el) {
        var self = this;
        var startX, startY;
        var origLeft, origTop;
        var dragging = false;
        var moved = false;

        var onStart = function(e) {
            if (el.dataset.placed === 'true') return;
            if (e.cancelable) e.preventDefault();
            dragging = true;
            moved = false;

            var clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            var clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            var rect = el.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;

            window.speechSynthesis.cancel();
            window.AudioManager.speakSyllable(el.dataset.syllable);
        };

        var onMove = function(e) {
            if (!dragging) return;
            var clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            var clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;

            var dx = clientX - startX;
            var dy = clientY - startY;

            if (!moved && Math.hypot(dx, dy) > 8) {
                moved = true;
                el.style.position = 'fixed';
                el.style.left = origLeft + 'px';
                el.style.top = origTop + 'px';
                el.style.zIndex = '1000';
                el.style.transform = 'scale(1.1)';
                el.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
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

            // Eğer çocuk sürüklemek yerine dokunduysa (Tap-to-Place): sıradaki boş yuvayı kontrol et
            if (!moved) {
                var nextSlot = null;
                for (var s = 0; s < self.slots.length; s++) {
                    if (self.slots[s].dataset.filled !== 'true') {
                        nextSlot = self.slots[s];
                        break;
                    }
                }
                if (nextSlot && nextSlot.dataset.expectedSyllable === el.dataset.syllable) {
                    self.placeCardIntoSlot(el, nextSlot);
                } else {
                    window.AudioManager.playWrong();
                    window.Utils.shakeElement(el);
                }
                return;
            }

            var elRect = el.getBoundingClientRect();
            var droppedInSlot = null;

            for (var i = 0; i < self.slots.length; i++) {
                var slot = self.slots[i];
                if (slot.dataset.filled === 'true') continue;

                var slotRect = slot.getBoundingClientRect();
                var pad = 35;
                if (elRect.left + elRect.width / 2 >= slotRect.left - pad &&
                    elRect.left + elRect.width / 2 <= slotRect.right + pad &&
                    elRect.top + elRect.height / 2 >= slotRect.top - pad &&
                    elRect.top + elRect.height / 2 <= slotRect.bottom + pad) {
                    droppedInSlot = slot;
                    break;
                }
            }

            if (droppedInSlot && droppedInSlot.dataset.expectedSyllable === el.dataset.syllable) {
                self.placeCardIntoSlot(el, droppedInSlot);
            } else {
                window.AudioManager.playWrong();
                window.Utils.shakeElement(el);

                el.style.position = 'static';
                el.style.left = 'auto';
                el.style.top = 'auto';
                el.style.transform = 'none';
                el.style.zIndex = 'auto';
                el.style.boxShadow = '0 6px 14px rgba(0,0,0,0.2)';
            }
        };

        el.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        el.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    };

    window.WordPuzzleGame = WordPuzzleGame;
})();
