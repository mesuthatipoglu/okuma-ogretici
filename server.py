#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Türkçe Okuma Öğretici - Kolay Başlatma Sunucusu
Yerel ağ IP'sini otomatik algılar ve PWA için gerekli başlıkları sağlar.
"""

import http.server
import socket
import socketserver
import os
import sys

PORT = 8080

def get_lan_ip():
    """Cihazın yerel ağ (Wi-Fi) IP adresini tespit eder."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

class PWAHandler(http.server.SimpleHTTPRequestHandler):
    """PWA ve Service Worker için optimize edilmiş HTTP Handler"""

    def end_headers(self):
        self.send_header('Service-Worker-Allowed', '/')
        self.send_header('Access-Control-Allow-Origin', '*')

        if self.path.endswith('sw.js'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')

        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.webmanifest') or path.endswith('manifest.json'):
            return 'application/manifest+json'
        if path.endswith('.svg'):
            return 'image/svg+xml'
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.css'):
            return 'text/css'
        return super().guess_type(path)

    def log_message(self, format, *args):
        if len(args) > 1 and str(args[1]).startswith(('4', '5')):
            super().log_message(format, *args)

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    lan_ip = get_lan_ip()
    socketserver.TCPServer.allow_reuse_address = True

    try:
        with socketserver.TCPServer(('0.0.0.0', PORT), PWAHandler) as httpd:
            print("=" * 60)
            print("   📚 OKUMA ÖĞRENİYORUM - PWA YEREL SUNUCUSU")
            print("=" * 60)
            print("🖥️  Bu Bilgisayardan Açmak İçin:")
            print(f"    http://localhost:{PORT}")
            print(f"    http://127.0.0.1:{PORT}")
            print()
            print("📱 Aynı Wi-Fi'daki Telefon / Tabletten Açmak İçin:")
            print(f"    http://{lan_ip}:{PORT}")
            print("-" * 60)
            print("💡 PWA ÇEVRİMDIŞI ÇALIŞMA BİLGİSİ:")
            print(" 1. Uygulamayı bir kez açın (veya 'Uygulamayı Yükle' butonuna basın).")
            print(" 2. Tüm oyunlar ve sesler otomatik olarak cihaz hafızasına kaydedilir.")
            print(" 3. İndirildikten sonra bu sunucuyu (veya Wi-Fi'yi) KAPATSANIZ BİLE")
            print("    uygulama telefon veya bilgisayarınızda offline olarak çalışmaya devam eder!")
            print("=" * 60)
            print(f"Sunucu 0.0.0.0:{PORT} üzerinde dinliyor... (Durdurmak için Ctrl+C)\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Sunucu durduruldu.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98 or e.errno == 10048:
            print(f"\n❌ Hata: Port {PORT} zaten kullanımda!")
            print("Lütfen açık olan diğer python sunucu pencerelerini kapatıp tekrar deneyin.")
        else:
            print(f"\n❌ Sunucu başlatılamadı: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run()
