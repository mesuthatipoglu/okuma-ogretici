(function() {
    'use strict';

    function WordMemoryGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'word-memory';
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
        var multiWords = window.Utils.shuffle(window.GameData.getAllWords().filter(function(w) {
            return w.syllables && w.syllables.length >= 2;
        }));
        var exWords = multiWords.slice(0, 3);
        var examples = exWords.map(function(w) {
            return {
                emoji: w.emoji,
                asset: w.asset,
                text: w.syllables.map(function(s) { return window.Utils.toUpperTR(s); }).join(' - '),
                sound: w.word
            };
        });

        this.showIntro({
            title: 'Kelime Hafızası! 🧠',
            icon: '🧠',
            description: 'Kelimeleri aklında tutabilecek misin?\nResme ve renkli hecelere bak, sonra heceleri sırayla bularak kelimeyi oluştur!',
            voiceText: 'Resme ve kelimeye dikkatle bak, sonra heceleri sırayla bularak kelimeyi oluştur!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    WordMemoryGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Kelime Hafızası 🧠');
        this.updateDimensions();
        
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
        this.updateDimensions();
        
        var allWords = window.GameData.getAllWords().filter(function(w) {
            return w.syllables && w.syllables.length >= 2; 
        });
        
        this.currentWordData = window.GameData.getNextFromDeck('word-memory-deck', allWords);
        this.renderMemorizePhase();
    };

    WordMemoryGame.prototype.renderMemorizePhase = function() {
        var self = this;
        var memorizeContainer = window.Utils.createElement('div', 'memorize-phase');
        memorizeContainer.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;transition:opacity 0.5s;';
        
        var emojiImg = window.SvgLetters.createEmojiImage(this.currentWordData.emoji || '⭐', 120, this.currentWordData.asset);
        emojiImg.style.marginBottom = '20px';
        memorizeContainer.appendChild(emojiImg);
        
        var sylRow = window.Utils.createElement('div', 'word-display-row');
        sylRow.style.cssText = 'display:flex;gap:10px;align-items:center;background:white;padding:12px 28px;border-radius:28px;box-shadow:0 8px 20px rgba(0,0,0,0.15);';
        var sylColors = ['#E53935', '#1E88E5', '#43A047', '#FB8C00'];
        this.currentWordData.syllables.forEach(function(s, idx) {
            var span = window.Utils.createElement('span', '', window.Utils.toUpperTR(s));
            span.style.cssText = 'font-size:clamp(30px, 6.8vw, 52px);font-weight:900;color:' + sylColors[idx % sylColors.length] + ';';
            sylRow.appendChild(span);
            if (idx < self.currentWordData.syllables.length - 1) {
                var dash = window.Utils.createElement('span', '', '•');
                dash.style.cssText = 'font-size:28px;color:#B0BEC5;font-weight:900;';
                sylRow.appendChild(dash);
            }
        });
        memorizeContainer.appendChild(sylRow);
        
        var hintLabel = window.Utils.createElement('div', 'hint-label', '👀 Dikkatle bak ve heceleri aklında tut!');
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
            }, 450);
            self.timeoutIds.push(innerTid);
        }, 3000);
        self.timeoutIds.push(tid);
    };

    WordMemoryGame.prototype.renderRebuildPhase = function() {
        var self = this;
        var topSection = window.Utils.createElement('div', 'rebuild-top');
        topSection.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;margin-bottom:20px;';
        
        var smallEmojiImg = window.SvgLetters.createEmojiImage(this.currentWordData.emoji || '⭐', 92, this.currentWordData.asset);
        smallEmojiImg.style.cursor = 'pointer';
        smallEmojiImg.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentWordData.word);
            window.Utils.celebrateElement(smallEmojiImg);
        });
        topSection.appendChild(smallEmojiImg);
        this.rebuildImg = smallEmojiImg;
        
        this.builtWordDisplay = window.Utils.createElement('div', 'syllable-slots');
        this.builtWordDisplay.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;flex-wrap:wrap;';
        
        for (var i = 0; i < this.currentWordData.syllables.length; i++) {
            var slot = window.Utils.createElement('div', 'syllable-slot', '?');
            slot.style.cssText = 'width:clamp(68px, 14vw, 110px);height:clamp(65px, 14vw, 105px);background:rgba(255,255,255,0.35);border:4px dashed rgba(255,255,255,0.9);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:clamp(22px, 5vw, 40px);font-weight:900;color:white;transition:all 0.3s;';
            this.slotElements.push(slot);
            this.builtWordDisplay.appendChild(slot);
        }
        
        topSection.appendChild(this.builtWordDisplay);
        this.gameArea.appendChild(topSection);
        
        this.availableSyllableContainer = window.Utils.createElement('div', 'available-syllables');
        this.availableSyllableContainer.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:14px;width:100%;max-width:520px;margin-top:auto;padding-bottom:16px;';
        
        var syllablesToShow = this.currentWordData.syllables.slice();
        
        var allGenerated = window.Utils.shuffle(window.GameData.generateSyllables(6).slice());
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
            var card = window.Utils.createElement('button', 'syllable-card', window.Utils.toUpperTR(syl));
            card.style.cssText = 'min-width:clamp(74px, 15vw, 115px);height:clamp(62px, 13vw, 95px);background:white;color:' + color + ';border:4px solid ' + color + ';border-radius:20px;font-size:clamp(24px, 5vw, 40px);font-weight:900;box-shadow:0 6px 14px rgba(0,0,0,0.18);cursor:pointer;padding:8px 16px;transition:transform 0.15s;user-select:none;';
            
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
            slot.textContent = window.Utils.toUpperTR(syllableText);
            slot.style.border = '4px solid #4CAF50';
            slot.style.background = '#4CAF50';
            slot.style.color = 'white';
            window.Utils.bounceElement(slot);
            
            this.expectedSyllableIndex++;
            
            if (this.expectedSyllableIndex === this.currentWordData.syllables.length) {
                if (this.rebuildImg) window.Utils.celebrateElement(this.rebuildImg);
                setTimeout(function() {
                    self.showCorrectFeedback(self.gameArea);
                    window.speechSynthesis.cancel();
                    window.AudioManager.speakWord(self.currentWordData.word);
                    self.showCorrectOverlay(window.Utils.toUpperTR(self.currentWordData.word) + ' 🎉');
                    
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
