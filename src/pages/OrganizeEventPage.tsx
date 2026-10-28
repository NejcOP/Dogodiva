import { ArrowRight, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventTypes } from '../data/eventTypes';
import { usePageMeta } from '../lib/seo';

export default function OrganizeEventPage() {
  usePageMeta(
    'Organiziraj svoj dogodek',
    'Izberite vrsto dogodka in poiščite popolne ponudnike za vašo proslavo.',
  );

  return (
    <>
      <section className="organize-hero">
        <div className="container">
          <div className="organize-hero-content">
            <span className="eyebrow eyebrow-light">
              <Zap size={14} /> Enostavno. Hitro. Popolno.
            </span>
            <h1>Organiziraj svoj dogodek</h1>
            <p>
              Izberi vrsto praznovanja in najdi ponudnike, ki bodo tvoj dan spremenili
              v nepozaben spomin.
            </p>
          </div>
        </div>
      </section>

      <section className="organize-section">
        <div className="container">
          <h2>Kaj organiziraš?</h2>
          <div className="event-grid">
            {eventTypes.map((eventType) => (
              <Link
                key={eventType.id}
                to={eventType.id === 'maturantski-ples' 
                  ? '/kategorije/maturantski-plesi' 
                  : `/ponudniki?dogodek=${eventType.id}`
                }
                className="event-card"
              >
                <span className="event-emoji">{eventType.emoji}</span>
                <span className="event-name">{eventType.name}</span>
                <ArrowRight size={16} className="event-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="organize-steps">
        <div className="container">
          <h2>Kako deluje?</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Izberi vrsto dogodka</h3>
              <p>Poroka, rojstni dan, poslovni dogodek ali kaj drugega?</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Postavi osnovne podrobnosti</h3>
              <p>Povej nam, kje, kdaj in koliko gostov pričakuješ.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Primerjaj ponudnike</h3>
              <p>Najdi in primerjaj najboljše ponudnike v tvoji regiji.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Kontaktiraj in dogovori se</h3>
              <p>Komuniciramo te neposredno s ponudniki.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="organize-categories">
        <div className="container">
          <h2>Po kategorijah</h2>
          <p className="categories-intro">
            Ali te zanima kaj drugega? Preglej vse storitve, ki ti bodo pomagale.
          </p>
          <div className="category-chips">
            <Link to="/ponudniki?kategorija=prostori" className="category-chip">
              Prostori za dogodke
            </Link>
            <Link to="/ponudniki?kategorija=fotografi" className="category-chip">
              Fotografija
            </Link>
            <Link to="/ponudniki?kategorija=catering" className="category-chip">
              Catering
            </Link>
            <Link to="/ponudniki?kategorija=dj" className="category-chip">
              DJ-ji
            </Link>
            <Link to="/ponudniki?kategorija=dekoracija" className="category-chip">
              Dekoracija
            </Link>
            <Link to="/ponudniki?kategorija=torte" className="category-chip">
              Torte
            </Link>
            <Link to="/ponudniki" className="category-chip category-chip-all">
              Vse kategorije
            </Link>
          </div>
        </div>
      </section>

      <section className="organize-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Pripravljen za začetek?</h2>
            <p>Izberi tip dogodka in odkri ponudnike, ki ti bodo pomagali.</p>
            <Link to="/ponudniki" className="button button-primary button-large">
              <Heart size={18} />
              Poišči ponudnike
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
