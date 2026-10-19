(function() {
    'use strict';

    /**
     * Hece Roketi 🚀
     * Doğru hece yakıtlarını rokete yükleyip uzaya fırlatma oyunu.
     * Ekran boyutuna göre tüm bileşenleri hesaplar ve oyun alanına sığdırır.
     */
    function SyllableRocketGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'syllable-rocket';
        this.targetSyllable = null;
        this.fuelOptions = [];
        this.fuelLevel = 0;
        this.fuelNeeded = 2;
        this._onResize = null;
    }

    SyllableRocketGame.prototype = Object.create(window.BaseGame.prototype);
    SyllableRocketGame.prototype.constructor = SyllableRocketGame;

    SyllableRocketGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Roketin üzerinde yazan hedef heceyi ve sevimli nesnesini dinle! Aşağıdaki yakıt kapsüllerinden doğru heceyi seçerek roketi uzaya fırlat!';
        this.helpIcon = '🚀';
        this.createHeader('Hece Roketi 🚀');

        var self = this;
        var allSyls = window.GameData.generateSyllables(Math.max(this.maxGroup || 1, 2));
        var sampleSyls = window.GameData.pickUniqueItems('rocket-intro', allSyls, 3);
        var examples = sampleSyls.map(function(s) {
            var vis = window.GameData.getSyllableVisual(s.text);
            return {
                text: window.Utils.toUpperTR(s.text) + ' (' + vis.word + ')',
                sound: s.text,
                type: 'syllable',
                emoji: vis.emoji,
                image: vis.image
            };
        });

        this.showIntro({
            title: 'Hece Roketi! 🚀',
            icon: '🚀',
            description: 'Sevimli astronot uzaya çıkmak istiyor!\nDoğru hece yakıtına dokunarak roketin deposunu doldur ve uzaya fırlat!',
            voiceText: 'Doğru hece yakıtını seç ve roketi uzaya fırlat!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    SyllableRocketGame.prototype.startGameplay = function() {
        var self = this;
        this.container.innerHTML = '';
        this.createHeader('Hece Roketi 🚀');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area syllable-rocket-area');
        this.gameArea.style.cssText =
            'position:relative;width:100%;height:100%;display:flex;flex-direction:column;' +
            'align-items:center;justify-content:space-evenly;padding:10px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this._onResize = function() {
            if (self.running && self.targetSyllable) {
                self.renderRoundLayout();
            }
        };
        window.addEventListener('resize', this._onResize);

        this.nextRound();
    };

    SyllableRocketGame.prototype.nextRound = function() {
        window.BaseGame.prototype.nextRound.call(this);
        var self = this;

        var allSyls = window.GameData.generateSyllables(this.maxGroup);
        this.targetSyllable = window.GameData.pickUniqueItems('syllable-rocket-deck', allSyls, 1)[0];
        this.targetVisual = window.GameData.getSyllableVisual(this.targetSyllable.text);

        var otherPool = allSyls.filter(function(s) { return s.text !== self.targetSyllable.text; });
        var distractors = window.GameData.pickUniqueItems('rocket-distractors', otherPool, 3);
        this.fuelOptions = window.Utils.shuffle([this.targetSyllable].concat(distractors));

        this.renderRoundLayout();

        setTimeout(function() {
            if (!self.running) return;
            window.speechSynthesis.cancel();
            window.AudioManager.speakSyllable(self.targetSyllable.text);
        }, 350);
    };

    SyllableRocketGame.prototype.renderRoundLayout = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        this.updateDimensions();

        // Cihazın ekranına göre oyun alanını hesapla
        var rect = this.gameArea.getBoundingClientRect();
        var areaW = rect.width || this.gameArea.clientWidth || window.innerWidth;
        var areaH = rect.height || this.gameArea.clientHeight || (window.innerHeight - 60);
        var isLandscape = areaW > areaH * 1.25;

        this.gameArea.style.flexDirection = isLandscape ? 'row' : 'column';

        var rocketCardSize = isLandscape
            ? Math.min(240, Math.max(150, Math.floor(areaH * 0.72)))
            : Math.min(210, Math.max(135, Math.floor(areaH * 0.42)));

        var objImgSize = Math.max(44, Math.round(rocketCardSize * 0.34));
        var rocketImgSize = Math.max(58, Math.round(rocketCardSize * 0.42));

        // 1. Roket Fırlatma Rampası ve Hedef Hece Gösterimi
        var launchPad = window.Utils.createElement('div', 'rocket-launch-pad');
        launchPad.style.cssText =
            'position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;' +
            'width:' + Math.min(areaW - 24, rocketCardSize * 1.35) + 'px;padding:12px 18px;' +
            'background:linear-gradient(180deg, rgba(25,118,210,0.45), rgba(13,71,161,0.75));' +
            'border:3px solid rgba(255,255,255,0.45);border-radius:28px;box-shadow:0 10px 26px rgba(0,0,0,0.28);' +
            'cursor:pointer;box-sizing:border-box;flex-shrink:0;transition:transform 0.7s cubic-bezier(0.3, -0.3, 0.7, 1.4);';

        var rocketRow = window.Utils.createElement('div', 'rocket-visual-row');
        rocketRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;';

        var rocketIcon = window.SvgLetters.createObjectImage(
            { word: 'roket', emoji: '🚀', image: window.GameData.getObjectImageUrl('roket') },
            rocketImgSize
        );
        rocketRow.appendChild(rocketIcon);

        var objBadge = window.Utils.createElement('div', 'rocket-obj-badge');
        objBadge.style.cssText =
            'background:rgba(255,255,255,0.95);padding:6px 12px;border-radius:20px;' +
            'display:flex;flex-direction:column;align-items:center;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
        objBadge.appendChild(window.SvgLetters.createObjectImage(this.targetVisual, objImgSize));
        var wordSmall = window.Utils.createElement('span', '', this.targetVisual.word);
        wordSmall.style.cssText = 'font-size:12px;font-weight:900;color:#0D47A1;';
        objBadge.appendChild(wordSmall);
        rocketRow.appendChild(objBadge);
        launchPad.appendChild(rocketRow);

        var targetBanner = window.Utils.createElement('div', 'rocket-target-banner');
        targetBanner.style.cssText =
            'background:#FFD54F;color:#1A237E;padding:6px 22px;border-radius:20px;font-weight:900;' +
            'font-size:clamp(22px, 5vw, 34px);box-shadow:0 4px 10px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;';
        targetBanner.innerHTML = '<span>🔊</span><span>' + window.Utils.toUpperTR(this.targetSyllable.text) + '</span>';
        launchPad.appendChild(targetBanner);

        launchPad.addEventListener('click', function() {
            window.speechSynthesis.cancel();
            window.AudioManager.speakSyllable(self.targetSyllable.text);
            window.Utils.celebrateElement(launchPad);
        });
        this.gameArea.appendChild(launchPad);

        // 2. Yakıt Kapsülleri Seçenek Alanı (4 Seçenek)
        var gridMaxW = isLandscape ? Math.min(460, Math.floor(areaW * 0.52)) : Math.min(480, areaW - 20);
        var btnH = isLandscape
            ? Math.max(76, Math.min(130, Math.floor((areaH - 40) / 2)))
            : Math.max(72, Math.min(115, Math.floor((areaH - rocketCardSize - 80) / 2)));

        var fuelGrid = window.Utils.createElement('div', 'rocket-fuel-grid');
        fuelGrid.style.cssText =
            'display:grid;grid-template-columns:repeat(2, 1fr);gap:clamp(8px, 2vw, 14px);' +
            'width:100%;max-width:' + gridMaxW + 'px;box-sizing:border-box;';

        this.fuelOptions.forEach(function(sylItem) {
            var vis = window.GameData.getSyllableVisual(sylItem.text);
            var btn = window.Utils.createElement('button', 'rocket-fuel-btn');
            btn.style.cssText =
                'height:' + btnH + 'px;background:rgba(255,255,255,0.96);border:4px solid #29B6F6;border-radius:22px;' +
                'display:flex;align-items:center;justify-content:center;gap:10px;padding:8px 14px;cursor:pointer;' +
                'box-shadow:0 6px 16px rgba(0,0,0,0.18);transition:all 0.2s;box-sizing:border-box;';

            var miniImg = window.SvgLetters.createObjectImage(vis, Math.max(38, Math.floor(btnH * 0.54)));
            btn.appendChild(miniImg);

            var txtCol = window.Utils.createElement('div', '');
            txtCol.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;';
            var sylTitle = window.Utils.createElement('div', '', window.Utils.toUpperTR(sylItem.text));
            sylTitle.style.cssText = 'font-size:clamp(22px, 4.8vw, 32px);font-weight:900;color:#01579B;line-height:1;';
            var subWord = window.Utils.createElement('div', '', vis.word);
            subWord.style.cssText = 'font-size:clamp(10px, 2vw, 13px);font-weight:800;color:#546E7A;';
            txtCol.appendChild(sylTitle);
            txtCol.appendChild(subWord);
            btn.appendChild(txtCol);

            btn.addEventListener('click', function() {
                if (btn.dataset.disabled === 'true') return;
                window.speechSynthesis.cancel();

                if (sylItem.text === self.targetSyllable.text) {
                    var allBtns = fuelGrid.querySelectorAll('button');
                    allBtns.forEach(function(b) { b.dataset.disabled = 'true'; });

                    btn.style.background = '#E8F5E9';
                    btn.style.borderColor = '#00E676';

                    window.AudioManager.playWhoosh();
                    self.showCorrectFeedback(btn);
                    window.AudioManager.speak(sylItem.text + ', ' + vis.word, 0.85, 1.1);

                    // Roketi yukarı fırlatma animasyonu!
                    launchPad.style.transform = 'translateY(-110vh) scale(1.15)';
                    self.showCorrectOverlay(window.Utils.toUpperTR(sylItem.text) + ' 🚀 ' + window.Utils.toUpperTR(vis.word));

                    setTimeout(function() {
                        self.nextRound();
                    }, 1850);
                } else {
                    self.showWrongFeedback(btn);
                    window.AudioManager.playZort();
                }
            });

            fuelGrid.appendChild(btn);
        });

        this.gameArea.appendChild(fuelGrid);
    };

    SyllableRocketGame.prototype.destroy = function() {
        if (this._onResize) {
            window.removeEventListener('resize', this._onResize);
            this._onResize = null;
        }
        window.BaseGame.prototype.destroy.call(this);
    };

    window.SyllableRocketGame = SyllableRocketGame;
})();
