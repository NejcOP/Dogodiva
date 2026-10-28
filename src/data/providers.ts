export type Provider = {
  id: string;
  name: string;
  categoryIds: string[];
  eventTypes: string[];
  city: string;
  serviceArea: string;
  description: string;
  priceFrom: number;
  priceUnit: string;
  image: string;
  gallery: string[];
  tags: string[];
  guestCapacity?: number;
  demoAvailabilityDates: string[];
};

const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const providers: Provider[] = [
  {
    id: 'atelje-luma',
    name: 'Atelje Luma',
    categoryIds: ['fotografi'],
    eventTypes: ['poroka', 'maturantski-ples', 'rojstni-dan', 'obletnica', 'druzinsko-praznovanje'],
    city: 'Ljubljana',
    serviceArea: 'Osrednja Slovenija in okolica',
    description:
      'Nežni portreti in iskreni trenutki, ujete v svetlobi. Predstavitveni profil prikazuje, kako bo videti predstavitev fotografa na Dogodivi.',
    priceFrom: 790,
    priceUnit: 'na dogodek',
    image: photo('photo-1537633552985-df8429e8048b'),
    gallery: [
      photo('photo-1537633552985-df8429e8048b'),
      photo('photo-1519741497674-611481863552'),
      photo('photo-1532712938310-34cb3982ef74'),
    ],
    tags: ['poroka', 'fotografija', 'portreti'],
    demoAvailabilityDates: ['2027-06-20', '2027-08-15', '2027-09-11'],
  },
  {
    id: 'vila-brezina',
    name: 'Vila Brezina',
    categoryIds: ['prostori', 'restavracije'],
    eventTypes: ['poroka', 'maturantski-ples', 'rojstni-dan', 'obletnica', 'zasebna-zabava', 'druzinsko-praznovanje', 'poslovni-dogodek'],
    city: 'Bled',
    serviceArea: 'Gorenjska',
    description:
      'Svetel vrt in prijetna dvorana za družinska slavja ter večja praznovanja. Kapaciteta v tem predstavitvenem profilu je informativna.',
    priceFrom: 1800,
    priceUnit: 'najem prostora',
    image: photo('photo-1519167758481-83f550bb49b3'),
    gallery: [
      photo('photo-1519167758481-83f550bb49b3'),
      photo('photo-1519225421980-715cb0215aed'),
      photo('photo-1511795409834-ef04bbd61622'),
    ],
    tags: ['poroka', 'dogodek', 'vrt'],
    guestCapacity: 140,
    demoAvailabilityDates: ['2027-06-20', '2027-07-17'],
  },
  {
    id: 'studio-sever',
    name: 'Studio Sever',
    categoryIds: ['videografi'],
    eventTypes: ['poroka', 'maturantski-ples', 'rojstni-dan', 'obletnica', 'zasebna-zabava', 'poslovni-dogodek'],
    city: 'Maribor',
    serviceArea: 'Štajerska in po dogovoru',
    description:
      'Kinematografski utrinki z občutkom za ljudi, prostor in ritem vašega dne.',
    priceFrom: 950,
    priceUnit: 'na dogodek',
    image: photo('photo-1536240478700-b869070f9279'),
    gallery: [
      photo('photo-1536240478700-b869070f9279'),
      photo('photo-1492619375914-88005aa9e8fb'),
      photo('photo-1519741497674-611481863552'),
    ],
    tags: ['video', 'poroka', 'film'],
    demoAvailabilityDates: ['2027-08-15', '2027-09-11'],
  },
  {
    id: 'rdeca-cesnja',
    name: 'Rdeča češnja',
    categoryIds: ['catering', 'torte'],
    eventTypes: ['poroka', 'maturantski-ples', 'rojstni-dan', 'obletnica', 'zasebna-zabava', 'druzinsko-praznovanje', 'poslovni-dogodek'],
    city: 'Celje',
    serviceArea: 'Celje in Savinjska regija',
    description:
      'Sezonski prigrizki, sladki kotički in pogostitev, sestavljena po meri dogodka.',
    priceFrom: 24,
    priceUnit: 'na osebo',
    image: photo('photo-1555244162-803834f70033'),
    gallery: [
      photo('photo-1555244162-803834f70033'),
      photo('photo-1535254973040-607b474cb50d'),
      photo('photo-1551218808-94e220e084d2'),
    ],
    tags: ['hrana', 'pogostitev', 'sladice'],
    guestCapacity: 180,
    demoAvailabilityDates: ['2027-06-20', '2027-07-17', '2027-08-15'],
  },
  {
    id: 'cvetna-zgodba',
    name: 'Cvetna zgodba',
    categoryIds: ['dekoracija'],
    eventTypes: ['poroka', 'rojstni-dan', 'obletnica', 'zasebna-zabava', 'druzinsko-praznovanje'],
    city: 'Kranj',
    serviceArea: 'Gorenjska in Ljubljana z okolico',
    description:
      'Cvetlične kompozicije in usklajeni detajli za slavje z osebnim značajem.',
    priceFrom: 320,
    priceUnit: 'za dekoracijo',
    image: photo('photo-1507504031003-b417219a0fde'),
    gallery: [
      photo('photo-1507504031003-b417219a0fde'),
      photo('photo-1490750967868-88aa4486c946'),
      photo('photo-1519225421980-715cb0215aed'),
    ],
    tags: ['cvetje', 'dekoracija', 'poroka'],
    demoAvailabilityDates: ['2027-07-17', '2027-09-11'],
  },
  {
    id: 'zvok-in-ples',
    name: 'Zvok in ples',
    categoryIds: ['dj', 'glasbeniki'],
    eventTypes: ['poroka', 'maturantski-ples', 'rojstni-dan', 'obletnica', 'zasebna-zabava', 'poslovni-dogodek'],
    city: 'Koper',
    serviceArea: 'Primorska in po dogovoru',
    description:
      'Glasbeni izbor, ki poveže generacije, in zanesljiva tehnična podpora za vaš večer.',
    priceFrom: 650,
    priceUnit: 'na večer',
    image: photo('photo-1571266028243-d220c9c3b047'),
    gallery: [
      photo('photo-1571266028243-d220c9c3b047'),
      photo('photo-1501386761578-eac5c94b800a'),
      photo('photo-1492684223066-81342ee5ff30'),
    ],
    tags: ['glasba', 'zabava', 'DJ'],
    demoAvailabilityDates: ['2027-06-20', '2027-09-11'],
  },
  {
    id: 'miza-pod-lipo',
    name: 'Miza pod lipo',
    categoryIds: ['restavracije'],
    eventTypes: ['poroka', 'rojstni-dan', 'obletnica', 'zasebna-zabava', 'druzinsko-praznovanje', 'poslovni-dogodek'],
    city: 'Novo mesto',
    serviceArea: 'Dolenjska',
    description:
      'Topel ambient za praznovanja, kjer se zberejo družina, prijatelji in dobra hrana.',
    priceFrom: 38,
    priceUnit: 'na osebo',
    image: photo('photo-1414235077428-338989a2e8c0'),
    gallery: [
      photo('photo-1414235077428-338989a2e8c0'),
      photo('photo-1517248135467-4c7edcad34c4'),
      photo('photo-1559339352-11d035aa65de'),
    ],
    tags: ['restavracija', 'družinsko slavje', 'večerja'],
    guestCapacity: 90,
    demoAvailabilityDates: ['2027-07-17', '2027-08-15'],
  },
  {
    id: 'trenutek-za-tebe',
    name: 'Trenutek zate',
    categoryIds: ['organizatorji'],
    eventTypes: ['poroka', 'maturantski-ples', 'rojstni-dan', 'obletnica', 'zasebna-zabava', 'druzinsko-praznovanje', 'poslovni-dogodek', 'drugo'],
    city: 'Ljubljana',
    serviceArea: 'Vsa Slovenija',
    description:
      'Premišljeno načrtovanje praznovanj, od prvega seznama idej do izvedbenih podrobnosti.',
    priceFrom: 480,
    priceUnit: 'za organizacijo',
    image: photo('photo-1511578314322-379afb476865'),
    gallery: [
      photo('photo-1511578314322-379afb476865'),
      photo('photo-1511795409834-ef04bbd61622'),
      photo('photo-1507504031003-b417219a0fde'),
    ],
    tags: ['načrtovanje', 'organizacija', 'dogodek'],
    demoAvailabilityDates: ['2027-06-20', '2027-07-17', '2027-08-15', '2027-09-11'],
  },
];
