(function() {
    'use strict';

    function SyllableBoxGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'syllable-box';
        this.maxGroup = (options && options.maxGroup) ? options.maxGroup : 1;
        this.syllables = [];
        this.activeCards = [];
        this.animationFrameId = null;
        this.spawnIntervalId = null;
        this.vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
    }

    SyllableBoxGame.prototype = Object.create(window.BaseGame.prototype);
    SyllableBoxGame.prototype.constructor = SyllableBoxGame;

    SyllableBoxGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Düşen heceleri doğru kutuya yerleştir! Sesli harfle bitenler Açık Hece (la, me), sessiz harfle bitenler Kapalı Hecedir (el, kan).';
        this.helpIcon = '📦';
        this.createHeader('Hece Kutusu 📦');
        
        var self = this;
        this.showIntro({
            title: 'Hece Kutusu! 📦',
            icon: '📦',
            description: 'Düşen heceleri doğru kutuya koy!\n\nAçık Hece: Sesli harf ile biter (la, me)\nKapalı Hece: Sessiz harf ile biter (el, kan)',
            voiceText: 'Düşen heceleri açık veya kapalı hece kutusuna yerleştir!',
            examples: [
                { text: 'Açık: LA, ME', type: 'syllable', sound: 'la', emoji: '🟢' },
                { text: 'Kapalı: EL, AL', type: 'syllable', sound: 'el', emoji: '🟠' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    SyllableBoxGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Hece Kutusu 📦');

        this.gameArea = window.Utils.createElement('div', 'game-area syllable-box-area');
        this.gameArea.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;display:flex;flex-direction:column;box-sizing:border-box;';
        this.container.appendChild(this.gameArea);

        var data = window.GameData.generateSyllables(this.maxGroup);
        if (data && data.length > 0) {
            this.syllables = data.map(function(item) { return item.text.toLowerCase(); });
        } else {
            this.syllables = ['la', 'el', 'me', 'ak', 'ko', 'ok', 'ka', 'al'];
        }
        
        this.syllablePool = window.Utils.shuffle(this.syllables.slice());

        this.fallingArea = window.Utils.createElement('div', 'falling-area');
        this.fallingArea.style.cssText = 'flex:1;position:relative;width:100%;overflow:hidden;';
        this.gameArea.appendChild(this.fallingArea);

        this.boxesArea = window.Utils.createElement('div', 'boxes-area');
        this.boxesArea.style.cssText = 'height:clamp(90px, 16vh, 140px);width:100%;display:flex;justify-content:space-around;align-items:center;background:rgba(0,0,0,0.1);padding:10px;gap:12px;box-sizing:border-box;';
        this.gameArea.appendChild(this.boxesArea);

        var self = this;
        
        // Açık Hece Kutusu (Open)
        this.boxOpen = window.Utils.createElement('div', 'box-open');
        this.boxOpen.style.cssText = 'flex:1;height:100%;background:linear-gradient(135deg, #4CAF50, #2E7D32);border-radius:18px;color:white;display:flex;justify-content:center;align-items:center;font-size:clamp(16px, 3.5vw, 24px);font-weight:bold;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.25);text-align:center;flex-direction:column;user-select:none;transition:transform 0.15s;';
        this.boxOpen.innerHTML = '<span>🟢 Açık Hece</span><span style="font-size:0.75em;opacity:0.9;margin-top:4px;font-weight:normal;">(Sesli ile biter: la, me)</span>';
        this.boxesArea.appendChild(this.boxOpen);
        this.boxOpen.addEventListener('click', function() { self.checkActiveCard('open'); });

        // Kapalı Hece Kutusu (Closed)
        this.boxClosed = window.Utils.createElement('div', 'box-closed');
        this.boxClosed.style.cssText = 'flex:1;height:100%;background:linear-gradient(135deg, #FF9800, #E65100);border-radius:18px;color:white;display:flex;justify-content:center;align-items:center;font-size:clamp(16px, 3.5vw, 24px);font-weight:bold;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.25);text-align:center;flex-direction:column;user-select:none;transition:transform 0.15s;';
        this.boxClosed.innerHTML = '<span>🟠 Kapalı Hece</span><span style="font-size:0.75em;opacity:0.9;margin-top:4px;font-weight:normal;">(Sessiz ile biter: el, kan)</span>';
        this.boxesArea.appendChild(this.boxClosed);
        this.boxClosed.addEventListener('click', function() { self.checkActiveCard('closed'); });
        
        this.activeCards = [];
        this.spawnCard();
        
        this.spawnIntervalId = setInterval(function() {
            if (!self.running) return;
            if (self.activeCards.length < 3) {
                self.spawnCard();
            }
        }, 2600);

        var lastTime = 0;
        function animate(time) {
            if (!self.running) return;
            if (!lastTime) lastTime = time;
            var dt = time - lastTime;
            lastTime = time;
            
            self.updateCards(dt);
            self.animationFrameId = requestAnimationFrame(animate);
        }
        this.animationFrameId = requestAnimationFrame(animate);
    };

    SyllableBoxGame.prototype.spawnCard = function() {
        if (!this.syllablePool || this.syllablePool.length === 0) {
            this.syllablePool = window.Utils.shuffle(this.syllables.slice());
        }
        var text = this.syllablePool.pop();
        
        var lastChar = text.charAt(text.length - 1);
        var isOpen = this.vowels.indexOf(lastChar) !== -1;
        
        var cardWidth = Math.max(70, Math.min(120, this.gameArea.clientWidth * 0.2));
        var cardHeight = Math.max(50, Math.min(80, this.gameArea.clientHeight * 0.1));

        var card = window.Utils.createElement('div', 'falling-card', text.toUpperCase());
        card.style.cssText = 'position:absolute;top:-' + cardHeight + 'px;min-width:' + cardWidth + 'px;height:' + cardHeight + 'px;background:white;color:#333;border:4px solid #4a148c;border-radius:16px;display:flex;justify-content:center;align-items:center;font-size:clamp(22px, 5vw, 36px);font-weight:900;box-shadow:0 6px 14px rgba(0,0,0,0.25);cursor:pointer;padding:0 15px;transition:transform 0.15s, border-color 0.15s;user-select:none;box-sizing:border-box;';
        this.fallingArea.appendChild(card);
        
        var containerWidth = this.fallingArea.clientWidth || window.innerWidth;
        var maxLeft = Math.max(10, containerWidth - cardWidth - 30);
        var startX = Math.max(10, Math.random() * maxLeft);
        card.style.left = startX + 'px';
        
        var containerHeight = this.fallingArea.clientHeight || 500;
        var fallDurationMs = 7000 + Math.random() * 3000; 
        
        var cardObj = {
            element: card,
            text: text,
            isOpen: isOpen,
            y: -cardHeight,
            speed: containerHeight / fallDurationMs
        };
        
        var self = this;
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            self.selectCard(cardObj);
        });
        
        // İlk kartı otomatik seç
        if (this.activeCards.length === 0) {
            this.selectCard(cardObj);
        }
        
        this.activeCards.push(cardObj);
    };

    SyllableBoxGame.prototype.selectCard = function(targetCard) {
        this.activeCards.forEach(function(c) {
            c.element.style.borderColor = '#4a148c';
            c.element.style.transform = 'scale(1)';
            c.selected = false;
            c.element.style.zIndex = '1';
        });
        targetCard.selected = true;
        targetCard.element.style.borderColor = '#00E676';
        targetCard.element.style.transform = 'scale(1.15)';
        targetCard.element.style.zIndex = '10';
        
        window.speechSynthesis.cancel();
        window.AudioManager.speakSyllable(targetCard.text);
    };

    SyllableBoxGame.prototype.updateCards = function(dt) {
        var containerHeight = this.fallingArea.clientHeight || 500;
        
        for (var i = this.activeCards.length - 1; i >= 0; i--) {
            var card = this.activeCards[i];
            card.y += card.speed * dt;
            card.element.style.top = card.y + 'px';
            
            if (card.y > containerHeight) {
                this.removeCard(i);
                this.autoSelectLowestCard();
            }
        }
    };

    SyllableBoxGame.prototype.autoSelectLowestCard = function() {
        if (this.activeCards.length === 0) return;
        
        var hasSelected = this.activeCards.some(function(c) { return c.selected; });
        if (hasSelected) return;

        var maxIdx = 0;
        var maxY = this.activeCards[0].y;
        for (var i = 1; i < this.activeCards.length; i++) {
            if (this.activeCards[i].y > maxY) {
                maxY = this.activeCards[i].y;
                maxIdx = i;
            }
        }
        this.selectCard(this.activeCards[maxIdx]);
    };

    SyllableBoxGame.prototype.checkActiveCard = function(boxType) {
        var selectedIdx = -1;
        for (var i = 0; i < this.activeCards.length; i++) {
            if (this.activeCards[i].selected) {
                selectedIdx = i;
                break;
            }
        }
        
        if (selectedIdx === -1 && this.activeCards.length > 0) {
            this.autoSelectLowestCard();
            return this.checkActiveCard(boxType);
        }
        
        if (selectedIdx === -1) return;
        
        var card = this.activeCards[selectedIdx];
        var isCorrect = (boxType === 'open' && card.isOpen) || (boxType === 'closed' && !card.isOpen);
        var targetBox = boxType === 'open' ? this.boxOpen : this.boxClosed;
        
        if (isCorrect) {
            this.showCorrectFeedback(targetBox);
            this.removeCard(selectedIdx);
            this.autoSelectLowestCard();
        } else {
            window.AudioManager.playWrong();
            window.AudioManager.playZort();
            window.Utils.shakeElement(targetBox);
            window.Utils.shakeElement(card.element);
        }
    };

    SyllableBoxGame.prototype.removeCard = function(index) {
        var card = this.activeCards[index];
        if (card && card.element && card.element.parentNode) {
            card.element.parentNode.removeChild(card.element);
        }
        this.activeCards.splice(index, 1);
    };

    SyllableBoxGame.prototype.destroy = function() {
        if (this.spawnIntervalId) {
            clearInterval(this.spawnIntervalId);
            this.spawnIntervalId = null;
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        window.BaseGame.prototype.destroy.call(this);
    };

    window.SyllableBoxGame = SyllableBoxGame;
})();
