(function() {
    'use strict';

    function WordMemoryGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'word-memory';
        this.maxGroup = (options && options.maxGroup) ? options.maxGroup : 1;
        this.timeoutIds = [];
        this.availableSyllableCards = [];
        this.slotElements = [];
        this.expectedSyllableIndex = 0;
        this.currentWordData = null;
    }

    WordMemoryGame.prototype = Object.create(window.BaseGame.prototype);
    WordMemoryGame.prototype.constructor = WordMemoryGame;

    WordMemoryGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Ekranda çıkan kelimeye ve resme dikkatlice bak! Kelime kaybolduktan sonra heceleri doğru sırayla seçerek kelimeyi tekrar oluştur.';
        this.helpIcon = '🧠';
        this.createHeader('Kelime Hafızası 🧠');

        var self = this;
        this.showIntro({
            title: 'Kelime Hafızası! 🧠',
            icon: '🧠',
            description: 'Kelimeleri aklında tutabilecek misin?\nResme ve kelimeye bak, sonra heceleri sırayla bularak kelimeyi oluştur!',
            voiceText: 'Resme ve kelimeye dikkatle bak, sonra heceleri sırayla bularak kelimeyi oluştur!',
            examples: [
                { emoji: '🍎', text: 'EL - MA', sound: 'elma' },
                { emoji: '🐱', text: 'KE - Dİ', sound: 'kedi' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    WordMemoryGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Kelime Hafızası 🧠');
        
        this.gameArea = window.Utils.createElement('div', 'game-area word-memory-area');
        this.gameArea.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    WordMemoryGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        this.gameArea.innerHTML = '';
        this.expectedSyllableIndex = 0;
        this.availableSyllableCards = [];
        this.slotElements = [];
        this._clearTimeouts();
        
        var allWords = window.GameData.getAllWords().filter(function(w) {
            return w.syllables && w.syllables.length >= 2; 
        });
        
        if (this.maxGroup) {
            var groupWords = allWords.filter(function(w) { return w.minGroup <= this.maxGroup; }.bind(this));
            if (groupWords.length > 0) allWords = groupWords;
        }
        
        if (allWords.length === 0) {
            allWords = [{ word: 'elma', syllables: ['el', 'ma'], emoji: '🍎' }];
        }
        
        this.currentWordData = window.Utils.randomItem(allWords);
        this.renderMemorizePhase();
    };

    WordMemoryGame.prototype.renderMemorizePhase = function() {
        var self = this;
        var memorizeContainer = window.Utils.createElement('div', 'memorize-phase');
        memorizeContainer.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;transition:opacity 0.5s;';
        
        var emojiImg = window.SvgLetters.createEmojiImage(this.currentWordData.emoji || '⭐', 120);
        emojiImg.style.marginBottom = '20px';
        memorizeContainer.appendChild(emojiImg);
        
        this.wordFullDisplay = window.Utils.createElement('div', 'word-display', this.currentWordData.word.toUpperCase());
        this.wordFullDisplay.style.cssText = 'font-size:clamp(32px, 7vw, 56px);font-weight:900;color:#2E7D32;background:white;padding:12px 32px;border-radius:25px;box-shadow:0 8px 20px rgba(0,0,0,0.15);letter-spacing:2px;';
        memorizeContainer.appendChild(this.wordFullDisplay);
        
        var hintLabel = window.Utils.createElement('div', 'hint-label', '👀 3 saniye incele ve aklında tut!');
        hintLabel.style.cssText = 'font-size:clamp(14px, 3vw, 18px);color:white;margin-top:16px;font-weight:bold;text-shadow:1px 1px 3px rgba(0,0,0,0.4);';
        memorizeContainer.appendChild(hintLabel);
        
        this.gameArea.appendChild(memorizeContainer);
        
        window.speechSynthesis.cancel();
        window.AudioManager.speakWord(this.currentWordData.word);
        
        var tid = setTimeout(function() {
            memorizeContainer.style.opacity = '0';
            var innerTid = setTimeout(function() {
                self.gameArea.innerHTML = '';
                self.renderRebuildPhase();
            }, 500);
            self.timeoutIds.push(innerTid);
        }, 3000);
        self.timeoutIds.push(tid);
    };

    WordMemoryGame.prototype.renderRebuildPhase = function() {
        var self = this;
        var topSection = window.Utils.createElement('div', 'rebuild-top');
        topSection.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;margin-bottom:20px;';
        
        var smallEmojiImg = window.SvgLetters.createEmojiImage(this.currentWordData.emoji || '⭐', 80);
        topSection.appendChild(smallEmojiImg);
        
        this.builtWordDisplay = window.Utils.createElement('div', 'syllable-slots');
        this.builtWordDisplay.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;flex-wrap:wrap;';
        
        for (var i = 0; i < this.currentWordData.syllables.length; i++) {
            var slot = window.Utils.createElement('div', 'syllable-slot', '?');
            slot.style.cssText = 'width:clamp(65px, 14vw, 110px);height:clamp(65px, 14vw, 110px);background:rgba(255,255,255,0.4);border:4px dashed rgba(255,255,255,0.9);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:clamp(22px, 5vw, 40px);font-weight:900;color:white;transition:all 0.3s;';
            this.slotElements.push(slot);
            this.builtWordDisplay.appendChild(slot);
        }
        
        topSection.appendChild(this.builtWordDisplay);
        this.gameArea.appendChild(topSection);
        
        this.availableSyllableContainer = window.Utils.createElement('div', 'available-syllables');
        this.availableSyllableContainer.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:14px;width:100%;max-width:500px;margin-top:auto;padding-bottom:16px;';
        
        var syllablesToShow = this.currentWordData.syllables.slice();
        
        // 1-2 çeldirici hece ekle
        var allGenerated = window.GameData.generateSyllables(this.maxGroup || 2);
        var distractorPool = allGenerated.map(function(s) { return typeof s === 'object' ? s.text : s; });
        var validDistractors = distractorPool.filter(function(d) {
            return syllablesToShow.indexOf(d) === -1;
        });
        
        var distractorCount = Math.min(2, validDistractors.length);
        for (var j = 0; j < distractorCount; j++) {
            syllablesToShow.push(validDistractors[j]);
        }
        
        syllablesToShow = window.Utils.shuffle(syllablesToShow);
        
        syllablesToShow.forEach(function(syl) {
            var color = window.GameData.getRandomColor();
            var card = window.Utils.createElement('button', 'syllable-card', syl.toUpperCase());
            card.style.cssText = 'min-width:clamp(70px, 15vw, 115px);height:clamp(60px, 13vw, 95px);background:white;color:' + color + ';border:4px solid ' + color + ';border-radius:20px;font-size:clamp(24px, 5vw, 42px);font-weight:900;box-shadow:0 6px 14px rgba(0,0,0,0.18);cursor:pointer;padding:8px 16px;transition:transform 0.15s;user-select:none;';
            
            card.addEventListener('click', function() {
                self.handleSyllableTap(card, syl);
            });
            
            self.availableSyllableContainer.appendChild(card);
            self.availableSyllableCards.push({ element: card, syllable: syl, used: false });
        });
        
        this.gameArea.appendChild(this.availableSyllableContainer);
    };

    WordMemoryGame.prototype.handleSyllableTap = function(cardElement, syllableText) {
        var self = this;
        var cardData = null;
        for (var i = 0; i < this.availableSyllableCards.length; i++) {
            if (this.availableSyllableCards[i].element === cardElement) {
                cardData = this.availableSyllableCards[i];
                break;
            }
        }
        
        if (!cardData || cardData.used) return;
        
        var expectedSyllable = this.currentWordData.syllables[this.expectedSyllableIndex];
        
        if (syllableText === expectedSyllable) {
            window.AudioManager.playPop();
            window.speechSynthesis.cancel();
            window.AudioManager.speakSyllable(syllableText);
            
            cardData.used = true;
            cardElement.style.opacity = '0';
            cardElement.style.pointerEvents = 'none';
            
            var slot = this.slotElements[this.expectedSyllableIndex];
            slot.textContent = syllableText.toUpperCase();
            slot.style.border = '4px solid #4CAF50';
            slot.style.background = '#4CAF50';
            slot.style.color = 'white';
            window.Utils.bounceElement(slot);
            
            this.expectedSyllableIndex++;
            
            if (this.expectedSyllableIndex === this.currentWordData.syllables.length) {
                setTimeout(function() {
                    self.showCorrectFeedback(self.gameArea);
                    window.speechSynthesis.cancel();
                    window.AudioManager.speakWord(self.currentWordData.word);
                    self.showCorrectOverlay(self.currentWordData.word.toUpperCase() + ' 🎉');
                    
                    setTimeout(function() {
                        self.nextRound();
                    }, 1800);
                }, 400);
            }
        } else {
            window.AudioManager.playWrong();
            window.AudioManager.playZort();
            window.Utils.shakeElement(cardElement);
        }
    };

    WordMemoryGame.prototype._clearTimeouts = function() {
        this.timeoutIds.forEach(function(id) { clearTimeout(id); });
        this.timeoutIds = [];
    };

    WordMemoryGame.prototype.destroy = function() {
        this._clearTimeouts();
        window.BaseGame.prototype.destroy.call(this);
    };

    window.WordMemoryGame = WordMemoryGame;
})();
