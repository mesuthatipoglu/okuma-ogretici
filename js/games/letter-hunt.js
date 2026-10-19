(function() {
    function LetterHuntGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.targetLetter = '';
        this.options = [];
    }

    LetterHuntGame.prototype = Object.create(window.BaseGame.prototype);
    LetterHuntGame.prototype.constructor = LetterHuntGame;

    LetterHuntGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.container.style.background = 'linear-gradient(135deg, #004d40, #00897b)';
        
        this.helpText = 'Yukarıda çıkan sevimli nesneye ve harfe bak, sesini dinle! Aşağıdaki kartlar arasından doğru harfi ve nesnesini bul.';
        this.helpIcon = '🔍';
        this.createHeader('Harf Avı 🔍');

        var self = this;
        var letters = window.GameData.getAllLetters();
        var exLetters = window.GameData.pickUniqueItems('hunt_intro', letters, 3);
        var examples = exLetters.map(function(l) {
            var info = window.GameData.getLetterInfo(l);
            var ex = (info && info.examples && info.examples.length)
                ? window.GameData.pickUniqueItems('hunt_intro_ex_' + l, info.examples, 1)[0]
                : { word: l, emoji: '🔍' };
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
            title: 'Resimli Harf Avı! 🔍',
            icon: 'pusula',
            description: 'Söylediğim harfi ve sevimli nesnesini dikkatle dinle, aşağıdaki kartlar arasından doğru olanı yakala!',
            voiceText: 'Sana söylediğim harfi dikkatle dinle ve doğru karta dokun!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterHuntGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.gameArea = window.Utils.createElement('div', 'game-area hunt-game-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;padding:12px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    LetterHuntGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        if (!this.gameArea) return;
        this.gameArea.innerHTML = '';

        var rect = this.gameArea.getBoundingClientRect();
        var w = rect.width || window.innerWidth;
        var h = rect.height || window.innerHeight;
        
        var availableLetters = window.GameData.getAllLetters();
        this.targetLetter = window.GameData.pickUniqueItems('letter_hunt_targets', availableLetters, 1)[0];
        var targetInfo = window.GameData.getLetterInfo(this.targetLetter);
        var targetEx = (targetInfo && targetInfo.examples && targetInfo.examples.length)
            ? window.GameData.pickUniqueItems('hunt_ex_' + this.targetLetter, targetInfo.examples, 1)[0]
            : { word: this.targetLetter, emoji: '⭐' };
        
        var distractors = [];
        var shuffledPool = window.Utils.shuffle(availableLetters.slice());
        for (var i = 0; i < shuffledPool.length && distractors.length < 3; i++) {
            if (shuffledPool[i] !== this.targetLetter) {
                distractors.push(shuffledPool[i]);
            }
        }
        
        this.options = window.Utils.shuffle([this.targetLetter].concat(distractors));
        
        // 1. Üst Hedef Alanı: Sevimli Nesne + Harf + Dinle Butonu
        var heroSize = Math.max(70, Math.min(h * 0.22, 120));
        var targetContainer = window.Utils.createElement('div', 'target-container');
        targetContainer.style.cssText =
            'display:flex;align-items:center;justify-content:center;gap:16px;' +
            'background:rgba(255,255,255,0.95);padding:12px 24px;border-radius:28px;' +
            'box-shadow:0 8px 24px rgba(0,0,0,0.22);border:4px solid #FFD54F;flex-shrink:0;';

        var objVisual = window.SvgLetters.createObjectImage(targetEx, heroSize, { bg: false, animate: true });
        targetContainer.appendChild(objVisual);

        var rightInfo = window.Utils.createElement('div', 'target-right-info');
        rightInfo.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;';

        var targetDisplay = window.Utils.createElement('div', 'target-display');
        targetDisplay.textContent = window.Utils.toUpperTR(this.targetLetter) + ' ' + this.targetLetter;
        targetDisplay.style.cssText =
            'font-size:' + Math.round(heroSize * 0.55) + 'px;font-weight:900;color:' + (targetInfo ? targetInfo.color : '#00695C') + ';line-height:1;';

        var wordHint = window.Utils.createElement('div', 'target-word-hint', targetEx.word.toUpperCase());
        wordHint.style.cssText = 'font-size:clamp(14px, 3vw, 19px);font-weight:800;color:#444;';

        var listenBtn = window.Utils.createElement('button', 'listen-btn', '🔊 Tekrar Dinle');
        listenBtn.style.cssText =
            'font-size:clamp(13px, 2.6vw, 16px);padding:6px 16px;border-radius:20px;border:none;' +
            'background:#4CAF50;color:white;font-weight:800;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,0.2);';
        
        listenBtn.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(self.targetLetter);
            window.Utils.bounceElement(targetContainer);
        });
        
        rightInfo.appendChild(targetDisplay);
        rightInfo.appendChild(wordHint);
        rightInfo.appendChild(listenBtn);
        targetContainer.appendChild(rightInfo);
        this.gameArea.appendChild(targetContainer);
        
        // 2. Seçenekler Izgarası (Her kartta hem harf hem o harfin farklı bir sevimli nesnesi var!)
        var grid = window.Utils.createElement('div', 'options-grid');
        var btnH = Math.max(76, Math.min(Math.floor((h - heroSize - 110) / 2.2), 135));
        grid.style.cssText =
            'display:grid;grid-template-columns:repeat(2, 1fr);gap:14px;width:100%;max-width:520px;';
        
        this.options.forEach(function(letter) {
            var lInfo = window.GameData.getLetterInfo(letter);
            var lColor = lInfo ? lInfo.color : '#1E88E5';
            var optEx = (lInfo && lInfo.examples && lInfo.examples.length)
                ? window.GameData.pickUniqueItems('hunt_opt_' + letter, lInfo.examples, 1)[0]
                : { word: letter, emoji: '⭐' };

            var btn = window.Utils.createElement('button', 'hunt-letter-btn animate-slideIn');
            btn.style.cssText =
                'height:' + btnH + 'px;padding:10px 14px;border-radius:24px;border:4px solid ' + lColor + ';' +
                'background:white;color:' + lColor + ';font-size:' + Math.round(btnH * 0.38) + 'px;' +
                'font-weight:900;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.18);' +
                'transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:12px;';

            var miniSvg = window.SvgLetters.createObjectImage(optEx, Math.round(btnH * 0.62), { bg: false, animate: false });
            var txtSpan = window.Utils.createElement('span', '', window.Utils.toUpperTR(letter) + ' ' + letter);
            btn.appendChild(miniSvg);
            btn.appendChild(txtSpan);
            
            btn.addEventListener('click', function() {
                if (btn.dataset.disabled) return;
                window.speechSynthesis.cancel();
                
                if (letter === self.targetLetter) {
                    var allBadges = grid.querySelectorAll('button');
                    allBadges.forEach(function(b) { b.dataset.disabled = 'true'; });
                    
                    btn.style.backgroundColor = '#4CAF50';
                    btn.style.borderColor = '#FFD700';
                    btn.style.color = 'white';

                    self.showCorrectFeedback(btn);
                    window.AudioManager.speakWord(optEx.word);
                    
                    setTimeout(function() {
                        self.nextRound();
                    }, 1350);
                } else {
                    btn.style.backgroundColor = '#F44336';
                    btn.style.borderColor = '#C62828';
                    btn.style.color = 'white';
                    
                    self.showWrongFeedback(btn);
                    window.AudioManager.playZort();
                    setTimeout(function() {
                        btn.style.backgroundColor = 'white';
                        btn.style.borderColor = lColor;
                        btn.style.color = lColor;
                    }, 750);
                }
            });
            
            grid.appendChild(btn);
        });
        
        this.gameArea.appendChild(grid);
        
        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(self.targetLetter);
            window.Utils.pulseElement(targetContainer);
        }, 350);
    };

    window.LetterHuntGame = LetterHuntGame;
})();
