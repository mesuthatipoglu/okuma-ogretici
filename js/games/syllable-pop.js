(function () {
    function SyllablePopGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.bubbles = [];
        this.targetSyllable = '';
        this.animationFrameId = null;
        this.spawnTimer = null;
        this.completed = false;
    }

    SyllablePopGame.prototype = Object.create(window.BaseGame.prototype);
    SyllablePopGame.prototype.constructor = SyllablePopGame;

    SyllablePopGame.prototype.init = function () {
        window.BaseGame.prototype.init.call(this);
        
        this.container.innerHTML = '';
        this.helpText = 'Yukarıda yazan heceyi dinle ve uçan baloncuklar arasından onu patlat!';
        this.helpIcon = '🫧';
        this.createHeader('Hece Baloncukları 🫧');

        var self = this;
        var syllables = window.GameData.generateSyllables(this.maxGroup);
        var exSyls = (syllables && syllables.length >= 3) ? syllables.slice(0, 3) : [{text: 'el'}, {text: 'al'}, {text: 'le'}];
        var examples = exSyls.map(function(s) {
            return { text: s.text.toUpperCase() + ' (' + s.text + ')', sound: s.text, type: 'syllable', emoji: '🫧' };
        });

        this.showIntro({
            title: 'Hece Baloncukları! 🫧',
            icon: '🫧',
            description: 'Uçan baloncukların içinde heceler var! Yukarıdaki heceyi dinle ve doğru balona dokunarak patlat.',
            voiceText: 'Yukarıdaki heceyi dinle ve doğru balona dokunarak patlat!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    SyllablePopGame.prototype.startGameplay = function () {
        var self = this;
        this.container.innerHTML = '';
        this.gameArea = window.Utils.createElement('div', 'game-area syllable-pop-area');
        this.gameArea.style.cssText =
            'position:relative;width:100%;flex:1;overflow:hidden;background:#e0f7fa;box-sizing:border-box;';
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
            'font-size:clamp(28px, 6vw, 42px);font-weight:900;color:#00838F;min-width:60px;text-align:center;';
        this.targetArea.appendChild(this.targetText);
        
        var replayBtn = window.Utils.createElement('button', 'replay-btn', '🔊');
        replayBtn.style.cssText =
            'border:none;border-radius:50%;width:38px;height:38px;background:#00ACC1;color:white;' +
            'font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);';
        replayBtn.onclick = function() {
            if (self.targetSyllable) {
                window.speechSynthesis.cancel();
                window.AudioManager.speakSyllable(self.targetSyllable);
                window.Utils.pulseElement(self.targetArea);
            }
        };
        this.targetArea.appendChild(replayBtn);
        
        this.gameArea.appendChild(this.targetArea);
        
        this.bubbles = [];
        this.completed = false;
        this._syllablePool = [];

        for (var i = 0; i < 5; i++) {
            this.spawnBubble(this.getNextSyllable(), true);
        }

        // Ekrandaki balonlardan birini hedef seç
        var active = this.bubbles.filter(function(b) { return !b.popped; });
        if (active.length > 0) {
            this.setNewTarget(active[0].text);
        }

        // Sürekli balon döngüsü ve spawner
        this.lastTime = performance.now();
        this.animateBubbles();

        // Her 2.5 saniyede bir eksik balonları tamamla
        this.spawnTimer = setInterval(function() {
            if (!self.running) return;
            var currentActive = self.bubbles.filter(function(b) { return !b.popped; });
            if (currentActive.length < 6) {
                self.spawnBubble(self.getNextSyllable(), false);
            }
        }, 2200);
    };

    SyllablePopGame.prototype.getNextSyllable = function() {
        if (!this._syllablePool || this._syllablePool.length === 0) {
            var syls = window.GameData.generateSyllables(Math.max(this.maxGroup || 1, 2));
            if (!syls || syls.length < 6) {
                syls = window.GameData.generateSyllables(3);
            }
            if (!syls || syls.length === 0) {
                syls = [{text:'el'}, {text:'le'}, {text:'al'}, {text:'la'}, {text:'ek'}, {text:'ke'}];
            }
            this._syllablePool = window.Utils.shuffle(syls.slice());
        }
        var item = this._syllablePool.pop();
        return typeof item === 'object' ? item.text : item;
    };

    SyllablePopGame.prototype.setNewTarget = function(syllableText) {
        var self = this;
        this.targetSyllable = syllableText;
        this.targetText.textContent = syllableText.toUpperCase();
        window.Utils.pulseElement(this.targetArea);

        setTimeout(function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakSyllable(syllableText);
        }, 200);
    };

    SyllablePopGame.prototype.spawnBubble = function(syllableText, initialSpread) {
        var self = this;
        var gameRect = this.gameArea.getBoundingClientRect();
        var width = gameRect.width || this.gameArea.clientWidth || window.innerWidth;
        var height = gameRect.height || this.gameArea.clientHeight || window.innerHeight;
        
        var bubbleSize = Math.min(width, height) * 0.18;
        bubbleSize = Math.max(bubbleSize, 65);
        bubbleSize = Math.min(bubbleSize, 110);

        var color = window.GameData.getRandomColor();
        var bubbleEl = window.SvgLetters.createSyllableCard(syllableText, bubbleSize, color);
        bubbleEl.style.position = 'absolute';
        bubbleEl.style.borderRadius = '50%';
        bubbleEl.style.border = '4px solid white';
        bubbleEl.style.boxShadow = 'inset 0 0 20px rgba(255,255,255,0.6), 0 6px 14px rgba(0,0,0,0.2)';
        bubbleEl.style.cursor = 'pointer';
        bubbleEl.style.transition = 'transform 0.15s';

        var x = Math.random() * (width - bubbleSize);
        var y = initialSpread ? (Math.random() * (height - 180) + 90) : (height + Math.random() * 40);

        bubbleEl.style.left = x + 'px';
        bubbleEl.style.top = y + 'px';

        // Canlı, eğlenceli ve akıcı hız (önceki hantal hız yerine)
        var speedY = -(Math.random() * 0.7 + 0.85); // ~1.2 px/frame
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
            text: syllableText,
            size: bubbleSize,
            popped: false
        };

        bubbleEl.onclick = function() {
            self.onBubbleTap(bubbleData);
        };

        this.bubbles.push(bubbleData);
        return bubbleData;
    };

    SyllablePopGame.prototype.animateBubbles = function() {
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
                var currentX = b.x + Math.sin(b.phase) * 18;

                // Ekranın üstünden çıkınca alt kısımdan tekrar başlasın
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

    SyllablePopGame.prototype.onBubbleTap = function(bubbleData) {
        if (bubbleData.popped || this.completed) return;
        var self = this;

        if (bubbleData.text === this.targetSyllable) {
            bubbleData.popped = true;
            this.completed = true;

            // 1. Balonun tam patladığı yerdeki koordinatları al
            var bRect = bubbleData.el.getBoundingClientRect();
            var areaRect = self.gameArea.getBoundingClientRect();
            var popX = (bRect.left - areaRect.left) + bRect.width / 2;
            var popY = (bRect.top - areaRect.top) + bRect.height / 2;

            // Patladığı yerde anında parlayan yıldız efekti
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

            // Patlama animasyonu
            bubbleData.el.style.transform = 'scale(1.6)';
            bubbleData.el.style.opacity = '0';
            window.AudioManager.playPop();
            window.AudioManager.playCorrect();
            this.showCorrectFeedback(this.targetArea);

            setTimeout(function() {
                if (bubbleData.el.parentNode) {
                    bubbleData.el.parentNode.removeChild(bubbleData.el);
                }
                
                // Balon listesini temizle
                self.bubbles = self.bubbles.filter(function(b) { return !b.popped; });

                // Kullanıcının istediği gibi: Ekrandaki mevcut balonlardan yeni hedef seç!
                if (self.bubbles.length > 0) {
                    var nextTargetBubble = window.Utils.randomItem(self.bubbles);
                    self.setNewTarget(nextTargetBubble.text);
                } else {
                    // Ekrandaki tüm balonlar bitmişse hemen yeni bir balon yarat ve hedef yap
                    var spawned = self.spawnBubble(self.getNextSyllable(), false);
                    self.setNewTarget(spawned.text);
                }

                self.completed = false;
            }, 600);

        } else {
            window.AudioManager.playWrong();
            window.AudioManager.playZort();
            window.Utils.shakeElement(bubbleData.el);
        }
    };

    SyllablePopGame.prototype.destroy = function () {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
        }
        window.BaseGame.prototype.destroy.call(this);
    };

    window.SyllablePopGame = SyllablePopGame;
})();
