/**
 * Türkçe Okuma Öğretici - Yardımcı Fonksiyonlar ve 5 Yaş Dostu Animasyonlar
 */
window.Utils = (function () {
    'use strict';

    /**
     * Diziyi yerinde karıştırır (Fisher-Yates)
     */
    function shuffle(array) {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * Diziden rastgele bir eleman seçer
     */
    function randomItem(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * min-max arası rastgele tamsayı (dahil)
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * min-max arası rastgele ondalık
     */
    function randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Değeri min-max arasında sınırlar
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * İki değer arasında lineer interpolasyon
     */
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * İki nokta arası mesafe
     */
    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    /**
     * DOM element oluşturur
     */
    function createElement(tag, className, textContent) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent !== undefined) el.textContent = textContent;
        return el;
    }

    /**
     * DOM element oluşturur (attrs objesiyle)
     */
    function createElementEx(tag, attrs, children) {
        const el = document.createElement(tag);
        if (attrs) {
            for (const [key, value] of Object.entries(attrs)) {
                if (key === 'className') el.className = value;
                else if (key === 'textContent') el.textContent = value;
                else if (key === 'innerHTML') el.innerHTML = value;
                else if (key === 'style' && typeof value === 'object') {
                    Object.assign(el.style, value);
                }
                else if (key.startsWith('on')) el[key] = value;
                else el.setAttribute(key, value);
            }
        }
        if (children) {
            for (const child of children) {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else if (child) {
                    el.appendChild(child);
                }
            }
        }
        return el;
    }

    /**
     * Promise tabanlı gecikme
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * requestAnimationFrame promise sarmalı
     */
    function nextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }

    /**
     * Element'i canlandırır (Web Animations API)
     */
    function animate(element, keyframes, options) {
        if (!element || !element.animate) return Promise.resolve();
        return new Promise(resolve => {
            const animation = element.animate(keyframes, options);
            animation.onfinish = resolve;
            animation.oncancel = resolve;
        });
    }

    /**
     * 5 Yaş Çocuk Dostu Gökkuşağı Konfeti ve Sürpriz Emoji Yağmuru Efekti
     */
    function showConfetti(container) {
        if (!container) return;
        const colors = ['#FF1744', '#FFEA00', '#00E676', '#00B0FF', '#D500F9', '#FF9100', '#1DE9B6'];
        const funIcons = ['⭐', '🌟', '✨', '🎈', '🦋', '🌈', '🎉', '🦄'];
        const confettiCount = 48;
        const pieces = [];
        const height = container.offsetHeight || window.innerHeight;

        for (let i = 0; i < confettiCount; i++) {
            const isIcon = (i % 4 === 0);
            const piece = createElement('div', 'confetti-piece');
            const color = colors[i % colors.length];
            const left = randomFloat(4, 96);
            const driftX = randomFloat(-70, 70);
            const animDuration = randomFloat(1.3, 2.7);
            const animDelay = randomFloat(0, 0.45);
            const rotation = randomInt(0, 360);
            const size = randomInt(10, 18);

            if (isIcon) {
                piece.textContent = funIcons[i % funIcons.length];
                Object.assign(piece.style, {
                    position: 'absolute',
                    left: left + '%',
                    top: '-30px',
                    fontSize: randomInt(20, 32) + 'px',
                    zIndex: '9999',
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                });
            } else {
                Object.assign(piece.style, {
                    position: 'absolute',
                    left: left + '%',
                    top: '-24px',
                    width: size + 'px',
                    height: (size * randomFloat(0.6, 1.5)) + 'px',
                    backgroundColor: color,
                    borderRadius: randomInt(0, 1) ? '50%' : '4px',
                    transform: 'rotate(' + rotation + 'deg)',
                    zIndex: '9999',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                });
            }

            container.appendChild(piece);
            pieces.push(piece);

            piece.animate([
                { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(0.8)', opacity: 1 },
                { transform: 'translate3d(' + (driftX * 0.5) + 'px, ' + (height * 0.5) + 'px, 0) rotate(' + (rotation + 360) + 'deg) scale(1.15)', opacity: 1, offset: 0.6 },
                { transform: 'translate3d(' + driftX + 'px, ' + (height + 50) + 'px, 0) rotate(' + (rotation + 720) + 'deg) scale(0.7)', opacity: 0 }
            ], {
                duration: animDuration * 1000,
                delay: animDelay * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            });
        }

        setTimeout(() => {
            pieces.forEach(p => { if (p.parentNode) p.remove(); });
        }, 3400);
    }

    /**
     * Yıldız ve Pırıltı Patlama Efekti
     */
    function showStarBurst(container, x, y) {
        if (!container) return;
        const starCount = 12;
        const stars = [];
        const icons = ['⭐', '✨', '🌟', '💫', '🎉'];

        for (let i = 0; i < starCount; i++) {
            const star = createElement('div', 'star-burst');
            const angle = (i / starCount) * Math.PI * 2;
            const dist = randomInt(55, 135);
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;

            Object.assign(star.style, {
                position: 'absolute',
                left: x + 'px',
                top: y + 'px',
                width: '26px',
                height: '26px',
                fontSize: randomInt(18, 28) + 'px',
                lineHeight: '26px',
                textAlign: 'center',
                zIndex: '9999',
                pointerEvents: 'none'
            });
            star.textContent = icons[i % icons.length];

            container.appendChild(star);
            stars.push(star);

            star.animate([
                { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
                { transform: 'translate(calc(-50% + ' + (tx * 0.7) + 'px), calc(-50% + ' + (ty * 0.7) + 'px)) scale(1.3) rotate(180deg)', opacity: 1, offset: 0.5 },
                { transform: 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + ty + 'px)) scale(0.4) rotate(360deg)', opacity: 0 }
            ], {
                duration: 850,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fill: 'forwards'
            });
        }

        setTimeout(() => {
            stars.forEach(s => { if (s.parentNode) s.remove(); });
        }, 950);
    }

    /**
     * Yanlış cevap eğlenceli jöle sallanma efekti
     */
    function shakeElement(element) {
        return animate(element, [
            { transform: 'translateX(0) rotate(0deg)' },
            { transform: 'translateX(-12px) rotate(-6deg)' },
            { transform: 'translateX(12px) rotate(6deg)' },
            { transform: 'translateX(-10px) rotate(-4deg)' },
            { transform: 'translateX(10px) rotate(4deg)' },
            { transform: 'translateX(0) rotate(0deg)' }
        ], { duration: 420, easing: 'ease-in-out' });
    }

    /**
     * Doğru cevap neşeli çizgi film zıplama (jelly bounce) efekti
     */
    function bounceElement(element) {
        return animate(element, [
            { transform: 'scale(1, 1) translateY(0)' },
            { transform: 'scale(1.28, 0.82) translateY(4px)' },
            { transform: 'scale(0.88, 1.24) translateY(-14px)' },
            { transform: 'scale(1.12, 0.92) translateY(2px)' },
            { transform: 'scale(0.97, 1.04) translateY(-3px)' },
            { transform: 'scale(1, 1) translateY(0)' }
        ], { duration: 560, easing: 'cubic-bezier(0.28, 0.84, 0.42, 1)' });
    }

    /**
     * Element'i altın ışıkla pulsla
     */
    function pulseElement(element) {
        return animate(element, [
            { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(255,215,0,0))' },
            { transform: 'scale(1.12) rotate(3deg)', filter: 'drop-shadow(0 0 16px rgba(255,215,0,0.85))' },
            { transform: 'scale(1.06) rotate(-3deg)', filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.6))' },
            { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(255,215,0,0))' }
        ], { duration: 750, easing: 'ease-in-out' });
    }

    /**
     * Container boyutlarını hesaplar (her ekran boyutuna tam uyumlu oyun alanı)
     */
    function getGameDimensions(container) {
        const rect = container ? container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        const w = rect.width || window.innerWidth;
        const h = rect.height || window.innerHeight;
        const minDim = Math.min(w, h);
        const maxDim = Math.max(w, h);
        const isLandscape = w > h;
        return {
            width: w,
            height: h,
            minDim: minDim,
            maxDim: maxDim,
            isLandscape: isLandscape,
            unit: minDim / 10,
            fontSize: {
                small: Math.max(14, Math.round(minDim / 25)),
                medium: Math.max(18, Math.round(minDim / 18)),
                large: Math.max(24, Math.round(minDim / 12)),
                xlarge: Math.max(34, Math.round(minDim / 8.5)),
                xxlarge: Math.max(46, Math.round(minDim / 5.5))
            },
            touchTarget: Math.max(64, minDim / 8),
            buttonSize: {
                small: Math.max(48, minDim / 10),
                medium: Math.max(64, minDim / 7),
                large: Math.max(80, minDim / 5)
            }
        };
    }

    /**
     * Dokunma olayından koordinat alır
     */
    function getTouchPos(event) {
        if (event.touches && event.touches.length > 0) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
        if (event.changedTouches && event.changedTouches.length > 0) {
            return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
        }
        return { x: event.clientX, y: event.clientY };
    }

    /**
     * Tam ekran geçiş/çıkış
     */
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }

    /**
     * Türkçe büyük harfe çevir
     */
    function toUpperTR(str) {
        return String(str || '').replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
    }

    /**
     * Türkçe küçük harfe çevir
     */
    function toLowerTR(str) {
        return String(str || '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
    }

    return {
        shuffle: shuffle,
        randomItem: randomItem,
        randomInt: randomInt,
        randomFloat: randomFloat,
        clamp: clamp,
        lerp: lerp,
        distance: distance,
        createElement: createElement,
        createElementEx: createElementEx,
        delay: delay,
        nextFrame: nextFrame,
        animate: animate,
        showConfetti: showConfetti,
        showStarBurst: showStarBurst,
        shakeElement: shakeElement,
        bounceElement: bounceElement,
        pulseElement: pulseElement,
        getGameDimensions: getGameDimensions,
        getTouchPos: getTouchPos,
        toggleFullscreen: toggleFullscreen,
        toUpperTR: toUpperTR,
        toLowerTR: toLowerTR
    };
})();
