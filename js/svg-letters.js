/**
 * Türkçe Okuma Öğretici - SVG Harf, Karakter ve Vektör Nesne Görselleri
 * 5 yaş grubu çocuklar için canlı, animasyonlu, sevimli vektör görseller
 */
window.SvgLetters = (function () {
    'use strict';

    // Emoji -> SVG dosya adı hızlı eşleştirme tablosu
    var emojiToSlug = {
        '🌳': 'agac', '🐙': 'ahtapot', '🔧': 'alet', '🚑': 'ambulans', '🍍': 'ananas',
        '👩': 'anne', '🚗': 'araba', '🐝': 'ari', '🍐': 'armut', '🦁': 'aslan',
        '👨‍🚀': 'astronot', '🐴': 'at', '🎽': 'atlet', '🥑': 'avokado', '🌙': 'ay',
        '🌻': 'aycicegi', '🐻': 'ayi', '🍇': 'uzum', '🍯': 'bal', '🐟': 'balik',
        '🐋': 'balina', '🎈': 'balon', '🥤': 'bardak', '🦉': 'baykus', '🇹🇷': 'bayrak',
        '👶': 'bebek', '🫑': 'biber', '🚲': 'bisiklet', '🐛': 'bocek', '🥟': 'borek',
        '🥦': 'brokoli', '☁️': 'bulut', '🧊': 'buz', '⛺': 'cadir', '🪟': 'cam',
        '👾': 'canavar', '👜': 'canta', '🍴': 'catal', '🍵': 'cay', '🧥': 'ceket',
        '🌰': 'ceviz', '🌸': 'cicek', '🍫': 'cikolata', '🍓': 'cilek', '🐥': 'civciv',
        '🧦': 'corap', '⛰️': 'dag', '🌿': 'nane', '🥁': 'davul', '🌊': 'deniz',
        '🐪': 'deve', '🦖': 'dinozor', '🥘': 'dolma', '🍅': 'domates', '🍦': 'dondurma',
        '🫐': 'dut', '🐉': 'ejderha', '🥖': 'ekmek', '👋': 'el', '👗': 'elbise',
        '🧤': 'eldiven', '🍎': 'elma', '💎': 'elmas', '🥩': 'et', '🏠': 'ev',
        '🐭': 'fare', '🏮': 'fener', '🐘': 'fil', '🍞': 'firin', '🦩': 'flamingo',
        '🎷': 'flut', '🦭': 'fok', '🌃': 'gece', '🚢': 'gemi', '🦌': 'geyik',
        '🎸': 'gitar', '🌈': 'gokkusagi', '👁️': 'goz', '👓': 'gozluk', '🌹': 'gul',
        '☀️': 'gunes', '🧶': 'hali', '🛁': 'havlu', '🥕': 'havuc', '🎁': 'hediye',
        '🚁': 'helikopter', '🐓': 'horoz', '🛖': 'iglo', '🐄': 'inek', '🪢': 'ip',
        '🏞️': 'irmak', '💡': 'isik', '🥬': 'ispanak', '🚒': 'itfaiye', '🍳': 'izgara',
        '🐆': 'jaguar', '🛞': 'jant', '🍬': 'seker', '🪙': 'jeton', '🚙': 'jip',
        '🏰': 'kale', '✏️': 'kalem', '🚚': 'kamyon', '🦘': 'kanguru', '🚪': 'kapi',
        '🐯': 'kaplan', '🐢': 'kaplumbaga', '🐜': 'karinca', '🍉': 'karpuz', '🦅': 'kartal',
        '🥄': 'kasik', '⛵': 'kayik', '🐱': 'kedi', '🦋': 'kelebek', '🎻': 'keman',
        '🍒': 'kiraz', '🦔': 'kirpi', '📕': 'kitap', '🐨': 'koala', '🐕': 'kopek',
        '🏴‍☠️': 'korsan', '🦢': 'kugu', '🏖️': 'kum', '🎲': 'zar', '🐸': 'kurbaga',
        '🐺': 'kurt', '🐦': 'kus', '📦': 'kutu', '🐑': 'kuzu', '🌷': 'lale',
        '🍋': 'limon', '🍭': 'lokum', '🏅': 'madalya', '✂️': 'makas', '🍄': 'mantar',
        '🪑': 'masa', '🐵': 'maymun', '✉️': 'mektup', '🎤': 'mikrofon', '🌽': 'misir',
        '🍌': 'muz', '👵': 'nine', '🎵': 'nota', '🏫': 'okul', '🐂': 'okuz',
        '🔟': 'on', '🥼': 'onluk', '🦆': 'ordek', '🌲': 'orman', '🕷️': 'orumcek',
        '🚌': 'otobus', '🧸': 'oyuncak', '🤡': 'palyaco', '🐼': 'panda', '🦜': 'papagan',
        '🎂': 'pasta', '🍟': 'patates', '🛼': 'paten', '🐧': 'penguen', '🧚': 'peri',
        '🧀': 'peynir', '🎹': 'piyano', '🍕': 'pizza', '🚓': 'polis', '🍊': 'portakal',
        '🧭': 'pusula', '📻': 'radyo', '🦝': 'rakun', '🎨': 'resim', '🤖': 'robot',
        '🚀': 'roket', '⏰': 'saat', '🧼': 'sabun', '🥗': 'salata', '🐌': 'salyangoz',
        '🥪': 'sandvic', '🧢': 'sapka', '🏯': 'saray', '🍑': 'seftali', '☂️': 'semsiye',
        '🥯': 'simit', '⚡': 'simsek', '🐿️': 'sincap', '🎪': 'sirk', '💧': 'su',
        '🦛': 'suaygiri', '🧹': 'supurge', '🥛': 'sut', '🍽️': 'tabak', '👑': 'tac',
        '🪵': 'tahta', '🪮': 'tarak', '🐰': 'tavsan', '🦄': 'tekboynuz', '🧵': 'tel',
        '☎️': 'telefon', '🔭': 'teleskop', '🩴': 'terlik', '🦊': 'tilki', '🐊': 'timsah',
        '⚽': 'top', '🚜': 'traktor', '🚂': 'tren', '🎺': 'trompet', '✈️': 'ucak',
        '📐': 'ucgen', '🪁': 'ucurtma', '🐞': 'ugurbocegi', '🌾': 'un', '🔌': 'utu',
        '👽': 'uzayli', '🚃': 'vagon', '🧳': 'valiz', '⛴️': 'vapur', '🏺': 'vazo',
        '🌋': 'volkan', '🌧️': 'yagmur', '🍁': 'yaprak', '🦀': 'yengec', '🐍': 'yilan',
        '⭐': 'yildiz', '🛤️': 'yol', '🥚': 'yumurta', '🐬': 'yunus', '💍': 'yuzuk',
        '🦓': 'zebra', '🫒': 'zeytin', '🔔': 'zil', '🦒': 'zurafa'
    };

    /**
     * Sevimli yüzlü, göz kırpan ve el sallayan harf karakteri SVG'si oluşturur
     */
    function createLetter(letter, size, color) {
        size = size || 120;
        var info = window.GameData.getLetterInfo(letter);
        color = color || (info ? info.color : '#4CAF50');
        var displayLetter = window.Utils ? window.Utils.toUpperTR(letter) : letter.toUpperCase();

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 120 145');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size * 145 / 120);
        svg.style.overflow = 'visible';
        svg.classList.add('cute-letter-character');

        var dark = darkenColor(color, 35);
        var light = lightenColor(color, 45);

        svg.innerHTML =
            // Alt Gölge
            '<ellipse cx="60" cy="136" rx="38" ry="7" fill="rgba(0,0,0,0.18)"/>' +
            // Sol El (Sallanan)
            '<g class="char-arm-left" style="transform-origin:18px 72px;animation:wiggle 1.4s ease-in-out infinite;">' +
            '  <ellipse cx="8" cy="68" rx="9" ry="6" fill="' + color + '" stroke="' + dark + '" stroke-width="2.5" transform="rotate(-25 8 68)"/>' +
            '</g>' +
            // Sağ El (Sallanan)
            '<g class="char-arm-right" style="transform-origin:102px 72px;animation:wiggle 1.4s ease-in-out infinite reverse;">' +
            '  <ellipse cx="112" cy="68" rx="9" ry="6" fill="' + color + '" stroke="' + dark + '" stroke-width="2.5" transform="rotate(25 112 68)"/>' +
            '</g>' +
            // Sol Ayak
            '<ellipse cx="40" cy="128" rx="12" ry="7" fill="' + dark + '"/>' +
            // Sağ Ayak
            '<ellipse cx="80" cy="128" rx="12" ry="7" fill="' + dark + '"/>' +
            // Ana Gövde
            '<rect x="14" y="16" width="92" height="106" rx="26" ry="26" fill="' + color + '" stroke="' + dark + '" stroke-width="3.5"/>' +
            // Üst Parlama Efekti
            '<path d="M 28 24 Q 60 18 92 24" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="5" stroke-linecap="round"/>' +
            // Sevimli Taç / Yıldız Anten
            '<polygon points="60,2 64,11 73,11 66,16 69,24 60,19 51,24 54,16 47,11 56,11" fill="#FFD700" stroke="#F57F17" stroke-width="1.5"/>' +
            // Harf Metni
            '<text x="60" y="83" text-anchor="middle" dominant-baseline="central" ' +
            'font-family="Segoe UI, Arial, sans-serif" font-weight="900" font-size="56" fill="white" ' +
            'stroke="rgba(0,0,0,0.2)" stroke-width="2">' + escapeHtml(displayLetter) + '</text>' +
            // Sol Göz
            '<ellipse cx="40" cy="42" rx="9" ry="10" fill="white" stroke="' + dark + '" stroke-width="1.5"/>' +
            '<ellipse cx="42" cy="43" rx="4.5" ry="5.5" fill="#222"/>' +
            '<circle cx="44" cy="40" r="2" fill="white"/>' +
            // Sağ Göz
            '<ellipse cx="80" cy="42" rx="9" ry="10" fill="white" stroke="' + dark + '" stroke-width="1.5"/>' +
            '<ellipse cx="82" cy="43" rx="4.5" ry="5.5" fill="#222"/>' +
            '<circle cx="84" cy="40" r="2" fill="white"/>' +
            // Pembe Yanaklar
            '<ellipse cx="29" cy="98" rx="9" ry="5.5" fill="rgba(255,128,171,0.65)"/>' +
            '<ellipse cx="91" cy="98" rx="9" ry="5.5" fill="rgba(255,128,171,0.65)"/>' +
            // Neşeli Gülümseyen Ağız
            '<path d="M 43 101 Q 60 117 77 101" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round"/>';

        return svg;
    }

    /**
     * Vektör SVG Nesne Görseli Oluşturur (assets/images/objects/*.svg kullanır, fallback olarak emoji gösterir)
     * @param {Object|string} item - { word, emoji, image } veya kelime/emoji dizgesi
     * @param {number} size - Piksel boyutu
     * @param {Object} opts - { isShadow: boolean, showLabel: boolean, animate: boolean }
     */
    function createObjectImage(item, size, opts) {
        size = size || 110;
        opts = opts || {};

        var word = '';
        var emoji = '⭐';
        var imageUrl = '';

        if (typeof item === 'object' && item !== null) {
            word = item.word || item.text || '';
            emoji = item.emoji || '⭐';
            imageUrl = item.image || (word && window.GameData && window.GameData.getObjectImageUrl ? window.GameData.getObjectImageUrl(word) : '');
        } else if (typeof item === 'string') {
            var trimmed = item.trim();
            if (emojiToSlug[trimmed]) {
                emoji = trimmed;
                imageUrl = 'assets/images/objects/' + emojiToSlug[trimmed] + '.svg';
            } else if (trimmed.endsWith('.svg')) {
                imageUrl = trimmed;
            } else if (window.GameData && window.GameData.getObjectImageUrl) {
                word = trimmed;
                imageUrl = window.GameData.getObjectImageUrl(trimmed);
            } else {
                emoji = trimmed;
            }
        }

        if (!imageUrl && emojiToSlug[emoji]) {
            imageUrl = 'assets/images/objects/' + emojiToSlug[emoji] + '.svg';
        }

        var wrap = document.createElement('div');
        wrap.className = 'svg-object-badge' + (opts.animate !== false ? ' animate-float-Slow' : '');
        wrap.style.cssText =
            'width:' + size + 'px;height:' + size + 'px;' +
            'display:inline-flex;flex-direction:column;align-items:center;justify-content:center;' +
            'position:relative;user-select:none;flex-shrink:0;' +
            (opts.bg === false ? '' :
                'background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.75));' +
                'border-radius:28%;box-shadow:0 8px 20px rgba(0,0,0,0.16), inset 0 2px 6px rgba(255,255,255,0.9);' +
                'border:3px solid rgba(255,255,255,0.9);');

        var imgSize = Math.round(size * (opts.showLabel ? 0.62 : 0.74));

        if (imageUrl) {
            var img = document.createElement('img');
            img.src = imageUrl;
            img.alt = word || emoji;
            img.draggable = false;
            img.style.cssText =
                'width:' + imgSize + 'px;height:' + imgSize + 'px;object-fit:contain;pointer-events:none;' +
                'transition:transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s;' +
                (opts.isShadow
                    ? 'filter:brightness(0) contrast(200%) drop-shadow(0 4px 8px rgba(0,0,0,0.35));opacity:0.88;'
                    : 'filter:drop-shadow(0 4px 8px rgba(0,0,0,0.18));');

            img.onerror = function () {
                if (img.parentNode) {
                    var fallback = document.createElement('div');
                    fallback.textContent = emoji || '⭐';
                    fallback.style.cssText =
                        'font-size:' + (imgSize * 0.85) + 'px;line-height:1;' +
                        (opts.isShadow ? 'filter:brightness(0) contrast(200%);opacity:0.85;' : '');
                    img.parentNode.replaceChild(fallback, img);
                }
            };
            wrap.appendChild(img);
        } else {
            var emojiDiv = document.createElement('div');
            emojiDiv.textContent = emoji;
            emojiDiv.style.cssText =
                'font-size:' + (imgSize * 0.85) + 'px;line-height:1;' +
                (opts.isShadow ? 'filter:brightness(0) contrast(200%);opacity:0.85;' : '');
            wrap.appendChild(emojiDiv);
        }

        if (opts.showLabel && word) {
            var lbl = document.createElement('div');
            lbl.textContent = word.toUpperCase();
            lbl.style.cssText =
                'font-size:' + Math.max(11, Math.round(size * 0.16)) + 'px;font-weight:900;color:#222;' +
                'margin-top:3px;line-height:1;text-align:center;max-width:94%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
            wrap.appendChild(lbl);
        }

        return wrap;
    }

    /**
     * Emoji / Nesne resmi oluşturur (Tüm oyunlarda otomatik olarak SVG vektör çizimlerini kullanır!)
     */
    function createEmojiImage(emojiOrWord, size, assetPath) {
        if (assetPath) {
            return createObjectImage({ emoji: emojiOrWord, image: assetPath }, size, { animate: true });
        }
        return createObjectImage(emojiOrWord, size, { animate: true });
    }

    /**
     * Sevimli baykuş maskot Puki SVG'si oluşturur
     */
    function createMascot(size) {
        size = size || 72;
        return createObjectImage({ word: 'baykuş', emoji: '🦉', image: 'assets/images/objects/baykus.svg' }, size, { animate: true });
    }

    /**
     * Küçük harf etiketi
     */
    function createLetterBadge(letter, size, color) {
        size = size || 60;
        var info = window.GameData.getLetterInfo(letter);
        color = color || (info ? info.color : '#4CAF50');

        var isLightBg = (color === '#ffffff' || color === 'white' || color === '#fff');
        var textColor = isLightBg ? '#1565C0' : 'white';

        var div = document.createElement('div');
        div.className = 'letter-badge';
        div.style.cssText =
            'width:' + size + 'px;height:' + size + 'px;' +
            'background:' + color + ';color:' + textColor + ';' +
            'border-radius:' + (size / 3.5) + 'px;' +
            'display:flex;align-items:center;justify-content:center;' +
            'font-size:' + (size * 0.55) + 'px;font-weight:900;' +
            'font-family:Segoe UI, Arial, sans-serif;' +
            'box-shadow:0 6px 14px rgba(0,0,0,0.22);' +
            'user-select:none;cursor:pointer;' +
            'border:3px solid ' + (isLightBg ? '#2196F3' : darkenColor(color, 20)) + ';';

        var displayLetter = window.Utils ? window.Utils.toUpperTR(letter) : letter.toUpperCase();
        div.textContent = displayLetter;

        return div;
    }

    /**
     * Hece kartı oluşturur (İsteğe bağlı olarak hecenin sevimli nesne görselini de içerir)
     */
    function createSyllableCard(syllable, size, color, showObject) {
        size = size || 80;
        color = color || window.GameData.getRandomColor();
        var text = typeof syllable === 'object' ? syllable.text : String(syllable);

        var div = document.createElement('div');
        div.className = 'syllable-card';
        div.style.cssText =
            'min-width:' + size + 'px;height:' + size + 'px;' +
            'padding:4px ' + Math.round(size / 4) + 'px;' +
            'background:linear-gradient(145deg, ' + lightenColor(color, 15) + ', ' + color + ');color:white;' +
            'border-radius:' + Math.round(size / 3.5) + 'px;' +
            'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;' +
            'font-size:' + Math.round(size * (showObject ? 0.36 : 0.44)) + 'px;font-weight:900;' +
            'font-family:Segoe UI, Arial, sans-serif;' +
            'box-shadow:0 6px 16px rgba(0,0,0,0.22), inset 0 2px 4px rgba(255,255,255,0.35);' +
            'user-select:none;cursor:pointer;' +
            'border:3px solid ' + darkenColor(color, 25) + ';';

        if (showObject && window.GameData && window.GameData.getSyllableVisual) {
            var vis = window.GameData.getSyllableVisual(text);
            if (vis && vis.image) {
                var miniImg = document.createElement('img');
                miniImg.src = vis.image;
                miniImg.alt = vis.word || '';
                miniImg.style.cssText = 'width:' + Math.round(size * 0.38) + 'px;height:' + Math.round(size * 0.38) + 'px;object-fit:contain;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.2));';
                div.appendChild(miniImg);
            }
        }

        var span = document.createElement('span');
        span.textContent = text;
        span.style.lineHeight = '1';
        div.appendChild(span);

        return div;
    }

    /**
     * Kelime kartı (SVG vektör çizimi ile)
     */
    function createWordCard(wordObj, size) {
        size = size || 100;

        var div = document.createElement('div');
        div.className = 'word-card';
        div.style.cssText =
            'min-width:' + (size * 1.45) + 'px;padding:' + (size / 6) + 'px;' +
            'background:white;border-radius:' + (size / 4) + 'px;' +
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'box-shadow:0 8px 20px rgba(0,0,0,0.16);' +
            'user-select:none;cursor:pointer;' +
            'border:4px solid #E0E0E0;gap:' + (size / 10) + 'px;';

        var objBadge = createObjectImage(wordObj, size * 0.65, { bg: false, animate: true });
        div.appendChild(objBadge);

        var textDiv = document.createElement('div');
        textDiv.style.cssText =
            'font-size:' + (size * 0.28) + 'px;font-weight:900;' +
            'color:#222;font-family:Segoe UI, Arial, sans-serif;';
        textDiv.textContent = wordObj.word;
        div.appendChild(textDiv);

        return div;
    }

    /**
     * Sevimli parlak Balon SVG'si oluşturur
     */
    function createBalloon(letter, size, color) {
        size = size || 100;
        var info = window.GameData.getLetterInfo(letter);
        color = color || (info ? info.color : window.GameData.getRandomColor());

        var div = document.createElement('div');
        div.className = 'balloon';
        div.style.cssText = 'width:' + size + 'px;cursor:pointer;user-select:none;';

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 140');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size * 1.4);

        var displayLetter = window.Utils ? window.Utils.toUpperTR(letter) : letter.toUpperCase();

        svg.innerHTML =
            // Kıvrımlı İp
            '<path d="M 50 96 Q 42 112 52 125 Q 58 134 46 140" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" stroke-linecap="round"/>' +
            // Balon Gövdesi
            '<ellipse cx="50" cy="49" rx="42" ry="48" fill="' + color + '" stroke="' + darkenColor(color, 25) + '" stroke-width="2"/>' +
            // Parlama Efektleri
            '<ellipse cx="33" cy="31" rx="12" ry="18" fill="rgba(255,255,255,0.38)" transform="rotate(-22 33 31)"/>' +
            '<circle cx="26" cy="52" r="4" fill="rgba(255,255,255,0.35)"/>' +
            // Düğüm
            '<polygon points="44,94 50,103 56,94" fill="' + darkenColor(color, 20) + '"/>' +
            // Harf
            '<text x="50" y="53" text-anchor="middle" dominant-baseline="central" ' +
            'font-family="Segoe UI, Arial, sans-serif" font-weight="900" font-size="38" fill="white" ' +
            'stroke="rgba(0,0,0,0.2)" stroke-width="1.5">' + escapeHtml(displayLetter) + '</text>';

        div.appendChild(svg);
        return div;
    }

    /**
     * Tren vagonu oluşturur
     */
    function createTrainCar(text, size, color, isEngine) {
        size = size || 100;
        color = color || '#4CAF50';

        var div = document.createElement('div');
        div.className = 'train-car';
        div.style.cssText =
            'width:' + size + 'px;height:' + (size * 0.82) + 'px;position:relative;' +
            'display:inline-flex;align-items:center;justify-content:center;' +
            'cursor:pointer;user-select:none;';

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 82');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size * 0.82);

        var bodyParts = '';
        if (isEngine) {
            bodyParts =
                '<rect x="5" y="12" width="90" height="46" rx="10" fill="' + color + '" stroke="' + darkenColor(color, 30) + '" stroke-width="2.5"/>' +
                '<rect x="68" y="4" width="26" height="16" rx="5" fill="' + lightenColor(color, 15) + '" stroke="' + darkenColor(color, 25) + '" stroke-width="2"/>' +
                '<rect x="16" y="1" width="14" height="13" rx="3" fill="#FF7043" stroke="#D84315" stroke-width="2"/>' +
                '<circle cx="23" cy="-4" r="5" fill="rgba(255,255,255,0.7)"/>';
        } else {
            bodyParts =
                '<rect x="5" y="12" width="90" height="46" rx="10" fill="' + color + '" stroke="' + darkenColor(color, 30) + '" stroke-width="2.5"/>' +
                '<path d="M 14 18 L 86 18" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round"/>';
        }

        svg.innerHTML =
            bodyParts +
            '<circle cx="26" cy="63" r="10" fill="#37474F" stroke="#263238" stroke-width="2.5"/>' +
            '<circle cx="26" cy="63" r="4" fill="#FFD54F"/>' +
            '<circle cx="74" cy="63" r="10" fill="#37474F" stroke="#263238" stroke-width="2.5"/>' +
            '<circle cx="74" cy="63" r="4" fill="#FFD54F"/>' +
            '<text x="50" y="37" text-anchor="middle" dominant-baseline="central" ' +
            'font-family="Segoe UI, Arial, sans-serif" font-weight="900" font-size="26" fill="white" stroke="rgba(0,0,0,0.18)" stroke-width="1">' +
            escapeHtml(String(text).toUpperCase()) + '</text>';

        div.appendChild(svg);
        return div;
    }

    /**
     * Yıldız rozeti oluşturur
     */
    function createStar(size, filled) {
        size = size || 30;
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);

        svg.innerHTML = '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" ' +
            'fill="' + (filled ? '#FFD700' : '#E0E0E0') + '" ' +
            'stroke="' + (filled ? '#FFA000' : '#BDBDBD') + '" stroke-width="0.5"/>';

        return svg;
    }

    /**
     * Geri butonu ikonu
     */
    function createBackIcon(size) {
        size = size || 32;
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.innerHTML = '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>';
        return svg;
    }

    // ────────────────────────────────────────────
    // Yardımcı Fonksiyonlar
    // ────────────────────────────────────────────

    function darkenColor(hex, percent) {
        if (!hex || hex.charAt(0) !== '#') return '#333333';
        var num = parseInt(hex.replace('#', ''), 16);
        var r = Math.max(0, (num >> 16) - percent);
        var g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
        var b = Math.max(0, (num & 0x0000FF) - percent);
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function lightenColor(hex, percent) {
        if (!hex || hex.charAt(0) !== '#') return '#ffffff';
        var num = parseInt(hex.replace('#', ''), 16);
        var r = Math.min(255, (num >> 16) + percent);
        var g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
        var b = Math.min(255, (num & 0x0000FF) + percent);
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        createLetter: createLetter,
        createLetterBadge: createLetterBadge,
        createSyllableCard: createSyllableCard,
        createWordCard: createWordCard,
        createEmojiImage: createEmojiImage,
        createObjectImage: createObjectImage,
        createMascot: createMascot,
        createBalloon: createBalloon,
        createTrainCar: createTrainCar,
        createStar: createStar,
        createBackIcon: createBackIcon,
        darkenColor: darkenColor,
        lightenColor: lightenColor
    };
})();
