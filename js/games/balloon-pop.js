(function() {
    function BalloonPopGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.balloons = [];
        this.spawnInterval = null;
        this.activeBalloons = 0;
        this.maxBalloons = 5;
    }

    BalloonPopGame.prototype = Object.create(window.BaseGame.prototype);
    BalloonPopGame.prototype.constructor = BalloonPopGame;

    BalloonPopGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);

        this.helpText = 'Ekranda uçuşan renkli balonları parmağınla patlat! Patlattığın balonun içindeki harfin sesini duyacaksın.';
        this.helpIcon = '🎈';
        this.createHeader('Ses Balonları 🎈');

        // Konu anlatımı ile başla
        var self = this;
        var letters = window.GameData.getAvailableLetters(this.maxGroup);
        var exLetters = letters.slice(0, 4);
        var examples = exLetters.map(function(l) {
            var info = window.GameData.getLetterInfo(l);
            return { text: l.toUpperCase() + ' → ' + (info ? info.sound : l), emoji: info ? info.word.charAt(0) : '' };
        });

        this.showIntro({
            title: 'Sesleri Tanıyalım! 🎈',
            icon: '🎈',
            description: 'Her balonun içinde bir harf var. Balonu patlatınca harfin sesini duyacaksın! Haydi harflerin seslerini öğrenelim.',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    BalloonPopGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'relative';

        this.gameArea = window.Utils.createElement('div', 'balloon-game-area');
        this.gameArea.style.position = 'absolute';
        this.gameArea.style.top = '0';
        this.gameArea.style.left = '0';
        this.gameArea.style.right = '0';
        this.gameArea.style.bottom = '0';
        this.gameArea.style.overflow = 'hidden';
        this.gameArea.style.backgroundColor = 'rgba(0,0,0,0.05)';
        this.container.appendChild(this.gameArea);

        this.startSpawning();
    };

    BalloonPopGame.prototype.startSpawning = function() {
        var self = this;
        // Birkaç balon art arda spawn et
        for (var i = 0; i < 3; i++) {
            setTimeout(function() { self.spawnBalloon(); }, i * 800);
        }

        this.spawnInterval = setInterval(function() {
            if (self.activeBalloons < self.maxBalloons) {
                self.spawnBalloon();
            }
        }, 2500);
    };

    BalloonPopGame.prototype.spawnBalloon = function() {
        var self = this;
        this.activeBalloons++;

        // Eşit ağırlıklı tüm alfabe havuzu (round-robin)
        if (!this._letterPool || this._letterPool.length === 0) {
            this._letterPool = window.Utils.shuffle(window.GameData.getAllLetters().slice());
        }
        var letter = this._letterPool.pop();
        var color = window.GameData.getRandomColor();

        // Gerçek oyun alanı boyutlarını kullan (dims cache'den değil)
        var areaRect = this.gameArea.getBoundingClientRect();
        var areaWidth = areaRect.width || window.innerWidth;
        var areaHeight = areaRect.height || window.innerHeight;

        // Tablet ve ekran boyutuna göre balon büyüklüğü
        var size = Math.min(areaWidth, areaHeight) * 0.16;
        size = Math.max(size, 65);
        size = Math.min(size, 115);

        // Ekran genişliğine göre dikey şerit (lane) sayısı belirle (en az 4, en çok 6)
        var numLanes = Math.max(4, Math.min(6, Math.floor(areaWidth / (size * 1.3))));
        var padding = size * 0.2;
        var usableWidth = areaWidth - padding * 2 - size;
        var laneStep = usableWidth / Math.max(1, numLanes - 1);

        // Hangi şeritlerin alt kısımda (yeni çıkmış) balonu olduğunu kontrol et
        var busyLanes = {};
        var activeEls = this.gameArea.querySelectorAll('.balloon-wrapper');
        activeEls.forEach(function(el) {
            var bRect = el.getBoundingClientRect();
            // Eğer balon henüz ekranın alt yarısındaysa o şerit meşgul
            if (bRect.top > areaHeight * 0.4) {
                var lIndex = parseInt(el.dataset.lane, 10);
                if (!isNaN(lIndex)) {
                    busyLanes[lIndex] = true;
                }
            }
        });

        // Boş şeritleri topla
        var availableLanes = [];
        for (var l = 0; l < numLanes; l++) {
            if (!busyLanes[l]) {
                availableLanes.push(l);
            }
        }

        // Eğer tüm şeritler meşgulse rastgele bir şerit seç
        var chosenLane = availableLanes.length > 0 ? 
            window.Utils.randomItem(availableLanes) : 
            Math.floor(Math.random() * numLanes);

        var leftPos = padding + chosenLane * laneStep;
        // Hafif doğal varyasyon (±8px)
        leftPos += (Math.random() * 16 - 8);
        leftPos = Math.max(padding, Math.min(areaWidth - size - padding, leftPos));

        var balloonWrapper = window.Utils.createElement('div', 'balloon-wrapper');
        balloonWrapper.dataset.lane = chosenLane;
        balloonWrapper.style.position = 'absolute';
        balloonWrapper.style.left = leftPos + 'px';
        balloonWrapper.style.bottom = '-160px';
        balloonWrapper.style.width = size + 'px';
        balloonWrapper.style.height = (size * 1.3) + 'px';
        balloonWrapper.style.cursor = 'pointer';
        balloonWrapper.style.transition = 'transform 0.2s';

        var svg = window.SvgLetters.createBalloon(letter, size, color);
        balloonWrapper.appendChild(svg);

        this.gameArea.appendChild(balloonWrapper);

        // Yavaş, çocuk dostu yükselen animasyon (9 - 13 saniye)
        var duration = 9000 + Math.random() * 4000;
        var floatAnimation = balloonWrapper.animate([
            { transform: 'translateY(0) rotate(0deg)' },
            { transform: 'translateY(-' + (areaHeight + 250) + 'px) rotate(' + (Math.random() * 20 - 10) + 'deg)' }
        ], {
            duration: duration,
            easing: 'linear',
            fill: 'forwards'
        });

        var popped = false;

        var onPop = function(e) {
            if (popped) return;
            popped = true;
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            // 1. HENÜZ HİÇBİR ŞEY DEĞİŞMEDEN BALONUN EKRANDAKİ TAM MEVCUT KONUMUNU AL:
            var bRect = balloonWrapper.getBoundingClientRect();
            var areaRect = self.gameArea.getBoundingClientRect();

            floatAnimation.cancel();

            // Karakter boyutları
            var charWidth = size * 0.9;
            var charHeight = charWidth * 140 / 120;

            // Balonun tam merkezine göre X ve Y koordinatları
            var popX = (bRect.left - areaRect.left) + (bRect.width - charWidth) / 2;
            var popY = (bRect.top - areaRect.top) + (bRect.height - charHeight) / 2;

            // Ekran dışına taşmaması için sınırla
            popX = Math.max(8, Math.min(areaRect.width - charWidth - 8, popX));
            popY = Math.max(8, Math.min(areaRect.height - charHeight - 8, popY));

            // Balon hemen kaldırılsın
            if (balloonWrapper.parentNode) {
                balloonWrapper.parentNode.removeChild(balloonWrapper);
                self.activeBalloons--;
            }

            // 2. Sesler ve Geri Bildirim
            window.AudioManager.playPop();
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(letter);

            self.correctCount++;
            self.score += 10;
            self.updateStarDisplay();

            // 3. Sevimli Gözlü Karakteri TAM PATLADIĞI YERDE GÖSTER
            var cuteLetter = window.SvgLetters.createLetter(letter, charWidth, color);
            cuteLetter.style.cssText =
                'position:absolute;left:' + popX + 'px;top:' + popY + 'px;z-index:200;' +
                'pointer-events:none;transform-origin:center center;' +
                'filter:drop-shadow(0 6px 14px rgba(0,0,0,0.25));';

            self.gameArea.appendChild(cuteLetter);

            // Hemen yerinde neşeli zıplama ve kaybolma animasyonu
            var bounceAnim = cuteLetter.animate([
                { transform: 'scale(0.3) rotate(-5deg)', opacity: 0 },
                { transform: 'scale(1.25) rotate(5deg)', opacity: 1, offset: 0.35 },
                { transform: 'scale(1.05) rotate(-2deg)', opacity: 1, offset: 0.7 },
                { transform: 'scale(1.15) translateY(-20px)', opacity: 0.9, offset: 0.85 },
                { transform: 'scale(0.8) translateY(-35px)', opacity: 0 }
            ], {
                duration: 1300,
                easing: 'ease-out',
                fill: 'forwards'
            });

            bounceAnim.onfinish = function() {
                if (cuteLetter.parentNode) {
                    cuteLetter.parentNode.removeChild(cuteLetter);
                }
            };
        };

        balloonWrapper.addEventListener('mousedown', onPop);
        balloonWrapper.addEventListener('touchstart', onPop, {passive: false});

        floatAnimation.onfinish = function() {
            if (!popped && balloonWrapper.parentNode) {
                balloonWrapper.parentNode.removeChild(balloonWrapper);
                self.activeBalloons--;
            }
        };
    };

    BalloonPopGame.prototype.destroy = function() {
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
        }
        window.BaseGame.prototype.destroy.call(this);
    };

    window.BalloonPopGame = BalloonPopGame;
})();
