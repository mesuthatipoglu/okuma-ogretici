/**
 * Türkçe Okuma Öğretici - SVG Harf ve Resim Görselleri
 * Sevimli, canlı renkli vektör görseller
 */
window.SvgLetters = (function () {
    'use strict';

    /**
     * Sevimli yüzlü harf SVG'si oluşturur
     */
    function createLetter(letter, size, color) {
        size = size || 120;
        var info = window.GameData.getLetterInfo(letter);
        color = color || (info ? info.color : '#4CAF50');
        var displayLetter = letter.toUpperCase();

        // Türkçe özel büyük harfler
        if (letter === 'i') displayLetter = 'İ';
        if (letter === 'ı') displayLetter = 'I';

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 120 140');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size * 140 / 120);
        svg.style.overflow = 'visible';

        svg.innerHTML =
            // Gölge
            '<ellipse cx="60" cy="132" rx="35" ry="6" fill="rgba(0,0,0,0.1)"/>' +
            // Gövde (yuvarlatılmış dikdörtgen)
            '<rect x="15" y="15" width="90" height="105" rx="20" ry="20" fill="' + color + '" stroke="' + darkenColor(color, 30) + '" stroke-width="3"/>' +
            // Harf
            '<text x="60" y="82" text-anchor="middle" dominant-baseline="central" ' +
            'font-family="Arial, sans-serif" font-weight="bold" font-size="60" fill="white" ' +
            'stroke="rgba(0,0,0,0.15)" stroke-width="1">' + escapeHtml(displayLetter) + '</text>' +
            // Sol göz
            '<ellipse cx="40" cy="42" rx="8" ry="9" fill="white"/>' +
            '<ellipse cx="42" cy="43" rx="4" ry="5" fill="#333"/>' +
            '<ellipse cx="43" cy="41" rx="1.5" ry="1.5" fill="white"/>' +
            // Sağ göz
            '<ellipse cx="80" cy="42" rx="8" ry="9" fill="white"/>' +
            '<ellipse cx="82" cy="43" rx="4" ry="5" fill="#333"/>' +
            '<ellipse cx="83" cy="41" rx="1.5" ry="1.5" fill="white"/>' +
            // Gülümseyen ağız
            '<path d="M 42 100 Q 60 115 78 100" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/>' +
            // Yanaklar (pembe)
            '<ellipse cx="32" cy="98" rx="8" ry="5" fill="rgba(255,150,150,0.5)"/>' +
            '<ellipse cx="88" cy="98" rx="8" ry="5" fill="rgba(255,150,150,0.5)"/>' +
            // Sol el
            '<ellipse cx="8" cy="70" rx="7" ry="5" fill="' + color + '" stroke="' + darkenColor(color, 30) + '" stroke-width="2" transform="rotate(-20 8 70)"/>' +
            // Sağ el
            '<ellipse cx="112" cy="70" rx="7" ry="5" fill="' + color + '" stroke="' + darkenColor(color, 30) + '" stroke-width="2" transform="rotate(20 112 70)"/>' +
            // Sol ayak
            '<ellipse cx="40" cy="125" rx="10" ry="6" fill="' + darkenColor(color, 20) + '"/>' +
            // Sağ ayak
            '<ellipse cx="80" cy="125" rx="10" ry="6" fill="' + darkenColor(color, 20) + '"/>';

        return svg;
    }

    /**
     * Küçük harf etiketi (oyunlar için daha kompakt)
     */
    function createLetterBadge(letter, size, color) {
        size = size || 60;
        var info = window.GameData.getLetterInfo(letter);
        color = color || (info ? info.color : '#4CAF50');

        // Metin rengini arka plana göre kontrastlı seç
        var isLightBg = (color === '#ffffff' || color === 'white' || color === '#fff');
        var textColor = isLightBg ? '#1565C0' : 'white';

        var div = document.createElement('div');
        div.className = 'letter-badge';
        div.style.cssText =
            'width:' + size + 'px;height:' + size + 'px;' +
            'background:' + color + ';color:' + textColor + ';' +
            'border-radius:' + (size / 4) + 'px;' +
            'display:flex;align-items:center;justify-content:center;' +
            'font-size:' + (size * 0.55) + 'px;font-weight:bold;' +
            'font-family:Arial,sans-serif;' +
            'box-shadow:0 4px 8px rgba(0,0,0,0.2);' +
            'user-select:none;cursor:pointer;' +
            'border:3px solid ' + (isLightBg ? '#2196F3' : darkenColor(color, 20)) + ';';

        var displayLetter = letter.toUpperCase();
        if (letter === 'i') displayLetter = 'İ';
        if (letter === 'ı') displayLetter = 'I';
        div.textContent = displayLetter;

        return div;
    }

    /**
     * Hece kartı oluşturur
     */
    function createSyllableCard(syllable, size, color) {
        size = size || 80;
        color = color || window.GameData.getRandomColor();

        var div = document.createElement('div');
        div.className = 'syllable-card';
        div.style.cssText =
            'min-width:' + size + 'px;height:' + size + 'px;' +
            'padding:0 ' + (size / 4) + 'px;' +
            'background:' + color + ';color:white;' +
            'border-radius:' + (size / 4) + 'px;' +
            'display:flex;align-items:center;justify-content:center;' +
            'font-size:' + (size * 0.45) + 'px;font-weight:bold;' +
            'font-family:Arial,sans-serif;' +
            'box-shadow:0 4px 12px rgba(0,0,0,0.2);' +
            'user-select:none;cursor:pointer;' +
            'border:3px solid ' + darkenColor(color, 20) + ';';

        div.textContent = syllable;
        return div;
    }

    /**
     * Kelime kartı (emoji ile)
     */
    function createWordCard(wordObj, size) {
        size = size || 100;

        var div = document.createElement('div');
        div.className = 'word-card';
        div.style.cssText =
            'min-width:' + (size * 1.5) + 'px;padding:' + (size / 6) + 'px;' +
            'background:white;border-radius:' + (size / 5) + 'px;' +
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'box-shadow:0 4px 16px rgba(0,0,0,0.15);' +
            'user-select:none;cursor:pointer;' +
            'border:3px solid #E0E0E0;gap:' + (size / 10) + 'px;';

        var emojiDiv = document.createElement('div');
        emojiDiv.style.fontSize = (size * 0.5) + 'px';
        emojiDiv.textContent = wordObj.emoji || '📝';
        div.appendChild(emojiDiv);

        var textDiv = document.createElement('div');
        textDiv.style.cssText =
            'font-size:' + (size * 0.28) + 'px;font-weight:bold;' +
            'color:#333;font-family:Arial,sans-serif;';
        textDiv.textContent = wordObj.word;
        div.appendChild(textDiv);

        return div;
    }

    /**
     * Emoji resim oluşturur (büyük boyut)
     */
    function createEmojiImage(emoji, size) {
        size = size || 120;
        var div = document.createElement('div');
        div.style.cssText =
            'width:' + size + 'px;height:' + size + 'px;' +
            'display:flex;align-items:center;justify-content:center;' +
            'font-size:' + (size * 0.7) + 'px;' +
            'background:rgba(255,255,255,0.3);border-radius:50%;';
        div.textContent = emoji;
        return div;
    }

    /**
     * Balon SVG'si oluşturur
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

        var displayLetter = letter.toUpperCase();
        if (letter === 'i') displayLetter = 'İ';
        if (letter === 'ı') displayLetter = 'I';

        svg.innerHTML =
            // İp
            '<path d="M 50 95 Q 45 110 50 125 Q 55 135 48 140" fill="none" stroke="#999" stroke-width="1.5"/>' +
            // Balon gövdesi
            '<ellipse cx="50" cy="50" rx="40" ry="48" fill="' + color + '"/>' +
            // Parlama efekti
            '<ellipse cx="35" cy="35" rx="12" ry="16" fill="rgba(255,255,255,0.3)" transform="rotate(-20 35 35)"/>' +
            // Düğüm
            '<polygon points="45,93 50,100 55,93" fill="' + darkenColor(color, 20) + '"/>' +
            // Harf
            '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" ' +
            'font-family="Arial, sans-serif" font-weight="bold" font-size="36" fill="white" ' +
            'stroke="rgba(0,0,0,0.1)" stroke-width="0.5">' + escapeHtml(displayLetter) + '</text>';

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
            'width:' + size + 'px;height:' + (size * 0.8) + 'px;position:relative;' +
            'display:inline-flex;align-items:center;justify-content:center;' +
            'cursor:pointer;user-select:none;';

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 80');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size * 0.8);

        var bodyParts = '';
        if (isEngine) {
            // Lokomotif
            bodyParts =
                '<rect x="5" y="10" width="90" height="45" rx="8" fill="' + color + '" stroke="' + darkenColor(color, 30) + '" stroke-width="2"/>' +
                '<rect x="70" y="5" width="25" height="15" rx="4" fill="' + darkenColor(color, 10) + '"/>' +
                '<rect x="78" y="-2" width="10" height="10" rx="2" fill="#666"/>';
        } else {
            // Vagon
            bodyParts =
                '<rect x="5" y="10" width="90" height="45" rx="8" fill="' + color + '" stroke="' + darkenColor(color, 30) + '" stroke-width="2"/>';
        }

        svg.innerHTML =
            bodyParts +
            // Tekerlekler
            '<circle cx="25" cy="60" r="9" fill="#555" stroke="#333" stroke-width="2"/>' +
            '<circle cx="25" cy="60" r="3" fill="#999"/>' +
            '<circle cx="75" cy="60" r="9" fill="#555" stroke="#333" stroke-width="2"/>' +
            '<circle cx="75" cy="60" r="3" fill="#999"/>' +
            // Metin
            '<text x="50" y="37" text-anchor="middle" dominant-baseline="central" ' +
            'font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="white">' +
            escapeHtml(text) + '</text>';

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
        var num = parseInt(hex.replace('#', ''), 16);
        var r = Math.max(0, (num >> 16) - percent);
        var g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
        var b = Math.max(0, (num & 0x0000FF) - percent);
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function lightenColor(hex, percent) {
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
        createBalloon: createBalloon,
        createTrainCar: createTrainCar,
        createStar: createStar,
        createBackIcon: createBackIcon,
        darkenColor: darkenColor,
        lightenColor: lightenColor
    };
})();
