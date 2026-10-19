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
        
        this.helpText = 'Heceleri sürükleyerek yukarıdaki boş kutulara doğru sırayla yerleştir ve kelimeyi oluştur!';
        this.helpIcon = '🧩';
        this.createHeader("Kelime Yapboz 🧩");

        var self = this;
        var words = window.GameData.getAllWords();
        var exWords = words.slice(0, 3);
        var examples = exWords.map(function(w) {
            return { text: w.word.toUpperCase(), sound: w.word, type: 'word', emoji: w.emoji || '📖' };
        });

        this.showIntro({
            title: 'Kelimeleri Oluşturalım! 🧩',
            icon: '🧩',
            description: 'Tüm kelimeleri hecelerine ayırdık! Aşağıdaki heceleri yukarıdaki boş kutulara sürükle ve kelimeleri tamamla.',
            voiceText: 'Aşağıdaki heceleri kutucuklara sürükle ve kelimeleri tamamla!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    WordPuzzleGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.gameArea = window.Utils.createElement("div", "game-area");
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;position:relative;padding:16px;box-sizing:border-box;';
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    WordPuzzleGame.prototype.nextRound = function() {
        var self = this;
        window.BaseGame.prototype.nextRound.call(this);
        this.filledCount = 0;
        this.slots = [];
        this.draggableCards = [];
        
        // 100+ kelime havuzundan çek - tek heceli kelimelerin de düzenli gelmesini garanti et
        var availableWords = window.GameData.getAllWords();
        var singleSyllables = availableWords.filter(function(w) {
            return w.syllables && w.syllables.length === 1;
        });
        
        // Her 3 turdan birinde veya %30 olasılıkla tek heceli kelime seç
        if (singleSyllables.length > 0 && (this.round % 3 === 0 || Math.random() < 0.3)) {
            this.currentWord = window.Utils.randomItem(singleSyllables);
        } else {
            this.currentWord = window.Utils.randomItem(availableWords);
        }
        
        this.transitionToNextRound(function() {
            self.renderGame();
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentWord.word);
        });
    };

    WordPuzzleGame.prototype.renderGame = function() {
        var self = this;
        this.gameArea.innerHTML = "";
        
        // 1. Üst Kısım: Emoji Resim ve Ses Dinleme
        var imageArea = window.Utils.createElement("div", "puzzle-image-area");
        imageArea.style.cssText = 'display:flex;flex-direction:column;align-items:center;margin-bottom:12px;';
        
        var emojiObj = window.SvgLetters.createEmojiImage(this.currentWord.emoji || "❓", 90);
        emojiObj.style.cursor = "pointer";
        emojiObj.style.filter = "drop-shadow(0 4px 10px rgba(0,0,0,0.2))";
        emojiObj.addEventListener("click", function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentWord.word);
            window.Utils.pulseElement(emojiObj);
        });
        imageArea.appendChild(emojiObj);

        var soundHint = window.Utils.createElement("button", "puzzle-sound-btn", "🔊 Dinle");
        soundHint.style.cssText =
            'border:none;border-radius:20px;background:#FF9800;color:white;font-weight:bold;' +
            'padding:6px 18px;margin-top:8px;cursor:pointer;box-shadow:0 3px 6px rgba(0,0,0,0.15);';
        soundHint.addEventListener("click", function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentWord.word);
            window.Utils.pulseElement(emojiObj);
        });
        imageArea.appendChild(soundHint);

        this.gameArea.appendChild(imageArea);
        
        // 2. Orta Kısım: Hedef Boş Yuvalar (Slots)
        var syllables = this.currentWord.syllables || [this.currentWord.word];
        var slotWidth = Math.min(130, Math.max(80, Math.floor(400 / syllables.length)));
        var slotHeight = Math.floor(slotWidth * 0.85);

        var wordArea = window.Utils.createElement("div", "puzzle-word-area");
        wordArea.style.cssText =
            'display:flex;gap:14px;justify-content:center;align-items:center;min-height:' + (slotHeight + 20) + 'px;margin-bottom:24px;';
        this.gameArea.appendChild(wordArea);
        
        // 3. Alt Kısım: Havuz Alanı (Draggable Syllable Cards)
        var poolArea = window.Utils.createElement("div", "puzzle-pool-area");
        poolArea.style.cssText =
            'display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:center;min-height:' + (slotHeight + 20) + 'px;';
        this.gameArea.appendChild(poolArea);
        
        // Yuvaları oluştur (Tek heceli kelimeler dahil TÜM kelimeler için boş yuva)
        for (var i = 0; i < syllables.length; i++) {
            var slot = window.Utils.createElement("div", "puzzle-slot");
            slot.style.cssText =
                'width:' + slotWidth + 'px;height:' + slotHeight + 'px;' +
                'border:4px dashed rgba(255,255,255,0.7);border-radius:20px;' +
                'background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;' +
                'box-sizing:border-box;transition:all 0.2s;';
            slot.dataset.expectedIndex = i;
            slot.dataset.expectedSyllable = syllables[i];
            wordArea.appendChild(slot);
            this.slots.push(slot);
        }
        
        // Havuzdaki kartları hazırla
        // Tek heceli kelimelerde çocuğa seçenek sunmak için 1 distractor ekle
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
            var card = window.Utils.createElement("div", "puzzle-draggable-card");
            card.textContent = item.syllable.toUpperCase();
            card.style.cssText =
                'width:' + slotWidth + 'px;height:' + slotHeight + 'px;' +
                'border-radius:20px;background:' + color + ';color:white;font-weight:900;' +
                'font-size:clamp(22px, 5vw, 36px);display:flex;align-items:center;justify-content:center;' +
                'box-shadow:0 6px 14px rgba(0,0,0,0.2);cursor:grab;user-select:none;touch-action:none;' +
                'transition:transform 0.15s;border:3px solid white;';

            card.dataset.syllable = item.syllable;
            card.dataset.correctIndex = item.correctIndex;

            self.makeDraggable(card, poolArea);
            poolArea.appendChild(card);
            self.draggableCards.push(card);
        });
    };

    WordPuzzleGame.prototype.makeDraggable = function(el, poolArea) {
        var self = this;
        var startX, startY;
        var origLeft, origTop;
        var dragging = false;

        var onStart = function(e) {
            if (el.dataset.placed === "true") return;
            e.preventDefault();
            dragging = true;

            var clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            var clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            var rect = el.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;

            el.style.position = 'fixed';
            el.style.left = origLeft + 'px';
            el.style.top = origTop + 'px';
            el.style.zIndex = '1000';
            el.style.transform = 'scale(1.1)';
            el.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';

            window.speechSynthesis.cancel();
            window.AudioManager.speakSyllable(el.dataset.syllable);
        };

        var onMove = function(e) {
            if (!dragging) return;
            e.preventDefault();

            var clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            var clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;

            var dx = clientX - startX;
            var dy = clientY - startY;

            el.style.left = (origLeft + dx) + 'px';
            el.style.top = (origTop + dy) + 'px';
        };

        var onEnd = function(e) {
            if (!dragging) return;
            dragging = false;

            var elRect = el.getBoundingClientRect();
            var droppedInSlot = null;

            // Genişletilmiş temas toleransı (+30px) ile yuva kontrolü
            for (var i = 0; i < self.slots.length; i++) {
                var slot = self.slots[i];
                if (slot.dataset.filled === "true") continue;

                var slotRect = slot.getBoundingClientRect();
                var pad = 30;
                if (elRect.left + elRect.width / 2 >= slotRect.left - pad &&
                    elRect.left + elRect.width / 2 <= slotRect.right + pad &&
                    elRect.top + elRect.height / 2 >= slotRect.top - pad &&
                    elRect.top + elRect.height / 2 <= slotRect.bottom + pad) {
                    droppedInSlot = slot;
                    break;
                }
            }

            if (droppedInSlot && droppedInSlot.dataset.expectedSyllable === el.dataset.syllable) {
                // DOĞRU YUVA
                droppedInSlot.dataset.filled = "true";
                el.dataset.placed = "true";
                el.style.position = 'static';
                el.style.transform = 'none';
                el.style.zIndex = 'auto';
                el.style.cursor = 'default';
                el.style.boxShadow = 'none';

                droppedInSlot.innerHTML = '';
                droppedInSlot.appendChild(el);
                droppedInSlot.style.border = '4px solid #4CAF50';
                droppedInSlot.style.background = 'rgba(76,175,80,0.3)';

                window.AudioManager.playCorrect();
                window.Utils.bounceElement(el);

                self.filledCount++;
                var syllables = self.currentWord.syllables || [self.currentWord.word];

                if (self.filledCount === syllables.length) {
                    // Kelime tamamlandı!
                    setTimeout(function() {
                        window.speechSynthesis.cancel();
                        window.AudioManager.speakWord(self.currentWord.word);
                        self.showCorrectFeedback(self.gameArea);
                        self.showCorrectOverlay(self.currentWord.word.toUpperCase() + ' 🎉');

                        setTimeout(function() {
                            self.nextRound();
                        }, 1800);
                    }, 400);
                }
            } else {
                // YANLIŞ veya DIŞARI BIRAKILDI -> Geri döndür
                if (droppedInSlot) {
                    window.AudioManager.playZort();
                } else {
                    window.AudioManager.playWrong();
                }
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
