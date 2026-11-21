import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  ExternalLink,
  ImagePlus,
  LayoutList,
  Mail,
  MessageSquareText,
  Pencil,
  Plus,
  Save,
  Store,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useData';
import { usePageMeta } from '../lib/seo';
import {
  providerDashboardService,
  type ProviderDashboardData,
  type ProviderInquiry,
} from '../services/providerDashboardService';
import { storageService } from '../services/storage';
import type { Database } from '../types/supabase';

type TabId = 'overview' | 'inquiries' | 'profile' | 'content' | 'calendar';
type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row'];
type ProviderService = Database['public']['Tables']['provider_services']['Row'];
type GalleryImage = Database['public']['Tables']['provider_gallery']['Row'];
type InquiryStatus = Database['public']['Tables']['inquiries']['Row']['status'];

const regions = [
  'Osrednja Slovenija', 'Gorenjska', 'Štajerska', 'Savinjska',
  'Primorska', 'Dolenjska', 'Posavje', 'Zasavje', 'Prekmurje',
  'Koroška', 'Notranjska', 'Celotna Slovenija',
];

const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Pregled in analitika', icon: BarChart3 },
  { id: 'inquiries', label: 'Povpraševanja strank', icon: MessageSquareText },
  { id: 'profile', label: 'Urejanje javnega profila', icon: Store },
  { id: 'content', label: 'Storitve in galerija', icon: ImagePlus },
  { id: 'calendar', label: 'Koledar razpoložljivosti', icon: CalendarDays },
];

const statusOptions: { value: InquiryStatus; label: string }[] = [
  { value: 'pending', label: 'Novo' },
  { value: 'contacted', label: 'Odgovorjeno' },
  { value: 'accepted', label: 'Sprejeto' },
  { value: 'rejected', label: 'Zavrnjeno' },
];

const emptyServiceForm = {
  id: '',
  title: '',
  description: '',
  priceFrom: '',
  priceTo: '',
  priceType: 'per_event' as ProviderService['price_type'],
};

