(function() {
    function LetterPaintGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.targetLetter = '';
        this.currentExample = null;
        this.currentColor = '#FF5252';
        this.colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800'];
        this.paintedCells = {};
        this.outsideCells = 0;
        this.totalLetterCells = 0;
        this.isDrawing = false;
        this.hasMoved = false;
        this.lastX = 0;
        this.lastY = 0;
        this.gridSize = 20;
        this.soundInterval = null;
        this.roundCompleted = false;
    }

    LetterPaintGame.prototype = Object.create(window.BaseGame.prototype);
    LetterPaintGame.prototype.constructor = LetterPaintGame;

    LetterPaintGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.container.style.backgroundColor = '#fff';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        
        this.helpText = 'Büyük harfin üzerini parmağını sürterek rengarenk boya! Boyamayı bitirince sürpriz karakter ve sevimli nesnesi canlanacak!';
        this.helpIcon = '🎨';
        this.createHeader('Harf Boyama 🎨');

        var self = this;
        var letters = window.GameData.getAllLetters();
        var exLetters = window.GameData.pickUniqueItems('paint_intro', letters, 3);
        var examples = exLetters.map(function(l) {
            var info = window.GameData.getLetterInfo(l);
            var ex = (info && info.examples && info.examples.length)
                ? window.GameData.pickUniqueItems('paint_intro_ex_' + l, info.examples, 1)[0]
                : { word: l, emoji: '🎨' };
            return {
                text: window.Utils.toUpperTR(l) + ' ' + l + ' (' + ex.word + ')',
                sound: l,
                type: 'letter',
                word: ex.word,
                emoji: ex.emoji,
                image: ex.image
            };
        });

        this.showIntro({
            title: 'Gökkuşağı Harf Boyama! 🎨',
            icon: 'resim',
            description: 'Parmağını sürterek harfleri rengarenk boya! Boyadığın her harfin sürpriz nesnesi canlanacak.',
            voiceText: 'Parmağını harfin üzerinden sürterek rengarenk boya!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterPaintGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        
        this.gameArea = window.Utils.createElement('div', 'paint-game-area');
        this.gameArea.style.cssText =
            'flex:1;position:relative;display:flex;flex-direction:column;align-items:center;' +
            'justify-content:center;overflow:hidden;width:100%;background:#FAFAFA;';
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.canvas.style.touchAction = 'none';
        this.gameArea.appendChild(this.canvas);

        // Sol üst köşede o harfe ait sevimli nesne ipucu kartı
        this.cornerBadge = window.Utils.createElement('div', 'paint-corner-badge');
        this.cornerBadge.style.cssText =
            'position:absolute;top:12px;left:12px;z-index:5;background:white;border-radius:20px;' +
            'padding:8px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 14px rgba(0,0,0,0.15);' +
            'border:3px solid #FF9800;cursor:pointer;';
        this.gameArea.appendChild(this.cornerBadge);
        
        var bottomPanel = window.Utils.createElement('div', 'paint-bottom-panel');
        bottomPanel.style.cssText =
            'display:flex;align-items:center;justify-content:space-between;' +
            'padding:10px 16px;background:#f5f5f5;border-top:2px solid #e0e0e0;width:100%;box-sizing:border-box;flex-shrink:0;';

        this.palette = window.Utils.createElement('div', 'color-palette');
        this.palette.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;';

        var self = this;
        var resetBtn = window.Utils.createElement('button', 'paint-reset-btn');
        resetBtn.innerHTML = '🔄 <span>Temizle</span>';
        resetBtn.style.cssText =
            'padding:10px 18px;border:none;border-radius:20px;background:#FF7043;color:white;' +
            'font-size:clamp(14px, 3vw, 17px);font-weight:bold;cursor:pointer;box-shadow:0 3px 6px rgba(0,0,0,0.2);' +
            'white-space:nowrap;display:flex;align-items:center;gap:6px;';
        resetBtn.addEventListener('click', function() {
            window.AudioManager.playClick();
            self.resetCurrentLetter();
        });

        bottomPanel.appendChild(this.palette);
        bottomPanel.appendChild(resetBtn);

        this.container.appendChild(this.gameArea);
        this.container.appendChild(bottomPanel);
        
        this.setupEvents();
        this.createPalette();
        this.nextRound();
    };
    
    LetterPaintGame.prototype.createPalette = function() {
        var self = this;
        var shuffledColors = window.Utils.shuffle(this.colors.slice());
        var selectedColors = shuffledColors.slice(0, 7);
        this.currentColor = selectedColors[0];
        
        this.palette.innerHTML = '';
        selectedColors.forEach(function(color) {
            var colorBtn = window.Utils.createElement('div', 'color-btn');
            colorBtn.style.cssText =
                'width:38px;height:38px;border-radius:50%;background-color:' + color + ';' +
                'cursor:pointer;box-shadow:0 3px 6px rgba(0,0,0,0.2);' +
                'border:' + (color === self.currentColor ? '4px solid #222' : '3px solid white') + ';';
            
            colorBtn.addEventListener('click', function() {
                self.currentColor = color;
                window.AudioManager.playClick();
                var btns = self.palette.querySelectorAll('.color-btn');
                for (var i = 0; i < btns.length; i++) btns[i].style.border = '3px solid white';
                colorBtn.style.border = '4px solid #222';
                window.Utils.bounceElement(colorBtn);
            });
            
            self.palette.appendChild(colorBtn);
        });
    };

    LetterPaintGame.prototype.setupEvents = function() {
        var self = this;
        
        var getPos = function(e) {
            var rect = self.canvas.getBoundingClientRect();
            var clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            var clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };
        
        var startDraw = function(e) {
            if (self.roundCompleted) return;
            e.preventDefault();
            self.isDrawing = true;
            self.hasMoved = false;
            var pos = getPos(e);
            self.lastX = pos.x;
            self.lastY = pos.y;
        };
        
        var draw = function(e) {
            if (!self.isDrawing || self.roundCompleted) return;
            e.preventDefault();
            var pos = getPos(e);
            
            var dist = Math.hypot(pos.x - self.lastX, pos.y - self.lastY);
            if (dist > 3) {
                self.hasMoved = true;
                self.paintPath(self.lastX, self.lastY, pos.x, pos.y);
                self.lastX = pos.x;
                self.lastY = pos.y;
                self.checkProgress();
            }
        };
        
        var endDraw = function() {
            self.isDrawing = false;
            self.hasMoved = false;
        };
        
        this.canvas.addEventListener('mousedown', startDraw);
        this.canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', endDraw);
        
        this.canvas.addEventListener('touchstart', startDraw, {passive: false});
        this.canvas.addEventListener('touchmove', draw, {passive: false});
        this.canvas.addEventListener('touchend', endDraw);
    };

    LetterPaintGame.prototype.paintPath = function(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = Math.max(28, this.canvas.width * 0.085);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.stroke();
        
        var steps = Math.max(1, Math.abs(x2 - x1), Math.abs(y2 - y1));
        for (var i = 0; i <= steps; i += 6) {
            var px = x1 + (x2 - x1) * (i / steps);
            var py = y1 + (y2 - y1) * (i / steps);
            
            var r = this.ctx.lineWidth / 2;
            for (var dx = -r; dx <= r; dx += this.gridSize) {
                for (var dy = -r; dy <= r; dy += this.gridSize) {
                    var gx = Math.floor((px + dx) / this.gridSize);
                    var gy = Math.floor((py + dy) / this.gridSize);
                    var key = gx + ',' + gy;
                    
                    if (this.letterMask[key]) {
                        this.paintedCells[key] = true;
                    } else {
                        this.outsideCells++;
                    }
                }
            }
        }
    };
    
    LetterPaintGame.prototype.checkProgress = function() {
        if (this.totalLetterCells === 0) return;
        
        if (this.outsideCells > this.totalLetterCells * 3.8) {
            var self = this;
            this.roundCompleted = true;
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord('Tekrar deneyelim!');
            setTimeout(function() {
                self.resetCurrentLetter();
            }, 1000);
            return;
        }

        var painted = Object.keys(this.paintedCells).length;
        var percentage = painted / this.totalLetterCells;
        
        if (percentage >= 0.52 && !this.roundCompleted) {
            this.roundCompleted = true;
            this.completeRound();
        }
    };

    LetterPaintGame.prototype.resetCurrentLetter = function() {
        this.roundCompleted = false;
        this.paintedCells = {};
        this.outsideCells = 0;
        this.drawLetterOutline();
    };

    LetterPaintGame.prototype.completeRound = function() {
        var self = this;
        if (this.soundInterval) clearInterval(this.soundInterval);
        
        this.showCorrectFeedback(this.canvas);
        
        var minDim = Math.min(this.canvas.width, this.canvas.height);
        var celebrationWrap = window.Utils.createElement('div', 'paint-celebration-wrap');
        celebrationWrap.style.cssText =
            'position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(0);' +
            'transition:transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);z-index:10;' +
            'display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.95);' +
            'padding:18px 28px;border-radius:32px;border:5px solid ' + this.currentColor + ';' +
            'box-shadow:0 16px 40px rgba(0,0,0,0.3);';

        var cuteLetter = window.SvgLetters.createLetter(this.targetLetter, minDim * 0.36, this.currentColor);
        var cuteObj = window.SvgLetters.createObjectImage(this.currentExample, minDim * 0.36, { showLabel: true, animate: true });
        celebrationWrap.appendChild(cuteLetter);
        celebrationWrap.appendChild(cuteObj);
        
        this.gameArea.appendChild(celebrationWrap);
        
        setTimeout(function() {
            celebrationWrap.style.transform = 'translate(-50%, -50%) scale(1)';
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentExample ? self.currentExample.word : self.targetLetter);
            window.AudioManager.playApplause();
            window.Utils.showConfetti(self.container);
        }, 80);
        
        setTimeout(function() {
            self.transitionToNextRound(function() {
                if (celebrationWrap.parentNode) celebrationWrap.parentNode.removeChild(celebrationWrap);
                self.createPalette();
                self.nextRound();
            });
        }, 2400);
    };

    LetterPaintGame.prototype.drawLetterOutline = function() {
        this.letterMask = {};
        this.totalLetterCells = 0;

        var rect = this.gameArea.getBoundingClientRect();
        var w = rect.width > 0 ? rect.width : window.innerWidth;
        var h = rect.height > 0 ? rect.height : window.innerHeight - 100;
        
        this.canvas.width = w;
        this.canvas.height = h;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        var fontSize = Math.min(this.canvas.width, this.canvas.height) * 0.72;
        this.ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        var textX = this.canvas.width / 2;
        var textY = this.canvas.height / 2;
        var displayLetter = window.Utils.toUpperTR(this.targetLetter);
        
        this.ctx.lineWidth = Math.max(36, fontSize * 0.16);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#E0E0E0';
        this.ctx.strokeText(displayLetter, textX, textY);
        
        var imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var data = imgData.data;
        
        for (var y = 0; y < this.canvas.height; y += this.gridSize) {
            for (var x = 0; x < this.canvas.width; x += this.gridSize) {
                var idx = (y * this.canvas.width + x) * 4 + 3;
                if (data[idx] > 50) {
                    var gx = Math.floor(x / this.gridSize);
                    var gy = Math.floor(y / this.gridSize);
                    this.letterMask[gx + ',' + gy] = true;
                    this.totalLetterCells++;
                }
            }
        }
        
        this.ctx.setLineDash([8, 14]);
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#9E9E9E';
        this.ctx.strokeText(displayLetter, textX, textY);
        this.ctx.setLineDash([]);
    };

    LetterPaintGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        
        this.roundCompleted = false;
        this.paintedCells = {};
        this.outsideCells = 0;
        
        var availableLetters = window.GameData.getAllLetters();
        this.targetLetter = window.GameData.pickUniqueItems('paint_letters', availableLetters, 1)[0];
        var info = window.GameData.getLetterInfo(this.targetLetter);
        this.currentExample = (info && info.examples && info.examples.length)
            ? window.GameData.pickUniqueItems('paint_ex_' + this.targetLetter, info.examples, 1)[0]
            : { word: this.targetLetter, emoji: '🎨' };

        if (this.cornerBadge) {
            this.cornerBadge.innerHTML = '';
            var miniObj = window.SvgLetters.createObjectImage(this.currentExample, 48, { bg: false, animate: true });
            var lbl = window.Utils.createElement('div', '', window.Utils.toUpperTR(this.targetLetter) + ' → ' + this.currentExample.word.toUpperCase());
            lbl.style.cssText = 'font-weight:900;font-size:clamp(14px, 2.8vw, 18px);color:#333;';
            this.cornerBadge.appendChild(miniObj);
            this.cornerBadge.appendChild(lbl);
            this.cornerBadge.onclick = function() {
                window.Utils.bounceElement(self.cornerBadge);
                window.speechSynthesis.cancel();
                window.AudioManager.speakWord(self.currentExample.word);
            };
        }
        
        this.drawLetterOutline();
        
        if (this.soundInterval) clearInterval(this.soundInterval);
        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(self.targetLetter);
        }, 350);
    };

    LetterPaintGame.prototype.destroy = function() {
        if (this.soundInterval) clearInterval(this.soundInterval);
        window.BaseGame.prototype.destroy.call(this);
    };

    window.LetterPaintGame = LetterPaintGame;
})();
