import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  UsersRound,
} from 'lucide-react';
import { categories } from '../data/categories';
import {
  dancerProfiles,
  graduationCategories,
  type DancerAvailability,
  type DancerProfile,
  type DancerSeeking,
} from '../data/graduation';
import { usePageMeta } from '../lib/seo';

const ageRanges = [
  { value: '15-17', label: '15–17 let', min: 15, max: 17 },
  { value: '18-20', label: '18–20 let', min: 18, max: 20 },
  { value: '21-25', label: '21–25 let', min: 21, max: 25 },
  { value: '26+', label: '26 let ali več', min: 26, max: Infinity },
];

const danceKnowledgeLabels = {
  zacetno: 'Začetno',
  srednje: 'Srednje',
  napredno: 'Napredno',
} as const;

const availabilityLabels: Record<DancerAvailability, string> = {
  vaje: 'Za vaje',
  nastop: 'Za nastop',
  oboje: 'Za vaje in nastop',
};

function DancerCard({ profile }: { profile: DancerProfile }) {
  return (
    <article className="dancer-card">
      <img className="dancer-card-photo" src={profile.photoUrl} alt="" loading="lazy" />
      <div className="dancer-card-content">
        <span className="dancer-card-location"><MapPin size={14} /> {profile.city}</span>
        <h3>{profile.name}</h3>
        <p className="dancer-card-level">
          {danceKnowledgeLabels[profile.danceKnowledge]} · {profile.experience}
        </p>
        <p className="dancer-card-description">{profile.description}</p>
        <div className="dancer-card-tags">
          {profile.availability.map((item) => (
            <span key={item}>{availabilityLabels[item]}</span>
          ))}
        </div>
        <div className="dancer-card-footer">
          <span>{profile.priceFrom ? `Od ${profile.priceFrom.toLocaleString('sl-SI')} €` : 'Cena po dogovoru'}</span>
          <Link className="button button-primary button-small" to="/kontakt">
            Pošlji povpraševanje
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function GraduationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [seeking, setSeeking] = useState<DancerSeeking>('soplesalca');
  const [partnerLocation, setPartnerLocation] = useState('');
  const [partnerDate, setPartnerDate] = useState('');
  const [danceLevel, setDanceLevel] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [availability, setAvailability] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const location = searchParams.get('lokacija') ?? '';
  const date = searchParams.get('datum') ?? '';
  const guests = searchParams.get('gosti') ?? '';
  const providerCategory = searchParams.get('kategorija') ?? '';

  useEffect(() => {
    const requestedRole = searchParams.get('iscem');
    if (requestedRole === 'soplesalci') {
      setSeeking('soplesalca');
      document.getElementById('soplesalci')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (requestedRole === 'soplesalke') {
      setSeeking('soplesalko');
      document.getElementById('soplesalci')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams]);

  usePageMeta(
    'Maturantski ples – soplesalci, fotografi, plesne šole',
    'Poišči soplesalca, plesno šolo, fotografa, DJ-ja, obleko in druge ponudnike za maturantski ples na enem mestu.',
  );

  const matchingDancers = useMemo(() => {
    const selectedAge = ageRanges.find((range) => range.value === ageRange);
    return dancerProfiles.filter((profile) => {
      const matchesLocation =
        !partnerLocation.trim() ||
        profile.city.toLocaleLowerCase('sl-SI').includes(partnerLocation.trim().toLocaleLowerCase('sl-SI'));
      const matchesRole = seeking === 'soplesalca'
        ? profile.role === 'soplesalec'
        : profile.role === 'soplesalka';
      const matchesLevel = !danceLevel || profile.danceKnowledge === danceLevel;
      const matchesAge = !selectedAge || (profile.age >= selectedAge.min && profile.age <= selectedAge.max);
      const matchesDate = !partnerDate || profile.availableDates.includes(partnerDate);
      const matchesAvailability =
        !availability ||
        profile.availability.includes(availability as DancerAvailability) ||
        (availability === 'oboje' && profile.availability.includes('vaje') && profile.availability.includes('nastop'));
      return matchesLocation && matchesRole && matchesLevel && matchesAge && matchesDate && matchesAvailability;
    });
  }, [ageRange, availability, danceLevel, partnerDate, partnerLocation, searchSubmitted, seeking]);

  function searchProviders(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams({ dogodek: 'maturantski-ples' });
    const category = String(form.get('kategorija') ?? '');
    const searchLocation = String(form.get('lokacija') ?? '').trim();
    const searchDate = String(form.get('datum') ?? '');
    const searchGuests = String(form.get('osebe') ?? '');
    if (category) params.set('kategorija', category);
    if (searchLocation) params.set('lokacija', searchLocation);
    if (searchDate) params.set('datum', searchDate);
    if (searchGuests) params.set('gosti', searchGuests);
    navigate(`/ponudniki?${params.toString()}`);
  }

  function searchDancers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchSubmitted(true);
  }

  return (
    <div className="graduation-page">
      <section className="graduation-hero">
        <div className="container graduation-hero-inner">
          <div className="graduation-hero-copy">
            <span className="eyebrow">Poseben večer. Tvoja ekipa.</span>
            <h1>Vse za tvoj maturantski ples na enem mestu</h1>
            <p>
              Poišči soplesalca, plesno šolo, fotografa, glasbo, obleko in druge
              ponudnike za svoj maturantski ples.
            </p>
          </div>
          <form className="graduation-search" onSubmit={searchProviders}>
            <label className="graduation-search-field">
              <MapPin size={18} />
              <span>
                <strong>Lokacija</strong>
                <input name="lokacija" defaultValue={location} placeholder="Mesto ali regija" />
              </span>
            </label>
            <label className="graduation-search-field">
              <CalendarDays size={18} />
              <span>
                <strong>Datum</strong>
                <input name="datum" type="date" defaultValue={date} />
              </span>
            </label>
            <label className="graduation-search-field">
              <UsersRound size={18} />
              <span>
                <strong>Število oseb</strong>
                <input name="osebe" type="number" min="1" max="10000" defaultValue={guests} placeholder="Npr. 80" />
              </span>
            </label>
            <label className="graduation-search-field">
              <Search size={18} />
              <span>
                <strong>Kategorija</strong>
                <select name="kategorija" defaultValue={providerCategory}>
                  <option value="">Vse kategorije</option>
                  {graduationCategories.map((item) => {
                    const category = categories.find((candidate) => candidate.id === item.providerCategoryId);
                    return (
                      <option key={item.id} value={item.providerCategoryId}>
                        {item.name || category?.name}
                      </option>
                    );
                  })}
                </select>
              </span>
            </label>
            <button className="button button-primary graduation-search-button" type="submit">
              Poišči ponudnike <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      <section className="section graduation-categories">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Vse za maturantski večer</span>
              <h2>Izberi, kaj potrebuješ</h2>
              <p>Vsaka kategorija te pripelje do ustreznega filtra za maturantski ples.</p>
            </div>
          </div>
          <div className="graduation-category-grid">
            {graduationCategories.map((item) => (
              <Link
                className="graduation-category-card"
                key={item.id}
                to={
                  item.id === 'soplesalci' || item.id === 'soplesalke'
                    ? `/kategorije/maturantski-plesi?iscem=${item.id}#soplesalci`
                    : `/ponudniki?dogodek=maturantski-ples&kategorija=${item.providerCategoryId}`
                }
              >
                <span className="graduation-category-emoji" aria-hidden="true">{item.emoji}</span>
                <span className="graduation-category-name">{item.name}</span>
                <ArrowRight className="graduation-category-arrow" size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="partner-section" id="soplesalci">
        <div className="container partner-layout">
          <div className="partner-intro">
            <span className="eyebrow">Posebna funkcija Dogodive</span>
            <h2>Poišči soplesalca / soplesalko</h2>
            <p>
              Išči osebo za plesne vaje ali skupni nastop. Ko bodo profili
              objavljeni, jih bo mogoče pregledati in kontaktirati na enem mestu.
            </p>
            <span className="partner-coming-note">
              Profili plesalcev in pošiljanje povpraševanj bodo na voljo po povezavi z bazo.
            </span>
          </div>
          <div className="partner-search-card">
            <div className="partner-toggle" role="group" aria-label="Koga iščeš?">
              <button
                type="button"
                className={seeking === 'soplesalca' ? 'is-selected' : ''}
                aria-pressed={seeking === 'soplesalca'}
                onClick={() => setSeeking('soplesalca')}
              >
                Iščem soplesalca
              </button>
              <button
                type="button"
                className={seeking === 'soplesalko' ? 'is-selected' : ''}
                aria-pressed={seeking === 'soplesalko'}
                onClick={() => setSeeking('soplesalko')}
              >
                Iščem soplesalko
              </button>
            </div>
            <form className="partner-search-form" onSubmit={searchDancers}>
              <label>
                Lokacija
                <input
                  value={partnerLocation}
                  onChange={(event) => setPartnerLocation(event.target.value)}
                  placeholder="Mesto ali regija"
                />
              </label>
              <label>
                Datum maturantskega plesa
                <input type="date" value={partnerDate} onChange={(event) => setPartnerDate(event.target.value)} />
              </label>
              <label>
                Plesno znanje
                <select value={danceLevel} onChange={(event) => setDanceLevel(event.target.value)}>
                  <option value="">Vse ravni</option>
                  <option value="zacetno">Začetno</option>
                  <option value="srednje">Srednje</option>
                  <option value="napredno">Napredno</option>
                </select>
              </label>
              <label>
                Starostni razpon
                <select value={ageRange} onChange={(event) => setAgeRange(event.target.value)}>
                  <option value="">Vse starosti</option>
                  {ageRanges.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
                </select>
              </label>
              <label className="partner-availability-field">
                Potrebujem partnerja
                <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
                  <option value="">Za vaje ali nastop</option>
                  <option value="vaje">Samo za vaje</option>
                  <option value="nastop">Samo za nastop</option>
                  <option value="oboje">Za vaje in nastop</option>
                </select>
              </label>
              <button className="button button-primary" type="submit">
                <Search size={16} /> Poišči {seeking}
              </button>
            </form>
            <p className="partner-date-note">
              {partnerDate
                ? `Izbrani datum: ${new Date(`${partnerDate}T12:00:00`).toLocaleDateString('sl-SI')}.`
                : 'Datum bo pomagal najti plesalce, ki so na voljo za tvoj večer.'}
            </p>
          </div>
          <div className="dancer-results" aria-live="polite">
            {matchingDancers.length ? (
              matchingDancers.map((profile) => <DancerCard key={profile.id} profile={profile} />)
            ) : (
              <div className="dancer-empty-state">
                <span className="dancer-empty-emoji" aria-hidden="true">🩰</span>
                <div>
                  <h3>{searchSubmitted ? 'Za izbrane filtre še ni profilov' : 'Profili plesalcev prihajajo'}</h3>
                  <p>
                    {searchSubmitted
                      ? 'Plesalski profili še niso povezani z bazo. Iskanje ničesar ne pošlje ali shrani.'
                      : 'Tukaj bodo prikazani profili z lokacijo, plesnim znanjem, izkušnjami, razpoložljivostjo, opisom in morebitno ceno.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="graduation-provider-cta">
        <div className="container graduation-provider-cta-inner">
          <div>
            <span className="eyebrow eyebrow-light">Za ponudnike maturantskih storitev</span>
            <h2>Ponujaj storitve za več vrst dogodkov.</h2>
            <p>
              Model ponudnika že podpira več kategorij in več vrst dogodkov, na
              primer fotografijo za poroke in maturantske plese.
            </p>
          </div>
          <Link className="button button-light" to="/postani-ponudnik">
            Predstavi svojo storitev <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
