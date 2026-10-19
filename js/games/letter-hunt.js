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
        this.container.style.backgroundColor = '#fdf6e3';
        
        this.helpText = 'Yukarıda çıkan harfin hangisi olduğunu aşağıdaki seçenekler arasından bul! Dinle butonuna basarak sesi tekrar duyabilirsin.';
        this.helpIcon = '🔍';
        this.createHeader('Harf Avı 🔍');

        var self = this;
        var letters = window.GameData.getAllLetters();
        var exLetters = letters.slice(0, 4);
        var examples = exLetters.map(function(l) {
            var info = window.GameData.getLetterInfo(l);
            return { text: l.toUpperCase() + ' ' + l, sound: l, type: 'letter', emoji: info ? info.word.charAt(0) : '🔤' };
        });

        this.showIntro({
            title: 'Harf Avı! 🔍',
            icon: '🔍',
            description: 'Tüm alfabedeki harfleri arıyoruz! Sana söylediğim harfi dikkatle dinle ve doğru karta dokun.',
            voiceText: 'Sana söylediğim harfi dikkatle dinle ve doğru karta dokun!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterHuntGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.gameArea = window.Utils.createElement('div', 'hunt-game-area');
        this.gameArea.style.display = 'flex';
        this.gameArea.style.flexDirection = 'column';
        this.gameArea.style.alignItems = 'center';
        this.gameArea.style.justifyContent = 'center';
        this.gameArea.style.flex = '1';
        this.gameArea.style.padding = '16px';
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    LetterHuntGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        
        this.gameArea.innerHTML = '';
        
        // Tüm alfabeyi kullan
        var availableLetters = window.GameData.getAllLetters();
        this.targetLetter = window.Utils.randomItem(availableLetters);
        
        var distractors = [];
        var attempts = 0;
        while (distractors.length < 3 && attempts < 50) {
            var letter = window.Utils.randomItem(availableLetters);
            if (letter !== this.targetLetter && distractors.indexOf(letter) === -1) {
                distractors.push(letter);
            }
            attempts++;
        }
        
        this.options = [this.targetLetter].concat(distractors);
        window.Utils.shuffle(this.options);
        
        var targetContainer = window.Utils.createElement('div', 'target-container');
        targetContainer.style.display = 'flex';
        targetContainer.style.flexDirection = 'column';
        targetContainer.style.alignItems = 'center';
        targetContainer.style.marginBottom = '30px';
        
        var targetDisplay = window.Utils.createElement('div', 'target-display');
        targetDisplay.textContent = window.Utils.toUpperTR(this.targetLetter) + ' ' + this.targetLetter;
        targetDisplay.style.fontSize = 'clamp(42px, 9vw, 68px)';
        targetDisplay.style.fontWeight = '800';
        targetDisplay.style.color = '#333';
        targetDisplay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.1)';
        
        var listenBtn = window.Utils.createElement('button', 'listen-btn');
        listenBtn.textContent = '🔊 Dinle';
        listenBtn.style.fontSize = 'clamp(16px, 3.2vw, 22px)';
        listenBtn.style.padding = '10px 24px';
        listenBtn.style.marginTop = '12px';
        listenBtn.style.borderRadius = '30px';
        listenBtn.style.border = 'none';
        listenBtn.style.backgroundColor = '#4caf50';
        listenBtn.style.color = 'white';
        listenBtn.style.fontWeight = 'bold';
        listenBtn.style.cursor = 'pointer';
        listenBtn.style.boxShadow = '0 4px 10px rgba(76,175,80,0.4)';
        
        listenBtn.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(self.targetLetter);
            window.Utils.pulseElement(targetDisplay);
        });
        
        targetContainer.appendChild(targetDisplay);
        targetContainer.appendChild(listenBtn);
        this.gameArea.appendChild(targetContainer);
        
        var grid = window.Utils.createElement('div', 'options-grid');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        grid.style.gap = '20px';
        grid.style.width = '100%';
        grid.style.maxWidth = '460px';
        
        this.options.forEach(function(letter) {
            var btn = window.Utils.createElement('button', 'hunt-letter-btn');
            btn.textContent = window.Utils.toUpperTR(letter) + ' ' + letter;
            btn.style.cssText =
                'padding:20px;border-radius:24px;border:4px solid #2196F3;' +
                'background:white;color:#1565C0;font-size:clamp(28px, 6vw, 44px);' +
                'font-weight:900;cursor:pointer;box-shadow:0 6px 14px rgba(0,0,0,0.12);' +
                'transition:all 0.2s;display:flex;align-items:center;justify-content:center;';
            
            var onOptionClick = function() {
                if (btn.dataset.disabled) return;
                window.speechSynthesis.cancel();
                
                if (letter === self.targetLetter) {
                    var allBadges = grid.querySelectorAll('button');
                    allBadges.forEach(function(b) { b.dataset.disabled = "true"; });
                    
                    btn.style.backgroundColor = '#4CAF50';
                    btn.style.borderColor = '#2E7D32';
                    btn.style.color = 'white';

                    self.showCorrectFeedback(btn);
                    window.AudioManager.speakLetter(letter);
                    
                    setTimeout(function() {
                        self.nextRound();
                    }, 1400);
                } else {
                    btn.style.backgroundColor = '#F44336';
                    btn.style.borderColor = '#C62828';
                    btn.style.color = 'white';
                    
                    self.showWrongFeedback(btn);
                    window.AudioManager.playZort();
                    btn.classList.add('shake');
                    setTimeout(function() {
                        btn.classList.remove('shake');
                        btn.style.backgroundColor = 'white';
                        btn.style.borderColor = '#2196F3';
                        btn.style.color = '#1565C0';
                    }, 800);
                }
            };
            
            btn.addEventListener('click', onOptionClick);
            grid.appendChild(btn);
        });
        
        this.gameArea.appendChild(grid);
        
        setTimeout(function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(self.targetLetter);
            window.Utils.pulseElement(targetDisplay);
        }, 400);
    };

    window.LetterHuntGame = LetterHuntGame;
})();
