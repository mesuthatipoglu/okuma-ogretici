(function() {
    function StoryReaderGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.currentStory = null;
        this.currentPageIndex = 0;
        this.isReading = false;
    }

    StoryReaderGame.prototype = Object.create(window.BaseGame.prototype);
    StoryReaderGame.prototype.constructor = StoryReaderGame;

    StoryReaderGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.createHeader('Resimli Hikaye 📖');
        
        this.gameArea = document.createElement('div');
        this.gameArea.className = 'game-area';
        this.gameArea.style.display = 'flex';
        this.gameArea.style.flexDirection = 'column';
        this.gameArea.style.alignItems = 'center';
        this.gameArea.style.justifyContent = 'space-between';
        this.gameArea.style.padding = '20px';
        this.gameArea.style.boxSizing = 'border-box';
        this.gameArea.style.height = 'calc(100% - 60px)';
        this.gameArea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        this.gameArea.style.borderRadius = '20px';
        this.container.appendChild(this.gameArea);
        
        this.pageContainer = document.createElement('div');
        this.pageContainer.className = 'story-page';
        this.pageContainer.style.flex = '1';
        this.pageContainer.style.display = 'flex';
        this.pageContainer.style.flexDirection = 'column';
        this.pageContainer.style.alignItems = 'center';
        this.pageContainer.style.justifyContent = 'center';
        this.pageContainer.style.width = '100%';
        this.gameArea.appendChild(this.pageContainer);
        
        this.navContainer = document.createElement('div');
        this.navContainer.className = 'story-nav';
        this.navContainer.style.display = 'flex';
        this.navContainer.style.flexDirection = 'row';
        this.navContainer.style.alignItems = 'center';
        this.navContainer.style.justifyContent = 'space-between';
        this.navContainer.style.width = '100%';
        this.navContainer.style.padding = '10px 20px';
        this.navContainer.style.boxSizing = 'border-box';
        this.gameArea.appendChild(this.navContainer);
        
        this.prevBtn = document.createElement('button');
        this.prevBtn.textContent = '⬅️';
        this.prevBtn.style.fontSize = this.dims.fontSize.xlarge + 'px';
        this.prevBtn.style.background = 'none';
        this.prevBtn.style.border = 'none';
        this.prevBtn.style.cursor = 'pointer';
        this.prevBtn.onclick = this.prevPage.bind(this);
        this.navContainer.appendChild(this.prevBtn);
        
        this.counterDisplay = document.createElement('div');
        this.counterDisplay.style.fontSize = this.dims.fontSize.large + 'px';
        this.counterDisplay.style.color = 'white';
        this.navContainer.appendChild(this.counterDisplay);
        
        this.nextBtn = document.createElement('button');
        this.nextBtn.textContent = '➡️';
        this.nextBtn.style.fontSize = this.dims.fontSize.xlarge + 'px';
        this.nextBtn.style.background = 'none';
        this.nextBtn.style.border = 'none';
        this.nextBtn.style.cursor = 'pointer';
        this.nextBtn.onclick = this.nextPage.bind(this);
        this.navContainer.appendChild(this.nextBtn);
        
        this.setupStory();
    };

    StoryReaderGame.prototype.setupStory = function() {
        var stories = window.GameData.getAvailableStories(this.maxGroup);
        if (!stories || stories.length === 0) {
            // fallback
            stories = [{
                title: "Ali",
                pages: [
                    {text: "ali ata bak"},
                    {text: "ali topu at"}
                ]
            }];
        }
        
        this.currentStory = window.Utils.randomItem(stories);
        this.currentPageIndex = 0;
        this.renderPage();
    };

    StoryReaderGame.prototype.renderPage = function() {
        this.pageContainer.innerHTML = '';
        var page = this.currentStory.pages[this.currentPageIndex];
        
        this.counterDisplay.textContent = (this.currentPageIndex + 1) + ' / ' + this.currentStory.pages.length;
        
        this.prevBtn.style.visibility = this.currentPageIndex > 0 ? 'visible' : 'hidden';
        
        // Try to find an emoji for the page based on its words
        var words = page.text.toLowerCase().split(' ');
        var allWords = window.GameData.words || [];
        var emoji = '📖'; // default
        
        var fallbackEmojis = { 'kedi':'🐱', 'su':'💧', 'anne':'👩', 'arı':'🐝', 'çiçek':'🌸', 'balık':'🐟', 'deniz':'🌊' };
        
        for (var i = 0; i < words.length; i++) {
            var w = words[i];
            if (fallbackEmojis[w]) {
                emoji = fallbackEmojis[w];
                break;
            }
            var wordData = allWords.find(function(item) { return item.word === w; });
            if (wordData && wordData.emoji) {
                emoji = wordData.emoji;
                break;
            }
        }
        
        var imageContainer = document.createElement('div');
        imageContainer.className = 'story-image';
        if (typeof SvgLetters !== 'undefined' && window.SvgLetters.createEmojiImage) {
            var imgEl = window.SvgLetters.createEmojiImage(emoji, Math.min(this.dims.minDim * 0.4, 200));
            imageContainer.appendChild(imgEl);
        } else {
            imageContainer.textContent = emoji;
            imageContainer.style.fontSize = Math.min(this.dims.minDim * 0.4, 200) + 'px';
        }
        imageContainer.style.marginBottom = '30px';
        this.pageContainer.appendChild(imageContainer);
        
        var textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.style.fontSize = this.dims.fontSize.xlarge + 'px';
        textContainer.style.color = 'white';
        textContainer.style.textAlign = 'center';
        textContainer.style.cursor = 'pointer';
        textContainer.style.lineHeight = '1.5';
        
        var spanWords = [];
        for (var j = 0; j < words.length; j++) {
            var span = document.createElement('span');
            span.textContent = words[j];
            span.style.margin = '0 10px';
            span.style.display = 'inline-block';
            span.style.transition = 'color 0.3s, transform 0.3s';
            textContainer.appendChild(span);
            spanWords.push(span);
        }
        
        var self = this;
        textContainer.onclick = function() {
            if (self.isReading) return;
            self.readPage(words, spanWords);
        };
        
        this.pageContainer.appendChild(textContainer);
        
        var hint = document.createElement('div');
        hint.textContent = '👆 Okumak için dokun';
        hint.style.fontSize = this.dims.fontSize.medium + 'px';
        hint.style.color = 'rgba(255, 255, 255, 0.6)';
        hint.style.marginTop = '20px';
        this.pageContainer.appendChild(hint);
    };

    StoryReaderGame.prototype.readPage = function(words, spanWords) {
        this.isReading = true;
        var self = this;
        
        var idx = 0;
        function readNext() {
            if (idx >= words.length) {
                self.isReading = false;
                return;
            }
            
            // Highlight
            for (var k = 0; k < spanWords.length; k++) {
                spanWords[k].style.color = k === idx ? '#FFD700' : 'white';
                spanWords[k].style.transform = k === idx ? 'scale(1.2)' : 'scale(1)';
            }
            
            window.AudioManager.speakWord(words[idx]);
            
            // Wait roughly based on word length + pause
            var delay = 800 + (words[idx].length * 50);
            setTimeout(function() {
                if (idx === words.length - 1) {
                    spanWords[idx].style.color = 'white';
                    spanWords[idx].style.transform = 'scale(1)';
                }
                idx++;
                readNext();
            }, delay);
        }
        
        readNext();
    };

    StoryReaderGame.prototype.prevPage = function() {
        if (this.isReading) return;
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.renderPage();
        }
    };

    StoryReaderGame.prototype.nextPage = function() {
        if (this.isReading) return;
        if (this.currentPageIndex < this.currentStory.pages.length - 1) {
            this.currentPageIndex++;
            this.renderPage();
        } else {
            // Finish
            window.AudioManager.playLevelUp();
            this.showCorrectOverlay("Harika!");
            setTimeout(function() {
                this.transitionToNextRound(this.setupStory.bind(this));
            }.bind(this), 2000);
        }
    };

    StoryReaderGame.prototype.destroy = function() {
        window.BaseGame.prototype.destroy.call(this);
    };

    window.StoryReaderGame = StoryReaderGame;
})();
