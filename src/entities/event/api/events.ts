import { isoDay as day, ph } from '@shared/lib'
import type { EventItem } from '../model/types'

const std = (price: number, left = 120) => ({ id: 'standard' as const, name: 'Стандарт', desc: 'Входной билет, танцпол / свободная рассадка', price, left })
const vip = (price: number, left = 20) => ({ id: 'vip' as const, name: 'VIP', desc: 'Отдельная зона, приветственный коктейль, гардероб без очереди', price, left })
const table = (price: number, left = 8) => ({ id: 'table' as const, name: 'Столик на 4', desc: 'Столик у сцены, депозит включён в стоимость', price, left })
// Афиши - готовые вертикальные картинки для соцсетей (9:16); в демо - реальная афиша и заглушки
const LINEUP_POSTER = '/posters/lineup.jpg'
const poster = (keywords: string, lock: number) => ph(keywords, lock, 720, 1280)

export const events: EventItem[] = [
  { id: 'e1', title: 'Jazz Night: Blue Note Trio', venue: 'red-velvet', artists: ['blue-note-trio'], genres: ['jazz'], date: day(0), time: '21:00', description: 'Три сета джазовых стандартов и новых композиций. Начало в 21:00, второй сет - в 22:30, джем-сейшн после полуночи.', photo: ph('jazz,piano', 401), posters: [LINEUP_POSTER, poster('jazz,piano', 601), poster('concert,stage', 602)], tickets: [std(800), vip(2500), table(8000)] },
  { id: 'e2', title: 'Orange Sunset - презентация альбома', venue: 'garage-hall', artists: ['orange-sunset'], genres: ['indie', 'pop'], date: day(2), time: '20:00', description: 'Большой концерт в честь выхода альбома «Тёплый шум»: полная программа, новые аранжировки и специальные гости.', photo: ph('concert,lights', 402), posters: [LINEUP_POSTER, poster('concert,lights', 603)], tickets: [std(2200, 340), vip(5500, 30)] },
  { id: 'e3', title: 'KINETIC Live', venue: 'neon-lounge', artists: ['kinetic'], genres: ['electronic'], date: day(3), time: '23:00', description: 'Четырёхчасовой live-сет на модульных синтезаторах с генеративными визуалами на панорамных окнах.', photo: ph('dj,lights', 403), posters: [poster('dj,lights', 604), LINEUP_POSTER], tickets: [std(1800), vip(6000), table(25000, 4)] },
  { id: 'e4', title: 'Candlelight: Radiohead', venue: 'philharmonia-bar', artists: ['string-theory'], genres: ['classical'], date: day(4), time: '19:30', description: 'Хиты Radiohead в исполнении струнного квартета при свете сотен свечей.', photo: ph('candle,violin', 404), tickets: [std(2500, 40), vip(4500, 10)] },
  { id: 'e5', title: 'Кавер-вечеринка: 90-е', venue: 'dubliner', artists: [], genres: ['rock', 'live'], date: day(5), time: '21:00', description: 'Кавер-бэнд играет главные рок-хиты 90-х: от Nirvana до «Сплина». Вход свободный до 20:00.', photo: ph('pub,band', 405), tickets: [std(500, 200), table(4000)] },
  { id: 'e6', title: 'Iron Wolves - «Стая» тур', venue: 'rock-n-roll-kazan', artists: ['iron-wolves', 'velvet-drive', 'delta-blues-band', 'orange-sunset'], genres: ['rock'], date: day(5), time: '20:00', description: 'Казанский хард-рок в родных стенах: полный сет и треки с нового альбома.', photo: ph('rock,concert', 406), tickets: [std(1200, 150), vip(3000)] },
  { id: 'e7', title: 'Акустика на Рубинштейна', venue: 'fonarik', artists: ['orange-sunset'], genres: ['indie', 'live'], date: day(6), time: '20:30', description: 'Камерный акустический сет Orange Sunset в Петербурге. Всего 60 мест.', photo: ph('acoustic,guitar', 407), tickets: [std(1500, 60)] },
  { id: 'e8', title: 'Big Band Night', venue: 'jazz-philharmonic', artists: ['blue-note-trio'], genres: ['jazz'], date: day(6), time: '19:00', description: 'Биг-бенд и гости: свинг, бибоп и танцы между столиками.', photo: ph('bigband,jazz', 408), tickets: [std(1900), vip(3500), table(10000)] },
  { id: 'e9', title: 'MC North & live band', venue: 'bass-cave', artists: ['mc-north'], genres: ['hiphop'], date: day(7), time: '22:00', description: 'Презентация альбома «Белые ночи» с живым составом.', photo: ph('hiphop,concert', 409), tickets: [std(1600, 250), vip(4000)] },
  { id: 'e10', title: 'Techno Underground', venue: 'bass-cave', artists: ['kinetic'], genres: ['electronic'], date: day(9), time: '23:59', description: 'Всю ночь техно от резидентов и KINETIC в формате b2b.', photo: ph('techno,club', 410), tickets: [std(1200, 300)] },
  { id: 'e11', title: 'Delta Blues Band', venue: 'siberia-jazz', artists: ['delta-blues-band'], genres: ['blues'], date: day(10), time: '20:00', description: 'Вечер дельта-блюза: гармоника, слайд и истории из жизни блюзменов.', photo: ph('blues,harmonica', 411), tickets: [std(900), table(5000)] },
  { id: 'e12', title: 'Velvet Drive', venue: 'ural-sound', artists: ['velvet-drive'], genres: ['rock', 'indie'], date: day(11), time: '20:00', description: 'Уральский пост-панк: «Бетон» целиком и новые песни.', photo: ph('postpunk,stage', 412), tickets: [std(1300, 400), vip(3200)] },
  { id: 'e13', title: 'Friday Jam Session', venue: 'red-velvet', artists: [], genres: ['jazz', 'live'], date: day(12), time: '23:00', description: 'Открытая джем-сессия: приходите послушать или выйти на сцену со своим инструментом.', photo: ph('jam,saxophone', 413), posters: [LINEUP_POSTER, LINEUP_POSTER], tickets: [std(500)] },
  { id: 'e14', title: 'Disco Sunset', venue: 'neon-lounge', artists: [], genres: ['electronic', 'pop'], date: day(13), time: '19:00', description: 'Диско и ню-диско на закате с видом на Сити.', photo: ph('disco,party', 414), tickets: [std(1500), table(18000, 6)] },
  { id: 'e15', title: 'Indie Weekend Fest', venue: 'garage-hall', artists: ['orange-sunset', 'velvet-drive'], genres: ['indie', 'rock'], date: day(19), time: '17:00', description: 'Однодневный фестиваль: 6 групп на одной сцене, фудкорт и маркет мерча.', photo: ph('festival,crowd', 415), tickets: [std(3200, 600), vip(7500, 50)] },
  { id: 'e16', title: 'Bach & Bourbon', venue: 'philharmonia-bar', artists: ['string-theory'], genres: ['classical'], date: day(24), time: '20:00', description: 'Баховские сюиты и дегустация бурбонов от бренд-амбассадора.', photo: ph('cello,whiskey', 416), tickets: [std(3500, 30)] },
  // Воронеж и Липецк
  { id: 'e17', title: 'Чернозём - «Степь» тур', venue: 'voronezh-arena', artists: ['chernozem'], genres: ['rock', 'indie'], date: day(4), time: '20:00', description: 'Большой домашний концерт: альбом «Степь» целиком, новые песни и гости с соседних сцен.', photo: ph('rock,concert', 420), tickets: [std(1400, 400), vip(3500)] },
  { id: 'e18', title: 'Jazz & Books', venue: 'platonov-bar', artists: [], genres: ['jazz', 'live'], date: day(6), time: '20:30', description: 'Джазовое трио и чтения любимой прозы между сетами. Камерный вечер на 50 гостей.', photo: ph('jazz,club', 421), tickets: [std(700, 50), table(4500)] },
  { id: 'e19', title: 'Чернозём: акустика', venue: 'platonov-bar', artists: ['chernozem'], genres: ['indie', 'live'], date: day(13), time: '21:00', description: 'Акустический сет без барабанов и усилителей - песни в новых аранжировках.', photo: ph('acoustic,guitar', 422), tickets: [std(900, 60)] },
  { id: 'e20', title: 'Пятничный рок', venue: 'lipetsk-tube', artists: ['chernozem'], genres: ['rock', 'live'], date: day(8), time: '21:00', description: 'Воронежский инди-рок в гостях у Трубы: полный электрический сет.', photo: ph('rock,guitar', 423), tickets: [std(800, 150), table(4000)] },
  { id: 'e21', title: 'DJ Steel: Сталь', venue: 'lipetsk-sky', artists: ['dj-steel'], genres: ['electronic'], date: day(7), time: '22:00', description: 'Презентация альбома «Сталь»: индустриальное техно на закате и диско до утра.', photo: ph('dj,lights', 424), tickets: [std(1200), vip(3500), table(12000, 5)] },
  { id: 'e22', title: 'Disco на крыше', venue: 'lipetsk-sky', artists: ['dj-steel'], genres: ['electronic', 'pop'], date: day(14), time: '20:00', description: 'Ню-диско и поп-хиты с видом на Нижний парк.', photo: ph('disco,party', 425), tickets: [std(1000), table(10000, 5)] },
  // Прошедшие события - для истории и профилей групп
  { id: 'p1', title: 'Orange Sunset - летний open-air', venue: 'garage-hall', artists: ['orange-sunset'], genres: ['indie'], date: day(-21), time: '19:00', description: 'Летний концерт во дворе площадки.', photo: ph('openair', 417), tickets: [std(1800, 0)] },
  { id: 'p2', title: 'Blue Note Trio: Monk Tribute', venue: 'red-velvet', artists: ['blue-note-trio'], genres: ['jazz'], date: day(-12), time: '21:00', description: 'Вечер музыки Телониуса Монка.', photo: ph('jazz,club', 418), tickets: [std(800, 0)] },
  { id: 'p3', title: 'KINETIC b2b Residents', venue: 'bass-cave', artists: ['kinetic'], genres: ['electronic'], date: day(-8), time: '23:00', description: 'Ночь резидентов.', photo: ph('dj,crowd', 419), tickets: [std(1000, 0)] },
  ...moscowFiller(),
]

