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
        
        this.helpText = 'Resimdeki nesnenin adını bul! Hoparlöre basarak ismini duyabilirsin, ardından doğru kelimeyi seç.';
        this.helpIcon = '🏹';
        this.createHeader("Kelime Avı 🏹");

        var self = this;
        var words = window.GameData.getAvailableWords(this.maxGroup);
        var exWords = (words && words.length >= 3) ? words.slice(0, 3) : [
            { word: 'elma', emoji: '🍎' },
            { word: 'nar', emoji: '❤️' },
            { word: 'tren', emoji: '🚂' }
        ];
        var examples = exWords.map(function(w) {
            return { text: w.word.toUpperCase(), sound: w.word, type: 'word', emoji: w.emoji || '🏹' };
        });

        this.showIntro({
            title: 'Kelimeleri Bulalım! 🏹',
            icon: '🏹',
            description: 'Resme bak ve adının yazdığı doğru kelimeyi bul! Hoparlöre dokunarak kelimenin sesini de duyabilirsin.',
            voiceText: 'Resme bak ve adının yazdığı doğru kelimeyi bul!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    WordHuntGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.gameArea = window.Utils.createElement("div", "game-area");
        this.gameArea.style.display = "flex";
        this.gameArea.style.flexDirection = "column";
        this.gameArea.style.alignItems = "center";
        this.gameArea.style.justifyContent = "center";
        this.gameArea.style.flex = "1";
        this.gameArea.style.width = "100%";
        this.gameArea.style.padding = "16px";
        this.gameArea.style.boxSizing = "border-box";
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    WordHuntGame.prototype.nextRound = function() {
        var self = this;
        window.BaseGame.prototype.nextRound.call(this);
        
        var availableWords = window.GameData.getAllWords();
        if (!availableWords || availableWords.length < 4) {
            this.gameArea.innerHTML = "<div style='font-size:" + this.dims.fontSize.large + "px;color:white;'>Bu seviye için yeterli kelime bulunamadı.</div>";
            return;
        }
        
        var shuffled = window.Utils.shuffle(availableWords.slice());
        this.targetWord = shuffled[0];
        
        var distractors = shuffled.slice(1, 4);
        this.options = window.Utils.shuffle([this.targetWord].concat(distractors));
        
        this.transitionToNextRound(function() {
            self.renderGame();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.targetWord.word);
        });
    };

    WordHuntGame.prototype.renderGame = function() {
        var self = this;
        this.gameArea.innerHTML = "";
        
        // Target area
        var targetArea = window.Utils.createElement("div", "hunt-target");
        targetArea.style.display = "flex";
        targetArea.style.flexDirection = "column";
        targetArea.style.alignItems = "center";
        targetArea.style.marginBottom = "24px";
        
        var emojiObj = window.SvgLetters.createEmojiImage(this.targetWord.emoji || "❓", this.dims.unit * 3);
        
        var soundBtn = window.Utils.createElement("button", "sound-btn", "🔊 Dinle");
        soundBtn.style.fontSize = "clamp(15px, 3vw, 20px)";
        soundBtn.style.marginTop = "12px";
        soundBtn.style.padding = "10px 24px";
        soundBtn.style.borderRadius = "24px";
        soundBtn.style.border = "none";
        soundBtn.style.backgroundColor = "#2196F3";
        soundBtn.style.color = "white";
        soundBtn.style.fontWeight = "bold";
        soundBtn.style.cursor = "pointer";
        soundBtn.style.boxShadow = "0 4px 10px rgba(33,150,243,0.4)";
        soundBtn.addEventListener("click", function() {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.targetWord.word);
            window.Utils.pulseElement(soundBtn);
        });
        
        targetArea.appendChild(emojiObj);
        targetArea.appendChild(soundBtn);
        this.gameArea.appendChild(targetArea);
        
        // Options area (2x2 grid, all matching neutral theme)
        var optionsArea = window.Utils.createElement("div", "hunt-options");
        optionsArea.style.display = "grid";
        optionsArea.style.gridTemplateColumns = "1fr 1fr";
        optionsArea.style.gap = "16px";
        optionsArea.style.width = "100%";
        optionsArea.style.maxWidth = "550px";
        
        this.options.forEach(function(opt) {
            var btn = window.Utils.createElement("button", "hunt-option-btn", opt.word);
            btn.style.fontSize = "clamp(18px, 4.5vw, 28px)";
            btn.style.fontWeight = "bold";
            btn.style.padding = "16px";
            btn.style.borderRadius = "18px";
            btn.style.border = "4px solid #90CAF9";
            btn.style.backgroundColor = "white";
            btn.style.color = "#333";
            btn.style.cursor = "pointer";
            btn.style.boxShadow = "0 5px 15px rgba(0,0,0,0.15)";
            btn.style.transition = "all 0.25s";
            
            btn.addEventListener("click", function() {
                if (btn.dataset.disabled) return;
                
                var allBtns = optionsArea.querySelectorAll('button');
                allBtns.forEach(function(b) { b.dataset.disabled = "true"; });
                
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                
                if (opt.word === self.targetWord.word) {
                    window.AudioManager.speakWord(opt.word);
                    self.showCorrectFeedback(btn);
                    btn.style.backgroundColor = "#4CAF50";
                    btn.style.borderColor = "#4CAF50";
                    btn.style.color = "white";
                    
                    setTimeout(function() {
                        self.nextRound();
                    }, 1400);
                } else {
                    self.showWrongFeedback(btn);
                    window.AudioManager.playZort();
                    btn.style.backgroundColor = "#F44336";
                    btn.style.borderColor = "#F44336";
                    btn.style.color = "white";
                    
                    setTimeout(function() {
                        btn.style.backgroundColor = "white";
                        btn.style.borderColor = "#90CAF9";
                        btn.style.color = "#333";
                        allBtns.forEach(function(b) { delete b.dataset.disabled; });
                    }, 1000);
                }
            });
            
            optionsArea.appendChild(btn);
        });
        
        this.gameArea.appendChild(optionsArea);
    };

    window.WordHuntGame = WordHuntGame;
})();
