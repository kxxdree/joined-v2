/**
 * Фото-заглушки с Unsplash (лицензия Unsplash: бесплатно, без атрибуции).
 * На сайте они тонируются в фирменный оранжевый (см. UiPhoto).
 * ph('jazz,piano', 3) → стабильное фото из подходящей категории.
 */
const photoIdsByCategory = {
  // интерьеры баров (#9 #10 #11 #14 #26 #35)
  bar: ['1572116469696-31de0f17cc34', '1525268323446-0505b6fe7778', '1543007630-9710e4a00a20', '1508700115892-45ecd05ae2ad', '1574096079513-d8259312b785', '1514320291840-2e0a9bf2a9ae'],
  // напитки и бармены (#0 #12 #22 #23 #24 #25)
  drinks: ['1514362545857-3bc16c4c7d1b', '1510812431401-41d2bd2722f3', '1485872299829-c673f5194813', '1566417713940-fe7c737a9ef2', '1470337458703-46ad1756a187', '1551024709-8f23befc6f87'],
  // концерты и толпа (#1 #2 #3 #6 #7 #8 #19 #20 #21 #31 #32 #33 #39 #41)
  crowd: ['1470229722913-7c0e2dbbafd3', '1501386761578-eac5c94b800a', '1493225457124-a3eb161ffa5f', '1459749411175-04bf5292ceea', '1516450360452-9312f5e86fc7', '1533174072545-7a4b6ad7a6c3', '1524368535928-5b5e00ddc76b', '1429962714451-bb934ecdc4ec', '1506157786151-b8491531f063', '1514525253161-7a46d19cd819', '1540039155733-5bb30b53aa14', '1492684223066-81342ee5ff30', '1501612780327-45045538702b', '1563841930606-67e2bce48b78'],
  // живые группы (#18 #36 #35)
  band: ['1498038432885-c6f3f1b912ee', '1460723237483-7a6dc9d0b212', '1514320291840-2e0a9bf2a9ae'],
  // джаз (#4 #5 #13 #28 #34 #37)
  jazz: ['1511192336575-5a79af67a629', '1415201364774-f6f0bb35f28f', '1511671782779-c97d3d27a1d4', '1520523839897-bd0b52f945a0', '1516280440614-37939bbacd81', '1503095396549-807759245b35'],
  // классика (#16 #17 #28)
  classical: ['1465847899084-d164df4dedc6', '1507838153414-b4b713384a76', '1520523839897-bd0b52f945a0'],
  // электроника и клубы (#15 #29 #31 #40)
  dj: ['1574391884720-bbc3740c59d1', '1504898770365-14faca6a7320', '1470225620780-dba8ba36b745', '1514525253161-7a46d19cd819'],
  // хип-хоп и винил (#27 #30 #38 #42)
  hiphop: ['1415886541506-6efc5e4b1786', '1487180144351-b8472da7d491', '1468164016595-6108e4c60c8b', '1576525865260-9f0e7cfb02b3'],
} as const

type PhotoCategory = keyof typeof photoIdsByCategory

const keywordMap: Record<string, PhotoCategory> = {
  bar: 'bar', pub: 'bar', interior: 'bar', bartender: 'bar', lounge: 'bar', neon: 'bar', lights: 'bar',
  cocktail: 'drinks', wine: 'drinks', beer: 'drinks', whiskey: 'drinks', candle: 'drinks',
  concert: 'crowd', crowd: 'crowd', festival: 'crowd', openair: 'crowd', stage: 'crowd', party: 'crowd', disco: 'crowd', halloween: 'crowd',
  rock: 'band', band: 'band', guitar: 'band', live: 'band', acoustic: 'band', postpunk: 'band', blues: 'band', harmonica: 'band', vinyl: 'band', rooftop: 'band',
  jazz: 'jazz', saxophone: 'jazz', piano: 'jazz', bigband: 'jazz', jam: 'jazz',
  violin: 'classical', cello: 'classical',
  dj: 'dj', club: 'dj', nightclub: 'dj', techno: 'dj', synthesizer: 'dj',
  rapper: 'hiphop', hiphop: 'hiphop', microphone: 'hiphop', city: 'hiphop', night: 'hiphop', dark: 'band',
}

export const ph = (keywords: string, photoSeed: number, widthPx = 900, heightPx = 700) => {
  const category = keywords.split(/[^a-z]+/).map(k => keywordMap[k]).find(Boolean) ?? 'crowd'
  const categoryPhotoIds = photoIdsByCategory[category]
  const photoId = categoryPhotoIds[photoSeed % categoryPhotoIds.length]
  return `https://images.unsplash.com/photo-${photoId}?w=${widthPx}&h=${heightPx}&fit=crop&q=70&auto=format`
}
