(function() {
    'use strict';

    /**
     * İlk Harfini Bul 🦁
     * Sevimli nesnenin hangi harfle başladığını bulma oyunu
     */
    function FirstLetterGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'first-letter';
        this.currentItem = null;
        this.targetLetter = '';
    }

    FirstLetterGame.prototype = Object.create(window.BaseGame.prototype);
    FirstLetterGame.prototype.constructor = FirstLetterGame;

    FirstLetterGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Ekrandaki sevimli nesnenin adını dinle ve hangi harfle başladığını aşağıdaki harf karakterleri arasından seç!';
        this.helpIcon = '🦁';
        this.createHeader('İlk Harfini Bul 🦁');

        var self = this;
        var letters = window.Utils.shuffle(window.GameData.getAllLetters().slice()).slice(0, 3);
        var examples = letters.map(function(l) {
            var ex = window.GameData.getRandomLetterExample(l);
            return {
                text: window.Utils.toUpperTR(l) + ' → ' + (ex ? window.Utils.toUpperTR(ex.word) : ''),
                sound: ex ? ex.word : l,
                type: 'word',
                emoji: ex ? ex.emoji : '🦁',
                asset: ex ? ex.asset : null
            };
        });

        this.showIntro({
            title: 'İlk Harfini Bul! 🦁',
            icon: '🦁',
            description: 'Resimdeki nesnenin ilk harfi saklanmış! Nesnenin adını dinle ve hangi harfle başladığını bul.',
            voiceText: 'Resimdeki nesnenin hangi harfle başladığını bul!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    FirstLetterGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('İlk Harfini Bul 🦁');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area first-letter-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;padding:12px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this.nextRound();
    };

    FirstLetterGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        this.gameArea.innerHTML = '';
        this.updateDimensions();

        var areaRect = this.gameArea.getBoundingClientRect();
        var areaW = areaRect.width || this.dims.width || window.innerWidth;
        var areaH = areaRect.height || this.dims.height || window.innerHeight;

        var allLetters = window.GameData.getAllLetters().filter(function(l) { return l !== 'ğ'; });
        this.targetLetter = window.GameData.getNextFromDeck('first-letter-deck', allLetters);
        this.currentItem = window.GameData.getRandomLetterExample(this.targetLetter);

        var imgSize = Math.min(130, Math.max(76, Math.round(Math.min(areaW, areaH) * 0.25)));
        var cardCharSize = Math.min(68, Math.max(44, Math.round(Math.min(areaW, areaH) * 0.13)));

        // 1. Üst Kart: Nesne Resmi + Eksik İlk Harfli Kelime
        var topCard = window.Utils.createElement('div', 'first-letter-top-card');
        topCard.style.cssText =
            'display:flex;flex-direction:column;align-items:center;gap:10px;background:rgba(255,255,255,0.95);' +
            'padding:14px 28px;border-radius:28px;box-shadow:0 8px 24px rgba(0,0,0,0.16);cursor:pointer;max-width:92%;';

        var objImg = window.SvgLetters.createEmojiImage(
            this.currentItem.emoji || '🌟',
            imgSize,
            this.currentItem.asset
        );
        topCard.appendChild(objImg);

        var wordUpper = window.Utils.toUpperTR(this.currentItem.word);
        var restOfWord = wordUpper.substring(1);

        var wordRow = window.Utils.createElement('div', 'first-letter-word-row');
        wordRow.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:clamp(26px, 6vw, 44px);font-weight:900;letter-spacing:2px;';

        var missingBox = window.Utils.createElement('span', 'missing-char-box', '?');
        missingBox.style.cssText =
            'display:inline-flex;align-items:center;justify-content:center;min-width:46px;height:52px;' +
            'padding:0 10px;border-radius:14px;background:#FFF3E0;border:3px dashed #FF9800;color:#EF6C00;';

        var restSpan = window.Utils.createElement('span', '', restOfWord);
        restSpan.style.color = '#263238';

        wordRow.appendChild(missingBox);
        wordRow.appendChild(restSpan);
        topCard.appendChild(wordRow);

        topCard.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentItem.word);
            window.Utils.celebrateElement(objImg);
        });
        this.gameArea.appendChild(topCard);

        // 2. Alt Kısım: 4 Sevimli Karakter Harf Seçeneği
        var distractors = [];
        var attempts = 0;
        while (distractors.length < 3 && attempts < 60) {
            var cand = window.Utils.randomItem(allLetters);
            if (cand !== this.targetLetter && distractors.indexOf(cand) === -1) {
                distractors.push(cand);
            }
            attempts++;
        }
        var choices = window.Utils.shuffle([this.targetLetter].concat(distractors));

        var grid = window.Utils.createElement('div', 'first-letter-grid');
        grid.style.cssText =
            'display:grid;grid-template-columns:repeat(2, 1fr);gap:clamp(10px, 2.5vw, 18px);' +
            'width:100%;max-width:' + Math.min(480, areaW - 24) + 'px;';

        choices.forEach(function(letter) {
            var color = window.GameData.getLetterColor(letter);
            var btn = window.Utils.createElement('button', 'first-letter-choice');
            btn.style.cssText =
                'display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;' +
                'background:white;border:4px solid ' + color + ';border-radius:24px;cursor:pointer;' +
                'box-shadow:0 6px 16px rgba(0,0,0,0.14);transition:all 0.2s;';

            var charSvg = window.SvgLetters.createLetter(letter, cardCharSize, color);
            var txtSpan = window.Utils.createElement('span', '', window.Utils.toUpperTR(letter));
            txtSpan.style.cssText = 'font-size:clamp(26px, 5.5vw, 40px);font-weight:900;color:' + color + ';';

            btn.appendChild(charSvg);
            btn.appendChild(txtSpan);

            btn.addEventListener('click', function() {
                if (btn.dataset.disabled === 'true') return;
                window.speechSynthesis.cancel();

                if (letter === self.targetLetter) {
                    var allBtns = grid.querySelectorAll('button');
                    allBtns.forEach(function(b) { b.dataset.disabled = 'true'; });

                    missingBox.textContent = window.Utils.toUpperTR(letter);
                    missingBox.style.background = '#4CAF50';
                    missingBox.style.borderColor = '#2E7D32';
                    missingBox.style.color = 'white';

                    btn.style.background = '#E8F5E9';
                    btn.style.borderColor = '#2E7D32';

                    window.Utils.celebrateElement(objImg);
                    window.Utils.bounceElement(missingBox);
                    self.showCorrectFeedback(btn);
                    window.AudioManager.speak(window.Utils.toUpperTR(letter) + ', ' + self.currentItem.word, 0.85, 1.1);

                    setTimeout(function() {
                        self.nextRound();
                    }, 1650);
                } else {
                    self.showWrongFeedback(btn);
                    window.AudioManager.playZort();
                }
            });

            grid.appendChild(btn);
        });

        this.gameArea.appendChild(grid);

        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentItem.word);
            window.Utils.pulseElement(objImg);
        }, 350);
    };

    window.FirstLetterGame = FirstLetterGame;
})();
