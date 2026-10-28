export type GraduationCategory = {
  id: string;
  name: string;
  emoji: string;
  providerCategoryId: string;
};

export const graduationCategories: GraduationCategory[] = [
  { id: 'soplesalci', name: 'Soplesalci', emoji: '🕺', providerCategoryId: 'soplesalci' },
  { id: 'soplesalke', name: 'Soplesalke', emoji: '💃', providerCategoryId: 'soplesalke' },
  { id: 'plesne-sole', name: 'Plesne šole', emoji: '💃🕺', providerCategoryId: 'plesne-sole' },
  { id: 'plesni-trenerji', name: 'Plesni trenerji', emoji: '👨‍🏫', providerCategoryId: 'plesni-trenerji' },
  { id: 'fotografi', name: 'Fotografiranje', emoji: '📸', providerCategoryId: 'fotografi' },
  { id: 'videografi', name: 'Videografija', emoji: '🎥', providerCategoryId: 'videografi' },
  { id: 'dj', name: 'DJ-ji', emoji: '🎧', providerCategoryId: 'dj' },
  { id: 'glasbeniki', name: 'Glasbeniki in skupine', emoji: '🎵', providerCategoryId: 'glasbeniki' },
  { id: 'obleke', name: 'Obleke za maturantski ples', emoji: '👗', providerCategoryId: 'obleke' },
  { id: 'moske-obleke', name: 'Moške obleke in smokingi', emoji: '🤵', providerCategoryId: 'moske-obleke' },
  { id: 'licenje', name: 'Ličenje', emoji: '💄', providerCategoryId: 'lepota' },
  { id: 'frizure', name: 'Frizure', emoji: '💇', providerCategoryId: 'lepota' },
  { id: 'prostori', name: 'Lokacije in dvorane', emoji: '🏛️', providerCategoryId: 'prostori' },
  { id: 'dekoracija', name: 'Dekoracija', emoji: '✨', providerCategoryId: 'dekoracija' },
  { id: 'prevoz', name: 'Prevoz', emoji: '🚗', providerCategoryId: 'prevoz' },
];

export type DancerAvailability = 'vaje' | 'nastop' | 'oboje';
export type DanceExperience = 'zacetno' | 'srednje' | 'napredno';
export type DancerSeeking = 'soplesalca' | 'soplesalko';

export type DancerProfile = {
  id: string;
  name: string;
  role: 'soplesalec' | 'soplesalka';
  photoUrl: string;
  city: string;
  danceKnowledge: DanceExperience;
  experience: string;
  availability: DancerAvailability[];
  description: string;
  priceFrom?: number;
  age: number;
  availableDates: string[];
};

export const dancerProfiles: DancerProfile[] = [];
