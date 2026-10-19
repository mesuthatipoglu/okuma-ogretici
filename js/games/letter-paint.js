(function() {
    function LetterPaintGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.targetLetter = '';
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
        
        this.helpText = 'Büyük harfin üzerini parmağını sürterek boya! Temizle butonu ile baştan başlayabilirsin.';
        this.helpIcon = '🎨';
        this.createHeader('Harf Boyama 🎨');

        var self = this;
        var letters = window.GameData.getAllLetters();
        var exLetters = letters.slice(0, 4);
        var examples = exLetters.map(function(l) {
            return { text: l.toUpperCase() + ' ' + l, sound: l, type: 'letter', emoji: '🎨' };
        });

        this.showIntro({
            title: 'Harf Boyama! 🎨',
            icon: '🎨',
            description: 'Parmağını sürterek harfleri boya! Tüm alfabedeki harfleri sırayla boyayabilirsin.',
            voiceText: 'Parmağını harfin üzerinden sürterek boya!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterPaintGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        
        this.gameArea = window.Utils.createElement('div', 'paint-game-area');
        this.gameArea.style.flex = '1';
        this.gameArea.style.position = 'relative';
        this.gameArea.style.display = 'flex';
        this.gameArea.style.flexDirection = 'column';
        this.gameArea.style.alignItems = 'center';
        this.gameArea.style.justifyContent = 'center';
        this.gameArea.style.overflow = 'hidden';
        this.gameArea.style.width = '100%';
        
        // Canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.canvas.style.touchAction = 'none';
        this.gameArea.appendChild(this.canvas);
        
        // Alt Kontrol Paneli (Palet + Temizle Butonu)
        var bottomPanel = window.Utils.createElement('div', 'paint-bottom-panel');
        bottomPanel.style.cssText =
            'display:flex;align-items:center;justify-content:space-between;' +
            'padding:10px 16px;background:#f5f5f5;border-top:2px solid #e0e0e0;width:100%;box-sizing:border-box;';

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
        var shuffledColors = this.colors.slice();
        window.Utils.shuffle(shuffledColors);
        var selectedColors = shuffledColors.slice(0, 6);
        this.currentColor = selectedColors[0];
        
        this.palette.innerHTML = '';
        selectedColors.forEach(function(color) {
            var colorBtn = window.Utils.createElement('div', 'color-btn');
            colorBtn.style.width = '36px';
            colorBtn.style.height = '36px';
            colorBtn.style.borderRadius = '50%';
            colorBtn.style.backgroundColor = color;
            colorBtn.style.cursor = 'pointer';
            colorBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            colorBtn.style.border = color === self.currentColor ? '3px solid #333' : '3px solid transparent';
            
            colorBtn.addEventListener('click', function() {
                self.currentColor = color;
                window.AudioManager.playClick();
                var btns = self.palette.querySelectorAll('.color-btn');
                for (var i = 0; i < btns.length; i++) btns[i].style.border = '3px solid transparent';
                colorBtn.style.border = '3px solid #333';
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
            self.hasMoved = false; // Yalnızca dokunup sürtünce boyanacak
            var pos = getPos(e);
            self.lastX = pos.x;
            self.lastY = pos.y;
        };
        
        var draw = function(e) {
            if (!self.isDrawing || self.roundCompleted) return;
            e.preventDefault();
            var pos = getPos(e);
            
            // Dokunup sürtme (hareket) kontrolü
            var dist = Math.hypot(pos.x - self.lastX, pos.y - self.lastY);
            if (dist > 3) {
                self.hasMoved = true;
                self.paintPath(self.lastX, self.lastY, pos.x, pos.y);
                self.lastX = pos.x;
                self.lastY = pos.y;
                self.checkProgress();
            }
        };
        
        var endDraw = function(e) {
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
        this.ctx.lineWidth = Math.max(26, this.canvas.width * 0.08);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.stroke();
        
        // Hücre takibi
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
        
        // Çok batırırsa (harf dışına aşırı boyama yaparsa) uyar ve sıfırla
        if (this.outsideCells > this.totalLetterCells * 3.5) {
            var self = this;
            this.roundCompleted = true;
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord("Tekrar deneyelim!");
            setTimeout(function() {
                self.resetCurrentLetter();
            }, 1000);
            return;
        }

        var painted = Object.keys(this.paintedCells).length;
        var percentage = painted / this.totalLetterCells;
        
        // %55 ve üzeri boyama yeterli (küçük çocuk için ideal)
        if (percentage >= 0.55 && !this.roundCompleted) {
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
        
        if (this.soundInterval) {
            clearInterval(this.soundInterval);
        }
        
        this.showCorrectFeedback(this.canvas);
        
        var minDim = Math.min(this.canvas.width, this.canvas.height);
        var cuteLetter = window.SvgLetters.createLetter(this.targetLetter, minDim * 0.5, this.currentColor);
        cuteLetter.style.position = 'absolute';
        cuteLetter.style.top = '50%';
        cuteLetter.style.left = '50%';
        cuteLetter.style.transform = 'translate(-50%, -50%) scale(0)';
        cuteLetter.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        cuteLetter.style.zIndex = '10';
        
        this.gameArea.appendChild(cuteLetter);
        
        setTimeout(function() {
            cuteLetter.style.transform = 'translate(-50%, -50%) scale(1)';
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(self.targetLetter);
            window.AudioManager.playApplause();
            window.Utils.showConfetti(self.container);
        }, 100);
        
        setTimeout(function() {
            self.transitionToNextRound(function() {
                if (cuteLetter.parentNode) cuteLetter.parentNode.removeChild(cuteLetter);
                self.nextRound();
            });
        }, 2500);
    };

    LetterPaintGame.prototype.drawLetterOutline = function() {
        var self = this;
        this.letterMask = {};
        this.totalLetterCells = 0;

        var rect = this.gameArea.getBoundingClientRect();
        var w = rect.width > 0 ? rect.width : (this.dims ? this.dims.width : window.innerWidth);
        var h = rect.height > 0 ? rect.height : (this.dims ? this.dims.height - 100 : window.innerHeight - 100);
        
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
        
        // Kalın açık gri dış hat
        this.ctx.lineWidth = Math.max(34, fontSize * 0.16);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#E0E0E0';
        this.ctx.strokeText(displayLetter, textX, textY);
        
        // Harf maskesini oluştur
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
        
        // Ortadaki kesik çizgili yönlendirme hattı
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
        
        // Tüm alfabeyi dahil et
        var availableLetters = window.GameData.getAllLetters();
        this.targetLetter = window.Utils.randomItem(availableLetters);
        
        this.drawLetterOutline();
        
        if (this.soundInterval) clearInterval(this.soundInterval);
        setTimeout(function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(self.targetLetter);
        }, 400);
    };

    LetterPaintGame.prototype.destroy = function() {
        if (this.soundInterval) {
            clearInterval(this.soundInterval);
        }
        window.BaseGame.prototype.destroy.call(this);
    };

    window.LetterPaintGame = LetterPaintGame;
})();
