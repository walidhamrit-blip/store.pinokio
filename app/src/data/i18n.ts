// French and Arabic copy for the catalogue. English lives in products.ts and
// is used as the fallback, so a product only needs an entry here once it has
// been translated.
import type { Category, Product } from './products'
import type { Lang } from '../app/i18n/dict'

export interface ProductCopy {
  name: string
  short: string
  description: string
  details: string[]
  materials: string
}

type ProductCopyByLang = Partial<Record<Lang, Record<string, ProductCopy>>>

export const productCopy: ProductCopyByLang = {
  fr: {
    'pour-over-carafe': {
      name: 'Carafe à filtre',
      short: 'Grès mat, 750 ml',
      description:
        'Une carafe dessinée pour le versement lent. La taille se love dans la main et le bec est coupé pour que la dernière goutte tombe dans la tasse, pas sur la table.',
      details: ['Contenance 750 ml', 'Compatible lave-vaisselle, mais préfère un rinçage', 'Chaque pièce varie légèrement de teinte'],
      materials: 'Grès émaillé mat sable, cuit à 1240 °C dans notre atelier de Lisbonne.',
    },
    'speckled-mug-pair': {
      name: 'Tasses mouchetées, paire',
      short: 'Émail avoine, 320 ml chacune',
      description:
        'Deux tasses à l’anse généreuse et au bord assez fin pour bien boire. Les mouchetures viennent du fer de l’argile : aucune ne ressemble à une autre.',
      details: ['Lot de deux', '320 ml chacune', 'Compatible micro-ondes et lave-vaisselle'],
      materials: 'Grès tacheté de fer, émail satiné couleur avoine.',
    },
    'washed-linen-throw': {
      name: 'Plaid en lin lavé',
      short: 'Avoine, 130 × 180 cm',
      description:
        'Lin européen épais, lavé à la pierre jusqu’à tomber comme une pièce que vous possédez depuis des années. Les franges sont torsadées à la main.',
      details: ['130 × 180 cm', 'S’adoucit à chaque lavage', 'Tissé au Portugal'],
      materials: '100 % lin européen, prélavé. Lavage machine à froid, séchage à l’air.',
    },
    'walnut-serving-board': {
      name: 'Planche de service en noyer',
      short: 'Noyer massif, 60 cm',
      description:
        'Une longue planche taillée dans une seule pièce de noyer noir américain, avec une poignée tournée pour bien tenir dans la paume. Finition à l’huile alimentaire.',
      details: ['60 × 14 cm', 'Lavage à la main, huiler de temps en temps', 'Le veinage et la teinte varient'],
      materials: 'Noyer noir américain massif, fini à la cire d’abeille et à l’huile minérale.',
    },
    'amber-soy-candle': {
      name: 'Bougie de soja, cèdre et figue',
      short: 'Verre ambré, 50 heures',
      description:
        'Cèdre sec, figue verte et un peu de fumée. Coulée à la main en petites séries dans un verre ambré réutilisable, avec une mèche de coton qui brûle proprement.',
      details: ['Environ 50 heures', 'Verre réutilisable avec couvercle en bois', 'Coupez la mèche à 5 mm avant chaque allumage'],
      materials: 'Cire de soja, mèche en coton, huiles essentielles et parfums fins.',
    },
    'brass-table-lamp': {
      name: 'Lampe de table en laiton',
      short: 'Laiton brossé, abat-jour en lin',
      description:
        'Une petite lampe à base en laiton fuselée et abat-jour en lin naturel qui réchauffe n’importe quelle ampoule. Pour une table de nuit ou un coin de bureau.',
      details: ['Hauteur 42 cm', 'Douille E27, ampoule incluse', 'Variateur sur le cordon'],
      materials: 'Base en laiton massif brossé, abat-jour en lin naturel sur armature acier.',
    },
    'terracotta-vase': {
      name: 'Grand vase en terre cuite',
      short: 'Non émaillé, 34 cm',
      description:
        'Un vase bouteille élancé au col étroit, pour une seule branche. Laissé brut pour que l’argile garde sa surface douce et crayeuse.',
      details: ['Hauteur 34 cm', 'Intérieur résistant à l’eau', 'Nettoyage à sec'],
      materials: 'Terre cuite rouge, scellée à l’intérieur.',
    },
    'waffle-towel-set': {
      name: 'Lot de serviettes gaufrées',
      short: 'Trois serviettes, coton',
      description:
        'Une armure gaufrée lâche qui sèche vite et reste légère sur la peau. Elle s’épaissit au lavage au lieu de s’user.',
      details: ['Deux grands draps de bain, une serviette', 'Coton turc à longues fibres', 'Lavage machine à chaud doux'],
      materials: '100 % coton à longues fibres, 350 g/m².',
    },
    'glass-carafe-set': {
      name: 'Carafe et verre en verre',
      short: 'Borosilicate, 1 l',
      description: 'Une carafe de chevet avec son verre qui sert aussi de couvercle. Fine, légère et étonnamment solide.',
      details: ['Carafe 1 litre, verre 250 ml', 'Résistant à la chaleur', 'Compatible lave-vaisselle'],
      materials: 'Verre borosilicate soufflé à la bouche.',
    },
    'linen-apron': {
      name: 'Tablier en lin',
      short: 'Sauge, bretelles croisées',
      description:
        'Un tablier à bretelles croisées qui tient aux épaules sans tour de cou. Grande poche devant, longs liens, sans chichis.',
      details: ['Taille unique', 'Bretelles croisées', 'Poche avant'],
      materials: '100 % lin lavé.',
    },
    'soapstone-incense-holder': {
      name: 'Porte-encens en stéatite',
      short: 'Pierre sculptée à la main',
      description:
        'Un galet de stéatite noire percé d’un seul trou, sculpté et poli à la main. Assez lourd pour rester en place, assez petit pour voyager.',
      details: ['Environ 9 cm de large', 'Pour bâtons standards', 'Nettoyage à sec'],
      materials: 'Stéatite naturelle. Chaque pièce a une forme légèrement différente.',
    },
  },

  ar: {
    'pour-over-carafe': {
      name: 'كَراف القهوة المقطّرة',
      short: 'خزف مطفي، 750 مل',
      description:
        'كَراف مصمم للصبّ البطيء. يتّسع الخصر ليجلس طبيعيًا في اليد، وحُدّت الحافة بحيث تقع آخر قطرة في الفنجان لا على الطاولة.',
      details: ['يتسع لـ 750 مل', 'آمن في غسالة الأطباق، لكنه يفضّل الشطف', 'تختلف كل قطعة قليلًا في اللون'],
      materials: 'خزف بطلاء رملي مطفي، مشوي على حرارة 1240 °م في استوديونا في لشبونة.',
    },
    'speckled-mug-pair': {
      name: 'كوب منقّط، قطعتان',
      short: 'طلاء بلون الشوفان، 320 مل لكل كوب',
      description:
        'كوبان بمقبض واسع وحافة رقيقة تكفي للشرب بارتياح. يأتي التنقيط من الحديد في الطين، فلا يتشابه كوبان.',
      details: ['طقم من قطعتين', '320 مل لكل كوب', 'آمن في الميكروويف وغسالة الأطباق'],
      materials: 'خزف مرشوش بالحديد بطلاء ساتاني بلون الشوفان.',
    },
    'washed-linen-throw': {
      name: 'بطّانية كتّان مغسولة',
      short: 'الشوفان، 130 × 180 سم',
      description:
        'كتّان أوروبي ثقيل، مغسول بالحجر حتى ينسدل كأنه قطعة تملكها منذ سنوات. الأطراف مفتولة باليد.',
      details: ['130 × 180 سم', 'يزداد نعومة مع كل غسلة', 'منسوجة في البرتغال'],
      materials: 'كتّان أوروبي 100٪، مغسول مسبقًا. غسيل آلي بماء بارد، وتجفيف على الحبل.',
    },
    'walnut-serving-board': {
      name: 'لوح تقديم من الجوز',
      short: 'جوز صلب، 60 سم',
      description:
        'لوح طويل مقطوع من قطعة واحدة من الجوز الأسود الأمريكي، بمقبض مخروط ليجلس مريحًا في راحة اليد. مشطّب بزيت آمن للطعام.',
      details: ['60 × 14 سم', 'غسل يدوي ودهن بالزيت أحيانًا', 'تختلف العروق واللون'],
      materials: 'جوز أسود أمريكي صلب، مشطّب بشمع العسل والزيت المعدني.',
    },
    'amber-soy-candle': {
      name: 'شمعة صويا، الأرز والتين',
      short: 'زجاج عنبري، 50 ساعة',
      description:
        'أرز جاف وتين أخضر وقليل من الدخان. تُصبّ باليد بكميات صغيرة في زجاج عنبري قابل لإعادة الاستخدام، بفتيل قطني يحترق بنظافة.',
      details: ['نحو 50 ساعة', 'زجاج قابل لإعادة الاستخدام مع غطاء خشبي', 'قصّ الفتيل إلى 5 مم قبل كل إشعال'],
      materials: 'شمع صويا، فتيل قطني، زيوت عطرية أساسية ومركّزة.',
    },
    'brass-table-lamp': {
      name: 'مصباح طاولة نحاسي',
      short: 'نحاس مصقول، غطاء كتّان',
      description:
        'مصباح صغير بقاعدة نحاسية مخروطية وغطاء من الكتّان الطبيعي يمنح أي مصباح دفئًا. مناسب للطاولة بجانب السرير أو زاوية المكتب.',
      details: ['ارتفاع 42 سم', 'قاعدة E27، اللمبة مشمولة', 'مفتاح تعتيم على السلك'],
      materials: 'قاعدة نحاس صلب مصقول، وغطاء كتّان طبيعي على هيكل فولاذي.',
    },
    'terracotta-vase': {
      name: 'مزهرية تراكوتا عالية',
      short: 'بدون طلاء، 34 سم',
      description:
        'مزهرية طويلة بعنق ضيق تتسع لغصن واحد. تُركت دون طلاء لتحتفظ الطينة بملمسها الناعم الطباشيري.',
      details: ['ارتفاع 34 سم', 'بطانة مقاومة للماء', 'تُمسح بقطعة قماش'],
      materials: 'فخّار أحمر، مبطّن من الداخل.',
    },
    'waffle-towel-set': {
      name: 'طقم مناشف وافل',
      short: 'ثلاث مناشف قطنية',
      description:
        'نسيج وافل خفيف يجفّ سريعًا ويبقى لطيفًا على البشرة. يزداد نعومة مع الغسيل لا رقّة.',
      details: ['منشفتا استحمام ومنشفة يد', 'قطن تركي طويل التيلة', 'غسيل آلي بماء دافئ'],
      materials: 'قطن 100٪ طويل التيلة، 350 غ/م².',
    },
    'glass-carafe-set': {
      name: 'كَراف وكوب زجاجي',
      short: 'بوروسيليكات، 1 لتر',
      description: 'كَراف للسرير مع كوب يعمل غطاءً له أيضًا. رقيق وخفيف ومتين أكثر مما يبدو.',
      details: ['كَراف 1 لتر، كوب 250 مل', 'مقاوم للحرارة', 'آمن في غسالة الأطباق'],
      materials: 'زجاج بوروسيليكات منفوخ يدويًا.',
    },
    'linen-apron': {
      name: 'مريلة كتّان',
      short: 'أخضر مريمي، بحزام متقاطع',
      description:
        'مريلة بحزام متقاطع تثبت على الكتفين دون شريط حول العنق. جيب أمامي واسع وأربطة طويلة، دون تعقيد.',
      details: ['مقاس واحد', 'أحزمة متقاطعة', 'جيب أمامي'],
      materials: 'كتّان مغسول 100٪.',
    },
    'soapstone-incense-holder': {
      name: 'حاملة بخور من الحجر الأملس',
      short: 'حجر منحوت يدويًا',
      description:
        'حجر أملس أسود بثقب واحد، منحوت ومصقول باليد. ثقيل بما يكفي ليبقى في مكانه، وصغير بما يكفي للسفر.',
      details: ['بعرض 9 سم تقريبًا', 'يناسب أعواد البخور العادية', 'تُمسح بقطعة قماش'],
      materials: 'حجر أملس طبيعي. لكل قطعة شكل مختلف قليلًا.',
    },
  },
}

