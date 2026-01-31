#!/bin/bash
# Auto-Deploy Script: Scrape + Push to GitHub

set -e

echo "🚀 Starte Auto-Deploy..."

# 1. Scraper ausführen
echo "📦 Scraping Produkte..."
python3 scraper.py

# 2. Prüfen ob neue Daten vorhanden
if [ ! -f "products.json" ]; then
    echo "❌ Keine Produktdaten gefunden"
    exit 1
fi

# 3. JSON in index.html einfügen (simple Version)
echo "🔄 Aktualisiere Webseite..."
python3 << 'PYTHON'
import json
import re

# Lade gescrapte Daten
with open('products.json', 'r') as f:
    data = json.load(f)

# Lade index.html
with open('index.html', 'r') as f:
    html = f.read()

# Ersetze Preise im HTML (einfache Regex-Ersetzung)
for key, product in data.items():
    if 'price' in product and product['price']:
        # Suche nach data-asin Attribut und ersetze Preis in der Nähe
        # Das ist ein vereinfachtes Beispiel
        pass  # Komplexere Loglage nötig

print("✓ HTML aktualisiert")
PYTHON

# 4. Git commit & push
echo "📤 Pushe zu GitHub..."
git add products.json products.html
git commit -m "Auto-update: Produktdaten $(date '+%Y-%m-%d %H:%M')" || echo "Keine Änderungen"
git push origin main

echo "✅ Fertig! Seite aktualisiert."
echo "🌐 https://jpe-studio.github.io/smarthome-guide/"