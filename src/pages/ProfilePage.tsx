import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Heart,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../lib/seo';
import { authService } from '../services/auth';
import { categories } from '../data/categories';
import { favoriteService, inquiryService, marketplaceService } from '../services/database';
import { storageService } from '../services/storage';
import type { Database } from '../types/supabase';

type TabId = 'details' | 'requests' | 'inquiries' | 'favorites' | 'security';
type InquiryStatus = Database['public']['Tables']['inquiries']['Row']['status'];

type InquiryWithProvider = Database['public']['Tables']['inquiries']['Row'] & {
  provider_profiles: {
    business_name: string;
    slug: string;
    city: string | null;
    provider_services: { categories: { name: string } | null }[];
  } | null;
};

type FavoriteProvider = Database['public']['Tables']['provider_profiles']['Row'] & {
  provider_services: { categories: { name: string } | null }[];
  provider_gallery: { image_url: string; display_order: number }[];
};

type MarketplaceOffer = Database['public']['Tables']['marketplace_offers']['Row'] & {
  provider_profiles: Pick<
    Database['public']['Tables']['provider_profiles']['Row'],
    'id' | 'business_name' | 'slug' | 'city' | 'email' | 'phone'
  > | null;
};

type MarketplaceRequest = Database['public']['Tables']['marketplace_requests']['Row'] & {
  marketplace_offers: MarketplaceOffer[];
  marketplace_messages: (Database['public']['Tables']['marketplace_messages']['Row'] & {
    provider_profiles: MarketplaceOffer['provider_profiles'];
  })[];
};

const tabs: { id: TabId; label: string; icon: typeof CircleUserRound }[] = [
  { id: 'details', label: 'Osebni podatki in dogodek', icon: CircleUserRound },
  { id: 'requests', label: 'Objavljena povpraševanja', icon: Plus },
  { id: 'inquiries', label: 'Moja povpraševanja', icon: MessageSquareText },
  { id: 'favorites', label: 'Priljubljeni ponudniki', icon: Heart },
  { id: 'security', label: 'Varnost in nastavitve', icon: ShieldCheck },
];

const eventTypes = ['Poroka', 'Rojstni dan', 'Maturantski ples', 'Poslovni dogodek', 'Drugo'];

const statusLabels: Record<InquiryStatus, string> = {
  pending: 'Poslano',
  contacted: 'V obravnavi',
  accepted: 'Sprejeto',
  rejected: 'Zavrnjeno',
  completed: 'Zaključeno',
  cancelled: 'Preklicano',
};

const formatDate = (value: string | null, fallback = 'Ni določeno') =>
  value
    ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('sl-SI', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : fallback;

function getInitials(firstName: string, lastName: string, email: string) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();
  return initials || email.slice(0, 2).toUpperCase();
}

function displayValue(value: string | null | undefined) {
  return value?.trim() || 'Ni vneseno';
}

