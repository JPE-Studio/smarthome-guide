#!/usr/bin/env python3
"""
Amazon Product Scraper
Scraped Live-Daten von Amazon.de

ACHTUNG: Amazon blockiert Scraping. Verwende mit Vorsicht und delays!
Empfohlen: Max 1x pro Stunde pro Produkt
"""

import json
import time
import random
from datetime import datetime
from playwright.sync_api import sync_playwright

# Konfiguration
AMAZON_DOMAIN = "amazon.de"
OUTPUT_FILE = "products.json"

# Produkte die gescraped werden sollen
PRODUCTS = {
    "echo-studio": {
        "name": "Amazon Echo Studio",
        "url": "https://www.amazon.de/Amazon-Generation-kompaktes-immersivem-3D-Audio/dp/B0FBHH5BRM",
        "search_url": "https://www.amazon.de/s?k=amazon+echo+studio"
    },
    "echo-dot-5": {
        "name": "Echo Dot 5. Generation",
        "url": "https://www.amazon.de/dp/B0B7FSL21J",
        "search_url": "https://www.amazon.de/s?k=echo+dot+5+generation"
    },
    "nest-audio": {
        "name": "Google Nest Audio",
        "url": "https://www.amazon.de/dp/B08DFPV5Y9",
        "search_url": "https://www.amazon.de/s?k=google+nest+audio"
    },
    "homepod-mini": {
        "name": "Apple HomePod mini",
        "url": "https://www.amazon.de/dp/B08QHHMRRJ",
        "search_url": "https://www.amazon.de/s?k=apple+homepod+mini"
    },
    "philips-hue-starter": {
        "name": "Philips Hue White & Color Starter Set",
        "url": "https://www.amazon.de/dp/B08DP5XJDN",
        "search_url": "https://www.amazon.de/s?k=philips+hue+white+color+starter"
    },
    "ring-doorbell": {
        "name": "Ring Video Doorbell 4",
        "url": "https://www.amazon.de/dp/B08W2W9QR4",
        "search_url": "https://www.amazon.de/s?k=ring+video+doorbell+4"
    },
    "tapo-p110": {
        "name": "TP-Link Tapo P110",
        "url": "https://www.amazon.de/dp/B091FXLMS8",
        "search_url": "https://www.amazon.de/s?k=tp-link+tapo+p110"
    }
}

