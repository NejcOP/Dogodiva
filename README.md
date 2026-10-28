# Dogodiva

Prva MVP-faza platforme za odkrivanje ponudnikov dogodkov. Trenutna različica
vključuje domačo stran, iskanje in filtre nad označenimi demo profili, profil
ponudnika, odzivno navigacijo ter osnovne strani za prijavo, registracijo in
informacije. Dodana je tudi vizualna stran za maturantske plese s podkategorijami
in pripravljenim, trenutno praznim vmesnikom za iskanje soplesalcev. Vrste
dogodkov in kategorije ponudnikov so ločene strukture. Plačila, rezervacije,
podatki plesalcev in trajno shranjevanje povpraševanj še niso implementirani.

## Zagon

Zahtevana sta Node.js 18 ali novejši in npm.

```bash
npm install
npm run dev
```

Za preverjanje tipov in produkcijski build:

```bash
npm run typecheck
npm run build
```

## Supabase (neobvezno)

Če želite omogočiti prijavo in registracijo:

1. V Supabase projektu ustvarite odjemalski URL in javni anon/publishable ključ.
2. Kopirajte `.env.example` v `.env.local` ter izpolnite `VITE_SUPABASE_URL` in
   `VITE_SUPABASE_ANON_KEY`.
3. Znova zaženite razvojni strežnik.

Za prijavo/registracijo ne potrebujete baze tabel, vendar so za profile,
povpraševanja, galerije in druge podatke pred produkcijsko uporabo potrebni
shema, politike Row Level Security (RLS) in preverjena avtorizacija. Ključa
`service_role` ne dodajajte v odjemalsko okolje. Brez konfiguracije obrazci
prijave jasno opozorijo, da funkcija še ni na voljo; demo povpraševanja se ne
pošiljajo in ne shranjujejo.

## Demo vsebina in fotografije

Ponudniki so predstavitveni, ne predstavljajo resničnih podjetij, nimajo
preverjenih ocen in niso dokazano razpoložljivi. Fotografije se nalagajo z
Unsplash, zato je za njihov prikaz potrebna internetna povezava.

Besedila so trenutno v `src/i18n/sl.ts`, kategorije v `src/data/categories.ts`.
To sta osrednji mesti za poznejšo lokalizacijo in upravljanje kategorij.
