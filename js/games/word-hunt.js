(function() {
    function WordHuntGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.targetWord = null;
        this.options = [];
    }

    WordHuntGame.prototype = Object.create(window.BaseGame.prototype);
    WordHuntGame.prototype.constructor = WordHuntGame;

    WordHuntGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        
        this.helpText = 'Resimdeki sevimli nesnenin adını bul! Hoparlöre basarak ismini duyabilirsin, ardından doğru kelimeyi seç.';
        this.helpIcon = '🏹';
        this.createHeader('Kelime Avı 🏹');

        var self = this;
        var words = window.Utils.shuffle(window.GameData.getAllWords().slice());
        var exWords = words.slice(0, 3);
        var examples = exWords.map(function(w) {
            return {
                text: window.Utils.toUpperTR(w.word),
                sound: w.word,
                type: 'word',
                emoji: w.emoji || '🏹',
                asset: w.asset || null
            };
        });

        this.showIntro({
            title: 'Kelimeleri Bulalım! 🏹',
            icon: '🏹',
            description: 'Resme bak ve adının yazdığı doğru kelimeyi bul! Resme veya hoparlöre dokunarak kelimenin sesini duyabilirsin.',
            voiceText: 'Resme bak ve adının yazdığı doğru kelimeyi bul!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    WordHuntGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.updateDimensions();
        this.gameArea = window.Utils.createElement('div', 'game-area');
        this.gameArea.style.display = 'flex';
        this.gameArea.style.flexDirection = 'column';
        this.gameArea.style.alignItems = 'center';
        this.gameArea.style.justifyContent = 'space-evenly';
        this.gameArea.style.flex = '1';
        this.gameArea.style.width = '100%';
        this.gameArea.style.padding = '16px';
        this.gameArea.style.boxSizing = 'border-box';
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    WordHuntGame.prototype.nextRound = function() {
        var self = this;
        window.BaseGame.prototype.nextRound.call(this);
        this.updateDimensions();
        
        var availableWords = window.GameData.getAllWords();
        this.targetWord = window.GameData.getNextFromDeck('word-hunt-deck', availableWords);
        
        var distractors = [];
        var attempts = 0;
        while (distractors.length < 3 && attempts < 60) {
            var cand = window.Utils.randomItem(availableWords);
            if (cand.word !== this.targetWord.word && distractors.indexOf(cand) === -1) {
                distractors.push(cand);
            }
            attempts++;
        }
        this.options = window.Utils.shuffle([this.targetWord].concat(distractors));
        
        this.transitionToNextRound(function() {
            self.renderGame();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.targetWord.word);
        });
    };

    WordHuntGame.prototype.renderGame = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        
        var targetArea = window.Utils.createElement('div', 'hunt-target');
        targetArea.style.display = 'flex';
        targetArea.style.flexDirection = 'column';
        targetArea.style.alignItems = 'center';
        
        var imgSize = Math.min(135, Math.max(90, Math.round(this.dims.height * 0.24)));
        var emojiObj = window.SvgLetters.createEmojiImage(this.targetWord.emoji || '❓', imgSize, this.targetWord.asset);
        emojiObj.style.cursor = 'pointer';
        emojiObj.addEventListener('click', function() {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.targetWord.word);
            window.Utils.celebrateElement(emojiObj);
        });
        
        var soundBtn = window.Utils.createElement('button', 'sound-btn', '🔊 Dinle');
        soundBtn.style.fontSize = 'clamp(15px, 3vw, 20px)';
        soundBtn.style.marginTop = '12px';
        soundBtn.style.padding = '10px 24px';
        soundBtn.style.borderRadius = '24px';
        soundBtn.style.border = 'none';
        soundBtn.style.backgroundColor = '#2196F3';
        soundBtn.style.color = 'white';
        soundBtn.style.fontWeight = 'bold';
        soundBtn.style.cursor = 'pointer';
        soundBtn.style.boxShadow = '0 4px 10px rgba(33,150,243,0.4)';
        soundBtn.addEventListener('click', function() {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.targetWord.word);
            window.Utils.celebrateElement(emojiObj);
        });
        
        targetArea.appendChild(emojiObj);
        targetArea.appendChild(soundBtn);
        this.gameArea.appendChild(targetArea);
        
        var optionsArea = window.Utils.createElement('div', 'hunt-options');
        optionsArea.style.display = 'grid';
        optionsArea.style.gridTemplateColumns = '1fr 1fr';
        optionsArea.style.gap = '16px';
        optionsArea.style.width = '100%';
        optionsArea.style.maxWidth = '550px';
        
        this.options.forEach(function(opt) {
            var btn = window.Utils.createElement('button', 'hunt-option-btn', window.Utils.toUpperTR(opt.word));
            btn.style.fontSize = 'clamp(20px, 4.5vw, 30px)';
            btn.style.fontWeight = '900';
            btn.style.padding = '16px';
            btn.style.borderRadius = '20px';
            btn.style.border = '4px solid #90CAF9';
            btn.style.backgroundColor = 'white';
            btn.style.color = '#1565C0';
            btn.style.cursor = 'pointer';
            btn.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)';
            btn.style.transition = 'all 0.25s';
            
            btn.addEventListener('click', function() {
                if (btn.dataset.disabled) return;
                
                var allBtns = optionsArea.querySelectorAll('button');
                allBtns.forEach(function(b) { b.dataset.disabled = 'true'; });
                
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                
                if (opt.word === self.targetWord.word) {
                    window.AudioManager.speakWord(opt.word);
                    window.Utils.celebrateElement(emojiObj);
                    self.showCorrectFeedback(btn);
                    btn.style.backgroundColor = '#4CAF50';
                    btn.style.borderColor = '#2E7D32';
                    btn.style.color = 'white';
                    
                    setTimeout(function() {
                        self.nextRound();
                    }, 1450);
                } else {
                    self.showWrongFeedback(btn);
                    window.AudioManager.playZort();
                    btn.style.backgroundColor = '#F44336';
                    btn.style.borderColor = '#C62828';
                    btn.style.color = 'white';
                    
                    setTimeout(function() {
                        btn.style.backgroundColor = 'white';
                        btn.style.borderColor = '#90CAF9';
                        btn.style.color = '#1565C0';
                        allBtns.forEach(function(b) { delete b.dataset.disabled; });
                    }, 900);
                }
            });
            
            optionsArea.appendChild(btn);
        });
        
        this.gameArea.appendChild(optionsArea);
    };

    window.WordHuntGame = WordHuntGame;
})();
