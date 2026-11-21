import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  BadgeCheck,
  Ban,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  Inbox,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../lib/seo';
import { adminService } from '../services/adminService';
import {
  providerApplicationAdminService,
  type ProviderApplication,
} from '../services/providerApplicationService';
import type { Database } from '../types/supabase';

type TabId = 'applications' | 'providers' | 'messages';
type ApplicationStatus = 'pending' | 'approved' | 'rejected';
type ProviderWithRelations = Database['public']['Tables']['provider_profiles']['Row'] & {
  profiles: Pick<
    Database['public']['Tables']['profiles']['Row'],
    'first_name' | 'last_name' | 'email'
  > | null;
  provider_services: { categories: { name: string } | null }[];
};
type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
type ApplicationWithCategory = ProviderApplication & {
  categories: { name: string } | null;
};

const applicationStatusLabels: Record<ApplicationStatus, string> = {
  pending: 'V pregledu',
  approved: 'Odobreno',
  rejected: 'Zavrnjeno',
};

const plans = ['basic', 'premium', 'business'] as const;

const formatDate = (value: string) => new Date(value).toLocaleDateString('sl-SI', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function AdminPage() {
  usePageMeta('Skrbništvo', 'Upravljanje ponudnikov, prijav in kontaktnih sporočil.');
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('applications');
  const [applications, setApplications] = useState<ApplicationWithCategory[]>([]);
  const [providers, setProviders] = useState<ProviderWithRelations[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [rejectingApplication, setRejectingApplication] = useState<ApplicationWithCategory | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      if (!authLoading) setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    Promise.all([
      providerApplicationAdminService.getAllApplications(),
      adminService.getProviders(),
      adminService.getContactMessages(),
    ])
      .then(([applicationRows, providerRows, messageRows]) => {
        if (cancelled) return;
        setApplications(applicationRows as ApplicationWithCategory[]);
        setProviders(providerRows as ProviderWithRelations[]);
        setMessages(messageRows);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Skrbniških podatkov ni bilo mogoče naložiti.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, profile]);

  const filteredApplications = useMemo(
    () => statusFilter === 'all'
      ? applications
      : applications.filter((application) => application.status === statusFilter),
    [applications, statusFilter],
  );

  if (authLoading || loading) {
    return (
      <section className="admin-page">
        <div className="container admin-loading">Nalagam skrbniški pregled …</div>
      </section>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/404" replace />;
  }

  const notify = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 3500);
  };

  const approveApplication = async (applicationId: string) => {
    setError('');
    setWorkingId(applicationId);
    try {
      const updated = await providerApplicationAdminService.approveApplication(applicationId);
      setApplications((current) => current.map((application) =>
        application.id === applicationId ? { ...application, ...updated } : application,
      ));
      const refreshedProviders = await adminService.getProviders();
      setProviders(refreshedProviders as ProviderWithRelations[]);
      notify('Prijava je odobrena, profil ponudnika pa objavljen.');
    } catch (approvalError) {
      setError(
        approvalError instanceof Error
          ? approvalError.message
          : 'Prijave ni bilo mogoče odobriti.',
      );
    } finally {
      setWorkingId('');
    }
  };

  const rejectApplication = async () => {
    if (!rejectingApplication || rejectReason.trim().length < 3) {
      setError('Vnesite kratek razlog zavrnitve.');
      return;
    }
    setError('');
    setWorkingId(rejectingApplication.id);
    try {
      const updated = await providerApplicationAdminService.rejectApplication(
        rejectingApplication.id,
        rejectReason.trim(),
      );
      setApplications((current) => current.map((application) =>
        application.id === rejectingApplication.id ? { ...application, ...updated } : application,
      ));
      setRejectingApplication(null);
      setRejectReason('');
      notify('Prijava je bila zavrnjena.');
    } catch (rejectionError) {
      setError(
        rejectionError instanceof Error
          ? rejectionError.message
          : 'Prijave ni bilo mogoče zavrniti.',
      );
    } finally {
      setWorkingId('');
    }
  };

  const updateProvider = async (
    providerId: string,
    updates: {
      is_featured?: boolean;
      is_active?: boolean;
      subscription_plan?: ProviderWithRelations['subscription_plan'];
    },
  ) => {
    setError('');
    setWorkingId(providerId);
    try {
      const updated = await adminService.updateProvider(providerId, updates);
      setProviders((current) => current.map((provider) =>
        provider.id === providerId ? { ...provider, ...updated } : provider,
      ));
      notify('Profil ponudnika je posodobljen.');
    } catch (providerError) {
      setError(
        providerError instanceof Error
          ? providerError.message
          : 'Ponudnika ni bilo mogoče posodobiti.',
      );
    } finally {
      setWorkingId('');
    }
  };

  const resolveMessage = async (messageId: string) => {
    setError('');
    setWorkingId(messageId);
    try {
      const updated = await adminService.resolveContactMessage(messageId);
      setMessages((current) => current.map((message) =>
        message.id === messageId ? updated : message,
      ));
      notify('Sporočilo je označeno kot rešeno.');
    } catch (messageError) {
      setError(
        messageError instanceof Error
          ? messageError.message
          : 'Sporočila ni bilo mogoče posodobiti.',
      );
    } finally {
      setWorkingId('');
    }
  };

  return (
    <section className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="account-kicker"><ShieldCheck size={14} /> Nadzorna plošča</span>
            <h1>Skrbništvo</h1>
            <p>Pregled prijav, aktivnih ponudnikov in komunikacije s strankami.</p>
          </div>
          <div className="admin-header-stats">
            <span><strong>{applications.filter((item) => item.status === 'pending').length}</strong> v pregledu</span>
            <span><strong>{providers.filter((item) => item.is_active).length}</strong> aktivnih</span>
            <span><strong>{messages.filter((item) => item.status !== 'responded').length}</strong> odprtih sporočil</span>
          </div>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <nav className="admin-tabs" aria-label="Skrbniški razdelki">
          <button className={activeTab === 'applications' ? 'is-active' : ''} onClick={() => setActiveTab('applications')}>
            <Inbox size={17} /> Prijave ponudnikov
            {applications.filter((item) => item.status === 'pending').length > 0 && <b>{applications.filter((item) => item.status === 'pending').length}</b>}
          </button>
          <button className={activeTab === 'providers' ? 'is-active' : ''} onClick={() => setActiveTab('providers')}>
            <Building2 size={17} /> Aktivni ponudniki
          </button>
          <button className={activeTab === 'messages' ? 'is-active' : ''} onClick={() => setActiveTab('messages')}>
            <Mail size={17} /> Kontaktna sporočila
            {messages.filter((item) => item.status !== 'responded').length > 0 && <b>{messages.filter((item) => item.status !== 'responded').length}</b>}
          </button>
        </nav>

        {activeTab === 'applications' && (
          <div className="admin-panel">
            <div className="admin-panel-toolbar">
              <div>
                <h2>Prijave ponudnikov</h2>
                <p>Preglej vse podatke in potrdi pravico do objave profila.</p>
              </div>
              <div className="admin-filter-group" aria-label="Filter statusa prijave">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    className={statusFilter === status ? 'is-active' : ''}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'Vse' : applicationStatusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
            {filteredApplications.length === 0 ? (
              <div className="admin-empty"><Inbox size={34} /><h3>Ni prijav za izbrani filter</h3><p>Preklopi filter ali se vrni pozneje.</p></div>
            ) : (
              <div className="admin-application-list">
                {filteredApplications.map((application) => (
                  <article className="admin-application-card" key={application.id}>
                    <div className="admin-application-head">
                      <div>
                        <span className="admin-application-date">Oddano {formatDate(application.created_at)}</span>
                        <h3>{application.business_name}</h3>
                        <span className="admin-category">{application.categories?.name || 'Kategorija ni povezana'}</span>
                      </div>
                      <span className={`account-status account-status-${application.status === 'pending' ? 'pending' : application.status === 'approved' ? 'accepted' : 'rejected'}`}>
                        {applicationStatusLabels[application.status]}
                      </span>
                    </div>
                    <div className="admin-application-details">
                      <span><UserRound size={15} /><strong>Kontakt</strong>{application.contact_person}</span>
                      <span><Mail size={15} /><strong>E-naslov</strong><a href={`mailto:${application.email}`}>{application.email}</a></span>
                      <span><Phone size={15} /><strong>Telefon</strong><a href={`tel:${application.phone}`}>{application.phone}</a></span>
                      <span><MapPin size={15} /><strong>Lokacija</strong>{application.city}{application.region ? `, ${application.region}` : ''}</span>
                      <span><Building2 size={15} /><strong>Spletna povezava</strong>
                        {application.website
                          ? application.website.startsWith('http')
                            ? <a href={application.website} target="_blank" rel="noreferrer">{application.website}</a>
                            : application.website
                          : 'Ni navedeno'}
                      </span>
                    </div>
                    <div className="admin-application-description">
                      <strong>Opis storitev</strong>
                      <p>{application.description || 'Opis ni bil vnesen.'}</p>
                    </div>
                    {application.review_notes && (
                      <div className="admin-review-note">
                        <strong>Opomba ob pregledu</strong>
                        <p>{application.review_notes}</p>
                      </div>
                    )}
                    {application.status === 'pending' && (
                      <div className="admin-card-actions">
                        <button
                          className="button button-primary"
                          disabled={workingId === application.id}
                          onClick={() => approveApplication(application.id)}
                        >
                          <BadgeCheck size={16} />
                          {workingId === application.id ? 'Objavljam …' : 'Odobri in objavi profil'}
                        </button>
                        <button
                          className="button button-danger"
                          disabled={workingId === application.id}
                          onClick={() => {
                            setRejectingApplication(application);
                            setRejectReason('');
                          }}
                        >
                          <X size={16} /> Zavrni
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="admin-panel">
            <div className="admin-panel-toolbar">
              <div>
                <h2>Aktivni ponudniki</h2>
                <p>Upravljaj objavo, paket in vidnost ponudniških profilov.</p>
              </div>
            </div>
            {providers.length === 0 ? (
              <div className="admin-empty"><Building2 size={34} /><h3>Še ni objavljenih ponudnikov</h3><p>Prvi profil bo ustvarjen po odobritvi prijave.</p></div>
            ) : (
              <div className="admin-provider-table">
                <div className="admin-provider-table-head">
                  <span>Ponudnik</span><span>Paket</span><span>Izpostavitev</span><span>Status</span><span />
                </div>
                {providers.map((provider) => {
                  const categoryName = provider.provider_services.find((service) => service.categories)?.categories?.name;
                  return (
                    <div className={`admin-provider-row ${!provider.is_active ? 'is-inactive' : ''}`} key={provider.id}>
                      <div>
                        <strong>{provider.business_name}</strong>
                        <span>{categoryName || 'Brez kategorije'} · {provider.city || 'Brez lokacije'}</span>
                        <small>{provider.profiles?.email || provider.email || ''}</small>
                      </div>
                      <select
                        value={provider.subscription_plan}
                        aria-label={`Paket za ${provider.business_name}`}
                        disabled={workingId === provider.id}
                        onChange={(event) => updateProvider(provider.id, {
                          subscription_plan: event.target.value as ProviderWithRelations['subscription_plan'],
                        })}
                      >
                        {plans.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
                      </select>
                      <label className="admin-feature-toggle">
                        <input
                          type="checkbox"
                          checked={provider.is_featured}
                          disabled={workingId === provider.id}
                          onChange={(event) => updateProvider(provider.id, { is_featured: event.target.checked })}
                        />
                        <span><Star size={14} /></span>
                      </label>
                      <span className={`admin-provider-status ${provider.is_active ? 'is-active' : ''}`}>
                        {provider.is_active ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                        {provider.is_active ? 'Aktiven' : 'Deaktiviran'}
                      </span>
                      <div className="admin-provider-actions">
                        <Link to={`/ponudnik/${provider.slug}`} aria-label={`Ogled profila ${provider.business_name}`}><Eye size={16} /></Link>
                        <button
                          className={provider.is_active ? 'admin-deactivate' : ''}
                          disabled={workingId === provider.id}
                          onClick={() => updateProvider(provider.id, { is_active: !provider.is_active })}
                        >
                          {provider.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="admin-panel">
            <div className="admin-panel-toolbar">
              <div>
                <h2>Kontaktna sporočila</h2>
                <p>Odgovore spremljaj v svojem e-poštnem odjemalcu, nato označi pogovor kot rešen.</p>
              </div>
            </div>
            {messages.length === 0 ? (
              <div className="admin-empty"><Mail size={34} /><h3>Nove pošte ni</h3><p>Sporočila iz kontaktnega obrazca se bodo prikazala tukaj.</p></div>
            ) : (
              <div className="admin-message-list">
                {messages.map((message) => (
                  <article className={message.status === 'responded' ? 'is-resolved' : ''} key={message.id}>
                    <div>
                      <span className="admin-message-date">{formatDate(message.created_at)}</span>
                      <h3>{message.subject}</h3>
                      <p>{message.name} · <a href={`mailto:${message.email}`}>{message.email}</a></p>
                    </div>
                    <p className="admin-message-body">{message.message}</p>
                    <div className="admin-message-actions">
                      <span className={`account-status ${message.status === 'responded' ? 'account-status-accepted' : 'account-status-contacted'}`}>
                        {message.status === 'responded' ? 'Rešeno' : message.status === 'read' ? 'Prebrano' : 'Novo'}
                      </span>
                      {message.status !== 'responded' && (
                        <button
                          className="button button-secondary button-small"
                          disabled={workingId === message.id}
                          onClick={() => resolveMessage(message.id)}
                        >
                          <CheckCircle2 size={14} /> Označi rešeno
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {rejectingApplication && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setRejectingApplication(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="reject-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="admin-modal-close" aria-label="Zapri" onClick={() => setRejectingApplication(null)}><X size={18} /></button>
            <span className="admin-modal-icon"><Clock3 size={24} /></span>
            <h2 id="reject-title">Zavrni prijavo</h2>
            <p>{rejectingApplication.business_name} — zapisani razlog bo viden ekipi in ohranjen pri prijavi.</p>
            <label>
              Razlog zavrnitve
              <textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} minLength={3} rows={4} placeholder="Npr. Kategorija ali podatki niso izpolnjeni." autoFocus />
            </label>
            <div className="admin-modal-actions">
              <button className="button button-danger" disabled={workingId === rejectingApplication.id} onClick={rejectApplication}>
                {workingId === rejectingApplication.id ? 'Zavračam …' : 'Potrdi zavrnitev'}
              </button>
              <button className="button button-secondary" onClick={() => setRejectingApplication(null)}>Prekliči</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
