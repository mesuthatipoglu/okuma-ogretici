(function () {
    function SyllableMatchGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'syllable_match';
        var savedSize = parseInt(localStorage.getItem('syllable_match_matrix_size'), 10);
        this.totalCards = (savedSize === 4 || savedSize === 6 || savedSize === 8 || savedSize === 12) ? savedSize : 6;
    }

    SyllableMatchGame.prototype = Object.create(window.BaseGame.prototype);
    SyllableMatchGame.prototype.constructor = SyllableMatchGame;

    SyllableMatchGame.prototype.init = function () {
        window.BaseGame.prototype.init.call(this);
        
        this.helpText = 'Kartları çevirerek aynı heceleri bul ve eşleştir! Yukarıdan kart sayısını değiştirebilirsin.';
        this.helpIcon = '🃏';
        this.createHeader('Hece Eşleştirme 🃏');

        var self = this;
        var syllables = window.GameData.generateSyllables(this.maxGroup);
        var exSyls = (syllables && syllables.length >= 3) ? syllables.slice(0, 3) : [{text: 'el'}, {text: 'al'}, {text: 'le'}];
        var examples = exSyls.map(function(s) {
            return { text: s.text.toUpperCase() + ' (' + s.text + ')', sound: s.text, type: 'syllable', emoji: '🃏' };
        });

        this.showIntro({
            title: 'Hece Eşleştirme! 🃏',
            icon: '🃏',
            description: 'Kartların arkasında heceler gizli! Kartları çevirerek aynı iki heceyi bul ve eşleştir.',
            voiceText: 'Kartları çevir ve aynı heceleri bulup eşleştir!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    SyllableMatchGame.prototype.startGameplay = function () {
        this.container.innerHTML = '';
        
        // Üst panel: Kart Sayısı Seçici (4, 6, 8, 12)
        var controlsBar = window.Utils.createElement('div', 'match-controls-bar');
        controlsBar.style.cssText =
            'display:flex;align-items:center;justify-content:center;gap:8px;padding:8px;' +
            'background:rgba(0,0,0,0.15);width:100%;box-sizing:border-box;flex-wrap:wrap;';

        var sizeLabel = window.Utils.createElement('span', 'size-label', 'Kart Sayısı:');
        sizeLabel.style.cssText = 'color:white;font-weight:bold;font-size:clamp(13px, 2.5vw, 16px);margin-right:4px;';
        controlsBar.appendChild(sizeLabel);

        var self = this;
        var sizes = [
            { count: 4, label: '4 Kart (2x2)' },
            { count: 6, label: '6 Kart (2x3)' },
            { count: 8, label: '8 Kart (2x4)' },
            { count: 12, label: '12 Kart (3x4)' }
        ];

        sizes.forEach(function(s) {
            var btn = window.Utils.createElement('button', 'size-btn', s.label);
            var isActive = (self.totalCards === s.count);
            btn.style.cssText =
                'padding:6px 12px;border:none;border-radius:14px;font-weight:bold;cursor:pointer;' +
                'font-size:clamp(12px, 2.3vw, 14px);transition:all 0.2s;' +
                (isActive ? 'background:#4CAF50;color:white;box-shadow:0 2px 6px rgba(0,0,0,0.2);' : 'background:rgba(255,255,255,0.3);color:white;');

            btn.addEventListener('click', function() {
                if (self.totalCards === s.count) return;
                self.totalCards = s.count;
                localStorage.setItem('syllable_match_matrix_size', s.count);
                self.startGameplay();
            });
            controlsBar.appendChild(btn);
        });
        this.container.appendChild(controlsBar);

        this.gameArea = window.Utils.createElement('div', 'game-area syllable-match-area');
        this.gameArea.style.cssText =
            'position:relative;width:100%;flex:1;display:flex;justify-content:center;align-items:center;padding:12px;box-sizing:border-box;';
        this.container.appendChild(this.gameArea);
        
        this.startRound();
    };

    SyllableMatchGame.prototype.startRound = function () {
        this.gameArea.innerHTML = '';
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.lockBoard = false;
        
        var pairsNeeded = this.totalCards / 2;
        var allSyllables = window.GameData.generateSyllables(this.maxGroup);
        if (!allSyllables || allSyllables.length < pairsNeeded) {
            allSyllables = [
                { text: 'el' }, { text: 'le' }, { text: 'al' },
                { text: 'la' }, { text: 'ek' }, { text: 'ke' }
            ];
        }
        
        var shuffledAll = window.Utils.shuffle(allSyllables.slice());
        var selectedSyllables = shuffledAll.slice(0, pairsNeeded);
        
        var cards = [];
        selectedSyllables.forEach(function(syl) {
            var color = window.GameData.getRandomColor();
            var text = typeof syl === 'object' ? syl.text : syl;
            cards.push({ syllable: text, color: color, id: Math.random() });
            cards.push({ syllable: text, color: color, id: Math.random() });
        });
        
        window.Utils.shuffle(cards);
        
        var grid = window.Utils.createElement('div', 'cards-grid');
        grid.style.cssText = 'display:grid;gap:12px;width:100%;max-width:650px;max-height:100%;justify-content:center;align-items:center;';

        if (this.totalCards === 4) {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else if (this.totalCards === 6) {
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else if (this.totalCards === 8) {
            grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else {
            grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        }
        
        var self = this;
        cards.forEach(function(cardData) {
            var card = window.Utils.createElement('div', 'memory-card');
            card.style.cssText =
                'width:clamp(65px, 18vw, 120px);height:clamp(85px, 22vw, 145px);' +
                'perspective:1000px;cursor:pointer;user-select:none;margin:auto;';

            var inner = window.Utils.createElement('div', 'card-inner');
            inner.style.cssText =
                'position:relative;width:100%;height:100%;text-align:center;transition:transform 0.4s;' +
                'transform-style:preserve-3d;border-radius:18px;box-shadow:0 4px 10px rgba(0,0,0,0.15);';

            var back = window.Utils.createElement('div', 'card-back', '❓');
            back.style.cssText =
                'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:18px;' +
                'background:linear-gradient(135deg, #7B1FA2, #512DA8);color:white;display:flex;' +
                'align-items:center;justify-content:center;font-size:clamp(26px, 6vw, 42px);font-weight:bold;' +
                'border:3px solid #CE93D8;';

            var front = window.Utils.createElement('div', 'card-front', cardData.syllable.toUpperCase());
            front.style.cssText =
                'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:18px;' +
                'background:white;color:' + cardData.color + ';display:flex;align-items:center;justify-content:center;' +
                'font-size:clamp(24px, 5.5vw, 38px);font-weight:900;transform:rotateY(180deg);' +
                'border:4px solid ' + cardData.color + ';box-shadow:inset 0 0 10px rgba(0,0,0,0.05);';

            inner.appendChild(back);
            inner.appendChild(front);
            card.appendChild(inner);

            card.dataset.syllable = cardData.syllable;
            card.dataset.color = cardData.color;

            card.addEventListener('click', function() {
                self.flipCard(card, inner, cardData.syllable);
            });

            grid.appendChild(card);
        });
        
        this.gameArea.appendChild(grid);
    };

    SyllableMatchGame.prototype.flipCard = function(card, inner, syllableText) {
        if (this.lockBoard) return;
        if (card.dataset.flipped === 'true' || card.dataset.matched === 'true') return;

        inner.style.transform = 'rotateY(180deg)';
        card.dataset.flipped = 'true';
        
        window.speechSynthesis.cancel();
        window.AudioManager.speakSyllable(syllableText);

        this.flippedCards.push({ card: card, inner: inner, syllable: syllableText });

        if (this.flippedCards.length === 2) {
            this.lockBoard = true;
            this.checkForMatch();
        }
    };

    SyllableMatchGame.prototype.checkForMatch = function() {
        var self = this;
        var card1 = this.flippedCards[0];
        var card2 = this.flippedCards[1];

        var isMatch = (card1.syllable === card2.syllable);

        if (isMatch) {
            window.AudioManager.playCorrect();
            
            card1.card.dataset.matched = 'true';
            card2.card.dataset.matched = 'true';
            
            card1.card.style.pointerEvents = 'none';
            card2.card.style.pointerEvents = 'none';

            window.Utils.bounceElement(card1.card);
            window.Utils.bounceElement(card2.card);

            self.matchedPairs++;
            self.flippedCards = [];
            self.lockBoard = false;

            var totalPairs = self.totalCards / 2;
            if (self.matchedPairs === totalPairs) {
                self.showCorrectFeedback(self.gameArea);
                setTimeout(function() {
                    self.showCorrectOverlay('Tebrikler! 🎉');
                    setTimeout(function() {
                        self.startRound();
                    }, 1600);
                }, 400);
            }
        } else {
            window.AudioManager.playWrong();
            window.Utils.shakeElement(card1.card);
            window.Utils.shakeElement(card2.card);

            setTimeout(function() {
                card1.inner.style.transform = 'rotateY(0deg)';
                card2.inner.style.transform = 'rotateY(0deg)';
                delete card1.card.dataset.flipped;
                delete card2.card.dataset.flipped;
                self.flippedCards = [];
                self.lockBoard = false;
            }, 900);
        }
    };

    window.SyllableMatchGame = SyllableMatchGame;
})();
