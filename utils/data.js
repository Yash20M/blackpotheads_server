// T-shirt Categories - STRICT enum
export const TSHIRT_CATEGORIES = {
    SHIVA: "Shiva",
    SHROOMS: "Shrooms",
    LSD: "LSD",
    CHAKRAS: "Chakras",
    DARK: "Dark",
    RICK_N_MORTY: "Rick n Morty"
};

// Seed data for T-shirts ONLY - MongoDB will auto-generate _id
export const products = [
    // ========== SHIVA CATEGORY (6 products) ==========
    {
        "name": "Shiva Meditation T-Shirt",
        "category": TSHIRT_CATEGORIES.SHIVA,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/shiva-meditation-1.jpg",
            "https://example.com/images/shiva-meditation-2.jpg"
        ],
        "description": "Premium cotton T-shirt featuring Lord Shiva in deep meditation. Perfect for spiritual enthusiasts.",
        "stock": 50,
        "isFeatured": true
    },
    {
        "name": "Shiva Trishul Power T-Shirt",
        "category": TSHIRT_CATEGORIES.SHIVA,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/shiva-trishul-1.jpg",
            "https://example.com/images/shiva-trishul-2.jpg"
        ],
        "description": "Powerful Trishul design representing Lord Shiva's divine weapon. Bold and spiritual.",
        "stock": 45,
        "isFeatured": false
    },
    {
        "name": "Shiva Third Eye T-Shirt",
        "category": TSHIRT_CATEGORIES.SHIVA,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/shiva-third-eye-1.jpg",
            "https://example.com/images/shiva-third-eye-2.jpg"
        ],
        "description": "Mystical third eye of Shiva design with cosmic elements. Awakening consciousness.",
        "stock": 40,
        "isFeatured": true
    },
    {
        "name": "Nataraja Dance T-Shirt",
        "category": TSHIRT_CATEGORIES.SHIVA,
        "sizes": ["S", "M", "L", "XL"],
        "price": 899,
        "images": [
            "https://example.com/images/nataraja-1.jpg",
            "https://example.com/images/nataraja-2.jpg"
        ],
        "description": "Lord Shiva as Nataraja - the cosmic dancer. Represents creation and destruction.",
        "stock": 35,
        "isFeatured": false
    },
    {
        "name": "Shiva Om Namah T-Shirt",
        "category": TSHIRT_CATEGORIES.SHIVA,
        "sizes": ["S", "M", "L", "XL"],
        "price": 749,
        "images": [
            "https://example.com/images/shiva-om-1.jpg",
            "https://example.com/images/shiva-om-2.jpg"
        ],
        "description": "Om Namah Shivaya mantra with beautiful calligraphy. Spiritual and peaceful.",
        "stock": 55,
        "isFeatured": false
    },
    {
        "name": "Shiva Moon Crescent T-Shirt",
        "category": TSHIRT_CATEGORIES.SHIVA,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/shiva-moon-1.jpg",
            "https://example.com/images/shiva-moon-2.jpg"
        ],
        "description": "Shiva with crescent moon on his head. Symbol of time and eternity.",
        "stock": 42,
        "isFeatured": true
    },

    // ========== SHROOMS CATEGORY (6 products) ==========
    {
        "name": "Cosmic Shrooms T-Shirt",
        "category": TSHIRT_CATEGORIES.SHROOMS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 899,
        "images": [
            "https://example.com/images/cosmic-shrooms-1.jpg",
            "https://example.com/images/cosmic-shrooms-2.jpg"
        ],
        "description": "Psychedelic mushroom design with vibrant cosmic colors. High-quality print on soft cotton.",
        "stock": 48,
        "isFeatured": true
    },
    {
        "name": "Magic Mushroom Forest T-Shirt",
        "category": TSHIRT_CATEGORIES.SHROOMS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/mushroom-forest-1.jpg",
            "https://example.com/images/mushroom-forest-2.jpg"
        ],
        "description": "Enchanted forest with glowing mushrooms. Mystical and colorful design.",
        "stock": 44,
        "isFeatured": false
    },
    {
        "name": "Neon Shrooms T-Shirt",
        "category": TSHIRT_CATEGORIES.SHROOMS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 899,
        "images": [
            "https://example.com/images/neon-shrooms-1.jpg",
            "https://example.com/images/neon-shrooms-2.jpg"
        ],
        "description": "Glowing neon mushrooms in UV reactive colors. Perfect for festivals and raves.",
        "stock": 50,
        "isFeatured": true
    },
    {
        "name": "Trippy Mushroom Garden T-Shirt",
        "category": TSHIRT_CATEGORIES.SHROOMS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/mushroom-garden-1.jpg",
            "https://example.com/images/mushroom-garden-2.jpg"
        ],
        "description": "Whimsical mushroom garden with butterflies and stars. Dreamy psychedelic art.",
        "stock": 38,
        "isFeatured": false
    },
    {
        "name": "Sacred Geometry Shrooms T-Shirt",
        "category": TSHIRT_CATEGORIES.SHROOMS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/geometry-shrooms-1.jpg",
            "https://example.com/images/geometry-shrooms-2.jpg"
        ],
        "description": "Mushrooms with sacred geometry patterns. Spiritual and psychedelic fusion.",
        "stock": 41,
        "isFeatured": false
    },
    {
        "name": "Rainbow Mushroom T-Shirt",
        "category": TSHIRT_CATEGORIES.SHROOMS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/rainbow-shrooms-1.jpg",
            "https://example.com/images/rainbow-shrooms-2.jpg"
        ],
        "description": "Colorful rainbow mushrooms with sparkles. Vibrant and joyful design.",
        "stock": 46,
        "isFeatured": true
    },

    // ========== LSD CATEGORY (6 products) ==========
    {
        "name": "Fractal LSD T-Shirt",
        "category": TSHIRT_CATEGORIES.LSD,
        "sizes": ["S", "M", "L", "XL"],
        "price": 899,
        "images": [
            "https://example.com/images/fractal-lsd-1.jpg",
            "https://example.com/images/fractal-lsd-2.jpg"
        ],
        "description": "Mind-bending fractal patterns in vibrant colors. Perfect for festival season.",
        "stock": 52,
        "isFeatured": true
    },
    {
        "name": "LSD Trip Abstract T-Shirt",
        "category": TSHIRT_CATEGORIES.LSD,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/lsd-abstract-1.jpg",
            "https://example.com/images/lsd-abstract-2.jpg"
        ],
        "description": "Trippy abstract design inspired by psychedelic art. Comfortable and breathable fabric.",
        "stock": 45,
        "isFeatured": false
    },
    {
        "name": "Kaleidoscope Vision T-Shirt",
        "category": TSHIRT_CATEGORIES.LSD,
        "sizes": ["S", "M", "L", "XL"],
        "price": 899,
        "images": [
            "https://example.com/images/kaleidoscope-1.jpg",
            "https://example.com/images/kaleidoscope-2.jpg"
        ],
        "description": "Mesmerizing kaleidoscope patterns that shift and swirl. Hypnotic visual experience.",
        "stock": 48,
        "isFeatured": true
    },
    {
        "name": "Psychedelic Eye T-Shirt",
        "category": TSHIRT_CATEGORIES.LSD,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/psychedelic-eye-1.jpg",
            "https://example.com/images/psychedelic-eye-2.jpg"
        ],
        "description": "All-seeing eye with trippy patterns and colors. Consciousness expanding design.",
        "stock": 40,
        "isFeatured": false
    },
    {
        "name": "Melting Reality T-Shirt",
        "category": TSHIRT_CATEGORIES.LSD,
        "sizes": ["S", "M", "L", "XL"],
        "price": 899,
        "images": [
            "https://example.com/images/melting-reality-1.jpg",
            "https://example.com/images/melting-reality-2.jpg"
        ],
        "description": "Reality melting into abstract forms. Surreal and mind-altering visual.",
        "stock": 43,
        "isFeatured": true
    },
    {
        "name": "Cosmic Waves T-Shirt",
        "category": TSHIRT_CATEGORIES.LSD,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/cosmic-waves-1.jpg",
            "https://example.com/images/cosmic-waves-2.jpg"
        ],
        "description": "Flowing cosmic waves in neon colors. Fluid and dynamic psychedelic art.",
        "stock": 47,
        "isFeatured": false
    },

    // ========== CHAKRAS CATEGORY (6 products) ==========
    {
        "name": "Seven Chakras T-Shirt",
        "category": TSHIRT_CATEGORIES.CHAKRAS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/seven-chakras-1.jpg",
            "https://example.com/images/seven-chakras-2.jpg"
        ],
        "description": "Beautiful chakra alignment design with all seven energy centers. Perfect for yoga and meditation.",
        "stock": 60,
        "isFeatured": true
    },
    {
        "name": "Chakra Mandala T-Shirt",
        "category": TSHIRT_CATEGORIES.CHAKRAS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/chakra-mandala-1.jpg",
            "https://example.com/images/chakra-mandala-2.jpg"
        ],
        "description": "Intricate mandala design with chakra symbols. Spiritual and artistic.",
        "stock": 55,
        "isFeatured": false
    },
    {
        "name": "Lotus Chakra T-Shirt",
        "category": TSHIRT_CATEGORIES.CHAKRAS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/lotus-chakra-1.jpg",
            "https://example.com/images/lotus-chakra-2.jpg"
        ],
        "description": "Lotus flower with chakra points. Symbol of spiritual awakening and purity.",
        "stock": 50,
        "isFeatured": true
    },
    {
        "name": "Kundalini Rising T-Shirt",
        "category": TSHIRT_CATEGORIES.CHAKRAS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/kundalini-1.jpg",
            "https://example.com/images/kundalini-2.jpg"
        ],
        "description": "Kundalini serpent rising through chakras. Energy awakening and transformation.",
        "stock": 45,
        "isFeatured": false
    },
    {
        "name": "Rainbow Chakra Balance T-Shirt",
        "category": TSHIRT_CATEGORIES.CHAKRAS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/rainbow-chakra-1.jpg",
            "https://example.com/images/rainbow-chakra-2.jpg"
        ],
        "description": "Rainbow colored chakras in perfect balance. Harmony and healing energy.",
        "stock": 58,
        "isFeatured": true
    },
    {
        "name": "Meditation Chakra T-Shirt",
        "category": TSHIRT_CATEGORIES.CHAKRAS,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/meditation-chakra-1.jpg",
            "https://example.com/images/meditation-chakra-2.jpg"
        ],
        "description": "Meditating figure with glowing chakras. Inner peace and spiritual growth.",
        "stock": 52,
        "isFeatured": false
    },

    // ========== DARK CATEGORY (6 products) ==========
    {
        "name": "Dark Skull T-Shirt",
        "category": TSHIRT_CATEGORIES.DARK,
        "sizes": ["S", "M", "L", "XL"],
        "price": 749,
        "images": [
            "https://example.com/images/dark-skull-1.jpg",
            "https://example.com/images/dark-skull-2.jpg"
        ],
        "description": "Gothic skull design with dark aesthetic. Premium quality black cotton T-shirt.",
        "stock": 55,
        "isFeatured": true
    },
    {
        "name": "Dark Raven T-Shirt",
        "category": TSHIRT_CATEGORIES.DARK,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/dark-raven-1.jpg",
            "https://example.com/images/dark-raven-2.jpg"
        ],
        "description": "Mysterious raven design with dark gothic elements. Hauntingly beautiful.",
        "stock": 48,
        "isFeatured": false
    },
    {
        "name": "Grim Reaper T-Shirt",
        "category": TSHIRT_CATEGORIES.DARK,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/grim-reaper-1.jpg",
            "https://example.com/images/grim-reaper-2.jpg"
        ],
        "description": "Detailed grim reaper with scythe. Dark and powerful imagery.",
        "stock": 42,
        "isFeatured": true
    },
    {
        "name": "Dark Moon Wolf T-Shirt",
        "category": TSHIRT_CATEGORIES.DARK,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/dark-wolf-1.jpg",
            "https://example.com/images/dark-wolf-2.jpg"
        ],
        "description": "Wolf howling at the dark moon. Wild and mysterious design.",
        "stock": 50,
        "isFeatured": false
    },
    {
        "name": "Gothic Cross T-Shirt",
        "category": TSHIRT_CATEGORIES.DARK,
        "sizes": ["S", "M", "L", "XL"],
        "price": 749,
        "images": [
            "https://example.com/images/gothic-cross-1.jpg",
            "https://example.com/images/gothic-cross-2.jpg"
        ],
        "description": "Ornate gothic cross with intricate details. Dark religious symbolism.",
        "stock": 46,
        "isFeatured": false
    },
    {
        "name": "Shadow Demon T-Shirt",
        "category": TSHIRT_CATEGORIES.DARK,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/shadow-demon-1.jpg",
            "https://example.com/images/shadow-demon-2.jpg"
        ],
        "description": "Demonic shadow figure emerging from darkness. Intense and edgy design.",
        "stock": 40,
        "isFeatured": true
    },

    // ========== RICK N MORTY CATEGORY (6 products) ==========
    {
        "name": "Rick and Morty Portal T-Shirt",
        "category": TSHIRT_CATEGORIES.RICK_N_MORTY,
        "sizes": ["S", "M", "L", "XL"],
        "price": 899,
        "images": [
            "https://example.com/images/rick-morty-portal-1.jpg",
            "https://example.com/images/rick-morty-portal-2.jpg"
        ],
        "description": "Official Rick and Morty portal design. Get schwifty with this awesome T-shirt!",
        "stock": 65,
        "isFeatured": true
    },
    {
        "name": "Get Schwifty T-Shirt",
        "category": TSHIRT_CATEGORIES.RICK_N_MORTY,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/get-schwifty-1.jpg",
            "https://example.com/images/get-schwifty-2.jpg"
        ],
        "description": "Iconic 'Get Schwifty' design from Rick and Morty. Time to get schwifty in here!",
        "stock": 60,
        "isFeatured": true
    },
    {
        "name": "Pickle Rick T-Shirt",
        "category": TSHIRT_CATEGORIES.RICK_N_MORTY,
        "sizes": ["S", "M", "L", "XL"],
        "price": 899,
        "images": [
            "https://example.com/images/pickle-rick-1.jpg",
            "https://example.com/images/pickle-rick-2.jpg"
        ],
        "description": "I'm Pickle Rick! Funniest episode ever. Premium quality print.",
        "stock": 70,
        "isFeatured": true
    },
    {
        "name": "Wubba Lubba Dub Dub T-Shirt",
        "category": TSHIRT_CATEGORIES.RICK_N_MORTY,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/wubba-lubba-1.jpg",
            "https://example.com/images/wubba-lubba-2.jpg"
        ],
        "description": "Rick's catchphrase with character art. Classic Rick and Morty humor.",
        "stock": 55,
        "isFeatured": false
    },
    {
        "name": "Mr. Meeseeks T-Shirt",
        "category": TSHIRT_CATEGORIES.RICK_N_MORTY,
        "sizes": ["S", "M", "L", "XL"],
        "price": 849,
        "images": [
            "https://example.com/images/meeseeks-1.jpg",
            "https://example.com/images/meeseeks-2.jpg"
        ],
        "description": "I'm Mr. Meeseeks, look at me! Hilarious character design.",
        "stock": 58,
        "isFeatured": false
    },
    {
        "name": "Szechuan Sauce T-Shirt",
        "category": TSHIRT_CATEGORIES.RICK_N_MORTY,
        "sizes": ["S", "M", "L", "XL"],
        "price": 799,
        "images": [
            "https://example.com/images/szechuan-1.jpg",
            "https://example.com/images/szechuan-2.jpg"
        ],
        "description": "That's my series arc, Morty! Szechuan sauce reference design.",
        "stock": 52,
        "isFeatured": true
    }
];
