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

        this.helpText = 'Ekranda uçuşan renkli balonları parmağınla patlat! Patlattığın balonun içinden sürpriz bir harf karakteri ve eğlenceli bir nesne çıkacak!';
        this.helpIcon = '🎈';
        this.createHeader('Ses Balonları 🎈');

        var self = this;
        var allLetters = window.GameData.getAllLetters();
        var exLetters = window.GameData.pickUniqueItems('balloon_intro', allLetters, 3);
        var examples = exLetters.map(function(l) {
            var info = window.GameData.getLetterInfo(l);
            var ex = (info && info.examples && info.examples.length)
                ? window.GameData.pickUniqueItems('balloon_intro_ex_' + l, info.examples, 1)[0]
                : { word: l, emoji: '🎈' };
            return {
                text: window.Utils.toUpperTR(l) + ' → ' + ex.word.toUpperCase(),
                sound: l,
                type: 'letter',
                word: ex.word,
                emoji: ex.emoji,
                image: ex.image
            };
        });

        this.showIntro({
            title: 'Sürpriz Ses Balonları! 🎈',
            icon: 'balon',
            description: 'Her balonun içinde bir harf ve sürpriz bir nesne gizli! Balonu patlatınca harfin sesini ve nesnesini keşfedeceksin.',
            voiceText: 'Renkli balonları patlat, içindeki sürpriz harfleri ve nesneleri keşfet!',
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
        this.gameArea.style.cssText =
            'position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;' +
            'background:radial-gradient(circle at 50% 20%, rgba(255,255,255,0.12), transparent 70%);';
        this.container.appendChild(this.gameArea);

        this.startSpawning();
    };

    BalloonPopGame.prototype.startSpawning = function() {
        var self = this;
        for (var i = 0; i < 3; i++) {
            setTimeout(function() { if (self.running) self.spawnBalloon(); }, i * 700);
        }

        this.spawnInterval = setInterval(function() {
            if (self.running && self.activeBalloons < self.maxBalloons) {
                self.spawnBalloon();
            }
        }, 2100);
    };

    BalloonPopGame.prototype.spawnBalloon = function() {
        var self = this;
        if (!this.gameArea) return;
        this.activeBalloons++;

        var letter = window.GameData.pickUniqueItems('balloon_pool', window.GameData.getAllLetters(), 1)[0];
        var color = window.GameData.getRandomColor();
        var info = window.GameData.getLetterInfo(letter);
        var surpriseEx = (info && info.examples && info.examples.length)
            ? window.GameData.pickUniqueItems('balloon_ex_' + letter, info.examples, 1)[0]
            : { word: letter, emoji: '⭐' };

        var areaRect = this.gameArea.getBoundingClientRect();
        var areaWidth = areaRect.width || window.innerWidth;
        var areaHeight = areaRect.height || window.innerHeight;

        var size = Math.min(areaWidth, areaHeight) * 0.17;
        size = Math.max(size, 68);
        size = Math.min(size, 118);

        var numLanes = Math.max(4, Math.min(6, Math.floor(areaWidth / (size * 1.25))));
        var padding = size * 0.2;
        var usableWidth = areaWidth - padding * 2 - size;
        var laneStep = usableWidth / Math.max(1, numLanes - 1);

        var busyLanes = {};
        var activeEls = this.gameArea.querySelectorAll('.balloon-wrapper');
        activeEls.forEach(function(el) {
            var bRect = el.getBoundingClientRect();
            if (bRect.top > areaHeight * 0.4) {
                var lIndex = parseInt(el.dataset.lane, 10);
                if (!isNaN(lIndex)) busyLanes[lIndex] = true;
            }
        });

        var availableLanes = [];
        for (var l = 0; l < numLanes; l++) {
            if (!busyLanes[l]) availableLanes.push(l);
        }

        var chosenLane = availableLanes.length > 0 ?
            window.Utils.randomItem(availableLanes) :
            Math.floor(Math.random() * numLanes);

        var leftPos = padding + chosenLane * laneStep + (Math.random() * 16 - 8);
        leftPos = Math.max(padding, Math.min(areaWidth - size - padding, leftPos));

        var balloonWrapper = window.Utils.createElement('div', 'balloon-wrapper');
        balloonWrapper.dataset.lane = chosenLane;
        balloonWrapper.style.cssText =
            'position:absolute;left:' + leftPos + 'px;bottom:-165px;width:' + size + 'px;height:' + (size * 1.35) + 'px;' +
            'cursor:pointer;transition:transform 0.2s;';

        var svg = window.SvgLetters.createBalloon(letter, size, color);
        balloonWrapper.appendChild(svg);
        this.gameArea.appendChild(balloonWrapper);

        var duration = 8500 + Math.random() * 3500;
        var floatAnimation = balloonWrapper.animate([
            { transform: 'translateY(0) rotate(-3deg)' },
            { transform: 'translateY(-' + (areaHeight * 0.5) + 'px) rotate(4deg)', offset: 0.5 },
            { transform: 'translateY(-' + (areaHeight + 250) + 'px) rotate(-4deg)' }
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

            var bRect = balloonWrapper.getBoundingClientRect();
            var curAreaRect = self.gameArea.getBoundingClientRect();

            floatAnimation.cancel();

            var popupWidth = Math.max(130, size * 1.45);
            var popupHeight = popupWidth * 1.1;

            var popX = (bRect.left - curAreaRect.left) + (bRect.width - popupWidth) / 2;
            var popY = (bRect.top - curAreaRect.top) + (bRect.height - popupHeight) / 2;

            popX = Math.max(8, Math.min(curAreaRect.width - popupWidth - 8, popX));
            popY = Math.max(8, Math.min(curAreaRect.height - popupHeight - 8, popY));

            if (balloonWrapper.parentNode) {
                balloonWrapper.parentNode.removeChild(balloonWrapper);
                self.activeBalloons--;
            }

            window.AudioManager.playPop();
            window.Utils.showStarBurst(self.gameArea, popX + popupWidth / 2, popY + popupHeight / 2);
            window.speechSynthesis.cancel();
            window.AudioManager.speak(
                (info ? info.sound : letter) + '! ' + surpriseEx.word,
                0.82,
                1.08
            );

            self.showCorrectFeedback( null );

            // Sevimli Harf + Sürpriz SVG Nesne Kartı
            var surpriseWrap = window.Utils.createElement('div', 'balloon-surprise-card');
            surpriseWrap.style.cssText =
                'position:absolute;left:' + popX + 'px;top:' + popY + 'px;width:' + popupWidth + 'px;' +
                'z-index:200;pointer-events:none;display:flex;flex-direction:column;align-items:center;' +
                'background:rgba(255,255,255,0.94);border-radius:24px;padding:8px;' +
                'border:4px solid ' + color + ';box-shadow:0 10px 25px rgba(0,0,0,0.3);';

            var topPair = window.Utils.createElement('div', 'surprise-pair');
            topPair.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:6px;';

            var cuteLetter = window.SvgLetters.createLetter(letter, size * 0.62, color);
            var cuteObj = window.SvgLetters.createObjectImage(surpriseEx, size * 0.62, { bg: false, animate: false });
            topPair.appendChild(cuteLetter);
            topPair.appendChild(cuteObj);
            surpriseWrap.appendChild(topPair);

            var wordLabel = window.Utils.createElement('div', 'surprise-word', surpriseEx.word.toUpperCase());
            wordLabel.style.cssText = 'font-size:clamp(14px, 3vw, 18px);font-weight:900;color:' + color + ';margin-top:2px;';
            surpriseWrap.appendChild(wordLabel);

            self.gameArea.appendChild(surpriseWrap);

            var bounceAnim = surpriseWrap.animate([
                { transform: 'scale(0.2) rotate(-8deg)', opacity: 0 },
                { transform: 'scale(1.18) rotate(4deg)', opacity: 1, offset: 0.3 },
                { transform: 'scale(1) rotate(-2deg)', opacity: 1, offset: 0.75 },
                { transform: 'scale(0.8) translateY(-30px)', opacity: 0 }
            ], {
                duration: 1550,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fill: 'forwards'
            });

            bounceAnim.onfinish = function() {
                if (surpriseWrap.parentNode) surpriseWrap.parentNode.removeChild(surpriseWrap);
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
