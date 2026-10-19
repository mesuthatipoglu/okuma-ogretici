(function() {
    'use strict';

    /**
     * Eksik Heceyi Bul 🦋
     * Resimli kelimenin eksik olan hecesini 3 seçenek arasından bulma oyunu
     */
    function MissingSyllableGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'missing-syllable';
        this.currentWord = null;
        this.missingIndex = 0;
    }

    MissingSyllableGame.prototype = Object.create(window.BaseGame.prototype);
    MissingSyllableGame.prototype.constructor = MissingSyllableGame;

    MissingSyllableGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Resimdeki kelimenin bir hecesi saklanmış! Kelimeyi dinle ve soru işaretli kutuya hangi hecenin gelmesi gerektiğini seç.';
        this.helpIcon = '🦋';
        this.createHeader('Eksik Heceyi Bul 🦋');

        var self = this;
        var multiWords = window.Utils.shuffle(window.GameData.getAllWords().filter(function(w) {
            return w.syllables && w.syllables.length >= 2;
        }));
        var examples = multiWords.slice(0, 3).map(function(w) {
            return {
                text: w.syllables.map(function(s) { return window.Utils.toUpperTR(s); }).join(' - '),
                sound: w.word,
                type: 'word',
                emoji: w.emoji,
                asset: w.asset
            };
        });

        this.showIntro({
            title: 'Eksik Heceyi Bul! 🦋',
            icon: '🦋',
            description: 'Kelimenin içindeki bir hece saklambaç oynuyor!\nResme bak, kelimeyi dinle ve eksik heceyi bul.',
            voiceText: 'Resme bak ve kelimedeki eksik heceyi bul!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    MissingSyllableGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Eksik Heceyi Bul 🦋');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area missing-syllable-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;padding:14px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this.nextRound();
    };

    MissingSyllableGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        this.gameArea.innerHTML = '';
        this.updateDimensions();

        var areaRect = this.gameArea.getBoundingClientRect();
        var areaW = areaRect.width || this.dims.width || window.innerWidth;
        var areaH = areaRect.height || this.dims.height || window.innerHeight;

        var multiWords = window.GameData.getAllWords().filter(function(w) {
            return w.syllables && w.syllables.length >= 2;
        });

        this.currentWord = window.GameData.getNextFromDeck('missing-syllable-deck', multiWords);
        var syllables = this.currentWord.syllables;
        this.missingIndex = window.Utils.randomInt(0, syllables.length - 1);
        var targetSyl = syllables[this.missingIndex];

        var imgSize = Math.min(130, Math.max(82, Math.round(Math.min(areaW, areaH) * 0.24)));

        // 1. Üst: Görsel + Ses Butonu
        var imgWrap = window.Utils.createElement('div', 'missing-syl-img-wrap');
        imgWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;';
        var svgImg = window.SvgLetters.createEmojiImage(this.currentWord.emoji || '🦋', imgSize, this.currentWord.asset);
        imgWrap.appendChild(svgImg);

        var listenPill = window.Utils.createElement('button', '', '🔊 ' + window.Utils.toUpperTR(this.currentWord.word));
        listenPill.style.cssText =
            'border:none;border-radius:20px;background:#FF9800;color:white;font-weight:900;' +
            'padding:6px 18px;font-size:clamp(14px, 2.8vw, 18px);cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.15);';
        imgWrap.appendChild(listenPill);

        imgWrap.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentWord.word);
            window.Utils.celebrateElement(svgImg);
        });
        this.gameArea.appendChild(imgWrap);

        // 2. Orta: Hece Kutuları (Biri soru işaretli)
        var slotsRow = window.Utils.createElement('div', 'missing-syl-slots-row');
        slotsRow.style.cssText = 'display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;';

        var missingBoxEl = null;
        syllables.forEach(function(syl, idx) {
            var isMissing = (idx === self.missingIndex);
            var box = window.Utils.createElement('div', 'syl-box', isMissing ? '❓' : window.Utils.toUpperTR(syl));
            box.style.cssText =
                'min-width:clamp(72px, 16vw, 115px);height:clamp(64px, 14vw, 95px);padding:0 14px;' +
                'border-radius:20px;display:flex;align-items:center;justify-content:center;' +
                'font-size:clamp(24px, 5.5vw, 38px);font-weight:900;box-shadow:0 6px 16px rgba(0,0,0,0.14);' +
                (isMissing
                    ? 'background:#FFF8E1;color:#FF8F00;border:4px dashed #FFA000;'
                    : 'background:white;color:#1565C0;border:4px solid #64B5F6;');
            if (isMissing) missingBoxEl = box;
            slotsRow.appendChild(box);
        });
        this.gameArea.appendChild(slotsRow);

        // 3. Alt: 3 Seçenek
        var allSyls = window.GameData.generateSyllables(6).map(function(s) { return s.text; });
        var distractors = [];
        var attempts = 0;
        while (distractors.length < 2 && attempts < 60) {
            var d = window.Utils.randomItem(allSyls);
            if (d !== targetSyl && distractors.indexOf(d) === -1) {
                distractors.push(d);
            }
            attempts++;
        }
        var choices = window.Utils.shuffle([targetSyl].concat(distractors));

        var choicesRow = window.Utils.createElement('div', 'missing-syl-choices');
        choicesRow.style.cssText = 'display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;';

        choices.forEach(function(choiceSyl) {
            var color = window.GameData.getRandomColor();
            var btn = window.Utils.createElement('button', 'missing-syl-btn', window.Utils.toUpperTR(choiceSyl));
            btn.style.cssText =
                'min-width:clamp(84px, 18vw, 130px);height:clamp(68px, 15vw, 100px);padding:0 18px;' +
                'border-radius:22px;border:4px solid white;background:' + color + ';color:white;' +
                'font-size:clamp(24px, 5.5vw, 38px);font-weight:900;cursor:pointer;box-shadow:0 8px 18px rgba(0,0,0,0.2);';

            btn.addEventListener('click', function() {
                if (btn.dataset.disabled === 'true') return;
                window.speechSynthesis.cancel();

                if (choiceSyl === targetSyl) {
                    var allBtns = choicesRow.querySelectorAll('button');
                    allBtns.forEach(function(b) { b.dataset.disabled = 'true'; });

                    if (missingBoxEl) {
                        missingBoxEl.textContent = window.Utils.toUpperTR(choiceSyl);
                        missingBoxEl.style.background = '#4CAF50';
                        missingBoxEl.style.color = 'white';
                        missingBoxEl.style.border = '4px solid #2E7D32';
                        window.Utils.bounceElement(missingBoxEl);
                    }

                    window.Utils.celebrateElement(svgImg);
                    self.showCorrectFeedback(btn);
                    window.AudioManager.speak(choiceSyl + ', ' + self.currentWord.word, 0.85, 1.1);

                    setTimeout(function() {
                        self.nextRound();
                    }, 1650);
                } else {
                    self.showWrongFeedback(btn);
                    window.AudioManager.playZort();
                }
            });

            choicesRow.appendChild(btn);
        });

        this.gameArea.appendChild(choicesRow);

        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(self.currentWord.word);
        }, 350);
    };

    window.MissingSyllableGame = MissingSyllableGame;
})();
