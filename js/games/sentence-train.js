(function() {
    function SentenceTrainGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.currentSentence = null;
        this.placedWords = 0;
        this.slots = [];
        this.draggables = [];
        this.dragItem = null;
        this.startX = 0;
        this.startY = 0;
        this.originalX = 0;
        this.originalY = 0;
    }

    SentenceTrainGame.prototype = Object.create(window.BaseGame.prototype);
    SentenceTrainGame.prototype.constructor = SentenceTrainGame;

    SentenceTrainGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.createHeader('Cümle Treni 🚃');
        this.gameArea = document.createElement('div');
        this.gameArea.className = 'game-area';
        this.gameArea.style.display = 'flex';
        this.gameArea.style.flexDirection = 'column';
        this.gameArea.style.alignItems = 'center';
        this.gameArea.style.justifyContent = 'space-between';
        this.gameArea.style.padding = '20px';
        this.gameArea.style.boxSizing = 'border-box';
        this.gameArea.style.height = 'calc(100% - 60px)';
        this.container.appendChild(this.gameArea);
        
        this.topSection = document.createElement('div');
        this.topSection.style.display = 'flex';
        this.topSection.style.flexDirection = 'row';
        this.topSection.style.gap = '10px';
        this.topSection.style.minHeight = '100px';
        this.topSection.style.marginTop = '20px';
        this.topSection.style.flexWrap = 'wrap';
        this.topSection.style.justifyContent = 'center';
        this.gameArea.appendChild(this.topSection);

        this.middleSection = document.createElement('div');
        this.middleSection.style.margin = '20px 0';
        
        var replayBtn = document.createElement('button');
        replayBtn.textContent = '🔊 Dinle';
        replayBtn.style.fontSize = this.dims.fontSize.large + 'px';
        replayBtn.style.padding = '10px 20px';
        replayBtn.style.borderRadius = '20px';
        replayBtn.style.border = 'none';
        replayBtn.style.backgroundColor = '#4CAF50';
        replayBtn.style.color = 'white';
        replayBtn.style.cursor = 'pointer';
        replayBtn.onclick = function() {
            if (this.currentSentence) {
                window.AudioManager.speakSentence(this.currentSentence.text);
            }
        }.bind(this);
        this.middleSection.appendChild(replayBtn);
        this.gameArea.appendChild(this.middleSection);

        this.bottomSection = document.createElement('div');
        this.bottomSection.style.display = 'flex';
        this.bottomSection.style.flexDirection = 'row';
        this.bottomSection.style.gap = '15px';
        this.bottomSection.style.flexWrap = 'wrap';
        this.bottomSection.style.justifyContent = 'center';
        this.bottomSection.style.minHeight = '100px';
        this.gameArea.appendChild(this.bottomSection);
        
        this.setupBind = this.setupRound.bind(this);
        this.setupBind();
    };

    SentenceTrainGame.prototype.setupRound = function() {
        this.topSection.innerHTML = '';
        this.bottomSection.innerHTML = '';
        this.slots = [];
        this.draggables = [];
        this.placedWords = 0;
        
        var sentences = window.GameData.getAvailableSentences(this.maxGroup);
        if (!sentences || sentences.length === 0) {
            // fallback
            sentences = [{text: "ela lale el ele", words: ["ela", "lale", "el", "ele"]}];
        }
        
        this.currentSentence = window.Utils.randomItem(sentences);
        var words = this.currentSentence.words.slice();
        
        // Setup slots
        for (var i = 0; i < words.length; i++) {
            var slot = document.createElement('div');
            slot.style.width = '150px';
            slot.style.height = '80px';
            slot.style.border = '3px dashed rgba(255, 255, 255, 0.5)';
            slot.style.borderRadius = '15px';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            slot.dataset.word = words[i];
            slot.dataset.index = i;
            this.slots.push(slot);
            this.topSection.appendChild(slot);
        }
        
        // Setup draggables
        var draggablesList = words.slice();
        if (words.length === 2) {
            // Add distractor
            var allWords = window.GameData.getAvailableWords(this.maxGroup);
            var distractor = "al";
            if (allWords && allWords.length) {
                distractor = window.Utils.randomItem(allWords).word;
            }
            if (draggablesList.indexOf(distractor) === -1) {
                draggablesList.push(distractor);
            }
        }
        
        window.Utils.shuffle(draggablesList);
        
        for (var j = 0; j < draggablesList.length; j++) {
            var word = draggablesList[j];
            var card = window.SvgLetters.createSyllableCard(word, 80, window.GameData.getRandomColor());
            card.style.position = 'relative';
            card.style.touchAction = 'none';
            card.style.cursor = 'grab';
            card.dataset.word = word;
            
            this.makeDraggable(card);
            this.draggables.push(card);
            this.bottomSection.appendChild(card);
        }
        
        setTimeout(function() {
            window.AudioManager.speakSentence(this.currentSentence.text);
        }.bind(this), 500);
    };

    SentenceTrainGame.prototype.makeDraggable = function(el) {
        var self = this;
        var startHandler = function(e) {
            e.preventDefault();
            self.dragItem = el;
            var touch = e.type === 'touchstart' ? e.touches[0] : e;
            self.startX = touch.clientX;
            self.startY = touch.clientY;
            
            var rect = el.getBoundingClientRect();
            
            // Set fixed position for drag
            el.style.position = 'fixed';
            el.style.left = rect.left + 'px';
            el.style.top = rect.top + 'px';
            el.style.zIndex = 1000;
            
            self.originalX = rect.left;
            self.originalY = rect.top;
        };
        
        var moveHandler = function(e) {
            if (self.dragItem !== el) return;
            e.preventDefault();
            var touch = e.type === 'touchmove' ? e.touches[0] : e;
            var dx = touch.clientX - self.startX;
            var dy = touch.clientY - self.startY;
            
            el.style.left = (self.originalX + dx) + 'px';
            el.style.top = (self.originalY + dy) + 'px';
        };
        
        var endHandler = function(e) {
            if (self.dragItem !== el) return;
            e.preventDefault();
            self.dragItem = null;
            
            // Check intersection with slots
            var rect = el.getBoundingClientRect();
            var centerX = rect.left + rect.width / 2;
            var centerY = rect.top + rect.height / 2;
            
            var matchedSlot = null;
            
            // First check if it hovers any empty slot that matches
            for (var i = 0; i < self.slots.length; i++) {
                var slot = self.slots[i];
                if (slot.hasChildNodes()) continue; // already filled
                
                var slotRect = slot.getBoundingClientRect();
                if (centerX >= slotRect.left && centerX <= slotRect.right &&
                    centerY >= slotRect.top && centerY <= slotRect.bottom) {
                    matchedSlot = slot;
                    break;
                }
            }
            
            if (matchedSlot) {
                if (matchedSlot.dataset.word === el.dataset.word) {
                    // Correct!
                    window.AudioManager.speakWord(el.dataset.word);
                    self.showCorrectFeedback(el);
                    
                    // Reset styling to fit in slot
                    el.style.position = 'static';
                    el.style.left = 'auto';
                    el.style.top = 'auto';
                    el.style.zIndex = '1';
                    
                    // Remove event listeners
                    el.removeEventListener('touchstart', startHandler);
                    el.removeEventListener('touchmove', moveHandler);
                    el.removeEventListener('touchend', endHandler);
                    el.removeEventListener('mousedown', startHandler);
                    document.removeEventListener('mousemove', moveHandler);
                    document.removeEventListener('mouseup', endHandler);
                    
                    matchedSlot.style.border = 'none';
                    matchedSlot.appendChild(el);
                    
                    self.placedWords++;
                    if (self.placedWords === self.slots.length) {
                        self.winRound();
                    }
                } else {
                    // Wrong slot
                    self.showWrongFeedback(el);
                    self.resetDraggable(el);
                }
            } else {
                // Dropped outside
                self.resetDraggable(el);
            }
        };
        
        el.addEventListener('touchstart', startHandler, {passive: false});
        el.addEventListener('touchmove', moveHandler, {passive: false});
        el.addEventListener('touchend', endHandler, {passive: false});
        
        // Mouse fallback
        el.addEventListener('mousedown', startHandler);
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', endHandler);
    };

    SentenceTrainGame.prototype.resetDraggable = function(el) {
        el.style.position = 'relative';
        el.style.left = 'auto';
        el.style.top = 'auto';
        el.style.zIndex = '1';
    };

    SentenceTrainGame.prototype.winRound = function() {
        window.AudioManager.playLevelUp();
        setTimeout(function() {
            window.AudioManager.speakSentence(this.currentSentence.text);
        }.bind(this), 500);
        
        setTimeout(function() {
            this.transitionToNextRound(this.setupBind);
        }.bind(this), 3000);
    };

    SentenceTrainGame.prototype.destroy = function() {
        window.BaseGame.prototype.destroy.call(this);
    };

    window.SentenceTrainGame = SentenceTrainGame;
})();
