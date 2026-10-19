/**
 * Türkçe Okuma Öğretici - Veri Modülü
 * MEB Ses Temelli Cümle Yöntemi'ne dayalı harf grupları,
 * zengin nesne/SVG görselleri, hece-nesne eşleşmeleri, kelime ve hikaye veritabanı.
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
    // Kelime -> SVG Dosya Adı Haritası (240+ Vektör Nesne)
    // ────────────────────────────────────────────
    const wordToImageSlug = {
        'ağaç': 'agac', 'ahtapot': 'ahtapot', 'alet': 'alet', 'ambulans': 'ambulans',
        'ananas': 'ananas', 'anne': 'anne', 'araba': 'araba', 'arı': 'ari',
        'armut': 'armut', 'aslan': 'aslan', 'astronot': 'astronot', 'at': 'at',
        'atlet': 'atlet', 'avokado': 'avokado', 'ay': 'ay', 'ayçiçeği': 'aycicegi',
        'ayı': 'ayi', 'bağ': 'bag', 'bal': 'bal', 'balık': 'balik',
        'balina': 'balina', 'balon': 'balon', 'bardak': 'bardak', 'baykuş': 'baykus',
        'bayrak': 'bayrak', 'bebek': 'bebek', 'biber': 'biber', 'bisiklet': 'bisiklet',
        'böcek': 'bocek', 'börek': 'borek', 'brokoli': 'brokoli', 'bulut': 'bulut',
        'buz': 'buz', 'çadır': 'cadir', 'cam': 'cam', 'canavar': 'canavar',
        'çanta': 'canta', 'çatal': 'catal', 'çay': 'cay', 'ceket': 'ceket',
        'ceviz': 'ceviz', 'çiçek': 'cicek', 'çikolata': 'cikolata', 'çilek': 'cilek',
        'civciv': 'civciv', 'çorap': 'corap', 'dağ': 'dag', 'dal': 'dal',
        'davul': 'davul', 'deniz': 'deniz', 'deve': 'deve', 'dinozor': 'dinozor',
        'dolma': 'dolma', 'domates': 'domates', 'dondurma': 'dondurma', 'dut': 'dut',
        'ejderha': 'ejderha', 'ekmek': 'ekmek', 'el': 'el', 'elbise': 'elbise',
        'eldiven': 'eldiven', 'elma': 'elma', 'elmas': 'elmas', 'eşek': 'esek',
        'et': 'et', 'ev': 'ev', 'fare': 'fare', 'fener': 'fener',
        'fil': 'fil', 'fırın': 'firin', 'flamingo': 'flamingo', 'flüt': 'flut',
        'fok': 'fok', 'gece': 'gece', 'gemi': 'gemi', 'geyik': 'geyik',
        'gitar': 'gitar', 'gökkuşağı': 'gokkusagi', 'göz': 'goz', 'gözlük': 'gozluk',
        'gül': 'gul', 'güneş': 'gunes', 'halı': 'hali', 'havlu': 'havlu',
        'havuç': 'havuc', 'hediye': 'hediye', 'helikopter': 'helikopter', 'horoz': 'horoz',
        'iglo': 'iglo', 'incir': 'incir', 'inek': 'inek', 'ip': 'ip',
        'ırmak': 'irmak', 'ışık': 'isik', 'ıspanak': 'ispanak', 'itfaiye': 'itfaiye',
        'ızgara': 'izgara', 'jaguar': 'jaguar', 'jant': 'jant', 'jelibon': 'jelibon',
        'jeton': 'jeton', 'jip': 'jip', 'kale': 'kale', 'kalem': 'kalem',
        'kamyon': 'kamyon', 'kanguru': 'kanguru', 'kapı': 'kapi', 'kaplan': 'kaplan',
        'kaplumbağa': 'kaplumbaga', 'karınca': 'karinca', 'karpuz': 'karpuz', 'kartal': 'kartal',
        'kaşık': 'kasik', 'kayık': 'kayik', 'kedi': 'kedi', 'kelebek': 'kelebek',
        'keman': 'keman', 'kiraz': 'kiraz', 'kirpi': 'kirpi', 'kitap': 'kitap',
        'koala': 'koala', 'köpek': 'kopek', 'korsan': 'korsan', 'kuğu': 'kugu',
        'kum': 'kum', 'küp': 'kup', 'kurbağa': 'kurbaga', 'kurt': 'kurt',
        'kuş': 'kus', 'kutu': 'kutu', 'kuzu': 'kuzu', 'lale': 'lale',
        'lamba': 'lamba', 'limon': 'limon', 'lokum': 'lokum', 'madalya': 'madalya',
        'makas': 'makas', 'mantar': 'mantar', 'manto': 'manto', 'masa': 'masa',
        'maymun': 'maymun', 'mektup': 'mektup', 'mikrofon': 'mikrofon', 'mısır': 'misir',
        'muz': 'muz', 'nane': 'nane', 'nar': 'nar', 'nine': 'nine',
        'nota': 'nota', 'okul': 'okul', 'öküz': 'okuz', 'on': 'on',
        'önlük': 'onluk', 'ördek': 'ordek', 'orman': 'orman', 'örümcek': 'orumcek',
        'otobüs': 'otobus', 'oyuncak': 'oyuncak', 'palyaço': 'palyaco', 'panda': 'panda',
        'papağan': 'papagan', 'pasta': 'pasta', 'patates': 'patates', 'paten': 'paten',
        'penguen': 'penguen', 'peri': 'peri', 'peynir': 'peynir', 'piyano': 'piyano',
        'pizza': 'pizza', 'polis': 'polis', 'portakal': 'portakal', 'pusula': 'pusula',
        'radyo': 'radyo', 'rakun': 'rakun', 'resim': 'resim', 'robot': 'robot',
        'roket': 'roket', 'roman': 'kitap', 'saat': 'saat', 'sabun': 'sabun',
        'salata': 'salata', 'salyangoz': 'salyangoz', 'sandviç': 'sandvic', 'şapka': 'sapka',
        'saray': 'saray', 'şeftali': 'seftali', 'şeker': 'seker', 'şemsiye': 'semsiye',
        'simit': 'simit', 'şimşek': 'simsek', 'sincap': 'sincap', 'sirk': 'sirk',
        'su': 'su', 'suaygırı': 'suaygiri', 'süpürge': 'supurge', 'süt': 'sut',
        'tabak': 'tabak', 'taç': 'tac', 'tahta': 'tahta', 'tarak': 'tarak',
        'tavşan': 'tavsan', 'tekboynuz': 'tekboynuz', 'tel': 'tel', 'telefon': 'telefon',
        'teleskop': 'teleskop', 'terlik': 'terlik', 'tilki': 'tilki', 'timsah': 'timsah',
        'tırtıl': 'tirtil', 'top': 'top', 'traktör': 'traktor', 'tren': 'tren',
        'trompet': 'trompet', 'uçak': 'ucak', 'üçgen': 'ucgen', 'uçurtma': 'ucurtma',
        'uğurböceği': 'ugurbocegi', 'un': 'un', 'ütü': 'utu', 'uzaylı': 'uzayli',
        'üzüm': 'uzum', 'vagon': 'vagon', 'valiz': 'valiz', 'vapur': 'vapur',
        'vazo': 'vazo', 'vişne': 'visne', 'volkan': 'volkan', 'yağmur': 'yagmur',
        'yaprak': 'yaprak', 'yengeç': 'yengec', 'yılan': 'yilan', 'yıldız': 'yildiz',
        'yol': 'yol', 'yumurta': 'yumurta', 'yunus': 'yunus', 'yüzük': 'yuzuk',
        'zar': 'zar', 'zebra': 'zebra', 'zeytin': 'zeytin', 'zil': 'zil',
        'zürafa': 'zurafa'
    };

    function getObjectImageUrl(wordOrSlug) {
        if (!wordOrSlug) return null;
        var lower = String(wordOrSlug).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().trim();
        var slug = wordToImageSlug[lower] || lower
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
        return 'assets/images/objects/' + slug + '.svg';
    }

    // ────────────────────────────────────────────
    // Her Harf İçin Zenginleştirilmiş Detaylı Bilgi (6'şar Eğlenceli Örnek Nesne)
    // ────────────────────────────────────────────
    const letterInfo = {
        'a': { 
            upper: 'A', sound: 'a', group: 1, isVowel: true, word: 'aslan', wordMeaning: 'aslan', color: '#E53935',
            examples: [
                { word: 'aslan', emoji: '🦁', image: 'assets/images/objects/aslan.svg' },
                { word: 'ahtapot', emoji: '🐙', image: 'assets/images/objects/ahtapot.svg' },
                { word: 'araba', emoji: '🚗', image: 'assets/images/objects/araba.svg' },
                { word: 'astronot', emoji: '👨‍🚀', image: 'assets/images/objects/astronot.svg' },
                { word: 'ananas', emoji: '🍍', image: 'assets/images/objects/ananas.svg' },
                { word: 'arı', emoji: '🐝', image: 'assets/images/objects/ari.svg' },
                { word: 'ayı', emoji: '🐻', image: 'assets/images/objects/ayi.svg' },
                { word: 'at', emoji: '🐴', image: 'assets/images/objects/at.svg' }
            ]
        },
        'b': { 
            upper: 'B', sound: 'be', group: 4, isVowel: false, word: 'balina', wordMeaning: 'balina', color: '#8E24AA',
            examples: [
                { word: 'balina', emoji: '🐋', image: 'assets/images/objects/balina.svg' },
                { word: 'baykuş', emoji: '🦉', image: 'assets/images/objects/baykus.svg' },
                { word: 'bisiklet', emoji: '🚲', image: 'assets/images/objects/bisiklet.svg' },
                { word: 'balon', emoji: '🎈', image: 'assets/images/objects/balon.svg' },
                { word: 'balık', emoji: '🐟', image: 'assets/images/objects/balik.svg' },
                { word: 'bebek', emoji: '👶', image: 'assets/images/objects/bebek.svg' }
            ]
        },
        'c': { 
            upper: 'C', sound: 'ce', group: 5, isVowel: false, word: 'civciv', wordMeaning: 'civciv', color: '#D32F2F',
            examples: [
                { word: 'civciv', emoji: '🐥', image: 'assets/images/objects/civciv.svg' },
                { word: 'canavar', emoji: '👾', image: 'assets/images/objects/canavar.svg' },
                { word: 'ceviz', emoji: '🌰', image: 'assets/images/objects/ceviz.svg' },
                { word: 'ceket', emoji: '🧥', image: 'assets/images/objects/ceket.svg' },
                { word: 'cam', emoji: '🪟', image: 'assets/images/objects/cam.svg' }
            ]
        },
        'ç': { 
            upper: 'Ç', sound: 'çe', group: 4, isVowel: false, word: 'çilek', wordMeaning: 'çilek', color: '#C2185B',
            examples: [
                { word: 'çilek', emoji: '🍓', image: 'assets/images/objects/cilek.svg' },
                { word: 'çikolata', emoji: '🍫', image: 'assets/images/objects/cikolata.svg' },
                { word: 'çiçek', emoji: '🌸', image: 'assets/images/objects/cicek.svg' },
                { word: 'çadır', emoji: '⛺', image: 'assets/images/objects/cadir.svg' },
                { word: 'çanta', emoji: '👜', image: 'assets/images/objects/canta.svg' },
                { word: 'çorap', emoji: '🧦', image: 'assets/images/objects/corap.svg' }
            ]
        },
        'd': { 
            upper: 'D', sound: 'de', group: 3, isVowel: false, word: 'dinozor', wordMeaning: 'dinozor', color: '#F57C00',
            examples: [
                { word: 'dinozor', emoji: '🦖', image: 'assets/images/objects/dinozor.svg' },
                { word: 'dondurma', emoji: '🍦', image: 'assets/images/objects/dondurma.svg' },
                { word: 'davul', emoji: '🥁', image: 'assets/images/objects/davul.svg' },
                { word: 'deve', emoji: '🐪', image: 'assets/images/objects/deve.svg' },
                { word: 'deniz', emoji: '🌊', image: 'assets/images/objects/deniz.svg' },
                { word: 'domates', emoji: '🍅', image: 'assets/images/objects/domates.svg' }
            ]
        },
        'e': { 
            upper: 'E', sound: 'e', group: 1, isVowel: true, word: 'ejderha', wordMeaning: 'ejderha', color: '#43A047',
            examples: [
                { word: 'ejderha', emoji: '🐉', image: 'assets/images/objects/ejderha.svg' },
                { word: 'elma', emoji: '🍎', image: 'assets/images/objects/elma.svg' },
                { word: 'elmas', emoji: '💎', image: 'assets/images/objects/elmas.svg' },
                { word: 'elbise', emoji: '👗', image: 'assets/images/objects/elbise.svg' },
                { word: 'ev', emoji: '🏠', image: 'assets/images/objects/ev.svg' },
                { word: 'ekmek', emoji: '🥖', image: 'assets/images/objects/ekmek.svg' }
            ]
        },
        'f': { 
            upper: 'F', sound: 'fe', group: 6, isVowel: false, word: 'fil', wordMeaning: 'fil', color: '#546E7A',
            examples: [
                { word: 'fil', emoji: '🐘', image: 'assets/images/objects/fil.svg' },
                { word: 'flamingo', emoji: '🦩', image: 'assets/images/objects/flamingo.svg' },
                { word: 'fener', emoji: '🏮', image: 'assets/images/objects/fener.svg' },
                { word: 'fok', emoji: '🦭', image: 'assets/images/objects/fok.svg' },
                { word: 'fare', emoji: '🐭', image: 'assets/images/objects/fare.svg' },
                { word: 'fırın', emoji: '🍞', image: 'assets/images/objects/firin.svg' }
            ]
        },
        'g': { 
            upper: 'G', sound: 'ge', group: 5, isVowel: false, word: 'gitar', wordMeaning: 'gitar', color: '#E91E63',
            examples: [
                { word: 'gitar', emoji: '🎸', image: 'assets/images/objects/gitar.svg' },
                { word: 'gökkuşağı', emoji: '🌈', image: 'assets/images/objects/gokkusagi.svg' },
                { word: 'gemi', emoji: '🚢', image: 'assets/images/objects/gemi.svg' },
                { word: 'geyik', emoji: '🦌', image: 'assets/images/objects/geyik.svg' },
                { word: 'güneş', emoji: '☀️', image: 'assets/images/objects/gunes.svg' },
                { word: 'gözlük', emoji: '👓', image: 'assets/images/objects/gozluk.svg' }
            ]
        },
        'ğ': { 
            upper: 'Ğ', sound: 'yumuşak ge', group: 6, isVowel: false, word: 'ağaç', wordMeaning: 'ağaç', color: '#78909C',
            examples: [
                { word: 'ağaç', emoji: '🌳', image: 'assets/images/objects/agac.svg' },
                { word: 'kurbağa', emoji: '🐸', image: 'assets/images/objects/kurbaga.svg' },
                { word: 'kaplumbağa', emoji: '🐢', image: 'assets/images/objects/kaplumbaga.svg' },
                { word: 'kuğu', emoji: '🦢', image: 'assets/images/objects/kugu.svg' },
                { word: 'yağmur', emoji: '🌧️', image: 'assets/images/objects/yagmur.svg' },
                { word: 'dağ', emoji: '⛰️', image: 'assets/images/objects/dag.svg' }
            ]
        },
        'h': { 
            upper: 'H', sound: 'he', group: 5, isVowel: false, word: 'helikopter', wordMeaning: 'helikopter', color: '#EF5350',
            examples: [
                { word: 'helikopter', emoji: '🚁', image: 'assets/images/objects/helikopter.svg' },
                { word: 'hediye', emoji: '🎁', image: 'assets/images/objects/hediye.svg' },
                { word: 'horoz', emoji: '🐓', image: 'assets/images/objects/horoz.svg' },
                { word: 'havuç', emoji: '🥕', image: 'assets/images/objects/havuc.svg' },
                { word: 'halı', emoji: '🧶', image: 'assets/images/objects/hali.svg' },
                { word: 'havlu', emoji: '🛁', image: 'assets/images/objects/havlu.svg' }
            ]
        },
        'ı': { 
            upper: 'I', sound: 'ı', group: 3, isVowel: true, word: 'ışık', wordMeaning: 'ışık', color: '#FF7043',
            examples: [
                { word: 'ışık', emoji: '💡', image: 'assets/images/objects/isik.svg' },
                { word: 'ırmak', emoji: '🏞️', image: 'assets/images/objects/irmak.svg' },
                { word: 'ıspanak', emoji: '🥬', image: 'assets/images/objects/ispanak.svg' },
                { word: 'ızgara', emoji: '🍳', image: 'assets/images/objects/izgara.svg' }
            ]
        },
        'i': { 
            upper: 'İ', sound: 'i', group: 2, isVowel: true, word: 'itfaiye', wordMeaning: 'itfaiye', color: '#1E88E5',
            examples: [
                { word: 'itfaiye', emoji: '🚒', image: 'assets/images/objects/itfaiye.svg' },
                { word: 'inek', emoji: '🐄', image: 'assets/images/objects/inek.svg' },
                { word: 'iglo', emoji: '🛖', image: 'assets/images/objects/iglo.svg' },
                { word: 'incir', emoji: '🫐', image: 'assets/images/objects/incir.svg' },
                { word: 'ip', emoji: '🪢', image: 'assets/images/objects/ip.svg' }
            ]
        },
        'j': { 
            upper: 'J', sound: 'je', group: 6, isVowel: false, word: 'jaguar', wordMeaning: 'jaguar', color: '#455A64',
            examples: [
                { word: 'jaguar', emoji: '🐆', image: 'assets/images/objects/jaguar.svg' },
                { word: 'jip', emoji: '🚙', image: 'assets/images/objects/jip.svg' },
                { word: 'jelibon', emoji: '🍬', image: 'assets/images/objects/jelibon.svg' },
                { word: 'jeton', emoji: '🪙', image: 'assets/images/objects/jeton.svg' },
                { word: 'jant', emoji: '🛞', image: 'assets/images/objects/jant.svg' }
            ]
        },
        'k': { 
            upper: 'K', sound: 'ke', group: 3, isVowel: false, word: 'kelebek', wordMeaning: 'kelebek', color: '#FB8C00',
            examples: [
                { word: 'kelebek', emoji: '🦋', image: 'assets/images/objects/kelebek.svg' },
                { word: 'koala', emoji: '🐨', image: 'assets/images/objects/koala.svg' },
                { word: 'kanguru', emoji: '🦘', image: 'assets/images/objects/kanguru.svg' },
                { word: 'kaplumbağa', emoji: '🐢', image: 'assets/images/objects/kaplumbaga.svg' },
                { word: 'kedi', emoji: '🐱', image: 'assets/images/objects/kedi.svg' },
                { word: 'köpek', emoji: '🐕', image: 'assets/images/objects/kopek.svg' },
                { word: 'karpuz', emoji: '🍉', image: 'assets/images/objects/karpuz.svg' }
            ]
        },
        'l': { 
            upper: 'L', sound: 'le', group: 1, isVowel: false, word: 'limon', wordMeaning: 'limon', color: '#66BB6A',
            examples: [
                { word: 'limon', emoji: '🍋', image: 'assets/images/objects/limon.svg' },
                { word: 'lale', emoji: '🌷', image: 'assets/images/objects/lale.svg' },
                { word: 'lokum', emoji: '🍭', image: 'assets/images/objects/lokum.svg' },
                { word: 'lamba', emoji: '🏮', image: 'assets/images/objects/lamba.svg' }
            ]
        },
        'm': { 
            upper: 'M', sound: 'me', group: 2, isVowel: false, word: 'maymun', wordMeaning: 'maymun', color: '#42A5F5',
            examples: [
                { word: 'maymun', emoji: '🐵', image: 'assets/images/objects/maymun.svg' },
                { word: 'mantar', emoji: '🍄', image: 'assets/images/objects/mantar.svg' },
                { word: 'mikrofon', emoji: '🎤', image: 'assets/images/objects/mikrofon.svg' },
                { word: 'muz', emoji: '🍌', image: 'assets/images/objects/muz.svg' },
                { word: 'mısır', emoji: '🌽', image: 'assets/images/objects/misir.svg' },
                { word: 'madalya', emoji: '🏅', image: 'assets/images/objects/madalya.svg' }
            ]
        },
        'n': { 
            upper: 'N', sound: 'ne', group: 2, isVowel: false, word: 'nar', wordMeaning: 'nar', color: '#29B6F6',
            examples: [
                { word: 'nar', emoji: '🍎', image: 'assets/images/objects/nar.svg' },
                { word: 'nota', emoji: '🎵', image: 'assets/images/objects/nota.svg' },
                { word: 'nane', emoji: '🌿', image: 'assets/images/objects/nane.svg' },
                { word: 'nine', emoji: '👵', image: 'assets/images/objects/nine.svg' }
            ]
        },
        'o': { 
            upper: 'O', sound: 'o', group: 2, isVowel: true, word: 'otobüs', wordMeaning: 'otobüs', color: '#26A69A',
            examples: [
                { word: 'otobüs', emoji: '🚌', image: 'assets/images/objects/otobus.svg' },
                { word: 'oyuncak', emoji: '🧸', image: 'assets/images/objects/oyuncak.svg' },
                { word: 'orman', emoji: '🌲', image: 'assets/images/objects/orman.svg' },
                { word: 'okul', emoji: '🏫', image: 'assets/images/objects/okul.svg' },
                { word: 'on', emoji: '🔟', image: 'assets/images/objects/on.svg' }
            ]
        },
        'ö': { 
            upper: 'Ö', sound: 'ö', group: 4, isVowel: true, word: 'ördek', wordMeaning: 'ördek', color: '#AB47BC',
            examples: [
                { word: 'ördek', emoji: '🦆', image: 'assets/images/objects/ordek.svg' },
                { word: 'örümcek', emoji: '🕷️', image: 'assets/images/objects/orumcek.svg' },
                { word: 'önlük', emoji: '🥼', image: 'assets/images/objects/onluk.svg' },
                { word: 'öküz', emoji: '🐂', image: 'assets/images/objects/okuz.svg' }
            ]
        },
        'p': { 
            upper: 'P', sound: 'pe', group: 5, isVowel: false, word: 'panda', wordMeaning: 'panda', color: '#EC407A',
            examples: [
                { word: 'panda', emoji: '🐼', image: 'assets/images/objects/panda.svg' },
                { word: 'penguen', emoji: '🐧', image: 'assets/images/objects/penguen.svg' },
                { word: 'papağan', emoji: '🦜', image: 'assets/images/objects/papagan.svg' },
                { word: 'pizza', emoji: '🍕', image: 'assets/images/objects/pizza.svg' },
                { word: 'pasta', emoji: '🎂', image: 'assets/images/objects/pasta.svg' },
                { word: 'piyano', emoji: '🎹', image: 'assets/images/objects/piyano.svg' },
                { word: 'palyaço', emoji: '🤡', image: 'assets/images/objects/palyaco.svg' }
            ]
        },
        'r': { 
            upper: 'R', sound: 're', group: 2, isVowel: false, word: 'roket', wordMeaning: 'roket', color: '#5C6BC0',
            examples: [
                { word: 'roket', emoji: '🚀', image: 'assets/images/objects/roket.svg' },
                { word: 'robot', emoji: '🤖', image: 'assets/images/objects/robot.svg' },
                { word: 'rakun', emoji: '🦝', image: 'assets/images/objects/rakun.svg' },
                { word: 'resim', emoji: '🎨', image: 'assets/images/objects/resim.svg' },
                { word: 'radyo', emoji: '📻', image: 'assets/images/objects/radyo.svg' }
            ]
        },
        's': { 
            upper: 'S', sound: 'se', group: 3, isVowel: false, word: 'sincap', wordMeaning: 'sincap', color: '#FFA726',
            examples: [
                { word: 'sincap', emoji: '🐿️', image: 'assets/images/objects/sincap.svg' },
                { word: 'salyangoz', emoji: '🐌', image: 'assets/images/objects/salyangoz.svg' },
                { word: 'sirk', emoji: '🎪', image: 'assets/images/objects/sirk.svg' },
                { word: 'saat', emoji: '⏰', image: 'assets/images/objects/saat.svg' },
                { word: 'simit', emoji: '🥯', image: 'assets/images/objects/simit.svg' },
                { word: 'suaygırı', emoji: '🦛', image: 'assets/images/objects/suaygiri.svg' }
            ]
        },
        'ş': { 
            upper: 'Ş', sound: 'şe', group: 4, isVowel: false, word: 'şemsiye', wordMeaning: 'şemsiye', color: '#7E57C2',
            examples: [
                { word: 'şemsiye', emoji: '☂️', image: 'assets/images/objects/semsiye.svg' },
                { word: 'şapka', emoji: '🧢', image: 'assets/images/objects/sapka.svg' },
                { word: 'şeker', emoji: '🍬', image: 'assets/images/objects/seker.svg' },
                { word: 'şimşek', emoji: '⚡', image: 'assets/images/objects/simsek.svg' },
                { word: 'şeftali', emoji: '🍑', image: 'assets/images/objects/seftali.svg' }
            ]
        },
        't': { 
            upper: 'T', sound: 'te', group: 1, isVowel: false, word: 'tekboynuz', wordMeaning: 'tekboynuz', color: '#2E7D32',
            examples: [
                { word: 'tren', emoji: '🚂', image: 'assets/images/objects/tren.svg' },
                { word: 'tavşan', emoji: '🐰', image: 'assets/images/objects/tavsan.svg' },
                { word: 'traktör', emoji: '🚜', image: 'assets/images/objects/traktor.svg' },
                { word: 'timsah', emoji: '🐊', image: 'assets/images/objects/timsah.svg' },
                { word: 'tilki', emoji: '🦊', image: 'assets/images/objects/tilki.svg' },
                { word: 'taç', emoji: '👑', image: 'assets/images/objects/tac.svg' },
                { word: 'top', emoji: '⚽', image: 'assets/images/objects/top.svg' }
            ]
        },
        'u': { 
            upper: 'U', sound: 'u', group: 3, isVowel: true, word: 'uçurtma', wordMeaning: 'uçurtma', color: '#EF6C00',
            examples: [
                { word: 'uçurtma', emoji: '🪁', image: 'assets/images/objects/ucurtma.svg' },
                { word: 'uçak', emoji: '✈️', image: 'assets/images/objects/ucak.svg' },
                { word: 'uğurböceği', emoji: '🐞', image: 'assets/images/objects/ugurbocegi.svg' },
                { word: 'uzaylı', emoji: '👽', image: 'assets/images/objects/uzayli.svg' },
                { word: 'un', emoji: '🌾', image: 'assets/images/objects/un.svg' }
            ]
        },
        'ü': { 
            upper: 'Ü', sound: 'ü', group: 4, isVowel: true, word: 'üzüm', wordMeaning: 'üzüm', color: '#6A1B9A',
            examples: [
                { word: 'üzüm', emoji: '🍇', image: 'assets/images/objects/uzum.svg' },
                { word: 'üçgen', emoji: '📐', image: 'assets/images/objects/ucgen.svg' },
                { word: 'ütü', emoji: '🔌', image: 'assets/images/objects/utu.svg' }
            ]
        },
        'v': { 
            upper: 'V', sound: 've', group: 6, isVowel: false, word: 'volkan', wordMeaning: 'volkan', color: '#37474F',
            examples: [
                { word: 'volkan', emoji: '🌋', image: 'assets/images/objects/volkan.svg' },
                { word: 'vapur', emoji: '⛴️', image: 'assets/images/objects/vapur.svg' },
                { word: 'vazo', emoji: '🏺', image: 'assets/images/objects/vazo.svg' },
                { word: 'vişne', emoji: '🍒', image: 'assets/images/objects/visne.svg' },
                { word: 'valiz', emoji: '🧳', image: 'assets/images/objects/valiz.svg' },
                { word: 'vagon', emoji: '🚃', image: 'assets/images/objects/vagon.svg' }
            ]
        },
        'y': { 
            upper: 'Y', sound: 'ye', group: 3, isVowel: false, word: 'yunus', wordMeaning: 'yunus', color: '#F9A825',
            examples: [
                { word: 'yunus', emoji: '🐬', image: 'assets/images/objects/yunus.svg' },
                { word: 'yıldız', emoji: '⭐', image: 'assets/images/objects/yildiz.svg' },
                { word: 'yengeç', emoji: '🦀', image: 'assets/images/objects/yengec.svg' },
                { word: 'yılan', emoji: '🐍', image: 'assets/images/objects/yilan.svg' },
                { word: 'yumurta', emoji: '🥚', image: 'assets/images/objects/yumurta.svg' },
                { word: 'yaprak', emoji: '🍁', image: 'assets/images/objects/yaprak.svg' }
            ]
        },
        'z': { 
            upper: 'Z', sound: 'ze', group: 4, isVowel: false, word: 'zürafa', wordMeaning: 'zürafa', color: '#4A148C',
            examples: [
                { word: 'zürafa', emoji: '🦒', image: 'assets/images/objects/zurafa.svg' },
                { word: 'zebra', emoji: '🦓', image: 'assets/images/objects/zebra.svg' },
                { word: 'zar', emoji: '🎲', image: 'assets/images/objects/zar.svg' },
                { word: 'zeytin', emoji: '🫒', image: 'assets/images/objects/zeytin.svg' },
                { word: 'zil', emoji: '🔔', image: 'assets/images/objects/zil.svg' }
            ]
        }
    };

    // ────────────────────────────────────────────
    // 165+ Zengin Kelime Veritabanı (SVG Görselli, Hecelerine Ayrılmış)
    // ────────────────────────────────────────────
    const rawWords = [
        // 1 Hece
        { word: 'el', syllables: ['el'], minGroup: 1, emoji: '👋' },
        { word: 'at', syllables: ['at'], minGroup: 1, emoji: '🐴' },
        { word: 'et', syllables: ['et'], minGroup: 1, emoji: '🥩' },
        { word: 'tel', syllables: ['tel'], minGroup: 1, emoji: '🧵' },
        { word: 'top', syllables: ['top'], minGroup: 1, emoji: '⚽' },
        { word: 'ev', syllables: ['ev'], minGroup: 1, emoji: '🏠' },
        { word: 'taç', syllables: ['taç'], minGroup: 1, emoji: '👑' },
        { word: 'nar', syllables: ['nar'], minGroup: 2, emoji: '🍎' },
        { word: 'on', syllables: ['on'], minGroup: 2, emoji: '🔟' },
        { word: 'tren', syllables: ['tren'], minGroup: 2, emoji: '🚂' },
        { word: 'muz', syllables: ['muz'], minGroup: 2, emoji: '🍌' },
        { word: 'ip', syllables: ['ip'], minGroup: 2, emoji: '🪢' },
        { word: 'su', syllables: ['su'], minGroup: 3, emoji: '💧' },
        { word: 'süt', syllables: ['süt'], minGroup: 3, emoji: '🥛' },
        { word: 'ay', syllables: ['ay'], minGroup: 3, emoji: '🌙' },
        { word: 'kuş', syllables: ['kuş'], minGroup: 3, emoji: '🐦' },
        { word: 'kurt', syllables: ['kurt'], minGroup: 3, emoji: '🐺' },
        { word: 'kum', syllables: ['kum'], minGroup: 3, emoji: '🏖️' },
        { word: 'küp', syllables: ['küp'], minGroup: 3, emoji: '🎲' },
        { word: 'dal', syllables: ['dal'], minGroup: 3, emoji: '🌿' },
        { word: 'yol', syllables: ['yol'], minGroup: 3, emoji: '🛤️' },
        { word: 'dut', syllables: ['dut'], minGroup: 3, emoji: '🫐' },
        { word: 'un', syllables: ['un'], minGroup: 3, emoji: '🌾' },
        { word: 'buz', syllables: ['buz'], minGroup: 4, emoji: '🧊' },
        { word: 'bal', syllables: ['bal'], minGroup: 4, emoji: '🍯' },
        { word: 'çay', syllables: ['çay'], minGroup: 4, emoji: '🍵' },
        { word: 'zil', syllables: ['zil'], minGroup: 4, emoji: '🔔' },
        { word: 'zar', syllables: ['zar'], minGroup: 4, emoji: '🎲' },
        { word: 'göz', syllables: ['göz'], minGroup: 5, emoji: '👁️' },
        { word: 'gül', syllables: ['gül'], minGroup: 5, emoji: '🌹' },
        { word: 'cam', syllables: ['cam'], minGroup: 5, emoji: '🪟' },
        { word: 'sirk', syllables: ['sirk'], minGroup: 5, emoji: '🎪' },
        { word: 'fil', syllables: ['fil'], minGroup: 6, emoji: '🐘' },
        { word: 'fok', syllables: ['fok'], minGroup: 6, emoji: '🦭' },
        { word: 'flüt', syllables: ['flüt'], minGroup: 6, emoji: '🎷' },
        { word: 'dağ', syllables: ['dağ'], minGroup: 6, emoji: '⛰️' },
        { word: 'bağ', syllables: ['bağ'], minGroup: 6, emoji: '🍇' },
        { word: 'jip', syllables: ['jip'], minGroup: 6, emoji: '🚙' },
        { word: 'jant', syllables: ['jant'], minGroup: 6, emoji: '🛞' },

        // 2 Hece
        { word: 'lale', syllables: ['la', 'le'], minGroup: 1, emoji: '🌷' },
        { word: 'alet', syllables: ['a', 'let'], minGroup: 1, emoji: '🔧' },
        { word: 'atlet', syllables: ['at', 'let'], minGroup: 1, emoji: '🎽' },
        { word: 'saat', syllables: ['sa', 'at'], minGroup: 1, emoji: '⏰' },
        { word: 'tahta', syllables: ['tah', 'ta'], minGroup: 1, emoji: '🪵' },
        { word: 'anne', syllables: ['an', 'ne'], minGroup: 2, emoji: '👩' },
        { word: 'nine', syllables: ['ni', 'ne'], minGroup: 2, emoji: '👵' },
        { word: 'elma', syllables: ['el', 'ma'], minGroup: 2, emoji: '🍎' },
        { word: 'orman', syllables: ['or', 'man'], minGroup: 2, emoji: '🌲' },
        { word: 'nane', syllables: ['na', 'ne'], minGroup: 2, emoji: '🌿' },
        { word: 'nota', syllables: ['no', 'ta'], minGroup: 2, emoji: '🎵' },
        { word: 'limon', syllables: ['li', 'mon'], minGroup: 2, emoji: '🍋' },
        { word: 'lamba', syllables: ['lam', 'ba'], minGroup: 2, emoji: '🏮' },
        { word: 'lokum', syllables: ['lo', 'kum'], minGroup: 2, emoji: '🍭' },
        { word: 'manto', syllables: ['man', 'to'], minGroup: 2, emoji: '🧥' },
        { word: 'maymun', syllables: ['may', 'mun'], minGroup: 2, emoji: '🐵' },
        { word: 'armut', syllables: ['ar', 'mut'], minGroup: 2, emoji: '🍐' },
        { word: 'roket', syllables: ['ro', 'ket'], minGroup: 2, emoji: '🚀' },
        { word: 'robot', syllables: ['ro', 'bot'], minGroup: 2, emoji: '🤖' },
        { word: 'resim', syllables: ['re', 'sim'], minGroup: 2, emoji: '🎨' },
        { word: 'radyo', syllables: ['rad', 'yo'], minGroup: 2, emoji: '📻' },
        { word: 'rakun', syllables: ['ra', 'kun'], minGroup: 2, emoji: '🦝' },
        { word: 'okul', syllables: ['o', 'kul'], minGroup: 2, emoji: '🏫' },
        { word: 'arı', syllables: ['a', 'rı'], minGroup: 3, emoji: '🐝' },
        { word: 'ayı', syllables: ['a', 'yı'], minGroup: 3, emoji: '🐻' },
        { word: 'aslan', syllables: ['as', 'lan'], minGroup: 3, emoji: '🦁' },
        { word: 'kedi', syllables: ['ke', 'di'], minGroup: 3, emoji: '🐱' },
        { word: 'kutu', syllables: ['ku', 'tu'], minGroup: 3, emoji: '📦' },
        { word: 'kuzu', syllables: ['ku', 'zu'], minGroup: 3, emoji: '🐑' },
        { word: 'kuğu', syllables: ['ku', 'ğu'], minGroup: 3, emoji: '🦢' },
        { word: 'masa', syllables: ['ma', 'sa'], minGroup: 3, emoji: '🪑' },
        { word: 'makas', syllables: ['ma', 'kas'], minGroup: 3, emoji: '✂️' },
        { word: 'mısır', syllables: ['mı', 'sır'], minGroup: 3, emoji: '🌽' },
        { word: 'mektup', syllables: ['mek', 'tup'], minGroup: 3, emoji: '✉️' },
        { word: 'yılan', syllables: ['yı', 'lan'], minGroup: 3, emoji: '🐍' },
        { word: 'yunus', syllables: ['yu', 'nus'], minGroup: 3, emoji: '🐬' },
        { word: 'yengeç', syllables: ['yen', 'geç'], minGroup: 3, emoji: '🦀' },
        { word: 'yaprak', syllables: ['yap', 'rak'], minGroup: 3, emoji: '🍁' },
        { word: 'yüzük', syllables: ['yü', 'zük'], minGroup: 3, emoji: '💍' },
        { word: 'kale', syllables: ['ka', 'le'], minGroup: 3, emoji: '🏰' },
        { word: 'kalem', syllables: ['ka', 'lem'], minGroup: 3, emoji: '✏️' },
        { word: 'kamyon', syllables: ['kam', 'yon'], minGroup: 3, emoji: '🚚' },
        { word: 'kaplan', syllables: ['kap', 'lan'], minGroup: 3, emoji: '🐯' },
        { word: 'kartal', syllables: ['kar', 'tal'], minGroup: 3, emoji: '🦅' },
        { word: 'keman', syllables: ['ke', 'man'], minGroup: 3, emoji: '🎻' },
        { word: 'kirpi', syllables: ['kir', 'pi'], minGroup: 3, emoji: '🦔' },
        { word: 'kitap', syllables: ['ki', 'tap'], minGroup: 3, emoji: '📕' },
        { word: 'korsan', syllables: ['kor', 'san'], minGroup: 3, emoji: '🏴‍☠️' },
        { word: 'inek', syllables: ['i', 'nek'], minGroup: 3, emoji: '🐄' },
        { word: 'incir', syllables: ['in', 'cir'], minGroup: 3, emoji: '🫐' },
        { word: 'iglo', syllables: ['ig', 'lo'], minGroup: 3, emoji: '🛖' },
        { word: 'ırmak', syllables: ['ır', 'mak'], minGroup: 3, emoji: '🏞️' },
        { word: 'ışık', syllables: ['ı', 'şık'], minGroup: 3, emoji: '💡' },
        { word: 'simit', syllables: ['si', 'mit'], minGroup: 3, emoji: '🥯' },
        { word: 'saray', syllables: ['sa', 'ray'], minGroup: 3, emoji: '🏯' },
        { word: 'kayık', syllables: ['ka', 'yık'], minGroup: 3, emoji: '⛵' },
        { word: 'dolma', syllables: ['dol', 'ma'], minGroup: 3, emoji: '🥘' },
        { word: 'deve', syllables: ['de', 've'], minGroup: 3, emoji: '🐪' },
        { word: 'mantar', syllables: ['man', 'tar'], minGroup: 3, emoji: '🍄' },
        { word: 'ekmek', syllables: ['ek', 'mek'], minGroup: 3, emoji: '🥖' },
        { word: 'elmas', syllables: ['el', 'mas'], minGroup: 3, emoji: '💎' },
        { word: 'eşek', syllables: ['e', 'şek'], minGroup: 3, emoji: '🐴' },
        { word: 'terlik', syllables: ['ter', 'lik'], minGroup: 3, emoji: '🩴' },
        { word: 'tarak', syllables: ['ta', 'rak'], minGroup: 3, emoji: '🪮' },
        { word: 'tilki', syllables: ['til', 'ki'], minGroup: 3, emoji: '🦊' },
        { word: 'timsah', syllables: ['tim', 'sah'], minGroup: 3, emoji: '🐊' },
        { word: 'tırtıl', syllables: ['tır', 'tıl'], minGroup: 3, emoji: '🐛' },
        { word: 'traktör', syllables: ['trak', 'tör'], minGroup: 3, emoji: '🚜' },
        { word: 'trompet', syllables: ['trom', 'pet'], minGroup: 3, emoji: '🎺' },
        { word: 'balık', syllables: ['ba', 'lık'], minGroup: 4, emoji: '🐟' },
        { word: 'balon', syllables: ['ba', 'lon'], minGroup: 4, emoji: '🎈' },
        { word: 'baykuş', syllables: ['bay', 'kuş'], minGroup: 4, emoji: '🦉' },
        { word: 'bayrak', syllables: ['bay', 'rak'], minGroup: 4, emoji: '🇹🇷' },
        { word: 'bebek', syllables: ['be', 'bek'], minGroup: 4, emoji: '👶' },
        { word: 'biber', syllables: ['bi', 'ber'], minGroup: 4, emoji: '🫑' },
        { word: 'böcek', syllables: ['bö', 'cek'], minGroup: 4, emoji: '🐛' },
        { word: 'börek', syllables: ['bö', 'rek'], minGroup: 4, emoji: '🥟' },
        { word: 'bulut', syllables: ['bu', 'lut'], minGroup: 4, emoji: '☁️' },
        { word: 'bardak', syllables: ['bar', 'dak'], minGroup: 4, emoji: '🥤' },
        { word: 'çiçek', syllables: ['çi', 'çek'], minGroup: 4, emoji: '🌸' },
        { word: 'çilek', syllables: ['çi', 'lek'], minGroup: 4, emoji: '🍓' },
        { word: 'çanta', syllables: ['çan', 'ta'], minGroup: 4, emoji: '👜' },
        { word: 'çadır', syllables: ['ça', 'dır'], minGroup: 4, emoji: '⛺' },
        { word: 'çatal', syllables: ['ça', 'tal'], minGroup: 4, emoji: '🍴' },
        { word: 'çorap', syllables: ['ço', 'rap'], minGroup: 4, emoji: '🧦' },
        { word: 'şeker', syllables: ['şe', 'ker'], minGroup: 4, emoji: '🍬' },
        { word: 'şapka', syllables: ['şap', 'ka'], minGroup: 4, emoji: '🧢' },
        { word: 'şimşek', syllables: ['şim', 'şek'], minGroup: 4, emoji: '⚡' },
        { word: 'üzüm', syllables: ['ü', 'züm'], minGroup: 4, emoji: '🍇' },
        { word: 'üçgen', syllables: ['üç', 'gen'], minGroup: 4, emoji: '📐' },
        { word: 'ütü', syllables: ['ü', 'tü'], minGroup: 4, emoji: '🔌' },
        { word: 'deniz', syllables: ['de', 'niz'], minGroup: 4, emoji: '🌊' },
        { word: 'ördek', syllables: ['ör', 'dek'], minGroup: 4, emoji: '🦆' },
        { word: 'öküz', syllables: ['ö', 'küz'], minGroup: 4, emoji: '🐂' },
        { word: 'önlük', syllables: ['ön', 'lük'], minGroup: 4, emoji: '🥼' },
        { word: 'tavşan', syllables: ['tav', 'şan'], minGroup: 4, emoji: '🐰' },
        { word: 'sabun', syllables: ['sa', 'bun'], minGroup: 4, emoji: '🧼' },
        { word: 'sandviç', syllables: ['sand', 'viç'], minGroup: 4, emoji: '🥪' },
        { word: 'tabak', syllables: ['ta', 'bak'], minGroup: 4, emoji: '🍽️' },
        { word: 'kaşık', syllables: ['ka', 'şık'], minGroup: 4, emoji: '🥄' },
        { word: 'uçak', syllables: ['u', 'çak'], minGroup: 4, emoji: '✈️' },
        { word: 'kiraz', syllables: ['ki', 'raz'], minGroup: 4, emoji: '🍒' },
        { word: 'yıldız', syllables: ['yıl', 'dız'], minGroup: 4, emoji: '⭐' },
        { word: 'yağmur', syllables: ['yağ', 'mur'], minGroup: 4, emoji: '🌧️' },
        { word: 'zeytin', syllables: ['zey', 'tin'], minGroup: 4, emoji: '🫒' },
        { word: 'zebra', syllables: ['zeb', 'ra'], minGroup: 4, emoji: '🦓' },
        { word: 'pasta', syllables: ['pas', 'ta'], minGroup: 5, emoji: '🎂' },
        { word: 'panda', syllables: ['pan', 'da'], minGroup: 5, emoji: '🐼' },
        { word: 'pizza', syllables: ['piz', 'za'], minGroup: 5, emoji: '🍕' },
        { word: 'peynir', syllables: ['pey', 'nir'], minGroup: 5, emoji: '🧀' },
        { word: 'paten', syllables: ['pa', 'ten'], minGroup: 5, emoji: '🛼' },
        { word: 'peri', syllables: ['pe', 'ri'], minGroup: 5, emoji: '🧚' },
        { word: 'polis', syllables: ['po', 'lis'], minGroup: 5, emoji: '🚓' },
        { word: 'gemi', syllables: ['ge', 'mi'], minGroup: 5, emoji: '🚢' },
        { word: 'gitar', syllables: ['gi', 'tar'], minGroup: 5, emoji: '🎸' },
        { word: 'geyik', syllables: ['ge', 'yik'], minGroup: 5, emoji: '🦌' },
        { word: 'güneş', syllables: ['gü', 'neş'], minGroup: 5, emoji: '☀️' },
        { word: 'gece', syllables: ['ge', 'ce'], minGroup: 5, emoji: '🌃' },
        { word: 'gözlük', syllables: ['göz', 'lük'], minGroup: 5, emoji: '👓' },
        { word: 'köpek', syllables: ['kö', 'pek'], minGroup: 5, emoji: '🐕' },
        { word: 'sincap', syllables: ['sin', 'cap'], minGroup: 5, emoji: '🐿️' },
        { word: 'civciv', syllables: ['civ', 'civ'], minGroup: 5, emoji: '🐥' },
        { word: 'ceket', syllables: ['ce', 'ket'], minGroup: 5, emoji: '🧥' },
        { word: 'kapı', syllables: ['ka', 'pı'], minGroup: 5, emoji: '🚪' },
        { word: 'halı', syllables: ['ha', 'lı'], minGroup: 5, emoji: '🧶' },
        { word: 'havlu', syllables: ['hav', 'lu'], minGroup: 5, emoji: '🛁' },
        { word: 'havuç', syllables: ['ha', 'vuç'], minGroup: 5, emoji: '🥕' },
        { word: 'horoz', syllables: ['ho', 'roz'], minGroup: 5, emoji: '🐓' },
        { word: 'karpuz', syllables: ['kar', 'puz'], minGroup: 5, emoji: '🍉' },
        { word: 'fare', syllables: ['fa', 're'], minGroup: 6, emoji: '🐭' },
        { word: 'fener', syllables: ['fe', 'ner'], minGroup: 6, emoji: '🏮' },
        { word: 'fırın', syllables: ['fı', 'rın'], minGroup: 6, emoji: '🍞' },
        { word: 'vazo', syllables: ['va', 'zo'], minGroup: 6, emoji: '🏺' },
        { word: 'vagon', syllables: ['va', 'gon'], minGroup: 6, emoji: '🚃' },
        { word: 'valiz', syllables: ['va', 'liz'], minGroup: 6, emoji: '🧳' },
        { word: 'vapur', syllables: ['va', 'pur'], minGroup: 6, emoji: '⛴️' },
        { word: 'vişne', syllables: ['viş', 'ne'], minGroup: 6, emoji: '🍒' },
        { word: 'volkan', syllables: ['vol', 'kan'], minGroup: 6, emoji: '🌋' },
        { word: 'ağaç', syllables: ['a', 'ğaç'], minGroup: 6, emoji: '🌳' },
        { word: 'davul', syllables: ['da', 'vul'], minGroup: 6, emoji: '🥁' },
        { word: 'ceviz', syllables: ['ce', 'viz'], minGroup: 6, emoji: '🌰' },
        { word: 'jeton', syllables: ['je', 'ton'], minGroup: 6, emoji: '🪙' },

        // 3 ve 4 Heceli Eğlenceli Kelimeler
        { word: 'salata', syllables: ['sa', 'la', 'ta'], minGroup: 3, emoji: '🥗' },
        { word: 'yumurta', syllables: ['yu', 'mur', 'ta'], minGroup: 3, emoji: '🥚' },
        { word: 'dondurma', syllables: ['don', 'dur', 'ma'], minGroup: 3, emoji: '🍦' },
        { word: 'domates', syllables: ['do', 'ma', 'tes'], minGroup: 3, emoji: '🍅' },
        { word: 'dinozor', syllables: ['di', 'no', 'zor'], minGroup: 3, emoji: '🦖' },
        { word: 'ahtapot', syllables: ['ah', 'ta', 'pot'], minGroup: 3, emoji: '🐙' },
        { word: 'ananas', syllables: ['a', 'na', 'nas'], minGroup: 3, emoji: '🍍' },
        { word: 'astronot', syllables: ['as', 'tro', 'not'], minGroup: 3, emoji: '👨‍🚀' },
        { word: 'karınca', syllables: ['ka', 'rın', 'ca'], minGroup: 3, emoji: '🐜' },
        { word: 'koala', syllables: ['ko', 'a', 'la'], minGroup: 3, emoji: '🐨' },
        { word: 'kanguru', syllables: ['kan', 'gu', 'ru'], minGroup: 3, emoji: '🦘' },
        { word: 'mikrofon', syllables: ['mik', 'ro', 'fon'], minGroup: 3, emoji: '🎤' },
        { word: 'madalya', syllables: ['ma', 'dal', 'ya'], minGroup: 3, emoji: '🏅' },
        { word: 'oyuncak', syllables: ['o', 'yun', 'cak'], minGroup: 3, emoji: '🧸' },
        { word: 'ıspanak', syllables: ['ıs', 'pa', 'nak'], minGroup: 3, emoji: '🥬' },
        { word: 'ızgara', syllables: ['ız', 'ga', 'ra'], minGroup: 3, emoji: '🍳' },
        { word: 'salyangoz', syllables: ['sal', 'yan', 'goz'], minGroup: 3, emoji: '🐌' },
        { word: 'teleskop', syllables: ['te', 'les', 'kop'], minGroup: 3, emoji: '🔭' },
        { word: 'telefon', syllables: ['te', 'le', 'fon'], minGroup: 3, emoji: '☎️' },
        { word: 'tekboynuz', syllables: ['tek', 'boy', 'nuz'], minGroup: 3, emoji: '🦄' },
        { word: 'araba', syllables: ['a', 'ra', 'ba'], minGroup: 4, emoji: '🚗' },
        { word: 'ambulans', syllables: ['am', 'bu', 'lans'], minGroup: 4, emoji: '🚑' },
        { word: 'balina', syllables: ['ba', 'li', 'na'], minGroup: 4, emoji: '🐋' },
        { word: 'brokoli', syllables: ['bro', 'ko', 'li'], minGroup: 4, emoji: '🥦' },
        { word: 'bisiklet', syllables: ['bi', 'sik', 'let'], minGroup: 4, emoji: '🚲' },
        { word: 'otobüs', syllables: ['o', 'to', 'büs'], minGroup: 4, emoji: '🚌' },
        { word: 'örümcek', syllables: ['ö', 'rüm', 'cek'], minGroup: 4, emoji: '🕷️' },
        { word: 'şemsiye', syllables: ['şem', 'si', 'ye'], minGroup: 4, emoji: '☂️' },
        { word: 'şeftali', syllables: ['şef', 'ta', 'li'], minGroup: 4, emoji: '🍑' },
        { word: 'kelebek', syllables: ['ke', 'le', 'bek'], minGroup: 4, emoji: '🦋' },
        { word: 'uçurtma', syllables: ['u', 'çurt', 'ma'], minGroup: 4, emoji: '🪁' },
        { word: 'uzaylı', syllables: ['u', 'zay', 'lı'], minGroup: 4, emoji: '👽' },
        { word: 'elbise', syllables: ['el', 'bi', 'se'], minGroup: 4, emoji: '👗' },
        { word: 'eldiven', syllables: ['el', 'di', 'ven'], minGroup: 4, emoji: '🧤' },
        { word: 'ejderha', syllables: ['ej', 'der', 'ha'], minGroup: 4, emoji: '🐉' },
        { word: 'süpürge', syllables: ['sü', 'pür', 'ge'], minGroup: 4, emoji: '🧹' },
        { word: 'portakal', syllables: ['por', 'ta', 'kal'], minGroup: 5, emoji: '🍊' },
        { word: 'penguen', syllables: ['pen', 'gu', 'en'], minGroup: 5, emoji: '🐧' },
        { word: 'papağan', syllables: ['pa', 'pa', 'ğan'], minGroup: 5, emoji: '🦜' },
        { word: 'palyaço', syllables: ['pal', 'ya', 'ço'], minGroup: 5, emoji: '🤡' },
        { word: 'patates', syllables: ['pa', 'ta', 'tes'], minGroup: 5, emoji: '🍟' },
        { word: 'piyano', syllables: ['pi', 'ya', 'no'], minGroup: 5, emoji: '🎹' },
        { word: 'pusula', syllables: ['pu', 'su', 'la'], minGroup: 5, emoji: '🧭' },
        { word: 'hediye', syllables: ['he', 'di', 'ye'], minGroup: 5, emoji: '🎁' },
        { word: 'canavar', syllables: ['ca', 'na', 'var'], minGroup: 5, emoji: '👾' },
        { word: 'kurbağa', syllables: ['kur', 'ba', 'ğa'], minGroup: 6, emoji: '🐸' },
        { word: 'zürafa', syllables: ['zü', 'ra', 'fa'], minGroup: 6, emoji: '🦒' },
        { word: 'flamingo', syllables: ['fla', 'min', 'go'], minGroup: 6, emoji: '🦩' },
        { word: 'jaguar', syllables: ['ja', 'gu', 'ar'], minGroup: 6, emoji: '🐆' },
        { word: 'jelibon', syllables: ['je', 'li', 'bon'], minGroup: 6, emoji: '🍬' },
        { word: 'itfaiye', syllables: ['it', 'fa', 'i', 'ye'], minGroup: 6, emoji: '🚒' },
        { word: 'avokado', syllables: ['a', 'vo', 'ka', 'do'], minGroup: 6, emoji: '🥑' },
        { word: 'çikolata', syllables: ['çi', 'ko', 'la', 'ta'], minGroup: 4, emoji: '🍫' },
        { word: 'helikopter', syllables: ['he', 'li', 'kop', 'ter'], minGroup: 5, emoji: '🚁' },
        { word: 'kaplumbağa', syllables: ['kap', 'lum', 'ba', 'ğa'], minGroup: 6, emoji: '🐢' },
        { word: 'gökkuşağı', syllables: ['gök', 'ku', 'şa', 'ğı'], minGroup: 6, emoji: '🌈' },
        { word: 'ayçiçeği', syllables: ['ay', 'çi', 'çe', 'ği'], minGroup: 6, emoji: '🌻' },
        { word: 'suaygırı', syllables: ['su', 'ay', 'gı', 'rı'], minGroup: 6, emoji: '🦛' },
        { word: 'uğurböceği', syllables: ['u', 'ğur', 'bö', 'ce', 'ği'], minGroup: 6, emoji: '🐞' }
    ];

    const words = rawWords.map(function (w) {
        var imgUrl = getObjectImageUrl(w.word);
        return {
            word: w.word,
            syllables: w.syllables,
            minGroup: w.minGroup,
            emoji: w.emoji,
            meaning: w.word,
            image: imgUrl,
            asset: imgUrl
        };
    });

    // ────────────────────────────────────────────
    // Hece -> Eğlenceli Nesne Eşleştirme Sistemi
    // Her hece için çocuğun görsel olarak bağ kurabileceği sevimli nesneler
    // ────────────────────────────────────────────
    function getSyllableVisual(syllableText) {
        if (!syllableText) return { word: 'yıldız', emoji: '⭐', image: getObjectImageUrl('yıldız') };
        var syl = String(syllableText).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().trim();

        // 1. Önce hecesi birebir eşleşen kelimeleri bul (örn: 'ba' -> 'balina', 'balık', 'balon')
        var exactMatches = words.filter(function (w) {
            return w.syllables && w.syllables.indexOf(syl) !== -1;
        });

        // 2. Yoksa o heceyle başlayan kelimeleri bul (örn: 'ka' -> 'kaplan', 'kale', 'karpuz')
        if (exactMatches.length === 0) {
            exactMatches = words.filter(function (w) {
                return w.word.indexOf(syl) === 0;
            });
        }

        // 3. Yoksa içinde o hece geçen kelimeleri bul (örn: 'el' -> 'elma', 'kelebek', 'kalem')
        if (exactMatches.length === 0) {
            exactMatches = words.filter(function (w) {
                return w.word.indexOf(syl) !== -1;
            });
        }

        // 4. Hala yoksa hecenin ilk ünsüzü veya ilk harfi ile başlayan eğlenceli bir nesne seç
        if (exactMatches.length === 0) {
            var firstChar = syl.charAt(0);
            var secondChar = syl.charAt(1) || firstChar;
            var targetChar = consonants.indexOf(firstChar) !== -1 ? firstChar : secondChar;
            var lInfo = letterInfo[targetChar] || letterInfo[firstChar];
            if (lInfo && lInfo.examples && lInfo.examples.length > 0) {
                exactMatches = lInfo.examples.map(function (ex) {
                    return {
                        word: ex.word,
                        emoji: ex.emoji,
                        image: ex.image || getObjectImageUrl(ex.word)
                    };
                });
            }
        }

        if (exactMatches.length > 0) {
            var picked = pickUniqueItems('syl_vis_' + syl, exactMatches, 1)[0];
            var imgUrl = picked.image || getObjectImageUrl(picked.word);
            return {
                word: picked.word,
                emoji: picked.emoji,
                image: imgUrl,
                asset: imgUrl
            };
        }

        var defaultImg = getObjectImageUrl('yıldız');
        return { word: 'yıldız', emoji: '⭐', image: defaultImg, asset: defaultImg };
    }

    // ────────────────────────────────────────────
    // Tekrarsız Rastgele Seçici (Round-Robin Deste)
    // Aynı kelimenin/harfin/hecenin üst üste gelmesini %100 engeller
    // ────────────────────────────────────────────
    var _decks = {};
    function shuffleArray(arr) {
        var copy = arr.slice();
        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    function pickUniqueItems(deckKey, sourceArray, count) {
        if (!sourceArray || sourceArray.length === 0) return [];
        count = count || 1;
        if (!_decks[deckKey] || _decks[deckKey].length < count) {
            _decks[deckKey] = shuffleArray(sourceArray);
        }
        var result = [];
        for (var i = 0; i < count && _decks[deckKey].length > 0; i++) {
            result.push(_decks[deckKey].pop());
        }
        return result;
    }

    // ────────────────────────────────────────────
    // Cümle Veritabanı (Görsel Destekli)
    // ────────────────────────────────────────────
    const rawSentences = [
        { text: 'ela lale al', words: ['ela', 'lale', 'al'], minGroup: 1, emoji: '🌷', obj: 'lale' },
        { text: 'ata ot at', words: ['ata', 'ot', 'at'], minGroup: 1, emoji: '🐴', obj: 'at' },
        { text: 'ali topu tut', words: ['ali', 'topu', 'tut'], minGroup: 1, emoji: '⚽', obj: 'top' },
        { text: 'anne elma al', words: ['anne', 'elma', 'al'], minGroup: 2, emoji: '🍎', obj: 'elma' },
        { text: 'nine limon al', words: ['nine', 'limon', 'al'], minGroup: 2, emoji: '🍋', obj: 'limon' },
        { text: 'maymun muz yer', words: ['maymun', 'muz', 'yer'], minGroup: 2, emoji: '🐵', obj: 'maymun' },
        { text: 'roket aya uçtu', words: ['roket', 'aya', 'uçtu'], minGroup: 2, emoji: '🚀', obj: 'roket' },
        { text: 'kedi süt içer', words: ['kedi', 'süt', 'içer'], minGroup: 3, emoji: '🐱', obj: 'kedi' },
        { text: 'inek su içer', words: ['inek', 'su', 'içer'], minGroup: 3, emoji: '🐄', obj: 'inek' },
        { text: 'aslan ormanda uyur', words: ['aslan', 'ormanda', 'uyur'], minGroup: 3, emoji: '🦁', obj: 'aslan' },
        { text: 'yunus denizde yüzer', words: ['yunus', 'denizde', 'yüzer'], minGroup: 3, emoji: '🐬', obj: 'yunus' },
        { text: 'dinozor çok büyük', words: ['dinozor', 'çok', 'büyük'], minGroup: 3, emoji: '🦖', obj: 'dinozor' },
        { text: 'tavşan havuç yer', words: ['tavşan', 'havuç', 'yer'], minGroup: 4, emoji: '🐰', obj: 'tavşan' },
        { text: 'balık denizde yüzer', words: ['balık', 'denizde', 'yüzer'], minGroup: 4, emoji: '🐟', obj: 'balık' },
        { text: 'kelebek çiçeğe konar', words: ['kelebek', 'çiçeğe', 'konar'], minGroup: 4, emoji: '🦋', obj: 'kelebek' },
        { text: 'araba yolda gider', words: ['araba', 'yolda', 'gider'], minGroup: 4, emoji: '🚗', obj: 'araba' },
        { text: 'ördek suda yüzer', words: ['ördek', 'suda', 'yüzer'], minGroup: 4, emoji: '🦆', obj: 'ördek' },
        { text: 'renkli balon uçar', words: ['renkli', 'balon', 'uçar'], minGroup: 4, emoji: '🎈', obj: 'balon' },
        { text: 'köpek neşeyle koşar', words: ['köpek', 'neşeyle', 'koşar'], minGroup: 5, emoji: '🐕', obj: 'köpek' },
        { text: 'parlak güneş doğar', words: ['parlak', 'güneş', 'doğar'], minGroup: 5, emoji: '☀️', obj: 'güneş' },
        { text: 'panda bambu sever', words: ['panda', 'bambu', 'sever'], minGroup: 5, emoji: '🐼', obj: 'panda' },
        { text: 'penguen buzda kayar', words: ['penguen', 'buzda', 'kayar'], minGroup: 5, emoji: '🐧', obj: 'penguen' },
        { text: 'pasta çok lezzetli', words: ['pasta', 'çok', 'lezzetli'], minGroup: 5, emoji: '🎂', obj: 'pasta' },
        { text: 'fil hortumuyla su atar', words: ['fil', 'su', 'atar'], minGroup: 6, emoji: '🐘', obj: 'fil' },
        { text: 'fare peynir yer', words: ['fare', 'peynir', 'yer'], minGroup: 6, emoji: '🐭', obj: 'fare' },
        { text: 'zürafa yaprak yer', words: ['zürafa', 'yaprak', 'yer'], minGroup: 6, emoji: '🦒', obj: 'zürafa' },
        { text: 'kurbağa suya zıplar', words: ['kurbağa', 'suya', 'zıplar'], minGroup: 6, emoji: '🐸', obj: 'kurbağa' }
    ];

    const sentences = rawSentences.map(function (s) {
        var url = getObjectImageUrl(s.obj);
        return {
            text: s.text,
            words: s.words,
            minGroup: s.minGroup,
            emoji: s.emoji,
            image: url,
            asset: url
        };
    });

    // ────────────────────────────────────────────
    // Resimli ve Etkileşimli Çocuk Hikayeleri (6 Zengin Hikaye)
    // ────────────────────────────────────────────
    const rawStories = [
        {
            title: 'Sevimli Kedi Pamuk 🐱',
            minGroup: 1,
            icon: '🐱',
            pages: [
                { text: 'Bir minik kedi var.', image: 'kedi', emoji: '🐱' },
                { text: 'Kedi top ile oynar.', image: 'top', emoji: '⚽' },
                { text: 'Kedi çok susadı.', image: 'su', emoji: '💧' },
                { text: 'Anne kediye süt verdi.', image: 'süt', emoji: '🥛' },
                { text: 'Pamuk sütü içti, çok mutlu!', image: 'kedi', emoji: '🐱' }
            ]
        },
        {
            title: 'Uzay Yolculuğu 🚀',
            minGroup: 1,
            icon: '🚀',
            pages: [
                { text: 'Astronot rokete bindi.', image: 'astronot', emoji: '👨‍🚀' },
                { text: 'Roket gökyüzüne uçtu!', image: 'roket', emoji: '🚀' },
                { text: 'Parlak yıldızları gördü.', image: 'yıldız', emoji: '⭐' },
                { text: 'Aya el salladı.', image: 'ay', emoji: '🌙' },
                { text: 'Sevimli robot ona gülümsedi!', image: 'robot', emoji: '🤖' }
            ]
        },
        {
            title: 'Minik Dinozor Dino 🦖',
            minGroup: 1,
            icon: '🦖',
            pages: [
                { text: 'Ormanda minik bir dinozor var.', image: 'dinozor', emoji: '🦖' },
                { text: 'Dino kırmızı elma buldu.', image: 'elma', emoji: '🍎' },
                { text: 'Arkadaşı tavşan da geldi.', image: 'tavşan', emoji: '🐰' },
                { text: 'Tavşan tatlı havuç yedi.', image: 'havuç', emoji: '🥕' },
                { text: 'Birlikte neşeyle zıpladılar!', image: 'dinozor', emoji: '🦖' }
            ]
        },
        {
            title: 'Arı Vızvız ve Çiçek 🐝',
            minGroup: 1,
            icon: '🐝',
            pages: [
                { text: 'Küçük arı sabah uyandı.', image: 'arı', emoji: '🐝' },
                { text: 'Güneş pırıl pırıl parlıyor.', image: 'güneş', emoji: '☀️' },
                { text: 'Arı pembe çiçeğe kondu.', image: 'çiçek', emoji: '🌸' },
                { text: 'Tatlı bal yaptı.', image: 'bal', emoji: '🍯' },
                { text: 'Kelebek ile dans etti!', image: 'kelebek', emoji: '🦋' }
            ]
        },
        {
            title: 'Neşeli Yunus ve Balina 🐬',
            minGroup: 1,
            icon: '🐬',
            pages: [
                { text: 'Mavi deniz çok güzel.', image: 'deniz', emoji: '🌊' },
                { text: 'Yunus dalgalarda zıplar.', image: 'yunus', emoji: '🐬' },
                { text: 'Dev balina şarkı söyler.', image: 'balina', emoji: '🐋' },
                { text: 'Sevimli ahtapot el sallar.', image: 'ahtapot', emoji: '🐙' },
                { text: 'Deniz altında bayram var!', image: 'balık', emoji: '🐟' }
            ]
        },
        {
            title: 'Aslan Kralın Doğum Günü 🦁',
            minGroup: 1,
            icon: '🦁',
            pages: [
                { text: 'Bugün aslanın doğum günü!', image: 'aslan', emoji: '🦁' },
                { text: 'Zürafa renkli balon getirdi.', image: 'zürafa', emoji: '🦒' },
                { text: 'Maymun gitar çaldı.', image: 'gitar', emoji: '🎸' },
                { text: 'Panda büyük pasta yaptı.', image: 'pasta', emoji: '🎂' },
                { text: 'Herkes hediyeleri açtı!', image: 'hediye', emoji: '🎁' }
            ]
        }
    ];

    const stories = rawStories.map(function (st) {
        return {
            title: st.title,
            minGroup: st.minGroup,
            icon: st.icon,
            pages: st.pages.map(function (p) {
                var url = getObjectImageUrl(p.image);
                return {
                    text: p.text,
                    emoji: p.emoji,
                    image: url,
                    asset: url
                };
            })
        };
    });

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
    // Sayma ve Sayı Oyunları İçin 40+ Farklı Eğlenceli Nesne Havuzu
    // ────────────────────────────────────────────
    const rawCountingObjects = [
        { word: 'dinozor', emoji: '🦖', image: getObjectImageUrl('dinozor'), plural: 'dinozor' },
        { word: 'roket', emoji: '🚀', image: getObjectImageUrl('roket'), plural: 'roket' },
        { word: 'kelebek', emoji: '🦋', image: getObjectImageUrl('kelebek'), plural: 'kelebek' },
        { word: 'çilek', emoji: '🍓', image: getObjectImageUrl('çilek'), plural: 'çilek' },
        { word: 'dondurma', emoji: '🍦', image: getObjectImageUrl('dondurma'), plural: 'dondurma' },
        { word: 'aslan', emoji: '🦁', image: getObjectImageUrl('aslan'), plural: 'aslan' },
        { word: 'yunus', emoji: '🐬', image: getObjectImageUrl('yunus'), plural: 'yunus' },
        { word: 'panda', emoji: '🐼', image: getObjectImageUrl('panda'), plural: 'panda' },
        { word: 'penguen', emoji: '🐧', image: getObjectImageUrl('penguen'), plural: 'penguen' },
        { word: 'uğurböceği', emoji: '🐞', image: getObjectImageUrl('uğurböceği'), plural: 'uğurböceği' },
        { word: 'tekboynuz', emoji: '🦄', image: getObjectImageUrl('tekboynuz'), plural: 'tekboynuz' },
        { word: 'helikopter', emoji: '🚁', image: getObjectImageUrl('helikopter'), plural: 'helikopter' },
        { word: 'pasta', emoji: '🎂', image: getObjectImageUrl('pasta'), plural: 'pasta' },
        { word: 'karpuz', emoji: '🍉', image: getObjectImageUrl('karpuz'), plural: 'karpuz' },
        { word: 'ananas', emoji: '🍍', image: getObjectImageUrl('ananas'), plural: 'ananas' },
        { word: 'araba', emoji: '🚗', image: getObjectImageUrl('araba'), plural: 'araba' },
        { word: 'balon', emoji: '🎈', image: getObjectImageUrl('balon'), plural: 'balon' },
        { word: 'yıldız', emoji: '⭐', image: getObjectImageUrl('yıldız'), plural: 'yıldız' },
        { word: 'elma', emoji: '🍎', image: getObjectImageUrl('elma'), plural: 'elma' },
        { word: 'kedi', emoji: '🐱', image: getObjectImageUrl('kedi'), plural: 'kedi' },
        { word: 'köpek', emoji: '🐕', image: getObjectImageUrl('köpek'), plural: 'köpek' },
        { word: 'tavşan', emoji: '🐰', image: getObjectImageUrl('tavşan'), plural: 'tavşan' },
        { word: 'kurbağa', emoji: '🐸', image: getObjectImageUrl('kurbağa'), plural: 'kurbağa' },
        { word: 'ahtapot', emoji: '🐙', image: getObjectImageUrl('ahtapot'), plural: 'ahtapot' },
        { word: 'ejderha', emoji: '🐉', image: getObjectImageUrl('ejderha'), plural: 'ejderha' },
        { word: 'robot', emoji: '🤖', image: getObjectImageUrl('robot'), plural: 'robot' },
        { word: 'uçurtma', emoji: '🪁', image: getObjectImageUrl('uçurtma'), plural: 'uçurtma' },
        { word: 'kaplumbağa', emoji: '🐢', image: getObjectImageUrl('kaplumbağa'), plural: 'kaplumbağa' },
        { word: 'civciv', emoji: '🐥', image: getObjectImageUrl('civciv'), plural: 'civciv' },
        { word: 'papağan', emoji: '🦜', image: getObjectImageUrl('papağan'), plural: 'papağan' },
        { word: 'koala', emoji: '🐨', image: getObjectImageUrl('koala'), plural: 'koala' },
        { word: 'pizza', emoji: '🍕', image: getObjectImageUrl('pizza'), plural: 'pizza' },
        { word: 'hediye', emoji: '🎁', image: getObjectImageUrl('hediye'), plural: 'hediye' },
        { word: 'taç', emoji: '👑', image: getObjectImageUrl('taç'), plural: 'taç' }
    ];

    const countingObjects = rawCountingObjects.map(function (c) {
        return {
            word: c.word,
            name: c.word,
            emoji: c.emoji,
            image: c.image,
            asset: c.image,
            plural: c.plural
        };
    });

    function getRandomCountingObject() {
        return pickUniqueItems('counting_objects', countingObjects, 1)[0];
    }

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
        // En az 2. grup çeşitliliği sağla ki tek tip heceler tekrar etmesin
        const effectiveGroup = Math.max(maxGroup || 1, 2);
        const availVowels = getAvailableVowels(effectiveGroup);
        const availConsonants = getAvailableConsonants(effectiveGroup);
        const syllables = [];

        // VC heceleri (el, al, il...)
        for (const v of availVowels) {
            for (const c of availConsonants) {
                var txtVc = v + c;
                var visVc = getSyllableVisual(txtVc);
                syllables.push({
                    text: txtVc,
                    letters: [v, c],
                    type: 'vc',
                    vowel: v,
                    consonant: c,
                    word: visVc.word,
                    emoji: visVc.emoji,
                    image: visVc.image
                });
            }
        }

        // CV heceleri (le, la, li...)
        for (const c of availConsonants) {
            for (const v of availVowels) {
                var txtCv = c + v;
                var visCv = getSyllableVisual(txtCv);
                syllables.push({
                    text: txtCv,
                    letters: [c, v],
                    type: 'cv',
                    vowel: v,
                    consonant: c,
                    word: visCv.word,
                    emoji: visCv.emoji,
                    image: visCv.image
                });
            }
        }

        return syllables;
    }

    function getAllWords() {
        return words.slice();
    }

    function getAvailableWords(maxGroup) {
        var filtered = words.filter(w => w.minGroup <= Math.max(maxGroup || 1, 3));
        return filtered.length >= 12 ? filtered : words.slice();
    }

    function getAvailableSentences(maxGroup) {
        var filtered = sentences.filter(s => s.minGroup <= Math.max(maxGroup || 1, 4));
        return filtered.length >= 6 ? filtered : sentences.slice();
    }

    function getAvailableStories(maxGroup) {
        return stories.slice();
    }

    function getLetterInfo(letter) {
        if (!letter) return null;
        var key = String(letter).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
        return letterInfo[key] || null;
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
    // 1'den 30'a Kadar Sayılar (MEB Müfredatına Uygun + Zengin Nesneli)
    // ────────────────────────────────────────────
    const numberWords = [
        '', 'bir', 'iki', 'üç', 'dört', 'beş',
        'altı', 'yedi', 'sekiz', 'dokuz', 'on',
        'on bir', 'on iki', 'on üç', 'on dört', 'on beş',
        'on altı', 'on yedi', 'on sekiz', 'on dokuz', 'yirmi',
        'yirmi bir', 'yirmi iki', 'yirmi üç', 'yirmi dört', 'yirmi beş',
        'yirmi altı', 'yirmi yedi', 'yirmi sekiz', 'yirmi dokuz', 'otuz'
    ];

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
            var obj = countingObjects[(i - 1) % countingObjects.length];
            list.push({
                num: i,
                word: numberWords[i] || String(i),
                emoji: obj.emoji,
                image: obj.image,
                asset: obj.image,
                objectName: obj.word
            });
        }
        return list;
    }

    // ────────────────────────────────────────────
    // Bölümler ve Oyunlar
    // ────────────────────────────────────────────
    // Tüm verilerde hem image hem asset alanlarının tanımlı olmasını garanti et
    Object.keys(letterInfo).forEach(function (k) {
        var inf = letterInfo[k];
        if (inf && inf.examples) {
            inf.examples.forEach(function (ex) {
                if (!ex.image) ex.image = getObjectImageUrl(ex.word);
                if (!ex.asset) ex.asset = ex.image;
            });
        }
    });
    words.forEach(function (w) { if (!w.asset) w.asset = w.image; });
    sentences.forEach(function (s) { if (!s.asset) s.asset = s.image; });
    stories.forEach(function (st) {
        if (st.pages) {
            st.pages.forEach(function (p) {
                if (!p.asset) p.asset = getObjectImageUrl(p.image || p.word);
            });
        }
    });
    countingObjects.forEach(function (co) {
        if (!co.asset) co.asset = co.image;
        if (!co.name) co.name = co.word.charAt(0).toUpperCase() + co.word.slice(1);
    });

    function getRandomLetterExample(letter) {
        var info = getLetterInfo(letter);
        if (info && info.examples && info.examples.length > 0) {
            return pickUniqueItems('letter_ex_' + letter, info.examples, 1)[0];
        }
        var fallbackUrl = getObjectImageUrl('yıldız');
        return { word: String(letter || 'a'), emoji: '⭐', image: fallbackUrl, asset: fallbackUrl };
    }

    const sections = [
        {
            id: 'letters',
            title: 'Sesleri Tanıyalım',
            subtitle: 'Harfleri, sesleri ve nesneleri keşfet',
            icon: '🔤',
            color: '#4CAF50',
            bgGradient: 'linear-gradient(135deg, #43A047, #1DE9B6)',
            games: [
                { id: 'letter-learn', title: 'Harfleri Öğrenelim', icon: '🔤', description: 'Harfleri tanı, 6 farklı hayvan ve nesneyle seslerini dinle!' },
                { id: 'first-letter', title: 'İlk Harfini Bul', icon: '🦁', description: 'Sevimli nesnenin hangi harfle başladığını bul!' },
                { id: 'balloon-pop', title: 'Ses Balonları', icon: '🎈', description: 'Balonları patlat, içinden çıkan sürpriz nesneleri ve harfleri gör!' },
                { id: 'letter-hunt', title: 'Harf Avı', icon: '🔍', description: 'Söylenen harfi ve sevimli resmini seçenekler arasından bul!' },
                { id: 'letter-paint', title: 'Harf Boyama', icon: '🎨', description: 'Harfleri gökkuşağı renkleriyle boya ve sürpriz karakteri aç!' },
                { id: 'letter-match', title: 'Harf Eşleştirme', icon: '🃏', description: 'Resimli harf kartlarını çevir ve eşlerini bul!' },
                { id: 'letter-sort', title: 'Harf Sıralama', icon: '🎯', description: 'Sevimli harfleri sıraya diz!' }
            ]
        },
        {
            id: 'syllables',
            title: 'Heceleri Öğrenelim',
            subtitle: 'Harfleri birleştir, hece ve nesne oluştur',
            icon: '🚂',
            color: '#2196F3',
            bgGradient: 'linear-gradient(135deg, #1E88E5, #00E5FF)',
            games: [
                { id: 'syllable-train', title: 'Hece Treni', icon: '🚂', description: 'Vagonları birleştir, heceyi ve sürpriz nesnesini oluştur!' },
                { id: 'syllable-wheel', title: 'Sihirli Hece Kazanı', icon: '🪄', description: 'Sihirli kazana harfleri at ve hece iksirini oluştur!' },
                { id: 'syllable-match', title: 'Hece Eşleştirme', icon: '🃏', description: 'Resimli hece kartlarını çevirerek eşleştir!' },
                { id: 'syllable-pop', title: 'Hece Baloncukları', icon: '🫧', description: 'Doğru hece baloncuğunu patlat, sürpriz resmi gör!' },
                { id: 'syllable-box', title: 'Hece Kutusu', icon: '📦', description: 'Düşen heceleri açık ve kapalı kutulara yerleştir!' }
            ]
        },
        {
            id: 'words',
            title: 'Kelime Oluşturalım',
            subtitle: 'Hecelerden eğlenceli kelimeler yap',
            icon: '🧩',
            color: '#FF9800',
            bgGradient: 'linear-gradient(135deg, #FF6D00, #FFD600)',
            games: [
                { id: 'word-puzzle', title: 'Kelime Yapboz', icon: '🧩', description: 'Renkli resme bak, heceleri birleştirip kelimeyi oluştur!' },
                { id: 'missing-syllable', title: 'Eksik Heceyi Bul', icon: '🦋', description: 'Kelimedeki saklanan heceyi seçenekler arasından bul!' },
                { id: 'word-match', title: 'Resim-Kelime', icon: '🖼️', description: 'Eğlenceli çizimleri doğru kelimelerle eşleştir!' },
                { id: 'word-hunt', title: 'Kelime Avı', icon: '🏹', description: 'Gösterilen sevimli nesnenin adını bul!' },
                { id: 'word-memory', title: 'Kelime Hafızası', icon: '🧠', description: 'Resmi ve kelimeyi aklında tut, hecelerden tekrar kur!' }
            ]
        },
        {
            id: 'numbers',
            title: 'Sayıları Öğrenelim',
            subtitle: '1\'den 30\'a kadar sayıları eğlenerek öğren',
            icon: '🔢',
            color: '#E91E63',
            bgGradient: 'linear-gradient(135deg, #EC407A, #FF8A65)',
            games: [
                { id: 'number-learn', title: 'Sayıları Tanıyalım', icon: '🔢', description: '1-30 arası sayıları farklı hayvan ve nesnelerle öğren!' },
                { id: 'number-count', title: 'Say ve Bul', icon: '🍓', description: 'Her turda farklı sevimli nesneleri say ve doğru sayıyı seç!' },
                { id: 'number-order', title: 'Sayı Treni', icon: '🚂', description: 'Sayı vagonlarını sıraya diz, eksik vagonu tamamla!' },
                { id: 'number-pop', title: 'Sayı Balonları', icon: '🎈', description: 'Hedef sayıyı dinle ve uçan balonunu patlat!' }
            ]
        },
        {
            id: 'sentences',
            title: 'Cümle ve Hikayeler',
            subtitle: 'Cümleler kur ve resimli masallar oku',
            icon: '📖',
            color: '#9C27B0',
            bgGradient: 'linear-gradient(135deg, #8E24AA, #FF4081)',
            games: [
                { id: 'sentence-train', title: 'Cümle Treni', icon: '🚃', description: 'Kelimeleri sıraya dizerek anlamlı ve resimli cümleler kur!' },
                { id: 'story-reader', title: 'Resimli Hikayeler', icon: '📖', description: '6 farklı resimli ve sesli masalı etkileşimli oku!' }
            ]
        },
        {
            id: 'fun-zone',
            title: 'Eğlence Parkı',
            subtitle: 'Gölge dedektifi, farklı olanı bul ve sihirli oyunlar!',
            icon: '🎪',
            color: '#00ACC1',
            bgGradient: 'linear-gradient(135deg, #7C4DFF, #00E5FF)',
            games: [
                { id: 'shadow-match', title: 'Gölge Dedektifi', icon: '🕵️', description: 'Gizemli gölgelerin hangi sevimli nesneye ait olduğunu bul!' },
                { id: 'odd-one-out', title: 'Farklı Olanı Bul', icon: '🎪', description: 'Aynı harfle başlayan nesneler arasındaki farklı olanı yakala!' },
                { id: 'first-letter', title: 'İlk Harfini Bul', icon: '🦁', description: 'Resimdeki nesnenin hangi harfle başladığını bul!' },
                { id: 'syllable-wheel', title: 'Sihirli Hece Kazanı', icon: '🪄', description: 'Harf kürelerini sihirli kazanda birleştir!' },
                { id: 'missing-syllable', title: 'Eksik Heceyi Bul', icon: '🦋', description: 'Kelimenin saklanan hecesini bul ve tamamla!' }
            ]
        }
    ];

    // ────────────────────────────────────────────
    // Sıralı Öğrenme Adımları
    // ────────────────────────────────────────────
    const sequentialSteps = [
        { group: 1, section: 'letters', game: 'letter-learn', title: 'Harfleri ve Nesneleri Öğrenelim' },
        { group: 1, section: 'letters', game: 'first-letter', title: 'İlk Harfini Bul' },
        { group: 1, section: 'letters', game: 'balloon-pop', title: 'Ses Balonları' },
        { group: 1, section: 'letters', game: 'letter-hunt', title: 'Harf Avı' },
        { group: 1, section: 'letters', game: 'letter-paint', title: 'Harf Boyama' },
        { group: 1, section: 'syllables', game: 'syllable-train', title: 'Hece Treni' },
        { group: 2, section: 'syllables', game: 'syllable-wheel', title: 'Sihirli Hece Kazanı' },
        { group: 2, section: 'syllables', game: 'syllable-match', title: 'Hece Eşleştirme' },
        { group: 2, section: 'words', game: 'word-puzzle', title: 'Kelime Yapboz' },
        { group: 3, section: 'words', game: 'missing-syllable', title: 'Eksik Heceyi Bul' },
        { group: 3, section: 'fun-zone', game: 'shadow-match', title: 'Gölge Dedektifi' },
        { group: 3, section: 'words', game: 'word-match', title: 'Resim-Kelime Eşleştirme' },
        { group: 3, section: 'numbers', game: 'number-count', title: 'Say ve Bul' },
        { group: 3, section: 'sentences', game: 'sentence-train', title: 'Cümle Treni' },
        { group: 4, section: 'fun-zone', game: 'odd-one-out', title: 'Farklı Olanı Bul' },
        { group: 4, section: 'words', game: 'word-memory', title: 'Kelime Hafızası' },
        { group: 4, section: 'sentences', game: 'story-reader', title: 'Resimli Hikayeler' },
        { group: 5, section: 'words', game: 'word-hunt', title: 'Kelime Avı' },
        { group: 6, section: 'letters', game: 'letter-match', title: 'Resimli Harf Eşleştirme' },
        { group: 6, section: 'sentences', game: 'story-reader', title: 'Masal Zamanı' }
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
        countingObjects: countingObjects,
        getNumbers: getNumbers,
        getRandomCountingObject: getRandomCountingObject,
        getRandomNumberObject: getRandomCountingObject,
        getRandomLetterExample: getRandomLetterExample,
        getObjectImageUrl: getObjectImageUrl,
        getSyllableVisual: getSyllableVisual,
        getSyllableObject: getSyllableVisual,
        pickUniqueItems: pickUniqueItems,
        getNextFromDeck: function (deckKey, sourceArray) {
            return pickUniqueItems(deckKey, sourceArray, 1)[0];
        },

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
