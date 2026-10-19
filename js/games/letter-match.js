(function () {
    function LetterMatchGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'letter_match';
        // Matris boyutu (4, 6, 8, 12)
        var savedSize = parseInt(localStorage.getItem('letter_match_matrix_size'), 10);
        this.totalCards = (savedSize === 4 || savedSize === 6 || savedSize === 8 || savedSize === 12) ? savedSize : 6;
    }

    LetterMatchGame.prototype = Object.create(window.BaseGame.prototype);
    LetterMatchGame.prototype.constructor = LetterMatchGame;

    LetterMatchGame.prototype.init = function () {
        window.BaseGame.prototype.init.call(this);
        
        this.helpText = 'Kartları çevirerek aynı harfleri bul ve eşleştir! Yukarıdaki düğmelerden kart sayısını değiştirebilirsin.';
        this.helpIcon = '🃏';
        this.createHeader('Harf Eşleştirme 🃏');

        var self = this;
        var letters = window.GameData.getAllLetters();
        var exLetters = letters.slice(0, 3);
        var examples = exLetters.map(function(l) {
            return { text: l.toUpperCase() + ' ' + l, sound: l, type: 'letter', emoji: '🃏' };
        });

        this.showIntro({
            title: 'Harf Eşleştirme! 🃏',
            icon: '🃏',
            description: 'Tüm alfabedeki harfleri eşleştireceğiz! Kartları çevir ve aynı iki harfi bul.',
            voiceText: 'Kartları çevir ve aynı harfleri bulup eşleştir!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterMatchGame.prototype.startGameplay = function () {
        this.container.innerHTML = '';
        
        // Üst panel: Kart Sayısı Seçici (2x2, 2x3, 2x4, 3x4)
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
                localStorage.setItem('letter_match_matrix_size', s.count);
                self.startGameplay();
            });
            controlsBar.appendChild(btn);
        });
        this.container.appendChild(controlsBar);

        this.gameArea = window.Utils.createElement('div', 'game-area letter-match-area');
        this.gameArea.style.cssText =
            'position:relative;width:100%;flex:1;display:flex;justify-content:center;align-items:center;padding:12px;box-sizing:border-box;';
        this.container.appendChild(this.gameArea);
        
        this.startRound();
    };

    LetterMatchGame.prototype.startRound = function () {
        this.gameArea.innerHTML = '';
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.lockBoard = false;
        
        var pairsNeeded = this.totalCards / 2;
        var allLetters = window.GameData.getAllLetters();
        var shuffledAll = window.Utils.shuffle(allLetters.slice());
        var selectedLetters = shuffledAll.slice(0, pairsNeeded);
        
        // Kart çiftleri oluştur
        var cards = [];
        selectedLetters.forEach(function(letter) {
            var color = window.GameData.getRandomColor();
            cards.push({ letter: letter, color: color, id: Math.random() });
            cards.push({ letter: letter, color: color, id: Math.random() });
        });
        
        window.Utils.shuffle(cards);
        
        // Izgara düzeni
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
        var cardSize = Math.min(130, Math.max(70, Math.floor(400 / Math.ceil(this.totalCards / 3))));

        cards.forEach(function(cardData) {
            var card = window.Utils.createElement('div', 'memory-card');
            card.style.cssText =
                'width:clamp(78px, 21.6vw, 144px);height:clamp(102px, 26.4vw, 174px);' +
                'perspective:1000px;cursor:pointer;user-select:none;margin:auto;';

            var inner = window.Utils.createElement('div', 'card-inner');
            inner.style.cssText =
                'position:relative;width:100%;height:100%;text-align:center;transition:transform 0.4s;' +
                'transform-style:preserve-3d;border-radius:18px;box-shadow:0 4px 10px rgba(0,0,0,0.15);';

            // Arka yüz (Soru işareti)
            var back = window.Utils.createElement('div', 'card-back', '❓');
            back.style.cssText =
                'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:18px;' +
                'background:linear-gradient(135deg, #1E88E5, #1565C0);color:white;display:flex;' +
                'align-items:center;justify-content:center;font-size:clamp(31px, 7.2vw, 50px);font-weight:bold;' +
                'border:3px solid #90CAF9;';

            // Ön yüz (Harf)
            var displayUpper = window.Utils.toUpperTR(cardData.letter);
            var front = window.Utils.createElement('div', 'card-front', displayUpper + ' ' + cardData.letter);
            front.style.cssText =
                'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:18px;' +
                'background:white;color:' + cardData.color + ';display:flex;align-items:center;justify-content:center;' +
                'font-size:clamp(26px, 6.6vw, 43px);font-weight:900;transform:rotateY(180deg);' +
                'border:4px solid ' + cardData.color + ';box-shadow:inset 0 0 10px rgba(0,0,0,0.05);';

            inner.appendChild(back);
            inner.appendChild(front);
            card.appendChild(inner);

            card.dataset.letter = cardData.letter;
            card.dataset.color = cardData.color;

            card.addEventListener('click', function() {
                self.flipCard(card, inner, cardData.letter);
            });

            grid.appendChild(card);
        });
        
        this.gameArea.appendChild(grid);
    };

    LetterMatchGame.prototype.flipCard = function(card, inner, letterText) {
        if (this.lockBoard) return;
        if (card.dataset.flipped === 'true' || card.dataset.matched === 'true') return;

        // Kart çevirildi
        inner.style.transform = 'rotateY(180deg)';
        card.dataset.flipped = 'true';
        
        // Yumuşak çevirme sesi (geri bildirim sesini bastırmayacak)
        window.speechSynthesis.cancel();
        window.AudioManager.speakLetter(letterText);

        this.flippedCards.push({ card: card, inner: inner, letter: letterText });

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
            // Eşleşme bulundu - Anında ses ve geri bildirim
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
            // Eşleşmedi - Anında hata sesi
            window.AudioManager.playWrong();
            setTimeout(function() { window.AudioManager.playZort(); }, 300);
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
