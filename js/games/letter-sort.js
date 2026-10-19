(function() {
    'use strict';

    /**
     * Harf Sıralama (Letter Sort) Oyunu
     * Verilen 4-5 harfi resimli nesne kartlarıyla alfabetik sıraya göre dizme
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
        
        this.helpText = 'Alttaki resimli harf kartlarını yukarıdaki boşluklara alfabetik (A-Z) sırayla yerleştir! Önce harfe, sonra koymak istediğin kutuya dokun.';
        this.helpIcon = '🎯';
        this.createHeader('Harf Sıralama 🎯');

        var self = this;
        this.showIntro({
            title: 'Resimli Harf Sıralama! 🎯',
            description: 'Sevimli nesneli harf kartlarını alfabetik sıraya göre dizelim!\nÖnce harfe, sonra koymak istediğin kutuya dokun.',
            icon: 'tekboynuz',
            voiceText: 'Harfleri alfabetik sıraya göre diz! Önce harfe, sonra doğru kutuya dokun.',
            examples: [
                { text: 'A → B → C', type: 'letter', sound: 'a', word: 'aslan', emoji: '🦁' },
                { text: 'Ç → D → E', type: 'letter', sound: 'de', word: 'dinozor', emoji: '🦖' }
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
        this.gameArea.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;width:100%;height:100%;padding:14px;box-sizing:border-box;position:relative;overflow:hidden;';
        this.container.appendChild(this.gameArea);
        
        this.currentRound = 0;
        this.startRound();
    };

    LetterSortGame.prototype.startRound = function() {
        var self = this;
        if (!this.gameArea) return;
        this.gameArea.innerHTML = '';
        this.currentRound++;

        var numLetters = this.currentRound <= 2 ? 4 : 5;
        this.currentLetters = this.getRandomLetters(numLetters);

        var rect = this.gameArea.getBoundingClientRect();
        var areaW = rect.width || window.innerWidth;
        var areaH = rect.height || window.innerHeight;
        
        var titleHint = window.Utils.createElement('div', 'sort-hint-title', '🔤 Harfleri Sırayla Kutulara Yerleştir:');
        titleHint.style.cssText = 'font-size:clamp(15px, 3.2vw, 21px);color:white;font-weight:900;text-shadow:1px 1px 4px rgba(0,0,0,0.35);';
        this.gameArea.appendChild(titleHint);
        
        var slotsContainer = window.Utils.createElement('div', 'slots-container');
        slotsContainer.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:clamp(8px, 2vw, 14px);flex-wrap:wrap;width:100%;max-width:600px;';
        
        var cardsContainer = window.Utils.createElement('div', 'cards-container');
        cardsContainer.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:clamp(8px, 2vw, 16px);flex-wrap:wrap;width:100%;max-width:600px;';
        
        this.slots = [];
        this.cards = [];
        this.selectedCard = null;

        var cardWidth = Math.max(58, Math.min(108, Math.floor((areaW - 64) / numLetters)));
        var cardHeight = Math.max(76, Math.min(Math.floor(areaH * 0.34), Math.floor(cardWidth * 1.28)));

        for (var i = 0; i < numLetters; i++) {
            var slot = window.Utils.createElement('div', 'letter-slot', (i + 1).toString());
            slot.style.cssText = 'width:' + cardWidth + 'px;height:' + cardHeight + 'px;border:4px dashed rgba(255,255,255,0.8);border-radius:20px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-size:clamp(20px, 4vw, 30px);font-weight:900;color:rgba(255,255,255,0.9);cursor:pointer;transition:all 0.2s;user-select:none;box-sizing:border-box;';
            
            slot.dataset.index = i;
            slot.dataset.expectedLetter = this.currentLetters[i].letter;
            
            slot.onclick = (function(idx) {
                return function() { self.handleSlotClick(idx); };
            })(i);
            
            this.slots.push(slot);
            slotsContainer.appendChild(slot);
        }

        var shuffledLetters = window.Utils.shuffle(this.currentLetters.slice());
        
        for (var j = 0; j < numLetters; j++) {
            var letterObj = shuffledLetters[j];
            var lInfo = window.GameData.getLetterInfo(letterObj.letter);
            var color = (lInfo && lInfo.color) || window.GameData.getRandomColor();
            var exObj = (lInfo && lInfo.examples && lInfo.examples.length)
                ? window.GameData.pickUniqueItems('sort_ex_' + letterObj.letter, lInfo.examples, 1)[0]
                : { word: letterObj.letter, emoji: '⭐' };
            
            var card = window.Utils.createElement('button', 'sort-letter-card');
            card.style.cssText = 'width:' + cardWidth + 'px;height:' + cardHeight + 'px;background:white;color:' + color + ';border:4px solid ' + color + ';border-radius:20px;font-size:' + Math.round(cardHeight * 0.28) + 'px;font-weight:900;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.22);transition:transform 0.15s, box-shadow 0.15s;user-select:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-sizing:border-box;padding:4px;';
            
            var miniSvg = window.SvgLetters.createObjectImage(exObj, Math.round(Math.min(cardWidth, cardHeight) * 0.48), { bg: false, animate: false });
            var txtEl = window.Utils.createElement('span', '', window.Utils.toUpperTR(letterObj.letter));
            card.appendChild(miniSvg);
            card.appendChild(txtEl);

            card.dataset.id = j;
            card.dataset.letter = letterObj.letter;
            card.dataset.word = exObj.word;
            
            card.onclick = (function(idx) {
                return function() { self.handleCardClick(idx); };
            })(j);
            
            this.cards.push({ element: card, placedSlot: null, originalLetter: letterObj.letter, word: exObj.word, color: color });
            cardsContainer.appendChild(card);
        }
        
        this.gameArea.appendChild(slotsContainer);
        this.gameArea.appendChild(cardsContainer);
        
        window.AudioManager.playWhoosh();
    };

    LetterSortGame.prototype.getRandomLetters = function(count) {
        var letters = [];
        var maxStart = this.turkishAlphabet.length - count;
        var startPositions = [];
        for (var s = 0; s <= maxStart; s++) startPositions.push(s);
        var startIdx = window.GameData.pickUniqueItems('sort_starts', startPositions, 1)[0] || 0;
        
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
            cardObj.element.style.transform = 'scale(1.14)';
            cardObj.element.style.borderColor = '#00E676';
        }
    };

    LetterSortGame.prototype.handleSlotClick = function(slotIndex) {
        var slot = this.slots[slotIndex];
        if (slot.dataset.filled === 'true') return;

        if (this.selectedCard !== null) {
            var cardObj = this.cards[this.selectedCard];
            var expectedLetter = slot.dataset.expectedLetter;
            
            if (cardObj.originalLetter === expectedLetter) {
                window.AudioManager.playCorrect();
                cardObj.placedSlot = slotIndex;
                slot.dataset.filled = 'true';
                slot.textContent = '';
                
                cardObj.element.style.transform = 'scale(1)';
                cardObj.element.style.boxShadow = 'none';
                cardObj.element.style.cursor = 'default';
                cardObj.element.onclick = null;
                cardObj.element.style.width = '100%';
                cardObj.element.style.height = '100%';
                cardObj.element.style.background = '#E8F5E9';
                cardObj.element.style.borderColor = '#4CAF50';
                
                slot.appendChild(cardObj.element);
                slot.style.border = 'none';
                slot.style.background = 'transparent';
                window.Utils.bounceElement(cardObj.element);
                
                this.selectedCard = null;
                this.checkWinCondition();
            } else {
                window.AudioManager.playWrong();
                window.AudioManager.playZort();
                window.Utils.shakeElement(cardObj.element);
                window.Utils.shakeElement(slot);
            }
        }
    };

    LetterSortGame.prototype.checkWinCondition = function() {
        var allPlaced = this.cards.every(function(c) { return c.placedSlot !== null; });
        if (allPlaced) {
            var self = this;
            this.showCorrectFeedback(this.gameArea);
            this.showCorrectOverlay('Harika Sıraladın! 🎉');
            setTimeout(function() {
                self.startRound();
            }, 1700);
        }
    };

    window.LetterSortGame = LetterSortGame;
})();
