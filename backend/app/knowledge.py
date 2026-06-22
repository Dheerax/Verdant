"""Curated agronomy knowledge base for the AI Advisor.

Each entry is a question/answer pair with a topic. The advisor embeds every
question with a sentence-transformer and returns the closest match — so the
user can phrase things freely and still hit the right answer.
"""

KB: list[dict] = [
    # --- Lettuce / leafy ---
    {"topic": "Lettuce", "q": "What EC and pH suit lettuce?",
     "a": "Lettuce is happiest at a low EC of 0.8–1.2 mS/cm and pH 5.8–6.2. Keep nutrient strength gentle — high EC makes leaves bitter and invites tip-burn. Hold water temperature near 18–20°C to keep dissolved oxygen high."},
    {"topic": "Lettuce", "q": "Why does my lettuce have brown leaf tips (tip burn)?",
     "a": "Tip-burn is a calcium-transport problem, not always a calcium shortage. It spikes when growth is fast, humidity is high, and airflow is low. Add gentle air movement over the canopy, avoid EC above 1.4, and keep VPD around 0.8–1.0 kPa."},
    {"topic": "Lettuce", "q": "What temperature is best for growing lettuce?",
     "a": "Aim for 18–22°C day and 15–18°C night. Above 24°C lettuce tends to bolt (flower) and turn bitter. Cooler racks near the floor are ideal for leafy greens."},

    # --- Nutrients ---
    {"topic": "Nutrients", "q": "What do N, P and K do for plants?",
     "a": "Nitrogen (N) drives leafy green growth, Phosphorus (P) powers roots and flowering, and Potassium (K) governs fruit quality and overall stress resistance. Leafy crops want more N; fruiting crops shift toward more P and K once flowering."},
    {"topic": "Nutrients", "q": "How do I read nutrient deficiency from leaves?",
     "a": "Yellowing of OLD lower leaves usually means nitrogen deficiency (mobile nutrient). Yellowing between veins of NEW leaves points to iron or magnesium. Purpling stems hint at phosphorus shortage. Brown leaf margins often mean potassium."},
    {"topic": "Nutrients", "q": "How often should I change hydroponic nutrient solution?",
     "a": "Top up daily to replace what plants drink, and fully replace the reservoir every 1–2 weeks. Replace sooner if EC drifts unpredictably or the solution smells off. Always check pH after refilling."},
    {"topic": "Nutrients", "q": "What is EC and why does it matter?",
     "a": "EC (electrical conductivity) measures how much dissolved nutrient is in your water. Too low and plants starve; too high and roots can't take up water (osmotic stress). Match EC to crop and stage: ~1.0 for seedlings/lettuce, ~2.0–2.5 for fruiting tomatoes."},

    # --- pH ---
    {"topic": "pH", "q": "What pH range is best for hydroponics?",
     "a": "Most hydroponic crops absorb nutrients best between pH 5.5 and 6.5. Outside that window nutrients 'lock out' even if present. Check pH daily — it drifts up as plants feed."},
    {"topic": "pH", "q": "How do I lower or raise pH safely?",
     "a": "Use commercial pH-Down (phosphoric acid) or pH-Up (potassium hydroxide) in tiny doses, stir, wait a few minutes, then re-measure. Never chase the number with big additions — small, repeated tweaks are safer."},

    # --- Light ---
    {"topic": "Light", "q": "What light cycle is best for basil?",
     "a": "Basil loves light: give it 14–16 hours per day at a PPFD of roughly 250–400 µmol/m²/s. More light means faster, bushier growth — just keep temperature and water in step so it isn't stressed."},
    {"topic": "Light", "q": "What is DLI and what should it be?",
     "a": "DLI (Daily Light Integral) is total light delivered per day. Leafy greens thrive around 12–17 mol/m²/day; fruiting crops like tomato want 20–30. You can hit the same DLI with moderate light over more hours."},
    {"topic": "Light", "q": "How far should LED grow lights be from plants?",
     "a": "It depends on wattage, but a common starting point for mid-power LED panels is 30–45 cm above the canopy. Watch for bleaching (too close) or stretching/leggy stems (too far) and adjust."},

    # --- Pests ---
    {"topic": "Pests", "q": "How do I get rid of aphids indoors?",
     "a": "Knock numbers down with a spray of water + a few drops of insecticidal soap, isolate affected plants, and introduce ladybugs or lacewings if you can. Sticky yellow traps catch the winged adults. Check undersides of leaves daily."},
    {"topic": "Pests", "q": "What are spider mites and how do I control them?",
     "a": "Spider mites are tiny sap-suckers that thrive in hot, dry air and leave fine webbing and speckled leaves. Raise humidity, rinse leaves, and use insecticidal soap or predatory mites (Phytoseiulus). They breed fast — act early."},
    {"topic": "Pests", "q": "How do I prevent fungus gnats?",
     "a": "Fungus gnats breed in constantly wet media. Let the top layer dry between waterings, add a layer of coarse perlite or sand on top, use sticky traps, and apply BTI (Bacillus thuringiensis israelensis) to kill larvae."},

    # --- Disease ---
    {"topic": "Disease", "q": "How do I prevent root rot in hydroponics?",
     "a": "Root rot (often Pythium) loves warm, low-oxygen water. Keep reservoir temperature below 21°C, oxygenate with an air stone, keep light off the solution to stop algae, and consider beneficial microbes. Healthy roots are white and firm, not brown and slimy."},
    {"topic": "Disease", "q": "What is powdery mildew and how do I treat it?",
     "a": "Powdery mildew is a white dusty fungus on leaves, encouraged by high humidity and poor airflow. Improve ventilation, lower humidity, remove affected leaves, and treat with a potassium-bicarbonate or biofungicide spray. Avoid wetting foliage."},
    {"topic": "Disease", "q": "How do I deal with late blight on tomatoes?",
     "a": "Late blight spreads explosively in cool, wet conditions. Remove and bag infected foliage immediately (don't compost), drop humidity below 80%, boost airflow, and apply a copper or biofungicide on a 5–7 day cycle. Water at the roots, never the leaves."},

    # --- Microgreens ---
    {"topic": "Microgreens", "q": "When are microgreens ready to harvest?",
     "a": "Most microgreens are ready 7–14 days after sowing, once the first true leaves appear. Pea and sunflower shoots can go a little longer. Harvest with clean scissors just above the soil line in the morning for best crispness."},
    {"topic": "Microgreens", "q": "Why are my microgreens getting mold?",
     "a": "Mould (fuzzy, often with a musty smell) comes from overwatering, poor airflow and over-sowing. Bottom-water instead of misting, thin your seed density, add a fan, and keep ambient humidity around 50–60% after germination."},

    # --- Tomato / fruiting ---
    {"topic": "Tomato", "q": "How can I boost tomato yield indoors?",
     "a": "Maximise light (DLI 20–30), hand-pollinate by gently vibrating flowers, keep night temps 16–18°C, raise EC to 2.0–2.5 at fruiting, and ensure steady calcium to prevent blossom-end rot. Prune suckers to focus energy on fruit."},
    {"topic": "Tomato", "q": "What causes blossom-end rot?",
     "a": "Blossom-end rot — the sunken black patch on the bottom of fruit — is a calcium delivery failure, usually from uneven watering or EC swings. Keep moisture and feeding steady and make sure calcium is in your nutrient mix."},
    {"topic": "Tomato", "q": "How do I pollinate tomatoes without bees?",
     "a": "Tomatoes are self-fertile but need movement. Gently shake the flower trusses daily, use a soft brush, or run an electric toothbrush against the stem behind open flowers. A small oscillating fan helps too."},

    # --- Systems ---
    {"topic": "Systems", "q": "What is the difference between NFT and DWC?",
     "a": "NFT (Nutrient Film Technique) flows a thin stream of nutrient past bare roots in channels — great for light, fast leafy crops. DWC (Deep Water Culture) suspends roots in oxygenated nutrient water — superb for larger, thirsty plants. Both need reliable aeration."},
    {"topic": "Systems", "q": "Which hydroponic system is best for beginners?",
     "a": "Deep Water Culture (DWC) or a simple Kratky jar is the gentlest start — few moving parts and forgiving of mistakes. Once comfortable, NFT and ebb-and-flow scale up nicely for a vertical rack."},
    {"topic": "Systems", "q": "What growing medium should I use?",
     "a": "Rockwool and coco coir are popular for seedlings; clay pebbles (LECA) suit DWC and ebb-and-flow; peat or coco plugs are great for microgreens. Choose by water retention vs aeration needs of your crop."},

    # --- Climate ---
    {"topic": "Climate", "q": "What humidity should my grow room be?",
     "a": "Seedlings like 65–75% humidity, leafy growth 55–65%, and fruiting/ripening 45–55%. High humidity plus still air invites mildew, so pair your target with steady airflow."},
    {"topic": "Climate", "q": "Should I add CO2 to my grow space?",
     "a": "CO₂ enrichment to ~800–1200 ppm can lift growth — but only if light, water and nutrients are already optimal, and the space is sealed. Without strong light it's wasted. Never exceed safe levels for an occupied room."},
    {"topic": "Climate", "q": "What is VPD and why does it matter?",
     "a": "VPD (Vapour Pressure Deficit) blends temperature and humidity into one 'how thirsty is the air' number. Aim for ~0.8–1.0 kPa for leafy growth and ~1.0–1.2 for fruiting. Good VPD keeps transpiration and nutrient uptake steady."},

    # --- Water ---
    {"topic": "Water", "q": "Can I use tap water for hydroponics?",
     "a": "Often yes, but let it sit 24h to off-gas chlorine, or use a filter for chloramine. Check starting EC — hard water adds background minerals that affect your nutrient dosing. RO water gives the most control."},
    {"topic": "Water", "q": "What water temperature is ideal for roots?",
     "a": "Keep nutrient solution between 18–21°C. Warm water holds less oxygen and breeds pathogens like Pythium; very cold water shocks roots and slows uptake."},

    # --- General / vertical farming ---
    {"topic": "General", "q": "Why is vertical farming more sustainable?",
     "a": "Vertical farms recirculate water (up to ~95% savings), grow without pesticides, and sit inside cities — cutting food miles and spoilage. Stacking multiplies yield per square metre, so far less land is needed per kilo of food."},
    {"topic": "General", "q": "How much faster do plants grow in hydroponics?",
     "a": "With roots fed an optimal nutrient solution and ideal light, many crops grow 30–50% faster than in soil and can be planted more densely — which is why a controlled vertical farm out-yields a field many times over per area."},
    {"topic": "General", "q": "What crops are easiest to grow in a vertical farm?",
     "a": "Start with lettuce, kale, chard, basil and other herbs, plus fast microgreens — they're forgiving, quick, and high value. Move on to fruiting crops like tomatoes, peppers and strawberries as you master climate control."},
]
