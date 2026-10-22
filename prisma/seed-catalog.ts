export type Concentration = "EDT" | "EDP" | "PARFUM" | "COLOGNE";
export type Gender = "MEN" | "WOMEN" | "UNISEX";

export type CatalogProduct = {
  brand: string;
  name: string;
  concentration: Concentration;
  gender: Gender;
  category: string;
  price: number;
  scentFamily: string;
  description: string;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  compareAtPrice?: number;
};

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productSlug(brandSlug: string, name: string): string {
  return `${brandSlug}-${slugify(name)}`;
}

export const EXTRA_BRANDS: { name: string; slug: string; description: string }[] = [
  { name: "Hermès", slug: "hermes", description: "Parisian maison with equestrian roots." },
  { name: "Guerlain", slug: "guerlain", description: "French haute parfumerie since 1828." },
  { name: "Issey Miyake", slug: "issey-miyake", description: "Japanese minimalism in scent." },
  { name: "Kenzo", slug: "kenzo", description: "Playful Parisian house with Japanese roots." },
  { name: "Bvlgari", slug: "bvlgari", description: "Roman jeweller's fragrances." },
  { name: "Prada", slug: "prada", description: "Milanese luxury, reinterpreted." },
  { name: "Dolce & Gabbana", slug: "dolce-gabbana", description: "Sicilian glamour and passion." },
  { name: "Calvin Klein", slug: "calvin-klein", description: "American minimalism." },
  { name: "Ralph Lauren", slug: "ralph-lauren", description: "American refined lifestyle scents." },
  { name: "Burberry", slug: "burberry", description: "British heritage house." },
  { name: "Givenchy", slug: "givenchy", description: "Parisian couture elegance." },
  { name: "Valentino", slug: "valentino", description: "Italian couture drama." },
  { name: "Carolina Herrera", slug: "carolina-herrera", description: "Venezuelan-American elegance." },
  { name: "Mugler", slug: "mugler", description: "Avant-garde French fragrances." },
  { name: "Jean Paul Gaultier", slug: "jean-paul-gaultier", description: "Enfant terrible of French fashion." },
  { name: "Viktor & Rolf", slug: "viktor-rolf", description: "Dutch conceptual couture." },
  { name: "Jo Malone", slug: "jo-malone", description: "British fragrance layering house." },
  { name: "Diptyque", slug: "diptyque", description: "Parisian artisanal perfumery." },
  { name: "Maison Margiela", slug: "maison-margiela", description: "Belgian avant-garde." },
  { name: "Byredo", slug: "byredo", description: "Stockholm niche perfumery." },
  { name: "Acqua di Parma", slug: "acqua-di-parma", description: "Italian cologne tradition since 1916." },
  { name: "Amouage", slug: "amouage", description: "Omani royal fragrance house." },
  { name: "Xerjoff", slug: "xerjoff", description: "Italian ultra-niche luxury." },
  { name: "Initio", slug: "initio", description: "Magnetic niche perfumery." },
  { name: "Parfums de Marly", slug: "parfums-de-marly", description: "French royal-inspired niche." },
  { name: "Nishane", slug: "nishane", description: "Istanbul niche house." },
  { name: "Kilian", slug: "kilian", description: "Parisian luxury gourmands." },
  { name: "Frederic Malle", slug: "frederic-malle", description: "Editions de parfums, perfumers as authors." },
  { name: "Penhaligon's", slug: "penhaligons", description: "British perfumery since 1870." },
  { name: "Estée Lauder", slug: "estee-lauder", description: "American beauty house." },
  { name: "Marc Jacobs", slug: "marc-jacobs", description: "Playful American fashion." },
  { name: "Montblanc", slug: "montblanc", description: "German luxury house and scent." },
  { name: "Hugo Boss", slug: "hugo-boss", description: "German tailoring and fragrance." },
  { name: "Azzaro", slug: "azzaro", description: "Mediterranean French glamour." },
  { name: "Lalique", slug: "lalique", description: "French crystal and perfume art." },
  { name: "Mancera", slug: "mancera", description: "Paris niche house with long-lasting blends." },
  { name: "Lattafa", slug: "lattafa", description: "Saudi Arabian fragrance house." },
  { name: "Armaf", slug: "armaf", description: "UAE fragrance house." },
  { name: "Al Haramain", slug: "al-haramain", description: "Emirati perfume tradition." },
  { name: "Chloé", slug: "chloe", description: "Parisian feminine ready-to-wear." },
  { name: "Serge Lutens", slug: "serge-lutens", description: "Artistic niche perfumery." },
];

export const EXTRA_NOTES: { name: string; type: "TOP" | "HEART" | "BASE" }[] = [
  { name: "Orange", type: "TOP" },
  { name: "Mandarin", type: "TOP" },
  { name: "Lime", type: "TOP" },
  { name: "Grapefruit", type: "TOP" },
  { name: "Yuzu", type: "TOP" },
  { name: "Pomegranate", type: "TOP" },
  { name: "Blackcurrant", type: "TOP" },
  { name: "Black Pepper", type: "TOP" },
  { name: "Pear", type: "TOP" },
  { name: "Pineapple", type: "TOP" },
  { name: "Peach", type: "TOP" },
  { name: "Cherry", type: "TOP" },
  { name: "Plum", type: "TOP" },
  { name: "Raspberry", type: "TOP" },
  { name: "Strawberry", type: "TOP" },
  { name: "Lychee", type: "TOP" },
  { name: "Aldehydes", type: "TOP" },
  { name: "Mint", type: "TOP" },
  { name: "Ginger", type: "TOP" },
  { name: "Cardamom", type: "TOP" },
  { name: "Saffron", type: "TOP" },
  { name: "Nutmeg", type: "TOP" },
  { name: "Cinnamon", type: "TOP" },
  { name: "Sea Notes", type: "TOP" },
  { name: "Green Notes", type: "TOP" },
  { name: "Fig", type: "TOP" },
  { name: "Coconut", type: "TOP" },
  { name: "Tea", type: "TOP" },
  { name: "Neroli", type: "TOP" },
  { name: "Basil", type: "TOP" },
  { name: "Mango", type: "TOP" },
  { name: "Melon", type: "TOP" },
  { name: "Cumin", type: "TOP" },
  { name: "Cypress", type: "TOP" },
  { name: "Ambrette", type: "TOP" },
  { name: "Rum", type: "TOP" },
  { name: "Almond", type: "TOP" },
  { name: "Clove", type: "TOP" },
  { name: "Coriander", type: "TOP" },
  { name: "Tuberose", type: "HEART" },
  { name: "Peony", type: "HEART" },
  { name: "Magnolia", type: "HEART" },
  { name: "Lotus", type: "HEART" },
  { name: "Violet", type: "HEART" },
  { name: "Geranium", type: "HEART" },
  { name: "Sage", type: "HEART" },
  { name: "Orange Blossom", type: "HEART" },
  { name: "Tobacco", type: "HEART" },
  { name: "Coffee", type: "HEART" },
  { name: "Rosemary", type: "HEART" },
  { name: "Freesia", type: "HEART" },
  { name: "Lily", type: "HEART" },
  { name: "Lilac", type: "HEART" },
  { name: "Pine", type: "HEART" },
  { name: "Chestnut", type: "HEART" },
  { name: "Dates", type: "HEART" },
  { name: "Tonka Bean", type: "BASE" },
  { name: "Patchouli", type: "BASE" },
  { name: "Incense", type: "BASE" },
  { name: "Leather", type: "BASE" },
  { name: "Ambergris", type: "BASE" },
  { name: "Ambroxan", type: "BASE" },
  { name: "Amberwood", type: "BASE" },
  { name: "Praline", type: "BASE" },
  { name: "Honey", type: "BASE" },
  { name: "Cacao", type: "BASE" },
  { name: "Cashmere Wood", type: "BASE" },
  { name: "Oakmoss", type: "BASE" },
  { name: "Suede", type: "BASE" },
  { name: "Caramel", type: "BASE" },
];

