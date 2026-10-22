import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";
import { generateProductImages } from "./image-gen";
import {
  CATALOG,
  EXTRA_BRANDS,
  EXTRA_NOTES,
  productSlug,
  type CatalogProduct,
} from "./seed-catalog";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const IMG = (seed: string) => `/images/products/${seed}.jpg`;

type SeedProduct = {
  name: string;
  slug: string;
  brand: string;
  category: string;
  gender: "MEN" | "WOMEN" | "UNISEX";
  concentration: "EDT" | "EDP" | "PARFUM" | "COLOGNE";
  description: string;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  scentFamily: string;
  price: number;
  compareAtPrice?: number;
  myName?: string;
  myDescription?: string;
  noteNames: string[];
};

const BRANDS = [
  { name: "Dior", slug: "dior", description: "French luxury fashion house." },
  { name: "Chanel", slug: "chanel", description: "Iconic French maison." },
  { name: "Creed", slug: "creed", description: "Luxury fragrance house since 1760." },
  { name: "Tom Ford", slug: "tom-ford", description: "Bold, provocative luxury scents." },
  { name: "YSL", slug: "ysl", description: "Yves Saint Laurent beauté." },
  { name: "Gucci", slug: "gucci", description: "Italian fashion and fragrance." },
  { name: "Armani", slug: "armani", description: "Elegant Italian style." },
  { name: "Versace", slug: "versace", description: "Glamorous Italian fashion house." },
  { name: "Paco Rabanne", slug: "paco-rabanne", description: "Avant-garde French house." },
  { name: "Le Labo", slug: "le-labo", description: "Hand-blended niche perfumery." },
  { name: "Maison Francis Kurkdjian", slug: "mfk", description: "Parisian niche perfumery." },
  { name: "Zara", slug: "zara", description: "Accessible fashion fragrances." },
];

const CATEGORIES = [
  { name: "For Men", slug: "men" },
  { name: "For Women", slug: "women" },
  { name: "Unisex", slug: "unisex" },
  { name: "Niche", slug: "niche" },
  { name: "Gift Sets", slug: "gift-sets" },
];

const NOTES: { name: string; type: "TOP" | "HEART" | "BASE" }[] = [
  { name: "Bergamot", type: "TOP" },
  { name: "Lemon", type: "TOP" },
  { name: "Pink Pepper", type: "TOP" },
  { name: "Apple", type: "TOP" },
  { name: "Rose", type: "HEART" },
  { name: "Jasmine", type: "HEART" },
  { name: "Iris", type: "HEART" },
  { name: "Lavender", type: "HEART" },
  { name: "Ylang-Ylang", type: "HEART" },
  { name: "Oud", type: "BASE" },
  { name: "Sandalwood", type: "BASE" },
  { name: "Musk", type: "BASE" },
  { name: "Amber", type: "BASE" },
  { name: "Vanilla", type: "BASE" },
  { name: "Vetiver", type: "BASE" },
  { name: "Cedarwood", type: "BASE" },
];

