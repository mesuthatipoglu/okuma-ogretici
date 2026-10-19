(function() {
    'use strict';

    /**
     * Gölge Dedektifi 🕵️
     * Gizemli gölgenin hangi nesneye ve kelimeye ait olduğunu bulma oyunu.
     * Ekran boyutuna göre tüm bileşenleri dinamik olarak hesaplar ve oyun alanına sığdırır.
     */
    function ShadowMatchGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'shadow-match';
        this.targetWord = null;
        this.currentChoices = [];
        this._onResize = null;
    }

    ShadowMatchGame.prototype = Object.create(window.BaseGame.prototype);
    ShadowMatchGame.prototype.constructor = ShadowMatchGame;

    ShadowMatchGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Yukarıdaki gizemli gölgeye dikkatle bak! Bu gölge aşağıdaki sevimli nesnelerden hangisine ait? Doğru nesneye dokun!';
        this.helpIcon = '🕵️';
        this.createHeader('Gölge Dedektifi 🕵️');

        var self = this;
        var allWords = window.GameData.getAllWords().filter(function(w) { return !!(w.image || w.asset); });
        var exWords = window.GameData.pickUniqueItems('shadow-intro', allWords, 3);
        var examples = exWords.map(function(w) {
            return {
                text: window.Utils.toUpperTR(w.word),
                sound: w.word,
                type: 'word',
                emoji: w.emoji,
                image: w.image || w.asset
            };
        });

        this.showIntro({
            title: 'Gölge Dedektifi! 🕵️',
            icon: '🕵️',
            description: 'Sevimli nesneler karanlıkta saklanmış! Yukarıdaki gölgenin kime ait olduğunu bulabilir misin?',
            voiceText: 'Yukarıdaki gölgenin hangi nesneye ait olduğunu bul!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    ShadowMatchGame.prototype.startGameplay = function() {
        var self = this;
        this.container.innerHTML = '';
        this.createHeader('Gölge Dedektifi 🕵️');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area shadow-match-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;padding:10px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this._onResize = function() {
            if (self.running && self.targetWord) {
                self.renderRoundLayout();
            }
        };
        window.addEventListener('resize', this._onResize);

        this.nextRound();
    };

    ShadowMatchGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var wordsWithAssets = window.GameData.getAllWords().filter(function(w) { return !!(w.image || w.asset); });
        this.targetWord = window.GameData.pickUniqueItems('shadow-match-deck', wordsWithAssets, 1)[0];

        var self = this;
        var pool = wordsWithAssets.filter(function(w) { return w.word !== self.targetWord.word; });
        var distractors = window.GameData.pickUniqueItems('shadow-distractors', pool, 3);
        this.currentChoices = window.Utils.shuffle([this.targetWord].concat(distractors));

        this.renderRoundLayout();
    };

    ShadowMatchGame.prototype.renderRoundLayout = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        this.updateDimensions();

        // Kullanılan cihazın ekranına göre oyun alanını hesapla ve bileşenleri sığdır
        var areaRect = this.gameArea.getBoundingClientRect();
        var areaW = areaRect.width || this.gameArea.clientWidth || window.innerWidth;
        var areaH = areaRect.height || this.gameArea.clientHeight || (window.innerHeight - 60);
        var isLandscape = areaW > areaH * 1.25;

        this.gameArea.style.flexDirection = isLandscape ? 'row' : 'column';

        var shadowSize = isLandscape
            ? Math.min(145, Math.max(80, Math.floor(areaH * 0.36)))
            : Math.min(130, Math.max(72, Math.floor(areaH * 0.22)));

        var cardMaxH = isLandscape
            ? Math.floor((areaH - 36) / 2)
            : Math.floor((areaH - shadowSize - 110) / 2);
        cardMaxH = Math.max(76, Math.min(145, cardMaxH));

        var optionImgSize = Math.max(40, Math.min(72, Math.floor(cardMaxH * 0.52)));

        // 1. Dedektif Büyüteci İçinde Gizemli Gölge
        var shadowCard = window.Utils.createElement('div', 'shadow-mystery-card');
        shadowCard.style.cssText =
            'display:flex;flex-direction:column;align-items:center;gap:6px;background:rgba(255,255,255,0.95);' +
            'padding:' + Math.max(8, Math.floor(areaH * 0.02)) + 'px 22px;border-radius:28px;' +
            'box-shadow:0 10px 25px rgba(0,0,0,0.22);border:4px solid #7E57C2;cursor:pointer;flex-shrink:0;';

        var shadowImgWrap = window.Utils.createElement('div', 'shadow-img-wrap');
        shadowImgWrap.style.cssText =
            'width:' + shadowSize + 'px;height:' + shadowSize + 'px;display:flex;align-items:center;justify-content:center;' +
            'background:radial-gradient(circle, #EDE7F6 0%, #D1C4E9 100%);border-radius:50%;padding:10px;box-sizing:border-box;' +
            'box-shadow:inset 0 4px 10px rgba(0,0,0,0.12);';

        var rawImg = document.createElement('img');
        rawImg.src = this.targetWord.image || this.targetWord.asset;
        rawImg.alt = '?';
        rawImg.style.cssText =
            'width:85%;height:85%;object-fit:contain;filter:brightness(0) opacity(0.84);transition:filter 0.4s ease, transform 0.4s ease;';
        shadowImgWrap.appendChild(rawImg);
        shadowCard.appendChild(shadowImgWrap);

        var clueLabel = window.Utils.createElement('div', '', '🕵️ Bu gölge kimin?');
        clueLabel.style.cssText = 'font-size:clamp(14px, 2.8vw, 19px);font-weight:900;color:#4527A0;text-align:center;';
        shadowCard.appendChild(clueLabel);

        shadowCard.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.targetWord.word);
            window.Utils.pulseElement(shadowCard);
        });
        this.gameArea.appendChild(shadowCard);

        // 2. Seçenek Kartları Izgarası
        var gridMaxW = isLandscape ? Math.min(480, Math.floor(areaW * 0.56)) : Math.min(480, areaW - 20);
        var grid = window.Utils.createElement('div', 'shadow-options-grid');
        grid.style.cssText =
            'display:grid;grid-template-columns:repeat(2, 1fr);gap:clamp(8px, 2vw, 14px);' +
            'width:100%;max-width:' + gridMaxW + 'px;box-sizing:border-box;';

        this.currentChoices.forEach(function(item) {
            var btn = window.Utils.createElement('button', 'shadow-choice-btn');
            btn.style.cssText =
                'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;' +
                'height:' + cardMaxH + 'px;padding:6px;background:white;border:4px solid #B39DDB;border-radius:22px;cursor:pointer;' +
                'box-shadow:0 6px 14px rgba(0,0,0,0.15);transition:all 0.2s;box-sizing:border-box;';

            var itemSvg = window.SvgLetters.createObjectImage(item, optionImgSize);
            var itemWord = window.Utils.createElement('span', '', window.Utils.toUpperTR(item.word));
            itemWord.style.cssText = 'font-size:clamp(14px, 3vw, 20px);font-weight:900;color:#311B92;line-height:1.1;';

            btn.appendChild(itemSvg);
            btn.appendChild(itemWord);

            btn.addEventListener('click', function() {
                if (btn.dataset.disabled === 'true') return;
                window.speechSynthesis.cancel();

                if (item.word === self.targetWord.word) {
                    var allBtns = grid.querySelectorAll('button');
                    allBtns.forEach(function(b) { b.dataset.disabled = 'true'; });

                    rawImg.style.filter = 'brightness(1) opacity(1) drop-shadow(0 6px 12px rgba(0,0,0,0.22))';
                    rawImg.style.transform = 'scale(1.12)';
                    clueLabel.textContent = '🌟 ' + window.Utils.toUpperTR(item.word) + '!';
                    clueLabel.style.color = '#2E7D32';

                    btn.style.background = '#E8F5E9';
                    btn.style.borderColor = '#4CAF50';

                    window.Utils.celebrateElement(shadowCard);
                    self.showCorrectFeedback(btn);
                    window.AudioManager.speakWord(item.word);
                    self.showCorrectOverlay(window.Utils.toUpperTR(item.word) + ' 🕵️🌟');

                    setTimeout(function() {
                        self.nextRound();
                    }, 1800);
                } else {
                    self.showWrongFeedback(btn);
                    window.AudioManager.playZort();
                }
            });

            grid.appendChild(btn);
        });

        this.gameArea.appendChild(grid);
    };

    ShadowMatchGame.prototype.destroy = function() {
        if (this._onResize) {
            window.removeEventListener('resize', this._onResize);
            this._onResize = null;
        }
        window.BaseGame.prototype.destroy.call(this);
    };

    window.ShadowMatchGame = ShadowMatchGame;
})();
