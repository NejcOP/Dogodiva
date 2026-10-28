export type EventType = {
  id: string;
  name: string;
  emoji?: string;
};

export const eventTypes: EventType[] = [
  { id: 'poroka', name: 'Poroka', emoji: '💍' },
  { id: 'maturantski-ples', name: 'Maturantski ples', emoji: '🎓' },
  { id: 'rojstni-dan', name: 'Rojstni dan', emoji: '🎂' },
  { id: 'obletnica', name: 'Obletnica', emoji: '🥂' },
  { id: 'krst', name: 'Krst', emoji: '👶' },
  { id: 'zasebna-zabava', name: 'Zasebna zabava', emoji: '🎉' },
  { id: 'druzinsko-praznovanje', name: 'Družinsko praznovanje', emoji: '🎉' },
  { id: 'poslovni-dogodek', name: 'Poslovni dogodek', emoji: '🏢' },
  { id: 'zabava', name: 'Zabava', emoji: '🎉' },
  { id: 'drugo', name: 'Drugo', emoji: '✨' },
] as const;
