// Specializations and expertise areas for different provider categories
// Keys match the category slug IDs from the database
export const specializationsByCategory: Record<string, { label: string; specializations: string[] }> = {
  fotografiranje: {
    label: 'Kaj fotografirate?',
    specializations: [
      'Poročne fotografije',
      'Portreti',
      'Produkt fotografija',
      'Pokrajinska fotografija',
      'Fotografija dogodkov',
      'Fotografija otrok',
      'Družinska fotografija',
      'Korporativna fotografija',
      'Fotografija nepremičnin',
    ],
  },
  'dj-ji': {
    label: 'Katere zvrsti glasbe vadite?',
    specializations: [
      'Pop',
      'Rock',
      'Hip-hop',
      'Elektronska glasba',
      'Klasična glasba',
      'Folk in narodno',
      'Jazz',
      'Latino',
      'Retrò 80s/90s',
      'Mešana glasba',
    ],
  },
  catering: {
    label: 'Kaj ponujate?',
    specializations: [
      'Tradicionalna slovenska hrana',
      'Mednarodno kulinarstvo',
      'Vegetarijanski menu',
      'Veganski menu',
      'Brez glutena',
      'Hrana za posebne diete',
      'Pijače in koktejli',
      'Dessert buffet',
      'BBQ in grill',
    ],
  },
  'glasbeniki-pevci': {
    label: 'Kaj izvedete?',
    specializations: [
      'Klasična glasba',
      'Jazz',
      'Folk in narodno',
      'Pop',
      'Rock',
      'Elektronska glasba',
      'Dueti',
      'Velike formacije',
      'Druge vrste glasbe',
    ],
  },
  'glasbene-skupine': {
    label: 'Kaj izvedete?',
    specializations: [
      'Klasična glasba',
      'Jazz in blues',
      'Folk in narodno',
      'Pop in rock',
      'Elektronska glasba',
      'Akustični nastopi',
      'Velike formacije (8+)',
      'Velike formacije (4-7)',
      'Druge vrste glasbe',
    ],
  },
  'dekoracija-dogodkov': {
    label: 'Kaj dekoriraš?',
    specializations: [
      'Cvetlje in aranžmaji',
      'Baloni in otpadi',
      'Svečane prireditve',
      'Poročni dekoraciji',
      'Prazničnih dekoracij',
      'Tematska dekoracija',
      'Rasveti in efekti',
      'Namještaj in rekviziti',
    ],
  },
  'gostilne-restavracije': {
    label: 'Kaj je značilno vaše?',
    specializations: [
      'Tradicionalna slovenska hrana',
      'Mednarodno kulinarstvo',
      'Vegetarijanska ponudba',
      'Gradivo iz domačih pridelkov',
      'Morski sadež',
      'Klasični aperitiv',
      'Moderna kuhinja',
      'Lokalna posebnosti',
    ],
  },
  'prostori-za-zabave': {
    label: 'Kaj nudi vaš prostor?',
    specializations: [
      'Kapaciteta do 50 oseb',
      'Kapaciteta do 100 oseb',
      'Kapaciteta do 200 oseb',
      'Kapaciteta nad 200 oseb',
      'Vrt ali terasa',
      'Parking',
      'Velike prostore',
      'Oprema vključena',
      'Zunanji prevoz',
    ],
  },
  'porocne-lokacije': {
    label: 'Kaj ponujate?',
    specializations: [
      'Poročni seremonialni prostor',
      'Recepciski prostor',
      'Vrt ali terasa',
      'Hotel ali sobo',
      'Restavracija',
      'Izvenrotacijski objekti',
      'Kapela ali svečano prizorišče',
      'Parkiranje',
      'Nočni nastanitev',
    ],
  },
  'maturantski-plesi': {
    label: 'Kaj ponujate?',
    specializations: [
      'Prostor za ples',
      'Dekoracija',
      'Hrana in pijača',
      'DJ in glasba',
      'Fotografija',
      'Video',
      'Izpis in naslovi',
      'Prevoz',
      'Maturantska spomina',
    ],
  },
  'organizacija-dogodkov': {
    label: 'Kakšne vrste dogodkov organizirate?',
    specializations: [
      'Poroke',
      'Rojstni dnevi',
      'Korporativni eventi',
      'Konference in seminarie',
      'Maturantski plesi',
      'Porodične zabave',
      'Fashion shows',
      'Dobrodelni eventi',
      'Druge vrste dogodkov',
    ],
  },
  poroke: {
    label: 'Kakšne storitve za poroko ponujate?',
    specializations: [
      'Poročni prostor',
      'Fotografija',
      'Video',
      'Dekoracija',
      'Hrana in pijača',
      'DJ in glasba',
      'Torti',
      'Papir in povabila',
      'Kompletna organizacija',
    ],
  },
};

// Export specializations for a specific category
export function getSpecializationsForCategory(categoryId: string): string[] {
  return specializationsByCategory[categoryId]?.specializations || [];
}

export function getSpecializationLabel(categoryId: string): string {
  return specializationsByCategory[categoryId]?.label || 'Specialnost';
}
