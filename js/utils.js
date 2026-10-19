/**
 * Türkçe Okuma Öğretici - Yardımcı Fonksiyonlar
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
        return new Promise(resolve => {
            const animation = element.animate(keyframes, options);
            animation.onfinish = resolve;
        });
    }

    /**
     * Konfeti efekti oluşturur
     */
    function showConfetti(container) {
        const colors = ['#E53935', '#FFB300', '#43A047', '#1E88E5', '#8E24AA', '#F06292'];
        const confettiCount = 40;
        const pieces = [];

        for (let i = 0; i < confettiCount; i++) {
            const piece = createElement('div', 'confetti-piece');
            const color = colors[i % colors.length];
            const left = randomFloat(10, 90);
            const animDuration = randomFloat(1, 2.5);
            const animDelay = randomFloat(0, 0.5);
            const rotation = randomInt(0, 360);
            const size = randomInt(8, 14);

            Object.assign(piece.style, {
                position: 'absolute',
                left: left + '%',
                top: '-20px',
                width: size + 'px',
                height: size + 'px',
                backgroundColor: color,
                borderRadius: randomInt(0, 1) ? '50%' : '2px',
                transform: 'rotate(' + rotation + 'deg)',
                zIndex: '9999',
                pointerEvents: 'none'
            });

            container.appendChild(piece);
            pieces.push(piece);

            piece.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: 'translateY(' + (container.offsetHeight + 40) + 'px) rotate(' + (rotation + 720) + 'deg)', opacity: 0 }
            ], {
                duration: animDuration * 1000,
                delay: animDelay * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            });
        }

        setTimeout(() => {
            pieces.forEach(p => p.remove());
        }, 3500);
    }

    /**
     * Yıldız patlama efekti oluşturur
     */
    function showStarBurst(container, x, y) {
        const starCount = 8;
        const stars = [];

        for (let i = 0; i < starCount; i++) {
            const star = createElement('div', 'star-burst');
            const angle = (i / starCount) * Math.PI * 2;
            const dist = randomInt(60, 120);
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;

            Object.assign(star.style, {
                position: 'absolute',
                left: x + 'px',
                top: y + 'px',
                width: '20px',
                height: '20px',
                fontSize: '20px',
                lineHeight: '20px',
                textAlign: 'center',
                zIndex: '9999',
                pointerEvents: 'none'
            });
            star.textContent = '⭐';

            container.appendChild(star);
            stars.push(star);

            star.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                { transform: 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + ty + 'px)) scale(1)', opacity: 0 }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            });
        }

        setTimeout(() => {
            stars.forEach(s => s.remove());
        }, 1000);
    }

    /**
     * Yanlış cevap sallanma efekti
     */
    function shakeElement(element) {
        return animate(element, [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 400, easing: 'ease-in-out' });
    }

    /**
     * Doğru cevap zıplama efekti
     */
    function bounceElement(element) {
        return animate(element, [
            { transform: 'scale(1)' },
            { transform: 'scale(1.3)' },
            { transform: 'scale(0.9)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
        ], { duration: 500, easing: 'ease-in-out' });
    }

    /**
     * Element'i pulsla
     */
    function pulseElement(element) {
        return animate(element, [
            { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255,215,0,0.7)' },
            { transform: 'scale(1.05)', boxShadow: '0 0 20px 10px rgba(255,215,0,0)' },
            { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255,215,0,0)' }
        ], { duration: 1000, easing: 'ease-in-out' });
    }

    /**
     * Container boyutlarını hesaplar (oyun alanı)
     */
    function getGameDimensions(container) {
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const minDim = Math.min(w, h);
        const maxDim = Math.max(w, h);
        const isLandscape = w > h;
        return {
            width: w,
            height: h,
            minDim: minDim,
            maxDim: maxDim,
            isLandscape: isLandscape,
            // Standart boyut birimleri (ekran boyutuna göre ölçekli)
            unit: minDim / 10,
            fontSize: {
                small: Math.max(14, minDim / 25) + 'px',
                medium: Math.max(18, minDim / 18) + 'px',
                large: Math.max(24, minDim / 12) + 'px',
                xlarge: Math.max(36, minDim / 8) + 'px',
                xxlarge: Math.max(48, minDim / 5) + 'px'
            },
            // Dokunma hedefi boyutu
            touchTarget: Math.max(64, minDim / 8),
            // Buton boyutları
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
        return str.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
    }

    /**
     * Türkçe küçük harfe çevir
     */
    function toLowerTR(str) {
        return str.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
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
