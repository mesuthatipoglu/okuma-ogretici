(function () {
    function LetterMatchGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'letter-match';
        var savedSize = parseInt(localStorage.getItem('letter_match_matrix_size'), 10);
        this.totalCards = (savedSize === 4 || savedSize === 6 || savedSize === 8 || savedSize === 12) ? savedSize : 6;
    }

    LetterMatchGame.prototype = Object.create(window.BaseGame.prototype);
    LetterMatchGame.prototype.constructor = LetterMatchGame;

    LetterMatchGame.prototype.init = function () {
        window.BaseGame.prototype.init.call(this);
        
        this.helpText = 'Kartları çevirerek aynı harfleri ve sevimli nesnelerini bulup eşleştir! Her kartta o harfle başlayan farklı bir nesne seni bekliyor.';
        this.helpIcon = '🃏';
        this.createHeader('Harf Eşleştirme 🃏');

        var self = this;
        var letters = window.GameData.getAllLetters();
        var exLetters = window.GameData.pickUniqueItems('lmatch_intro', letters, 3);
        var examples = exLetters.map(function(l) {
            var info = window.GameData.getLetterInfo(l);
            var ex = (info && info.examples && info.examples.length)
                ? window.GameData.pickUniqueItems('lmatch_intro_ex_' + l, info.examples, 1)[0]
                : { word: l, emoji: '🃏' };
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
            title: 'Resimli Harf Eşleştirme! 🃏',
            icon: 'oyuncak',
            description: 'Kartları çevir, aynı harfleri ve o harfle başlayan eğlenceli nesneleri bulup eşleştir!',
            voiceText: 'Kartları çevir ve aynı harfleri bulup eşleştir!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterMatchGame.prototype.startGameplay = function () {
        this.container.innerHTML = '';
        
        var controlsBar = window.Utils.createElement('div', 'match-controls-bar');
        controlsBar.style.cssText =
            'display:flex;align-items:center;justify-content:center;gap:8px;padding:6px 8px;' +
            'background:rgba(0,0,0,0.18);width:100%;box-sizing:border-box;flex-wrap:wrap;flex-shrink:0;';

        var sizeLabel = window.Utils.createElement('span', 'size-label', 'Kart Sayısı:');
        sizeLabel.style.cssText = 'color:white;font-weight:bold;font-size:clamp(12px, 2.4vw, 15px);margin-right:4px;';
        controlsBar.appendChild(sizeLabel);

        var self = this;
        var sizes = [
            { count: 4, label: '4 Kart' },
            { count: 6, label: '6 Kart' },
            { count: 8, label: '8 Kart' },
            { count: 12, label: '12 Kart' }
        ];

        sizes.forEach(function(s) {
            var btn = window.Utils.createElement('button', 'size-btn', s.label);
            var isActive = (self.totalCards === s.count);
            btn.style.cssText =
                'padding:5px 12px;border:none;border-radius:14px;font-weight:bold;cursor:pointer;' +
                'font-size:clamp(12px, 2.2vw, 14px);transition:all 0.2s;' +
                (isActive ? 'background:#00E676;color:#1B5E20;box-shadow:0 2px 6px rgba(0,0,0,0.2);' : 'background:rgba(255,255,255,0.28);color:white;');

            btn.addEventListener('click', function() {
                if (self.totalCards === s.count) return;
                self.totalCards = s.count;
                localStorage.setItem('letter_match_matrix_size', s.count);
                self.startGameplay();
            });
            controlsBar.appendChild(btn);
        });
        this.container.appendChild(controlsBar);

        this.gameArea = window.Utils.createElement('div', 'game-area letter-match-area');
        this.gameArea.style.cssText =
            'position:relative;width:100%;flex:1;display:flex;justify-content:center;align-items:center;padding:10px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);
        
        this.startRound();
    };

    LetterMatchGame.prototype.onResize = function () {
        if (this.gameArea && this.running) {
            this.startRound();
        }
    };

    LetterMatchGame.prototype.startRound = function () {
        if (!this.gameArea) return;
        this.gameArea.innerHTML = '';
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.lockBoard = false;
        
        var rect = this.gameArea.getBoundingClientRect();
        var areaW = rect.width || window.innerWidth;
        var areaH = rect.height || window.innerHeight;

        var pairsNeeded = this.totalCards / 2;
        var allLetters = window.GameData.getAllLetters();
        var selectedLetters = window.GameData.pickUniqueItems('letter_match_pool', allLetters, pairsNeeded);
        
        // Her harf çifti için o harfle başlayan 2 FARKLI eğlenceli nesne seç!
        var cards = [];
        selectedLetters.forEach(function(letter) {
            var info = window.GameData.getLetterInfo(letter);
            var color = (info && info.color) || window.GameData.getRandomColor();
            var exPair = (info && info.examples && info.examples.length >= 2)
                ? window.GameData.pickUniqueItems('lmatch_ex_' + letter, info.examples, 2)
                : [{ word: letter, emoji: '⭐' }, { word: letter, emoji: '🌟' }];
            cards.push({ letter: letter, color: color, example: exPair[0], id: Math.random() });
            cards.push({ letter: letter, color: color, example: exPair[1] || exPair[0], id: Math.random() });
        });
        
        cards = window.Utils.shuffle(cards);
        
        var cols = (this.totalCards === 4) ? 2 : (this.totalCards === 6 ? 3 : 4);
        var rows = Math.ceil(this.totalCards / cols);
        var gap = 12;
        var maxCardW = Math.floor((Math.min(areaW - 24, 660) - (cols - 1) * gap) / cols);
        var maxCardH = Math.floor((areaH - 24 - (rows - 1) * gap) / rows);
        var cardW = Math.max(66, Math.min(maxCardW, Math.round(maxCardH * 0.85), 145));
        var cardH = Math.max(82, Math.min(maxCardH, Math.round(cardW * 1.22), 175));

        var grid = window.Utils.createElement('div', 'cards-grid');
        grid.style.cssText =
            'display:grid;grid-template-columns:repeat(' + cols + ', ' + cardW + 'px);' +
            'gap:' + gap + 'px;justify-content:center;align-items:center;';
        
        var self = this;

        cards.forEach(function(cardData) {
            var card = window.Utils.createElement('div', 'memory-card');
            card.style.cssText =
                'width:' + cardW + 'px;height:' + cardH + 'px;' +
                'perspective:1000px;cursor:pointer;user-select:none;';

            var inner = window.Utils.createElement('div', 'card-inner');
            inner.style.cssText =
                'position:relative;width:100%;height:100%;text-align:center;transition:transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);' +
                'transform-style:preserve-3d;border-radius:20px;box-shadow:0 6px 14px rgba(0,0,0,0.2);';

            var back = window.Utils.createElement('div', 'card-back', '🌟');
            back.style.cssText =
                'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:20px;' +
                'background:linear-gradient(135deg, #29B6F6, #1565C0);color:white;display:flex;' +
                'align-items:center;justify-content:center;font-size:' + Math.round(cardW * 0.42) + 'px;font-weight:bold;' +
                'border:3px solid #B3E5FC;';

            var displayUpper = window.Utils.toUpperTR(cardData.letter);
            var front = window.Utils.createElement('div', 'card-front');
            front.style.cssText =
                'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:20px;' +
                'background:white;color:' + cardData.color + ';display:flex;flex-direction:column;' +
                'align-items:center;justify-content:center;gap:2px;transform:rotateY(180deg);' +
                'border:4px solid ' + cardData.color + ';padding:4px;box-sizing:border-box;';

            var objImg = window.SvgLetters.createObjectImage(cardData.example, Math.round(Math.min(cardW, cardH) * 0.46), { bg: false, animate: false });
            var letterLbl = window.Utils.createElement('div', '', displayUpper + ' ' + cardData.letter);
            letterLbl.style.cssText = 'font-size:' + Math.round(cardH * 0.22) + 'px;font-weight:900;line-height:1;';
            var wordLbl = window.Utils.createElement('div', '', cardData.example.word.toUpperCase());
            wordLbl.style.cssText = 'font-size:' + Math.max(9, Math.round(cardH * 0.1)) + 'px;font-weight:800;color:#555;max-width:95%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';

            front.appendChild(objImg);
            front.appendChild(letterLbl);
            front.appendChild(wordLbl);

            inner.appendChild(back);
            inner.appendChild(front);
            card.appendChild(inner);

            card.dataset.letter = cardData.letter;
            card.dataset.word = cardData.example.word;

            card.addEventListener('click', function() {
                self.flipCard(card, inner, cardData.letter, cardData.example.word);
            });

            grid.appendChild(card);
        });
        
        this.gameArea.appendChild(grid);
    };

    LetterMatchGame.prototype.flipCard = function(card, inner, letterText, wordText) {
        if (this.lockBoard) return;
        if (card.dataset.flipped === 'true' || card.dataset.matched === 'true') return;

        inner.style.transform = 'rotateY(180deg)';
        card.dataset.flipped = 'true';
        
        window.speechSynthesis.cancel();
        window.AudioManager.speakWord(wordText || letterText);

        this.flippedCards.push({ card: card, inner: inner, letter: letterText, word: wordText });

        if (this.flippedCards.length === 2) {
            this.lockBoard = true;
            this.checkForMatch();
        }
    };

    LetterMatchGame.prototype.checkForMatch = function() {
        var self = this;
        var card1 = this.flippedCards[0];
        var card2 = this.flippedCards[1];

        var isMatch = (card1.letter === card2.letter);

        if (isMatch) {
            card1.card.dataset.matched = 'true';
            card2.card.dataset.matched = 'true';
            
            card1.card.style.pointerEvents = 'none';
            card2.card.style.pointerEvents = 'none';

            this.showCorrectFeedback(card2.card);
            window.Utils.bounceElement(card1.card);

            self.matchedPairs++;
            self.flippedCards = [];
            self.lockBoard = false;

            var totalPairs = self.totalCards / 2;
            if (self.matchedPairs === totalPairs) {
                setTimeout(function() {
                    self.showCorrectOverlay('Süper Eşleştirme! 🎉', card2.word);
                    setTimeout(function() {
                        self.startRound();
                    }, 1550);
                }, 350);
            }
        } else {
            window.AudioManager.playWrong();
            setTimeout(function() { window.AudioManager.playZort(); }, 250);
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

    window.LetterMatchGame = LetterMatchGame;
})();
