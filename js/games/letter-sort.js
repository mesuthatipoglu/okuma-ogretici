(function() {
    'use strict';

    /**
     * Harf Sıralama (Letter Sort) Oyunu
     * Verilen 4-5 harfi alfabetik sıraya göre dizme
     */
    function LetterSortGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'letter-sort';
        this.turkishAlphabet = window.GameData.alphabetLetters || ['a', 'b', 'c', 'ç', 'd', 'e', 'f', 'g', 'ğ', 'h', 'ı', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'ö', 'p', 'r', 's', 'ş', 't', 'u', 'ü', 'v', 'y', 'z'];
        this.currentRound = 0;
        this.currentLetters = [];
        this.slots = [];
        this.cards = [];
        this.selectedCard = null;
    }

    LetterSortGame.prototype = Object.create(window.BaseGame.prototype);
    LetterSortGame.prototype.constructor = LetterSortGame;

    LetterSortGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        
        this.helpText = 'Alttaki harfleri yukarıdaki boşluklara alfabetik (A-Z) sırayla yerleştir! Önce harfe, sonra koymak istediğin kutuya dokun.';
        this.helpIcon = '🎯';
        this.createHeader('Harf Sıralama 🎯');

        var self = this;
        this.showIntro({
            title: 'Harf Sıralama! 🎯',
            description: 'Harfleri alfabetik sıraya göre dizelim!\nÖnce harfe, sonra koymak istediğin kutuya dokun.',
            icon: '🎯',
            voiceText: 'Harfleri alfabetik sıraya göre diz! Önce harfe, sonra doğru kutuya dokun.',
            examples: [
                { text: 'A → B → C', type: 'letter', sound: 'a', emoji: '🔤' },
                { text: 'D → E → F', type: 'letter', sound: 'de', emoji: '📝' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterSortGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Harf Sıralama 🎯');
        
        this.gameArea = window.Utils.createElement('div', 'game-area letter-sort-area');
        this.gameArea.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;width:100%;height:100%;padding:16px;box-sizing:border-box;position:relative;overflow:hidden;';
        this.container.appendChild(this.gameArea);
        
        this.currentRound = 0;
        this.startRound();
    };

    LetterSortGame.prototype.startRound = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        this.currentRound++;

        var numLetters = this.currentRound <= 2 ? 4 : 5;
        this.currentLetters = this.getRandomLetters(numLetters);
        
        var titleHint = window.Utils.createElement('div', 'sort-hint-title', '🔤 Harfleri Alfabetik Sıraya (A-Z) Diz:');
        titleHint.style.cssText = 'font-size:clamp(15px, 3.2vw, 20px);color:white;font-weight:bold;text-shadow:1px 1px 3px rgba(0,0,0,0.3);';
        this.gameArea.appendChild(titleHint);
        
        // Üstteki boşluklar için kapsayıcı (Hedefler)
        var slotsContainer = window.Utils.createElement('div', 'slots-container');
        slotsContainer.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:clamp(8px, 2vw, 16px);flex-wrap:wrap;width:100%;max-width:550px;';
        
        // Alttaki harf kartları için kapsayıcı
        var cardsContainer = window.Utils.createElement('div', 'cards-container');
        cardsContainer.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:clamp(10px, 2.5vw, 18px);flex-wrap:wrap;width:100%;max-width:550px;';
        
        this.slots = [];
        this.cards = [];
        this.selectedCard = null;

        var cardWidth = Math.max(60, Math.min(100, Math.floor((this.gameArea.clientWidth - 80) / numLetters)));
        var cardHeight = Math.floor(cardWidth * 1.15);

        // Hedef yuvaları oluştur (Sıralı A -> Z)
        for (var i = 0; i < numLetters; i++) {
            var slot = window.Utils.createElement('div', 'letter-slot', (i + 1).toString());
            slot.style.cssText = 'width:' + cardWidth + 'px;height:' + cardHeight + 'px;border:4px dashed rgba(255,255,255,0.7);border-radius:18px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:clamp(18px, 4vw, 28px);font-weight:bold;color:rgba(255,255,255,0.8);cursor:pointer;transition:all 0.2s;user-select:none;box-sizing:border-box;';
            
            slot.dataset.index = i;
            slot.dataset.expectedLetter = this.currentLetters[i].letter;
            
            slot.onclick = (function(idx) {
                return function() { self.handleSlotClick(idx); };
            })(i);
            
            this.slots.push(slot);
            slotsContainer.appendChild(slot);
        }

        // Harfleri karıştır
        var shuffledLetters = window.Utils.shuffle(this.currentLetters.slice());
        
        // Harf kartlarını oluştur
        for (var j = 0; j < numLetters; j++) {
            var letterObj = shuffledLetters[j];
            var color = window.GameData.getLetterColor(letterObj.letter) || window.GameData.getRandomColor();
            
            var card = window.Utils.createElement('button', 'sort-letter-card', window.Utils.toUpperTR(letterObj.letter));
            card.style.cssText = 'width:' + cardWidth + 'px;height:' + cardHeight + 'px;background:white;color:' + color + ';border:4px solid ' + color + ';border-radius:18px;font-size:clamp(26px, 6vw, 44px);font-weight:900;cursor:pointer;box-shadow:0 6px 14px rgba(0,0,0,0.2);transition:transform 0.15s, box-shadow 0.15s;user-select:none;display:flex;align-items:center;justify-content:center;box-sizing:border-box;';
            
            card.dataset.id = j;
            card.dataset.letter = letterObj.letter;
            
            card.onclick = (function(idx) {
                return function() { self.handleCardClick(idx); };
            })(j);
            
            this.cards.push({ element: card, placedSlot: null, originalLetter: letterObj.letter, color: color });
            cardsContainer.appendChild(card);
        }
        
        this.gameArea.appendChild(slotsContainer);
        this.gameArea.appendChild(cardsContainer);
        
        window.AudioManager.playWhoosh();
    };

    LetterSortGame.prototype.getRandomLetters = function(count) {
        var letters = [];
        var maxStart = this.turkishAlphabet.length - count;
        var startIdx = Math.floor(Math.random() * maxStart);
        
        for (var i = 0; i < count; i++) {
            letters.push({
                letter: this.turkishAlphabet[startIdx + i],
                index: startIdx + i
            });
        }
        return letters;
    };

    LetterSortGame.prototype.handleCardClick = function(cardIndex) {
        var cardObj = this.cards[cardIndex];
        if (cardObj.placedSlot !== null) return;

        window.AudioManager.playClick();
        window.speechSynthesis.cancel();
        window.AudioManager.speakLetter(cardObj.originalLetter);

        if (this.selectedCard !== null) {
            this.cards[this.selectedCard].element.style.transform = 'scale(1)';
            this.cards[this.selectedCard].element.style.borderColor = this.cards[this.selectedCard].color;
        }

        if (this.selectedCard === cardIndex) {
            this.selectedCard = null;
        } else {
            this.selectedCard = cardIndex;
            cardObj.element.style.transform = 'scale(1.15)';
            cardObj.element.style.borderColor = '#00E676';
        }
    };

    LetterSortGame.prototype.handleSlotClick = function(slotIndex) {
        var slot = this.slots[slotIndex];
        if (slot.dataset.filled === "true") return;

        if (this.selectedCard !== null) {
            var cardObj = this.cards[this.selectedCard];
            var expectedLetter = slot.dataset.expectedLetter;
            
            if (cardObj.originalLetter === expectedLetter) {
                // DOĞRU
                window.AudioManager.playCorrect();
                cardObj.placedSlot = slotIndex;
                slot.dataset.filled = "true";
                slot.textContent = '';
                
                cardObj.element.style.transform = 'scale(1)';
                cardObj.element.style.boxShadow = 'none';
                cardObj.element.style.cursor = 'default';
                cardObj.element.onclick = null;
                cardObj.element.style.width = '100%';
                cardObj.element.style.height = '100%';
                cardObj.element.style.background = '#4CAF50';
                cardObj.element.style.borderColor = '#2E7D32';
                cardObj.element.style.color = 'white';
                
                slot.appendChild(cardObj.element);
                slot.style.border = 'none';
                slot.style.background = 'transparent';
                window.Utils.bounceElement(cardObj.element);
                
                this.selectedCard = null;
                this.checkWinCondition();
            } else {
                // YANLIŞ -> zort sesi
                window.AudioManager.playWrong();
                window.AudioManager.playZort();
                window.Utils.shakeElement(cardObj.element);
                window.Utils.shakeElement(slot);
            }
        }
    };

    LetterSortGame.prototype.checkWinCondition = function() {
        var allPlaced = true;
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].placedSlot === null) {
                allPlaced = false;
                break;
            }
        }
        
        if (allPlaced) {
            var self = this;
            this.showCorrectFeedback(this.gameArea);
            this.showCorrectOverlay('Aferin! Harika Sıraladın! 🎉');
            setTimeout(function() {
                self.startRound();
            }, 1800);
        }
    };

    LetterSortGame.prototype.destroy = function() {
        window.BaseGame.prototype.destroy.call(this);
    };

    window.LetterSortGame = LetterSortGame;
})();