// Демо: плотная московская афиша (8–14 событий в день на 3 недели), чтобы проверить большие списки
function moscowFiller(): EventItem[] {
  const venues = ['red-velvet', 'garage-hall', 'neon-lounge', 'dubliner', 'philharmonia-bar']
  const shows: [string, EventItem['genres']][] = [
    ['Open Mic', ['live']], ['Jazz Jam', ['jazz', 'live']], ['Rock Covers', ['rock']], ['Deep House Night', ['electronic']],
    ['Pop Hits Party', ['pop']], ['Indie Showcase', ['indie']], ['Hip-Hop Cypher', ['hiphop']], ['Blues Evening', ['blues']],
    ['Струнный квартет', ['classical']], ['Акустический вечер', ['live', 'indie']], ['Soul & Funk', ['jazz', 'pop']], ['Techno Rave', ['electronic']],
    ['Панк-рок марафон', ['rock']], ['Lo-Fi Session', ['electronic', 'indie']], ['Караоке-вечеринка', ['pop', 'live']], ['Свинг-танцы', ['jazz']],
  ]
  const times = ['18:00', '19:00', '19:30', '20:00', '20:30', '21:00', '22:00', '23:00']
  const list: EventItem[] = []
  for (let d = 0; d < 21; d++) {
    const count = 8 + ((d * 5) % 7)
    for (let i = 0; i < count; i++) {
      const n = d * 16 + i
      const [title, genres] = shows[(d * 3 + i) % shows.length]!
      list.push({
        id: `m${n}`,
        title,
        venue: venues[(d + i) % venues.length]!,
        artists: [],
        genres,
        date: day(d),
        time: times[(i * 3 + d) % times.length]!,
        description: 'Демо-событие для проверки длинной афиши.',
        photo: ph(`${genres[0]},concert`, 500 + n),
        tickets: [std(500 + ((n * 300) % 2500))],
      })
    }
  }
  return list
}

export const getEvent = (id: string) => events.find(e => e.id === id)