// Choice values on the product pages ("Oat", "Sage", "Sea salt"...).
const optionLabels: Partial<Record<Lang, Record<string, string>>> = {
  fr: {
    Oatmeal: 'Avoine',
    Ash: 'Cendre',
    Clay: 'Argile',
    Oat: 'Avoine',
    Charcoal: 'Charbon',
    Sage: 'Sauge',
    'Cedar and fig': 'Cèdre et figue',
    'Tobacco leaf': 'Feuille de tabac',
    'Sea salt': 'Sel marin',
    Ivory: 'Ivoire',
    Stone: 'Pierre',
    Moss: 'Mousse',
    Natural: 'Naturel',
  },
  ar: {
    Oatmeal: 'الشوفان',
    Ash: 'الرماد',
    Clay: 'الطين',
    Oat: 'الشوفان',
    Charcoal: 'الفحمي',
    Sage: 'المريمي',
    'Cedar and fig': 'الأرز والتين',
    'Tobacco leaf': 'ورق التبغ',
    'Sea salt': 'ملح البحر',
    Ivory: 'العاجي',
    Stone: 'الحجري',
    Moss: 'الطحلبي',
    Natural: 'الطبيعي',
  },
}

const categoryLabels: Partial<Record<Lang, Partial<Record<Category, string>>>> = {
  fr: { ceramics: 'Céramiques', textiles: 'Textiles', lighting: 'Luminaires', kitchen: 'Cuisine', home: 'Maison' },
  ar: { ceramics: 'الخزف', textiles: 'المنسوجات', lighting: 'الإضاءة', kitchen: 'المطبخ', home: 'المنزل' },
}

