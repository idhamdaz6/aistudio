import { VoiceOption, MoodOption, ScriptSample } from '../types/tts';

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'pria',
    description: 'Suara pemuda ramah, energik, dan bersahabat.',
    avatar: '👨‍🦱',
    badge: 'Populer',
    recommendedFor: 'Vlog, Konten Media Sosial, Percakapan Santai',
    samplePhrase: 'Halo teman-teman! Selamat datang kembali di video terbaru saya.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'pria',
    description: 'Suara pria berwibawa, dalam, tegas, dan berkarisma.',
    avatar: '🧔',
    badge: 'Berwibawa',
    recommendedFor: 'Berita Formal, Narasi Dokumenter, Pengumuman Resmi',
    samplePhrase: 'Selamat malam pemirsa, inilah rangkuman informasi utama hari ini.',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'pria',
    description: 'Suara pria tenang, matang, hangat, dan menenangkan.',
    avatar: '👨‍💼',
    badge: 'Menenangkan',
    recommendedFor: 'Buku Audio, Meditasi, Podcast Filosofis',
    samplePhrase: 'Tarik napas perlahan, dan biarkan pikiran Anda menemukan kedamaian.',
  },
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'wanita',
    description: 'Suara wanita anggun, jernih, profesional, dan ekspresif.',
    avatar: '👩‍💼',
    badge: 'Paling Natural',
    recommendedFor: 'Customer Service, Berita, Presentasi Bisnis, Narasi Edukasi',
    samplePhrase: 'Selamat datang di layanan bantuan resmi. Ada yang bisa kami bantu?',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'wanita',
    description: 'Suara wanita ceria, ramah, lembut, dan penuh senyuman.',
    avatar: '👩‍🦰',
    badge: 'Ceria',
    recommendedFor: 'Dongeng Anak, Promosi Iklan, Tutorial Kreatif',
    samplePhrase: 'Hai adik-adik pintar! Hari ini kita akan menjelajahi petualangan baru yang seru.',
  },
];

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'ceria',
    label: 'Ceria & Ramah',
    emoji: '😊',
    shortDesc: 'Hangat, penuh senyum, dan bersahabat',
    instructionPrompt:
      'Bicaralah dengan intonasi sangat ceria, bersahabat, tersenyum hangat, dan ramah dalam bahasa Indonesia yang alami dan ekspresif.',
    category: 'Populer',
  },
  {
    id: 'formal',
    label: 'Formal & Berita',
    emoji: '📰',
    shortDesc: 'Lugas, jelas, kredibel, dan berwibawa',
    instructionPrompt:
      'Gunakan intonasi resmi, lugas, tenang, jelas, dan berwibawa seperti presenter berita profesional dalam bahasa Indonesia baku.',
    category: 'Profesional',
  },
  {
    id: 'santai',
    label: 'Santai & Mengobrol',
    emoji: '☕',
    shortDesc: 'Luwes dan mengalir seperti teman akrab',
    instructionPrompt:
      'Gunakan nada santai, luwes, dan mengalir seperti teman akrab sedang mengobrol dalam bahasa Indonesia sehari-hari yang luwes.',
    category: 'Populer',
  },
  {
    id: 'semangat',
    label: 'Bersemangat & Motivasi',
    emoji: '🔥',
    shortDesc: 'Energik, membakar inspirasi, dan percaya diri',
    instructionPrompt:
      'Bicaralah dengan intonasi penuh energi, membakar motivasi, tegas, berapi-api, dan sangat menginspirasi para pendengar.',
    category: 'Ekspresif',
  },
  {
    id: 'tenang',
    label: 'Tenang & Meditatif',
    emoji: '🍃',
    shortDesc: 'Lembut, damai, dan merelaksasi pikiran',
    instructionPrompt:
      'Gunakan intonasi sangat lembut, ritme perlahan, menenangkan, rileks, dan membawa rasa damai serta ketenangan batin.',
    category: 'Profesional',
  },
  {
    id: 'dongeng',
    label: 'Mendongeng & Naratif',
    emoji: '📖',
    shortDesc: 'Penuh penghayatan tokoh dan imajinasi',
    instructionPrompt:
      'Bawakan narasi dengan gaya pendongeng sejati: kaya intonasi dramatis, menghidupkan suasana cerita, dan memikat daya imajinasi.',
    category: 'Ekspresif',
  },
  {
    id: 'misterius',
    label: 'Misterius & Dramatis',
    emoji: '🕵️',
    shortDesc: 'Menegangkan, berbisik, dan penuh teka-teki',
    instructionPrompt:
      'Bicaralah dengan nada misterius, penuh ketegangan, sedikit berbisik, dramatis, dan menyisakan rasa penasaran mendalam.',
    category: 'Ekspresif',
  },
  {
    id: 'iklan',
    label: 'Iklan & Promosi',
    emoji: '📢',
    shortDesc: 'Persuasif, antusias, dan menjual',
    instructionPrompt:
      'Gunakan nada promosi komersial yang persuasif, antusias, penuh daya pikat, meyakinkan, dan bersemangat menjual.',
    category: 'Profesional',
  },
  {
    id: 'sedih',
    label: 'Emosional & Sendu',
    emoji: '🥺',
    shortDesc: 'Menyentuh perasaan, haru, dan melankolis',
    instructionPrompt:
      'Gunakan intonasi sendu, emosional, lembut bergetar, dan menyentuh lubuk hati terdalam dengan penuh empati.',
    category: 'Ekspresif',
  },
  {
    id: 'custom',
    label: 'Kustom Prompt',
    emoji: '✨',
    shortDesc: 'Tuliskan gaya dan emosi suara Anda sendiri',
    instructionPrompt: '',
    category: 'Ekspresif',
  },
];