export function p(
  brand: string,
  name: string,
  concentration: Concentration,
  gender: Gender,
  category: string,
  price: number,
  scentFamily: string,
  description: string,
  notesTop: string,
  notesHeart: string,
  notesBase: string,
  compareAtPrice?: number
): CatalogProduct {
  return { brand, name, concentration, gender, category, price, scentFamily, description, notesTop, notesHeart, notesBase, compareAtPrice };
}

export const CATALOG: CatalogProduct[] = [
  p("chanel", "Chance EDT", "EDT", "WOMEN", "women", 155000, "floral", "Citrus and white musk with a playful pink pepper spark. An eternally optimistic signature.", "Pink Pepper, Lemon", "Jasmine, Iris", "Musk, Vanilla"),
  p("chanel", "Chance Eau Tendre EDT", "EDT", "WOMEN", "women", 145000, "floral", "Soft quince and white musk. A tender, breezy everyday floral.", "Pear", "Jasmine, Freesia", "Musk, Cedarwood", 165000),
  p("chanel", "Chance Eau Fraîche EDT", "EDT", "WOMEN", "women", 145000, "fresh", "Watermelon and citrus over clean musk. Sheer and energetic.", "Melon, Lemon", "Jasmine, Freesia", "Musk, Cedarwood"),
  p("chanel", "Coco Mademoiselle EDP", "EDP", "WOMEN", "women", 185000, "oriental", "Patchouli and orange over white flowers. A bold modern classic for women.", "Orange, Bergamot", "Rose, Jasmine", "Patchouli, Vetiver"),
  p("chanel", "No.19 EDP", "EDP", "WOMEN", "women", 175000, "floral", "Galbanum and iris with a crisp green edge. Chanel's sharpest feminine.", "Bergamot, Lemon", "Iris, Rose", "Vetiver, Sandalwood"),
  p("chanel", "Égoïste EDT", "EDT", "MEN", "men", 140000, "woody", "Sandalwood and rose with a spicy cinnamon lift. Uniquely refined for men.", "Mandarin, Cinnamon", "Rose, Sandalwood", "Tonka Bean, Amber"),
  p("chanel", "Platinum Égoïste EDT", "EDT", "MEN", "men", 145000, "aromatic", "Lavender and citrus with a metallic fresh finish. Crisp and confident.", "Lemon, Lavender", "Rosemary, Geranium", "Cedarwood, Musk"),
  p("chanel", "Allure Homme Edition Blanche EDT", "EDT", "MEN", "men", 150000, "citrus", "Bright lemon and creamy sandalwood. A solar twist on a masculine classic.", "Lemon, Bergamot", "Ginger, Sandalwood", "Tonka Bean, Vanilla"),

  p("dior", "Sauvage EDP", "EDP", "MEN", "men", 175000, "woody", "Calabrian bergamot and ambroxan with a smoky vanilla drydown. A global best-seller.", "Bergamot", "Sichuan Pepper, Lavender", "Ambroxan, Vanilla"),
  p("dior", "Sauvage Elixir", "PARFUM", "MEN", "men", 245000, "spicy", "Spiced lavender and cinnamon in a rich, long-wearing elixir. Intense and magnetic.", "Grapefruit, Cinnamon", "Lavender, Nutmeg", "Amber, Sandalwood", 275000),
  p("dior", "Fahrenheit EDT", "EDT", "MEN", "men", 130000, "leather", "Violet and leather with a daring edge. A bold 1988 icon.", "Bergamot, Lavender", "Violet, Cedarwood", "Leather, Vetiver"),
  p("dior", "Dior Homme EDT", "EDT", "MEN", "men", 145000, "woody", "Iris and cocoa with a refined masculine silhouette. Parisian elegance in scent.", "Lavender, Bergamot", "Iris, Cacao", "Patchouli, Vetiver"),
  p("dior", "Hypnotic Poison EDP", "EDP", "WOMEN", "women", 155000, "oriental", "Almond and vanilla with a dark jasmine heart. Seductive and instantly recognizable.", "Plum, Peach", "Jasmine, Almond", "Vanilla, Sandalwood"),
  p("dior", "Poison Girl EDP", "EDP", "WOMEN", "women", 155000, "gourmand", "Bitter orange and tonka with a rosy gourmand finish. Playful with a dangerous edge.", "Orange", "Rose, Almond", "Tonka Bean, Vanilla", 175000),
  p("dior", "Miss Dior EDP", "EDP", "WOMEN", "women", 170000, "floral", "Centifolia rose with a lily-of-the-valley freshness. Romance bottled.", "Mandarin, Bergamot", "Rose, Peony", "Musk, Patchouli"),
  p("dior", "Addict EDP", "EDP", "WOMEN", "women", 160000, "oriental", "Vanilla and tonka with a night-blooming jasmine heart. Glamorous and warm.", "Orange Blossom", "Jasmine, Rose", "Vanilla, Tonka Bean"),
  p("dior", "Dune EDT", "EDT", "WOMEN", "women", 125000, "fresh", "Sea breeze and bergamot over warm woods. Sunlit Mediterranean freshness.", "Bergamot, Mandarin", "Sea Notes, Jasmine", "Sandalwood, Amber"),

  p("creed", "Royal Oud EDP", "EDP", "UNISEX", "niche", 550000, "woody", "Royal oud with lemon and pink pepper. Regal, dry, and impeccably polished.", "Lemon, Pink Pepper", "Oud, Cedarwood", "Sandalwood, Musk"),
  p("creed", "Green Irish Tweed EDT", "EDT", "UNISEX", "niche", 480000, "fresh", "Green grass and iris with a cool woody base. The gentleman's sport scent.", "Lemon, Bergamot", "Iris, Violet", "Sandalwood, Ambergris"),
  p("creed", "Neroli Sauvage EDT", "EDT", "UNISEX", "niche", 450000, "citrus", "Sparkling neroli with a woody amber base. Mediterranean sunshine distilled.", "Bergamot, Neroli", "Orange Blossom", "Ambergris, Musk"),
  p("creed", "Himalaya EDT", "EDT", "UNISEX", "niche", 470000, "fresh", "Crisp citrus and conifer over smooth musk. Alpine air in a flacon.", "Grapefruit, Bergamot", "Nutmeg, Green Notes", "Musk, Sandalwood"),
  p("creed", "Millésime Impérial EDT", "EDT", "UNISEX", "niche", 500000, "aquatic", "A salty golden blend of citrus and sea spray. Regal aquatic luxury.", "Bergamot, Lemon", "Sea Notes, Iris", "Musk, Ambergris", 560000),

  p("tom-ford", "Neroli Portofino EDP", "EDP", "UNISEX", "niche", 420000, "citrus", "Vivid neroli and amber. Riviera summer in a crystal bottle.", "Bergamot, Lemon", "Neroli, Orange Blossom", "Amber, Musk"),
  p("tom-ford", "Soleil Blanc EDP", "EDP", "UNISEX", "niche", 400000, "floral", "Solar florals with rich amber. A private-island summer glow.", "Bergamot, Pink Pepper", "Ylang-Ylang, Tuberose", "Amber, Sandalwood"),
  p("tom-ford", "Velvet Orchid EDP", "EDP", "WOMEN", "niche", 380000, "floral", "Black orchid and honey with a rum-laced heart. Darkly opulent.", "Honey, Mandarin", "Violet, Jasmine", "Vanilla, Incense"),
  p("tom-ford", "Ombre Leather EDP", "EDP", "UNISEX", "niche", 420000, "leather", "Supple leather with jasmine and amber. Raw, tactile, magnetic.", "Cardamom", "Jasmine, Leather", "Amber, Patchouli"),
  p("tom-ford", "Rose Prick EDP", "EDP", "UNISEX", "niche", 430000, "floral", "Three roses spiked with Sichuan pepper. A thorny, modern rose.", "Sichuan Pepper, Pink Pepper", "Rose, Peony", "Patchouli, Tonka Bean"),
  p("tom-ford", "Lost Cherry EDP", "EDP", "UNISEX", "niche", 450000, "gourmand", "Black cherry with almond and tonka. A giddy rush of sweet indulgence.", "Cherry, Almond", "Rose, Jasmine", "Tonka Bean, Vanilla", 495000),
  p("tom-ford", "Bitter Peach EDP", "EDP", "UNISEX", "niche", 440000, "fruity", "Ripe peach with cardamom and vanilla. Juicy, boozy, irresistible.", "Peach, Cardamom", "Jasmine, Rum", "Vanilla, Sandalwood"),

  p("ysl", "La Nuit de L'Homme EDT", "EDT", "MEN", "men", 150000, "spicy", "Cardamom and lavender with a warm cedar base. Evening sophistication.", "Cardamom, Bergamot", "Lavender, Cedarwood", "Vetiver, Tonka Bean"),
  p("ysl", "L'Homme EDT", "EDT", "MEN", "men", 145000, "woody", "Ginger and bergamot over smooth woods. Elegant and universally flattering.", "Bergamot, Ginger", "Violet, Geranium", "Cedarwood, Vetiver"),
  p("ysl", "MYSLF EDP", "EDP", "MEN", "men", 165000, "aromatic", "Bright orange blossom with a modern amberwood base. Fresh, confident, clean.", "Bergamot, Mandarin", "Orange Blossom", "Ambroxan, Cedarwood", 185000),
  p("ysl", "Libre EDP", "EDP", "WOMEN", "women", 175000, "floral", "Lavender and orange blossom with a vanilla-oud base. Freedom in scent.", "Bergamot, Mandarin", "Lavender, Jasmine", "Vanilla, Oud"),
  p("ysl", "Opium EDP", "EDP", "WOMEN", "women", 165000, "oriental", "Spiced orange blossom with patchouli. A daring 1977 legend.", "Mandarin, Orange", "Jasmine, Rose", "Patchouli, Sandalwood"),

  p("gucci", "Guilty Pour Femme EDP", "EDP", "WOMEN", "women", 150000, "oriental", "Lilac and geranium with a warm amber base. Unapologetically glamorous.", "Mandarin, Pink Pepper", "Lilac, Geranium", "Amber, Patchouli"),
  p("gucci", "Flora Gorgeous Jasmine EDP", "EDP", "WOMEN", "women", 155000, "floral", "Sparkling jasmine with a sunny mandarin lift. Radiant and free-spirited.", "Mandarin, Pear", "Jasmine, Rose", "Sandalwood, Musk"),
  p("gucci", "Flora Gorgeous Gardenia EDP", "EDP", "WOMEN", "women", 155000, "floral", "Creamy gardenia with pear blossom. A joyful white floral escape.", "Pear, Pink Pepper", "Peony, Jasmine", "Musk, Sandalwood"),
  p("gucci", "Bamboo EDP", "EDP", "WOMEN", "women", 145000, "woody", "Citrus and ylang-ylang with a soft amber finish. Serene strength.", "Bergamot, Lemon", "Ylang-Ylang, Orange Blossom", "Amber, Sandalwood"),
  p("gucci", "Memoire d'une Odeur EDP", "EDP", "UNISEX", "unisex", 140000, "aromatic", "Roman chamomile with a mineral musk haze. A soft, dreamy signature.", "Melon, Almond", "Jasmine, Musk", "Musk, Cedarwood"),
  p("gucci", "Guilty Absolute EDT", "EDT", "MEN", "men", 140000, "leather", "Bergamot with a raw leather and cypress core. Dark, animalic, addictive.", "Bergamot, Lemon", "Leather, Patchouli", "Cypress, Amber"),

  p("armani", "Acqua di Gio Profondo EDP", "EDP", "MEN", "men", 165000, "aquatic", "Sea notes with aromatic rosemary. A deeper dive into Mediterranean water.", "Sea Notes, Bergamot", "Rosemary, Lavender", "Patchouli, Musk"),
  p("armani", "Code EDT", "EDT", "MEN", "men", 145000, "oriental", "Lavender and tonka with a mysterious orange blossom heart. Seductive Italian elegance.", "Bergamot, Lemon", "Lavender, Orange Blossom", "Tonka Bean, Leather"),
  p("armani", "Code Profumo EDP", "EDP", "MEN", "men", 160000, "oriental", "Cardamom and orange blossom in a deep, smoky amber. Night-out intensity.", "Cardamom, Bergamot", "Orange Blossom, Lavender", "Amber, Tonka Bean"),
  p("armani", "Si EDP", "EDP", "WOMEN", "women", 165000, "woody", "Blackcurrant nectar with patchouli and vanilla. Modern feminine chic.", "Blackcurrant, Mandarin", "Rose, Freesia", "Patchouli, Vanilla"),
  p("armani", "My Way EDP", "EDP", "WOMEN", "women", 165000, "floral", "Tuberose and jasmine with a vanilla base. A bouquet of discovery.", "Bergamot, Orange", "Tuberose, Jasmine", "Vanilla, Cedarwood", 185000),
  p("armani", "Stronger With You EDT", "EDT", "MEN", "men", 150000, "spicy", "Pink pepper and chestnut with vanilla. Bold togetherness in scent.", "Pink Pepper, Mandarin", "Sage, Pineapple", "Vanilla, Tonka Bean"),

  p("versace", "Eros Flame EDP", "EDP", "MEN", "men", 165000, "oriental", "Spicy citrus with rose and vanilla. Love turned up to maximum heat.", "Mandarin, Pink Pepper", "Rose, Geranium", "Vanilla, Tonka Bean"),
  p("versace", "Eros Pour Femme EDP", "EDP", "WOMEN", "women", 155000, "floral", "Pomegranate and lemon with a jasmine-vanilla heart. A goddess's trail.", "Pomegranate, Lemon", "Jasmine, Rose", "Musk, Sandalwood"),
  p("versace", "Dylan Blue EDT", "EDT", "MEN", "men", 135000, "aquatic", "Calabrian bergamot with ambroxan and patchouli. A modern aquatic classic.", "Bergamot, Grapefruit", "Fig, Ambroxan", "Patchouli, Musk"),
  p("versace", "Dylan Turquoise EDT", "EDT", "WOMEN", "women", 125000, "fresh", "Neroli and guava with a sparkling citrus start. Mediterranean holiday vibes.", "Neroli, Lemon", "Melon, Jasmine", "Cedarwood, Musk"),
  p("versace", "Crystal Noir EDT", "EDT", "WOMEN", "women", 130000, "oriental", "Ginger and gardenia over a warm amber base. Mysterious evening glamour.", "Ginger, Pink Pepper", "Peony, Rose", "Amber, Musk"),

  p("paco-rabanne", "Lady Million EDP", "EDP", "WOMEN", "women", 140000, "floral", "Honey and neroli with a patchouli base. Glamorous, golden, unforgettable.", "Neroli, Raspberry", "Jasmine, Orange Blossom", "Honey, Patchouli"),
  p("paco-rabanne", "Invictus EDT", "EDT", "MEN", "men", 125000, "aquatic", "Sea notes and grapefruit with a woody amber finish. A fresh victory.", "Grapefruit, Sea Notes", "Jasmine, Lavender", "Ambergris, Cedarwood"),
  p("paco-rabanne", "Phantom EDT", "EDT", "MEN", "men", 125000, "aromatic", "Lavender and lemon with a creamy vanilla base. A modern fresh classic.", "Lavender, Lemon", "Orange, Patchouli", "Vanilla, Musk"),
  p("paco-rabanne", "Pure XS EDT", "EDT", "MEN", "men", 130000, "spicy", "Ginger and myrtle with a smoky vanilla drydown. Raw, animalic heat.", "Ginger, Bergamot", "Saffron, Lavender", "Vanilla, Leather"),

  p("le-labo", "Another 13 EDP", "EDP", "UNISEX", "niche", 480000, "musk", "Ambrette and jasmine over a skin-like musk. The cult better-than-skin scent.", "Ambrette", "Jasmine", "Ambroxan, Musk"),
  p("le-labo", "Rose 31 EDP", "EDP", "UNISEX", "niche", 470000, "floral", "Centifolia rose with warm cumin and cedar. A rose for people who hate roses.", "Cumin, Rose", "Rose", "Cedarwood, Musk"),
  p("le-labo", "Bergamote 22 EDP", "EDP", "UNISEX", "niche", 450000, "citrus", "Sparkling bergamot with a clean musky trail. Sunshine in laboratory form.", "Bergamot, Grapefruit", "Neroli, Jasmine", "Musk, Cedarwood"),
  p("le-labo", "Thé Matcha 26 EDP", "EDP", "UNISEX", "niche", 490000, "fresh", "Matcha tea with fig and creamy musk. A quiet meditative ritual.", "Fig, Bergamot", "Tea", "Sandalwood, Musk"),

  p("mfk", "Grand Soir EDP", "EDP", "UNISEX", "niche", 620000, "oriental", "Labdanum and vanilla with a luminous amber glow. Golden-hour elegance.", "Bergamot", "Lavender, Jasmine", "Amber, Vanilla"),
  p("mfk", "Amyris EDP", "EDP", "UNISEX", "niche", 550000, "woody", "Amyris wood with iris and vanilla. A smooth, refined everyday niche luxury.", "Bergamot, Cardamom", "Iris, Jasmine", "Sandalwood, Vanilla"),
  p("mfk", "Oud Satin Mood EDP", "EDP", "UNISEX", "niche", 720000, "oriental", "Bulgarian rose wrapped in oud and vanilla. Opulence at full volume.", "Bergamot", "Rose, Violet", "Oud, Vanilla"),

  p("lancome", "Trésor EDP", "EDP", "WOMEN", "women", 150000, "floral", "Apricot rose with peach and vanilla. A timeless declaration of love.", "Peach, Lilac", "Rose, Iris", "Vanilla, Sandalwood"),
  p("lancome", "Miracle EDT", "EDT", "WOMEN", "women", 125000, "fresh", "Lychee and freesia with a soft musky base. Morning-light optimism.", "Lychee, Freesia", "Ginger, Jasmine", "Musk, Amber"),
  p("lancome", "Idôle EDP", "EDP", "WOMEN", "women", 155000, "floral", "Centifolia rose with a clean musk base. A modern rose for modern women.", "Bergamot, Pink Pepper", "Rose, Jasmine", "Musk, Patchouli"),
  p("lancome", "Hypnôse EDP", "EDP", "WOMEN", "women", 150000, "oriental", "Passionflower and vanilla with a woody base. Magnetic and hypnotic.", "Bergamot, Lemon", "Jasmine, Rose", "Vanilla, Vetiver"),

  p("zara", "Red Temptation EDP", "EDP", "UNISEX", "unisex", 49000, "oriental", "Saffron and amberwood with a sweet amber finish. Beloved luxury-inspired value.", "Saffron, Orange", "Amberwood, Jasmine", "Musk, Cedarwood"),
  p("hermes", "Terre d'Hermès EDT", "EDT", "MEN", "men", 175000, "woody", "Orange and flint over vetiver. The definitive mineral woody signature.", "Orange, Bergamot", "Green Notes, Pepper", "Vetiver, Cedarwood"),
  p("hermes", "Un Jardin sur le Nil EDT", "EDT", "UNISEX", "unisex", 150000, "fresh", "Green mango and lotus over a soft musk. A stroll along the Nile.", "Mango, Grapefruit", "Lotus, Freesia", "Musk, Cedarwood"),
  p("hermes", "Twilly d'Hermès EDP", "EDP", "WOMEN", "women", 165000, "spicy", "Ginger and tuberose with a vanilla sandalwood base. Youthful, spirited spice.", "Ginger, Cardamom", "Tuberose", "Sandalwood, Vanilla"),
  p("hermes", "H24 EDT", "EDT", "MEN", "men", 145000, "aromatic", "Clary sage and rosemary with a metallic green hush. The new masculine fresh.", "Rosemary, Sage", "Green Notes, Lily", "Musk, Cedarwood"),

  p("guerlain", "Shalimar EDP", "EDP", "WOMEN", "women", 185000, "oriental", "Bergamot and vanilla with a smoky incense heart. The first great oriental, 1925.", "Bergamot, Lemon", "Jasmine, Rose", "Vanilla, Incense"),
  p("guerlain", "Habit Rouge EDT", "EDT", "MEN", "men", 150000, "oriental", "Bergamot and vanilla with a leathery base. Daring masculine tradition.", "Bergamot, Orange", "Rose, Clove", "Vanilla, Leather"),
  p("guerlain", "L'Homme Idéal EDP", "EDP", "MEN", "men", 155000, "gourmand", "Almond and leather with a cherry-tinged warmth. The ideal man, bottled.", "Almond, Lemon", "Rose, Cherry", "Leather, Tonka Bean"),
  p("guerlain", "Mon Guerlain EDP", "EDP", "WOMEN", "women", 160000, "oriental", "Lavender and vanilla with a warm amber base. Feminine strength, Guerlain-style.", "Lavender, Bergamot", "Jasmine, Iris", "Vanilla, Sandalwood"),

  p("issey-miyake", "L'Eau d'Issey EDT", "EDT", "WOMEN", "women", 110000, "floral", "Water lily and melon over warm woods. The iconic aquatic floral.", "Melon, Pear", "Lotus, Musk", "Cedarwood, Musk"),
  p("issey-miyake", "L'Issey Pour Homme EDT", "EDT", "MEN", "men", 110000, "woody", "Yuzu and cypress with a warm woody base. A clean, meditative masculine.", "Yuzu, Cypress", "Cinnamon, Geranium", "Cedarwood, Musk"),

  p("kenzo", "Flower by Kenzo EDP", "EDP", "WOMEN", "women", 125000, "floral", "Poppy and vanilla with a powdery iris heart. A delicate wildflower wind.", "Pink Pepper, Blackcurrant", "Rose, Vanilla", "Iris, Musk"),
  p("kenzo", "Kenzo Homme EDT", "EDT", "MEN", "men", 115000, "woody", "Bamboo and citrus with a vetiver-sandalwood base. A modern woody masculine.", "Lemon, Green Notes", "Vetiver, Sage", "Sandalwood, Cedarwood"),

  p("bvlgari", "Omnia Crystalline EDT", "EDT", "WOMEN", "women", 115000, "fresh", "Bamboo and lotus with a soft musk base. Transparent, luminous femininity.", "Pear, Green Notes", "Lotus, Tea", "Musk, Cedarwood"),
  p("bvlgari", "Aqva Pour Homme EDT", "EDT", "MEN", "men", 125000, "aquatic", "Mandarin and sea notes over amber. The scent of the deep blue sea.", "Mandarin, Sea Notes", "Lavender, Rosemary", "Amber, Patchouli"),
  p("bvlgari", "Man in Black EDP", "EDP", "MEN", "men", 160000, "oriental", "Rum and tobacco with a leathery amber base. Magnetic evening power.", "Rum, Cinnamon", "Tobacco, Leather", "Amber, Tonka Bean"),

  p("prada", "Luna Rossa Carbon EDT", "EDT", "MEN", "men", 135000, "fresh", "Lavender and ambroxan with a clean finish. Urban aquatic minimalism.", "Bergamot, Lavender", "Ambroxan, Geranium", "Musk, Patchouli"),
  p("prada", "Luna Rossa Ocean EDT", "EDT", "MEN", "men", 140000, "aquatic", "Lavender and bergamot over a salty amber base. A vast, masculine horizon.", "Bergamot, Green Notes", "Lavender, Sage", "Amber, Musk"),
  p("prada", "Prada Candy EDP", "EDP", "WOMEN", "women", 145000, "gourmand", "Caramel and musk with a powdery benzoin heart. Sweet, grown-up indulgence.", "Pink Pepper, Musk", "Caramel, Orange", "Amber, Vanilla"),
  p("prada", "Infusion d'Iris EDP", "EDP", "WOMEN", "women", 150000, "woody", "Iris with orange blossom and a soft cedar base. Quiet Italian luxury.", "Orange, Neroli", "Iris, Violet", "Cedarwood, Musk"),
  p("prada", "Prada L'Homme EDT", "EDT", "MEN", "men", 145000, "woody", "Iris and amber with a clean soapy trail. Refined modern gentleman.", "Neroli, Bergamot", "Iris, Geranium", "Amber, Cedarwood"),

  p("dolce-gabbana", "Light Blue EDT", "EDT", "WOMEN", "women", 125000, "fresh", "Lemon and apple over a cedar base. Carefree Mediterranean joy.", "Lemon, Apple", "Green Notes, Jasmine", "Cedarwood, Musk"),
  p("dolce-gabbana", "Light Blue Pour Homme EDT", "EDT", "MEN", "men", 125000, "aquatic", "Grapefruit and bergamot over a warm woody base. A sunlit coastal classic.", "Grapefruit, Bergamot", "Green Notes, Rosemary", "Oakmoss, Musk"),
  p("dolce-gabbana", "The One EDP", "EDP", "MEN", "men", 155000, "oriental", "Ginger and cardamom with a rich amber base. Timeless evening charisma.", "Ginger, Bergamot", "Cardamom, Orange", "Amber, Cedarwood"),
  p("dolce-gabbana", "The One for Women EDP", "EDP", "WOMEN", "women", 150000, "oriental", "Peach and vanilla with a warm amber heart. Sensual golden glamour.", "Peach, Bergamot", "Lily, Jasmine", "Vanilla, Amber"),

  p("calvin-klein", "CK One EDT", "EDT", "UNISEX", "unisex", 85000, "fresh", "Lemon and green tea with a clean musky base. The original unisex classic.", "Lemon, Tea", "Green Notes, Violet", "Musk, Cedarwood"),
  p("calvin-klein", "Eternity for Men EDT", "EDT", "MEN", "men", 95000, "aromatic", "Lavender and citrus over a warm sandalwood base. A timeless promise.", "Bergamot, Lavender", "Rosemary, Sage", "Sandalwood, Musk"),
  p("calvin-klein", "Obsession for Men EDT", "EDT", "MEN", "men", 90000, "oriental", "Lavender and mandarin with a warm amber-vanilla base. Intense 1986 passion.", "Mandarin, Lavender", "Clove, Coriander", "Amber, Vanilla"),

  p("ralph-lauren", "Polo Blue EDT", "EDT", "MEN", "men", 120000, "fresh", "Melon and basil with a warm amber base. Crisp country-club confidence.", "Melon, Bergamot", "Sage, Basil", "Amber, Musk"),
  p("ralph-lauren", "Ralph EDT", "EDT", "WOMEN", "women", 95000, "fresh", "Apple and freesia with a clean musky base. Youthful American optimism.", "Apple, Raspberry", "Freesia, Rose", "Musk, Cedarwood"),

  p("burberry", "Hero EDT", "EDT", "MEN", "men", 125000, "woody", "Black pepper and lavender over a crisp cedar base. A modern masculine emblem.", "Black Pepper, Bergamot", "Lavender, Green Notes", "Cedarwood, Ambroxan"),
  p("burberry", "My Burberry EDP", "EDP", "WOMEN", "women", 155000, "floral", "Damask rose with sweet pea over a patchouli base. A London garden after rain.", "Pear, Bergamot", "Rose, Geranium", "Patchouli, Musk"),
  p("burberry", "Brit for Men EDT", "EDT", "MEN", "men", 115000, "woody", "Lime and ginger with a warm sandalwood base. Understated British cool.", "Lime, Ginger", "Cardamom, Cedarwood", "Sandalwood, Musk"),

  p("givenchy", "Gentleman EDP", "EDP", "MEN", "men", 155000, "woody", "Iris and black pepper with a warm woods base. A modern tuxedo in scent.", "Black Pepper, Bergamot", "Iris, Lavender", "Cedarwood, Patchouli"),
  p("givenchy", "Very Irrésistible EDT", "EDT", "WOMEN", "women", 135000, "floral", "Rose with a sparkling anise edge. A bold rose with attitude.", "Pink Pepper", "Rose, Peony", "Patchouli, Vanilla"),
  p("givenchy", "L'Interdit EDP", "EDP", "WOMEN", "women", 155000, "floral", "Tuberose and jasmine over a dark patchouli base. Dare to wear the forbidden.", "Pear, Bergamot", "Tuberose, Jasmine", "Patchouli, Vanilla"),

  p("valentino", "Born in Roma EDT", "EDT", "WOMEN", "women", 150000, "floral", "Blackcurrant and jasmine with a vanilla-wood base. A floral with an edge.", "Blackcurrant, Bergamot", "Jasmine, Rose", "Vanilla, Cedarwood"),
  p("valentino", "Born in Roma Uomo EDT", "EDT", "MEN", "men", 145000, "aromatic", "Lavender and vanilla with a mineral sage heart. Aroma with Valentino flair.", "Bergamot, Lavender", "Sage, Geranium", "Vanilla, Cedarwood"),
  p("valentino", "Uomo EDT", "EDT", "MEN", "men", 140000, "woody", "Myrtle and bergamot with a coffee-vanilla base. Italian elegance with a twist.", "Bergamot, Green Notes", "Iris, Rose", "Coffee, Vanilla"),

  p("carolina-herrera", "Good Girl EDP", "EDP", "WOMEN", "women", 160000, "oriental", "Tuberose and almond with a rich cocoa base. Fantastic duality in a stiletto.", "Almond, Coffee", "Tuberose, Jasmine", "Cocoa, Vanilla"),
  p("carolina-herrera", "Bad Boy EDT", "EDT", "MEN", "men", 145000, "oriental", "Lavender and tonka with a spicy pepper spark. Lightning-bolt contrast.", "Bergamot, Black Pepper", "Lavender, Sage", "Tonka Bean, Cedarwood"),

  p("mugler", "Alien EDP", "EDP", "WOMEN", "women", 175000, "oriental", "Jasmine sambac with warm amber and cashmeran. An otherworldly amber floral.", "Bergamot", "Jasmine, Orange Blossom", "Amber, Sandalwood"),
  p("mugler", "Angel EDP", "EDP", "WOMEN", "women", 170000, "gourmand", "Bergamot and patchouli with a famous chocolate-caramel heart. The gourmand that started it all.", "Melon, Mandarin", "Honey, Jasmine", "Patchouli, Vanilla"),
  p("mugler", "A*Men EDT", "EDT", "MEN", "men", 150000, "oriental", "Lavender and coffee with a sweet vanilla base. The masculine Angel.", "Lavender, Bergamot", "Coffee, Honey", "Vanilla, Patchouli"),

  p("jean-paul-gaultier", "Le Male EDT", "EDT", "MEN", "men", 115000, "oriental", "Mint and lavender with a warm vanilla base. The sailor-shaped icon.", "Mint, Lavender", "Lavender, Cinnamon", "Vanilla, Tonka Bean"),
  p("jean-paul-gaultier", "Ultra Male EDT", "EDT", "MEN", "men", 125000, "oriental", "Pear and cinnamon with a strong vanilla base. A sweeter, stronger night version.", "Pear, Lavender", "Cinnamon, Sage", "Vanilla, Amber"),
  p("jean-paul-gaultier", "Classique EDT", "EDT", "WOMEN", "women", 120000, "oriental", "Orange blossom and vanilla with a warm spicy heart. Sensual and sculptural.", "Ginger, Orange", "Orange Blossom, Rose", "Vanilla, Sandalwood"),

  p("viktor-rolf", "Spicebomb EDT", "EDT", "MEN", "men", 140000, "spicy", "Chili pepper and cinnamon with a leather-vetiver base. A bomb of warmth.", "Pink Pepper, Cardamom", "Saffron, Rose", "Leather, Tobacco"),
  p("viktor-rolf", "Flowerbomb EDP", "EDP", "WOMEN", "women", 160000, "floral", "Bergamot with a jasmine-rose explosion and patchouli base. A bouquet with power.", "Bergamot, Tea", "Rose, Jasmine", "Patchouli, Musk"),

  p("jo-malone", "Wood Sage & Sea Salt Cologne", "COLOGNE", "UNISEX", "unisex", 135000, "fresh", "Ambrette seed and sea salt with sage. Windswept British coastline.", "Sea Notes", "Sage, Ambrette", "Cashmere Wood, Musk"),
  p("jo-malone", "Lime Basil & Mandarin Cologne", "COLOGNE", "UNISEX", "unisex", 125000, "citrus", "Peppery basil with lime and mandarin. A fragrant gourmet garden.", "Lime, Mandarin", "Basil, Green Notes", "Musk"),
  p("jo-malone", "English Pear & Freesia Cologne", "COLOGNE", "UNISEX", "unisex", 125000, "fresh", "Ripe pear with freesia and a warm amber base. Autumn orchard light.", "Pear", "Freesia, Rose", "Amber, Musk"),
  p("jo-malone", "Peony & Blush Suede Cologne", "COLOGNE", "WOMEN", "women", 130000, "floral", "Peony with red apple and a soft suede base. Romantic and polished.", "Apple, Peach", "Peony, Rose", "Suede, Musk"),
  p("diptyque", "Philosykos EDT", "EDT", "UNISEX", "niche", 320000, "woody", "Fig leaf and wood with a milky coconut heart. A Mediterranean fig tree.", "Fig Leaf", "Fig, Coconut", "Cedarwood"),
  p("diptyque", "Tam Dao EDT", "EDT", "UNISEX", "niche", 310000, "woody", "Sandalwood and cedar with a warm myrrh hush. A meditative temple forest.", "Sandalwood", "Cedarwood", "Sandalwood, Amber"),
  p("diptyque", "Do Son EDT", "EDT", "WOMEN", "niche", 310000, "floral", "Tuberose and rose with a powdery musk base. A garden at dusk.", "Bergamot", "Tuberose, Rose", "Musk"),

  p("maison-margiela", "By the Fireplace EDP", "EDP", "UNISEX", "niche", 265000, "gourmand", "Chestnut and vanilla with a smoky clove glow. Fireside comfort in a bottle.", "Clove, Pink Pepper", "Chestnut", "Vanilla, Cashmere Wood"),
  p("maison-margiela", "Jazz Club EDP", "EDP", "UNISEX", "niche", 265000, "spicy", "Pink pepper and tobacco with a rum-stained warmth. A smoky Brooklyn bar.", "Pink Pepper, Lemon", "Tobacco, Rum", "Vanilla, Vetiver"),
  p("maison-margiela", "Lazy Sunday Morning EDP", "EDP", "UNISEX", "niche", 255000, "floral", "Lily and iris with a clean musk base. Soft morning light on crumpled sheets.", "Aldehydes, Lily", "Iris, Rose", "Musk"),

  p("byredo", "Gypsy Water EDP", "EDP", "UNISEX", "niche", 450000, "woody", "Bergamot and pine with a warm vanilla base. Freedom in a Nordic forest.", "Bergamot, Lemon", "Pine, Jasmine", "Vanilla, Sandalwood"),
  p("byredo", "Mojave Ghost EDP", "EDP", "UNISEX", "niche", 450000, "woody", "Ambrette and magnolia over a clean cedar base. A desert flower's quiet strength.", "Ambrette, Bergamot", "Magnolia, Violet", "Sandalwood, Musk"),
  p("byredo", "Bal d'Afrique EDP", "EDP", "UNISEX", "niche", 440000, "citrus", "Bergamot and neroli with a warm vetiver base. A vibrant Parisian-African dance.", "Bergamot, Lemon", "Neroli, Jasmine", "Vetiver, Musk"),
  p("byredo", "Blanche EDP", "EDP", "UNISEX", "niche", 440000, "fresh", "Aldehydes and rose with a soft musk base. The scent of clean white linen.", "Aldehydes", "Rose, Peony", "Musk, Sandalwood"),

  p("acqua-di-parma", "Colonia EDT", "EDT", "UNISEX", "niche", 350000, "citrus", "Sicilian citrus with lavender and rosemary. The original Italian colonia, 1916.", "Lemon, Bergamot", "Lavender, Rosemary", "Vetiver, Patchouli"),
  p("acqua-di-parma", "Arancia di Capri EDT", "EDT", "UNISEX", "niche", 330000, "citrus", "Sweet orange and mandarin with a soft caramel base. Capri sunshine.", "Orange, Mandarin", "Green Notes, Neroli", "Caramel, Musk"),

  p("amouage", "Interlude Man EDP", "EDP", "MEN", "niche", 850000, "oriental", "Frankincense and oregano with a smoky leather base. Controlled chaos in a bottle.", "Oregano, Bergamot", "Incense, Amber", "Leather, Oud"),
  p("amouage", "Journey Man EDP", "EDP", "MEN", "niche", 820000, "spicy", "Saffron and cardamom with a smoky tea heart. A traveler's leather journal.", "Saffron, Bergamot", "Tea, Lavender", "Leather, Amber"),
  p("amouage", "Reflection Woman EDP", "EDP", "WOMEN", "niche", 800000, "floral", "White flowers with a green neroli opening. Serene, luminous femininity.", "Neroli, Bergamot", "Jasmine, Tuberose", "Musk, Cedarwood"),
  p("amouage", "Gold Man EDP", "EDP", "MEN", "niche", 950000, "oriental", "Frankincense and myrrh with a rich floral heart. The ultimate oriental luxury.", "Lemon, Bergamot", "Rose, Iris", "Incense, Sandalwood"),

  p("xerjoff", "Naxos EDP", "EDP", "UNISEX", "niche", 750000, "gourmand", "Honey and lavender with a rich tobacco base. Sicilian golden hour.", "Lavender, Bergamot", "Honey, Jasmine", "Tobacco, Vanilla"),
  p("xerjoff", "Alexandria II EDP", "EDP", "UNISEX", "niche", 850000, "oriental", "Rose and oud with a refined amber base. Modern oriental majesty.", "Bergamot, Lavender", "Rose, Lily", "Oud, Amber"),
  p("xerjoff", "Renaissance EDP", "EDP", "UNISEX", "niche", 700000, "citrus", "Bergamot and mint with a clean musky finish. A rebirth of freshness.", "Bergamot, Mint", "Rose, Jasmine", "Musk, Cedarwood"),

  p("initio", "Oud for Greatness EDP", "EDP", "UNISEX", "niche", 680000, "oriental", "Saffron and oud with a lavender lift. A bold modern oud statement.", "Lavender, Saffron", "Nutmeg", "Oud, Patchouli"),
  p("initio", "Musk Therapy EDP", "EDP", "UNISEX", "niche", 650000, "musk", "White musk with sandalwood and citrus. Clean, radiant skin comfort.", "Bergamot, Orange", "Musk", "Sandalwood"),

  p("parfums-de-marly", "Layton EDP", "EDP", "MEN", "niche", 620000, "oriental", "Apple and vanilla with a lavender-spiced heart. The most complimented niche scent.", "Bergamot, Lavender", "Jasmine, Violet", "Vanilla, Cardamom"),
  p("parfums-de-marly", "Delina EDP", "EDP", "WOMEN", "niche", 650000, "floral", "Rhubarb and lychee with a rich Turkish rose base. Opulent modern rose.", "Rhubarb, Lychee", "Rose, Peony", "Musk, Vanilla"),
  p("parfums-de-marly", "Herod EDP", "EDP", "MEN", "niche", 600000, "oriental", "Tobacco and vanilla with a spicy cinnamon heart. A gentleman's pipe-smoke elegance.", "Cinnamon, Black Pepper", "Tobacco, Coffee", "Vanilla, Musk"),

  p("nishane", "Hacivat EDP", "EDP", "UNISEX", "niche", 580000, "chypre", "Pineapple and oakmoss with a bright citrus top. A modern chypre masterpiece.", "Pineapple, Bergamot", "Oakmoss, Patchouli", "Cedarwood, Musk"),
  p("nishane", "Ani EDP", "EDP", "UNISEX", "niche", 560000, "oriental", "Ginger and cardamom with a warm vanilla base. An ode to Istanbul.", "Ginger, Bergamot", "Cardamom, Jasmine", "Vanilla, Sandalwood"),

  p("kilian", "Angels' Share EDP", "EDP", "UNISEX", "niche", 680000, "gourmand", "Cognac and cinnamon with a rich praline base. Liquid gold in a bottle.", "Cinnamon, Cognac", "Oak, Tonka Bean", "Praline, Vanilla"),
  p("kilian", "Good Girl Gone Bad EDP", "EDP", "WOMEN", "niche", 700000, "floral", "Tuberose and jasmine with a smoky incense twist. Innocence corrupted.", "Osmanthus", "Tuberose, Jasmine", "Cedarwood, Incense"),
  p("kilian", "Back to Black EDP", "EDP", "UNISEX", "niche", 720000, "oriental", "Cherry and tobacco with a rich honey-oud base. Smoky late-night allure.", "Cherry, Almond", "Tobacco, Honey", "Oud, Cedarwood"),

  p("frederic-malle", "Portrait of a Lady EDP", "EDP", "WOMEN", "niche", 950000, "floral", "Turkish rose with patchouli and frankincense. A magnificent rose composed.", "Raspberry, Blackcurrant", "Rose, Clove", "Patchouli, Incense"),
  p("frederic-malle", "Musc Ravageur EDP", "EDP", "UNISEX", "niche", 900000, "oriental", "Cinnamon and bergamot over a lavish musk base. Ravaging, sensual elegance.", "Bergamot, Mandarin", "Cinnamon, Lavender", "Musk, Amber"),
  p("frederic-malle", "Carnal Flower EDP", "EDP", "WOMEN", "niche", 920000, "floral", "Tuberose and eucalyptus with a powdery musk base. The definitive tuberose.", "Eucalyptus, Bergamot", "Tuberose, Ylang-Ylang", "Musk"),

  p("penhaligons", "Halfeti EDP", "EDP", "UNISEX", "niche", 520000, "oriental", "Rose and oud with a spiced cypress heart. A Turkish riverside legend.", "Saffron, Bergamot", "Rose, Cypress", "Oud, Vanilla"),
  p("penhaligons", "Sartorial EDT", "EDT", "MEN", "niche", 420000, "aromatic", "Lavender and beeswax with a leathery steam-pressed finish. A Savile Row scent.", "Lavender, Bergamot", "Sage, Leather", "Musk, Cedarwood"),
  p("penhaligons", "Luna EDT", "EDT", "WOMEN", "niche", 430000, "fresh", "Neroli and juniper with a warm amber base. A moonlit Mediterranean night.", "Neroli, Grapefruit", "Orange Blossom, Jasmine", "Amber, Musk"),

  p("estee-lauder", "Beautiful EDP", "EDP", "WOMEN", "women", 135000, "floral", "A thousand flowers, rose, lily, and marigold, for life's happiest moments.", "Marigold, Rose", "Lily, Jasmine", "Sandalwood, Oakmoss"),
  p("estee-lauder", "Pleasures EDT", "EDT", "WOMEN", "women", 110000, "fresh", "Peony and lilac with a soft musky base. The simple joy of fresh flowers.", "Lilac, Peony", "Rose, Jasmine", "Musk, Cedarwood"),

  p("marc-jacobs", "Daisy EDT", "EDT", "WOMEN", "women", 105000, "fresh", "Wild strawberry and violet with a soft musky base. Youthful, carefree charm.", "Strawberry, Violet", "Gardenia, Jasmine", "Musk, Cedarwood"),
  p("marc-jacobs", "Perfect EDP", "EDP", "WOMEN", "women", 125000, "floral", "Rhubarb and daffodil with a warm almond base. Just as you are.", "Rhubarb, Neroli", "Peony, Almond", "Musk, Cedarwood"),

  p("montblanc", "Explorer EDP", "EDP", "MEN", "men", 135000, "woody", "Bergamot and vetiver with a leathery patchouli base. An open-road adventure.", "Bergamot, Pink Pepper", "Vetiver, Leather", "Patchouli, Ambroxan"),
  p("montblanc", "Legend EDT", "EDT", "MEN", "men", 115000, "aromatic", "Lavender and pineapple with a warm oakmoss base. A timeless masculine icon.", "Pineapple, Bergamot", "Lavender, Geranium", "Oakmoss, Musk"),

  p("hugo-boss", "Boss Bottled EDT", "EDT", "MEN", "men", 110000, "woody", "Apple and cinnamon with a warm sandalwood base. The scent of success.", "Apple, Cinnamon", "Sage, Clove", "Sandalwood, Cedarwood"),
  p("hugo-boss", "The Scent for Him EDP", "EDP", "MEN", "men", 135000, "oriental", "Honey and leather with a warm fruit heart. Magnetic attraction.", "Ginger, Bergamot", "Lavender, Honey", "Leather, Cashmere Wood"),

  p("azzaro", "Pour Homme EDT", "EDT", "MEN", "men", 105000, "aromatic", "Anise and lavender with a warm woody base. A Mediterranean 1978 classic.", "Lemon, Anise", "Lavender, Green Notes", "Sandalwood, Vetiver"),
  p("azzaro", "The Most Wanted EDP", "EDP", "MEN", "men", 135000, "oriental", "Cardamom and tonka with a warm amber base. Irresistible night energy.", "Cardamom, Pink Pepper", "Lavender, Sage", "Amber, Tonka Bean"),

  p("lalique", "Encre Noire EDT", "EDT", "UNISEX", "unisex", 130000, "woody", "Vetiver and cypress with a dark smoky opening. A shadowy modern vetiver.", "Bergamot, Cypress", "Vetiver", "Vetiver, Cashmere Wood"),

  p("mancera", "Cedrat Boise EDP", "EDP", "UNISEX", "niche", 285000, "citrus", "Lemon and blackcurrant with a woody amber base. A bright, long-lasting signature.", "Lemon, Bergamot", "Blackcurrant, Patchouli", "Vanilla, Cedarwood"),
  p("mancera", "Instant Crush EDP", "EDP", "UNISEX", "niche", 295000, "oriental", "Saffron and amberwood with a sweet vanilla base. Instant, addictive charisma.", "Saffron, Bergamot", "Amberwood, Jasmine", "Vanilla, Musk"),

  p("lattafa", "Khamrah EDP", "EDP", "UNISEX", "unisex", 95000, "gourmand", "Cinnamon and date with a rich vanilla-praline base. A beloved Arabian gourmand.", "Cinnamon, Bergamot", "Dates, Tonka Bean", "Praline, Vanilla"),
  p("lattafa", "Asad EDP", "EDP", "MEN", "men", 85000, "oriental", "Black pepper and tobacco with a sweet vanilla base. A celebrated smoky powerhouse.", "Black Pepper, Pineapple", "Tobacco, Coffee", "Vanilla, Patchouli"),
  p("lattafa", "Yara EDP", "EDP", "WOMEN", "women", 90000, "floral", "Orchid and heliotrope with a warm vanilla base. A sweet, crowd-pleasing floral.", "Lychee", "Tuberose, Jasmine", "Vanilla, Musk"),

  p("armaf", "Club de Nuit Intense Man EDT", "EDT", "MEN", "men", 95000, "woody", "Pineapple and bergamot with a smoky birch base. The legendary value pick.", "Pineapple, Lemon", "Birch, Jasmine", "Musk, Ambergris"),
  p("armaf", "Sillage EDT", "EDT", "UNISEX", "unisex", 95000, "fresh", "Bergamot and tea with a clean musky trail. A crisp signature scent.", "Bergamot, Lemon", "Tea, Jasmine", "Musk, Cedarwood"),
  p("armaf", "Club de Nuit Woman EDP", "EDP", "WOMEN", "women", 90000, "floral", "Bergamot and peach with a warm vanilla-amber base. A radiant everyday floral.", "Bergamot, Peach", "Rose, Jasmine", "Vanilla, Amber"),

  p("al-haramain", "Amber Oud Gold Edition EDP", "EDP", "UNISEX", "unisex", 110000, "oriental", "Bergamot and green notes with a rich amber oud base. A celebrated blend.", "Bergamot, Green Notes", "Melon, Pineapple", "Amber, Oud"),
  p("al-haramain", "L'Aventure EDP", "EDP", "MEN", "men", 105000, "woody", "Bergamot and spices with a smoky woody base. An adventure-worthy signature.", "Bergamot, Lemon", "Coriander, Jasmine", "Ambergris, Cedarwood"),

  p("chloe", "Chloe EDP", "EDP", "WOMEN", "women", 140000, "floral", "Peony and freesia with a warm cedar base. Effortless Parisian femininity.", "Freesia, Peony", "Rose, Lily", "Cedarwood, Musk"),
  p("chloe", "Love Story EDP", "EDP", "WOMEN", "women", 145000, "floral", "Orange blossom with a musky base. A padlocked love letter.", "Orange Blossom, Pear", "Jasmine, Rose", "Musk, Cedarwood"),

  p("serge-lutens", "Chergui EDP", "EDP", "UNISEX", "niche", 420000, "oriental", "Honey and tobacco with a warm cinnamon heart. A desert wind of sweetness.", "Cinnamon, Honey", "Tobacco, Rose", "Amber, Musk"),
  p("serge-lutens", "Ambre Sultan EDP", "EDP", "UNISEX", "niche", 450000, "oriental", "Labdanum and oregano over a resinous amber base. The definitive amber study.", "Oregano, Bergamot", "Bay Leaf, Rose", "Amber, Incense"),
];
