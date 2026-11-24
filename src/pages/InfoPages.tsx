import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, LockKeyhole, Mail, Store } from 'lucide-react';
import { useCategories } from '../hooks/useData';
import { usePageMeta } from '../lib/seo';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { contactService } from '../services/database';
import {
  providerApplicationService,
  type ProviderApplication,
} from '../services/providerApplicationService';
import { getSpecializationsForCategory, getSpecializationLabel } from '../data/specializations';

type InfoPageProps = {
  page: 'become-provider' | 'about' | 'contact' | 'terms' | 'provider-terms' | 'privacy';
};

const pageMeta = {
  'become-provider': ['Postani ponudnik', 'Predstavi svojo storitev ljudem, ki načrtujejo svoj naslednji dogodek.'],
  about: ['O nas', 'Spoznaj idejo in namen platforme Događive.'],
  contact: ['Kontakt', 'Piši ekipi Dogodive.'],
  terms: ['Pogoji uporabe', 'Osnovna pojasnila za predstavitveno različico platforme Dogodiva.'],
  'provider-terms': ['Pogoji za ponudnike', 'Pogoji sodelovanja in ustanovna ugodnost za ponudnike Dogodive.'],
  privacy: ['Zasebnost', 'Kako ravnamo s podatki v predstavitveni različici Dogodive.'],
} as const;

