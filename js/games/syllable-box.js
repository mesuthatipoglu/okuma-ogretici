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
        this.helpText = 'Düşen resimli heceleri doğru kutuya yerleştir! Sesli harfle bitenler Açık Hece (la, me), sessiz harfle bitenler Kapalı Hecedir (el, kan).';
        this.helpIcon = '📦';
        this.createHeader('Hece Kutusu 📦');
        
        var self = this;
        var visLa = window.GameData.getSyllableVisual('la');
        var visEl = window.GameData.getSyllableVisual('el');
        var visMe = window.GameData.getSyllableVisual('me');
        this.showIntro({
            title: 'Hece Kutusu! 📦',
            icon: '📦',
            description: 'Düşen resimli heceleri doğru kutuya koy!\n\n🟢 Açık Hece: Sesli harf ile biter (LA, ME)\n🟠 Kapalı Hece: Sessiz harf ile biter (EL, AL)',
            voiceText: 'Düşen heceleri açık veya kapalı hece kutusuna yerleştir!',
            examples: [
                { text: 'Açık: LA (' + visLa.word + ')', type: 'syllable', sound: 'la', emoji: visLa.emoji, image: visLa.image },
                { text: 'Açık: ME (' + visMe.word + ')', type: 'syllable', sound: 'me', emoji: visMe.emoji, image: visMe.image },
                { text: 'Kapalı: EL (' + visEl.word + ')', type: 'syllable', sound: 'el', emoji: visEl.emoji, image: visEl.image }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    SyllableBoxGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Hece Kutusu 📦');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area syllable-box-area');
        this.gameArea.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;display:flex;flex-direction:column;box-sizing:border-box;';
        this.container.appendChild(this.gameArea);

        var data = window.GameData.generateSyllables(this.maxGroup);
        if (data && data.length > 0) {
            this.syllables = data.map(function(item) { return item.text.toLowerCase(); });
        } else {
            this.syllables = ['la', 'el', 'me', 'ak', 'ko', 'ok', 'ka', 'al'];
        }

        this.fallingArea = window.Utils.createElement('div', 'falling-area');
        this.fallingArea.style.cssText = 'flex:1;position:relative;width:100%;overflow:hidden;';
        this.gameArea.appendChild(this.fallingArea);

        this.boxesArea = window.Utils.createElement('div', 'boxes-area');
        this.boxesArea.style.cssText = 'height:clamp(88px, 16vh, 132px);width:100%;display:flex;justify-content:space-around;align-items:center;background:rgba(0,0,0,0.12);padding:10px;gap:12px;box-sizing:border-box;';
        this.gameArea.appendChild(this.boxesArea);

        var self = this;
        
        // Açık Hece Kutusu (Open)
        this.boxOpen = window.Utils.createElement('div', 'box-open');
        this.boxOpen.style.cssText = 'flex:1;height:100%;background:linear-gradient(135deg, #4CAF50, #2E7D32);border-radius:20px;color:white;display:flex;justify-content:center;align-items:center;font-size:clamp(16px, 3.5vw, 24px);font-weight:900;cursor:pointer;box-shadow:0 6px 14px rgba(0,0,0,0.25);text-align:center;flex-direction:column;user-select:none;transition:transform 0.15s;border:3px solid rgba(255,255,255,0.5);';
        this.boxOpen.innerHTML = '<span>🟢 Açık Hece</span><span style="font-size:0.72em;opacity:0.95;margin-top:4px;font-weight:700;">(Sesli ile biter: LA, ME)</span>';
        this.boxesArea.appendChild(this.boxOpen);
        this.boxOpen.addEventListener('click', function() { self.checkActiveCard('open'); });

        // Kapalı Hece Kutusu (Closed)
        this.boxClosed = window.Utils.createElement('div', 'box-closed');
        this.boxClosed.style.cssText = 'flex:1;height:100%;background:linear-gradient(135deg, #FF9800, #E65100);border-radius:20px;color:white;display:flex;justify-content:center;align-items:center;font-size:clamp(16px, 3.5vw, 24px);font-weight:900;cursor:pointer;box-shadow:0 6px 14px rgba(0,0,0,0.25);text-align:center;flex-direction:column;user-select:none;transition:transform 0.15s;border:3px solid rgba(255,255,255,0.5);';
        this.boxClosed.innerHTML = '<span>🟠 Kapalı Hece</span><span style="font-size:0.72em;opacity:0.95;margin-top:4px;font-weight:700;">(Sessiz ile biter: EL, AL)</span>';
        this.boxesArea.appendChild(this.boxClosed);
        this.boxClosed.addEventListener('click', function() { self.checkActiveCard('closed'); });
        
        this.activeCards = [];
        this.spawnCard();
        
        this.spawnIntervalId = setInterval(function() {
            if (!self.running) return;
            if (self.activeCards.length < 3) {
                self.spawnCard();
            }
        }, 2700);

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
        var text = window.GameData.pickUniqueItems('syllable-box-deck', this.syllables, 1)[0] || 'la';
        var vis = window.GameData.getSyllableVisual(text);
        
        var lastChar = text.charAt(text.length - 1);
        var isOpen = this.vowels.indexOf(lastChar) !== -1;
        
        var rect = this.fallingArea.getBoundingClientRect();
        var containerWidth = rect.width || this.fallingArea.clientWidth || window.innerWidth;
        var containerHeight = rect.height || this.fallingArea.clientHeight || 480;

        var cardWidth = Math.max(105, Math.min(155, containerWidth * 0.26));
        var cardHeight = Math.max(72, Math.min(100, containerHeight * 0.18));

        var card = window.Utils.createElement('div', 'falling-card');
        card.style.cssText =
            'position:absolute;top:-' + cardHeight + 'px;min-width:' + cardWidth + 'px;height:' + cardHeight + 'px;' +
            'background:rgba(255,255,255,0.96);color:#333;border:4px solid #7B1FA2;border-radius:20px;' +
            'display:flex;justify-content:center;align-items:center;gap:8px;' +
            'box-shadow:0 8px 18px rgba(0,0,0,0.22);cursor:pointer;padding:6px 12px;' +
            'transition:transform 0.15s, border-color 0.15s;user-select:none;box-sizing:border-box;';

        var iconEl = window.SvgLetters.createObjectImage(vis, Math.round(cardHeight * 0.62));
        card.appendChild(iconEl);

        var textWrap = window.Utils.createElement('div', '');
        textWrap.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;';
        var sylLbl = window.Utils.createElement('div', '', window.Utils.toUpperTR(text));
        sylLbl.style.cssText = 'font-size:clamp(20px, 4.2vw, 30px);font-weight:900;color:#4A148C;line-height:1;';
        var wordLbl = window.Utils.createElement('div', '', vis.word);
        wordLbl.style.cssText = 'font-size:clamp(10px, 2vw, 12px);font-weight:800;color:#6A1B9A;';
        textWrap.appendChild(sylLbl);
        textWrap.appendChild(wordLbl);
        card.appendChild(textWrap);

        this.fallingArea.appendChild(card);
        
        var maxLeft = Math.max(10, containerWidth - cardWidth - 20);
        var startX = Math.max(10, Math.random() * maxLeft);
        card.style.left = startX + 'px';
        
        var fallDurationMs = 7500 + Math.random() * 2500; 
        
        var cardObj = {
            element: card,
            text: text,
            vis: vis,
            isOpen: isOpen,
            y: -cardHeight,
            speed: containerHeight / fallDurationMs
        };
        
        var self = this;
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            self.selectCard(cardObj);
        });
        
        if (this.activeCards.length === 0) {
            this.selectCard(cardObj);
        }
        
        this.activeCards.push(cardObj);
    };

    SyllableBoxGame.prototype.selectCard = function(targetCard) {
        this.activeCards.forEach(function(c) {
            c.element.style.borderColor = '#7B1FA2';
            c.element.style.transform = 'scale(1)';
            c.selected = false;
            c.element.style.zIndex = '1';
        });
        targetCard.selected = true;
        targetCard.element.style.borderColor = '#00E676';
        targetCard.element.style.transform = 'scale(1.14)';
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
            window.Utils.celebrateElement(targetBox);
            this.removeCard(selectedIdx);
            this.autoSelectLowestCard();
            if (this.activeCards.length === 0) {
                this.spawnCard();
            }
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
