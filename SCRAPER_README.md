# Amazon Scraper

Automatischer Scraper für Amazon-Produktdaten.

## ⚠️ Wichtiger Hinweis

**Amazon blockiert Scraping!** Dieses Skript verwendet:
- Playwright (echter Browser)
- Zufällige Delays
- Anti-Bot-Maßnahmen

**Trotzdem Risiko:** Amazon kann deine IP temporär blockieren.

## Installation

```bash
chmod +x setup_scraper.sh
./setup_scraper.sh
```

Oder manuell:
```bash
pip install -r requirements.txt
python -m playwright install chromium
```

## Verwendung

```bash
python scraper.py
```

Das Skript:
1. Scraped alle definierten Produkte
2. Speichert Daten in `products.json`
3. Generiert `products.html` (fertige Webseite)

## Produkte anpassen

In `scraper.py` die `PRODUCTS` Dictionary bearbeiten:

```python
PRODUCTS = {
    "dein-produkt": {
        "name": "Produkt Name",
        "url": "https://www.amazon.de/dp/ASIN",
        "search_url": "https://www.amazon.de/s?k=produkt+name"
    }
}
```

## Output

### products.json
```json
{
  "echo-studio": {
    "name": "Amazon Echo Studio",
    "title": "Amazon Echo Studio (Neueste Generation)...",
    "price": "199.00",
    "old_price": "229.00",
    "rating": 4.5,
    "reviews": 12847,
    "in_stock": true,
    "prime": true,
    "image": "https://m.media-amazon.com/...",
    "url": "https://www.amazon.de/dp/...",
    "last_updated": "2025-01-31T16:30:00"
  }
}
```

### products.html
Fertige HTML-Seite mit allen Produkten, bereit zum Hochladen.

## Automatisierung (Cron)

Alle 2 Stunden aktualisieren:
```bash
crontab -e
```

Eintrag hinzufügen:
```
0 */2 * * * cd /pfad/zu/smarthome-guide && python scraper.py >> scraper.log 2>&1
```

## Troubleshooting

### Amazon blockiert den Scraper
- Längere Delays einbauen (in `scrape_product`)
- VPN/Proxy verwenden
- Weniger häufig scrapen (max 1x pro Stunde)

### Playwright Fehler
```bash
python -m playwright install --with-deps chromium
```

## Alternative: Keepa API

Wenn Amazon zu aggressiv blockiert, verwende die Keepa API (kostenlos):
- 250 Requests/Tag
- Zuverlässiger als Scraping
- Siehe `keepa-api.js`

Registrierung: https://keepa.com/#!api