const categoryBlurbs: Partial<Record<Lang, Partial<Record<Category, string>>>> = {
  fr: {
    ceramics: 'Tournées et émaillées à la main',
    textiles: 'Lin et coton lavés',
    lighting: 'Chaleureuse, basse et discrète',
  },
  ar: {
    ceramics: 'مشكول ومطلي باليد',
    textiles: 'كتّان وقطن مغسول',
    lighting: 'دافئة وخافتة وهادئة',
  },
}

export const countryLabels: { key: string; labels: Partial<Record<Lang, string>> }[] = [
  { key: 'United States', labels: { ar: 'الولايات المتحدة', fr: 'États-Unis' } },
  { key: 'United Kingdom', labels: { ar: 'المملكة المتحدة', fr: 'Royaume-Uni' } },
  { key: 'Canada', labels: { ar: 'كندا', fr: 'Canada' } },
  { key: 'Germany', labels: { ar: 'ألمانيا', fr: 'Allemagne' } },
  { key: 'France', labels: { ar: 'فرنسا', fr: 'France' } },
  { key: 'Netherlands', labels: { ar: 'هولندا', fr: 'Pays-Bas' } },
  { key: 'Portugal', labels: { ar: 'البرتغال', fr: 'Portugal' } },
  { key: 'Australia', labels: { ar: 'أستراليا', fr: 'Australie' } },
]

/** A product with its copy swapped for the active language. */
export function localizeProduct(product: Product, lang: Lang): Product {
  const copy = productCopy[lang]?.[product.slug]
  if (!copy) return product
  return { ...product, ...copy }
}

export function localizeCategory<T extends { key: Category; label: string; blurb: string }>(category: T, lang: Lang): T {
  return {
    ...category,
    label: categoryLabels[lang]?.[category.key] ?? category.label,
    blurb: categoryBlurbs[lang]?.[category.key] ?? category.blurb,
  }
}

export function categoryLabel(category: Category, lang: Lang): string {
  const base = category.charAt(0).toUpperCase() + category.slice(1)
  return categoryLabels[lang]?.[category] ?? base
}

export function optionLabel(value: string, lang: Lang): string {
  return optionLabels[lang]?.[value] ?? value
}
