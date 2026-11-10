// The tours the seed script puts in the database: Black Sea highlands (Rize / Trabzon), in English and Turkish.
// Prices are DEMO prices in whole Turkish lira.
//
// priceUnit:
//   'person'  → price × travelers (group tours)
//   'vehicle' → one price for the whole group, up to maxGuests (private tours and transfers)
//
// Photos: Wikimedia Commons, served from client/public/images. Open licences need the author credited,
// so each tour keeps its credit and the /credits page lists them.

const commons = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replaceAll(' ', '_'))}`
const CC0 = ['CC0', 'https://creativecommons.org/publicdomain/zero/1.0/']
const BY_SA_3 = ['CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/']
const BY_SA_4 = ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/']
const BY_3 = ['CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/']

function photo(path, author, [license, licenseUrl], file) {
  return { imageUrl: path, imageAuthor: author, imageLicense: license, imageLicenseUrl: licenseUrl, imageSourceUrl: commons(file) }
}

export const toursData = [
  // ---------------------------------------------------------------- Day tours
  {
    slug: 'ayder-gelin-tulu-day-tour',
    category: 'day',
    price: 1850,
    priceUnit: 'person',
    maxGuests: 14,
    ...photo('/images/ayder-gelin-tulu.jpg', 'Necim', BY_SA_3, 'Ayder yaylası-Rize - panoramio.jpg'),
    en: {
      name: 'Ayder Plateau & Gelin Tülü Waterfall',
      summary: 'Wooden chalets, forest waterfalls and the hot springs of Ayder in one easy day.',
      duration: 'Full day · about 8 hours',
      description:
        'We drive up the Fırtına valley to Ayder, the best-known plateau of the Kaçkar foothills. You walk to the Gelin Tülü ("bridal veil") waterfall, explore the village of wooden chalets, and have time for a dip in the thermal baths before lunch with local dishes like muhlama and fresh trout.',
      highlights: ['Gelin Tülü waterfall walk', 'Ayder village and its wooden chalets', 'Optional thermal bath', 'Stops at the stone bridges of Çamlıhemşin'],
      included: ['Hotel pick-up in Çamlıhemşin or Ayder', 'Air-conditioned minibus', 'Local guide (TR / EN)', 'Bottled water'],
      imageAlt: 'A green valley with forest and a waterfall near Ayder',
    },
    tr: {
      name: 'Ayder Yaylası & Gelin Tülü Şelalesi',
      summary: 'Ahşap yayla evleri, orman içi şelaleler ve Ayder kaplıcaları tek günde.',
      duration: 'Tam gün · yaklaşık 8 saat',
      description:
        "Fırtına Vadisi boyunca Kaçkarların en bilinen yaylası Ayder'e çıkıyoruz. Gelin Tülü Şelalesi'ne yürüyor, ahşap evleriyle ünlü yaylayı geziyor ve öğle yemeğinden önce kaplıcada dinlenmeye vakit ayırıyoruz. Öğle yemeğinde muhlama ve taze alabalık gibi yöresel lezzetler sizi bekliyor.",
      highlights: ['Gelin Tülü Şelalesi yürüyüşü', 'Ayder ve ahşap yayla evleri', 'İsteğe bağlı kaplıca', 'Çamlıhemşin taş köprülerinde mola'],
      included: ['Çamlıhemşin veya Ayder otelinizden alış', 'Klimalı minibüs', 'Yerel rehber (TR / EN)', 'Su'],
      imageAlt: "Ayder yakınlarında ormanlık yeşil bir vadi ve şelale",
    },
  },
  {
    slug: 'pokut-sal-sunset-tour',
    category: 'day',
    price: 2400,
    priceUnit: 'person',
    maxGuests: 12,
    ...photo('/images/pokut-sal-sunset.jpg', 'Cems77', BY_SA_4, 'Home in the skies - Pokut Yaylasi.jpg'),
    en: {
      name: 'Pokut & Sal Plateaus Sunset Tour',
      summary: 'Two of the most photographed plateaus of the Kaçkars, with the sunset above the clouds.',
      duration: 'Afternoon to evening · about 7 hours',
      description:
        'A 4x4 climb takes us to Pokut, a village of stone and wooden houses on a balcony above the Black Sea forests. After a short walk to Sal plateau, we wait for the golden hour when the sea of clouds below turns orange and pink. Warm tea and a village dinner end the day.',
      highlights: ['Pokut plateau viewpoints', 'Easy walk between Pokut and Sal', 'Sunset over the sea of clouds', 'Village dinner on the plateau'],
      included: ['4x4 vehicle for the plateau road', 'Local guide (TR / EN)', 'Village dinner and tea'],
      imageAlt: 'Wooden houses of Pokut plateau with mountains and clouds behind',
    },
    tr: {
      name: 'Pokut & Sal Yaylaları Gün Batımı Turu',
      summary: "Kaçkarların en çok fotoğraflanan iki yaylası ve bulutların üstünde gün batımı.",
      duration: 'Öğleden sonra – akşam · yaklaşık 7 saat',
      description:
        "4x4 araçlarla, Karadeniz ormanlarının üstünde bir balkon gibi duran Pokut Yaylası'na çıkıyoruz. Sal Yaylası'na kısa bir yürüyüşün ardından, aşağıdaki bulut denizinin turuncu ve pembeye döndüğü altın saati bekliyoruz. Gün, sıcak çay ve yayla akşam yemeğiyle bitiyor.",
      highlights: ['Pokut Yaylası seyir noktaları', 'Pokut – Sal arası kolay yürüyüş', 'Bulut denizi üstünde gün batımı', 'Yaylada akşam yemeği'],
      included: ['Yayla yolu için 4x4 araç', 'Yerel rehber (TR / EN)', 'Akşam yemeği ve çay'],
      imageAlt: 'Arkasında dağlar ve bulutlar olan Pokut Yaylası ahşap evleri',
    },
  },
  {
    slug: 'zilkale-firtina-valley-tour',
    category: 'day',
    price: 1650,
    priceUnit: 'person',
    maxGuests: 14,
    ...photo('/images/zilkale-firtina.jpg', 'Hamdigumus', CC0, 'Zilkale, Çamlıhemşin,Rize 2014-3.jpg'),
    en: {
      name: 'Zilkale Castle & Fırtına Valley',
      summary: 'A medieval castle on a forest ridge and the old stone bridges of the Fırtına river.',
      duration: 'Full day · about 7 hours',
      description:
        "We follow the Fırtına river past its arched stone bridges to Zilkale, a castle that has watched over the valley for centuries. On the way back there is time for a riverside lunch and, in summer, an optional rafting run on the Fırtına's rapids.",
      highlights: ['Zilkale castle', 'Historic stone bridges', 'Riverside lunch', 'Optional rafting (June – September)'],
      included: ['Hotel pick-up', 'Air-conditioned minibus', 'Local guide (TR / EN)'],
      imageAlt: 'The stone walls of Zilkale castle on a rocky slope',
    },
    tr: {
      name: 'Zilkale & Fırtına Vadisi Turu',
      summary: 'Orman sırtında bir Orta Çağ kalesi ve Fırtına Deresi üzerindeki taş köprüler.',
      duration: 'Tam gün · yaklaşık 7 saat',
      description:
        "Kemerli taş köprülerin yanından Fırtına Deresi'ni takip ederek yüzyıllardır vadiyi gözetleyen Zilkale'ye ulaşıyoruz. Dönüşte dere kenarında öğle yemeği ve yaz aylarında Fırtına'nın akıntılarında isteğe bağlı rafting için vakit var.",
      highlights: ['Zilkale', 'Tarihi taş köprüler', 'Dere kenarında öğle yemeği', 'İsteğe bağlı rafting (Haziran – Eylül)'],
      included: ['Otelden alış', 'Klimalı minibüs', 'Yerel rehber (TR / EN)'],
      imageAlt: 'Kayalık bir yamaçta Zilkale’nin taş surları',
    },
  },
  {
    slug: 'uzungol-day-trip',
    category: 'day',
    price: 2100,
    priceUnit: 'person',
    maxGuests: 14,
    ...photo('/images/uzungol.jpg', 'İhsan Deniz Kılıçoğlu', BY_SA_3, 'Uzungöl lake and town.jpg'),
    en: {
      name: 'Uzungöl Lake & Rize Tea Gardens',
      summary: "The Black Sea's famous mountain lake, with a stop in the tea gardens on the way.",
      duration: 'Full day · about 9 hours',
      description:
        "Uzungöl is a long lake between steep forested slopes, with a mosque and wooden houses on its shore. We stop in Rize's terraced tea gardens to learn how Turkish tea is grown, then you have free time to walk around the lake or ride up to the viewpoints.",
      highlights: ['Walk around Uzungöl lake', 'Tea garden visit and tasting', 'Viewpoints above the lake', 'Free time for lunch'],
      included: ['Hotel pick-up', 'Air-conditioned minibus', 'Tea tasting', 'Local guide (TR / EN)'],
      imageAlt: 'Uzungöl lake and town seen from the mountainside',
    },
    tr: {
      name: 'Uzungöl & Rize Çay Bahçeleri',
      summary: "Karadeniz'in ünlü dağ gölü ve yol üstünde çay bahçeleri molası.",
      duration: 'Tam gün · yaklaşık 9 saat',
      description:
        "Uzungöl, sarp ve ormanlık yamaçlar arasında uzanan, kıyısında camisi ve ahşap evleri olan bir göl. Yolda Rize'nin teraslı çay bahçelerinde durup çayın nasıl yetiştiğini öğreniyoruz; ardından gölün çevresinde yürümek ya da seyir noktalarına çıkmak için serbest zaman var.",
      highlights: ['Uzungöl çevresinde yürüyüş', 'Çay bahçesi ziyareti ve tadım', 'Gölün üstündeki seyir noktaları', 'Öğle yemeği için serbest zaman'],
      included: ['Otelden alış', 'Klimalı minibüs', 'Çay tadımı', 'Yerel rehber (TR / EN)'],
      imageAlt: 'Dağ yamacından görünen Uzungöl ve kasabası',
    },
  },

  // ---------------------------------------------------------------- Hiking & trekking
  {
    slug: 'sea-of-clouds-hike',
    category: 'hiking',
    price: 2300,
    priceUnit: 'person',
    maxGuests: 10,
    ...photo('/images/sea-of-clouds-hike.jpg', 'Rhosgor', BY_SA_4, 'Kaçkarlar,Pokut Yaylası.jpg'),
    en: {
      name: 'Sea of Clouds Hike',
      summary: 'Climb above the clouds on old shepherd paths, with the Kaçkar peaks in view.',
      duration: 'Full day · 5–6 hours of walking',
      description:
        'On summer mornings the valleys fill with cloud and the high plateaus stay in the sun. This guided hike follows shepherd paths between plateau villages to a ridge where you look down on that white sea. Moderate fitness is enough; we walk at the pace of the group.',
      highlights: ['Views over the sea of clouds', 'Shepherd paths between plateau villages', 'Picnic lunch on the ridge', 'Small group, walked at your pace'],
      included: ['Transport to the trailhead', 'Mountain guide (TR / EN)', 'Picnic lunch', 'Walking poles on request'],
      imageAlt: 'Plateau houses on a green ridge above a sea of clouds',
    },
    tr: {
      name: 'Bulut Denizi Yürüyüşü',
      summary: 'Eski çoban patikalarından bulutların üstüne, Kaçkar zirveleri karşınızda.',
      duration: 'Tam gün · 5–6 saat yürüyüş',
      description:
        'Yaz sabahları vadiler bulutla dolar, yüksek yaylalar ise güneşte kalır. Bu rehberli yürüyüş, yayla köyleri arasındaki çoban patikalarını izleyerek o beyaz denizi yukarıdan seyredeceğiniz bir sırta çıkıyor. Orta düzey kondisyon yeterli; grubun temposunda yürüyoruz.',
      highlights: ['Bulut denizi manzarası', 'Yayla köyleri arasında çoban patikaları', 'Sırtta piknik öğle yemeği', 'Küçük grup, sizin temponuzda'],
      included: ['Parkur başlangıcına ulaşım', 'Dağ rehberi (TR / EN)', 'Piknik öğle yemeği', 'İstenirse yürüyüş batonu'],
      imageAlt: 'Bulut denizinin üstünde yeşil bir sırtta yayla evleri',
    },
  },
  {
    slug: 'pokut-overnight-camp',
    category: 'hiking',
    price: 4900,
    priceUnit: 'person',
    maxGuests: 8,
    ...photo('/images/pokut-camp.jpg', 'Engin Tavlı', BY_SA_4, 'Pokut Yaylası 3.jpg'),
    en: {
      name: 'Plateau Camp Under the Stars',
      summary: 'Hike up in the afternoon, camp on the plateau and wake up above the clouds.',
      duration: '2 days · 1 night in tents',
      description:
        "Far from the lights of the coast, the night sky over the plateaus is full of stars. We hike up in the afternoon, set up camp, cook dinner together and watch the stars. At sunrise the valleys below are often covered in cloud. We supply all the camping gear; you bring warm clothes.",
      highlights: ['Night under a dark, starry sky', 'Sunrise above the clouds', 'Campfire dinner', 'All camping gear supplied'],
      included: ['Tents, mats and sleeping bags', 'Dinner, breakfast and snacks', 'Mountain guide (TR / EN)', 'Transport to the trailhead'],
      imageAlt: 'Two lit tents on a plateau under a starry night sky',
    },
    tr: {
      name: 'Yıldızların Altında Yayla Kampı',
      summary: 'Öğleden sonra yürüyerek çıkın, yaylada kamp yapın, bulutların üstünde uyanın.',
      duration: '2 gün · çadırda 1 gece',
      description:
        'Sahilin ışıklarından uzakta, yaylaların gecesi yıldızlarla dolu. Öğleden sonra yürüyerek çıkıyor, kampı kuruyor, akşam yemeğini birlikte pişirip yıldızları izliyoruz. Gün doğumunda aşağıdaki vadiler çoğu zaman bulutla kaplı oluyor. Tüm kamp malzemesini biz sağlıyoruz; siz sadece sıcak giysilerinizi getirin.',
      highlights: ['Karanlık ve yıldızlı bir gece', 'Bulutların üstünde gün doğumu', 'Kamp ateşinde akşam yemeği', 'Tüm kamp malzemesi dahil'],
      included: ['Çadır, mat ve uyku tulumu', 'Akşam yemeği, kahvaltı ve atıştırmalıklar', 'Dağ rehberi (TR / EN)', 'Parkur başlangıcına ulaşım'],
      imageAlt: 'Yıldızlı gökyüzü altında yaylada ışıklı iki çadır',
    },
  },
  {
    slug: 'kackar-summit-trek',
    category: 'hiking',
    price: 19500,
    priceUnit: 'person',
    maxGuests: 8,
    ...photo('/images/kackar-trek.jpg', 'A. Erdem Şentürk', BY_SA_4, 'Kaçkar Dağı.jpg'),
    en: {
      name: 'Kaçkar Summit Trek',
      summary: 'Four days through glacial valleys and lakes to the 3,937 m summit of the Kaçkars.',
      duration: '4 days · 3 nights (2 in tents, 1 in a guesthouse)',
      description:
        'A classic trek for fit walkers. From the plateaus above Ayder we follow glacial valleys past mountain lakes to base camp, and on day three we climb to the summit of Kaçkar Dağı, the highest peak of the Black Sea range. Our mountain guides set the pace, and a support team carries the camping gear.',
      highlights: ['Summit of Kaçkar Dağı (3,937 m)', 'Glacial lakes and high meadows', 'Nights at base camp', 'Support team carries the gear'],
      included: ['Licensed mountain guide', 'All meals on the trek', 'Tents and camping gear', 'Guesthouse night in Ayder', 'Transfers to and from the trailhead'],
      imageAlt: 'The rocky summit of Kaçkar mountain under a blue sky',
    },
    tr: {
      name: 'Kaçkar Zirve Trekkingi',
      summary: "Buzul vadileri ve göller boyunca, dört günde Kaçkarların 3.937 m'lik zirvesine.",
      duration: '4 gün · 3 gece (2 çadır, 1 pansiyon)',
      description:
        "Kondisyonu iyi yürüyüşçüler için klasik bir rota. Ayder'in üstündeki yaylalardan buzul vadilerini ve dağ göllerini izleyerek ana kampa ulaşıyor, üçüncü gün Karadeniz sıradağlarının en yüksek noktası Kaçkar Dağı'na tırmanıyoruz. Tempoyu dağ rehberlerimiz belirliyor, kamp malzemesini destek ekibi taşıyor.",
      highlights: ['Kaçkar Dağı zirvesi (3.937 m)', 'Buzul gölleri ve yüksek çayırlar', 'Ana kampta geceler', 'Malzemeyi destek ekibi taşır'],
      included: ['Lisanslı dağ rehberi', 'Trek boyunca tüm öğünler', 'Çadır ve kamp malzemesi', "Ayder'de bir gece pansiyon", 'Parkura gidiş-dönüş transfer'],
      imageAlt: 'Mavi gökyüzü altında Kaçkar Dağı’nın kayalık zirvesi',
    },
  },

  // ---------------------------------------------------------------- Private tours (price per vehicle)
  {
    slug: 'private-highlands-vip-day',
    category: 'private',
    price: 9500,
    priceUnit: 'vehicle',
    maxGuests: 8,
    ...photo('/images/private-highlands.jpg', 'BSRF', BY_SA_4, 'View from Zilkale 02.jpg'),
    en: {
      name: 'Private Highlands Day (VIP van)',
      summary: 'Your own driver-guide and VIP van for the day. You choose the plateaus and the pace.',
      duration: 'Full day · up to 10 hours',
      description:
        "Ideal for families and friends. Tell us what you'd like to see, such as Ayder, Pokut, Zilkale or the tea gardens, and we plan the route around you. The price is for the whole van (up to 8 guests), so it often costs less per person than a group tour.",
      highlights: ['Route planned around you', 'Comfortable VIP van with luggage space', 'Stops whenever you like', 'Child seats on request'],
      included: ['VIP van with driver-guide (TR / EN)', 'Fuel, tolls and parking', 'Hotel pick-up and drop-off', 'Water and snacks'],
      imageAlt: 'Forested valley of the Fırtına river seen from above',
    },
    tr: {
      name: 'Özel Yayla Turu (VIP Araç)',
      summary: 'Gün boyu size özel şoför-rehber ve VIP araç. Yaylaları ve temposu siz seçin.',
      duration: 'Tam gün · 10 saate kadar',
      description:
        "Aileler ve arkadaş grupları için ideal. Ayder, Pokut, Zilkale veya çay bahçeleri; görmek istediklerinizi söyleyin, rotayı size göre planlayalım. Fiyat tüm araç içindir (8 kişiye kadar), bu yüzden kişi başına çoğu zaman grup turundan daha uygun.",
      highlights: ['Size göre planlanan rota', 'Bagaj alanı geniş, konforlu VIP araç', 'İstediğiniz yerde mola', 'İstenirse çocuk koltuğu'],
      included: ['Şoför-rehberli VIP araç (TR / EN)', 'Yakıt, otoyol ve otopark', 'Otelden alış ve bırakış', 'Su ve atıştırmalık'],
      imageAlt: 'Yukarıdan görünen ormanlık Fırtına Vadisi',
    },
  },

  // ---------------------------------------------------------------- Transfers (price per vehicle)
  {
    slug: 'trabzon-airport-ayder-transfer',
    category: 'transfer',
    price: 5200,
    priceUnit: 'vehicle',
    maxGuests: 8,
    ...photo('/images/transfer-trabzon.jpg', 'BSRF', BY_SA_4, 'Ayder, August 2019 (1).jpg'),
    en: {
      name: 'Trabzon Airport → Ayder Transfer',
      summary: 'We meet you at arrivals and drive you straight to your hotel in Ayder.',
      duration: 'About 3 hours',
      description:
        'Your driver waits at Trabzon Airport arrivals with your name on a sign and follows your flight, so a delay costs you nothing. The drive along the coast and up the Fırtına valley takes about three hours, with a stop on the way if you like.',
      highlights: ['Meet & greet at arrivals', 'Flight tracking, free waiting time', 'Door-to-door to your hotel', 'Price is per van, not per person'],
      included: ['VIP van for up to 8 guests', 'Fuel, tolls and parking', 'Up to 60 minutes of waiting time'],
      imageAlt: 'Hotels and parked vans in Ayder village',
    },
    tr: {
      name: 'Trabzon Havalimanı → Ayder Transferi',
      summary: "Sizi gelen yolcu çıkışında karşılıyor, doğrudan Ayder'deki otelinize götürüyoruz.",
      duration: 'Yaklaşık 3 saat',
      description:
        "Şoförünüz Trabzon Havalimanı gelen yolcu çıkışında isminizin yazılı olduğu tabelayla bekler ve uçuşunuzu takip eder; rötar size ek ücret getirmez. Sahil yolu ve Fırtına Vadisi üzerinden yolculuk yaklaşık üç saat sürer, isterseniz yolda mola veririz.",
      highlights: ['Gelen yolcu çıkışında karşılama', 'Uçuş takibi, ücretsiz bekleme', 'Otelinize kapıdan kapıya', 'Fiyat kişi başı değil, araç başı'],
      included: ['8 kişiye kadar VIP araç', 'Yakıt, otoyol ve otopark', '60 dakikaya kadar bekleme'],
      imageAlt: "Ayder'de oteller ve park halindeki araçlar",
    },
  },
  {
    slug: 'rize-artvin-airport-ayder-transfer',
    category: 'transfer',
    price: 3400,
    priceUnit: 'vehicle',
    maxGuests: 8,
    ...photo('/images/transfer-rize-artvin.jpg', 'Sinan Şahin', BY_3, 'Kavrun Yolu... - panoramio.jpg'),
    en: {
      name: 'Rize–Artvin Airport → Ayder Transfer',
      summary: 'The closest airport to Ayder: about 90 minutes to your hotel in a private van.',
      duration: 'About 1.5 hours',
      description:
        'Rize–Artvin Airport is the quickest way into the Kaçkar foothills. Your driver meets you at arrivals and takes you straight up the valley to your hotel in Ayder or Çamlıhemşin.',
      highlights: ['Meet & greet at arrivals', 'Flight tracking, free waiting time', 'Door-to-door to your hotel', 'Price is per van, not per person'],
      included: ['VIP van for up to 8 guests', 'Fuel, tolls and parking', 'Up to 60 minutes of waiting time'],
      imageAlt: 'A mountain road through green meadows towards a plateau',
    },
    tr: {
      name: 'Rize–Artvin Havalimanı → Ayder Transferi',
      summary: "Ayder'e en yakın havalimanı: özel araçla otelinize yaklaşık 90 dakika.",
      duration: 'Yaklaşık 1,5 saat',
      description:
        "Rize–Artvin Havalimanı, Kaçkarlara ulaşmanın en hızlı yolu. Şoförünüz sizi gelen yolcu çıkışında karşılar ve vadiden doğrudan Ayder veya Çamlıhemşin'deki otelinize götürür.",
      highlights: ['Gelen yolcu çıkışında karşılama', 'Uçuş takibi, ücretsiz bekleme', 'Otelinize kapıdan kapıya', 'Fiyat kişi başı değil, araç başı'],
      included: ['8 kişiye kadar VIP araç', 'Yakıt, otoyol ve otopark', '60 dakikaya kadar bekleme'],
      imageAlt: 'Yeşil çayırlar arasından yaylaya uzanan dağ yolu',
    },
  },
]
