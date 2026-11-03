// GENERATED from the content the site launched with (jogja-transport.com, Oct 2026).
// It seeds Supabase (scripts/generate-seed.ts) and is what the site shows until Supabase is connected.
// After that, edit content in the admin panel, not here.
//
// Still PLACEHOLDERS to confirm with the client: per-km transfer rates, the three sample reviews,
// the Ijen price (read as Rp 3,500,000), and whether the Bali/Karimunjawa price includes the ferry.
import type { SiteContent } from "./schema";

export const defaultContent: SiteContent = {
  "settings": {
    "businessName": "Jogja Transport",
    "siteUrl": "https://www.jogja-transport.com",
    "whatsappNumber": "628112653767",
    "phoneDisplay": "+62 811 2653 767",
    "email": "yarkasi@jogja-transport.com",
    "address": "Jalan Beran – Balong, Pandowoharjo, Sleman, Daerah Istimewa Yogyakarta 55511",
    "googleRating": "4.9",
    "googleReviewsUrl": "https://g.page/r/Cf6sDmgLoZBYEBM/review",
    "instagramUrl": "https://www.instagram.com/jogjatransportwisata",
    "idrPerUsd": 16500
  },
  "tours": [
    {
      "slug": "borobudur-prambanan",
      "code": "A",
      "length": "day-trip",
      "interests": [
        "temples"
      ],
      "priceFromIdr": 550000,
      "photo": "/photos/borobudur.jpg",
      "photoCredit": {
        "subject": "Borobudur",
        "author": "Justine Hong",
        "license": "CC BY 2.0",
        "source": "https://commons.wikimedia.org/wiki/File:Borobudur_Sunrise_2012-01-05.jpg"
      },
      "text": {
        "en": {
          "name": "Borobudur & Prambanan",
          "summary": "Java's two great temples in one day: the Buddhist stupas of Borobudur and the Hindu towers of Prambanan.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Borobudur temple",
            "Prambanan temple"
          ],
          "photoAlt": "Stone stupas on the top terrace of Borobudur at sunrise, with mist over the forest below"
        },
        "id": {
          "name": "Borobudur & Prambanan",
          "summary": "Dua candi terbesar di Jawa dalam sehari: stupa Buddha di Candi Borobudur dan menara Hindu di Candi Prambanan.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Candi Borobudur",
            "Candi Prambanan"
          ],
          "photoAlt": "Stupa batu di teras atas Borobudur saat matahari terbit, dengan kabut di atas hutan di bawahnya"
        },
        "fr": {
          "name": "Borobudur & Prambanan",
          "summary": "Les deux grands temples de Java en une journée : les stupas bouddhistes de Borobudur et les tours hindoues de Prambanan.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Temple de Borobudur",
            "Temple de Prambanan"
          ],
          "photoAlt": "Stupas de pierre sur la terrasse supérieure de Borobudur au lever du soleil, avec la brume sur la forêt en contrebas"
        }
      },
      "published": true
    },
    {
      "slug": "borobudur-heritage",
      "code": "B",
      "length": "day-trip",
      "interests": [
        "temples",
        "culture"
      ],
      "priceFromIdr": 550000,
      "photo": "/photos/kraton.jpg",
      "photoCredit": {
        "subject": "Kraton",
        "author": "Jorge Franganillo",
        "license": "CC BY 2.0",
        "source": "https://commons.wikimedia.org/wiki/File:Kraton_Ngayogyakarta_Hadiningrat_(49797461187).jpg"
      },
      "text": {
        "en": {
          "name": "Borobudur & Yogyakarta Heritage",
          "summary": "Borobudur in the morning, then back to the city for the Sultan's palace and the old royal water garden.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Borobudur temple",
            "Kraton Yogyakarta, the Sultan's palace",
            "Taman Sari water castle"
          ],
          "photoAlt": "An open pavilion with carved, painted pillars inside the Kraton of Yogyakarta"
        },
        "id": {
          "name": "Borobudur & Wisata Sejarah Yogyakarta",
          "summary": "Candi Borobudur di pagi hari, lalu kembali ke kota untuk mengunjungi keraton Sultan dan taman air kerajaan.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Candi Borobudur",
            "Kraton Yogyakarta, istana Sultan",
            "Taman Sari"
          ],
          "photoAlt": "Pendapa terbuka dengan tiang-tiang berukir dan berwarna di dalam Kraton Yogyakarta"
        },
        "fr": {
          "name": "Borobudur & patrimoine de Yogyakarta",
          "summary": "Borobudur le matin, puis retour en ville pour le palais du Sultan et l'ancien jardin d'eau royal.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Temple de Borobudur",
            "Kraton de Yogyakarta, le palais du Sultan",
            "Château d'eau de Taman Sari"
          ],
          "photoAlt": "Un pavillon ouvert aux piliers sculptés et peints dans le Kraton de Yogyakarta"
        }
      },
      "published": true
    },
    {
      "slug": "jomblang-pindul",
      "code": "C",
      "length": "day-trip",
      "interests": [
        "adventure",
        "nature"
      ],
      "priceFromIdr": 500000,
      "photo": "/photos/jomblang.jpg",
      "photoCredit": {
        "subject": "Jomblang cave",
        "author": "Arie Basuki",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Cahaya_Goa_Jomblang.jpg"
      },
      "text": {
        "en": {
          "name": "Jomblang & Pindul Caves",
          "summary": "Down into Jomblang's collapsed cave where light falls from the forest above, then tubing through Pindul cave.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Jomblang cave",
            "Pindul cave"
          ],
          "photoAlt": "A beam of sunlight falling into Jomblang cave onto visitors in helmets"
        },
        "id": {
          "name": "Goa Jomblang & Goa Pindul",
          "summary": "Turun ke dalam Goa Jomblang tempat cahaya jatuh dari hutan di atasnya, lalu cave tubing menyusuri Goa Pindul.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Goa Jomblang",
            "Goa Pindul"
          ],
          "photoAlt": "Seberkas cahaya matahari masuk ke Goa Jomblang menyinari pengunjung berhelm"
        },
        "fr": {
          "name": "Grottes de Jomblang & Pindul",
          "summary": "Descente dans la grotte effondrée de Jomblang, où la lumière tombe de la forêt au-dessus, puis descente en bouée dans la grotte de Pindul.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Grotte de Jomblang",
            "Grotte de Pindul"
          ],
          "photoAlt": "Un rayon de soleil tombe dans la grotte de Jomblang sur des visiteurs casqués"
        }
      },
      "published": true
    },
    {
      "slug": "merapi-prambanan-ramayana",
      "code": "D",
      "length": "day-trip",
      "interests": [
        "temples",
        "culture",
        "adventure"
      ],
      "priceFromIdr": 750000,
      "photo": "/photos/prambanan.jpg",
      "photoCredit": {
        "subject": "Prambanan",
        "author": "CEphoto, Uwe Aranas",
        "license": "CC BY-SA 3.0",
        "source": "https://commons.wikimedia.org/wiki/File:Yogyakarta_Indonesia_Prambanan-temple-complex-23.jpg"
      },
      "text": {
        "en": {
          "name": "Merapi Lava Tour, Prambanan & Ramayana Ballet",
          "summary": "A jeep across Merapi's lava fields, Prambanan in the afternoon, and the Ramayana ballet in the evening.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Merapi lava tour",
            "Prambanan temple",
            "Ramayana ballet"
          ],
          "photoAlt": "The carved stone towers of Prambanan temple under a cloudy sky"
        },
        "id": {
          "name": "Lava Tour Merapi, Prambanan & Sendratari Ramayana",
          "summary": "Naik jip melintasi bekas aliran lahar Merapi, Candi Prambanan di sore hari, dan Sendratari Ramayana di malam hari.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Lava tour Merapi",
            "Candi Prambanan",
            "Sendratari Ramayana"
          ],
          "photoAlt": "Menara batu berukir Candi Prambanan di bawah langit berawan"
        },
        "fr": {
          "name": "Lava tour du Merapi, Prambanan & ballet du Ramayana",
          "summary": "Une jeep à travers les coulées de lave du Merapi, Prambanan l'après-midi et le ballet du Ramayana le soir.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Lava tour du Merapi",
            "Temple de Prambanan",
            "Ballet du Ramayana"
          ],
          "photoAlt": "Les tours de pierre sculptées du temple de Prambanan sous un ciel nuageux"
        }
      },
      "published": true
    },
    {
      "slug": "bromo-madakaripura",
      "code": "E",
      "length": "multi-day",
      "interests": [
        "nature",
        "adventure"
      ],
      "priceFromIdr": 2700000,
      "photo": "/photos/bromo.jpg",
      "photoCredit": {
        "subject": "Bromo",
        "author": "Thomas Hirsch",
        "license": "CC BY-SA 3.0",
        "source": "https://commons.wikimedia.org/wiki/File:Mount_Bromo_at_sunrise,_showing_its_volcanoes_and_Mount_Semeru_(background).jpg"
      },
      "text": {
        "en": {
          "name": "Bromo & Madakaripura",
          "summary": "Overnight to East Java for sunrise over Bromo's sea of sand, then the cliff-walled Madakaripura waterfall.",
          "duration": "2 days, 1 night",
          "destinations": [
            "Mount Bromo",
            "Madakaripura waterfall"
          ],
          "photoAlt": "Mount Bromo's smoking crater at sunrise, with Mount Semeru behind"
        },
        "id": {
          "name": "Bromo & Madakaripura",
          "summary": "Perjalanan malam ke Jawa Timur untuk sunrise di atas lautan pasir Bromo, lalu Air Terjun Madakaripura yang diapit tebing.",
          "duration": "2 hari 1 malam",
          "destinations": [
            "Gunung Bromo",
            "Air Terjun Madakaripura"
          ],
          "photoAlt": "Kawah Gunung Bromo yang berasap saat matahari terbit, dengan Gunung Semeru di belakangnya"
        },
        "fr": {
          "name": "Bromo & Madakaripura",
          "summary": "Une nuit de route vers Java oriental pour le lever du soleil sur la mer de sable du Bromo, puis la cascade de Madakaripura entre ses falaises.",
          "duration": "2 jours, 1 nuit",
          "destinations": [
            "Mont Bromo",
            "Cascade de Madakaripura"
          ],
          "photoAlt": "Le cratère fumant du mont Bromo au lever du soleil, avec le mont Semeru en arrière-plan"
        }
      },
      "published": true
    },
    {
      "slug": "tumpak-sewu",
      "code": "F",
      "length": "multi-day",
      "interests": [
        "nature"
      ],
      "priceFromIdr": null,
      "photo": "/photos/tumpak-sewu.jpg",
      "photoCredit": {
        "subject": "Tumpak Sewu",
        "author": "Muhyiddin",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Tumpak_sewu_waterfall.jpg"
      },
      "text": {
        "en": {
          "name": "Tumpak Sewu Waterfalls",
          "summary": "The curtain of falls at Tumpak Sewu under Mount Semeru, with Kabut Pelangi and Kapas Biru nearby.",
          "duration": "Multi-day, ask us",
          "destinations": [
            "Tumpak Sewu waterfall",
            "Kabut Pelangi waterfall",
            "Kapas Biru waterfall"
          ],
          "photoAlt": "Dozens of thin waterfalls pouring into a green canyon at Tumpak Sewu"
        },
        "id": {
          "name": "Air Terjun Tumpak Sewu",
          "summary": "Tirai air terjun Tumpak Sewu di kaki Gunung Semeru, dengan Kabut Pelangi dan Kapas Biru di dekatnya.",
          "duration": "Beberapa hari, hubungi kami",
          "destinations": [
            "Air Terjun Tumpak Sewu",
            "Air Terjun Kabut Pelangi",
            "Air Terjun Kapas Biru"
          ],
          "photoAlt": "Puluhan air terjun kecil mengalir ke ngarai hijau di Tumpak Sewu"
        },
        "fr": {
          "name": "Cascades de Tumpak Sewu",
          "summary": "Le rideau de chutes de Tumpak Sewu au pied du mont Semeru, avec Kabut Pelangi et Kapas Biru tout près.",
          "duration": "Plusieurs jours, nous consulter",
          "destinations": [
            "Cascade de Tumpak Sewu",
            "Cascade de Kabut Pelangi",
            "Cascade de Kapas Biru"
          ],
          "photoAlt": "Des dizaines de fines cascades se jetant dans un canyon verdoyant à Tumpak Sewu"
        }
      },
      "published": true
    },
    {
      "slug": "ijen-baluran",
      "code": "G",
      "length": "multi-day",
      "interests": [
        "nature",
        "adventure"
      ],
      "priceFromIdr": 3500000,
      "photo": "/photos/ijen.jpg",
      "photoCredit": {
        "subject": "Kawah Ijen",
        "author": "Sémhur",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Sulfur_mining_in_Kawah_Ijen_-_Indonesia_-_20110608.jpg"
      },
      "text": {
        "en": {
          "name": "Ijen & Baluran",
          "summary": "The turquoise crater lake of Kawah Ijen, then the savanna of Baluran national park at the eastern tip of Java.",
          "duration": "2 days, 1 night",
          "destinations": [
            "Kawah Ijen crater",
            "Baluran national park"
          ],
          "photoAlt": "Steam rising over the turquoise acid lake inside the Ijen crater"
        },
        "id": {
          "name": "Ijen & Baluran",
          "summary": "Danau kawah biru toska di Kawah Ijen, lalu sabana Taman Nasional Baluran di ujung timur Pulau Jawa.",
          "duration": "2 hari 1 malam",
          "destinations": [
            "Kawah Ijen",
            "Taman Nasional Baluran"
          ],
          "photoAlt": "Uap mengepul di atas danau asam biru toska di dalam Kawah Ijen"
        },
        "fr": {
          "name": "Ijen & Baluran",
          "summary": "Le lac de cratère turquoise du Kawah Ijen, puis la savane du parc national de Baluran, à la pointe est de Java.",
          "duration": "2 jours, 1 nuit",
          "destinations": [
            "Cratère du Kawah Ijen",
            "Parc national de Baluran"
          ],
          "photoAlt": "De la vapeur s'élève au-dessus du lac acide turquoise dans le cratère de l'Ijen"
        }
      },
      "published": true
    },
    {
      "slug": "dieng-highland",
      "code": "H",
      "length": "day-trip",
      "interests": [
        "nature",
        "temples"
      ],
      "priceFromIdr": 1500000,
      "photo": "/photos/dieng.jpg",
      "photoCredit": {
        "subject": "Telaga Warna, Dieng",
        "author": "Haridi123",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Telaga_Warna_Dieng_Jawa_Tengah.jpg"
      },
      "text": {
        "en": {
          "name": "Dieng Highland Escape",
          "summary": "Sunrise from Sikunir hill, tea gardens, the coloured lake of Telaga Warna and the old Arjuna temples.",
          "duration": "1 day, or 2 days and 1 night",
          "destinations": [
            "Sikunir sunrise",
            "Dieng tea gardens",
            "Telaga Warna lake",
            "Arjuna temples"
          ],
          "photoAlt": "The green Telaga Warna lake among forested hills on the Dieng plateau"
        },
        "id": {
          "name": "Dieng Highland Escape",
          "summary": "Sunrise dari Bukit Sikunir, kebun teh, Telaga Warna yang berwarna-warni, dan kompleks Candi Arjuna yang kuno.",
          "duration": "1 hari, atau 2 hari 1 malam",
          "destinations": [
            "Sunrise Bukit Sikunir",
            "Kebun teh Dieng",
            "Telaga Warna",
            "Candi Arjuna"
          ],
          "photoAlt": "Telaga Warna yang hijau di antara perbukitan berhutan di Dataran Tinggi Dieng"
        },
        "fr": {
          "name": "Escapade sur le plateau de Dieng",
          "summary": "Lever de soleil depuis la colline de Sikunir, plantations de thé, le lac coloré de Telaga Warna et les anciens temples d'Arjuna.",
          "duration": "1 jour, ou 2 jours et 1 nuit",
          "destinations": [
            "Lever de soleil à Sikunir",
            "Plantations de thé de Dieng",
            "Lac de Telaga Warna",
            "Temples d'Arjuna"
          ],
          "photoAlt": "Le lac vert de Telaga Warna entre des collines boisées sur le plateau de Dieng"
        }
      },
      "published": true
    },
    {
      "slug": "jogja-beach-city",
      "code": "I",
      "length": "day-trip",
      "interests": [
        "nature",
        "culture"
      ],
      "priceFromIdr": 500000,
      "photo": "/photos/parangtritis.jpg",
      "photoCredit": {
        "subject": "Parangtritis",
        "author": "Midori",
        "license": "CC BY 3.0",
        "source": "https://commons.wikimedia.org/wiki/File:Parangtritis_Beach_2011_2.JPG"
      },
      "text": {
        "en": {
          "name": "Jogja Beach & City Escape",
          "summary": "Parangtritis beach and its sand dunes, sunset at Obelix Sea View, and the evening on Malioboro street.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Parangtritis beach",
            "Gumuk Pasir sand dunes",
            "Obelix Sea View",
            "Malioboro street"
          ],
          "photoAlt": "A horse-drawn cart on the sand at Parangtritis beach"
        },
        "id": {
          "name": "Jogja Beach & City Escape",
          "summary": "Pantai Parangtritis dan Gumuk Pasir, sunset di Obelix Sea View, lalu malam di Jalan Malioboro.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Pantai Parangtritis",
            "Gumuk Pasir",
            "Obelix Sea View",
            "Jalan Malioboro"
          ],
          "photoAlt": "Andong yang ditarik kuda di atas pasir Pantai Parangtritis"
        },
        "fr": {
          "name": "Escapade plage et ville à Jogja",
          "summary": "La plage de Parangtritis et ses dunes de sable, le coucher de soleil à Obelix Sea View, et la soirée rue Malioboro.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Plage de Parangtritis",
            "Dunes de Gumuk Pasir",
            "Obelix Sea View",
            "Rue Malioboro"
          ],
          "photoAlt": "Une charrette tirée par un cheval sur le sable de la plage de Parangtritis"
        }
      },
      "published": true
    },
    {
      "slug": "merapi-adventure",
      "code": "J",
      "length": "day-trip",
      "interests": [
        "adventure",
        "nature"
      ],
      "priceFromIdr": 450000,
      "photo": "/photos/merapi.jpg",
      "photoCredit": {
        "subject": "Merapi",
        "author": "Kang Henry Irawan",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Gagahnya_Merapi.jpg"
      },
      "text": {
        "en": {
          "name": "Merapi Adventure",
          "summary": "Up the slopes of Java's most active volcano for a lava tour by jeep and ATV rides around Kaliurang.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Merapi lava tour",
            "Kaliurang ATV adventure"
          ],
          "photoAlt": "The grey, bare cone of Mount Merapi seen from the forest below"
        },
        "id": {
          "name": "Merapi Adventure",
          "summary": "Naik ke lereng gunung api paling aktif di Jawa untuk lava tour dengan jip dan naik ATV di sekitar Kaliurang.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Lava tour Merapi",
            "Petualangan ATV Kaliurang"
          ],
          "photoAlt": "Puncak Gunung Merapi yang gundul dan abu-abu, terlihat dari hutan di bawahnya"
        },
        "fr": {
          "name": "Aventure au Merapi",
          "summary": "Sur les pentes du volcan le plus actif de Java pour un lava tour en jeep et des balades en quad autour de Kaliurang.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Lava tour du Merapi",
            "Quad à Kaliurang"
          ],
          "photoAlt": "Le cône gris et nu du mont Merapi vu depuis la forêt en contrebas"
        }
      },
      "published": true
    },
    {
      "slug": "gunungkidul-coast",
      "code": "K",
      "length": "day-trip",
      "interests": [
        "nature",
        "adventure"
      ],
      "priceFromIdr": 700000,
      "photo": "/photos/timang.jpg",
      "photoCredit": {
        "subject": "Timang beach",
        "author": "Yasuspade",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Gondala_pantai_Timang_-_Gunung_Kidul,_DIY.jpg"
      },
      "text": {
        "en": {
          "name": "Gunungkidul Coastal Adventure",
          "summary": "The wooden gondola out to Timang's rock, then the quiet coves of Drini and Sadranan.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Timang beach",
            "Drini beach",
            "Sadranan beach"
          ],
          "photoAlt": "The wooden gondola that crosses to the rock island at Timang beach"
        },
        "id": {
          "name": "Petualangan Pantai Gunungkidul",
          "summary": "Gondola kayu menyeberang ke batu karang di Pantai Timang, lalu teluk-teluk tenang di Pantai Drini dan Pantai Sadranan.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Pantai Timang",
            "Pantai Drini",
            "Pantai Sadranan"
          ],
          "photoAlt": "Gondola kayu yang menyeberang ke pulau karang di Pantai Timang"
        },
        "fr": {
          "name": "Aventure sur la côte de Gunungkidul",
          "summary": "La nacelle en bois jusqu'au rocher de Timang, puis les criques tranquilles de Drini et Sadranan.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Plage de Timang",
            "Plage de Drini",
            "Plage de Sadranan"
          ],
          "photoAlt": "La nacelle en bois qui traverse jusqu'à l'îlot rocheux de la plage de Timang"
        }
      },
      "published": true
    },
    {
      "slug": "magelang-sunrise",
      "code": "L",
      "length": "day-trip",
      "interests": [
        "nature",
        "adventure",
        "culture"
      ],
      "priceFromIdr": 550000,
      "photo": "/photos/setumbu.jpg",
      "photoCredit": {
        "subject": "Punthuk Setumbu",
        "author": "Ridwanad",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Sunrise_di_punthuk_setumbu.jpg"
      },
      "text": {
        "en": {
          "name": "Magelang Sunrise & Adventure",
          "summary": "Sunrise over Borobudur from Punthuk Setumbu, the odd Gereja Ayam church, and rafting on the Elo river.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Punthuk Setumbu sunrise",
            "Gereja Ayam",
            "Elo river rafting"
          ],
          "photoAlt": "Sunrise over the mountains seen from Punthuk Setumbu hill"
        },
        "id": {
          "name": "Sunrise & Petualangan Magelang",
          "summary": "Sunrise di atas Borobudur dari Punthuk Setumbu, Gereja Ayam yang unik, dan Rafting Sungai Elo.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Sunrise Punthuk Setumbu",
            "Gereja Ayam",
            "Rafting Sungai Elo"
          ],
          "photoAlt": "Matahari terbit di atas pegunungan, dilihat dari Bukit Punthuk Setumbu"
        },
        "fr": {
          "name": "Lever de soleil et aventure à Magelang",
          "summary": "Le lever du soleil sur Borobudur depuis Punthuk Setumbu, l'étonnante église Gereja Ayam et du rafting sur la rivière Elo.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Lever de soleil à Punthuk Setumbu",
            "Gereja Ayam",
            "Rafting sur la rivière Elo"
          ],
          "photoAlt": "Le lever du soleil sur les montagnes vu depuis la colline de Punthuk Setumbu"
        }
      },
      "published": true
    },
    {
      "slug": "jogja-scenic-sunset",
      "code": "M",
      "length": "day-trip",
      "interests": [
        "nature"
      ],
      "priceFromIdr": 650000,
      "photo": "/photos/breksi.jpg",
      "photoCredit": {
        "subject": "Tebing Breksi",
        "author": "Firzafp",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Tebing_Breksi_-_Sleman,_YO_(24_January_2023)_01.jpg"
      },
      "text": {
        "en": {
          "name": "Yogyakarta Scenic & Sunset",
          "summary": "Clifftop views at HeHa Sky View and HeHa Ocean View, Puncak Segoro, and the carved quarry walls of Tebing Breksi.",
          "duration": "Day trip, there and back",
          "destinations": [
            "HeHa Sky View",
            "HeHa Ocean View",
            "Puncak Segoro",
            "Tebing Breksi"
          ],
          "photoAlt": "The carved limestone cliff face of Tebing Breksi"
        },
        "id": {
          "name": "Yogyakarta Scenic & Sunset",
          "summary": "Pemandangan dari atas tebing di HeHa Sky View dan HeHa Ocean View, Puncak Segoro, dan dinding bekas tambang berukir di Tebing Breksi.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "HeHa Sky View",
            "HeHa Ocean View",
            "Puncak Segoro",
            "Tebing Breksi"
          ],
          "photoAlt": "Dinding tebing kapur berukir di Tebing Breksi"
        },
        "fr": {
          "name": "Panoramas et coucher de soleil à Yogyakarta",
          "summary": "Vues du haut des falaises à HeHa Sky View et HeHa Ocean View, Puncak Segoro et les parois taillées de l'ancienne carrière de Tebing Breksi.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "HeHa Sky View",
            "HeHa Ocean View",
            "Puncak Segoro",
            "Tebing Breksi"
          ],
          "photoAlt": "La paroi de calcaire sculptée de Tebing Breksi"
        }
      },
      "published": true
    },
    {
      "slug": "water-adventure",
      "code": "N",
      "length": "day-trip",
      "interests": [
        "adventure",
        "nature"
      ],
      "priceFromIdr": null,
      "photo": "/photos/kedung-pedut.jpg",
      "photoCredit": {
        "subject": "Kedung Pedut",
        "author": "Hatfina nusratina",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Kedung-pedut_3.jpg"
      },
      "text": {
        "en": {
          "name": "Water & Adventure",
          "summary": "A day of rivers and falls: Kedung Pedut, the Blue Lagoon, Sri Gethuk waterfall and rafting on the Elo.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Kedung Pedut waterfall",
            "Blue Lagoon",
            "Sri Gethuk waterfall",
            "Elo river rafting"
          ],
          "photoAlt": "Water running over terraced rocks at Kedung Pedut waterfall"
        },
        "id": {
          "name": "Water & Adventure",
          "summary": "Sehari bermain air di sungai dan air terjun: Kedung Pedut, Blue Lagoon, Air Terjun Sri Gethuk, dan Rafting Sungai Elo.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Air Terjun Kedung Pedut",
            "Blue Lagoon",
            "Air Terjun Sri Gethuk",
            "Rafting Sungai Elo"
          ],
          "photoAlt": "Air mengalir di atas bebatuan bertingkat di Air Terjun Kedung Pedut"
        },
        "fr": {
          "name": "Eau & aventure",
          "summary": "Une journée de rivières et de cascades : Kedung Pedut, le Blue Lagoon, la cascade de Sri Gethuk et du rafting sur l'Elo.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Cascade de Kedung Pedut",
            "Blue Lagoon",
            "Cascade de Sri Gethuk",
            "Rafting sur la rivière Elo"
          ],
          "photoAlt": "L'eau ruisselle sur les rochers en terrasses de la cascade de Kedung Pedut"
        }
      },
      "published": true
    },
    {
      "slug": "nature-scenic",
      "code": "O",
      "length": "day-trip",
      "interests": [
        "nature"
      ],
      "priceFromIdr": null,
      "photo": "/photos/menoreh.jpg",
      "photoCredit": {
        "subject": "Menoreh hills",
        "author": "Febri Ady Prasetyo",
        "license": "CC BY-SA 4.0",
        "source": "https://commons.wikimedia.org/wiki/File:Pegunungan_Menoreh_dilihat_dari_Punthuk_Setumbu.jpg"
      },
      "text": {
        "en": {
          "name": "Nature & Scenic",
          "summary": "The Menoreh hills and Magelang's highlands: Tumpeng Menoreh, Pule Payung, Nepal van Java, Sukomakmur and Ketep Pass.",
          "duration": "Day trip, there and back",
          "destinations": [
            "Tumpeng Menoreh",
            "Pule Payung",
            "Nepal van Java",
            "Negeri Sayur Sukomakmur",
            "Ketep Pass"
          ],
          "photoAlt": "Green valleys of the Menoreh hills seen from above"
        },
        "id": {
          "name": "Nature & Scenic",
          "summary": "Perbukitan Menoreh dan dataran tinggi Magelang: Tumpeng Menoreh, Pule Payung, Nepal van Java, Sukomakmur, dan Ketep Pass.",
          "duration": "Perjalanan sehari, PP",
          "destinations": [
            "Tumpeng Menoreh",
            "Pule Payung",
            "Nepal van Java",
            "Negeri Sayur Sukomakmur",
            "Ketep Pass"
          ],
          "photoAlt": "Lembah hijau Perbukitan Menoreh dilihat dari atas"
        },
        "fr": {
          "name": "Nature & panoramas",
          "summary": "Les collines de Menoreh et les hauteurs de Magelang : Tumpeng Menoreh, Pule Payung, Nepal van Java, Sukomakmur et Ketep Pass.",
          "duration": "À la journée, aller-retour",
          "destinations": [
            "Tumpeng Menoreh",
            "Pule Payung",
            "Nepal van Java",
            "Negeri Sayur Sukomakmur",
            "Ketep Pass"
          ],
          "photoAlt": "Les vallées verdoyantes des collines de Menoreh vues d'en haut"
        }
      },
      "published": true
    }
  ],
  "vehicles": [
    {
      "id": "avanza",
      "name": "Toyota Avanza",
      "seats": "7",
      "maxPassengers": 7,
      "dayWithDriverIdr": 450000,
      "dayWithDriverAndFuelIdr": 600000,
      "transferRate": {
        "baseIdr": 50000,
        "perKmIdr": 4000,
        "minimumIdr": 250000
      },
      "published": true
    },
    {
      "id": "xenia",
      "name": "Daihatsu Xenia",
      "seats": "7",
      "maxPassengers": 7,
      "dayWithDriverIdr": 450000,
      "dayWithDriverAndFuelIdr": 600000,
      "transferRate": null,
      "published": true
    },
    {
      "id": "innova-reborn",
      "name": "Toyota Innova Reborn",
      "seats": "7",
      "maxPassengers": 7,
      "dayWithDriverIdr": 600000,
      "dayWithDriverAndFuelIdr": 800000,
      "transferRate": {
        "baseIdr": 70000,
        "perKmIdr": 5500,
        "minimumIdr": 350000
      },
      "published": true
    },
    {
      "id": "innova-zenix",
      "name": "Toyota Innova Zenix",
      "seats": "7",
      "maxPassengers": 7,
      "dayWithDriverIdr": 650000,
      "dayWithDriverAndFuelIdr": 900000,
      "transferRate": {
        "baseIdr": 80000,
        "perKmIdr": 6000,
        "minimumIdr": 375000
      },
      "published": true
    },
    {
      "id": "hiace",
      "name": "Toyota HiAce",
      "seats": "10–12",
      "maxPassengers": 12,
      "dayWithDriverIdr": 1000000,
      "dayWithDriverAndFuelIdr": 1300000,
      "transferRate": {
        "baseIdr": 110000,
        "perKmIdr": 8500,
        "minimumIdr": 550000
      },
      "published": true
    }
  ],
  "places": [
    {
      "id": "yia",
      "kind": "airport",
      "lat": -7.9006,
      "lng": 110.0573,
      "name": {
        "en": "Yogyakarta International Airport (YIA)",
        "id": "Bandara Internasional Yogyakarta (YIA)",
        "fr": "Aéroport international de Yogyakarta (YIA)"
      },
      "published": true
    },
    {
      "id": "yogyakarta",
      "kind": "city",
      "lat": -7.7956,
      "lng": 110.3695,
      "name": {
        "en": "Yogyakarta city",
        "id": "Kota Yogyakarta",
        "fr": "Ville de Yogyakarta"
      },
      "published": true
    },
    {
      "id": "sleman",
      "kind": "around",
      "lat": -7.7166,
      "lng": 110.355,
      "name": {
        "en": "Sleman",
        "id": "Sleman",
        "fr": "Sleman"
      },
      "published": true
    },
    {
      "id": "kulon-progo",
      "kind": "around",
      "lat": -7.8573,
      "lng": 110.1585,
      "name": {
        "en": "Kulon Progo",
        "id": "Kulon Progo",
        "fr": "Kulon Progo"
      },
      "published": true
    },
    {
      "id": "gunungkidul",
      "kind": "around",
      "lat": -7.9655,
      "lng": 110.6,
      "name": {
        "en": "Gunungkidul",
        "id": "Gunungkidul",
        "fr": "Gunungkidul"
      },
      "published": true
    },
    {
      "id": "klaten",
      "kind": "around",
      "lat": -7.7056,
      "lng": 110.6063,
      "name": {
        "en": "Klaten",
        "id": "Klaten",
        "fr": "Klaten"
      },
      "published": true
    },
    {
      "id": "boyolali",
      "kind": "around",
      "lat": -7.5318,
      "lng": 110.5958,
      "name": {
        "en": "Boyolali",
        "id": "Boyolali",
        "fr": "Boyolali"
      },
      "published": true
    },
    {
      "id": "magelang",
      "kind": "around",
      "lat": -7.4797,
      "lng": 110.2177,
      "name": {
        "en": "Magelang",
        "id": "Magelang",
        "fr": "Magelang"
      },
      "published": true
    },
    {
      "id": "temanggung",
      "kind": "around",
      "lat": -7.3148,
      "lng": 110.1745,
      "name": {
        "en": "Temanggung",
        "id": "Temanggung",
        "fr": "Temanggung"
      },
      "published": true
    },
    {
      "id": "sukoharjo",
      "kind": "around",
      "lat": -7.6808,
      "lng": 110.841,
      "name": {
        "en": "Sukoharjo",
        "id": "Sukoharjo",
        "fr": "Sukoharjo"
      },
      "published": true
    },
    {
      "id": "solo",
      "kind": "around",
      "lat": -7.5755,
      "lng": 110.8243,
      "name": {
        "en": "Solo (Surakarta)",
        "id": "Solo (Surakarta)",
        "fr": "Solo (Surakarta)"
      },
      "published": true
    },
    {
      "id": "kebumen",
      "kind": "java",
      "lat": -7.6681,
      "lng": 109.6525,
      "name": {
        "en": "Kebumen",
        "id": "Kebumen",
        "fr": "Kebumen"
      },
      "published": true
    },
    {
      "id": "purwokerto",
      "kind": "java",
      "lat": -7.4245,
      "lng": 109.2302,
      "name": {
        "en": "Purwokerto",
        "id": "Purwokerto",
        "fr": "Purwokerto"
      },
      "published": true
    },
    {
      "id": "cilacap",
      "kind": "java",
      "lat": -7.7268,
      "lng": 109.009,
      "name": {
        "en": "Cilacap",
        "id": "Cilacap",
        "fr": "Cilacap"
      },
      "published": true
    },
    {
      "id": "bumiayu",
      "kind": "java",
      "lat": -7.244,
      "lng": 109.005,
      "name": {
        "en": "Bumiayu",
        "id": "Bumiayu",
        "fr": "Bumiayu"
      },
      "published": true
    },
    {
      "id": "pangandaran",
      "kind": "java",
      "lat": -7.6945,
      "lng": 108.655,
      "name": {
        "en": "Pangandaran",
        "id": "Pangandaran",
        "fr": "Pangandaran"
      },
      "published": true
    },
    {
      "id": "surabaya",
      "kind": "java",
      "lat": -7.2575,
      "lng": 112.7521,
      "name": {
        "en": "Surabaya",
        "id": "Surabaya",
        "fr": "Surabaya"
      },
      "published": true
    },
    {
      "id": "malang",
      "kind": "java",
      "lat": -7.9666,
      "lng": 112.6326,
      "name": {
        "en": "Malang",
        "id": "Malang",
        "fr": "Malang"
      },
      "published": true
    },
    {
      "id": "banyuwangi",
      "kind": "java",
      "lat": -8.2192,
      "lng": 114.3691,
      "name": {
        "en": "Banyuwangi",
        "id": "Banyuwangi",
        "fr": "Banyuwangi"
      },
      "published": true
    },
    {
      "id": "borobudur",
      "kind": "sight",
      "lat": -7.6079,
      "lng": 110.2038,
      "name": {
        "en": "Borobudur",
        "id": "Borobudur",
        "fr": "Borobudur"
      },
      "published": true
    },
    {
      "id": "prambanan",
      "kind": "sight",
      "lat": -7.752,
      "lng": 110.4915,
      "name": {
        "en": "Prambanan",
        "id": "Prambanan",
        "fr": "Prambanan"
      },
      "published": true
    },
    {
      "id": "pacitan",
      "kind": "sight",
      "lat": -8.2048,
      "lng": 111.088,
      "name": {
        "en": "Pacitan",
        "id": "Pacitan",
        "fr": "Pacitan"
      },
      "published": true
    },
    {
      "id": "bromo",
      "kind": "sight",
      "lat": -7.9425,
      "lng": 112.953,
      "name": {
        "en": "Mount Bromo",
        "id": "Gunung Bromo",
        "fr": "Mont Bromo"
      },
      "published": true
    },
    {
      "id": "tumpak-sewu",
      "kind": "sight",
      "lat": -8.231,
      "lng": 112.918,
      "name": {
        "en": "Tumpak Sewu",
        "id": "Tumpak Sewu",
        "fr": "Tumpak Sewu"
      },
      "published": true
    },
    {
      "id": "ijen",
      "kind": "sight",
      "lat": -8.058,
      "lng": 114.242,
      "name": {
        "en": "Kawah Ijen",
        "id": "Kawah Ijen",
        "fr": "Kawah Ijen"
      },
      "published": true
    },
    {
      "id": "karimunjawa",
      "kind": "sight",
      "lat": -5.859,
      "lng": 110.432,
      "name": {
        "en": "Karimunjawa",
        "id": "Karimunjawa",
        "fr": "Karimunjawa"
      },
      "published": true
    },
    {
      "id": "bali",
      "kind": "sight",
      "lat": -8.6705,
      "lng": 115.2126,
      "name": {
        "en": "Bali",
        "id": "Bali",
        "fr": "Bali"
      },
      "published": true
    }
  ],
  "routes": [
    {
      "from": "yia",
      "to": "yogyakarta"
    },
    {
      "from": "yia",
      "to": "magelang"
    },
    {
      "from": "yogyakarta",
      "to": "solo"
    },
    {
      "from": "yogyakarta",
      "to": "bromo"
    },
    {
      "from": "yogyakarta",
      "to": "pangandaran"
    },
    {
      "from": "yogyakarta",
      "to": "bali"
    }
  ],
  "reviews": [
    {
      "id": "sample-1",
      "guestName": "Sample guest",
      "origin": {
        "en": "Melbourne, Australia",
        "id": "Melbourne, Australia",
        "fr": "Melbourne, Australie"
      },
      "quote": {
        "en": "Our driver picked us up at YIA after a late flight and had us at Borobudur before the crowds the next morning. Easy from start to finish.",
        "id": "Sopir kami menjemput di YIA setelah penerbangan malam, dan besok paginya kami sudah di Borobudur sebelum ramai. Lancar dari awal sampai akhir.",
        "fr": "Notre chauffeur nous a récupérés à YIA après un vol tardif et nous a emmenés à Borobudur avant la foule le lendemain matin. Simple du début à la fin."
      },
      "tourSlug": "borobudur-prambanan",
      "published": true
    },
    {
      "id": "sample-2",
      "guestName": "Sample guest",
      "origin": {
        "en": "Utrecht, the Netherlands",
        "id": "Utrecht, Belanda",
        "fr": "Utrecht, Pays-Bas"
      },
      "quote": {
        "en": "Two days to Bromo and back with a careful driver who knew every stop on the way. We could stop whenever we wanted.",
        "id": "Dua hari PP ke Bromo dengan sopir yang hati-hati dan hafal setiap tempat singgah. Kami bisa berhenti kapan pun kami mau.",
        "fr": "Deux jours aller-retour au Bromo avec un chauffeur prudent qui connaissait chaque arrêt sur la route. Nous pouvions nous arrêter quand nous voulions."
      },
      "tourSlug": "bromo-madakaripura",
      "published": true
    },
    {
      "id": "sample-3",
      "guestName": "Sample guest",
      "origin": {
        "en": "Lyon, France",
        "id": "Lyon, Prancis",
        "fr": "Lyon, France"
      },
      "quote": {
        "en": "We made our own plan for the day and the driver followed it without fuss, and found us a great place for lunch.",
        "id": "Kami buat rencana sendiri untuk hari itu dan sopirnya mengikutinya tanpa repot, bahkan menemukan tempat makan siang yang enak.",
        "fr": "Nous avons fait notre propre programme pour la journée, le chauffeur l'a suivi sans difficulté et nous a trouvé un excellent endroit pour déjeuner."
      },
      "tourSlug": "jogja-beach-city",
      "published": true
    }
  ],
  "faqs": [
    {
      "id": "faq-1",
      "question": {
        "en": "Is the price per person?",
        "id": "Apakah harganya per orang?",
        "fr": "Le prix est-il par personne ?"
      },
      "answer": {
        "en": "No. Every price is for the whole vehicle, with driver, fuel, parking and mineral water. An Avanza, Xenia or Innova takes up to 7 people, a HiAce up to 12.",
        "id": "Tidak. Semua harga untuk satu kendaraan, sudah termasuk sopir, BBM, parkir, dan air mineral. Avanza, Xenia, atau Innova muat sampai 7 orang, HiAce sampai 12 orang.",
        "fr": "Non. Chaque prix est pour le véhicule entier, avec chauffeur, carburant, parking et eau minérale. Une Avanza, Xenia ou Innova transporte jusqu'à 7 personnes, un HiAce jusqu'à 12."
      },
      "published": true
    },
    {
      "id": "faq-2",
      "question": {
        "en": "Are entrance tickets included?",
        "id": "Apakah tiket masuk sudah termasuk?",
        "fr": "Les billets d'entrée sont-ils inclus ?"
      },
      "answer": {
        "en": "No. Entrance tickets, jeeps, rafting and other activities are paid separately and can change with each site's rules. We can help arrange them if you ask.",
        "id": "Tidak. Tiket masuk, jip, rafting, dan aktivitas lain dibayar terpisah dan bisa berubah sesuai aturan tiap tempat wisata. Kami bisa bantu mengaturnya jika Anda minta.",
        "fr": "Non. Les billets d'entrée, jeeps, rafting et autres activités se paient à part et peuvent changer selon les règles de chaque site. Nous pouvons vous aider à les organiser si vous le souhaitez."
      },
      "published": true
    },
    {
      "id": "faq-3",
      "question": {
        "en": "Can you pick us up from the airport?",
        "id": "Bisakah kami dijemput di bandara?",
        "fr": "Pouvez-vous venir nous chercher à l'aéroport ?"
      },
      "answer": {
        "en": "Yes, from Yogyakarta International Airport (YIA), 24 hours a day. Transfers to Jogja start from Rp 250,000 and depend on the distance.",
        "id": "Bisa, dari Bandara Internasional Yogyakarta (YIA), 24 jam sehari. Transfer ke Jogja mulai dari Rp 250.000, tergantung jarak.",
        "fr": "Oui, à l'aéroport international de Yogyakarta (YIA), 24 h/24. Les transferts vers Jogja commencent à Rp 250 000 et dépendent de la distance."
      },
      "published": true
    },
    {
      "id": "faq-4",
      "question": {
        "en": "Do we have to follow the package itinerary?",
        "id": "Apakah kami harus mengikuti jadwal paket?",
        "fr": "Faut-il suivre l'itinéraire du circuit ?"
      },
      "answer": {
        "en": "No. Choose your own stops and times, and your driver follows your plan. The packages are a starting point.",
        "id": "Tidak. Pilih sendiri tujuan dan waktunya, sopir akan mengikuti rencana Anda. Paket hanya sebagai titik awal.",
        "fr": "Non. Choisissez vos étapes et vos horaires, votre chauffeur suit votre programme. Les circuits sont un point de départ."
      },
      "published": true
    },
    {
      "id": "faq-5",
      "question": {
        "en": "Can you drive further than Jogja?",
        "id": "Bisakah mengantar lebih jauh dari Jogja?",
        "fr": "Pouvez-vous aller plus loin que Jogja ?"
      },
      "answer": {
        "en": "Yes. We drive to Bromo, Ijen, Tumpak Sewu, Dieng, Pangandaran, Karimunjawa and other places across Java, and on to Bali.",
        "id": "Bisa. Kami melayani perjalanan ke Bromo, Ijen, Tumpak Sewu, Dieng, Pangandaran, Karimunjawa, dan tempat lain di seluruh Jawa, sampai ke Bali.",
        "fr": "Oui. Nous allons au Bromo, à l'Ijen, à Tumpak Sewu, à Dieng, à Pangandaran, à Karimunjawa et ailleurs à Java, et jusqu'à Bali."
      },
      "published": true
    },
    {
      "id": "faq-6",
      "question": {
        "en": "What should we wear for the temples?",
        "id": "Pakaian apa yang cocok untuk ke candi?",
        "fr": "Comment s'habiller pour les temples ?"
      },
      "answer": {
        "en": "Light clothes that cover your shoulders and knees, and shoes you can walk in. For sunrise trips, bring a jacket: it's cold before dawn.",
        "id": "Pakaian ringan yang menutupi bahu dan lutut, serta sepatu yang nyaman untuk berjalan. Untuk perjalanan sunrise, bawa jaket karena udara dingin sebelum fajar.",
        "fr": "Des vêtements légers qui couvrent les épaules et les genoux, et des chaussures confortables pour marcher. Pour les levers de soleil, prenez une veste : il fait froid avant l'aube."
      },
      "published": true
    }
  ]
};
