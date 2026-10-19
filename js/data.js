/**
 * Türkçe Okuma Öğretici - Veri Modülü
 * MEB Ses Temelli Cümle Yöntemi'ne dayalı harf grupları,
 * hece üretimi, kelime ve cümle veritabanı.
 */
window.GameData = (function () {
    'use strict';

    // ────────────────────────────────────────────
    // Türk Alfabesi Temel Bilgileri
    // ────────────────────────────────────────────
    const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
    const consonants = ['b', 'c', 'ç', 'd', 'f', 'g', 'ğ', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 'ş', 't', 'v', 'y', 'z'];

    // Alfabetik sıra (29 Harf)
    const alphabetLetters = [
        'a', 'b', 'c', 'ç', 'd', 'e', 'f', 'g', 'ğ', 'h',
        'ı', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'ö', 'p',
        'r', 's', 'ş', 't', 'u', 'ü', 'v', 'y', 'z'
    ];

    // ────────────────────────────────────────────
    // MEB Harf Grupları (Ses Temelli Cümle Yöntemi)
    // ────────────────────────────────────────────
    const letterGroups = [
        { id: 1, name: '1. Grup', letters: ['e', 'l', 'a', 't'], color: '#4CAF50', emoji: '🌱' },
        { id: 2, name: '2. Grup', letters: ['i', 'n', 'o', 'r', 'm'], color: '#2196F3', emoji: '🌊' },
        { id: 3, name: '3. Grup', letters: ['u', 'k', 'ı', 'y', 's', 'd'], color: '#FF9800', emoji: '🌞' },
        { id: 4, name: '4. Grup', letters: ['ö', 'b', 'ü', 'ş', 'z', 'ç'], color: '#9C27B0', emoji: '🦋' },
        { id: 5, name: '5. Grup', letters: ['g', 'c', 'p', 'h'], color: '#F44336', emoji: '🚀' },
        { id: 6, name: '6. Grup', letters: ['ğ', 'v', 'f', 'j'], color: '#607D8B', emoji: '⭐' }
    ];

    // ────────────────────────────────────────────
    // Her Harf İçin Detaylı Bilgi (Standart Türkçe Fonetik Sesler + 3 Örnek Kelime)
    // ────────────────────────────────────────────
    const letterInfo = {
        'a': { 
            upper: 'A', sound: 'a', group: 1, isVowel: true, word: 'at', wordMeaning: 'at', color: '#E53935',
            examples: [
                { word: 'at', emoji: '🐴' },
                { word: 'arı', emoji: '🐝' },
                { word: 'ayı', emoji: '🐻' }
            ]
        },
        'b': { 
            upper: 'B', sound: 'be', group: 4, isVowel: false, word: 'balık', wordMeaning: 'balık', color: '#8E24AA',
            examples: [
                { word: 'balık', emoji: '🐟' },
                { word: 'bebek', emoji: '👶' },
                { word: 'balon', emoji: '🎈' }
            ]
        },
        'c': { 
            upper: 'C', sound: 'ce', group: 5, isVowel: false, word: 'cam', wordMeaning: 'cam', color: '#D32F2F',
            examples: [
                { word: 'cam', emoji: '🪟' },
                { word: 'civciv', emoji: '🐥' },
                { word: 'ceviz', emoji: '🌰' }
            ]
        },
        'ç': { 
            upper: 'Ç', sound: 'çe', group: 4, isVowel: false, word: 'çiçek', wordMeaning: 'çiçek', color: '#C2185B',
            examples: [
                { word: 'çiçek', emoji: '🌸' },
                { word: 'çilek', emoji: '🍓' },
                { word: 'çanta', emoji: '👜' }
            ]
        },
        'd': { 
            upper: 'D', sound: 'de', group: 3, isVowel: false, word: 'dut', wordMeaning: 'dut', color: '#F57C00',
            examples: [
                { word: 'davul', emoji: '🥁' },
                { word: 'deniz', emoji: '🌊' },
                { word: 'dut', emoji: '🫐' }
            ]
        },
        'e': { 
            upper: 'E', sound: 'e', group: 1, isVowel: true, word: 'el', wordMeaning: 'el', color: '#43A047',
            examples: [
                { word: 'el', emoji: '👋' },
                { word: 'elma', emoji: '🍎' },
                { word: 'ev', emoji: '🏠' }
            ]
        },
        'f': { 
            upper: 'F', sound: 'fe', group: 6, isVowel: false, word: 'fil', wordMeaning: 'fil', color: '#546E7A',
            examples: [
                { word: 'fil', emoji: '🐘' },
                { word: 'fare', emoji: '🐭' },
                { word: 'fırın', emoji: '🍞' }
            ]
        },
        'g': { 
            upper: 'G', sound: 'ge', group: 5, isVowel: false, word: 'gül', wordMeaning: 'gül', color: '#E91E63',
            examples: [
                { word: 'gül', emoji: '🌹' },
                { word: 'gemi', emoji: '🚢' },
                { word: 'göz', emoji: '👁️' }
            ]
        },
        'ğ': { 
            upper: 'Ğ', sound: 'yumuşak ge', group: 6, isVowel: false, word: 'dağ', wordMeaning: 'dağ', color: '#78909C',
            examples: [
                { word: 'dağ', emoji: '⛰️' },
                { word: 'ağaç', emoji: '🌳' },
                { word: 'bağ', emoji: '🍇' }
            ]
        },
        'h': { 
            upper: 'H', sound: 'he', group: 5, isVowel: false, word: 'hediye', wordMeaning: 'hediye', color: '#EF5350',
            examples: [
                { word: 'havuç', emoji: '🥕' },
                { word: 'halı', emoji: '🧶' },
                { word: 'hediye', emoji: '🎁' }
            ]
        },
        'ı': { 
            upper: 'I', sound: 'ı', group: 3, isVowel: true, word: 'ırmak', wordMeaning: 'ırmak', color: '#FF7043',
            examples: [
                { word: 'ırmak', emoji: '🏞️' },
                { word: 'ışık', emoji: '💡' },
                { word: 'ıspanak', emoji: '🥬' }
            ]
        },
        'i': { 
            upper: 'İ', sound: 'i', group: 2, isVowel: true, word: 'inek', wordMeaning: 'inek', color: '#1E88E5',
            examples: [
                { word: 'inek', emoji: '🐄' },
                { word: 'incir', emoji: '🫐' },
                { word: 'ip', emoji: '🪢' }
            ]
        },
        'j': { 
            upper: 'J', sound: 'je', group: 6, isVowel: false, word: 'jeton', wordMeaning: 'jeton', color: '#455A64',
            examples: [
                { word: 'jeton', emoji: '🪙' },
                { word: 'jip', emoji: '🚙' },
                { word: 'jant', emoji: '🛞' }
            ]
        },
        'k': { 
            upper: 'K', sound: 'ke', group: 3, isVowel: false, word: 'kedi', wordMeaning: 'kedi', color: '#FB8C00',
            examples: [
                { word: 'kedi', emoji: '🐱' },
                { word: 'köpek', emoji: '🐕' },
                { word: 'kuş', emoji: '🐦' }
            ]
        },
        'l': { 
            upper: 'L', sound: 'le', group: 1, isVowel: false, word: 'limon', wordMeaning: 'limon', color: '#66BB6A',
            examples: [
                { word: 'limon', emoji: '🍋' },
                { word: 'lale', emoji: '🌷' },
                { word: 'lokum', emoji: '🍬' }
            ]
        },
        'm': { 
            upper: 'M', sound: 'me', group: 2, isVowel: false, word: 'masa', wordMeaning: 'masa', color: '#42A5F5',
            examples: [
                { word: 'masa', emoji: '🪑' },
                { word: 'muz', emoji: '🍌' },
                { word: 'maymun', emoji: '🐵' }
            ]
        },
        'n': { 
            upper: 'N', sound: 'ne', group: 2, isVowel: false, word: 'nar', wordMeaning: 'nar', color: '#29B6F6',
            examples: [
                { word: 'nar', emoji: '❤️' },
                { word: 'nane', emoji: '🌿' },
                { word: 'nine', emoji: '👵' }
            ]
        },
        'o': { 
            upper: 'O', sound: 'o', group: 2, isVowel: true, word: 'orman', wordMeaning: 'orman', color: '#26A69A',
            examples: [
                { word: 'orman', emoji: '🌲' },
                { word: 'otobüs', emoji: '🚌' },
                { word: 'okul', emoji: '🏫' }
            ]
        },
        'ö': { 
            upper: 'Ö', sound: 'ö', group: 4, isVowel: true, word: 'ördek', wordMeaning: 'ördek', color: '#AB47BC',
            examples: [
                { word: 'ördek', emoji: '🦆' },
                { word: 'önlük', emoji: '🥼' },
                { word: 'öküz', emoji: '🐂' }
            ]
        },
        'p': { 
            upper: 'P', sound: 'pe', group: 5, isVowel: false, word: 'pasta', wordMeaning: 'pasta', color: '#EC407A',
            examples: [
                { word: 'pasta', emoji: '🎂' },
                { word: 'portakal', emoji: '🍊' },
                { word: 'peynir', emoji: '🧀' }
            ]
        },
        'r': { 
            upper: 'R', sound: 're', group: 2, isVowel: false, word: 'robot', wordMeaning: 'robot', color: '#5C6BC0',
            examples: [
                { word: 'robot', emoji: '🤖' },
                { word: 'resim', emoji: '🎨' },
                { word: 'roket', emoji: '🚀' }
            ]
        },
        's': { 
            upper: 'S', sound: 'se', group: 3, isVowel: false, word: 'su', wordMeaning: 'su', color: '#FFA726',
            examples: [
                { word: 'su', emoji: '💧' },
                { word: 'süt', emoji: '🥛' },
                { word: 'simit', emoji: '🥯' }
            ]
        },
        'ş': { 
            upper: 'Ş', sound: 'şe', group: 4, isVowel: false, word: 'şeker', wordMeaning: 'şeker', color: '#7E57C2',
            examples: [
                { word: 'şeker', emoji: '🍬' },
                { word: 'şapka', emoji: '🧢' },
                { word: 'şemsiye', emoji: '☂️' }
            ]
        },
        't': { 
            upper: 'T', sound: 'te', group: 1, isVowel: false, word: 'tren', wordMeaning: 'tren', color: '#2E7D32',
            examples: [
                { word: 'top', emoji: '⚽' },
                { word: 'tren', emoji: '🚂' },
                { word: 'tavşan', emoji: '🐰' }
            ]
        },
        'u': { 
            upper: 'U', sound: 'u', group: 3, isVowel: true, word: 'uçak', wordMeaning: 'uçak', color: '#EF6C00',
            examples: [
                { word: 'uçak', emoji: '✈️' },
                { word: 'uçurtma', emoji: '🪁' },
                { word: 'un', emoji: '🌾' }
            ]
        },
        'ü': { 
            upper: 'Ü', sound: 'ü', group: 4, isVowel: true, word: 'üzüm', wordMeaning: 'üzüm', color: '#6A1B9A',
            examples: [
                { word: 'üzüm', emoji: '🍇' },
                { word: 'ütü', emoji: '🔌' },
                { word: 'üçgen', emoji: '📐' }
            ]
        },
        'v': { 
            upper: 'V', sound: 've', group: 6, isVowel: false, word: 'vazo', wordMeaning: 'vazo', color: '#37474F',
            examples: [
                { word: 'vazo', emoji: '🏺' },
                { word: 'vagon', emoji: '🚃' },
                { word: 'vişne', emoji: '🍒' }
            ]
        },
        'y': { 
            upper: 'Y', sound: 'ye', group: 3, isVowel: false, word: 'yılan', wordMeaning: 'yılan', color: '#F9A825',
            examples: [
                { word: 'yıldız', emoji: '⭐' },
                { word: 'yumurta', emoji: '🥚' },
                { word: 'yılan', emoji: '🐍' }
            ]
        },
        'z': { 
            upper: 'Z', sound: 'ze', group: 4, isVowel: false, word: 'zürafa', wordMeaning: 'zürafa', color: '#4A148C',
            examples: [
                { word: 'zürafa', emoji: '🦒' },
                { word: 'zeytin', emoji: '🫒' },
                { word: 'zil', emoji: '🔔' }
            ]
        }
    };

    // ────────────────────────────────────────────
    // 100+ Kelime Veritabanı (Çocuk Dostu, Hecelerine Ayrılmış, Emojili)
    // ────────────────────────────────────────────
    const words = [
        // 1 Hece
        { word: 'el', syllables: ['el'], minGroup: 1, emoji: '👋', meaning: 'el' },
        { word: 'at', syllables: ['at'], minGroup: 1, emoji: '🐴', meaning: 'at' },
        { word: 'et', syllables: ['et'], minGroup: 1, emoji: '🥩', meaning: 'et' },
        { word: 'tel', syllables: ['tel'], minGroup: 1, emoji: '🧵', meaning: 'tel' },
        { word: 'nar', syllables: ['nar'], minGroup: 2, emoji: '❤️', meaning: 'nar' },
        { word: 'on', syllables: ['on'], minGroup: 2, emoji: '🔟', meaning: 'on' },
        { word: 'tren', syllables: ['tren'], minGroup: 2, emoji: '🚂', meaning: 'tren' },
        { word: 'su', syllables: ['su'], minGroup: 3, emoji: '💧', meaning: 'su' },
        { word: 'ay', syllables: ['ay'], minGroup: 3, emoji: '🌙', meaning: 'ay' },
        { word: 'kurt', syllables: ['kurt'], minGroup: 3, emoji: '🐺', meaning: 'kurt' },
        { word: 'kum', syllables: ['kum'], minGroup: 3, emoji: '🏖️', meaning: 'kum' },
        { word: 'dal', syllables: ['dal'], minGroup: 3, emoji: '🌿', meaning: 'dal' },
        { word: 'yol', syllables: ['yol'], minGroup: 3, emoji: '🛤️', meaning: 'yol' },
        { word: 'dut', syllables: ['dut'], minGroup: 3, emoji: '🫐', meaning: 'dut' },
        { word: 'buz', syllables: ['buz'], minGroup: 4, emoji: '🧊', meaning: 'buz' },
        { word: 'çay', syllables: ['çay'], minGroup: 4, emoji: '🍵', meaning: 'çay' },
        { word: 'göz', syllables: ['göz'], minGroup: 5, emoji: '👁️', meaning: 'göz' },
        { word: 'gül', syllables: ['gül'], minGroup: 5, emoji: '🌹', meaning: 'gül' },
        { word: 'cam', syllables: ['cam'], minGroup: 5, emoji: '🪟', meaning: 'cam' },
        { word: 'fil', syllables: ['fil'], minGroup: 6, emoji: '🐘', meaning: 'fil' },
        { word: 'dağ', syllables: ['dağ'], minGroup: 6, emoji: '⛰️', meaning: 'dağ' },
        { word: 'top', syllables: ['top'], minGroup: 1, emoji: '⚽', meaning: 'top' },
        { word: 'süt', syllables: ['süt'], minGroup: 3, emoji: '🥛', meaning: 'süt' },
        { word: 'ev', syllables: ['ev'], minGroup: 1, emoji: '🏠', meaning: 'ev' },
        { word: 'kuş', syllables: ['kuş'], minGroup: 3, emoji: '🐦', meaning: 'kuş' },
        { word: 'bal', syllables: ['bal'], minGroup: 4, emoji: '🍯', meaning: 'bal' },
        { word: 'muz', syllables: ['muz'], minGroup: 2, emoji: '🍌', meaning: 'muz' },
        { word: 'ip', syllables: ['ip'], minGroup: 2, emoji: '🪢', meaning: 'ip' },
        { word: 'zil', syllables: ['zil'], minGroup: 4, emoji: '🔔', meaning: 'zil' },

        // 2 Hece
        { word: 'alet', syllables: ['a', 'let'], minGroup: 1, emoji: '🔧', meaning: 'alet' },
        { word: 'atlet', syllables: ['at', 'let'], minGroup: 1, emoji: '🎽', meaning: 'atlet' },
        { word: 'lale', syllables: ['la', 'le'], minGroup: 1, emoji: '🌷', meaning: 'lale' },
        { word: 'anne', syllables: ['an', 'ne'], minGroup: 2, emoji: '👩', meaning: 'anne' },
        { word: 'elma', syllables: ['el', 'ma'], minGroup: 2, emoji: '🍎', meaning: 'elma' },
        { word: 'orman', syllables: ['or', 'man'], minGroup: 2, emoji: '🌲', meaning: 'orman' },
        { word: 'nane', syllables: ['na', 'ne'], minGroup: 2, emoji: '🌿', meaning: 'nane' },
        { word: 'limon', syllables: ['li', 'mon'], minGroup: 2, emoji: '🍋', meaning: 'limon' },
        { word: 'roman', syllables: ['ro', 'man'], minGroup: 2, emoji: '📖', meaning: 'roman' },
        { word: 'manto', syllables: ['man', 'to'], minGroup: 2, emoji: '🧥', meaning: 'manto' },
        { word: 'arı', syllables: ['a', 'rı'], minGroup: 3, emoji: '🐝', meaning: 'arı' },
        { word: 'kedi', syllables: ['ke', 'di'], minGroup: 3, emoji: '🐱', meaning: 'kedi' },
        { word: 'kutu', syllables: ['ku', 'tu'], minGroup: 3, emoji: '📦', meaning: 'kutu' },
        { word: 'masa', syllables: ['ma', 'sa'], minGroup: 3, emoji: '🪑', meaning: 'masa' },
        { word: 'yılan', syllables: ['yı', 'lan'], minGroup: 3, emoji: '🐍', meaning: 'yılan' },
        { word: 'kale', syllables: ['ka', 'le'], minGroup: 3, emoji: '🏰', meaning: 'kale' },
        { word: 'inek', syllables: ['i', 'nek'], minGroup: 3, emoji: '🐄', meaning: 'inek' },
        { word: 'aslan', syllables: ['as', 'lan'], minGroup: 3, emoji: '🦁', meaning: 'aslan' },
        { word: 'kalem', syllables: ['ka', 'lem'], minGroup: 3, emoji: '✏️', meaning: 'kalem' },
        { word: 'simit', syllables: ['si', 'mit'], minGroup: 3, emoji: '🥯', meaning: 'simit' },
        { word: 'kayık', syllables: ['ka', 'yık'], minGroup: 3, emoji: '⛵', meaning: 'kayık' },
        { word: 'dolma', syllables: ['dol', 'ma'], minGroup: 3, emoji: '🥘', meaning: 'dolma' },
        { word: 'mantar', syllables: ['man', 'tar'], minGroup: 3, emoji: '🍄', meaning: 'mantar' },
        { word: 'balık', syllables: ['ba', 'lık'], minGroup: 4, emoji: '🐟', meaning: 'balık' },
        { word: 'çiçek', syllables: ['çi', 'çek'], minGroup: 4, emoji: '🌸', meaning: 'çiçek' },
        { word: 'şeker', syllables: ['şe', 'ker'], minGroup: 4, emoji: '🍬', meaning: 'şeker' },
        { word: 'bebek', syllables: ['be', 'bek'], minGroup: 4, emoji: '👶', meaning: 'bebek' },
        { word: 'üzüm', syllables: ['ü', 'züm'], minGroup: 4, emoji: '🍇', meaning: 'üzüm' },
        { word: 'balon', syllables: ['ba', 'lon'], minGroup: 4, emoji: '🎈', meaning: 'balon' },
        { word: 'bulut', syllables: ['bu', 'lut'], minGroup: 4, emoji: '☁️', meaning: 'bulut' },
        { word: 'deniz', syllables: ['de', 'niz'], minGroup: 4, emoji: '🌊', meaning: 'deniz' },
        { word: 'böcek', syllables: ['bö', 'cek'], minGroup: 4, emoji: '🐛', meaning: 'böcek' },
        { word: 'çanta', syllables: ['çan', 'ta'], minGroup: 4, emoji: '👜', meaning: 'çanta' },
        { word: 'ördek', syllables: ['ör', 'dek'], minGroup: 4, emoji: '🦆', meaning: 'ördek' },
        { word: 'börek', syllables: ['bö', 'rek'], minGroup: 4, emoji: '🥟', meaning: 'börek' },
        { word: 'bardak', syllables: ['bar', 'dak'], minGroup: 4, emoji: '🥤', meaning: 'bardak' },
        { word: 'pasta', syllables: ['pas', 'ta'], minGroup: 5, emoji: '🎂', meaning: 'pasta' },
        { word: 'gemi', syllables: ['ge', 'mi'], minGroup: 5, emoji: '🚢', meaning: 'gemi' },
        { word: 'güneş', syllables: ['gü', 'neş'], minGroup: 5, emoji: '☀️', meaning: 'güneş' },
        { word: 'gece', syllables: ['ge', 'ce'], minGroup: 5, emoji: '🌙', meaning: 'gece' },
        { word: 'köpek', syllables: ['kö', 'pek'], minGroup: 5, emoji: '🐕', meaning: 'köpek' },
        { word: 'fare', syllables: ['fa', 're'], minGroup: 6, emoji: '🐭', meaning: 'fare' },
        { word: 'vazo', syllables: ['va', 'zo'], minGroup: 6, emoji: '🏺', meaning: 'vazo' },
        { word: 'ağaç', syllables: ['a', 'ğaç'], minGroup: 6, emoji: '🌳', meaning: 'ağaç' },
        { word: 'fırın', syllables: ['fı', 'rın'], minGroup: 6, emoji: '🍞', meaning: 'fırın' },
        { word: 'ayı', syllables: ['a', 'yı'], minGroup: 3, emoji: '🐻', meaning: 'ayı' },
        { word: 'çilek', syllables: ['çi', 'lek'], minGroup: 4, emoji: '🍓', meaning: 'çilek' },
        { word: 'tavşan', syllables: ['tav', 'şan'], minGroup: 4, emoji: '🐰', meaning: 'tavşan' },
        { word: 'kuzu', syllables: ['ku', 'zu'], minGroup: 3, emoji: '🐑', meaning: 'kuzu' },
        { word: 'maymun', syllables: ['may', 'mun'], minGroup: 2, emoji: '🐵', meaning: 'maymun' },
        { word: 'sincap', syllables: ['sin', 'cap'], minGroup: 5, emoji: '🐿️', meaning: 'sincap' },
        { word: 'kapı', syllables: ['ka', 'pı'], minGroup: 5, emoji: '🚪', meaning: 'kapı' },
        { word: 'halı', syllables: ['ha', 'lı'], minGroup: 5, emoji: '🧶', meaning: 'halı' },
        { word: 'çorap', syllables: ['ço', 'rap'], minGroup: 4, emoji: '🧦', meaning: 'çorap' },
        { word: 'şapka', syllables: ['şap', 'ka'], minGroup: 4, emoji: '🧢', meaning: 'şapka' },
        { word: 'sabun', syllables: ['sa', 'bun'], minGroup: 4, emoji: '🧼', meaning: 'sabun' },
        { word: 'havlu', syllables: ['hav', 'lu'], minGroup: 5, emoji: '🛁', meaning: 'havlu' },
        { word: 'tabak', syllables: ['ta', 'bak'], minGroup: 4, emoji: '🍽️', meaning: 'tabak' },
        { word: 'kaşık', syllables: ['ka', 'şık'], minGroup: 4, emoji: '🥄', meaning: 'kaşık' },
        { word: 'çatal', syllables: ['ça', 'tal'], minGroup: 4, emoji: '🍴', meaning: 'çatal' },
        { word: 'uçak', syllables: ['u', 'çak'], minGroup: 4, emoji: '✈️', meaning: 'uçak' },
        { word: 'kiraz', syllables: ['ki', 'raz'], minGroup: 4, emoji: '🍒', meaning: 'kiraz' },
        { word: 'armut', syllables: ['ar', 'mut'], minGroup: 2, emoji: '🍐', meaning: 'armut' },
        { word: 'karpuz', syllables: ['kar', 'puz'], minGroup: 5, emoji: '🍉', meaning: 'karpuz' },
        { word: 'havuç', syllables: ['ha', 'vuç'], minGroup: 5, emoji: '🥕', meaning: 'havuç' },
        { word: 'ekmek', syllables: ['ek', 'mek'], minGroup: 3, emoji: '🥖', meaning: 'ekmek' },
        { word: 'peynir', syllables: ['pey', 'nir'], minGroup: 5, emoji: '🧀', meaning: 'peynir' },
        { word: 'yıldız', syllables: ['yıl', 'dız'], minGroup: 4, emoji: '⭐', meaning: 'yıldız' },
        { word: 'saat', syllables: ['sa', 'at'], minGroup: 1, emoji: '⏰', meaning: 'saat' },
        { word: 'kitap', syllables: ['ki', 'tap'], minGroup: 3, emoji: '📕', meaning: 'kitap' },
        { word: 'davul', syllables: ['da', 'vul'], minGroup: 6, emoji: '🥁', meaning: 'davul' },
        { word: 'zeytin', syllables: ['zey', 'tin'], minGroup: 4, emoji: '🫒', meaning: 'zeytin' },
        { word: 'gözlük', syllables: ['göz', 'lük'], minGroup: 5, emoji: '👓', meaning: 'gözlük' },
        { word: 'terlik', syllables: ['ter', 'lik'], minGroup: 3, emoji: '🩴', meaning: 'terlik' },
        { word: 'bayrak', syllables: ['bay', 'rak'], minGroup: 4, emoji: '🇹🇷', meaning: 'bayrak' },
        { word: 'ceviz', syllables: ['ce', 'viz'], minGroup: 6, emoji: '🌰', meaning: 'ceviz' },
        { word: 'tarak', syllables: ['ta', 'rak'], minGroup: 3, emoji: '🪮', meaning: 'tarak' },
        { word: 'biber', syllables: ['bi', 'ber'], minGroup: 4, emoji: '🫑', meaning: 'biber' },

        // 3 Hece
        { word: 'salata', syllables: ['sa', 'la', 'ta'], minGroup: 3, emoji: '🥗', meaning: 'salata' },
        { word: 'yumurta', syllables: ['yu', 'mur', 'ta'], minGroup: 3, emoji: '🥚', meaning: 'yumurta' },
        { word: 'araba', syllables: ['a', 'ra', 'ba'], minGroup: 4, emoji: '🚗', meaning: 'araba' },
        { word: 'şemsiye', syllables: ['şem', 'si', 'ye'], minGroup: 4, emoji: '☂️', meaning: 'şemsiye' },
        { word: 'portakal', syllables: ['por', 'ta', 'kal'], minGroup: 5, emoji: '🍊', meaning: 'portakal' },
        { word: 'hediye', syllables: ['he', 'di', 'ye'], minGroup: 5, emoji: '🎁', meaning: 'hediye' },
        { word: 'bisiklet', syllables: ['bi', 'sik', 'let'], minGroup: 4, emoji: '🚲', meaning: 'bisiklet' },
        { word: 'otobüs', syllables: ['o', 'to', 'büs'], minGroup: 4, emoji: '🚌', meaning: 'otobüs' },
        { word: 'dondurma', syllables: ['don', 'dur', 'ma'], minGroup: 3, emoji: '🍦', meaning: 'dondurma' },
        { word: 'domates', syllables: ['do', 'ma', 'tes'], minGroup: 3, emoji: '🍅', meaning: 'domates' },
        { word: 'zürafa', syllables: ['zü', 'ra', 'fa'], minGroup: 6, emoji: '🦒', meaning: 'zürafa' },
        { word: 'kelebek', syllables: ['ke', 'le', 'bek'], minGroup: 4, emoji: '🦋', meaning: 'kelebek' },
        { word: 'çikolata', syllables: ['çi', 'ko', 'la', 'ta'], minGroup: 4, emoji: '🍫', meaning: 'çikolata' },
        { word: 'uçurtma', syllables: ['u', 'çurt', 'ma'], minGroup: 4, emoji: '🪁', meaning: 'uçurtma' }
    ];

    // ────────────────────────────────────────────
    // Cümle Veritabanı
    // ────────────────────────────────────────────
    const sentences = [
        { text: 'al elma', words: ['al', 'elma'], minGroup: 2 },
        { text: 'anne al', words: ['anne', 'al'], minGroup: 2 },
        { text: 'kedi su içer', words: ['kedi', 'su', 'içer'], minGroup: 3 },
        { text: 'anne elma yer', words: ['anne', 'elma', 'yer'], minGroup: 3 },
        { text: 'at su içer', words: ['at', 'su', 'içer'], minGroup: 3 },
        { text: 'kedi uyur', words: ['kedi', 'uyur'], minGroup: 3 },
        { text: 'inek su içer', words: ['inek', 'su', 'içer'], minGroup: 3 },
        { text: 'aslan uyur', words: ['aslan', 'uyur'], minGroup: 3 },
        { text: 'balık denizde yüzer', words: ['balık', 'denizde', 'yüzer'], minGroup: 4 },
        { text: 'bebek uyur', words: ['bebek', 'uyur'], minGroup: 4 },
        { text: 'araba yolda gider', words: ['araba', 'yolda', 'gider'], minGroup: 4 },
        { text: 'çiçek açar', words: ['çiçek', 'açar'], minGroup: 4 },
        { text: 'balon uçar', words: ['balon', 'uçar'], minGroup: 4 },
        { text: 'köpek havlar', words: ['köpek', 'havlar'], minGroup: 5 },
        { text: 'güneş doğar', words: ['güneş', 'doğar'], minGroup: 5 },
        { text: 'gemi yüzer', words: ['gemi', 'yüzer'], minGroup: 5 },
        { text: 'pasta çok güzel', words: ['pasta', 'çok', 'güzel'], minGroup: 5 },
        { text: 'fil çok büyük', words: ['fil', 'çok', 'büyük'], minGroup: 6 },
        { text: 'fare peynir yer', words: ['fare', 'peynir', 'yer'], minGroup: 6 },
        { text: 'ağaç çok yeşil', words: ['ağaç', 'çok', 'yeşil'], minGroup: 6 }
    ];

    // ────────────────────────────────────────────
    // Basit Hikayeler
    // ────────────────────────────────────────────
    const stories = [
        {
            title: 'Kedi ve Su',
            minGroup: 3,
            pages: [
                { text: 'Bir kedi var.', image: 'kedi' },
                { text: 'Kedi su ister.', image: 'su' },
                { text: 'Anne su verir.', image: 'anne' },
                { text: 'Kedi su içer.', image: 'kedi' },
                { text: 'Kedi mutlu!', image: 'kedi' }
            ]
        },
        {
            title: 'Arı ve Çiçek',
            minGroup: 4,
            pages: [
                { text: 'Bir arı var.', image: 'arı' },
                { text: 'Arı çiçek arar.', image: 'çiçek' },
                { text: 'Çiçek çok güzel.', image: 'çiçek' },
                { text: 'Arı çiçeğe konar.', image: 'arı' },
                { text: 'Arı mutlu!', image: 'arı' }
            ]
        },
        {
            title: 'Balık',
            minGroup: 4,
            pages: [
                { text: 'Bir balık var.', image: 'balık' },
                { text: 'Balık denizde.', image: 'deniz' },
                { text: 'Balık yüzer.', image: 'balık' },
                { text: 'Balık çok mutlu!', image: 'balık' }
            ]
        }
    ];

    // ────────────────────────────────────────────
    // Harf renk paleti (canlı, çocuk dostu)
    // ────────────────────────────────────────────
    const letterColors = [
        '#E53935', '#D81B60', '#8E24AA', '#5E35B1',
        '#3949AB', '#1E88E5', '#039BE5', '#00ACC1',
        '#00897B', '#43A047', '#7CB342', '#C0CA33',
        '#FDD835', '#FFB300', '#FB8C00', '#F4511E',
        '#6D4C41', '#546E7A', '#EC407A', '#AB47BC',
        '#7E57C2', '#5C6BC0', '#42A5F5', '#26C6DA',
        '#26A69A', '#66BB6A', '#9CCC65', '#D4E157',
        '#FFEE58', '#FFA726'
    ];

    // ────────────────────────────────────────────
    // Yardımcı Fonksiyonlar
    // ────────────────────────────────────────────

    function getAllLetters() {
        return alphabetLetters.slice();
    }

    function getAvailableLetters(maxGroup) {
        const letters = [];
        for (let g = 0; g < letterGroups.length && letterGroups[g].id <= maxGroup; g++) {
            letters.push(...letterGroups[g].letters);
        }
        return letters;
    }

    function getAvailableVowels(maxGroup) {
        const avail = getAvailableLetters(maxGroup);
        return vowels.filter(v => avail.includes(v));
    }

    function getAvailableConsonants(maxGroup) {
        const avail = getAvailableLetters(maxGroup);
        return consonants.filter(c => avail.includes(c));
    }

    function generateSyllables(maxGroup) {
        const availVowels = getAvailableVowels(maxGroup);
        const availConsonants = getAvailableConsonants(maxGroup);
        const syllables = [];

        // VC heceleri (el, al, il...)
        for (const v of availVowels) {
            for (const c of availConsonants) {
                syllables.push({ text: v + c, type: 'vc', vowel: v, consonant: c });
            }
        }

        // CV heceleri (le, la, li...)
        for (const c of availConsonants) {
            for (const v of availVowels) {
                syllables.push({ text: c + v, type: 'cv', vowel: v, consonant: c });
            }
        }

        return syllables;
    }

    function getAllWords() {
        return words.slice();
    }

    function getAvailableWords(maxGroup) {
        return words.filter(w => w.minGroup <= maxGroup);
    }

    function getAvailableSentences(maxGroup) {
        return sentences.filter(s => s.minGroup <= maxGroup);
    }

    function getAvailableStories(maxGroup) {
        return stories.filter(s => s.minGroup <= maxGroup);
    }

    function getLetterInfo(letter) {
        if (!letter) return null;
        return letterInfo[letter.toLowerCase()] || null;
    }

    function getLetterColor(letter) {
        const info = getLetterInfo(letter);
        return info ? info.color : '#4CAF50';
    }

    function getRandomColor() {
        return letterColors[Math.floor(Math.random() * letterColors.length)];
    }

    function getWordsWithLetters(letters) {
        return words.filter(w => {
            return w.word.split('').every(ch => letters.includes(ch));
        });
    }

    // ────────────────────────────────────────────
    // 1'den 30'a Kadar Sayılar (MEB Müfredatına Uygun)
    // ────────────────────────────────────────────
    const numberWords = [
        '', 'bir', 'iki', 'üç', 'dört', 'beş',
        'altı', 'yedi', 'sekiz', 'dokuz', 'on',
        'on bir', 'on iki', 'on üç', 'on dört', 'on beş',
        'on altı', 'on yedi', 'on sekiz', 'on dokuz', 'yirmi',
        'yirmi bir', 'yirmi iki', 'yirmi üç', 'yirmi dört', 'yirmi beş',
        'yirmi altı', 'yirmi yedi', 'yirmi sekiz', 'yirmi dokuz', 'otuz'
    ];

    const numberEmojis = ['🍎', '⭐', '🎈', '🍓', '🚗', '🐱', '🐥', '🌸', '🍭', '🦋'];

    const numberLevels = [
        { id: 1, name: '1-10', min: 1, max: 10, color: '#4CAF50', emoji: '🌱' },
        { id: 2, name: '11-20', min: 11, max: 20, color: '#2196F3', emoji: '🌊' },
        { id: 3, name: '21-30', min: 21, max: 30, color: '#FF9800', emoji: '🌞' },
        { id: 4, name: '1-30', min: 1, max: 30, color: '#9C27B0', emoji: '⭐' }
    ];

    function getNumbers(level) {
        var min = 1, max = 30;
        if (level === 1) { min = 1; max = 10; }
        else if (level === 2) { min = 11; max = 20; }
        else if (level === 3) { min = 21; max = 30; }
        else if (level === 4) { min = 1; max = 30; }
        
        var list = [];
        for (var i = min; i <= max; i++) {
            list.push({
                num: i,
                word: numberWords[i] || String(i),
                emoji: numberEmojis[(i - 1) % numberEmojis.length]
            });
        }
        return list;
    }

    // ────────────────────────────────────────────
    // Bölümler ve Oyunlar
    // ────────────────────────────────────────────
    const sections = [
        {
            id: 'letters',
            title: 'Sesleri Tanıyalım',
            subtitle: 'Harflerin seslerini öğren',
            icon: '🔤',
            color: '#4CAF50',
            bgGradient: 'linear-gradient(135deg, #66BB6A, #43A047)',
            games: [
                { id: 'letter-learn', title: 'Harfleri Öğrenelim', icon: '🔤', description: 'Harfleri tanı, sesini dinle ve örnek kelimeleri öğren!' },
                { id: 'balloon-pop', title: 'Ses Balonları', icon: '🎈', description: 'Balonlara dokun, harfleri duy!' },
                { id: 'letter-hunt', title: 'Harf Avı', icon: '🔍', description: 'Doğru harfi bul!' },
                { id: 'letter-paint', title: 'Harf Boyama', icon: '🎨', description: 'Harfleri boya!' },
                { id: 'letter-match', title: 'Harf Eşleştirme', icon: '🃏', description: 'Aynı harfleri bul!' },
                { id: 'letter-sort', title: 'Harf Sıralama', icon: '🎯', description: 'Harfleri sıraya diz!' }
            ]
        },
        {
            id: 'syllables',
            title: 'Heceleri Öğrenelim',
            subtitle: 'Harfleri birleştir, hece oluştur',
            icon: '📝',
            color: '#2196F3',
            bgGradient: 'linear-gradient(135deg, #42A5F5, #1E88E5)',
            games: [
                { id: 'syllable-train', title: 'Hece Treni', icon: '🚂', description: 'Harfleri birleştir, hece oluştur!' },
                { id: 'syllable-match', title: 'Hece Eşleştirme', icon: '🃏', description: 'Aynı heceleri bul!' },
                { id: 'syllable-pop', title: 'Hece Baloncukları', icon: '🫧', description: 'Doğru heceyi bul!' },
                { id: 'syllable-box', title: 'Hece Kutusu', icon: '📦', description: 'Heceleri doğru kutuya koy!' }
            ]
        },
        {
            id: 'words',
            title: 'Kelime Oluşturalım',
            subtitle: 'Hecelerden kelime yap',
            icon: '📖',
            color: '#FF9800',
            bgGradient: 'linear-gradient(135deg, #FFA726, #FB8C00)',
            games: [
                { id: 'word-puzzle', title: 'Kelime Yapboz', icon: '🧩', description: 'Heceleri sırala, kelime oluştur!' },
                { id: 'word-match', title: 'Resim-Kelime', icon: '🖼️', description: 'Resmi kelimeyle eşleştir!' },
                { id: 'word-hunt', title: 'Kelime Avı', icon: '🏹', description: 'Doğru kelimeyi bul!' },
                { id: 'word-memory', title: 'Kelime Hafızası', icon: '🧠', description: 'Kelimeyi hatırla ve oluştur!' }
            ]
        },
        {
            id: 'numbers',
            title: 'Sayıları Öğrenelim',
            subtitle: '1\'den 30\'a kadar sayıları öğren',
            icon: '🔢',
            color: '#E91E63',
            bgGradient: 'linear-gradient(135deg, #EC407A, #C2185B)',
            games: [
                { id: 'number-learn', title: 'Sayıları Tanıyalım', icon: '🔢', description: '1-30 arası sayıları sesli ve nesneli öğren!' },
                { id: 'number-count', title: 'Say ve Bul', icon: '🍎', description: 'Nesneleri say ve doğru sayıyı seç!' },
                { id: 'number-order', title: 'Sayı Treni', icon: '🚂', description: 'Sayıları sıraya diz, eksik vagonu bul!' },
                { id: 'number-pop', title: 'Sayı Balonları', icon: '🎈', description: 'Hedef sayıyı dinle ve balonunu patlat!' }
            ]
        },
        {
            id: 'sentences',
            title: 'Cümle Okuyalım',
            subtitle: 'Kelimelerden cümle kur',
            icon: '💬',
            color: '#9C27B0',
            bgGradient: 'linear-gradient(135deg, #AB47BC, #8E24AA)',
            games: [
                { id: 'sentence-train', title: 'Cümle Treni', icon: '🚃', description: 'Kelimeleri sırala, cümle kur!' },
                { id: 'story-reader', title: 'Resimli Hikaye', icon: '📖', description: 'Hikaye oku, resimlerle eğlen!' }
            ]
        }
    ];

    // ────────────────────────────────────────────
    // Sıralı Öğrenme Adımları
    // ────────────────────────────────────────────
    const sequentialSteps = [
        { group: 1, section: 'letters', game: 'letter-learn', title: 'Harfleri Öğrenelim' },
        { group: 1, section: 'letters', game: 'balloon-pop', title: '1. Grup Sesleri (e, l, a, t)' },
        { group: 1, section: 'letters', game: 'letter-hunt', title: '1. Grup Harf Avı' },
        { group: 1, section: 'letters', game: 'letter-paint', title: '1. Grup Harf Boyama' },
        { group: 1, section: 'syllables', game: 'syllable-train', title: '1. Grup Heceleri' },
        { group: 2, section: 'letters', game: 'balloon-pop', title: '2. Grup Sesleri (i, n, o, r, m)' },
        { group: 2, section: 'letters', game: 'letter-hunt', title: '2. Grup Harf Avı' },
        { group: 2, section: 'syllables', game: 'syllable-train', title: '2. Grup Heceleri' },
        { group: 2, section: 'syllables', game: 'syllable-match', title: '2. Grup Hece Eşleştirme' },
        { group: 2, section: 'words', game: 'word-puzzle', title: '2. Grup Kelimeler' },
        { group: 3, section: 'letters', game: 'balloon-pop', title: '3. Grup Sesleri (u, k, ı, y, s, d)' },
        { group: 3, section: 'syllables', game: 'syllable-train', title: '3. Grup Heceleri' },
        { group: 3, section: 'words', game: 'word-puzzle', title: '3. Grup Kelimeler' },
        { group: 3, section: 'words', game: 'word-match', title: '3. Grup Resim-Kelime' },
        { group: 3, section: 'sentences', game: 'sentence-train', title: '3. Grup Cümleler' },
        { group: 4, section: 'letters', game: 'balloon-pop', title: '4. Grup Sesleri (ö, b, ü, ş, z, ç)' },
        { group: 4, section: 'words', game: 'word-puzzle', title: '4. Grup Kelimeler' },
        { group: 4, section: 'sentences', game: 'story-reader', title: '4. Grup Hikayeler' },
        { group: 5, section: 'letters', game: 'balloon-pop', title: '5. Grup Sesleri (g, c, p, h)' },
        { group: 5, section: 'words', game: 'word-hunt', title: '5. Grup Kelime Avı' },
        { group: 6, section: 'letters', game: 'balloon-pop', title: '6. Grup Sesleri (ğ, v, f, j)' },
        { group: 6, section: 'sentences', game: 'story-reader', title: 'Tüm Harfler - Hikayeler' }
    ];

    // ────────────────────────────────────────────
    // Public API
    // ────────────────────────────────────────────
    return {
        vowels: vowels,
        consonants: consonants,
        alphabetLetters: alphabetLetters,
        letterGroups: letterGroups,
        letterInfo: letterInfo,
        words: words,
        sentences: sentences,
        stories: stories,
        sections: sections,
        sequentialSteps: sequentialSteps,
        letterColors: letterColors,
        numberLevels: numberLevels,
        numberWords: numberWords,
        getNumbers: getNumbers,

        getAllLetters: getAllLetters,
        getAvailableLetters: getAvailableLetters,
        getAvailableVowels: getAvailableVowels,
        getAvailableConsonants: getAvailableConsonants,
        generateSyllables: generateSyllables,
        getAllWords: getAllWords,
        getAvailableWords: getAvailableWords,
        getAvailableSentences: getAvailableSentences,
        getAvailableStories: getAvailableStories,
        getLetterInfo: getLetterInfo,
        getLetterColor: getLetterColor,
        getRandomColor: getRandomColor,
        getWordsWithLetters: getWordsWithLetters
    };
})();