const PRODUCTS: SeedProduct[] = [
  {
    name: "Sauvage EDT", slug: "dior-sauvage-edt", brand: "dior", category: "men",
    gender: "MEN", concentration: "EDT",
    description: "Fresh and spicy with Calabrian bergamot and Sichuan pepper. A powerful, clean signature for men.",
    notesTop: "Bergamot, Pepper", notesHeart: "Sichuan Pepper, Lavender", notesBase: "Ambroxan, Cedar",
    scentFamily: "woody", price: 145000, compareAtPrice: 165000,
    myName: "ဆော့ဗေးလ် အီးဒီပီ",
    myDescription: "ဘာဂိုမော့နှင့် ဆစ်ချွမ်ငရုတ်ကောင်း အနံ့ဖြင့် လတ်ဆတ်ပြီး စပ်ကြွယ့်သော အမျိုးသားအမွှေးနံ့သာ။",
    noteNames: ["Bergamot", "Pink Pepper", "Lavender", "Cedarwood"],
  },
  {
    name: "Bleu de Chanel EDP", slug: "chanel-bleu-de-chanel-edp", brand: "chanel", category: "men",
    gender: "MEN", concentration: "EDP",
    description: "A woody aromatic fragrance with citrus, incense and sandalwood. Timeless elegance.",
    notesTop: "Lemon, Mint", notesHeart: "Ginger, Jasmine", notesBase: "Sandalwood, Incense",
    scentFamily: "woody", price: 195000,
    myName: "ဘလူး ဒီ ချာနယ် အီးဒီပီ",
    myDescription: "သံပိုးသီးနှင့် သစ်သားအနံ့များ ပေါင်းစပ်ထားသော ချိုမြိန်တောက်ပသော အမျိုးသားအနံ့အသက်။",
    noteNames: ["Lemon", "Jasmine", "Sandalwood", "Cedarwood"],
  },
  {
    name: "Aventus EDP", slug: "creed-aventus-edp", brand: "creed", category: "niche",
    gender: "MEN", concentration: "EDP",
    description: "Smoky pineapple and birch. The legendary success scent for ambitious men.",
    notesTop: "Pineapple, Bergamot", notesHeart: "Birch, Jasmine", notesBase: "Musk, Ambergris",
    scentFamily: "fruity", price: 650000,
    myName: "အေဗင်တတ်စ် အီးဒီပီ",
    myDescription: "အောင်မြင်သော အမျိုးသားများအတွက် မီးခိုးရောင် သစ်သီးနှင့် သစ်ခေါက်အနံ့။",
    noteNames: ["Bergamot", "Musk", "Amber"],
  },
  {
    name: "Acqua di Gio EDT", slug: "armani-acqua-di-gio-edt", brand: "armani", category: "men",
    gender: "MEN", concentration: "EDT",
    description: "Aquatic freshness of the Mediterranean. A classic everyday signature.",
    notesTop: "Lime, Lemon", notesHeart: "Jasmine, Rosemary", notesBase: "Musk, Cedar",
    scentFamily: "aquatic", price: 125000,
    myName: "အာချွာ ဒီ ဂျို အီးဒီပီ",
    myDescription: "ပင်လယ်ရေညှိ့အနံ့နှင့် လတ်ဆတ်သော ရေနံ့အသက်။",
    noteNames: ["Lemon", "Jasmine", "Cedarwood"],
  },
  {
    name: "Eros EDT", slug: "versace-eros-edt", brand: "versace", category: "men",
    gender: "MEN", concentration: "EDT",
    description: "Mint, green apple and vanilla. A passionate, magnetic statement.",
    notesTop: "Mint, Green Apple", notesHeart: "Tonka Bean", notesBase: "Vanilla, Vetiver",
    scentFamily: "oriental", price: 135000, compareAtPrice: 155000,
    myName: "အီးရိုးစ် အီးဒီပီ",
    myDescription: "ပူစီနံ၊ ပန်းသီးနှင့် ဗားနီးလာပေါင်းစပ်ထားသော ချစ်စးဖွယ်အနံ့။",
    noteNames: ["Apple", "Vanilla", "Vetiver"],
  },
  {
    name: "1 Million EDT", slug: "paco-rabanne-1-million-edt", brand: "paco-rabanne", category: "men",
    gender: "MEN", concentration: "EDT",
    description: "Sweet spiced cinnamon and leather in a bold golden bottle.",
    notesTop: "Grapefruit, Mint", notesHeart: "Cinnamon, Rose", notesBase: "Leather, Amber",
    scentFamily: "oriental", price: 115000,
    myName: "ဝမ်း မီလီယံ အီးဒီပီ",
    myDescription: "ဒါစိန်နှင့် အရေခွံအနံ့ ပေါင်းစပ်ထားသော တောက်ပသော အမျိုးသားအနံ့။",
    noteNames: ["Pink Pepper", "Amber", "Musk"],
  },
  {
    name: "Y EDP", slug: "ysl-y-edp", brand: "ysl", category: "men",
    gender: "MEN", concentration: "EDP",
    description: "Fresh aromatic with white aldehydes and sage. For the driven modern man.",
    notesTop: "Aldehydes, Bergamot", notesHeart: "Sage, Geranium", notesBase: "Amberwood, Oud",
    scentFamily: "aromatic", price: 165000,
    myName: "ဝိုင် အီးဒီပီ",
    myDescription: "လတ်ဆတ်ပြီး အားပြင်းသော ခေတ်မီအမျိုးသားအတွက် အနံ့အသက်။",
    noteNames: ["Bergamot", "Oud", "Amber"],
  },
  {
    name: "Guilty Pour Homme EDT", slug: "gucci-guilty-pour-homme-edt", brand: "gucci", category: "men",
    gender: "MEN", concentration: "EDT",
    description: "Lavender and lemon with a modern woody drydown.",
    notesTop: "Lemon, Lavender", notesHeart: "Orange Flower", notesBase: "Cedar, Patchouli",
    scentFamily: "woody", price: 130000,
    myName: "ဂီလ်တီ ပူအာ အိုမ် အီးဒီပီ",
    myDescription: "လာဗင်ဒါနှင့် သံပိုးသီးအနံ့ ပေါင်းစပ်ထားသော ခေတ်မီအမျိုးသားအနံ့။",
    noteNames: ["Lemon", "Lavender", "Cedarwood"],
  },
  {
    name: "Oud Wood EDP", slug: "tom-ford-oud-wood-edp", brand: "tom-ford", category: "niche",
    gender: "UNISEX", concentration: "EDP",
    description: "Rare oud with sandalwood and tonka. Exotic, refined, unforgettable.",
    notesTop: "Rosewood, Cardamom", notesHeart: "Oud, Sandalwood", notesBase: "Tonka, Amber",
    scentFamily: "oriental", price: 480000,
    myName: "အုတ် ဝုဒ် အီးဒီပီ",
    myDescription: "ရှားပါးသော အုတ်သစ်နှင့် သစ်သားအနံ့။ ခမ်းနားပြီး မမေ့နိုင်သောအနံ့။",
    noteNames: ["Oud", "Sandalwood", "Amber", "Vanilla"],
  },
  {
    name: "Allure Homme Sport EDT", slug: "chanel-allure-homme-sport-edt", brand: "chanel", category: "men",
    gender: "MEN", concentration: "EDT",
    description: "Citrus and cedar with a salty mineral edge. Dynamic and fresh.",
    notesTop: "Orange, Sea Notes", notesHeart: "Cedar", notesBase: "Tonka, Musk",
    scentFamily: "aquatic", price: 140000,
    myName: "အာလျူး အိုမ် စပို့တ် အီးဒီပီ",
    myDescription: "ပင်လယ်ဆားလေနှင့် သစ်သားအနံ့ ပေါင်းစပ်ထားသော လှုပ်ရှားတက်ကြွသောအနံ့။",
    noteNames: ["Lemon", "Cedarwood", "Musk"],
  },
  {
    name: "Vibrant Leather EDP", slug: "zara-vibrant-leather-edp", brand: "zara", category: "men",
    gender: "MEN", concentration: "EDP",
    description: "Modern leather with citrus and patchouli. Great value everyday scent.",
    notesTop: "Bergamot", notesHeart: "Patchouli", notesBase: "Leather, Amber",
    scentFamily: "woody", price: 45000,
    myName: "ဗိုင်းဘရင့် လက်သာ အီးဒီပီ",
    myDescription: "အရေခွံအနံ့နှင့် ဆီတရ်သီးအနံ့ ပေါင်းစပ်ထားသော ဈေးနှုန်းသက်သာသော အမျိုးသားအနံ့။",
    noteNames: ["Bergamot", "Amber", "Vetiver"],
  },
  {
    name: "No.5 EDP", slug: "chanel-no-5-edp", brand: "chanel", category: "women",
    gender: "WOMEN", concentration: "EDP",
    description: "The legendary aldehydic floral. Timeless femininity in a bottle.",
    notesTop: "Aldehydes, Ylang-Ylang", notesHeart: "Rose, Jasmine", notesBase: "Vanilla, Sandalwood",
    scentFamily: "floral", price: 210000,
    myName: "နံပါတ် ၅ အီးဒီပီ",
    myDescription: "ပန်းပွင့်အနံ့နှင့် အလ်ဒီဟိုက်ပေါင်းစပ်ထားသော ထာဝရနာမည်ကြီး အမျိုးသမီးအနံ့။",
    noteNames: ["Ylang-Ylang", "Rose", "Jasmine", "Vanilla", "Sandalwood"],
  },
  {
    name: "J'adore EDP", slug: "dior-jadore-edp", brand: "dior", category: "women",
    gender: "WOMEN", concentration: "EDP",
    description: "A golden floral bouquet of ylang-ylang and jasmine. Pure radiance.",
    notesTop: "Pear, Melon", notesHeart: "Ylang-Ylang, Jasmine", notesBase: "Musk, Vanilla",
    scentFamily: "floral", price: 185000,
    myName: "ဂျာဒို အီးဒီပီ",
    myDescription: "ရွှေရောင် ပန်းပွင့်အနံ့များဖြင့် တောက်ပပြီး ချစ်စရာကောင်းသော အမျိုးသမီးအနံ့။",
    noteNames: ["Ylang-Ylang", "Jasmine", "Rose", "Musk", "Vanilla"],
  },
  {
    name: "Black Opium EDP", slug: "ysl-black-opium-edp", brand: "ysl", category: "women",
    gender: "WOMEN", concentration: "EDP",
    description: "Coffee and vanilla over white flowers. Addictive night-out energy.",
    notesTop: "Pink Pepper, Orange", notesHeart: "Jasmine, Coffee", notesBase: "Vanilla, Cedar",
    scentFamily: "oriental", price: 175000, compareAtPrice: 195000,
    myName: "ဘလက် အိုပီယမ် အီးဒီပီ",
    myDescription: "ကော်ဖီနှင့် ဗားနီးလာအနံ့ ပေါင်းစပ်ထားသော ဆွဲဆောင်မှုရှိသော အမျိုးသမီးအနံ့။",
    noteNames: ["Pink Pepper", "Jasmine", "Vanilla", "Cedarwood"],
  },
  {
    name: "Bloom EDP", slug: "gucci-bloom-edp", brand: "gucci", category: "women",
    gender: "WOMEN", concentration: "EDP",
    description: "Tuberose and jasmine in full bloom. A white floral garden.",
    notesTop: "Green Notes", notesHeart: "Tuberose, Jasmine", notesBase: "Rice, Orris",
    scentFamily: "floral", price: 160000,
    myName: "ဘလူမ် အီးဒီပီ",
    myDescription: "ဖြူစင်သော ပန်းပွင့်အနံ့များ ပြည့်စုံစွာ ပွင့်ထွက်နေသော ပန်းအနံ့။",
    noteNames: ["Jasmine", "Iris", "Musk"],
  },
  {
    name: "Bright Crystal EDT", slug: "versace-bright-crystal-edt", brand: "versace", category: "women",
    gender: "WOMEN", concentration: "EDT",
    description: "Peony and magnolia with a crystal-clear musky finish.",
    notesTop: "Yuzu, Pomegranate", notesHeart: "Peony, Magnolia", notesBase: "Musk, Amber",
    scentFamily: "floral", price: 110000,
    myName: "ဘိုင်းခရစ်စတယ် အီးဒီပီ",
    myDescription: "ပယင်းသီးနှင့် မဂ္ဂနီလာပန်းအနံ့ ပေါင်းစပ်ထားသော လတ်ဆတ်သော အမျိုးသမီးအနံ့။",
    noteNames: ["Rose", "Musk", "Amber"],
  },
  {
    name: "La Vie Est Belle EDP", slug: "lancome-la-vie-est-belle-edp", brand: "lancome", category: "women",
    gender: "WOMEN", concentration: "EDP",
    description: "Iris, jasmine and praline. Happiness captured in scent.",
    notesTop: "Blackcurrant", notesHeart: "Iris, Jasmine", notesBase: "Praline, Vanilla",
    scentFamily: "floral", price: 155000,
    myName: "လာဗီ အက်စဘယ်လ် အီးဒီပီ",
    myDescription: "ပရာလင်းနှင့် ဗားနီးလာအနံ့ ပေါင်းစပ်ထားသော ပျော်ရွှင်ဖွယ် အမျိုးသမီးအနံ့။",
    noteNames: ["Iris", "Jasmine", "Vanilla"],
  },
  {
    name: "Silver Mountain Water EDP", slug: "creed-silver-mountain-water-edp", brand: "creed", category: "niche",
    gender: "UNISEX", concentration: "EDP",
    description: "Cool tea and citrus over musk. Alpine freshness in a bottle.",
    notesTop: "Bergamot, Mandarin", notesHeart: "Green Tea", notesBase: "Musk, Sandalwood",
    scentFamily: "fresh", price: 520000,
    myName: "ဆီးလ်ဗာ မောင်တိန်း ဝေးတာ အီးဒီပီ",
    myDescription: "တောင်ထိပ်လေသက်သက်ကဲ့သို့ လတ်ဆတ်သော လက်ဖက်ရည်အနံ့။",
    noteNames: ["Bergamot", "Sandalwood", "Musk"],
  },
  {
    name: "Tobacco Vanille EDP", slug: "tom-ford-tobacco-vanille-edp", brand: "tom-ford", category: "niche",
    gender: "UNISEX", concentration: "EDP",
    description: "Pipe tobacco, vanilla and spices. Rich, warm, indulgent.",
    notesTop: "Spices", notesHeart: "Tobacco Leaf", notesBase: "Vanilla, Cacao",
    scentFamily: "oriental", price: 495000,
    myName: "တိုဘာကို ဗားနီးလ် အီးဒီပီ",
    myDescription: "ဆေးလိပ်ရွက်နှင့် ဗားနီးလာအနံ့ ပေါင်းစပ်ထားသော နွေးထွေးပြီး ချိုမြိန်သောအနံ့။",
    noteNames: ["Vanilla", "Amber", "Cedarwood"],
  },
  {
    name: "Santal 33", slug: "le-labo-santal-33", brand: "le-labo", category: "niche",
    gender: "UNISEX", concentration: "EDP",
    description: "Sandalwood and leather with violet. The cult unisex classic.",
    notesTop: "Violet, Cardamom", notesHeart: "Iris, Ambrox", notesBase: "Sandalwood, Cedar",
    scentFamily: "woody", price: 450000,
    myName: "ဆန်တယ် ၃၃",
    myDescription: "သစ်သားအနံ့နှင့် အရေခွံအနံ့ ပေါင်းစပ်ထားသော နာမည်ကြီး နှစ်ဦးသုံးအနံ့။",
    noteNames: ["Iris", "Sandalwood", "Cedarwood", "Musk"],
  },
  {
    name: "Baccarat Rouge 540 EDP", slug: "mfk-baccarat-rouge-540-edp", brand: "mfk", category: "niche",
    gender: "UNISEX", concentration: "EDP",
    description: "Saffron and amberwood. The most wanted scent of the decade.",
    notesTop: "Saffron, Jasmine", notesHeart: "Amberwood", notesBase: "Cedar, Musk",
    scentFamily: "oriental", price: 680000, compareAtPrice: 750000,
    myName: "ဘက်ကာရက် ရူး ၅၄၀ အီးဒီပီ",
    myDescription: "နန်းသက်ပန်းနှင့် အမ်ဘာဝုဒ်အနံ့ ပေါင်းစပ်ထားသော နာမည်အကြီးဆုံး နှစ်ဦးသုံးအနံ့။",
    noteNames: ["Jasmine", "Amber", "Cedarwood", "Musk"],
  },
  {
    name: "Ebony Woods EDP", slug: "zara-ebony-woods-edp", brand: "zara", category: "unisex",
    gender: "UNISEX", concentration: "EDP",
    description: "Dark woods and clove. A warm winter staple at a friendly price.",
    notesTop: "Clove", notesHeart: "Rose", notesBase: "Ebony Wood, Amber",
    scentFamily: "woody", price: 55000,
    myName: "အီဘနီ ဝုဒ် အီးဒီပီ",
    myDescription: "မှောင်မိုက်သော သစ်သားနှင့် လေးညှင်းပင်အနံ့ ပေါင်းစပ်ထားသော ဆောင်းရာသီအတွက် သင့်တော်သောအနံ့။",
    noteNames: ["Cedarwood", "Amber", "Vetiver"],
  },
];

