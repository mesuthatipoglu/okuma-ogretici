(function() {
    'use strict';

    /**
     * Şanslı Harf Çarkı 🎡
     * 5 yaşındaki çocuklar için renkli çark çevirme ve gelen harfin sevimli nesnesini bulma oyunu.
     * Ekran boyutuna göre tüm bileşenleri hesaplar ve oyun alanına sığdırır.
     */
    function LetterWheelGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.gameId = 'letter-wheel';
        this.wheelLetters = [];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.selectedLetter = null;
        this.targetExample = null;
        this.currentOptions = [];
        this._onResize = null;
    }

    LetterWheelGame.prototype = Object.create(window.BaseGame.prototype);
    LetterWheelGame.prototype.constructor = LetterWheelGame;

    LetterWheelGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Ortadaki ÇEVİR düğmesine basarak şanslı harf çarkını döndür! Çark hangi harfte durursa o harfle başlayan sevimli nesneye dokun!';
        this.helpIcon = '🎡';
        this.createHeader('Şanslı Harf Çarkı 🎡');

        var self = this;
        var avail = window.GameData.getAvailableLetters(Math.max(this.maxGroup || 1, 2));
        var sampleLetters = window.GameData.pickUniqueItems('wheel-intro', avail, 3);
        var examples = sampleLetters.map(function(l) {
            var info = window.GameData.getLetterInfo(l);
            var ex = (info && info.examples && info.examples[0]) || { word: info ? info.word : l, emoji: '🎡' };
            return {
                text: window.Utils.toUpperTR(l) + ' → ' + ex.word,
                sound: l,
                type: 'letter',
                emoji: ex.emoji,
                image: ex.image || (info && info.image)
            };
        });

        this.showIntro({
            title: 'Şanslı Harf Çarkı! 🎡',
            icon: '🎡',
            description: 'Renkli çarkı çevir, şansına hangi harf çıkacak bakalım!\nSonra o harfle başlayan sevimli resmi bul!',
            voiceText: 'Renkli çarkı çevir ve çıkan harfin nesnesini bul!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    LetterWheelGame.prototype.startGameplay = function() {
        var self = this;
        this.container.innerHTML = '';
        this.createHeader('Şanslı Harf Çarkı 🎡');
        this.updateDimensions();

        this.gameArea = window.Utils.createElement('div', 'game-area letter-wheel-area');
        this.gameArea.style.cssText =
            'position:relative;width:100%;height:100%;display:flex;flex-direction:column;' +
            'align-items:center;justify-content:space-evenly;padding:10px;box-sizing:border-box;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this._onResize = function() {
            if (self.running) {
                self.renderLayout();
            }
        };
        window.addEventListener('resize', this._onResize);

        this.prepareWheelData();
        this.renderLayout();
    };

    LetterWheelGame.prototype.prepareWheelData = function() {
        var avail = window.GameData.getAvailableLetters(Math.max(this.maxGroup || 1, 3));
        if (avail.length < 8) {
            avail = window.GameData.getAllLetters();
        }
        this.wheelLetters = window.GameData.pickUniqueItems('letter-wheel-segments', avail, 8);
        this.selectedLetter = null;
        this.targetExample = null;
        this.currentOptions = [];
    };

    LetterWheelGame.prototype.renderLayout = function() {
        var self = this;
        this.gameArea.innerHTML = '';
        this.updateDimensions();

        // Cihazın ekranına göre oyun alanını hesapla
        var rect = this.gameArea.getBoundingClientRect();
        var areaW = rect.width || this.gameArea.clientWidth || window.innerWidth;
        var areaH = rect.height || this.gameArea.clientHeight || (window.innerHeight - 60);
        var isLandscape = areaW > areaH * 1.2;

        this.gameArea.style.flexDirection = isLandscape ? 'row' : 'column';

        var wheelSize = isLandscape
            ? Math.min(280, Math.max(165, Math.floor(Math.min(areaH * 0.78, areaW * 0.42))))
            : Math.min(255, Math.max(155, Math.floor(Math.min(areaW * 0.68, areaH * 0.43))));

        // 1. Sol/Üst Bölüm: SVG Çark + Çevir Düğmesi
        var wheelSection = window.Utils.createElement('div', 'wheel-section');
        wheelSection.style.cssText =
            'position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;flex-shrink:0;';

        var pointer = window.Utils.createElement('div', 'wheel-pointer', '🔻');
        pointer.style.cssText =
            'font-size:' + Math.max(24, Math.round(wheelSize * 0.13)) + 'px;line-height:1;margin-bottom:-10px;z-index:10;' +
            'filter:drop-shadow(0 3px 4px rgba(0,0,0,0.35));';
        wheelSection.appendChild(pointer);

        var wheelOuter = window.Utils.createElement('div', 'wheel-outer');
        wheelOuter.style.cssText =
            'position:relative;width:' + wheelSize + 'px;height:' + wheelSize + 'px;' +
            'border-radius:50%;box-shadow:0 10px 28px rgba(0,0,0,0.3);border:6px solid #FFD54F;background:white;box-sizing:border-box;';

        var svgWheel = this.createWheelSvg(wheelSize - 12);
        svgWheel.style.cssText =
            'width:100%;height:100%;transition:transform 2.6s cubic-bezier(0.18, 0.85, 0.22, 1);' +
            'transform:rotate(' + this.currentRotation + 'deg);';
        this.svgWheelEl = svgWheel;
        wheelOuter.appendChild(svgWheel);

        var centerBtnSize = Math.max(54, Math.round(wheelSize * 0.28));
        var spinCenterBtn = window.Utils.createElement('button', 'wheel-center-btn', 'ÇEVİR!');
        spinCenterBtn.style.cssText =
            'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
            'width:' + centerBtnSize + 'px;height:' + centerBtnSize + 'px;border-radius:50%;' +
            'border:4px solid white;background:linear-gradient(135deg,#FF4081,#F50057);color:white;' +
            'font-weight:900;font-size:' + Math.max(11, Math.round(centerBtnSize * 0.22)) + 'px;cursor:pointer;' +
            'box-shadow:0 4px 12px rgba(0,0,0,0.35);z-index:5;padding:0;';
        spinCenterBtn.addEventListener('click', function() {
            self.spinWheel();
        });
        wheelOuter.appendChild(spinCenterBtn);
        wheelSection.appendChild(wheelOuter);
        this.gameArea.appendChild(wheelSection);

        // 2. Sağ/Alt Bölüm: Soru ve Seçenekler Alanı
        var questionPanel = window.Utils.createElement('div', 'wheel-question-panel');
        var panelMaxW = isLandscape ? Math.min(460, Math.floor(areaW * 0.5)) : Math.min(480, areaW - 16);
        questionPanel.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;' +
            'width:100%;max-width:' + panelMaxW + 'px;box-sizing:border-box;';
        this.questionPanel = questionPanel;
        this.gameArea.appendChild(questionPanel);

        this.renderQuestionState(areaW, areaH, isLandscape, wheelSize);
    };

    LetterWheelGame.prototype.createWheelSvg = function(size) {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 200 200');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);

        var count = this.wheelLetters.length;
        var anglePerSlice = 360 / count;
        var colors = ['#FF5252', '#FF9800', '#FFCA28', '#66BB6A', '#26C6DA', '#42A5F5', '#AB47BC', '#EC407A'];

        for (var i = 0; i < count; i++) {
            var startAngle = i * anglePerSlice - 90 - anglePerSlice / 2;
            var endAngle = startAngle + anglePerSlice;
            var rad1 = (startAngle * Math.PI) / 180;
            var rad2 = (endAngle * Math.PI) / 180;

            var x1 = 100 + 98 * Math.cos(rad1);
            var y1 = 100 + 98 * Math.sin(rad1);
            var x2 = 100 + 98 * Math.cos(rad2);
            var y2 = 100 + 98 * Math.sin(rad2);

            var path = document.createElementNS(ns, 'path');
            var d = 'M 100 100 L ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
                    ' A 98 98 0 0 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2) + ' Z';
            path.setAttribute('d', d);
            path.setAttribute('fill', colors[i % colors.length]);
            path.setAttribute('stroke', '#ffffff');
            path.setAttribute('stroke-width', '2');
            svg.appendChild(path);

            var midAngle = startAngle + anglePerSlice / 2;
            var midRad = (midAngle * Math.PI) / 180;
            var tx = 100 + 64 * Math.cos(midRad);
            var ty = 100 + 64 * Math.sin(midRad);

            var text = document.createElementNS(ns, 'text');
            text.setAttribute('x', tx.toFixed(2));
            text.setAttribute('y', ty.toFixed(2));
            text.setAttribute('fill', '#ffffff');
            text.setAttribute('font-size', '22');
            text.setAttribute('font-weight', '900');
            text.setAttribute('font-family', 'Nunito, sans-serif');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.textContent = window.Utils.toUpperTR(this.wheelLetters[i]);
            svg.appendChild(text);
        }

        return svg;
    };

    LetterWheelGame.prototype.spinWheel = function() {
        if (this.isSpinning) return;
        this.isSpinning = true;
        var self = this;

        window.AudioManager.playWhoosh();

        var count = this.wheelLetters.length;
        var sliceAngle = 360 / count;
        var winIndex = Math.floor(Math.random() * count);
        this.selectedLetter = this.wheelLetters[winIndex];

        // winIndex diliminin en üstte (0 derecede) durması için gereken açı
        var targetSliceAngle = (360 - (winIndex * sliceAngle)) % 360;
        var currentMod = this.currentRotation % 360;
        var delta = (targetSliceAngle - currentMod + 360) % 360;
        this.currentRotation += 360 * 4 + delta;

        if (this.svgWheelEl) {
            this.svgWheelEl.style.transform = 'rotate(' + this.currentRotation + 'deg)';
        }

        // Seçilen harfin nesnesini ve 2 çeldiriciyi hazırla
        var lInfo = window.GameData.getLetterInfo(this.selectedLetter);
        var exPool = (lInfo && lInfo.examples && lInfo.examples.length > 0)
            ? lInfo.examples
            : [{ word: lInfo ? lInfo.word : 'elma', emoji: lInfo ? lInfo.emoji : '🍎', image: lInfo ? lInfo.image : null }];
        this.targetExample = window.GameData.pickUniqueItems('wheel-ex-' + this.selectedLetter, exPool, 1)[0];

        var allLetters = window.GameData.getAllLetters().filter(function(l) { return l !== self.selectedLetter; });
        var distLetters = window.GameData.pickUniqueItems('wheel-dist-letters', allLetters, 2);
        var distractors = distLetters.map(function(dl) {
            var dInfo = window.GameData.getLetterInfo(dl);
            var dEx = (dInfo && dInfo.examples && dInfo.examples[0]) || { word: dInfo ? dInfo.word : dl, emoji: '⭐', image: dInfo ? dInfo.image : null };
            return {
                letter: dl,
                word: dEx.word,
                emoji: dEx.emoji,
                image: dEx.image || window.GameData.getObjectImageUrl(dEx.word)
            };
        });

        var correctOption = {
            letter: this.selectedLetter,
            word: this.targetExample.word,
            emoji: this.targetExample.emoji,
            image: this.targetExample.image || window.GameData.getObjectImageUrl(this.targetExample.word),
            isCorrect: true
        };

        this.currentOptions = window.Utils.shuffle([correctOption].concat(distractors));

        setTimeout(function() {
            if (!self.running) return;
            self.isSpinning = false;
            window.AudioManager.playStar();
            window.speechSynthesis.cancel();
            window.AudioManager.speakLetter(self.selectedLetter);

            var rect = self.gameArea.getBoundingClientRect();
            var areaW = rect.width || self.gameArea.clientWidth || window.innerWidth;
            var areaH = rect.height || self.gameArea.clientHeight || (window.innerHeight - 60);
            var isLandscape = areaW > areaH * 1.2;
            var wheelSize = isLandscape
                ? Math.min(280, Math.max(165, Math.floor(Math.min(areaH * 0.78, areaW * 0.42))))
                : Math.min(255, Math.max(155, Math.floor(Math.min(areaW * 0.68, areaH * 0.43))));

            self.renderQuestionState(areaW, areaH, isLandscape, wheelSize);
        }, 2650);
    };

    LetterWheelGame.prototype.renderQuestionState = function(areaW, areaH, isLandscape, wheelSize) {
        var self = this;
        if (!this.questionPanel) return;
        this.questionPanel.innerHTML = '';

        if (!this.selectedLetter) {
            var promptBox = window.Utils.createElement('div', 'wheel-prompt-box');
            promptBox.style.cssText =
                'background:rgba(255,255,255,0.92);padding:16px 24px;border-radius:24px;text-align:center;' +
                'box-shadow:0 8px 20px rgba(0,0,0,0.18);cursor:pointer;border:3px solid #FFD54F;';
            promptBox.innerHTML =
                '<div style="font-size:clamp(18px, 4vw, 24px);font-weight:900;color:#D81B60;">🎡 Çarkı Çevir!</div>' +
                '<div style="font-size:clamp(13px, 2.6vw, 16px);font-weight:700;color:#546E7A;margin-top:4px;">Ortadaki kırmızı düğmeye dokun!</div>';
            promptBox.addEventListener('click', function() {
                self.spinWheel();
            });
            this.questionPanel.appendChild(promptBox);
            return;
        }

        var titleBadge = window.Utils.createElement('div', 'wheel-letter-badge');
        titleBadge.style.cssText =
            'background:rgba(255,255,255,0.95);padding:6px 18px;border-radius:20px;font-weight:900;' +
            'font-size:clamp(15px, 3.2vw, 21px);color:#880E4F;box-shadow:0 4px 12px rgba(0,0,0,0.15);text-align:center;';
        titleBadge.textContent = '🎯 "' + window.Utils.toUpperTR(this.selectedLetter) + '" harfi ile başlayan hangisi?';
        this.questionPanel.appendChild(titleBadge);

        var availHForCards = isLandscape ? (areaH - 80) : (areaH - wheelSize - 95);
        var cardHeight = Math.max(82, Math.min(138, Math.floor(availHForCards * 0.78)));
        var imgPx = Math.max(42, Math.min(72, Math.floor(cardHeight * 0.54)));

        var optionsRow = window.Utils.createElement('div', 'wheel-options-row');
        optionsRow.style.cssText =
            'display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;width:100%;box-sizing:border-box;';

        this.currentOptions.forEach(function(opt) {
            var card = window.Utils.createElement('button', 'wheel-option-card');
            card.style.cssText =
                'height:' + cardHeight + 'px;background:white;border:4px solid #F48FB1;border-radius:22px;' +
                'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px;' +
                'cursor:pointer;box-shadow:0 6px 14px rgba(0,0,0,0.16);transition:transform 0.2s;box-sizing:border-box;';

            var objImg = window.SvgLetters.createObjectImage(opt, imgPx);
            var lbl = window.Utils.createElement('span', '', window.Utils.toUpperTR(opt.word));
            lbl.style.cssText = 'font-size:clamp(12px, 2.6vw, 17px);font-weight:900;color:#37474F;line-height:1.1;';

            card.appendChild(objImg);
            card.appendChild(lbl);

            card.addEventListener('click', function() {
                if (card.dataset.disabled === 'true') return;
                window.speechSynthesis.cancel();

                if (opt.isCorrect) {
                    var allBtns = optionsRow.querySelectorAll('button');
                    allBtns.forEach(function(b) { b.dataset.disabled = 'true'; });

                    card.style.background = '#E8F5E9';
                    card.style.borderColor = '#4CAF50';
                    self.showCorrectFeedback(card);
                    window.Utils.celebrateElement(card);
                    window.AudioManager.speakWord(opt.word);
                    self.showCorrectOverlay(window.Utils.toUpperTR(self.selectedLetter) + ' - ' + window.Utils.toUpperTR(opt.word) + ' 🎡');

                    setTimeout(function() {
                        if (!self.running) return;
                        self.selectedLetter = null;
                        self.spinWheel();
                    }, 1850);
                } else {
                    self.showWrongFeedback(card);
                    window.AudioManager.playZort();
                }
            });

            optionsRow.appendChild(card);
        });

        this.questionPanel.appendChild(optionsRow);
    };

    LetterWheelGame.prototype.destroy = function() {
        if (this._onResize) {
            window.removeEventListener('resize', this._onResize);
            this._onResize = null;
        }
        window.BaseGame.prototype.destroy.call(this);
    };

    window.LetterWheelGame = LetterWheelGame;
})();
