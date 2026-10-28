import {
  Camera,
  CakeSlice,
  CarFront,
  Flower2,
  Music2,
  PartyPopper,
  Shirt,
  Sparkles,
  Utensils,
  UsersRound,
  Video,
  type LucideIcon,
} from 'lucide-react';

export type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  image: string;
  description: string;
};

export const categories: Category[] = [
  {
    id: 'prostori',
    name: 'Prostori za dogodke',
    icon: PartyPopper,
    image:
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=85',
    description: 'Lokacije za slavje, druženje in velike trenutke.',
  },
  {
    id: 'restavracije',
    name: 'Restavracije in gostilne',
    icon: Utensils,
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=85',
    description: 'Prijetna miza in dobra hrana za vsako priložnost.',
  },
  {
    id: 'fotografi',
    name: 'Fotografi',
    icon: Camera,
    image:
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=900&q=85',
    description: 'Ujemite trenutke, h katerim se boste radi vračali.',
  },
  {
    id: 'videografi',
    name: 'Videografi',
    icon: Video,
    image:
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=900&q=85',
    description: 'Zgodba vašega dne v gibanju in zvoku.',
  },
  {
    id: 'dj',
    name: 'DJ-ji',
    icon: Music2,
    image:
      'https://images.unsplash.com/photo-1571266028243-d220c9c3b047?auto=format&fit=crop&w=900&q=85',
    description: 'Glasba, ki spravi na noge vse generacije.',
  },
  {
    id: 'glasbeniki',
    name: 'Glasbeniki, pevci in skupine',
    icon: Music2,
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
    description: 'Živa glasba za nepozabno vzdušje.',
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: Utensils,
    image:
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=85',
    description: 'Okusi in postrežba, prilagojeni vašemu dogodku.',
  },
  {
    id: 'torte',
    name: 'Torte in slaščičarji',
    icon: CakeSlice,
    image:
      'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=85',
    description: 'Sladka pika na i vašemu praznovanju.',
  },
  {
    id: 'dekoracija',
    name: 'Dekoracija in cvetje',
    icon: Flower2,
    image:
      'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=85',
    description: 'Detajli, ki prostoru dajo osebni pečat.',
  },
  {
    id: 'obleke',
    name: 'Poročne obleke in obleke za dogodke',
    icon: Shirt,
    image:
      'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=85',
    description: 'Poiščite videz, v katerem se počutite odlično.',
  },
  {
    id: 'lepota',
    name: 'Frizerji in vizažisti',
    icon: Sparkles,
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85',
    description: 'Priprave za samozavesten nastop na vaš dan.',
  },
  {
    id: 'organizatorji',
    name: 'Organizatorji dogodkov',
    icon: UsersRound,
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85',
    description: 'Izkušena pomoč od prve ideje do zadnjega plesa.',
  },
  {
    id: 'prevoz',
    name: 'Prevoz',
    icon: CarFront,
    image:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=85',
    description: 'Prihod in odhod brez skrbi za goste in slavljenke.',
  },
  {
    id: 'oprema',
    name: 'Najem opreme',
    icon: PartyPopper,
    image:
      'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=85',
    description: 'Vse potrebno za udobno in lepo prizorišče.',
  },
  {
    id: 'plesni-partnerji',
    name: 'Plesalci in plesni partnerji',
    icon: UsersRound,
    image:
      'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=85',
    description: 'Podpora in soplesalci za maturantske plese.',
  },
  {
    id: 'soplesalci',
    name: 'Soplesalci',
    icon: UsersRound,
    image:
      'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=85',
    description: 'Poišči soplesalca za vaje ali maturantski nastop.',
  },
  {
    id: 'soplesalke',
    name: 'Soplesalke',
    icon: UsersRound,
    image:
      'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=85',
    description: 'Poišči soplesalko za vaje ali maturantski nastop.',
  },
  {
    id: 'plesne-sole',
    name: 'Plesne šole',
    icon: UsersRound,
    image:
      'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=85',
    description: 'Tečaji in priprave na maturantski ples.',
  },
  {
    id: 'plesni-trenerji',
    name: 'Plesni trenerji',
    icon: UsersRound,
    image:
      'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=85',
    description: 'Individualna pomoč pri plesnih korakih.',
  },
  {
    id: 'moske-obleke',
    name: 'Moške obleke in smokingi',
    icon: Shirt,
    image:
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=900&q=85',
    description: 'Elegantni videzi za maturantski večer.',
  },
];

export const categoryById = new Map(categories.map((category) => [category.id, category]));
