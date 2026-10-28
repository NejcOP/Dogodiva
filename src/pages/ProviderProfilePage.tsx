import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Send, UsersRound } from 'lucide-react';
import { categoryById } from '../data/categories';
import { providers } from '../data/providers';
import { usePageMeta } from '../lib/seo';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const provider = providers.find((item) => item.id === id);
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageMeta(
    provider?.name ?? 'Ponudnik ni najden',
    provider
      ? `${provider.name} — predstavitveni profil ponudnika za dogodke na Dogodivi.`
      : 'Iskani profil ponudnika ni na voljo.',
  );

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
    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    setNotice('To je predstavitveni obrazec. Povpraševanje ni bilo poslano ali shranjeno.');
    setIsSubmitting(false);
  }

  return (
    <div className="profile-page">
      <div className="container">
        <Link className="back-link" to="/ponudniki"><ArrowLeft size={16} /> Nazaj na ponudnike</Link>
        <div className="profile-heading">
          <div>
            <span className="demo-badge profile-demo-badge">Predstavitveni profil · Ne gre za preverjeno podjetje</span>
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
              <p className="profile-price-note">Demo cena za prikaz. Ne predstavlja veljavne ponudbe.</p>
            </section>
            <section className="profile-section">
              <span className="eyebrow">Paketi</span>
              <h2>Ponudba po meri</h2>
              <p>
                Ta predstavitveni profil ne vsebuje objavljenih paketov. Ko bodo
                podatki ponudnika na voljo, bodo tukaj prikazane storitve in njihove
                podrobnosti.
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
              <p className="form-footnote">Demonstracija brez pošiljanja ali shranjevanja podatkov.</p>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
