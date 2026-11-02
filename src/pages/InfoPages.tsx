import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Store } from 'lucide-react';
import { categories } from '../data/categories';
import { usePageMeta } from '../lib/seo';
import { useAuth } from '../hooks/useAuth';
import { providerApplicationService } from '../services/providerApplicationService';

type InfoPageProps = { page: 'become-provider' | 'about' | 'contact' | 'terms' | 'privacy' };

const pageMeta = {
  'become-provider': ['Postani ponudnik', 'Predstavi svojo storitev ljudem, ki načrtujejo svoj naslednji dogodek.'],
  about: ['O nas', 'Spoznaj idejo in namen platforme Događive.'],
  contact: ['Kontakt', 'Piši ekipi Dogodive.'],
  terms: ['Pogoji uporabe', 'Osnovna pojasnila za predstavitveno različico platforme Dogodiva.'],
  privacy: ['Zasebnost', 'Kako ravnamo s podatki v predstavitveni različici Dogodive.'],
} as const;

export default function InfoPage({ page }: InfoPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  usePageMeta(pageMeta[page][0], pageMeta[page][1]);

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
      const categoryId = String(form.get('category') ?? '').trim();
      const city = String(form.get('city') ?? '').trim();
      const website = String(form.get('website') ?? '').trim() || null;
      const description = String(form.get('description') ?? '').trim() || null;

      // Basic validation
      if (!businessName || !contactPerson || !email || !phone || !categoryId || !city) {
        setError('Vsa polja so obvezna.');
        setIsSubmitting(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Prosim vnesi veljaven e-naslov.');
        setIsSubmitting(false);
        return;
      }

      // Check for existing application
      const existing = await providerApplicationService.checkExistingApplication(email);
      if (existing) {
        setError(`Že imaš prijavljeno application s statusom: ${existing.status}`);
        setIsSubmitting(false);
        return;
      }

      // Submit application
      await providerApplicationService.submitApplication({
        business_name: businessName,
        contact_person: contactPerson,
        email,
        phone,
        category_id: categoryId,
        city,
        website,
        description,
        submitted_by: user?.id || null,
      });

      setNotice('✓ Prijava je bila uspešno poslana! V kratkem te bomo kontaktirali.');
      (event.target as HTMLFormElement).reset();
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prišlo je do napake. Poskusi znova.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    setNotice('To je predstavitveni obrazec. Podatki niso bili poslani ali shranjeni.');
    setIsSubmitting(false);
  }

  if (page === 'become-provider') {
    return (
      <section className="info-page provider-signup-page">
        <div className="container info-layout">
          <div className="info-copy">
            <span className="eyebrow"><Store size={14} /> Za ponudnike</span>
            <h1>Naj te najdejo ljudje, ki načrtujejo nekaj posebnega.</h1>
            <p>
              Događiva nastaja kot prostor za povezovanje organizatorjev dogodkov
              s ponudniki po Sloveniji. Prvi korak je predstavitev tvoje storitve.
            </p>
            <div className="benefit-list">
              <span><CheckCircle2 size={18} /> Predstavi svoje storitve in območje delovanja</span>
              <span><CheckCircle2 size={18} /> Pokaži fotografije in okvirne cene</span>
              <span><CheckCircle2 size={18} /> Začni pogovor z bodočimi strankami</span>
            </div>
          </div>
          <div className="inquiry-card provider-lead-card">
            <span className="eyebrow">Izrazi zanimanje</span>
            <h2>Predstavi svojo storitev</h2>
            <form className="inquiry-form" onSubmit={handleProviderSubmit}>
              <label>
                Ime podjetja ali dejavnosti
                <input name="business" minLength={2} required />
              </label>
              <label>
                Kontaktna oseba
                <input name="contact" autoComplete="name" minLength={2} required />
              </label>
              <label>
                E-naslov
                <input type="email" name="email" autoComplete="email" required />
              </label>
              <label>
                Telefonska številka
                <input type="tel" name="phone" required />
              </label>
              <label>
                Mesto
                <input name="city" minLength={2} required />
              </label>
              <label>
                Kategorija dejavnosti
                <select name="category" required defaultValue="">
                  <option value="" disabled>Izberi kategorijo</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Spletna stran (opciono)
                <input type="url" name="website" placeholder="https://..." />
              </label>
              <label>
                Kratek opis dejavnosti (opciono)
                <textarea name="description" rows={3} placeholder="Kaj te naredi edinstvene?" />
              </label>
              <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Pošiljam prijavo…' : 'Oddaj zanimanje'} <ArrowRight size={16} />
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
          <p>Za vprašanja o platformi uporabi spodnji obrazec. V tej predstavitveni različici sporočilo ni poslano.</p>
          <div className="inquiry-card contact-card">
            <h2>Pošlji sporočilo</h2>
            <form className="inquiry-form" onSubmit={handleContactSubmit}>
              <label>Tvoj e-naslov<input type="email" name="email" required /></label>
              <label>Zadeva<input name="subject" minLength={3} required /></label>
              <label>Sporočilo<textarea name="message" minLength={10} maxLength={1200} required /></label>
              <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Pripravljam …' : 'Pripravi sporočilo'} <ArrowRight size={16} />
              </button>
              {notice && <p className="form-notice" role="status">{notice}</p>}
              <p className="form-footnote">Predstavitveni obrazec: sporočila se ne pošiljajo.</p>
            </form>
          </div>
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