const formatDate = (value: string | null, fallback = 'Ni določeno') => value
  ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('sl-SI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  : fallback;

export default function ProviderDashboardPage() {
  usePageMeta('Nadzorna plošča ponudnika', 'Upravljanje profila, storitev, povpraševanj in razpoložljivosti.');

  const { user, profile: userProfile, loading: authLoading } = useAuth();
  const { categories } = useCategories();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [data, setData] = useState<ProviderDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    mainCategoryId: '',
    city: '',
    region: '',
    serviceAreas: [] as string[],
    description: '',
    detailedDescription: '',
    email: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
    startingPrice: '',
  });
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [galleryCaption, setGalleryCaption] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    if (!user) {
      if (!authLoading) setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    providerDashboardService.loadForUser(user.id)
      .then((dashboard) => {
        if (cancelled) return;
        setData(dashboard);
        if (dashboard) {
          const provider = dashboard.provider;
          setProfileForm({
            businessName: provider.business_name,
            mainCategoryId: provider.main_category_id ?? dashboard.services[0]?.category_id ?? '',
            city: provider.city ?? '',
            region: provider.region ?? '',
            serviceAreas: provider.service_areas ?? [],
            description: provider.description ?? '',
            detailedDescription: provider.detailed_description ?? '',
            email: provider.email ?? user.email ?? '',
            phone: provider.phone ?? '',
            website: provider.website ?? '',
            instagram: provider.instagram ?? '',
            facebook: provider.facebook ?? '',
            startingPrice: provider.starting_price?.toString() ?? '',
          });
        }
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Nadzorne plošče ni bilo mogoče naložiti.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const provider = data?.provider;
  const newInquiries = useMemo(
    () => data?.inquiries.filter((inquiry) => inquiry.status === 'pending').length ?? 0,
    [data],
  );

  if (authLoading || loading) {
    return <section className="provider-dashboard"><div className="container dashboard-loading">Nalagam ponudniško nadzorno ploščo …</div></section>;
  }

  if (!user || !userProfile || !data || !provider) {
    return <Navigate to={user ? '/postani-ponudnik' : '/prijava?redirect=/ponudnik-nadzorna-plosca'} replace />;
  }

  const notify = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 3500);
  };

  const updateProviderState = (updated: ProviderProfile) => {
    setData((current) => current ? { ...current, provider: updated } : current);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setWorking('profile');
    try {
      const updated = await providerDashboardService.updateProfile(provider.id, {
        business_name: profileForm.businessName.trim(),
        main_category_id: profileForm.mainCategoryId || null,
        city: profileForm.city.trim() || null,
        region: profileForm.region.trim() || null,
        service_areas: profileForm.serviceAreas,
        description: profileForm.description.trim() || null,
        detailed_description: profileForm.detailedDescription.trim() || null,
        email: profileForm.email.trim() || null,
        phone: profileForm.phone.trim() || null,
        website: profileForm.website.trim() || null,
        instagram: profileForm.instagram.trim() || null,
        facebook: profileForm.facebook.trim() || null,
        starting_price: profileForm.startingPrice ? Number(profileForm.startingPrice) : null,
      });
      updateProviderState(updated);
      notify('Javni profil je uspešno posodobljen.');
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'Profila ni bilo mogoče posodobiti.');
    } finally {
      setWorking('');
    }
  };

  const uploadProfileImage = async (kind: 'logo' | 'cover', file: File) => {
    setError('');
    setWorking(kind);
    try {
      const url = kind === 'logo'
        ? await storageService.uploadProviderLogo(provider.id, file)
        : await storageService.uploadProviderCover(provider.id, file);
      const updated = await providerDashboardService.updateProfile(provider.id, {
        [kind === 'logo' ? 'logo_url' : 'cover_image_url']: url,
      });
      updateProviderState(updated);
      notify(kind === 'logo' ? 'Logotip je posodobljen.' : 'Naslovna fotografija je posodobljena.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Slike ni bilo mogoče naložiti.');
    } finally {
      setWorking('');
    }
  };

  const updateInquiryStatus = async (inquiryId: string, status: InquiryStatus) => {
    setError('');
    setWorking(inquiryId);
    try {
      const updated = await providerDashboardService.updateInquiryStatus(inquiryId, status);
      setData((current) => current ? {
        ...current,
        inquiries: current.inquiries.map((inquiry) =>
          inquiry.id === inquiryId ? { ...inquiry, status: updated.status } : inquiry,
        ),
      } : current);
      notify('Status povpraševanja je posodobljen.');
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Statusa ni bilo mogoče posodobiti.');
    } finally {
      setWorking('');
    }
  };

  const copyInquiryContacts = async (inquiry: ProviderInquiry) => {
    const contactText = [
      `${inquiry.profiles?.first_name ?? ''} ${inquiry.profiles?.last_name ?? ''}`.trim() || 'Stranka',
      inquiry.profiles?.email,
      inquiry.profiles?.phone,
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(contactText);
      notify('Kontaktni podatki so kopirani.');
    } catch {
      setError('Kopiranje ni uspelo. Dovolite dostop do odložišča.');
    }
  };

  const saveService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setWorking('service');
    try {
      const saved = await providerDashboardService.saveService(serviceForm.id || null, {
        provider_id: provider.id,
        category_id: profileForm.mainCategoryId || data.services[0]?.category_id || categories[0]?.id,
        title: serviceForm.title.trim(),
        description: serviceForm.description.trim() || null,
        price_from: serviceForm.priceFrom ? Number(serviceForm.priceFrom) : null,
        price_to: serviceForm.priceTo ? Number(serviceForm.priceTo) : null,
        price_type: serviceForm.priceType,
        city: provider.city,
      });
      setData((current) => current ? {
        ...current,
        services: serviceForm.id
          ? current.services.map((service) => service.id === saved.id ? saved : service)
          : [...current.services, saved],
      } : current);
      setServiceForm(emptyServiceForm);
      notify('Storitev je shranjena.');
    } catch (serviceError) {
      setError(serviceError instanceof Error ? serviceError.message : 'Storitve ni bilo mogoče shraniti.');
    } finally {
      setWorking('');
    }
  };

  const deleteService = async (serviceId: string) => {
    setError('');
    setWorking(serviceId);
    try {
      await providerDashboardService.deleteService(serviceId);
      setData((current) => current ? {
        ...current,
        services: current.services.filter((service) => service.id !== serviceId),
      } : current);
      notify('Storitev je izbrisana.');
    } catch (serviceError) {
      setError(serviceError instanceof Error ? serviceError.message : 'Storitve ni bilo mogoče izbrisati.');
    } finally {
      setWorking('');
    }
  };

  const uploadGalleryImage = async (file: File) => {
    setError('');
    setWorking('gallery');
    try {
      const imageUrl = await storageService.uploadGalleryImage(provider.id, file);
      const saved = await providerDashboardService.saveGalleryImage({
        provider_id: provider.id,
        image_url: imageUrl,
        caption: galleryCaption.trim() || null,
        display_order: data.gallery.length,
      });
      setData((current) => current ? { ...current, gallery: [...current.gallery, saved] } : current);
      setGalleryCaption('');
      notify('Fotografija je dodana v galerijo.');
    } catch (galleryError) {
      setError(galleryError instanceof Error ? galleryError.message : 'Fotografije ni bilo mogoče naložiti.');
    } finally {
      setWorking('');
    }
  };

  const deleteGalleryImage = async (image: GalleryImage) => {
    setError('');
    setWorking(image.id);
    try {
      const path = storageService.getStoragePath(image.image_url, 'provider-gallery');
      if (path) await storageService.deleteFile('provider-gallery', path);
      await providerDashboardService.deleteGalleryImage(image.id);
      setData((current) => current ? {
        ...current,
        gallery: current.gallery.filter((item) => item.id !== image.id),
      } : current);
      notify('Fotografija je odstranjena.');
    } catch (galleryError) {
      setError(galleryError instanceof Error ? galleryError.message : 'Fotografije ni bilo mogoče izbrisati.');
    } finally {
      setWorking('');
    }
  };

  const toggleCalendarDate = async (date: string) => {
    const existing = data.unavailableDates.find((item) => item.unavailable_date === date);
    setError('');
    setWorking(date);
    try {
      const changed = await providerDashboardService.toggleUnavailableDate(provider.id, date, existing?.id);
      setData((current) => current ? {
        ...current,
        unavailableDates: changed
          ? [...current.unavailableDates, changed]
          : current.unavailableDates.filter((item) => item.id !== existing?.id),
      } : current);
    } catch (calendarError) {
      setError(calendarError instanceof Error ? calendarError.message : 'Razpoložljivosti ni bilo mogoče spremeniti.');
    } finally {
      setWorking('');
    }
  };

  const renderOverview = () => (
    <div className="dashboard-panel">
      <div className="dashboard-welcome">
        <div>
          <span className="account-kicker">Ponudniška nadzorna plošča</span>
          <h1>Pozdravljen/a, {provider.business_name}.</h1>
          <p>Preveri povpraševanja, izboljšaj profil in upravljaj razpoložljivost.</p>
          <span className="dashboard-plan">
            <Check size={14} />
            {provider.subscription_plan === 'business' ? 'Business – Ustanovni partner' : provider.subscription_plan}
          </span>
        </div>
        <a className="button button-primary" href={`/ponudnik/${provider.slug}`} target="_blank" rel="noreferrer">
          Poglej javni profil <ExternalLink size={15} />
        </a>
      </div>
      <div className="dashboard-stats">
        <article><MessageSquareText size={20} /><strong>{newInquiries}</strong><span>Nova povpraševanja</span></article>
        <article><InboxIcon /><strong>{data.inquiries.length}</strong><span>Skupaj povpraševanj</span></article>
        <article><LayoutList size={20} /><strong>{data.services.length}</strong><span>Objavljene storitve</span></article>
        <article><Camera size={20} /><strong>{data.gallery.length}</strong><span>Slike v galeriji</span></article>
      </div>
      <div className="dashboard-card">
        <div className="dashboard-card-head"><div><h2>Zadnja povpraševanja</h2><p>Odzivi se hitro in povečaš možnosti za dogovor.</p></div><button onClick={() => setActiveTab('inquiries')}>Pokaži vsa <ChevronRight size={14} /></button></div>
        {data.inquiries.length === 0 ? (
          <div className="dashboard-empty"><MessageSquareText size={31} /><h3>Še ni povpraševanj</h3><p>Nova sporočila strank bodo prikazana tukaj.</p></div>
        ) : data.inquiries.slice(0, 3).map((inquiry) => (
          <div className="dashboard-recent-inquiry" key={inquiry.id}>
            <div>
              <strong>{`${inquiry.profiles?.first_name || ''} ${inquiry.profiles?.last_name || ''}`.trim() || 'Stranka'}</strong>
              <span>{inquiry.event_type || 'Dogodek'} · {formatDate(inquiry.event_date)}</span>
            </div>
            <p>{inquiry.message || 'Stranka ni dodala sporočila.'}</p>
            <button className="button button-secondary button-small" onClick={() => setActiveTab('inquiries')}>Odpri povpraševanje</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInquiries = () => (
    <div className="dashboard-panel">
      <div className="dashboard-section-heading"><span className="account-kicker">Komunikacija</span><h1>Povpraševanja strank</h1><p>Upravljaj vse neposredne zahteve in se odzovi brez zapletov.</p></div>
      {data.inquiries.length === 0 ? (
        <div className="dashboard-card dashboard-empty"><MessageSquareText size={34} /><h2>Še ni prejetih povpraševanj</h2><p>Ko stranka pošlje povpraševanje, se pojavi na tem seznamu.</p></div>
      ) : (
        <div className="dashboard-inquiries-list">
          {data.inquiries.map((inquiry) => {
            const name = `${inquiry.profiles?.first_name || ''} ${inquiry.profiles?.last_name || ''}`.trim() || 'Stranka';
            const subject = encodeURIComponent(`Povpraševanje za ${inquiry.event_type || 'dogodek'} – ${provider.business_name}`);
            return (
              <article className="dashboard-inquiry-card" key={inquiry.id}>
                <div className="dashboard-inquiry-head">
                  <div><span>Prejeto {formatDate(inquiry.created_at)}</span><h2>{name}</h2><a href={`mailto:${inquiry.profiles?.email || ''}`}>{inquiry.profiles?.email || 'E-naslov ni na voljo'}</a></div>
                  <select value={inquiry.status} disabled={working === inquiry.id} onChange={(event) => updateInquiryStatus(inquiry.id, event.target.value as InquiryStatus)}>
                    {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div className="dashboard-inquiry-facts">
                  <span><strong>Telefon</strong>{inquiry.profiles?.phone || 'Ni vnesen'}</span>
                  <span><strong>Dogodek</strong>{inquiry.event_type || 'Ni določeno'}</span>
                  <span><strong>Datum</strong>{formatDate(inquiry.event_date)}</span>
                  <span><strong>Lokacija</strong>{inquiry.location || 'Ni določena'}</span>
                  <span><strong>Gostje</strong>{inquiry.guest_count ?? 'Ni določeno'}</span>
                  <span><strong>Proračun</strong>{inquiry.budget ? `${inquiry.budget.toLocaleString('sl-SI')} €` : 'Ni določen'}</span>
                </div>
                <div className="dashboard-inquiry-message"><strong>Sporočilo stranke</strong><p>{inquiry.message || 'Stranka ni dodala sporočila.'}</p></div>
                <div className="dashboard-inquiry-actions">
                  <a className="button button-primary button-small" href={`mailto:${inquiry.profiles?.email || ''}?subject=${subject}`}>
                    <Mail size={14} /> Odgovori po e-pošti
                  </a>
                  <button className="button button-secondary button-small" onClick={() => copyInquiryContacts(inquiry)}>
                    <ClipboardCopy size={14} /> Kopiraj kontakte
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="dashboard-panel">
      <div className="dashboard-section-heading"><span className="account-kicker">Javna predstavitev</span><h1>Urejanje javnega profila</h1><p>Podatki, ki jih stranke vidijo, ko pregledajo in primerjajo ponudnike.</p></div>
      <form className="dashboard-profile-form" onSubmit={saveProfile}>
        <div className="dashboard-card">
          <div className="dashboard-card-head"><div><h2>Osnovni podatki</h2><p>Poskrbi za jasen in dosleden prikaz podjetja.</p></div></div>
          <div className="dashboard-form-grid">
            <label>Ime podjetja<input required value={profileForm.businessName} onChange={(event) => setProfileForm((current) => ({ ...current, businessName: event.target.value }))} /></label>
            <label>Glavna kategorija<select required value={profileForm.mainCategoryId} onChange={(event) => setProfileForm((current) => ({ ...current, mainCategoryId: event.target.value }))}><option value="">Izberi kategorijo</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Mesto<input value={profileForm.city} onChange={(event) => setProfileForm((current) => ({ ...current, city: event.target.value }))} /></label>
            <label>Regija<input list="dashboard-regions" value={profileForm.region} onChange={(event) => setProfileForm((current) => ({ ...current, region: event.target.value }))} /><datalist id="dashboard-regions">{regions.map((region) => <option key={region} value={region} />)}</datalist></label>
            <fieldset className="dashboard-regions"><legend>Območje delovanja</legend><div>{regions.map((region) => <label key={region}><input type="checkbox" checked={profileForm.serviceAreas.includes(region)} onChange={() => setProfileForm((current) => ({ ...current, serviceAreas: current.serviceAreas.includes(region) ? current.serviceAreas.filter((item) => item !== region) : [...current.serviceAreas, region] }))} /><span>{region}</span></label>)}</div></fieldset>
            <label className="dashboard-form-wide">Kratek opis<textarea rows={3} maxLength={240} value={profileForm.description} onChange={(event) => setProfileForm((current) => ({ ...current, description: event.target.value }))} placeholder="En odstavek za hiter pregled profila." /></label>
            <label className="dashboard-form-wide">Podroben opis<textarea rows={7} value={profileForm.detailedDescription} onChange={(event) => setProfileForm((current) => ({ ...current, detailedDescription: event.target.value }))} placeholder="Predstavi svoje storitve, pristop in izkušnje." /></label>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-head"><div><h2>Kontakt in cene</h2><p>Kako te stranke najdejo in kontaktirajo.</p></div></div>
          <div className="dashboard-form-grid">
            <label>E-naslov<input type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} /></label>
            <label>Telefon<input type="tel" value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label>Spletna stran<input value={profileForm.website} onChange={(event) => setProfileForm((current) => ({ ...current, website: event.target.value }))} placeholder="https://…" /></label>
            <label>Instagram<input value={profileForm.instagram} onChange={(event) => setProfileForm((current) => ({ ...current, instagram: event.target.value }))} placeholder="https://instagram.com/… ali @uporabnik" /></label>
            <label>Facebook<input value={profileForm.facebook} onChange={(event) => setProfileForm((current) => ({ ...current, facebook: event.target.value }))} placeholder="https://facebook.com/…" /></label>
            <label>Začetna cena (€)<input type="number" min="0" value={profileForm.startingPrice} onChange={(event) => setProfileForm((current) => ({ ...current, startingPrice: event.target.value }))} placeholder="Npr. 450" /></label>
          </div>
        </div>
        <div className="dashboard-media-cards">
          <div className="dashboard-card dashboard-media-card">
            <div className="dashboard-media-preview">{provider.logo_url ? <img src={provider.logo_url} alt="" /> : <Store size={32} />}</div>
            <div><h2>Logotip</h2><p>Priporočeno: kvadratna PNG ali JPG fotografija.</p><label className="button button-secondary button-small"><Upload size={14} /> {working === 'logo' ? 'Nalagam …' : 'Naloži logotip'}<input type="file" accept="image/*" hidden disabled={working === 'logo'} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadProfileImage('logo', file); }} /></label></div>
          </div>
          <div className="dashboard-card dashboard-media-card">
            <div className="dashboard-media-preview is-cover">{provider.cover_image_url ? <img src={provider.cover_image_url} alt="" /> : <Camera size={32} />}</div>
            <div><h2>Naslovna fotografija</h2><p>Priporočeno: vodoravna fotografija vsaj 1600 px.</p><label className="button button-secondary button-small"><Upload size={14} /> {working === 'cover' ? 'Nalagam …' : 'Naloži fotografijo'}<input type="file" accept="image/*" hidden disabled={working === 'cover'} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadProfileImage('cover', file); }} /></label></div>
          </div>
        </div>
        <button className="button button-primary dashboard-save" type="submit" disabled={working === 'profile'}><Save size={15} /> {working === 'profile' ? 'Shranjujem …' : 'Shrani javni profil'}</button>
      </form>
    </div>
  );

  const renderContent = () => (
    <div className="dashboard-panel">
      <div className="dashboard-section-heading"><span className="account-kicker">Ponudba</span><h1>Storitve, cenik in galerija</h1><p>Predstavi konkretne pakete in izkušnje s fotografijami preteklih dogodkov.</p></div>
      <div className="dashboard-content-grid">
        <section className="dashboard-card">
          <div className="dashboard-card-head"><div><h2>Storitve in cenik</h2><p>Dodaj posamezne storitve ter njihovo ceno.</p></div></div>
          <form className="dashboard-service-form" onSubmit={saveService}>
            <label>Naziv<input required value={serviceForm.title} onChange={(event) => setServiceForm((current) => ({ ...current, title: event.target.value }))} placeholder="Npr. Celodnevno fotografiranje poroke" /></label>
            <label>Opis<textarea rows={3} value={serviceForm.description} onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))} /></label>
            <div>
              <label>Cena od (€)<input type="number" min="0" value={serviceForm.priceFrom} onChange={(event) => setServiceForm((current) => ({ ...current, priceFrom: event.target.value }))} /></label>
              <label>Cena do (€)<input type="number" min="0" value={serviceForm.priceTo} onChange={(event) => setServiceForm((current) => ({ ...current, priceTo: event.target.value }))} /></label>
              <label>Obračunavanje<select value={serviceForm.priceType} onChange={(event) => setServiceForm((current) => ({ ...current, priceType: event.target.value as ProviderService['price_type'] }))}><option value="per_event">Na dogodek</option><option value="per_hour">Na uro</option><option value="per_person">Na osebo</option></select></label>
            </div>
            <div className="dashboard-service-actions">
              <button className="button button-primary button-small" type="submit" disabled={working === 'service'}><Plus size={14} /> {serviceForm.id ? 'Shrani spremembe' : 'Dodaj storitev'}</button>
              {serviceForm.id && <button className="button button-secondary button-small" type="button" onClick={() => setServiceForm(emptyServiceForm)}>Prekliči urejanje</button>}
            </div>
          </form>
          <div className="dashboard-services-list">
            {data.services.length === 0 && <p>Še ni objavljenih storitev.</p>}
            {data.services.map((service) => (
              <article key={service.id}>
                <div><strong>{service.title}</strong><span>{service.price_from ? `${service.price_from.toLocaleString('sl-SI')} €` : 'Cena po dogovoru'}{service.price_to ? ` – ${service.price_to.toLocaleString('sl-SI')} €` : ''} · {service.price_type === 'per_hour' ? 'na uro' : service.price_type === 'per_person' ? 'na osebo' : 'na dogodek'}</span><p>{service.description}</p></div>
                <div><button aria-label={`Uredi ${service.title}`} onClick={() => setServiceForm({ id: service.id, title: service.title, description: service.description || '', priceFrom: service.price_from?.toString() || '', priceTo: service.price_to?.toString() || '', priceType: service.price_type })}><Pencil size={14} /></button><button aria-label={`Izbriši ${service.title}`} disabled={working === service.id} onClick={() => deleteService(service.id)}><Trash2 size={14} /></button></div>
              </article>
            ))}
          </div>
        </section>
        <section className="dashboard-card">
          <div className="dashboard-card-head"><div><h2>Galerija del</h2><p>Naloži fotografije in dodaj kratek opis.</p></div></div>
          <div className="dashboard-gallery-upload">
            <label>Opis fotografije<input value={galleryCaption} onChange={(event) => setGalleryCaption(event.target.value)} maxLength={160} placeholder="Npr. Poroka v Ljubljani, poletje 2026" /></label>
            <label className="dashboard-gallery-drop"><ImagePlus size={23} /><strong>{working === 'gallery' ? 'Nalagam fotografijo …' : 'Dodaj fotografijo'}</strong><span>JPG, PNG ali WebP</span><input type="file" accept="image/*" hidden disabled={working === 'gallery'} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadGalleryImage(file); }} /></label>
          </div>
          <div className="dashboard-gallery-grid">
            {data.gallery.map((image) => <article key={image.id}><img src={image.image_url} alt={image.caption || provider.business_name} /><div><p>{image.caption || 'Brez opisa'}</p><button aria-label="Izbriši fotografijo" disabled={working === image.id} onClick={() => deleteGalleryImage(image)}><Trash2 size={14} /></button></div></article>)}
          </div>
        </section>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const unavailable = new Map(data.unavailableDates.map((item) => [item.unavailable_date, item]));
    return (
      <div className="dashboard-panel">
        <div className="dashboard-section-heading"><span className="account-kicker">Razpoložljivost</span><h1>Koledar razpoložljivosti</h1><p>Klikni datum, da ga označiš kot zaseden. Ponovljen klik ga sprosti.</p></div>
        <div className="dashboard-card dashboard-calendar-card">
          <div className="dashboard-calendar-header">
            <button aria-label="Prejšnji mesec" onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}><ChevronLeft size={17} /></button>
            <h2>{calendarMonth.toLocaleDateString('sl-SI', { month: 'long', year: 'numeric' })}</h2>
            <button aria-label="Naslednji mesec" onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}><ChevronRight size={17} /></button>
          </div>
          <div className="dashboard-calendar-weekdays">{['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="dashboard-calendar-grid">
            {Array.from({ length: firstDay }, (_, index) => <span className="is-blank" key={`blank-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const blocked = unavailable.has(isoDate);
              const isPast = new Date(`${isoDate}T23:59:59`) < new Date();
              return <button className={blocked ? 'is-unavailable' : ''} key={isoDate} type="button" disabled={isPast || working === isoDate} onClick={() => toggleCalendarDate(isoDate)}><span>{day}</span><small>{blocked ? 'Zaseden' : 'Prosto'}</small></button>;
            })}
          </div>
          <div className="dashboard-calendar-legend"><span><i /> Prosto</span><span><i className="is-busy" /> Zasedeno</span><small>Preteklih datumov ni mogoče urejati.</small></div>
        </div>
      </div>
    );
  };

  return (
    <section className="provider-dashboard">
      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-identity">
            <span>{provider.logo_url ? <img src={provider.logo_url} alt="" /> : <Store size={25} />}</span>
            <div><strong>{provider.business_name}</strong><small>Nadzorna plošča ponudnika</small></div>
          </div>
          <nav aria-label="Nadzorna plošča ponudnika">
            {tabs.map(({ id, label, icon: Icon }) => <button className={activeTab === id ? 'is-active' : ''} key={id} onClick={() => setActiveTab(id)}><Icon size={17} /><span>{label}</span>{id === 'inquiries' && newInquiries > 0 && <b>{newInquiries}</b>}</button>)}
          </nav>
        </aside>
        <main className="dashboard-main">
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          {success && <div className="alert alert-success" role="status">{success}</div>}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'inquiries' && renderInquiries()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'content' && renderContent()}
          {activeTab === 'calendar' && renderCalendar()}
        </main>
      </div>
    </section>
  );
}

function InboxIcon() {
  return <UserRound size={20} />;
}