export const SAMPLE_SCRIPTS: ScriptSample[] = [
  {
    id: 'sample-berita',
    title: 'Berita Terkini Nusantara',
    category: 'Berita',
    badge: 'Formal',
    suggestedVoice: 'Fenrir',
    suggestedMood: 'formal',
    text: 'Selamat malam pemirsa. Kami perbarui informasi Anda dengan kabar terbaru dari ibu kota. Hari ini, perhelatan pameran inovasi digital nasional resmi dibuka di Jakarta, menampilkan ratusan karya teknologi karya anak bangsa yang siap bersaing di kancah global.',
  },
  {
    id: 'sample-iklan',
    title: 'Iklan Kopi Nusantara',
    category: 'Iklan',
    badge: 'Promosi',
    suggestedVoice: 'Zephyr',
    suggestedMood: 'iklan',
    text: 'Ingin memulai hari dengan kesegaran maksimal? Nikmati seduhan Kopi Arabika Gayo pilihan! Dipetik dari lereng pegunungan terbaik dengan aroma rempah khas yang memanjakan setiap tegukan. Pesan sekarang dan rasakan kehangatannya!',
  },
  {
    id: 'sample-dongeng',
    title: 'Kisah Kancil & Sahabat Hutan',
    category: 'Dongeng',
    badge: 'Cerita',
    suggestedVoice: 'Zephyr',
    suggestedMood: 'dongeng',
    text: 'Alkisah, di sebuah hutan tropis yang rindang di tanah Sumatra, hiduplah Sang Kancil yang cerdik. Pagi itu, embun berkilau di ujung dedaunan saat ia melangkah riang menuju tepi sungai, menyapa burung-burung kenari yang bernyanyi merdu.',
  },
  {
    id: 'sample-motivasi',
    title: 'Inspirasi Fajar Sukses',
    category: 'Motivasi',
    badge: 'Semangat',
    suggestedVoice: 'Puck',
    suggestedMood: 'semangat',
    text: 'Ingatlah, perjalanan seribu mil selalu dimulai dari satu langkah berani. Jangan biarkan keraguan hari kemarin menghentikan potensi besarmu hari ini. Bangkit, melangkah maju, dan buktikan bahwa impianmu layak untuk diperjuangkan!',
  },
  {
    id: 'sample-pengumuman',
    title: 'Pengumuman Penerbangan Bandara',
    category: 'Pengumuman',
    badge: 'Jelas',
    suggestedVoice: 'Kore',
    suggestedMood: 'formal',
    text: 'Pemberitahuan kepada seluruh penumpang Garuda Indonesia nomor penerbangan GA empat ratus dua tujuan Denpasar Bali. Dimohon segera memasuki pintu keberangkatan lima melalui gerbang B. Pastikan boarding pass dan kartu identitas Anda telah siap.',
  },
  {
    id: 'sample-meditasi',
    title: 'Relaksasi Napas Malam',
    category: 'Relaksasi',
    badge: 'Tenang',
    suggestedVoice: 'Charon',
    suggestedMood: 'tenang',
    text: 'Duduklah dengan nyaman. Pejamkan kedua mata Anda secara perlahan. Tarik napas dalam melalui hidung, tahan sejenak, lalu hembuskan perlahan melalui mulut. Rasakan setiap ketegangan di pundak Anda mulai meluruh dan damai.',
  },
];