export default function ProfilePage() {
  usePageMeta('Moj profil', 'Upravljaj svoj profil, dogodek, povpraševanja in priljubljene ponudnike.');

  const navigate = useNavigate();
  const { user, profile, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [inquiries, setInquiries] = useState<InquiryWithProvider[]>([]);
  const [favorites, setFavorites] = useState<FavoriteProvider[]>([]);
  const [marketplaceRequests, setMarketplaceRequests] = useState<MarketplaceRequest[]>([]);
  const [requestForm, setRequestForm] = useState({
    title: '',
    eventType: '',
    eventDate: '',
    location: '',
    guestCount: '',
    budgetMin: '',
    budgetMax: '',
    description: '',
    categoryIds: [] as string[],
  });
  const [requestMessages, setRequestMessages] = useState<Record<string, Database['public']['Tables']['marketplace_messages']['Row'][]>>({});
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: 'Slovenija',
  });
  const [eventData, setEventData] = useState({
    eventType: '',
    eventDate: '',
    guestCount: '',
    budget: '',
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!profile || !user) return;
    setFormData({
      firstName: profile.first_name ?? '',
      lastName: profile.last_name ?? '',
      email: user.email ?? profile.email ?? '',
      phone: profile.phone ?? '',
      city: profile.city ?? '',
      country: profile.country || 'Slovenija',
    });
    setEventData({
      eventType: profile.upcoming_event?.event_type ?? '',
      eventDate: profile.upcoming_event?.event_date ?? '',
      guestCount: profile.upcoming_event?.guest_count?.toString() ?? '',
      budget: profile.upcoming_event?.budget?.toString() ?? '',
    });
    setEmailNotifications(profile.email_notifications ?? true);
    setAvatarUrl(profile.avatar_url ?? '');
    setRequestForm((current) => ({
      ...current,
      eventType: current.eventType || profile.upcoming_event?.event_type || '',
      eventDate: current.eventDate || profile.upcoming_event?.event_date || '',
      location: current.location || profile.city || '',
      guestCount: current.guestCount || profile.upcoming_event?.guest_count?.toString() || '',
      budgetMax: current.budgetMax || profile.upcoming_event?.budget?.toString() || '',
    }));
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsLoadingData(true);
    setError('');

    Promise.all([
      inquiryService.getCustomerInquiries(user.id),
      favoriteService.getUserFavorites(user.id),
      marketplaceService.getCustomerRequests(user.id),
    ])
      .then(([inquiryRows, favoriteRows, requestRows]) => {
        if (cancelled) return;
        setInquiries((inquiryRows ?? []) as InquiryWithProvider[]);
        setFavorites((favoriteRows ?? []).map((provider) => provider as FavoriteProvider));
        setMarketplaceRequests(requestRows as MarketplaceRequest[]);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Podatkov profila ni bilo mogoče naložiti.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const activeInquiries = useMemo(
    () => inquiries.filter((item) => ['pending', 'contacted', 'accepted'].includes(item.status)).length,
    [inquiries],
  );

  const showSuccess = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 3500);
  };

  if (loading) {
    return (
      <section className="account-page">
        <div className="container account-loading">Nalagam profil …</div>
      </section>
    );
  }

  if (!user || !profile) {
    return (
      <section className="account-page">
        <div className="container account-empty">
          <CircleUserRound size={34} />
          <h1>Za ogled profila se prijavi</h1>
          <p>Prijava ti omogoči shranjevanje dogodka, povpraševanj in priljubljenih ponudnikov.</p>
          <button className="button button-primary" onClick={() => navigate('/prijava?redirect=/profil')}>
            Pojdi na prijavo
          </button>
        </div>
      </section>
    );
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleEventChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setEventData((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');
    try {
      const url = await storageService.uploadAvatar(user.id, file);
      await authService.updateProfile(user.id, { avatar_url: url });
      setAvatarUrl(url);
      showSuccess('Profilna slika je bila posodobljena.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Nalaganje slike ni uspelo.');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await authService.updateProfile(user.id, {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country,
      });
      setIsEditing(false);
      showSuccess('Osebni podatki so shranjeni.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Profila ni bilo mogoče posodobiti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await authService.updateProfile(user.id, {
        upcoming_event: {
          event_type: eventData.eventType,
          event_date: eventData.eventDate,
          guest_count: eventData.guestCount ? Number(eventData.guestCount) : null,
          budget: eventData.budget ? Number(eventData.budget) : null,
        },
      });
      showSuccess('Podatki dogodka so shranjeni.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Podatkov dogodka ni bilo mogoče shraniti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationsChange = async (enabled: boolean) => {
    setEmailNotifications(enabled);
    setError('');
    try {
      await authService.updateProfile(user.id, { email_notifications: enabled });
      showSuccess(enabled ? 'E-poštna obvestila so vklopljena.' : 'E-poštna obvestila so izklopljena.');
    } catch (updateError) {
      setEmailNotifications(!enabled);
      setError(updateError instanceof Error ? updateError.message : 'Nastavitve ni bilo mogoče shraniti.');
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Gesli se ne ujemata.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword('', passwordForm.newPassword);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      showSuccess('Geslo je bilo uspešno spremenjeno.');
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : 'Gesla ni bilo mogoče spremeniti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFavorite = async (providerId: string) => {
    setError('');
    try {
      await favoriteService.toggle(user.id, providerId);
      setFavorites((current) => current.filter((provider) => provider.id !== providerId));
      showSuccess('Ponudnik je odstranjen iz priljubljenih.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Ponudnika ni bilo mogoče odstraniti.');
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      navigate('/');
    } catch {
      setError('Odjava ni uspela. Poskusi znova.');
    }
  };

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const created = await marketplaceService.createRequest({
        customer_id: user.id,
        title: requestForm.title.trim(),
        event_type: requestForm.eventType,
        event_date: requestForm.eventDate || null,
        location: requestForm.location.trim(),
        guest_count: requestForm.guestCount ? Number(requestForm.guestCount) : null,
        budget_min: requestForm.budgetMin ? Number(requestForm.budgetMin) : null,
        budget_max: requestForm.budgetMax ? Number(requestForm.budgetMax) : null,
        description: requestForm.description.trim(),
        category_ids: requestForm.categoryIds,
      });
      setMarketplaceRequests((current) => [{ ...created, marketplace_offers: [], marketplace_messages: [] }, ...current]);
      setRequestForm({
        title: '',
        eventType: '',
        eventDate: '',
        location: formData.city,
        guestCount: eventData.guestCount,
        budgetMin: '',
        budgetMax: eventData.budget,
        description: '',
        categoryIds: [],
      });
      showSuccess('Povpraševanje je objavljeno. Vidijo ga prijavljeni ponudniki.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Povpraševanja ni bilo mogoče objaviti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRequestCategory = (categoryId: string) => {
    setRequestForm((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((id) => id !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
  };

  const closeRequest = async (requestId: string) => {
    setError('');
    try {
      const updated = await marketplaceService.updateRequest(requestId, { status: 'closed' });
      setMarketplaceRequests((current) =>
        current.map((request) => request.id === requestId ? { ...request, status: updated.status } : request),
      );
      showSuccess('Povpraševanje je zaprto.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Povpraševanja ni bilo mogoče zapreti.');
    }
  };

  const acceptOffer = async (requestId: string, offerId: string) => {
    setError('');
    try {
      const updated = await marketplaceService.acceptOffer(offerId);
      setMarketplaceRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: updated.status,
                accepted_offer_id: updated.accepted_offer_id,
                marketplace_offers: request.marketplace_offers.map((offer) => ({
                  ...offer,
                  status: offer.id === offerId
                    ? 'accepted'
                    : offer.status === 'pending' ? 'rejected' : offer.status,
                })),
              }
            : request,
        ),
      );
      showSuccess('Ponudba je sprejeta. Kontaktni podatki ponudnika so zdaj na voljo.');
    } catch (offerError) {
      setError(offerError instanceof Error ? offerError.message : 'Ponudbe ni bilo mogoče sprejeti.');
    }
  };

  const openRequestThread = async (requestId: string, providerId: string) => {
    const key = `${requestId}:${providerId}`;
    setError('');
    try {
      const messages = await marketplaceService.getMessages(requestId, providerId);
      setRequestMessages((current) => ({ ...current, [key]: messages }));
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : 'Sporočil ni bilo mogoče naložiti.');
    }
  };

  const sendRequestMessage = async (event: FormEvent<HTMLFormElement>, requestId: string, providerId: string) => {
    event.preventDefault();
    const key = `${requestId}:${providerId}`;
    const message = messageDrafts[key]?.trim();
    if (!message) return;

    setError('');
    try {
      const created = await marketplaceService.sendMessage({
        requestId,
        providerId,
        senderId: user.id,
        message,
      });
      setRequestMessages((current) => ({
        ...current,
        [key]: [...(current[key] ?? []), created],
      }));
      setMessageDrafts((current) => ({ ...current, [key]: '' }));
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : 'Sporočila ni bilo mogoče poslati.');
    }
  };

  const renderDetailsTab = () => (
    <div className="account-tab-panel">
      <div className="account-heading">
        <div>
          <span className="account-kicker">Tvoj osebni center</span>
          <h1>Pozdravljen/a, {formData.firstName || 'organizator/ka'}.</h1>
          <p>Na enem mestu upravljaj svoje podatke in pripravi prihajajoči dogodek.</p>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card-header">
          <div>
            <span className="account-card-icon"><CircleUserRound size={19} /></span>
            <div>
              <h2>Osebni podatki</h2>
              <p>Podatki, ki ti bodo pomagali hitreje stopiti v stik s ponudniki.</p>
            </div>
          </div>
          {!isEditing && (
            <button className="button button-secondary button-small" onClick={() => setIsEditing(true)}>
              <Pencil size={14} /> Uredi
            </button>
          )}
        </div>

        {isEditing ? (
          <form className="account-form" onSubmit={handleProfileSubmit}>
            <div className="account-form-grid">
              <label>Ime<input name="firstName" value={formData.firstName} onChange={handleInputChange} minLength={2} required /></label>
              <label>Priimek<input name="lastName" value={formData.lastName} onChange={handleInputChange} minLength={2} required /></label>
              <label className="account-form-wide">E-naslov
                <input type="email" value={formData.email} disabled />
                <small>Za spremembo e-naslova kontaktiraj podporo Dogodiva.</small>
              </label>
              <label>Telefonska številka
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Npr. +386 40 123 456" />
              </label>
              <label>Mesto / regija
                <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Npr. Ljubljana ali Gorenjska" />
              </label>
              <label>Država
                <select name="country" value={formData.country} onChange={handleInputChange}>
                  <option>Slovenija</option>
                  <option>Hrvaška</option>
                  <option>Avstrija</option>
                  <option>Italija</option>
                  <option>Drugo</option>
                </select>
              </label>
            </div>
            <div className="account-form-actions">
              <button className="button button-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Shranjujem …' : 'Shrani osebne podatke'}
              </button>
              <button className="button button-secondary" type="button" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Prekliči</button>
            </div>
          </form>
        ) : (
          <div className="account-details-grid">
            <div><span>Ime in priimek</span><strong>{displayValue(`${formData.firstName} ${formData.lastName}`)}</strong></div>
            <div><span>E-naslov</span><strong>{displayValue(formData.email)}</strong></div>
            <div><span>Telefonska številka</span><strong className={!formData.phone ? 'is-empty' : ''}>{displayValue(formData.phone)}</strong></div>
            <div><span>Mesto / regija</span><strong className={!formData.city ? 'is-empty' : ''}>{displayValue(formData.city)}</strong></div>
            <div><span>Država</span><strong>{displayValue(formData.country)}</strong></div>
          </div>
        )}
      </div>

      <div className="account-card account-event-card">
        <div className="account-card-header">
          <div>
            <span className="account-card-icon account-card-icon-warm"><CalendarDays size={19} /></span>
            <div>
              <h2>Moj prihajajoči dogodek</h2>
              <p>Ti podatki se lahko samodejno uporabijo za hitrejše pošiljanje povpraševanj ponudnikom.</p>
            </div>
          </div>
        </div>
        <form className="account-form" onSubmit={handleEventSubmit}>
          <div className="account-form-grid account-event-grid">
            <label>Vrsta dogodka
              <select name="eventType" value={eventData.eventType} onChange={handleEventChange}>
                <option value="">Izberi vrsto dogodka</option>
                {eventTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>Predviden datum dogodka
              <input type="date" name="eventDate" value={eventData.eventDate} onChange={handleEventChange} />
            </label>
            <label><span className="account-label-icon"><UsersRound size={14} /> Število gostov</span>
              <input type="number" name="guestCount" min="1" value={eventData.guestCount} onChange={handleEventChange} placeholder="Npr. 100" />
            </label>
            <label><span className="account-label-icon"><WalletCards size={14} /> Predviden proračun</span>
              <input type="number" name="budget" min="0" step="50" value={eventData.budget} onChange={handleEventChange} placeholder="Znesek v EUR" />
            </label>
          </div>
          <button className="button button-primary account-event-save" type="submit" disabled={isSubmitting}>
            <CalendarDays size={16} /> {isSubmitting ? 'Shranjujem …' : 'Shrani podatke dogodka'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="account-tab-panel">
      <div className="account-heading">
        <div>
          <span className="account-kicker">Naj te ponudniki najdejo</span>
          <h1>Objavljena povpraševanja</h1>
          <p>Objavi, kaj potrebuješ. Povpraševanje je vidno prijavljenim ponudnikom, tvoji kontaktni podatki pa ostanejo skriti do sprejema ponudbe.</p>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card-header">
          <div>
            <span className="account-card-icon"><Plus size={19} /></span>
            <div>
              <h2>Novo javno povpraševanje</h2>
              <p>Osnovni podatki naj bodo dovolj konkretni za kakovostne ponudbe.</p>
            </div>
          </div>
        </div>
        <form className="account-form" onSubmit={handleRequestSubmit}>
          <div className="account-form-grid">
            <label className="account-form-wide">Naslov povpraševanja
              <input value={requestForm.title} required minLength={5} onChange={(event) => setRequestForm((current) => ({ ...current, title: event.target.value }))} placeholder="Npr. Fotografa za poroko julija 2027" />
            </label>
            <label>Vrsta dogodka
              <select value={requestForm.eventType} required onChange={(event) => setRequestForm((current) => ({ ...current, eventType: event.target.value }))}>
                <option value="">Izberi vrsto dogodka</option>
                {eventTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>Datum dogodka
              <input type="date" value={requestForm.eventDate} onChange={(event) => setRequestForm((current) => ({ ...current, eventDate: event.target.value }))} />
            </label>
            <label>Lokacija
              <input value={requestForm.location} required minLength={2} onChange={(event) => setRequestForm((current) => ({ ...current, location: event.target.value }))} placeholder="Mesto ali regija" />
            </label>
            <label>Število gostov
              <input type="number" min="1" value={requestForm.guestCount} onChange={(event) => setRequestForm((current) => ({ ...current, guestCount: event.target.value }))} placeholder="Npr. 80" />
            </label>
            <label>Proračun od (€)
              <input type="number" min="0" value={requestForm.budgetMin} onChange={(event) => setRequestForm((current) => ({ ...current, budgetMin: event.target.value }))} placeholder="Ni obvezno" />
            </label>
            <label>Proračun do (€)
              <input type="number" min={requestForm.budgetMin || '0'} value={requestForm.budgetMax} onChange={(event) => setRequestForm((current) => ({ ...current, budgetMax: event.target.value }))} placeholder="Npr. 2500" />
            </label>
            <fieldset className="account-category-picker account-form-wide">
              <legend>Kategorije ponudnikov</legend>
              <div>
                {categories.map((category) => (
                  <label key={category.id}>
                    <input
                      type="checkbox"
                      checked={requestForm.categoryIds.includes(category.id)}
                      onChange={() => toggleRequestCategory(category.id)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="account-form-wide">Kaj potrebuješ?
              <textarea
                value={requestForm.description}
                required
                minLength={20}
                maxLength={2000}
                rows={5}
                onChange={(event) => setRequestForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Opiši storitev, želeni slog, urnik in vse, kar bodo ponudniki potrebovali za pripravo ponudbe."
              />
            </label>
          </div>
          <button className="button button-primary account-event-save" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Objavljam …' : 'Objavi povpraševanje'} <ChevronRight size={15} />
          </button>
        </form>
      </div>

      {marketplaceRequests.length > 0 && (
        <div className="account-marketplace-list">
          <h2>Tvoja objavljena povpraševanja</h2>
          {marketplaceRequests.map((request) => (
            <article className="account-marketplace-request" key={request.id}>
              <div className="account-request-head">
                <div>
                  <span className="account-inquiry-category">{request.event_type}</span>
                  <h3>{request.title}</h3>
                  <p>{request.location} · {formatDate(request.event_date, 'Datum po dogovoru')} · {request.guest_count ? `${request.guest_count} gostov` : 'Število gostov po dogovoru'}</p>
                </div>
                <span className={`account-status ${request.status === 'open' ? 'account-status-pending' : 'account-status-accepted'}`}>
                  {request.status === 'open' ? 'Objavljeno' : 'Zaprto'}
                </span>
              </div>
              <p className="account-request-description">{request.description}</p>
              <div className="account-request-meta">
                <span>{request.marketplace_offers.length} {request.marketplace_offers.length === 1 ? 'ponudba' : 'ponudb'}</span>
                <span>{request.budget_max ? `Proračun do ${request.budget_max.toLocaleString('sl-SI')} €` : 'Proračun po dogovoru'}</span>
                {request.status === 'open' && <button type="button" onClick={() => closeRequest(request.id)}>Zapri povpraševanje</button>}
              </div>
              <div className="account-offers">
                {[...new Map(
                  request.marketplace_messages.map((message) => [
                    message.provider_id,
                    message.provider_profiles,
                  ]),
                ).entries()]
                  .filter(([providerId]) => !request.marketplace_offers.some((offer) => offer.provider_id === providerId))
                  .map(([providerId, provider]) => {
                    const threadKey = `${request.id}:${providerId}`;
                    const messages = requestMessages[threadKey] ?? request.marketplace_messages.filter(
                      (message) => message.provider_id === providerId,
                    );
                    return (
                      <div className="account-offer" key={providerId}>
                        <div className="account-offer-head">
                          <div>
                            <strong>{provider?.business_name || 'Ponudnik'}</strong>
                            <span>{provider?.city || 'Lokacija po dogovoru'}</span>
                          </div>
                          <span className="account-status account-status-contacted">Novo sporočilo</span>
                        </div>
                        <p> {messages[messages.length - 1]?.message || 'Ponudnik te želi kontaktirati.'}</p>
                        <div className="account-offer-actions">
                          <button className="button button-secondary button-small" type="button" onClick={() => openRequestThread(request.id, providerId)}>
                            <MessageSquareText size={14} /> Odpri pogovor
                          </button>
                          {provider?.slug && <Link className="text-link" to={`/ponudnik/${provider.slug}`}>Profil ponudnika</Link>}
                        </div>
                        {requestMessages[threadKey] && (
                          <div className="account-thread">
                            <div className="account-thread-list">
                              {requestMessages[threadKey].map((message) => (
                                <div className={message.sender_id === user.id ? 'is-own' : ''} key={message.id}>
                                  <span>{message.sender_id === user.id ? 'Ti' : provider?.business_name || 'Ponudnik'}</span>
                                  <p>{message.message}</p>
                                </div>
                              ))}
                            </div>
                            <form onSubmit={(event) => sendRequestMessage(event, request.id, providerId)}>
                              <input value={messageDrafts[threadKey] || ''} onChange={(event) => setMessageDrafts((current) => ({ ...current, [threadKey]: event.target.value }))} placeholder="Odgovori ponudniku …" required />
                              <button type="submit" className="button button-primary button-small">Pošlji</button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {request.marketplace_offers.map((offer) => {
                  const provider = offer.provider_profiles;
                  const threadKey = `${request.id}:${offer.provider_id}`;
                  const messages = requestMessages[threadKey];
                  return (
                    <div className="account-offer" key={offer.id}>
                      <div className="account-offer-head">
                        <div>
                          <strong>{provider?.business_name || 'Ponudnik'}</strong>
                          <span>{provider?.city || 'Lokacija po dogovoru'} · {offer.price ? `${offer.price.toLocaleString('sl-SI')} €` : 'Cena po dogovoru'}</span>
                        </div>
                        <span className={`account-status account-status-${offer.status === 'accepted' ? 'accepted' : offer.status === 'rejected' ? 'rejected' : 'contacted'}`}>
                          {offer.status === 'pending' ? 'Nova ponudba' : offer.status === 'accepted' ? 'Sprejeto' : offer.status === 'withdrawn' ? 'Umik' : 'Zavrnjeno'}
                        </span>
                      </div>
                      <p>{offer.message}</p>
                      {offer.status === 'accepted' && provider && (
                        <div className="account-revealed-contact">
                          Kontaktni podatki: <strong>{provider.email || 'E-naslov ni naveden'}</strong>{provider.phone ? ` · ${provider.phone}` : ''}
                        </div>
                      )}
                      <div className="account-offer-actions">
                        <button className="button button-secondary button-small" type="button" onClick={() => openRequestThread(request.id, offer.provider_id)}>
                          <MessageSquareText size={14} /> Sporočila
                        </button>
                        {request.status === 'open' && offer.status === 'pending' && (
                          <button className="button button-primary button-small" type="button" onClick={() => acceptOffer(request.id, offer.id)}>
                            Sprejmi ponudbo
                          </button>
                        )}
                        {provider?.slug && <Link className="text-link" to={`/ponudnik/${provider.slug}`}>Profil ponudnika</Link>}
                      </div>
                      {messages && (
                        <div className="account-thread">
                          <div className="account-thread-list">
                            {messages.length === 0 && <p>Začnite pogovor s ponudnikom.</p>}
                            {messages.map((message) => (
                              <div className={message.sender_id === user.id ? 'is-own' : ''} key={message.id}>
                                <span>{message.sender_id === user.id ? 'Ti' : provider?.business_name || 'Ponudnik'}</span>
                                <p>{message.message}</p>
                              </div>
                            ))}
                          </div>
                          <form onSubmit={(event) => sendRequestMessage(event, request.id, offer.provider_id)}>
                            <input value={messageDrafts[threadKey] || ''} onChange={(event) => setMessageDrafts((current) => ({ ...current, [threadKey]: event.target.value }))} placeholder="Napiši sporočilo ponudniku …" required />
                            <button type="submit" className="button button-primary button-small">Pošlji</button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  const renderInquiriesTab = () => (
    <div className="account-tab-panel">
      <div className="account-heading">
        <div>
          <span className="account-kicker">Komunikacija s ponudniki</span>
          <h1>Moja povpraševanja</h1>
          <p>Spremljaj, kaj si poslal/a in v kateri fazi so tvoja povpraševanja.</p>
        </div>
        <Link className="button button-primary button-small" to="/ponudniki"><Search size={15} /> Razišči ponudnike</Link>
      </div>

      {isLoadingData ? (
        <div className="account-card account-inline-state">Nalagam povpraševanja …</div>
      ) : inquiries.length === 0 ? (
        <div className="account-card account-empty">
          <MessageSquareText size={36} />
          <h2>Še nimaš oddanih povpraševanj</h2>
          <p>Ko najdeš pravo storitev, sporočilo ponudniku najdeš tukaj.</p>
          <Link className="button button-primary" to="/ponudniki">Razišči ponudnike</Link>
        </div>
      ) : (
        <div className="account-inquiries">
          {inquiries.map((inquiry) => {
            const provider = inquiry.provider_profiles;
            const category = provider?.provider_services.find((service) => service.categories)?.categories?.name;
            return (
              <article className="account-inquiry-card" key={inquiry.id}>
                <div className="account-inquiry-top">
                  <div>
                    <span className="account-inquiry-category">{category || inquiry.event_type || 'Ponudnik dogodkov'}</span>
                    <h2>{provider?.business_name || 'Ponudnik'}</h2>
                  </div>
                  <span className={`account-status account-status-${inquiry.status}`}>{statusLabels[inquiry.status]}</span>
                </div>
                <div className="account-inquiry-details">
                  <span><CalendarDays size={15} /> {formatDate(inquiry.event_date, 'Datum dogodka še ni določen')}</span>
                  <span><MessageSquareText size={15} /> Oddano {formatDate(inquiry.created_at)}</span>
                  {provider?.city && <span><MapPin size={15} /> {provider.city}</span>}
                </div>
                {inquiry.message && <p className="account-inquiry-message">{inquiry.message}</p>}
                <div className="account-inquiry-actions">
                  <details className="account-inquiry-detail">
                    <summary>Ogled podrobnosti</summary>
                    <div>
                      <span>Število gostov: <strong>{inquiry.guest_count ?? 'Ni vneseno'}</strong></span>
                      <span>Proračun: <strong>{inquiry.budget ? `${inquiry.budget.toLocaleString('sl-SI')} €` : 'Ni vneseno'}</strong></span>
                    </div>
                  </details>
                  {provider?.slug && (
                    <Link className="button button-secondary button-small" to={`/ponudnik/${provider.slug}`}>
                      Profil ponudnika <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderFavoritesTab = () => (
    <div className="account-tab-panel">
      <div className="account-heading">
        <div>
          <span className="account-kicker">Tvoja ožja izbira</span>
          <h1>Priljubljeni ponudniki</h1>
          <p>Vse storitve, ki so ti všeč, zbrane na enem mestu.</p>
        </div>
        <Link className="button button-primary button-small" to="/ponudniki"><Search size={15} /> Odkrij ponudnike</Link>
      </div>

      {isLoadingData ? (
        <div className="account-card account-inline-state">Nalagam priljubljene ponudnike …</div>
      ) : favorites.length === 0 ? (
        <div className="account-card account-empty">
          <Heart size={36} />
          <h2>Tvoja ožja izbira je še prazna</h2>
          <p>S klikom na srce shrani ponudnike, ki ti bodo morda pomagali na dogodku.</p>
          <Link className="button button-primary" to="/ponudniki">Razišči ponudnike</Link>
        </div>
      ) : (
        <div className="account-favorites-grid">
          {favorites.map((provider) => {
            const category = provider.provider_services.find((service) => service.categories)?.categories?.name || 'Storitev za dogodke';
            const image = provider.cover_image_url ||
              [...provider.provider_gallery].sort((a, b) => a.display_order - b.display_order)[0]?.image_url;
            return (
              <article className="account-favorite-card" key={provider.id}>
                <div className="account-favorite-image">
                  {image ? <img src={image} alt={provider.business_name} /> : <span><Heart size={30} /></span>}
                  <button type="button" className="account-favorite-remove" onClick={() => removeFavorite(provider.id)} aria-label={`Odstrani ${provider.business_name} iz priljubljenih`}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="account-favorite-content">
                  <span>{category}</span>
                  <h2>{provider.business_name}</h2>
                  <p><MapPin size={14} /> {provider.city || 'Lokacija po dogovoru'}</p>
                  <div>
                    <Link className="button button-primary button-small" to={`/ponudnik/${provider.slug}`}>Pošlji povpraševanje</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="account-tab-panel">
      <div className="account-heading">
        <div>
          <span className="account-kicker">Tvoj račun</span>
          <h1>Varnost in nastavitve</h1>
          <p>Upravljaj obvestila, geslo in dostop do svojega računa.</p>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card-header">
          <div>
            <span className="account-card-icon"><Bell size={19} /></span>
            <div>
              <h2>Nastavitve obvestil</h2>
              <p>Izberi, kako želiš spremljati odzive ponudnikov.</p>
            </div>
          </div>
        </div>
        <label className="account-toggle-row">
          <span><Mail size={19} /><span><strong>E-poštna obvestila</strong><small>Obvesti me, ko ponudnik odgovori na povpraševanje.</small></span></span>
          <input type="checkbox" checked={emailNotifications} onChange={(event) => handleNotificationsChange(event.target.checked)} />
          <span className="account-toggle" aria-hidden="true" />
        </label>
      </div>

      <div className="account-card">
        <div className="account-card-header">
          <div>
            <span className="account-card-icon"><LockKeyhole size={19} /></span>
            <div>
              <h2>Varnost</h2>
              <p>Za dodatno varnost redno posodobi geslo.</p>
            </div>
          </div>
          {!showPasswordForm && <button className="button button-secondary button-small" onClick={() => setShowPasswordForm(true)}>Spremeni geslo</button>}
        </div>
        {showPasswordForm && (
          <form className="account-form account-password-form" onSubmit={handlePasswordSubmit}>
            <label>Novo geslo<input type="password" value={passwordForm.newPassword} minLength={8} required onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} placeholder="Najmanj 8 znakov" /></label>
            <label>Potrdi novo geslo<input type="password" value={passwordForm.confirmPassword} minLength={8} required onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="Ponovi novo geslo" /></label>
            <div className="account-form-actions">
              <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Spreminjam …' : 'Shrani novo geslo'}</button>
              <button className="button button-secondary" type="button" onClick={() => setShowPasswordForm(false)}>Prekliči</button>
            </div>
          </form>
        )}
      </div>

      <div className="account-card account-logout-card">
        <div>
          <span className="account-card-icon account-card-icon-danger"><LogOut size={19} /></span>
          <div>
            <h2>Odjava</h2>
            <p>Ob odjavi boš izpisan/a iz te naprave in se boš moral/a za ponovni dostop znova prijaviti.</p>
          </div>
        </div>
        <button className="button button-danger" onClick={handleLogout}><LogOut size={16} /> Odjava</button>
      </div>
    </div>
  );

  return (
    <section className="account-page">
      <div className="container account-layout">
        <aside className="account-sidebar">
          <div className="account-identity">
            <div className="account-avatar">
              {avatarUrl
                ? <img src={avatarUrl} alt={`${formData.firstName} ${formData.lastName}`} />
                : <span>{getInitials(formData.firstName, formData.lastName, formData.email)}</span>}
              <label className="account-avatar-upload" title="Naloži novo profilno sliko">
                <Upload size={15} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} />
              </label>
            </div>
            <h2>{displayValue(`${formData.firstName} ${formData.lastName}`)}</h2>
            <p>{formData.email}</p>
            <span>{uploadingAvatar ? 'Nalagam sliko …' : 'Uporabniški račun'}</span>
          </div>
          <nav className="account-nav" aria-label="Profilni meni">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} className={activeTab === id ? 'is-active' : ''} type="button" onClick={() => setActiveTab(id)}>
                <Icon size={18} />
                <span>{label}</span>
                {id === 'inquiries' && activeInquiries > 0 && <b>{activeInquiries}</b>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="account-main">
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          {success && <div className="alert alert-success" role="status">{success}</div>}
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'requests' && renderRequestsTab()}
          {activeTab === 'inquiries' && renderInquiriesTab()}
          {activeTab === 'favorites' && renderFavoritesTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </main>
      </div>
    </section>
  );
}
