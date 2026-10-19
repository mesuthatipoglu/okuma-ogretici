(function() {
    function WordMatchGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.pairsCount = 3;
        this.words = [];
        this.matchedCount = 0;
        this.selectedImage = null;
        this.selectedWord = null;
        this.imageEls = [];
        this.wordEls = [];
    }

    WordMatchGame.prototype = Object.create(window.BaseGame.prototype);
    WordMatchGame.prototype.constructor = WordMatchGame;

    WordMatchGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        
        this.helpText = 'Önce resme dokun, sonra o resmin adının yazdığı kelimeye dokunarak onları eşleştir!';
        this.helpIcon = '🖼️';
        this.createHeader('Resim-Kelime Eşleştirme 🖼️');

        var self = this;
        var words = window.Utils.shuffle(window.GameData.getAllWords().slice());
        var exWords = words.slice(0, 3);
        var examples = exWords.map(function(w) {
            return {
                text: window.Utils.toUpperTR(w.word),
                sound: w.word,
                type: 'word',
                emoji: w.emoji || '🖼️',
                asset: w.asset || null
            };
        });

        this.showIntro({
            title: 'Resim ve Kelimeler! 🖼️',
            icon: '🖼️',
            description: 'Sevimli resimleri isimleriyle eşleştiriyoruz! Önce resme dokun, sonra o resmin adını yazan kelimeye dokun.',
            voiceText: 'Resme dokun, sonra adının yazdığı kelimeye dokunup eşleştir!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    WordMatchGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.updateDimensions();
        this.gameArea = window.Utils.createElement('div', 'game-area');
        this.gameArea.style.display = 'flex';
        this.gameArea.style.flex = '1';
        this.gameArea.style.width = '100%';
        this.gameArea.style.padding = '16px';
        this.gameArea.style.boxSizing = 'border-box';
        this.container.appendChild(this.gameArea);
        
        this.nextRound();
    };

    WordMatchGame.prototype.nextRound = function() {
        var self = this;
        window.BaseGame.prototype.nextRound.call(this);
        this.matchedCount = 0;
        this.selectedImage = null;
        this.selectedWord = null;
        this.imageEls = [];
        this.wordEls = [];
        this.updateDimensions();
        
        var availableWords = window.GameData.getAllWords();
        this.words = [];
        var usedWords = {};
        var attempts = 0;
        while (this.words.length < this.pairsCount && attempts < 50) {
            var item = window.GameData.getNextFromDeck('word-match-deck', availableWords);
            if (item && !usedWords[item.word]) {
                usedWords[item.word] = true;
                this.words.push(item);
            }
            attempts++;
        }
        
        this.transitionToNextRound(function() {
            self.renderGame();
        });
    };

    WordMatchGame.prototype.renderGame = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        
        var isLandscape = this.dims.isLandscape;
        
        this.gameArea.style.flexDirection = isLandscape ? 'row' : 'column';
        this.gameArea.style.justifyContent = 'space-evenly';
        this.gameArea.style.alignItems = 'center';
        
        var imagesContainer = window.Utils.createElement('div', 'match-images');
        imagesContainer.style.display = 'flex';
        imagesContainer.style.flexDirection = isLandscape ? 'column' : 'row';
        imagesContainer.style.flexWrap = 'wrap';
        imagesContainer.style.gap = '16px';
        imagesContainer.style.justifyContent = 'center';
        imagesContainer.style.alignItems = 'center';
        imagesContainer.style.width = isLandscape ? 'auto' : '100%';
        
        var wordsContainer = window.Utils.createElement('div', 'match-words');
        wordsContainer.style.display = 'flex';
        wordsContainer.style.flexDirection = isLandscape ? 'column' : 'row';
        wordsContainer.style.flexWrap = 'wrap';
        wordsContainer.style.gap = '16px';
        wordsContainer.style.justifyContent = 'center';
        wordsContainer.style.alignItems = 'center';
        wordsContainer.style.width = isLandscape ? 'auto' : '100%';
        
        var imagesWords = window.Utils.shuffle(this.words.slice());
        var textsWords = window.Utils.shuffle(this.words.slice());
        
        var areaRect = this.gameArea.getBoundingClientRect();
        var maxW = areaRect.width || window.innerWidth;
        var maxH = areaRect.height || window.innerHeight;
        var itemSize = isLandscape ? Math.min(maxH / 4.1, 130) : Math.min(maxW / 3.5, 112);
        itemSize = Math.max(itemSize, 75);
        
        imagesWords.forEach(function(w) {
            var imgDiv = window.Utils.createElement('div', 'match-item-img');
            imgDiv.style.width = itemSize + 'px';
            imgDiv.style.height = itemSize + 'px';
            imgDiv.style.flexShrink = '0';
            imgDiv.style.backgroundColor = 'white';
            imgDiv.style.borderRadius = '24px';
            imgDiv.style.display = 'flex';
            imgDiv.style.justifyContent = 'center';
            imgDiv.style.alignItems = 'center';
            imgDiv.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            imgDiv.style.cursor = 'pointer';
            imgDiv.style.transition = 'all 0.2s';
            imgDiv.style.border = '4px solid transparent';
            
            var emojiObj = window.SvgLetters.createEmojiImage(w.emoji || '❓', Math.round(itemSize * 0.72), w.asset);
            imgDiv.appendChild(emojiObj);
            
            imgDiv.dataset.word = w.word;
            imgDiv.addEventListener('click', function() {
                if (imgDiv.dataset.matched === 'true') return;
                window.AudioManager.playClick();
                self.selectImage(imgDiv);
            });
            
            imagesContainer.appendChild(imgDiv);
            self.imageEls.push(imgDiv);
        });
        
        textsWords.forEach(function(w) {
            var wordDiv = window.Utils.createElement('div', 'match-item-word');
            wordDiv.style.padding = '12px 24px';
            wordDiv.style.minWidth = itemSize + 'px';
            wordDiv.style.minHeight = (itemSize * 0.5) + 'px';
            wordDiv.style.flexShrink = '0';
            wordDiv.style.backgroundColor = 'white';
            wordDiv.style.borderRadius = '20px';
            wordDiv.style.display = 'flex';
            wordDiv.style.justifyContent = 'center';
            wordDiv.style.alignItems = 'center';
            wordDiv.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            wordDiv.style.cursor = 'pointer';
            wordDiv.style.fontSize = 'clamp(20px, 4.2vw, 30px)';
            wordDiv.style.fontWeight = '900';
            wordDiv.style.color = '#1565C0';
            wordDiv.style.transition = 'all 0.2s';
            wordDiv.style.border = '4px solid transparent';
            wordDiv.textContent = window.Utils.toUpperTR(w.word);
            
            wordDiv.dataset.word = w.word;
            wordDiv.addEventListener('click', function() {
                if (wordDiv.dataset.matched === 'true') return;
                window.speechSynthesis.cancel();
                window.AudioManager.speakWord(w.word);
                self.selectWord(wordDiv);
            });
            
            wordsContainer.appendChild(wordDiv);
            self.wordEls.push(wordDiv);
        });
        
        this.gameArea.appendChild(imagesContainer);
        this.gameArea.appendChild(wordsContainer);
    };
    
    WordMatchGame.prototype.selectImage = function(imgEl) {
        if (this.selectedImage) {
            this.selectedImage.style.borderColor = 'transparent';
            this.selectedImage.style.transform = 'scale(1)';
            this.selectedImage.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
        }
        this.selectedImage = imgEl;
        imgEl.style.borderColor = '#2196F3';
        imgEl.style.transform = 'scale(1.08)';
        imgEl.style.boxShadow = '0 0 18px rgba(33,150,243,0.6)';
        this.checkMatch();
    };
    
    WordMatchGame.prototype.selectWord = function(wordEl) {
        if (this.selectedWord) {
            this.selectedWord.style.borderColor = 'transparent';
            this.selectedWord.style.transform = 'scale(1)';
            this.selectedWord.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
        }
        this.selectedWord = wordEl;
        wordEl.style.borderColor = '#2196F3';
        wordEl.style.transform = 'scale(1.08)';
        wordEl.style.boxShadow = '0 0 18px rgba(33,150,243,0.6)';
        this.checkMatch();
    };
    
    WordMatchGame.prototype.checkMatch = function() {
        var self = this;
        if (this.selectedImage && this.selectedWord) {
            if (this.selectedImage.dataset.word === this.selectedWord.dataset.word) {
                var img = this.selectedImage;
                var word = this.selectedWord;
                img.dataset.matched = 'true';
                word.dataset.matched = 'true';
                
                img.style.backgroundColor = '#E8F5E9';
                img.style.borderColor = '#4CAF50';
                img.style.boxShadow = '0 0 14px rgba(76,175,80,0.5)';
                word.style.backgroundColor = '#E8F5E9';
                word.style.borderColor = '#4CAF50';
                word.style.boxShadow = '0 0 14px rgba(76,175,80,0.5)';
                
                window.Utils.celebrateElement(img);
                this.showCorrectFeedback(word);
                
                this.selectedImage = null;
                this.selectedWord = null;
                this.matchedCount++;
                
                if (this.matchedCount === this.pairsCount) {
                    setTimeout(function() {
                        self.showCorrectOverlay('Harika Eşleştirme! 🌟');
                        setTimeout(function() { self.nextRound(); }, 1800);
                    }, 700);
                }
            } else {
                var img2 = this.selectedImage;
                var word2 = this.selectedWord;
                img2.style.borderColor = '#F44336';
                word2.style.borderColor = '#F44336';
                this.showWrongFeedback(img2);
                this.showWrongFeedback(word2);
                
                setTimeout(function() {
                    if (img2.dataset.matched !== 'true') {
                        img2.style.borderColor = 'transparent';
                        img2.style.transform = 'scale(1)';
                        img2.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                    }
                    if (word2.dataset.matched !== 'true') {
                        word2.style.borderColor = 'transparent';
                        word2.style.transform = 'scale(1)';
                        word2.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                    }
                }, 600);
                
                this.selectedImage = null;
                this.selectedWord = null;
            }
        }
    };

    window.WordMatchGame = WordMatchGame;
})();
