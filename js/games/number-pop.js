(function() {
    'use strict';

    /**
     * Sayı Balonları 🎈
     * Uçuşan balonlar arasından hedef sayıyı bulup patlatma oyunu
     */
    function NumberPopGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'number-pop';
        this.level = options.maxGroup || 1;
        this.bubbles = [];
        this.targetNumber = 1;
        this.animationFrameId = null;
        this.spawnTimer = null;
        this.completed = false;
        this.numbersPool = [];
    }

    NumberPopGame.prototype = Object.create(window.BaseGame.prototype);
    NumberPopGame.prototype.constructor = NumberPopGame;

    NumberPopGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        
        this.helpText = 'Yukarıda yazan sayıyı dinle ve uçan renkli balonlar arasından o sayıyı patlat!';
        this.helpIcon = '🎈';
        this.createHeader('Sayı Balonları 🎈');

        var self = this;
        this.showIntro({
            title: 'Sayı Balonları! 🎈',
            icon: '🎈',
            description: 'Uçuşan balonların üzerinde sayılar var.\nYukarıdaki hedef sayıyı dinle ve doğru balonu patlat!',
            voiceText: 'Yukarıdaki sayıyı dinle ve doğru balona dokunarak patlat!',
            examples: [
                { text: 'Balon: 7', sound: '7', emoji: '🎈' },
                { text: 'Balon: 15', sound: '15', emoji: '🎈' },
                { text: 'Balon: 24', sound: '24', emoji: '🎈' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    NumberPopGame.prototype.startGameplay = function() {
        var self = this;
        this.container.innerHTML = '';
        this.createHeader('Sayı Balonları 🎈');
        
        this.gameArea = window.Utils.createElement('div', 'game-area number-pop-area');
        this.gameArea.style.cssText =
            'position:relative;width:100%;flex:1;overflow:hidden;background:#e8eaf6;box-sizing:border-box;';
        this.container.appendChild(this.gameArea);
        
        // Hedef Gösterge Alanı (Üstte)
        this.targetArea = window.Utils.createElement('div', 'target-area');
        this.targetArea.style.cssText =
            'position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:10;' +
            'display:flex;align-items:center;gap:12px;padding:8px 24px;' +
            'background:white;border-radius:30px;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
        
        this.targetLabel = window.Utils.createElement('span', 'target-label', 'Hedef:');
        this.targetLabel.style.cssText = 'font-size:clamp(13px, 2.8vw, 16px);color:#666;font-weight:bold;';
        this.targetArea.appendChild(this.targetLabel);

        this.targetText = window.Utils.createElement('div', 'target-text');
        this.targetText.style.cssText =
            'font-size:clamp(28px, 6vw, 42px);font-weight:900;color:#303F9F;min-width:60px;text-align:center;';
        this.targetArea.appendChild(this.targetText);
        
        var replayBtn = window.Utils.createElement('button', 'replay-btn', '🔊');
        replayBtn.style.cssText =
            'border:none;border-radius:50%;width:38px;height:38px;background:#3F51B5;color:white;' +
            'font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);';
        replayBtn.onclick = function() {
            if (self.targetNumber) {
                window.speechSynthesis.cancel();
                window.AudioManager.speakNumber(self.targetNumber);
                window.Utils.pulseElement(self.targetArea);
            }
        };
        this.targetArea.appendChild(replayBtn);
        this.gameArea.appendChild(this.targetArea);
        
        this.bubbles = [];
        this.completed = false;
        
        // İlk 5 balonu üret
        for (var i = 0; i < 5; i++) {
            this.spawnBubble(this.getNextNumber(), true);
        }

        // Ekrandaki balonlardan birini hedef seç
        var active = this.bubbles.filter(function(b) { return !b.popped; });
        if (active.length > 0) {
            this.setNewTarget(active[0].num);
        }

        this.lastTime = performance.now();
        this.animateBubbles();

        // Her 2.2 saniyede bir eksik balonları tamamla
        this.spawnTimer = setInterval(function() {
            if (!self.running) return;
            var currentActive = self.bubbles.filter(function(b) { return !b.popped; });
            if (currentActive.length < 6) {
                self.spawnBubble(self.getNextNumber(), false);
            }
        }, 2200);
    };

    NumberPopGame.prototype.getNextNumber = function() {
        if (!this.numbersPool || this.numbersPool.length === 0) {
            var list = window.GameData.getNumbers(this.level);
            this.numbersPool = window.Utils.shuffle(list.map(function(item) { return item.num; }));
        }
        return this.numbersPool.pop();
    };

    NumberPopGame.prototype.setNewTarget = function(numberVal) {
        this.targetNumber = numberVal;
        this.targetText.textContent = String(numberVal);
        window.Utils.pulseElement(this.targetArea);

        setTimeout(function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakNumber(numberVal);
        }, 200);
    };

    NumberPopGame.prototype.spawnBubble = function(numberVal, initialSpread) {
        var self = this;
        var gameRect = this.gameArea.getBoundingClientRect();
        var width = gameRect.width || this.gameArea.clientWidth || window.innerWidth;
        var height = gameRect.height || this.gameArea.clientHeight || window.innerHeight;
        
        var bubbleSize = Math.min(width, height) * 0.18;
        bubbleSize = Math.max(bubbleSize, 65);
        bubbleSize = Math.min(bubbleSize, 105);

        var color = window.GameData.getRandomColor();

        var bubbleEl = window.Utils.createElement('div', 'number-bubble-card', String(numberVal));
        bubbleEl.style.cssText =
            'position:absolute;border-radius:50%;background:' + color + ';color:white;' +
            'width:' + bubbleSize + 'px;height:' + bubbleSize + 'px;display:flex;align-items:center;justify-content:center;' +
            'font-size:clamp(22px, 5vw, 36px);font-weight:900;border:4px solid white;cursor:pointer;' +
            'box-shadow:inset 0 0 20px rgba(255,255,255,0.5), 0 6px 14px rgba(0,0,0,0.2);transition:transform 0.15s;user-select:none;';

        var x = Math.random() * (width - bubbleSize);
        var y = initialSpread ? (Math.random() * (height - 180) + 90) : (height + Math.random() * 40);

        bubbleEl.style.left = x + 'px';
        bubbleEl.style.top = y + 'px';

        var speedY = -(Math.random() * 0.65 + 0.85);
        var speedX = (Math.random() - 0.5) * 0.4;
        var phase = Math.random() * Math.PI * 2;

        this.gameArea.appendChild(bubbleEl);

        var bubbleData = {
            el: bubbleEl,
            x: x,
            y: y,
            speedY: speedY,
            speedX: speedX,
            phase: phase,
            num: numberVal,
            size: bubbleSize,
            popped: false
        };

        bubbleEl.onclick = function() {
            self.onBubbleTap(bubbleData);
        };

        this.bubbles.push(bubbleData);
        return bubbleData;
    };

    NumberPopGame.prototype.animateBubbles = function() {
        var self = this;
        this.animationFrameId = requestAnimationFrame(function(time) {
            var dt = time - self.lastTime;
            self.lastTime = time;
            var factor = Math.min(2.0, dt / 16.6);

            var gameRect = self.gameArea.getBoundingClientRect();
            var width = gameRect.width || self.gameArea.clientWidth || window.innerWidth;
            var height = gameRect.height || self.gameArea.clientHeight || window.innerHeight;

            for (var i = 0; i < self.bubbles.length; i++) {
                var b = self.bubbles[i];
                if (b.popped) continue;

                b.y += b.speedY * factor;
                b.phase += 0.04 * factor;
                var currentX = b.x + Math.sin(b.phase) * 16;

                if (b.y < -b.size) {
                    b.y = height + 40;
                    b.x = Math.random() * (width - b.size);
                }

                b.el.style.top = b.y + 'px';
                b.el.style.left = currentX + 'px';
            }

            if (self.running) {
                self.animateBubbles();
            }
        });
    };

    NumberPopGame.prototype.onBubbleTap = function(bubbleData) {
        if (bubbleData.popped || this.completed) return;
        var self = this;

        if (bubbleData.num === this.targetNumber) {
            bubbleData.popped = true;
            this.completed = true;

            var bRect = bubbleData.el.getBoundingClientRect();
            var areaRect = self.gameArea.getBoundingClientRect();
            var popX = (bRect.left - areaRect.left) + bRect.width / 2;
            var popY = (bRect.top - areaRect.top) + bRect.height / 2;

            var burstStar = window.Utils.createElement('div', 'pop-star', '⭐');
            burstStar.style.cssText =
                'position:absolute;left:' + (popX - 25) + 'px;top:' + (popY - 25) + 'px;' +
                'font-size:45px;pointer-events:none;z-index:200;';
            self.gameArea.appendChild(burstStar);

            burstStar.animate([
                { transform: 'scale(0.3) rotate(0deg)', opacity: 1 },
                { transform: 'scale(1.3) translateY(-25px) rotate(180deg)', opacity: 1, offset: 0.6 },
                { transform: 'scale(0.8) translateY(-40px) rotate(360deg)', opacity: 0 }
            ], { duration: 700, easing: 'ease-out' }).onfinish = function() {
                if (burstStar.parentNode) burstStar.parentNode.removeChild(burstStar);
            };

            bubbleData.el.style.transform = 'scale(1.6)';
            bubbleData.el.style.opacity = '0';
            window.AudioManager.playPop();
            window.AudioManager.playCorrect();
            this.showCorrectFeedback(this.targetArea);

            setTimeout(function() {
                if (bubbleData.el.parentNode) {
                    bubbleData.el.parentNode.removeChild(bubbleData.el);
                }
                
                self.bubbles = self.bubbles.filter(function(b) { return !b.popped; });

                if (self.bubbles.length > 0) {
                    var nextTargetBubble = window.Utils.randomItem(self.bubbles);
                    self.setNewTarget(nextTargetBubble.num);
                } else {
                    var spawned = self.spawnBubble(self.getNextNumber(), false);
                    self.setNewTarget(spawned.num);
                }

                self.completed = false;
            }, 600);

        } else {
            window.AudioManager.playWrong();
            window.AudioManager.playZort();
            window.Utils.shakeElement(bubbleData.el);
        }
    };

    NumberPopGame.prototype.destroy = function() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
        }
        window.BaseGame.prototype.destroy.call(this);
    };

    window.NumberPopGame = NumberPopGame;
})();
