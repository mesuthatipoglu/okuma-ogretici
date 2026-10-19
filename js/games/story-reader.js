(function() {
    'use strict';

    /**
     * Resimli Hikaye 📖
     * Etkileşimli, vektör görselli ve kelime takipli 6 farklı masal/hikaye okuma oyunu
     */
    function StoryReaderGame(container, options) {
        window.BaseGame.call(this, container, options);
        this.stories = [];
        this.storyIndex = 0;
        this.currentStory = null;
        this.currentPageIndex = 0;
        this.isReading = false;
    }

    StoryReaderGame.prototype = Object.create(window.BaseGame.prototype);
    StoryReaderGame.prototype.constructor = StoryReaderGame;

    StoryReaderGame.prototype.init = function() {
        window.BaseGame.prototype.init.call(this);
        this.helpText = 'Hikaye kitabındaki resme veya kelimelere dokunarak sesli dinle! Yukarıdan istediğin masalı seçebilirsin.';
        this.helpIcon = '📖';
        this.createHeader('Resimli Hikaye 📖');

        var self = this;
        this.stories = window.GameData.getAvailableStories(6);

        var examples = this.stories.slice(0, 3).map(function(st) {
            var p0 = st.pages[0];
            return {
                text: st.title,
                sound: st.title,
                type: 'sentence',
                emoji: p0.emoji || '📖',
                asset: p0.asset || null
            };
        });

        this.showIntro({
            title: 'Resimli Hikayeler! 📖',
            icon: '📖',
            description: 'Birbirinden eğlenceli resimli hikayeleri birlikte okuyalım!\nKelimelere tek tek dokunabilir veya tüm sayfayı dinleyebilirsin.',
            voiceText: 'Resimli hikayeleri birlikte okuyalım!',
            examples: examples,
            onStart: function() {
                self.startGameplay();
            }
        });
    };

    StoryReaderGame.prototype.startGameplay = function() {
        var self = this;
        this.container.innerHTML = '';
        this.createHeader('Resimli Hikaye 📖');
        this.updateDimensions();

        // Üst Hikaye Seçici Çubuğu
        var selectorBar = window.Utils.createElement('div', 'story-selector-bar');
        selectorBar.style.cssText =
            'display:flex;gap:8px;overflow-x:auto;width:100%;padding:8px 12px;box-sizing:border-box;' +
            'background:rgba(0,0,0,0.18);align-items:center;justify-content:center;flex-wrap:wrap;';

        this.stories.forEach(function(st, idx) {
            var btn = window.Utils.createElement('button', 'story-pick-btn', st.title);
            var isAct = (idx === self.storyIndex);
            btn.style.cssText =
                'border:none;border-radius:16px;padding:6px 14px;font-weight:900;cursor:pointer;' +
                'font-size:clamp(12px, 2.4vw, 15px);transition:all 0.2s;' +
                (isAct ? 'background:#FFD54F;color:#3E2723;box-shadow:0 3px 8px rgba(0,0,0,0.25);transform:scale(1.05);' : 'background:rgba(255,255,255,0.25);color:white;');
            btn.addEventListener('click', function() {
                window.AudioManager.playClick();
                self.storyIndex = idx;
                self.startGameplay();
            });
            selectorBar.appendChild(btn);
        });
        this.container.appendChild(selectorBar);

        this.gameArea = window.Utils.createElement('div', 'game-area story-reader-area');
        this.gameArea.style.cssText =
            'display:flex;flex-direction:column;align-items:center;justify-content:space-between;' +
            'padding:14px;box-sizing:border-box;flex:1;width:100%;overflow:hidden;';
        this.container.appendChild(this.gameArea);

        this.pageContainer = window.Utils.createElement('div', 'story-page');
        this.pageContainer.style.cssText =
            'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;' +
            'width:100%;max-width:620px;background:rgba(255,255,255,0.95);border-radius:28px;' +
            'padding:18px;box-sizing:border-box;box-shadow:0 10px 30px rgba(0,0,0,0.2);border:4px solid #FFE082;';
        this.gameArea.appendChild(this.pageContainer);

        this.navContainer = window.Utils.createElement('div', 'story-nav');
        this.navContainer.style.cssText =
            'display:flex;align-items:center;justify-content:space-between;width:100%;max-width:580px;padding:10px 6px;box-sizing:border-box;';
        this.gameArea.appendChild(this.navContainer);

        this.prevBtn = window.Utils.createElement('button', '', '◀ Önceki Sayfa');
        this.prevBtn.style.cssText =
            'padding:10px 20px;border:none;border-radius:22px;background:#78909C;color:white;font-weight:900;font-size:clamp(14px, 2.8vw, 18px);cursor:pointer;';
        this.prevBtn.onclick = this.prevPage.bind(this);
        this.navContainer.appendChild(this.prevBtn);

        this.counterDisplay = window.Utils.createElement('div', '');
        this.counterDisplay.style.cssText = 'font-size:clamp(16px, 3.2vw, 22px);font-weight:900;color:white;';
        this.navContainer.appendChild(this.counterDisplay);

        this.nextBtn = window.Utils.createElement('button', '', 'Sonraki Sayfa ▶');
        this.nextBtn.style.cssText =
            'padding:10px 22px;border:none;border-radius:22px;background:#4CAF50;color:white;font-weight:900;font-size:clamp(14px, 2.8vw, 18px);cursor:pointer;box-shadow:0 4px 12px rgba(76,175,80,0.35);';
        this.nextBtn.onclick = this.nextPage.bind(this);
        this.navContainer.appendChild(this.nextBtn);

        this.currentStory = this.stories[this.storyIndex] || this.stories[0];
        this.currentPageIndex = 0;
        this.renderPage();
    };

    StoryReaderGame.prototype.renderPage = function() {
        var self = this;
        this.pageContainer.innerHTML = '';
        this.isReading = false;
        var page = this.currentStory.pages[this.currentPageIndex];

        this.counterDisplay.textContent = 'Sayfa ' + (this.currentPageIndex + 1) + ' / ' + this.currentStory.pages.length;
        this.prevBtn.style.visibility = this.currentPageIndex > 0 ? 'visible' : 'hidden';
        this.nextBtn.textContent = (this.currentPageIndex === this.currentStory.pages.length - 1) ? 'Bitir 🎉' : 'Sonraki ▶';

        var titleBadge = window.Utils.createElement('div', 'story-title-badge', '📖 ' + this.currentStory.title);
        titleBadge.style.cssText = 'font-size:clamp(15px, 3vw, 20px);font-weight:900;color:#EF6C00;background:#FFF3E0;padding:4px 16px;border-radius:16px;';
        this.pageContainer.appendChild(titleBadge);

        var imgSize = Math.min(150, Math.max(95, Math.round(this.dims.height * 0.25)));
        var imgEl = window.SvgLetters.createEmojiImage(page.emoji || '📖', imgSize, page.asset);
        imgEl.style.cursor = 'pointer';
        this.pageContainer.appendChild(imgEl);

        var words = page.text.split(' ');
        var textContainer = window.Utils.createElement('div', 'story-text');
        textContainer.style.cssText =
            'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;padding:8px;';

        var spanWords = [];
        words.forEach(function(w) {
            var wordBtn = window.Utils.createElement('span', 'story-word-pill', w);
            wordBtn.style.cssText =
                'font-size:clamp(22px, 5vw, 36px);font-weight:900;color:#263238;background:#F5F5F5;' +
                'padding:6px 14px;border-radius:16px;cursor:pointer;transition:all 0.25s;border:2px solid #E0E0E0;';
            wordBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                window.speechSynthesis.cancel();
                window.AudioManager.speakWord(w);
                window.Utils.bounceElement(wordBtn);
            });
            textContainer.appendChild(wordBtn);
            spanWords.push(wordBtn);
        });
        this.pageContainer.appendChild(textContainer);

        var readAllBtn = window.Utils.createElement('button', 'story-read-btn', '🔊 Sayfayı Sesli Oku');
        readAllBtn.style.cssText =
            'border:none;border-radius:24px;background:linear-gradient(135deg,#FF9800,#F57C00);color:white;' +
            'font-size:clamp(15px, 3.2vw, 20px);font-weight:900;padding:10px 26px;cursor:pointer;box-shadow:0 4px 12px rgba(245,124,0,0.35);';
        readAllBtn.addEventListener('click', function() {
            window.Utils.celebrateElement(imgEl);
            self.readPage(words, spanWords);
        });
        this.pageContainer.appendChild(readAllBtn);

        imgEl.addEventListener('click', function() {
            window.Utils.celebrateElement(imgEl);
            self.readPage(words, spanWords);
        });

        setTimeout(function() {
            if (!self.running) return;
            self.readPage(words, spanWords);
        }, 450);
    };

    StoryReaderGame.prototype.readPage = function(words, spanWords) {
        if (this.isReading) return;
        this.isReading = true;
        var self = this;

        var idx = 0;
        function readNext() {
            if (!self.running || idx >= words.length) {
                self.isReading = false;
                spanWords.forEach(function(sp) {
                    sp.style.background = '#F5F5F5';
                    sp.style.color = '#263238';
                    sp.style.transform = 'scale(1)';
                });
                return;
            }

            for (var k = 0; k < spanWords.length; k++) {
                if (k === idx) {
                    spanWords[k].style.background = '#4CAF50';
                    spanWords[k].style.color = 'white';
                    spanWords[k].style.transform = 'scale(1.15)';
                } else {
                    spanWords[k].style.background = '#F5F5F5';
                    spanWords[k].style.color = '#263238';
                    spanWords[k].style.transform = 'scale(1)';
                }
            }

            window.speechSynthesis.cancel();
            window.AudioManager.speakWord(words[idx]);

            var delay = 750 + (words[idx].length * 55);
            setTimeout(function() {
                idx++;
                readNext();
            }, delay);
        }

        readNext();
    };

    StoryReaderGame.prototype.prevPage = function() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.renderPage();
        }
    };

    StoryReaderGame.prototype.nextPage = function() {
        var self = this;
        if (this.currentPageIndex < this.currentStory.pages.length - 1) {
            this.currentPageIndex++;
            this.renderPage();
        } else {
            this.showCorrectFeedback(this.pageContainer);
            this.showCorrectOverlay('Hikaye Bitti! Harikasın! 📖🌟');
            setTimeout(function() {
                self.storyIndex = (self.storyIndex + 1) % self.stories.length;
                self.startGameplay();
            }, 2000);
        }
    };

    StoryReaderGame.prototype.destroy = function() {
        window.BaseGame.prototype.destroy.call(this);
    };

    window.StoryReaderGame = StoryReaderGame;
})();
