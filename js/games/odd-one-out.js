(function() {
    'use strict';

    /**
     * Farklı Olanı Bul 🎪
     * 3 tanesi aynı harfle başlayan nesneler arasından farklı harfle başlayanı bulma oyunu
     */
    function OddOneOutGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'odd-one-out';
    }

    OddOneOutGame.prototype = Object.create(window.BaseGame.prototype);
    OddOneOutGame.prototype.constructor = OddOneOutGame;

    OddOneOutGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Ekrandaki 4 karttan 3 tanesi aynı harfle başlıyor, 1 tanesi ise bambaşka bir harfle başlıyor! Farklı olanı bulup dokun.';
        this.helpIcon = '🎪';
        this.createHeader('Farklı Olanı Bul 🎪');

        var self = this;
        this.showIntro({
            title: 'Farklı Olanı Bul! 🎪',
            icon: '🎪',
            description: '3 nesne aynı harfle başlıyor, ama 1 tanesi farklı!\nDikkatle bak, dinle ve farklı olan nesneyi yakala!',
            voiceText: 'Üç nesne aynı harfle başlıyor, farklı olanı bul!',
            examples: [
                { text: 'A: Aslan', sound: 'aslan', emoji: '🦁', asset: 'assets/images/objects/aslan.svg' },
                { text: 'A: Araba', sound: 'araba', emoji: '🚗', asset: 'assets/images/objects/araba.svg' },
                { text: 'R: Roket (Farklı!)', sound: 'roket', emoji: '🚀', asset: 'assets/images/objects/roket.svg' }
            ],
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    OddOneOutGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Farklı Olanı Bul 🎪');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area odd-one-out-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;padding:12px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this.nextRound();
    };

    OddOneOutGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        this.gameArea.innerHTML = '';
        this.updateDimensions();

        var areaRect = this.gameArea.getBoundingClientRect();
        var areaW = areaRect.width || this.dims.width || window.innerWidth;
        var areaH = areaRect.height || this.dims.height || window.innerHeight;

        var richLetters = ['a', 'b', 'ç', 'd', 'e', 'f', 'g', 'k', 'l', 'm', 'o', 'p', 'r', 's', 'ş', 't', 'u', 'y', 'z'];
        var commonLetter = window.GameData.getNextFromDeck('odd-common-letter', richLetters);
        var oddLetter = window.Utils.randomItem(richLetters.filter(function(l) { return l !== commonLetter; }));

        var commonInfo = window.GameData.getLetterInfo(commonLetter);
        var oddInfo = window.GameData.getLetterInfo(oddLetter);

        var commonExamples = window.Utils.shuffle((commonInfo.examples || []).slice()).slice(0, 3);
        var oddExample = window.Utils.randomItem(oddInfo.examples || []);

        var cards = commonExamples.map(function(ex) {
            return { letter: commonLetter, word: ex.word, emoji: ex.emoji, asset: ex.asset, isOdd: false };
        });
        cards.push({ letter: oddLetter, word: oddExample.word, emoji: oddExample.emoji, asset: oddExample.asset, isOdd: true });
        cards = window.Utils.shuffle(cards);

        // 1. Üst Bilgi Çubuğu
        var promptBanner = window.Utils.createElement('div', 'odd-prompt-banner');
        promptBanner.style.cssText =
            'background:rgba(255,255,255,0.95);padding:10px 22px;border-radius:24px;' +
            'box-shadow:0 6px 16px rgba(0,0,0,0.14);text-align:center;font-size:clamp(16px, 3.5vw, 22px);font-weight:900;color:#D84315;';
        promptBanner.textContent = '🎪 3 tanesi "' + window.Utils.toUpperTR(commonLetter) + '" harfiyle başlıyor. Farklı olan hangisi?';
        this.gameArea.appendChild(promptBanner);

        // 2. 2x2 Kart Izgarası
        var imgSize = Math.min(86, Math.max(54, Math.round(Math.min(areaW, areaH) * 0.16)));
        var grid = window.Utils.createElement('div', 'odd-cards-grid');
        grid.style.cssText =
            'display:grid;grid-template-columns:repeat(2, 1fr);gap:clamp(12px, 2.8vw, 20px);' +
            'width:100%;max-width:' + Math.min(520, areaW - 24) + 'px;';

        cards.forEach(function(c) {
            var lColor = window.GameData.getLetterColor(c.letter);
            var cardBtn = window.Utils.createElement('button', 'odd-card-btn');
            cardBtn.style.cssText =
                'position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;' +
                'padding:16px 10px;background:white;border:4px solid ' + lColor + ';border-radius:26px;' +
                'cursor:pointer;box-shadow:0 8px 18px rgba(0,0,0,0.14);transition:all 0.2s;';

            var letterBadge = window.Utils.createElement('div', '', window.Utils.toUpperTR(c.letter));
            letterBadge.style.cssText =
                'position:absolute;top:8px;left:10px;width:32px;height:32px;border-radius:50%;' +
                'background:' + lColor + ';color:white;font-size:17px;font-weight:900;' +
                'display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);';
            cardBtn.appendChild(letterBadge);

            var svgVisual = window.SvgLetters.createEmojiImage(c.emoji, imgSize, c.asset);
            cardBtn.appendChild(svgVisual);

            var wordLbl = window.Utils.createElement('div', '', window.Utils.toUpperTR(c.word));
            wordLbl.style.cssText = 'font-size:clamp(16px, 3.5vw, 22px);font-weight:900;color:#263238;';
            cardBtn.appendChild(wordLbl);

            cardBtn.addEventListener('click', function() {
                if (cardBtn.dataset.disabled === 'true') return;
                window.speechSynthesis.cancel();

                if (c.isOdd) {
                    var allBtns = grid.querySelectorAll('button');
                    allBtns.forEach(function(b) { b.dataset.disabled = 'true'; });

                    cardBtn.style.background = '#E8F5E9';
                    cardBtn.style.borderColor = '#2E7D32';

                    window.Utils.celebrateElement(cardBtn);
                    self.showCorrectFeedback(cardBtn);
                    window.AudioManager.speak(c.word + ', ' + window.Utils.toUpperTR(c.letter) + ' harfiyle başlıyor!', 0.85, 1.1);

                    setTimeout(function() {
                        self.nextRound();
                    }, 1750);
                } else {
                    self.showWrongFeedback(cardBtn);
                    window.AudioManager.playZort();
                    window.AudioManager.speakWord(c.word);
                }
            });

            grid.appendChild(cardBtn);
        });

        this.gameArea.appendChild(grid);
    };

    window.OddOneOutGame = OddOneOutGame;
})();