export default function InfoPage({ page }: InfoPageProps) {
  const { user, loading: authLoading } = useAuth();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplicationLoading, setIsApplicationLoading] = useState(false);
  const [application, setApplication] = useState<ProviderApplication | null>(null);
  const [accountMode, setAccountMode] = useState<'create' | 'later'>('create');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedExpertiseAreas, setSelectedExpertiseAreas] = useState<string[]>([]);
  usePageMeta(pageMeta[page][0], pageMeta[page][1]);

  useEffect(() => {
    if (page !== 'become-provider' || authLoading || !user) return;
    let cancelled = false;
    setIsApplicationLoading(true);
    setError('');

    providerApplicationService.getCurrentApplication()
      .then((currentApplication) => {
        if (!cancelled) {
          const activeApplication = currentApplication &&
            (currentApplication.status === 'pending' || currentApplication.status === 'approved')
              ? currentApplication
              : null;
          setApplication(activeApplication);
        }
      })
      .catch((applicationError) => {
        if (!cancelled) {
          setError(
            applicationError instanceof Error
              ? applicationError.message
              : 'Prijave ni bilo mogoče preveriti.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsApplicationLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, page, user]);

  async function handleProviderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setError('');
    setIsSubmitting(true);

    try {
      const form = new FormData(event.currentTarget);
      const businessName = String(form.get('business') ?? '').trim();
      const contactPerson = String(form.get('contact') ?? '').trim();
      const email = String(form.get('email') ?? '').trim();
      const phone = String(form.get('phone') ?? '').trim();
      const categorySlug = String(form.get('category') ?? '').trim();
      const selectedCategoryObject = categories.find(c => c.slug === categorySlug);
      if (!selectedCategoryObject?.id) throw new Error('Izbrana kategorija ni na voljo.');
      const categoryId = selectedCategoryObject.id;
      const city = String(form.get('city') ?? '').trim();
      const region = String(form.get('region') ?? '').trim();
      const website = String(form.get('website') ?? '').trim() || null;
      const description = String(form.get('description') ?? '').trim() || null;
      const specialization = String(form.get('specialization') ?? '').trim() || null;
      const expertiseAreas = selectedExpertiseAreas;
      const termsAccepted = form.get('terms') === 'on';
      const password = String(form.get('password') ?? '');
      const confirmPassword = String(form.get('confirmPassword') ?? '');
      let accountCreatedWithoutSession = false;

      if (!user && accountMode === 'create') {
        if (password.length < 8 || password !== confirmPassword) {
          throw new Error('Geslo mora imeti najmanj 8 znakov in se mora ujemati s potrditvijo.');
        }
        const signUpResult = await authService.signUp(email, password, contactPerson);
        accountCreatedWithoutSession = Boolean(signUpResult.user && !signUpResult.session);
      }

      const submitted = await providerApplicationService.submitApplication({
        businessName,
        contactPerson,
        email,
        phone,
        categoryId,
        city,
        region,
        website,
        description: description ?? '',
        specialization,
        expertiseAreas,
        termsAccepted,
      });

      setApplication(submitted);
      setNotice(
        accountCreatedWithoutSession
          ? 'Vaša prijava je v pregledu. Na e-pošto smo poslali potrditveno sporočilo; prijava se bo po potrditvi računa samodejno povezala.'
          : 'Vaša prijava je v pregledu. Po potrditvi boste prejeli dostop do nadzorne plošče ponudnika.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prišlo je do napake. Poskusi znova.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setError('');
    setIsSubmitting(true);
    try {
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      await contactService.submitMessage({
        name: String(form.get('name') ?? '').trim() || 'Obiskovalec Dogodive',
        email: String(form.get('email') ?? '').trim(),
        subject: String(form.get('subject') ?? '').trim(),
        message: String(form.get('message') ?? '').trim(),
      });
      setNotice('Sporočilo je bilo poslano. Ekipa Dogodive vam bo odgovorila prek e-pošte.');
      formElement.reset();
    } catch (contactError) {
      setError(contactError instanceof Error ? contactError.message : 'Sporočila ni bilo mogoče poslati.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (page === 'become-provider') {
    const applicationCategory = categories.find((category) => category.id === application?.category_id);
    if (isApplicationLoading || authLoading) {
      return (
        <section className="info-page provider-signup-page">
          <div className="container provider-application-loading">Preverjam prijavo ponudnika …</div>
        </section>
      );
    }

    if (application) {
      const isApproved = application.status === 'approved';
      return (
        <section className="info-page provider-signup-page">
          <div className="container provider-application-status-wrap">
            <div className="provider-application-status">
              <span className={`provider-status-icon ${isApproved ? 'is-approved' : ''}`}>
                {isApproved ? <BadgeCheck size={30} /> : <Clock3 size={30} />}
              </span>
              <span className="eyebrow">{isApproved ? 'Dobrodošli med ponudnike' : 'Prijava uspešno oddana'}</span>
              <h1>{isApproved ? 'Vaša prijava je potrjena.' : 'Vaša prijava je v pregledu.'}</h1>
              <p>
                {isApproved
                  ? 'Po potrditvi imate dostop do nadzorne plošče ponudnika in povpraševanj strank.'
                  : 'Ekipa Dogodive bo podatke pregledala. Po potrditvi boste prejeli dostop do nadzorne plošče ponudnika.'}
              </p>
              <div className="provider-status-details">
                <div><span>Podjetje</span><strong>{application.business_name}</strong></div>
                <div><span>Kategorija</span><strong>{applicationCategory?.name || 'Izbrana kategorija'}</strong></div>
                <div><span>Status</span><strong>{isApproved ? 'Odobreno' : 'V pregledu'}</strong></div>
                <div><span>Oddano</span><strong>{new Date(application.created_at).toLocaleDateString('sl-SI')}</strong></div>
              </div>
              {isApproved && application.founding_partner_number && (
                <div className="founding-partner-confirmed">
                  <BadgeCheck size={18} />
                  Ustanovni partner #{application.founding_partner_number} — 6 mesecev najvišjega paketa brezplačno.
                </div>
              )}
              {isApproved ? (
                <Link className="button button-primary" to="/povprasevanja">
                  Odpri nadzorno ploščo ponudnika <ArrowRight size={16} />
                </Link>
              ) : (
                <div className="provider-status-next">
                  <Mail size={18} />
                  O rezultatu vas bomo obvestili na {application.email}.
                </div>
              )}
              {notice && <p className="form-success" role="status">{notice}</p>}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="info-page provider-signup-page">
        <div className="container info-layout">
          <div className="info-copy">
            <span className="eyebrow"><Store size={14} /> Za ponudnike</span>
            <h1>Postani eden prvih 50 ustanovnih partnerjev Dogodive.</h1>
            <p>
              Predstavi svojo storitev organizatorjem dogodkov in prejmi povpraševanja
              neposredno na platformi.
            </p>
            <div className="benefit-list">
              <span><CheckCircle2 size={18} /> Prvi odobreni ponudniki prejmejo 6 mesecev najvišjega paketa brezplačno</span>
              <span><CheckCircle2 size={18} /> Dostop do javnih povpraševanj in neposrednih ponudb strankam</span>
              <span><CheckCircle2 size={18} /> Profesionalen profil, storitve, galerija in nadzor nad razpoložljivostjo</span>
            </div>
            <div className="provider-founder-note">
              <BadgeCheck size={20} />
              <span><strong>Ustanovna ugodnost</strong>Največ 50 partnerjev. Uvrstitev je dokončna ob potrditvi prijave.</span>
            </div>
          </div>
          <div className="inquiry-card provider-lead-card">
            <span className="eyebrow">Prijava ustanovnega partnerja</span>
            <h2>Predstavite svojo storitev</h2>
            <form className="inquiry-form" onSubmit={handleProviderSubmit}>
              <label>
                Ime podjetja / blagovna znamka
                <input name="business" minLength={2} required placeholder="Npr. Studio Luma" />
              </label>
              <label>
                Kontaktna oseba
                <input name="contact" autoComplete="name" minLength={2} required />
              </label>
              <label>
                E-naslov
                <input type="email" name="email" autoComplete="email" required defaultValue={user?.email ?? ''} readOnly={Boolean(user)} />
              </label>
              <label>
                Telefonska številka
                <input type="tel" name="phone" required minLength={6} autoComplete="tel" placeholder="+386 40 123 456" />
              </label>
              <label>
                Mesto
                <input name="city" minLength={2} required placeholder="Npr. Ljubljana" />
              </label>
              <label>
                Regija
                <input name="region" minLength={2} required placeholder="Npr. Osrednjeslovenska" />
              </label>
              <label>
                Glavna kategorija
                <select 
                  name="category" 
                  required 
                  defaultValue="" 
                  disabled={categoriesLoading || Boolean(categoriesError)}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSpecialization('');
                    setSelectedExpertiseAreas([]);
                  }}
                >
                  <option value="" disabled>
                    {categoriesLoading ? 'Nalagam kategorije …' : 'Izberi kategorijo'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>{category.name}</option>
                  ))}
                </select>
                {categoriesError && <small>V kategorijah je nastala napaka. Osveži stran in poskusi znova.</small>}
              </label>
              {selectedCategory && getSpecializationsForCategory(selectedCategory).length > 0 && (
                <>
                  <label>
                    {getSpecializationLabel(selectedCategory)}
                    <select 
                      name="specialization" 
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                      value={selectedSpecialization}
                    >
                      <option value="">Izberi specialnost</option>
                      {getSpecializationsForCategory(selectedCategory).map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Kaj dodatno še ponudiš?
                    <div className="expertise-areas-container">
                      {getSpecializationsForCategory(selectedCategory).map((spec) => (
                        <label key={spec} className="expertise-checkbox">
                          <input 
                            type="checkbox"
                            value={spec}
                            checked={selectedExpertiseAreas.includes(spec)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExpertiseAreas([...selectedExpertiseAreas, spec]);
                              } else {
                                setSelectedExpertiseAreas(selectedExpertiseAreas.filter(area => area !== spec));
                              }
                            }}
                          />
                          <span>{spec}</span>
                        </label>
                      ))}
                    </div>
                  </label>
                </>
              )}
              <label>
                Spletna stran ali Instagram (neobvezno)
                <input name="website" placeholder="https://… ali @uporabnisko_ime" />
              </label>
              <label>
                Kratek opis storitev
                <textarea name="description" rows={4} minLength={20} maxLength={1200} required placeholder="Katere storitve ponujate, za katere dogodke in kaj vas naredi posebne?" />
              </label>
              {!user && (
                <div className="provider-account-choice">
                  <span>Kako želite upravljati prijavo?</span>
                  <div className="provider-account-options">
                    <label>
                      <input type="radio" name="accountMode" value="create" checked={accountMode === 'create'} onChange={() => setAccountMode('create')} />
                      <span><LockKeyhole size={17} /><strong>Ustvari račun zdaj</strong><small>Za dostop do statusa in kasnejše nadzorne plošče.</small></span>
                    </label>
                    <label>
                      <input type="radio" name="accountMode" value="later" checked={accountMode === 'later'} onChange={() => setAccountMode('later')} />
                      <span><Mail size={17} /><strong>Registriraj se pozneje</strong><small>Oddaj prijavo in jo po registraciji poveži po e-naslovu.</small></span>
                    </label>
                  </div>
                  {accountMode === 'create' && (
                    <div className="provider-password-fields">
                      <label>Geslo
                        <input type="password" name="password" minLength={8} autoComplete="new-password" required placeholder="Najmanj 8 znakov" />
                      </label>
                      <label>Potrdi geslo
                        <input type="password" name="confirmPassword" minLength={8} autoComplete="new-password" required placeholder="Ponovi geslo" />
                      </label>
                    </div>
                  )}
                </div>
              )}
              <label className="provider-terms-check">
                <input type="checkbox" name="terms" required />
                <span>
                  Strinjam se s <Link to="/pogoji-za-ponudnike" target="_blank">Pogoji za ponudnike</Link> in potrjujem, da sem prebral/a ustanovno ugodnost za prvih 50 potrjenih partnerjev.
                </span>
              </label>
              <button className="button button-primary button-full" type="submit" disabled={isSubmitting || categoriesLoading}>
                {isSubmitting ? 'Pošiljam prijavo …' : 'Oddaj prijavo'} <ArrowRight size={16} />
              </button>
              {error && <p className="form-error" role="alert">{error}</p>}
              {notice && <p className="form-success" role="status">{notice}</p>}
            </form>
          </div>
        </div>
      </section>
    );
  }

  if (page === 'contact') {
    return (
      <section className="info-page">
        <div className="container narrow-content">
          <span className="eyebrow">Povežimo se</span>
          <h1>Tu smo za tvoja vprašanja.</h1>
          <p>Za vprašanja o platformi uporabi spodnji obrazec. Odgovor boš prejel/a na vneseni e-naslov.</p>
          <div className="inquiry-card contact-card">
            <h2>Pošlji sporočilo</h2>
            <form className="inquiry-form" onSubmit={handleContactSubmit}>
              <label>Tvoje ime<input name="name" autoComplete="name" minLength={2} required /></label>
              <label>Tvoj e-naslov<input type="email" name="email" required /></label>
              <label>Zadeva<input name="subject" minLength={3} required /></label>
              <label>Sporočilo<textarea name="message" minLength={10} maxLength={1200} required /></label>
              <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Pripravljam …' : 'Pripravi sporočilo'} <ArrowRight size={16} />
              </button>
              {notice && <p className="form-notice" role="status">{notice}</p>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <p className="form-footnote">Predstavitveni obrazec: sporočila se ne pošiljajo.</p>
            </form>
          </div>
        </div>
      </section>
    );
  }

  if (page === 'provider-terms') {
    return (
      <section className="info-page">
        <div className="container narrow-content legal-content">
          <span className="eyebrow">Za ustanovne partnerje</span>
          <h1>Pogoji za ponudnike</h1>
          <p>Dogodiva povezuje stranke in ponudnike storitev za dogodke. Ponudnik odgovarja za točnost podatkov, razpoložljivost in kakovost storitev, ki jih objavi ali ponudi.</p>
          <h2>Ustanovna ugodnost</h2>
          <p>Prvih 50 potrjenih ponudnikov prejme 6 mesecev najvišjega paketa brez plačila naročnine. Uvrstitev med ustanovne partnerje je dokončna ob odobritvi prijave in se ne rezervira z oddajo obrazca.</p>
          <h2>Pregled in dostop</h2>
          <p>Vsaka prijava je predmet pregleda. Dogodiva lahko zahteva dodatne podatke, zavrne prijavo ali začasno odstrani profil, ki vsebuje netočne, zavajajoče ali neprimerne vsebine.</p>
          <h2>Povpraševanja in komunikacija</h2>
          <p>Ponudniki lahko odgovarjajo na povpraševanja in pošiljajo ponudbe. Kontaktni podatki stranke se razkrijejo šele, ko ta ponudbo sprejme. Sporočila in ponudbe se uporabljajo izključno za namen organizacije dogodka.</p>
          <h2>Varovanje podatkov</h2>
          <p>Podatki prijave se uporabljajo za oceno, vzpostavitev profila in poslovno komunikacijo. Podrobnosti o obdelavi so opisane v obvestilu o zasebnosti Dogodive.</p>
          <Link className="button button-primary" to="/postani-ponudnik">Nazaj na prijavo ponudnika</Link>
        </div>
      </section>
    );
  }

  if (page === 'about') {
    return (
      <section className="info-page">
        <div className="container narrow-content">
          <span className="eyebrow">O Dogodivi</span>
          <h1>Več časa za praznovanje. Manj za iskanje.</h1>
          <p>
            Dogodiva je zasnovana kot spletno mesto, ki na enem mestu povezuje
            organizatorje dogodkov in ponudnike storitev. Začnemo v Sloveniji,
            z uporabno osnovo za prihodnjo širitev in lokalizacijo.
          </p>
          <div className="info-highlight">
            <h2>Najprej povezave, ki štejejo.</h2>
            <p>
              Prva faza se osredotoča na odkrivanje ponudnikov, pregledne profile
              in pripravo povpraševanj. Plačil in rezervacij še ne omogočamo.
            </p>
          </div>
          <Link className="button button-primary" to="/ponudniki">Razišči ponudnike <ArrowRight size={16} /></Link>
        </div>
      </section>
    );
  }

  const isPrivacy = page === 'privacy';
  return (
    <section className="info-page">
      <div className="container narrow-content legal-content">
        <span className="eyebrow">Dogodiva · Predstavitvena različica</span>
        <h1>{isPrivacy ? 'Zasebnost in podatki' : 'Pogoji uporabe'}</h1>
        <p className="legal-date">Informacije za trenutno predstavitveno različico</p>
        {isPrivacy ? (
          <>
            <h2>Obrazci in osebni podatki</h2>
            <p>
              Obrazci za povpraševanja, stik in zanimanje ponudnikov so trenutno
              predstavitveni. Podatkov ne pošiljajo na strežnik in jih aplikacija
              ne shranjuje. V obrazce zato ne vnašaj občutljivih osebnih podatkov.
            </p>
            <h2>Prijava in registracija</h2>
            <p>
              Avtentikacija je na voljo šele po konfiguraciji lastnega Supabase
              projekta. Ko bo funkcija vključena, bo treba objaviti posodobljeno
              obvestilo o zasebnosti, pravno podlago, roke hrambe in kontakt
              upravljavca podatkov.
            </p>
            <h2>Demo podatki</h2>
            <p>
              Profili in fotografije na tej strani so namenjeni prikazu uporabniške
              izkušnje. Profili ne predstavljajo preverjenih podjetij ali
              uporabniških ocen.
            </p>
          </>
        ) : (
          <>
            <h2>Predstavitvena različica</h2>
            <p>
              Dogodiva je v začetni fazi razvoja. Vsebina, ponudniki, cene in
              razpoložljivost so demo prikaz in niso zavezujoča ponudba.
            </p>
            <h2>Ustvarjanje računa in povpraševanja</h2>
            <p>
              Prijava, registracija in obrazci delujejo le po ustrezni nastavitvi
              zalednih storitev. Če konfiguracija manjka, so prijava in
              registracija onemogočeni, predstavitveni obrazci pa oddanih podatkov
              ne pošljejo ali shranijo.
            </p>
            <h2>Rezervacije in plačila</h2>
            <p>
              Rezervacije in plačilni sistemi niso vključeni. Dogovorov, plačil ali
              preverjanja ponudnikov ne izvajamo.
            </p>
            <p>
              Za vprašanja uporabi <Link to="/kontakt">kontaktni obrazec</Link>.
              To besedilo je informativni osnutek, ne pravni nasvet ali dokončni
              pravni dokument.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
