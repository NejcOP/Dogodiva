import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Heart,
  MessageCircleMore,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProviderCard from '../components/ProviderCard';
import SearchForm from '../components/SearchForm';
import { categories } from '../data/categories';
import { providers } from '../data/providers';
import { usePageMeta } from '../lib/seo';

const heroImage =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=90';

export default function HomePage() {
  usePageMeta(
    'Vse za tvoj popoln dogodek na enem mestu',
    'Odkrij in primerjaj ponudnike za poroke, praznovanja in poslovne dogodke po Sloveniji.',
  );

  return (
    <>
      <section className="hero">
        <img className="hero-photo" src={heroImage} alt="" />
        <div className="hero-shade" />
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-light">
              <Sparkles size={14} /> Tvoj dogodek. Tvoja zgodba.
            </span>
            <h1>Vse za tvoj popoln dogodek <em>na enem mestu.</em></h1>
            <p>
              Od prve ideje do zadnjega plesa. Najdi ljudi, ki bodo tvoje praznovanje
              spremenili v spomin.
            </p>
            <div className="hero-proof">
              <span>
                <BadgeCheck size={16} /> Ponudniki na enem mestu
              </span>
              <span>Za posebne trenutke vseh vrst</span>
            </div>
          </div>
          <div className="hero-search">
            <SearchForm />
            <p>Začnite z idejo — ponudnike lahko primerjate brez obveznosti.</p>
          </div>
        </div>
        <div className="hero-index">01 <span /> 03</div>
      </section>

      <section className="trust-strip" aria-label="Prednosti platforme">
        <div className="container trust-strip-inner">
          <p>Za trenutke, vredne spomina</p>
          <span>POROKE</span>
          <i />
          <span>ROJSTNI DNEVI</span>
          <i />
          <span>POSEBNA PRAZNOVANJA</span>
          <i />
          <span>POSLOVNI DOGODKI</span>
        </div>
      </section>

      <section className="section category-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Naj se začne z idejo</span>
              <h2>Za vsak del tvojega dne</h2>
              <p>Odkrij ljudi in storitve, ki poskrbijo, da vse steče tako, kot si želiš.</p>
            </div>
            <Link className="text-link desktop-link" to="/ponudniki">
              Vse kategorije <ArrowRight size={17} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.slice(0, 6).map((category, index) => (
              <Link
                className={`category-card category-card-${index + 1}`}
                key={category.id}
                to={`/ponudniki?kategorija=${category.id}`}
              >
                <img src={category.image} alt="" loading="lazy" />
                <span className="category-overlay" />
                <span className="category-card-info">
                  <category.icon size={18} />
                  <span>
                    <strong>{category.name}</strong>
                    <small>{category.description}</small>
                  </span>
                  <ArrowUpRight className="category-arrow" size={19} />
                </span>
              </Link>
            ))}
          </div>
          <Link className="text-link mobile-link" to="/ponudniki">
            Razišči vse kategorije <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Spoznaj ponudnike</span>
              <h2>Ideje za tvoj naslednji dogodek</h2>
              <p>Predstavitveni profili kažejo, kako bodo ponudniki predstavljeni na platformi.</p>
            </div>
            <Link className="text-link desktop-link" to="/ponudniki">
              Razišči ponudnike <ArrowRight size={17} />
            </Link>
          </div>
          <div className="provider-grid featured-grid">
            {providers.slice(0, 3).map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
          <Link className="text-link mobile-link" to="/ponudniki">
            Vsi ponudniki <ArrowRight size={17} />
          </Link>
          <p className="demo-disclaimer">
            Vsebina je predstavitvena. Profili, cene in razpoložljivost niso preverjena ponudba.
          </p>
        </div>
      </section>

      <section className="section how-section">
        <div className="container how-layout">
          <div className="how-intro">
            <span className="eyebrow">Enostavneje, kot si misliš</span>
            <h2>Od ideje do dneva, ki je čisto tvoj.</h2>
            <p>
              Brez neskončnega iskanja po različnih straneh. Vse začneš na enem
              mestu, po svojem tempu.
            </p>
            <Link className="button button-outline" to="/ponudniki">
              Začni raziskovati <ArrowRight size={16} />
            </Link>
          </div>
          <div className="steps-list">
            <article className="step-item">
              <span className="step-icon"><Heart size={21} /></span>
              <span className="step-number">01</span>
              <div>
                <h3>Povej nam, kaj načrtuješ</h3>
                <p>Izberi vrsto dogodka, lokacijo in datum, ki ti ustreza.</p>
              </div>
            </article>
            <article className="step-item">
              <span className="step-icon"><Sparkles size={21} /></span>
              <span className="step-number">02</span>
              <div>
                <h3>Odkrij prave ponudnike</h3>
                <p>Primerjaj storitve, lokacije in okvirne cene na enem mestu.</p>
              </div>
            </article>
            <article className="step-item">
              <span className="step-icon"><MessageCircleMore size={21} /></span>
              <span className="step-number">03</span>
              <div>
                <h3>Poveži se po svoje</h3>
                <p>Izberi svoje favorite in se dogovori neposredno s ponudnikom.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="provider-banner-section">
        <div className="container">
          <div className="provider-banner">
            <div className="provider-banner-copy">
              <span className="eyebrow eyebrow-light">Za ustvarjalce posebnih trenutkov</span>
              <h2>Tvoja storitev si zasluži, da jo najdejo pravi ljudje.</h2>
              <p>
                Predstavi svojo ponudbo, pokaži svoje delo in bodi tam, kjer se začne
                načrtovanje naslednjega dogodka.
              </p>
              <Link className="button button-light" to="/postani-ponudnik">
                Predstavi svojo storitev <ArrowRight size={16} />
              </Link>
            </div>
            <div className="provider-banner-art" aria-hidden="true">
              <div className="banner-photo banner-photo-back">
                <img src={categories[8].image} alt="" loading="lazy" />
              </div>
              <div className="banner-photo banner-photo-front">
                <img src={categories[2].image} alt="" loading="lazy" />
              </div>
              <span className="banner-stamp">Tvoj talent.<br />Več pravih ljudi.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section promise-section">
        <div className="container promise-layout">
          <div className="promise-heading">
            <span className="eyebrow">Zasnovano za zaupanje</span>
            <h2>Pomembni so ljudje. In občutek, da si v dobrih rokah.</h2>
          </div>
          <div className="promise-content">
            <p>
              Dogodiva je v začetni fazi. Tukaj gradiš pregledno izkušnjo, kjer boš
              ponudnike lahko spoznal_a, primerjal_a in izbral_a na podlagi
              preverjenih informacij.
            </p>
            <div className="promise-note">
              <CalendarCheck size={21} />
              <span>
                <strong>Brez izmišljenih ocen.</strong>
                <small>Ocene se prikažejo šele, ko bodo na voljo preverjeni podatki.</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section faq-section" id="pogosta-vprasanja">
        <div className="container faq-layout">
          <div>
            <span className="eyebrow">Dobro je vedeti</span>
            <h2>Vprašanja, ki se pojavijo na začetku.</h2>
            <p>Še kaj ni jasno? Z veseljem prisluhnemo.</p>
            <Link className="text-link" to="/kontakt">
              Piši nam <ArrowRight size={16} />
            </Link>
          </div>
          <div className="faq-list">
            <details>
              <summary>Ali so ponudniki na platformi že preverjeni?</summary>
              <p>
                Trenutni profili so jasno označeni kot predstavitveni. Predstavitveni
                vsebini ne pripisujemo preverjanja, ocen ali potrjene razpoložljivosti.
              </p>
            </details>
            <details>
              <summary>Ali je uporaba Dogodive plačljiva?</summary>
              <p>
                Trenutna predstavitvena različica ne obdeluje plačil in ne zaračunava
                uporabe. Morebitni paketi bodo objavljeni šele, ko bodo pripravljeni.
              </p>
            </details>
            <details>
              <summary>Kako pošljem povpraševanje ponudniku?</summary>
              <p>
                Na profilu ponudnika lahko pripraviš osnutek povpraševanja. Pošiljanje
                še ni povezano s strežnikom, zato obrazec v tej različici ničesar ne
                pošlje ali shrani.
              </p>
            </details>
            <details>
              <summary>Ali lahko svojo storitev predstavim na Dogodivi?</summary>
              <p>
                Seveda. Na strani »Postani ponudnik« lahko oddaš zanimanje; dokler
                prijave niso povezane s strežnikom, se podatki ne pošljejo.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="container closing-cta-inner">
          <div>
            <span className="eyebrow eyebrow-light">Tvoj naslednji lep spomin</span>
            <h2>Začni z majhno idejo.</h2>
          </div>
          <Link className="button button-light" to="/ponudniki">
            Razišči ponudnike <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
