import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Send, UsersRound } from 'lucide-react';
import { categoryById } from '../data/categories';
import { providers } from '../data/providers';
import { usePageMeta } from '../lib/seo';
import { useAuth } from '../hooks/useAuth';
import { inquiryService, providerService } from '../services/database';
import type { Database } from '../types/supabase';

type LiveProvider = Database['public']['Tables']['provider_profiles']['Row'] & {
  provider_services: (Database['public']['Tables']['provider_services']['Row'] & {
    categories: Database['public']['Tables']['categories']['Row'] | null;
  })[];
  provider_gallery: Database['public']['Tables']['provider_gallery']['Row'][];
};

export default function ProviderProfilePage() {
  const { id } = useParams();
  const demoProvider = providers.find((item) => item.id === id);
  const [liveProvider, setLiveProvider] = useState<LiveProvider | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(!demoProvider);
  const { user } = useAuth();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const provider = demoProvider
    ? demoProvider
    : liveProvider ? {
        id: liveProvider.id,
        name: liveProvider.business_name,
        categoryIds: liveProvider.provider_services.map((service) => service.categories?.slug ?? '').filter(Boolean),
        eventTypes: [],
        city: liveProvider.city ?? 'Lokacija po dogovoru',
        serviceArea: liveProvider.service_areas.join(', ') || liveProvider.region || 'Slovenija',
        description: liveProvider.description ?? liveProvider.detailed_description ?? '',
        priceFrom: liveProvider.starting_price ?? 0,
        priceUnit: 'na dogodek',
        image: liveProvider.cover_image_url || liveProvider.logo_url || liveProvider.provider_gallery[0]?.image_url || '',
        gallery: [
          liveProvider.cover_image_url,
          ...liveProvider.provider_gallery.map((image) => image.image_url),
        ].filter((image): image is string => Boolean(image)),
        tags: liveProvider.provider_services.map((service) => service.title),
        guestCapacity: undefined,
        demoAvailabilityDates: [],
      } : null;

  useEffect(() => {
    if (!id || demoProvider) return;
    let cancelled = false;
    setLoadingProvider(true);
    providerService.getBySlug(id)
      .then((row) => {
        if (!cancelled) setLiveProvider(row as LiveProvider);
      })
      .catch(() => {
        if (!cancelled) setLiveProvider(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingProvider(false);
      });
    return () => {
      cancelled = true;
    };
  }, [demoProvider, id]);

  usePageMeta(
    provider?.name ?? 'Ponudnik ni najden',
    provider
      ? `${provider.name} — predstavitveni profil ponudnika za dogodke na Dogodivi.`
      : 'Iskani profil ponudnika ni na voljo.',
  );

  if (loadingProvider) {
    return <section className="not-found-page"><div className="container"><p>Nalagam profil ponudnika …</p></div></section>;
  }

  if (!provider) {
    return (
      <section className="not-found-page">
        <div className="container">
          <span className="eyebrow">Profila ni tukaj</span>
          <h1>Ponudnika ne najdemo.</h1>
          <p>Morda je povezava zastarela. Razišči ponudnike in poišči drugo možnost.</p>
          <Link className="button button-primary" to="/ponudniki">Vsi ponudniki</Link>
        </div>
      </section>
    );
  }

  const categoryNames = provider.categoryIds
    .map((categoryId) => categoryById.get(categoryId)?.name)
    .filter((name): name is string => Boolean(name));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (!liveProvider) {
        await new Promise((resolve) => window.setTimeout(resolve, 350));
        setNotice('To je predstavitveni obrazec. Povpraševanje ni bilo poslano ali shranjeno.');
        return;
      }
      if (!user) throw new Error('Za pošiljanje povpraševanja se najprej prijavi.');
      const form = new FormData(event.currentTarget);
      await inquiryService.create({
        customer_id: user.id,
        provider_id: liveProvider.id,
        event_type: String(form.get('eventType') ?? '').trim() || null,
        event_date: String(form.get('date') ?? '').trim() || null,
        location: String(form.get('location') ?? '').trim() || liveProvider.city,
        guest_count: form.get('guests') ? Number(form.get('guests')) : null,
        budget: form.get('budget') ? Number(form.get('budget')) : null,
        message: String(form.get('message') ?? '').trim(),
      });
      setNotice('Povpraševanje je bilo poslano ponudniku.');
      (event.currentTarget as HTMLFormElement).reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Povpraševanja ni bilo mogoče poslati.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="container">
        <Link className="back-link" to="/ponudniki"><ArrowLeft size={16} /> Nazaj na ponudnike</Link>
        <div className="profile-heading">
          <div>
            <span className="demo-badge profile-demo-badge">
              {liveProvider ? 'Preverjen ponudnik Dogodive' : 'Predstavitveni profil · Ne gre za preverjeno podjetje'}
            </span>
            <h1>{provider.name}</h1>
            <p className="profile-location"><MapPin size={16} /> {provider.city} · {provider.serviceArea}</p>
          </div>
        </div>
        <div className="profile-gallery">
          {provider.gallery.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`${provider.name} – predstavitvena fotografija ${index + 1}`}
              loading={index > 0 ? 'lazy' : 'eager'}
              className={`profile-gallery-image profile-gallery-${index + 1}`}
            />
          ))}
        </div>
        <div className="profile-layout">
          <div className="profile-main">
            <section className="profile-section">
              <span className="eyebrow">O ponudniku</span>
              <h2>Posebni trenutki, po tvoje.</h2>
              <p>{provider.description}</p>
              <p>
                Ta predstavitveni opis ponazarja vsebino prihodnjih profilov. Pred
                dogovorom vedno preveri podrobnosti neposredno pri ponudniku.
              </p>
            </section>
            <section className="profile-section">
              <span className="eyebrow">Kaj ponuja</span>
              <h2>Storitve in območje delovanja</h2>
              <div className="tag-list">
                {categoryNames.map((name) => <span className="service-tag" key={name}>{name}</span>)}
                <span className="service-tag">{provider.serviceArea}</span>
              </div>
              <div className="profile-facts">
                {provider.guestCapacity && (
                  <span><UsersRound size={17} /> Demo kapaciteta do {provider.guestCapacity} gostov</span>
                )}
                <span><CalendarDays size={17} /> Razpoložljivost je treba potrditi</span>
              </div>
            </section>
            <section className="profile-section">
              <span className="eyebrow">Okvirna cena</span>
              <h2>Za lažji začetek načrtovanja</h2>
              <p className="profile-price">
                Od <strong>{provider.priceFrom.toLocaleString('sl-SI')} €</strong> <span>{provider.priceUnit}</span>
              </p>
              <p className="profile-price-note">{liveProvider ? 'Okvirna začetna cena ponudnika. Končno ponudbo potrdi neposredno.' : 'Demo cena za prikaz. Ne predstavlja veljavne ponudbe.'}</p>
            </section>
            <section className="profile-section">
              <span className="eyebrow">Paketi</span>
              <h2>Ponudba po meri</h2>
              <p>
                {liveProvider?.provider_services.length
                  ? liveProvider.provider_services.map((service) => `${service.title}${service.price_from ? ` — od ${service.price_from.toLocaleString('sl-SI')} €` : ''}`).join(' · ')
                  : 'Ponudnik lahko pripravi ponudbo po meri glede na dogodek.'}
              </p>
            </section>
            <section className="profile-section review-placeholder">
              <span className="eyebrow">Mnenja</span>
              <h2>Verodostojnost pred številkami.</h2>
              <p>Preverjena mnenja bodo dodana, ko bo na voljo resnična uporabniška izkušnja.</p>
              <span className="review-empty-label">Za ta profil še ni preverjenih ocen.</span>
            </section>
          </div>
          <aside className="inquiry-card">
            <span className="eyebrow">Naredi prvi korak</span>
            <h2>Pošlji povpraševanje</h2>
            <p>Izpolni osnovne podrobnosti in pripravi sporočilo za ponudnika.</p>
            <form className="inquiry-form" onSubmit={handleSubmit}>
              <label>
                Tvoj e-naslov
                <input type="email" name="email" autoComplete="email" placeholder="ime@primer.si" required />
              </label>
              {liveProvider && (
                <>
                  <label>Vrsta dogodka<input name="eventType" placeholder="Npr. poroka" /></label>
                  <label>Lokacija dogodka<input name="location" placeholder={liveProvider.city || 'Mesto ali regija'} /></label>
                  <div className="form-row">
                    <label>Število gostov<input type="number" min="1" name="guests" placeholder="80" /></label>
                    <label>Proračun (€)<input type="number" min="0" name="budget" placeholder="2500" /></label>
                  </div>
                </>
              )}
              <label>
                Datum dogodka
                <input type="date" name="date" />
              </label>
              <label>
                Sporočilo
                <textarea
                  name="message"
                  minLength={10}
                  maxLength={1200}
                  placeholder="Na kratko opiši, kaj načrtuješ …"
                  required
                />
              </label>
              <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
                <Send size={16} /> {isSubmitting ? 'Pripravljam …' : 'Pripravi povpraševanje'}
              </button>
              {notice && <p className="form-notice" role="status">{notice}</p>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <p className="form-footnote">{liveProvider ? 'Povpraševanje je shranjeno v vaš uporabniški račun in poslano ponudniku.' : 'Demonstracija brez pošiljanja ali shranjevanja podatkov.'}</p>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