class AmazonScraper:
    def __init__(self):
        self.data = {}
        
    def scrape_product(self, product_key, product_info):
        """Scraped ein einzelnes Produkt"""
        print(f"Scraping: {product_info['name']}...")
        
        with sync_playwright() as p:
            # Browser starten (headless=False für Debugging)
            browser = p.chromium.launch(
                headless=True,
                args=['--disable-blink-features=AutomationControlled']
            )
            
            # Kontext mit deutscher Locale
            context = browser.new_context(
                locale='de-DE',
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # JavaScript-Injection um Bot-Erkennung zu umgehen
            context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """)
            
            page = context.new_page()
            
            try:
                # Zufällige Verzögerung (3-7 Sekunden)
                time.sleep(random.uniform(3, 7))
                
                # Produktseite laden
                page.goto(product_info['url'], wait_until='networkidle', timeout=30000)
                
                # Warte auf Produkt-Titel
                page.wait_for_selector('#productTitle', timeout=10000)
                
                # Daten extrahieren
                product_data = {
                    'name': product_info['name'],
                    'url': product_info['url'],
                    'asin': product_key,
                    'last_updated': datetime.now().isoformat(),
                    'available': True
                }
                
                # Titel
                try:
                    title = page.query_selector('#productTitle')
                    product_data['title'] = title.inner_text().strip() if title else product_info['name']
                except:
                    product_data['title'] = product_info['name']
                
                # Preis (verschiedene Selektoren probieren)
                price_selectors = [
                    '.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen',
                    '.a-price.aok-align-center .a-offscreen',
                    '.a-price .a-offscreen',
                    '[data-a-color="price"] .a-offscreen',
                    '.a-price-whole',
                    '.a-price-range .a-offscreen'
                ]
                
                for selector in price_selectors:
                    try:
                        price_elem = page.query_selector(selector)
                        if price_elem:
                            price_text = price_elem.inner_text()
                            # Preis bereinigen (z.B. "199,99 €" -> "199.99")
                            price_clean = price_text.replace('€', '').replace('.', '').replace(',', '.').strip()
                            product_data['price'] = price_clean
                            break
                    except:
                        continue
                else:
                    product_data['price'] = None
                
                # Alter Preis (durchgestrichen)
                try:
                    old_price_elem = page.query_selector('.a-price.a-text-price .a-offscreen')
                    if old_price_elem:
                        old_price_text = old_price_elem.inner_text()
                        old_price_clean = old_price_text.replace('€', '').replace('.', '').replace(',', '.').strip()
                        # Nur wenn höher als aktueller Preis
                        if product_data.get('price') and float(old_price_clean) > float(product_data['price']):
                            product_data['old_price'] = old_price_clean
                except:
                    pass
                
                # Bewertung
                try:
                    rating_elem = page.query_selector('[data-hook="average-star-rating"] .a-icon-alt')
                    if rating_elem:
                        rating_text = rating_elem.inner_text()
                        # "4,5 von 5 Sternen" -> 4.5
                        rating = rating_text.split(' ')[0].replace(',', '.')
                        product_data['rating'] = float(rating)
                except:
                    product_data['rating'] = None
                
                # Anzahl Bewertungen
                try:
                    review_elem = page.query_selector('[data-hook="total-review-count"]')
                    if review_elem:
                        review_text = review_elem.inner_text()
                        # "12.847" -> 12847
                        reviews = review_text.replace('.', '').replace(',', '').replace('Bewertungen', '').strip()
                        product_data['reviews'] = int(reviews)
                except:
                    product_data['reviews'] = None
                
                # Verfügbarkeit
                try:
                    availability_elem = page.query_selector('#availability span')
                    if availability_elem:
                        availability_text = availability_elem.inner_text().lower()
                        product_data['in_stock'] = 'auf lager' in availability_text or 'verfügbar' in availability_text
                        product_data['availability_text'] = availability_text.strip()
                except:
                    product_data['in_stock'] = True
                
                # Prime
                try:
                    prime_elem = page.query_selector('[aria-label="Amazon Prime"]')
                    product_data['prime'] = prime_elem is not None
                except:
                    product_data['prime'] = False
                
                # Bild
                try:
                    img_elem = page.query_selector('#landingImage')
                    if img_elem:
                        product_data['image'] = img_elem.get_attribute('src')
                except:
                    pass
                
                print(f"✓ Erfolgreich: {product_data.get('price', 'N/A')}€")
                return product_data
                
            except Exception as e:
                print(f"✗ Fehler: {e}")
                return {
                    'name': product_info['name'],
                    'asin': product_key,
                    'available': False,
                    'error': str(e),
                    'last_updated': datetime.now().isoformat()
                }
            finally:
                browser.close()
    
    def scrape_all(self):
        """Scraped alle Produkte"""
        print(f"Starte Scraping für {len(PRODUCTS)} Produkte...")
        print("=" * 50)
        
        for key, info in PRODUCTS.items():
            self.data[key] = self.scrape_product(key, info)
            
            # Warte zwischen Requests (10-20 Sekunden)
            if key != list(PRODUCTS.keys())[-1]:
                wait_time = random.uniform(10, 20)
                print(f"Warte {wait_time:.1f}s...")
                time.sleep(wait_time)
        
        # Speichern
        self.save_data()
        print("=" * 50)
        print(f"✓ Fertig! Daten gespeichert in {OUTPUT_FILE}")
    
    def save_data(self):
        """Speichert Daten als JSON"""
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
    
    def generate_html(self):
        """Generiert HTML aus den gescrapten Daten"""
        template = '''<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Smart Home Produkte - Live</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f7; }}
        h1 {{ text-align: center; color: #1a1a2e; }}
        .updated {{ text-align: center; color: #666; margin-bottom: 30px; }}
        .products-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }}
        .product-card {{ background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.2s; }}
        .product-card:hover {{ transform: translateY(-4px); }}
        .product-image {{ aspect-ratio: 1; display: flex; align-items: center; justify-content: center; padding: 20px; background: #f8f8f8; }}
        .product-image img {{ max-width: 100%; max-height: 100%; object-fit: contain; }}
        .product-info {{ padding: 20px; }}
        .product-title {{ font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; color: #1a1a2e; }}
        .price {{ font-size: 1.5rem; font-weight: 700; color: #6366f1; margin: 12px 0; }}
        .old-price {{ text-decoration: line-through; color: #999; font-size: 1rem; margin-left: 8px; }}
        .rating {{ color: #f59e0b; margin: 8px 0; }}
        .reviews {{ color: #666; font-size: 0.9rem; margin-left: 8px; }}
        .prime {{ color: #00a8e1; font-weight: 600; font-size: 0.9rem; }}
        .stock {{ color: #10b981; font-size: 0.9rem; margin-top: 8px; }}
        .stock.out {{ color: #ef4444; }}
        .buy-btn {{ display: block; width: 100%; padding: 14px; background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%); color: #000; text-align: center; text-decoration: none; font-weight: 700; border-radius: 8px; margin-top: 16px; }}
        .buy-btn:hover {{ background: linear-gradient(135deg, #ffec00 0%, #ffbb00 100%); }}
        .error {{ color: #ef4444; padding: 20px; text-align: center; }}
    </style>
</head>
<body>
    <h1>🏠 Smart Home Produkte</h1>
    <p class="updated">Zuletzt aktualisiert: {updated}</p>
    <div class="products-grid">
        {products}
    </div>
</body>
</html>'''
        
        products_html = []
        for key, data in self.data.items():
            if not data.get('available'):
                continue
            
            price_html = f"{data.get('price', 'N/A')}€"
            if data.get('old_price'):
                price_html += f"<span class='old-price'>{data['old_price']}€</span>"
            
            rating_html = ""
            if data.get('rating'):
                stars = '★' * int(data['rating']) + '☆' * (5 - int(data['rating']))
                rating_html = f'<div class="rating">{stars}'
                if data.get('reviews'):
                    rating_html += f'<span class="reviews">({data["reviews"]:,})</span>'
                rating_html += '</div>'
            
            prime_html = '<div class="prime">✓ Prime</div>' if data.get('prime') else ''
            
            stock_class = 'out' if not data.get('in_stock') else ''
            stock_text = data.get('availability_text', 'Verfügbarkeit unbekannt')
            
            card_html = f'''
        <div class="product-card">
            <div class="product-image">
                <img src="{data.get('image', '')}" alt="{data.get('title', '')}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-title">{data.get('title', data['name'])}</div>
                {rating_html}
                <div class="price">{price_html}</div>
                {prime_html}
                <div class="stock {stock_class}">{stock_text}</div>
                <a href="{data['url']}?tag=jpe-allgemein-21" class="buy-btn" target="_blank">Bei Amazon ansehen</a>
            </div>
        </div>'''
            products_html.append(card_html)
        
        html_content = template.format(
            updated=datetime.now().strftime('%d.%m.%Y %H:%M'),
            products=''.join(products_html)
        )
        
        with open('products.html', 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print("✓ HTML generiert: products.html")


if __name__ == '__main__':
    scraper = AmazonScraper()
    scraper.scrape_all()
    scraper.generate_html()
    print("\n📄 JSON: products.json")
    print("🌐 HTML: products.html")