function deriveNoteNames(p: Pick<CatalogProduct, "notesTop" | "notesHeart" | "notesBase">): string[] {
  const names = `${p.notesTop}, ${p.notesHeart}, ${p.notesBase}`
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(names)];
}

function catalogProducts(): SeedProduct[] {
  return CATALOG.map((c) => ({
    name: c.name,
    slug: productSlug(c.brand, c.name),
    brand: c.brand,
    category: c.category,
    gender: c.gender,
    concentration: c.concentration,
    description: c.description,
    notesTop: c.notesTop,
    notesHeart: c.notesHeart,
    notesBase: c.notesBase,
    scentFamily: c.scentFamily,
    price: c.price,
    compareAtPrice: c.compareAtPrice,
    noteNames: deriveNoteNames(c),
  }));
}

async function main() {
  console.log("Seeding...");

  for (const b of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }

  for (const b of EXTRA_BRANDS) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }

  const categorySlugs: Record<string, string> = {
    men: "men", women: "women", niche: "niche", unisex: "unisex",
  };

  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  for (const n of NOTES) {
    await prisma.note.upsert({
      where: { name: n.name },
      update: {},
      create: n,
    });
  }

  for (const n of EXTRA_NOTES) {
    await prisma.note.upsert({
      where: { name: n.name },
      update: {},
      create: n,
    });
  }

  // Ensure Lancome brand (used above, keep list honest)
  await prisma.brand.upsert({
    where: { slug: "lancome" },
    update: {},
    create: { name: "Lancôme", slug: "lancome", description: "French luxury beauty house." },
  });

  await prisma.user.upsert({
    where: { email: "admin@perfumeshop.com" },
    update: {},
    create: {
      email: "admin@perfumeshop.com",
      name: "Admin",
      passwordHash: await hash("Admin123!", 10),
      role: "ADMIN",
      locale: "en",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@perfumeshop.com" },
    update: {},
    create: {
      email: "demo@perfumeshop.com",
      name: "Demo User",
      passwordHash: await hash("Demo123!", 10),
      role: "USER",
      locale: "en",
      phone: "0912345678",
    },
  });

  const allProducts = [...PRODUCTS, ...catalogProducts()];

  const slugs = new Set<string>();
  for (const p of allProducts) {
    if (slugs.has(p.slug)) throw new Error(`Duplicate product slug: ${p.slug}`);
    slugs.add(p.slug);
  }

  const knownNotes = new Set([...NOTES, ...EXTRA_NOTES].map((n) => n.name));
  for (const name of new Set(allProducts.flatMap((p) => p.noteNames))) {
    if (!knownNotes.has(name)) {
      console.warn(`Note "${name}" not in vocabulary; creating as BASE.`);
      knownNotes.add(name);
      await prisma.note.upsert({
        where: { name },
        update: {},
        create: { name, type: "BASE" },
      });
    }
  }

  const sizePrice = (base: number, ml: 30 | 50 | 100) =>
    ml === 30 ? Math.round(base * 0.7) : ml === 100 ? Math.round(base * 1.6) : base;

  for (const p of allProducts) {
    const sizes: Array<30 | 50 | 100> = [30, 50, 100];
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        brand: { connect: { slug: p.brand } },
        category: { connect: { slug: categorySlugs[p.category] ?? p.category } },
        gender: p.gender,
        concentration: p.concentration,
        description: p.description,
        notesTop: p.notesTop,
        notesHeart: p.notesHeart,
        notesBase: p.notesBase,
        scentFamily: p.scentFamily,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        variants: {
          create: sizes.map((ml) => ({
            sizeMl: ml,
            price: sizePrice(p.price, ml),
            stock: 20 + ((ml + p.slug.length) % 30),
            sku: `${p.slug.toUpperCase().replace(/[^A-Z0-9]/g, "-")}-${ml}`,
          })),
        },
        images: {
          create: [
            { url: IMG(`${p.slug}-1`), alt: p.name, sortOrder: 0 },
            { url: IMG(`${p.slug}-2`), alt: `${p.name} detail`, sortOrder: 1 },
          ],
        },
        ...(p.myName
          ? {
              translations: {
                create: [{ locale: "my", name: p.myName, description: p.myDescription ?? p.description }],
              },
            }
          : {}),
        productNotes: {
          create: p.noteNames.map((name) => ({ note: { connect: { name } } })),
        },
      },
    });
  }

  const settings: { key: string; value: unknown }[] = [
    { key: "siteName", value: { en: "Perfume Shop", my: "အမွှေးနံ့သာ ဆိုင်" } },
    {
      key: "shipping",
      value: { feeMmk: 3000, freeOverMmk: 150000, codEnabled: true },
    },
    {
      key: "paymentMethods",
      value: {
        kbzpay: { mode: "STATIC_QR", qrImageUrl: "", enabled: true },
        bank: {
          enabled: true,
          accounts: [
            { bank: "KBZ Bank", accountName: "Perfume Shop", accountNo: "123-456-789012-3-45" },
            { bank: "AYA Bank", accountName: "Perfume Shop", accountNo: "001-234-567890" },
          ],
        },
        cod: { enabled: true, feeMmk: 0 },
      },
    },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value as object },
    });
  }

  const count = await prisma.product.count();
  const images = await generateProductImages(prisma);
  console.log(`Seed complete. Products in DB: ${count}`);
  console.log(
    `Product images generated: ${images.written} files, ${images.updated} rows updated`
  );
  console.log("Admin login: admin@perfumeshop.com / Admin123!");
  console.log("Demo login:  demo@perfumeshop.com / Demo123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
