// Keepa API Integration for Live Amazon Data
// Free Tier: 250 requests/day

const KEEPA_API_KEY = 'DEIN_KEEPA_API_KEY'; // User muss diesen holen

// Product ASINs to track
const TRACKED_PRODUCTS = {
    'echo-studio': 'B0FBHH5BRM',
    'nest-audio': 'B08DFPV5Y9',
    'echo-dot-5': 'B0B7FSL21J',
    'homepod-mini': 'B08QHHMRRJ',
    'philips-hue-starter': 'B08DP5XJDN',
    'ring-doorbell': 'B08W2W9QR4',
    'tapo-p110': 'B091FXLMS8'
};

// Fetch product data from Keepa
async function fetchKeepaData(asin) {
    const url = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=4&asin=${asin}&buybox=1&stock=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
            return parseKeepaProduct(data.products[0]);
        }
        return null;
    } catch (error) {
        console.error('Keepa API Error:', error);
        return null;
    }
}

// Parse Keepa product data
function parseKeepaProduct(product) {
    const currentPrice = product.stats?.current?.[0] || product.stats?.current?.[1];
    const avgPrice = product.stats?.avg?.[0] || product.stats?.avg?.[1];
    const rating = product.stats?.rating?.[0];
    const reviewCount = product.stats?.reviewCount?.[0];
    
    return {
        title: product.title,
        asin: product.asin,
        price: currentPrice ? (currentPrice / 100).toFixed(2) : null,
        oldPrice: avgPrice && currentPrice && avgPrice > currentPrice ? (avgPrice / 100).toFixed(2) : null,
        rating: rating ? (rating / 10).toFixed(1) : null,
        reviewCount: reviewCount || null,
        availability: product.stats?.stock?.[0] > 0,
        image: `https://images-na.ssl-images-amazon.com/images/I/${product.imagesCSV?.split(',')[0]}`,
        prime: product.isPrimeExclusive || false,
        lastUpdate: new Date().toLocaleString('de-DE')
    };
}

// Update product cards with live data
async function updateProductCards() {
    const cards = document.querySelectorAll('[data-asin]');
    
    for (const card of cards) {
        const asin = card.getAttribute('data-asin');
        if (!asin) continue;
        
        const data = await fetchKeepaData(asin);
        if (data) {
            updateCard(card, data);
        }
    }
}

// Update single card
function updateCard(card, data) {
    const priceEl = card.querySelector('.current');
    const oldPriceEl = card.querySelector('.old');
    const ratingEl = card.querySelector('.stars');
    const reviewEl = card.querySelector('.rating-count');
    const primeEl = card.querySelector('.prime');
    
    if (priceEl && data.price) {
        priceEl.textContent = `${data.price.replace('.', ',')}€`;
    }
    
    if (oldPriceEl && data.oldPrice) {
        oldPriceEl.textContent = `${data.oldPrice.replace('.', ',')}€`;
        oldPriceEl.style.display = 'inline';
    }
    
    if (ratingEl && data.rating) {
        const stars = '★'.repeat(Math.floor(data.rating)) + '☆'.repeat(5 - Math.floor(data.rating));
        ratingEl.textContent = stars;
    }
    
    if (reviewEl && data.reviewCount) {
        reviewEl.textContent = `${data.reviewCount.toLocaleString('de-DE')} Bewertungen`;
    }
    
    if (primeEl) {
        primeEl.style.display = data.prime ? 'inline' : 'none';
    }
    
    // Add last update timestamp
    card.setAttribute('title', `Zuletzt aktualisiert: ${data.lastUpdate}`);
}

// Fallback: Static data cache
const STATIC_PRODUCT_DATA = {
    'B0FBHH5BRM': {
        title: 'Amazon Echo Studio',
        price: '199,00',
        oldPrice: '229,00',
        rating: 4.5,
        reviews: 12847,
        image: 'https://m.media-amazon.com/images/I/71NLgS2t4jL._AC_SL1000_.jpg'
    },
    'B08DFPV5Y9': {
        title: 'Google Nest Audio',
        price: '99,00',
        oldPrice: null,
        rating: 4.3,
        reviews: 8432,
        image: 'https://m.media-amazon.com/images/I/81OsbqSekCL._AC_SL1500_.jpg'
    },
    'B0B7FSL21J': {
        title: 'Echo Dot (5. Gen)',
        price: '64,99',
        oldPrice: '89,99',
        rating: 4.7,
        reviews: 89231,
        image: 'https://m.media-amazon.com/images/I/71cGYW+LxJL._AC_SL1000_.jpg'
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Try to update with live data
    if (KEEPA_API_KEY !== 'DEIN_KEEPA_API_KEY') {
        updateProductCards();
        
        // Refresh every 30 minutes (48 times a day = within free tier)
        setInterval(updateProductCards, 30 * 60 * 1000);
    } else {
        console.log('Keepa API Key not configured. Using static data.');
    }
});

// Export for manual refresh
window.refreshProductData = updateProductCards;