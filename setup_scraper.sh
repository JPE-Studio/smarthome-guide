#!/bin/bash
# Setup für Amazon Scraper

echo "🔧 Setup Amazon Scraper..."

# Python dependencies installieren
pip install -r requirements.txt

# Playwright Browser installieren
python -m playwright install chromium

echo "✅ Setup abgeschlossen!"
echo ""
echo "Verwendung:"
echo "  python scraper.py"
echo ""
echo "Dies erstellt:"
echo "  - products.json (Rohdaten)"
echo "  - products.html (HTML-Seite mit Produkten)"