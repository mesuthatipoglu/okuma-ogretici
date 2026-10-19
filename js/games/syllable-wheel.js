(function() {
    'use strict';

    /**
     * Sihirli Hece Kazanı 🪄
     * Harf iksirlerini sihirli kazana atarak hece ve sürpriz nesne oluşturma oyunu
     */
    function SyllableWheelGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'syllable-wheel';
        this.targetSyllable = null;
        this.stepIndex = 0;
    }

    SyllableWheelGame.prototype = Object.create(window.BaseGame.prototype);
    SyllableWheelGame.prototype.constructor = SyllableWheelGame;

    SyllableWheelGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Sihirli kazanın istediği harflere sırayla dokun ve iksiri karıştır! İçinden hangi eğlenceli hece ve nesne çıkacak bakalım!';
        this.helpIcon = '🪄';
        this.createHeader('Sihirli Hece Kazanı 🪄');

        var self = this;
        var syls = window.Utils.shuffle(window.GameData.generateSyllables(6).slice()).slice(0, 3);
        var examples = syls.map(function(s) {
            var obj = window.GameData.getSyllableObject(s.text);
            return {
                text: window.Utils.toUpperTR(s.letters[0]) + ' + ' + window.Utils.toUpperTR(s.letters[1]) + ' = ' + window.Utils.toUpperTR(s.text),
                sound: s.text,
                type: 'syllable',
                emoji: obj.emoji,
                asset: obj.asset
            };
        });

        this.showIntro({
            title: 'Sihirli Hece Kazanı! 🪄',
            icon: '🪄',
            description: 'Sihirli kazana harfleri sırayla atalım ve büyüleyici heceler oluşturalım!\nAşağıdaki harf balonlarına sırayla dokun.',
            voiceText: 'Harfleri sırayla sihirli kazana at ve heceyi oluştur!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    SyllableWheelGame.prototype.startGameplay = function() {
        this.container.innerHTML = '';
        this.createHeader('Sihirli Hece Kazanı 🪄');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area syllable-wheel-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;height:100%;padding:12px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this.nextRound();
    };

    SyllableWheelGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;
        this.gameArea.innerHTML = '';
        this.stepIndex = 0;
        this.updateDimensions();

        var areaRect = this.gameArea.getBoundingClientRect();
        var areaW = areaRect.width || this.dims.width || window.innerWidth;
        var areaH = areaRect.height || this.dims.height || window.innerHeight;

        var allSyls = window.GameData.generateSyllables(this.maxGroup);
        this.targetSyllable = window.GameData.getNextFromDeck('syllable-wheel-deck', allSyls);
        var sylObj = window.GameData.getSyllableObject(this.targetSyllable.text);
        var letters = this.targetSyllable.letters;

        var objSize = Math.min(95, Math.max(64, Math.round(Math.min(areaW, areaH) * 0.18)));
        var cauldronSize = Math.min(155, Math.max(105, Math.round(Math.min(areaW, areaH) * 0.28)));

        // 1. Üst Tarif Kartı
        var recipeCard = window.Utils.createElement('div', 'magic-recipe-card');
        recipeCard.style.cssText =
            'display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.95);' +
            'padding:10px 22px;border-radius:26px;box-shadow:0 6px 18px rgba(0,0,0,0.16);cursor:pointer;';

        var objVisual = window.SvgLetters.createEmojiImage(sylObj.emoji, objSize, sylObj.asset);
        recipeCard.appendChild(objVisual);

        var recipeInfo = window.Utils.createElement('div', '');
        recipeInfo.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

        var formulaRow = window.Utils.createElement('div', '');
        formulaRow.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:clamp(22px, 5vw, 34px);font-weight:900;';

        var slot1 = window.Utils.createElement('span', '', window.Utils.toUpperTR(letters[0]));
        slot1.style.cssText = 'padding:4px 12px;border-radius:12px;background:#F3E5F5;color:#7B1FA2;border:2px dashed #AB47BC;';
        var plus = window.Utils.createElement('span', '', '+');
        plus.style.color = '#78909C';
        var slot2 = window.Utils.createElement('span', '', window.Utils.toUpperTR(letters[1]));
        slot2.style.cssText = 'padding:4px 12px;border-radius:12px;background:#F3E5F5;color:#7B1FA2;border:2px dashed #AB47BC;';
        var eq = window.Utils.createElement('span', '', '→ ' + window.Utils.toUpperTR(this.targetSyllable.text));
        eq.style.color = '#E91E63';

        formulaRow.appendChild(slot1);
        formulaRow.appendChild(plus);
        formulaRow.appendChild(slot2);
        formulaRow.appendChild(eq);
        recipeInfo.appendChild(formulaRow);

        var wordSub = window.Utils.createElement('div', '', '🪄 ' + sylObj.word + ' İksiri');
        wordSub.style.cssText = 'font-size:clamp(13px, 2.5vw, 16px);font-weight:800;color:#546E7A;';
        recipeInfo.appendChild(wordSub);

        recipeCard.appendChild(recipeInfo);
        recipeCard.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakSyllable(self.targetSyllable.text);
            window.Utils.celebrateElement(objVisual);
        });
        this.gameArea.appendChild(recipeCard);

        // 2. Orta: Sihirli Kazan
        var cauldronBox = window.Utils.createElement('div', 'magic-cauldron-box');
        cauldronBox.style.cssText =
            'width:' + cauldronSize + 'px;height:' + cauldronSize + 'px;border-radius:50%;' +
            'background:radial-gradient(circle at 35% 30%, #AB47BC, #4A148C);' +
            'border:6px solid #FFD54F;box-shadow:0 10px 28px rgba(74,20,140,0.45), inset 0 0 25px rgba(255,255,255,0.35);' +
            'display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;position:relative;';

        var cauldronIcon = window.Utils.createElement('div', '', '🪄');
        cauldronIcon.style.cssText = 'font-size:clamp(28px, 6vw, 42px);line-height:1;';
        var cauldronText = window.Utils.createElement('div', '', '1. Harfi Seç');
        cauldronText.style.cssText = 'font-size:clamp(14px, 3vw, 20px);font-weight:900;margin-top:4px;text-align:center;';
        cauldronBox.appendChild(cauldronIcon);
        cauldronBox.appendChild(cauldronText);
        this.gameArea.appendChild(cauldronBox);

        // 3. Alt: Harf Küreleri (Doğru 2 harf + 2 çeldirici)
        var pool = letters.slice();
        var allAlpha = window.GameData.getAllLetters();
        while (pool.length < 4) {
            var r = window.Utils.randomItem(allAlpha);
            if (pool.indexOf(r) === -1) pool.push(r);
        }
        pool = window.Utils.shuffle(pool);

        var orbsRow = window.Utils.createElement('div', 'magic-orbs-row');
        orbsRow.style.cssText = 'display:flex;gap:clamp(12px, 3vw, 22px);justify-content:center;align-items:center;flex-wrap:wrap;';

        var orbSize = Math.min(84, Math.max(62, Math.round(Math.min(areaW, areaH) * 0.16)));

        pool.forEach(function(letter) {
            var color = window.GameData.getLetterColor(letter);
            var orb = window.Utils.createElement('button', 'magic-orb-btn', window.Utils.toUpperTR(letter));
            orb.style.cssText =
                'width:' + orbSize + 'px;height:' + orbSize + 'px;border-radius:50%;' +
                'background:radial-gradient(circle at 30% 30%, white, ' + color + ' 40%);' +
                'border:4px solid white;color:white;font-size:clamp(26px, 5.5vw, 38px);font-weight:900;' +
                'cursor:pointer;box-shadow:0 8px 18px rgba(0,0,0,0.22);transition:all 0.2s;';

            orb.addEventListener('click', function() {
                if (orb.dataset.used === 'true') return;
                var expected = letters[self.stepIndex];

                if (letter === expected) {
                    orb.dataset.used = 'true';
                    orb.style.transform = 'scale(0.2)';
                    orb.style.opacity = '0.2';
                    orb.style.pointerEvents = 'none';

                    window.AudioManager.playPop();
                    window.speechSynthesis.cancel();
                    window.AudioManager.speakLetter(letter);
                    window.Utils.bounceElement(cauldronBox);

                    if (self.stepIndex === 0) {
                        slot1.style.background = '#4CAF50';
                        slot1.style.color = 'white';
                        slot1.style.borderColor = '#2E7D32';
                        cauldronText.textContent = window.Utils.toUpperTR(letter) + ' + ?';
                        self.stepIndex = 1;
                    } else {
                        slot2.style.background = '#4CAF50';
                        slot2.style.color = 'white';
                        slot2.style.borderColor = '#2E7D32';
                        cauldronIcon.textContent = '✨';
                        cauldronText.textContent = window.Utils.toUpperTR(self.targetSyllable.text);
                        cauldronText.style.fontSize = 'clamp(26px, 6vw, 40px)';

                        window.Utils.celebrateElement(cauldronBox);
                        window.Utils.celebrateElement(objVisual);
                        self.showCorrectFeedback(cauldronBox);

                        setTimeout(function() {
                            window.speechSynthesis.cancel();
                            window.AudioManager.speak(self.targetSyllable.text + ', ' + sylObj.word, 0.85, 1.1);
                            self.showCorrectOverlay(window.Utils.toUpperTR(self.targetSyllable.text) + ' 🪄 ' + sylObj.word);
                            setTimeout(function() {
                                self.nextRound();
                            }, 1800);
                        }, 350);
                    }
                } else {
                    self.showWrongFeedback(orb);
                    window.AudioManager.playZort();
                }
            });

            orbsRow.appendChild(orb);
        });

        this.gameArea.appendChild(orbsRow);

        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speakSyllable(self.targetSyllable.text);
        }, 400);
    };

    window.SyllableWheelGame = SyllableWheelGame;
})();
