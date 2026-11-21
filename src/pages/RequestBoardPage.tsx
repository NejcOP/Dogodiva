import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MapPin,
  MessageSquareText,
  Send,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { categories } from '../data/categories';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../lib/seo';
import { marketplaceService, providerService } from '../services/database';
import type { Database } from '../types/supabase';

type Request = Database['public']['Tables']['marketplace_requests']['Row'] & {
  marketplace_offers: Database['public']['Tables']['marketplace_offers']['Row'][];
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'first_name' | 'last_name' | 'email' | 'phone'> | null;
};

type Provider = Database['public']['Tables']['provider_profiles']['Row'];

const formatDate = (value: string | null) => value
  ? new Date(`${value}T12:00:00`).toLocaleDateString('sl-SI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  : 'Po dogovoru';

export default function RequestBoardPage() {
  usePageMeta('Povpraševanja strank', 'Oglej si odprta povpraševanja in strankam pošlji ponudbo.');

  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [messages, setMessages] = useState<Record<string, Database['public']['Tables']['marketplace_messages']['Row'][]>>({});
  const [drafts, setDrafts] = useState<Record<string, { message: string; price: string }>>({});
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [openThread, setOpenThread] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || !profile || profile.role !== 'provider') return;
    let cancelled = false;

    providerService.getByUserId(user.id)
      .then(async (providerProfile) => {
        if (cancelled || !providerProfile) return;
        setProvider(providerProfile);
        const rows = await marketplaceService.getProviderRequests(providerProfile.id);
        if (!cancelled) setRequests(rows as Request[]);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Povpraševanj ni bilo mogoče naložiti.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile, user]);

  if (loading || isLoading) {
    return (
      <section className="request-board-page">
        <div className="container request-board-loading">Nalagam povpraševanja …</div>
      </section>
    );
  }

  if (!user || !profile || profile.role !== 'provider' || !provider) {
    return (
      <section className="request-board-page">
        <div className="container request-board-empty">
          <LockKeyhole size={35} />
          <h1>Oglasna deska za ponudnike</h1>
          <p>Objavljena povpraševanja so na voljo samo prijavljenim ponudnikom z aktivnim profilom.</p>
          {!user ? (
            <button className="button button-primary" onClick={() => navigate('/prijava?redirect=/povprasevanja')}>Prijavi se</button>
          ) : (
            <Link className="button button-primary" to="/postani-ponudnik">Postani ponudnik</Link>
          )}
        </div>
      </section>
    );
  }

  const showSuccess = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 3500);
  };

  const submitOffer = async (event: FormEvent<HTMLFormElement>, requestId: string) => {
    event.preventDefault();
    const draft = drafts[requestId];
    if (!draft?.message.trim()) return;
    setError('');
    setIsSubmitting(requestId);
    try {
      const offer = await marketplaceService.createOffer({
        requestId,
        providerId: provider.id,
        message: draft.message.trim(),
        price: draft.price ? Number(draft.price) : null,
      });
      setRequests((current) => current.map((request) =>
        request.id === requestId
          ? { ...request, marketplace_offers: [...request.marketplace_offers, offer] }
          : request,
      ));
      setDrafts((current) => ({ ...current, [requestId]: { message: '', price: '' } }));
      showSuccess('Ponudba je poslana stranki.');
    } catch (offerError) {
      setError(offerError instanceof Error ? offerError.message : 'Ponudbe ni bilo mogoče poslati.');
    } finally {
      setIsSubmitting('');
    }
  };

  const loadThread = async (requestId: string) => {
    setError('');
    const key = requestId;
    if (openThread === key) {
      setOpenThread('');
      return;
    }
    try {
      const rows = await marketplaceService.getMessages(requestId, provider.id);
      setMessages((current) => ({ ...current, [key]: rows }));
      setOpenThread(key);
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : 'Sporočil ni bilo mogoče naložiti.');
    }
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>, requestId: string) => {
    event.preventDefault();
    const message = messageDrafts[requestId]?.trim();
    if (!message) return;
    setError('');
    try {
      const created = await marketplaceService.sendMessage({
        requestId,
        providerId: provider.id,
        senderId: user.id,
        message,
      });
      setMessages((current) => ({
        ...current,
        [requestId]: [...(current[requestId] ?? []), created],
      }));
      setMessageDrafts((current) => ({ ...current, [requestId]: '' }));
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : 'Sporočila ni bilo mogoče poslati.');
    }
  };

  const openRequests = requests.filter((request) => request.status === 'open');

  return (
    <section className="request-board-page">
      <div className="container">
        <div className="request-board-heading">
          <div>
            <span className="account-kicker">Priložnosti za ponudnike</span>
            <h1>Povpraševanja strank</h1>
            <p>Oglej si opis dogodka, stranki postavi vprašanje ali ji pripravi prilagojeno ponudbo. Kontaktni podatki se razkrijejo šele po njenem sprejemu ponudbe.</p>
          </div>
          <div className="request-board-counter">
            <strong>{openRequests.length}</strong>
            <span>odprtih povpraševanj</span>
          </div>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        {requests.length === 0 ? (
          <div className="account-card account-empty">
            <Clock3 size={36} />
            <h2>Trenutno ni objavljenih povpraševanj</h2>
            <p>Nova povpraševanja se bodo prikazala tukaj, ko jih bodo objavile stranke.</p>
          </div>
        ) : (
          <div className="request-board-list">
            {requests.map((request) => {
              const ownOffer = request.marketplace_offers.find((offer) => offer.provider_id === provider.id);
              const threadMessages = messages[request.id] ?? [];
              const categoryNames = request.category_ids
                .map((id) => categories.find((category) => category.id === id)?.name)
                .filter(Boolean);
              return (
                <article className="request-board-card" key={request.id}>
                  <div className="request-board-card-main">
                    <div className="request-board-card-top">
                      <div>
                        <span className="account-inquiry-category">{request.event_type}</span>
                        <h2>{request.title}</h2>
                      </div>
                      <span className={`account-status ${request.status === 'open' ? 'account-status-pending' : ownOffer?.status === 'accepted' ? 'account-status-accepted' : 'account-status-contacted'}`}>
                        {request.status === 'open' ? 'Išče ponudnika' : ownOffer?.status === 'accepted' ? 'Ponudba sprejeta' : 'Zaprto'}
                      </span>
                    </div>
                    <div className="request-board-facts">
                      <span><CalendarDays size={15} /> {formatDate(request.event_date)}</span>
                      <span><MapPin size={15} /> {request.location}</span>
                      <span><UsersRound size={15} /> {request.guest_count ? `${request.guest_count} gostov` : 'Število gostov po dogovoru'}</span>
                      <span><WalletCards size={15} /> {request.budget_max ? `do ${request.budget_max.toLocaleString('sl-SI')} €` : 'Proračun po dogovoru'}</span>
                    </div>
                    <p className="request-board-description">{request.description}</p>
                    {categoryNames.length > 0 && (
                      <div className="request-board-categories">
                        {categoryNames.map((name) => <span key={name}>{name}</span>)}
                      </div>
                    )}
                  </div>

                  <div className="request-board-response">
                    {ownOffer ? (
                      <div className="request-board-sent">
                        <CheckCircle2 size={20} />
                        <div>
                          <strong>
                            {ownOffer.status === 'accepted' ? 'Stranka je sprejela tvojo ponudbo' : ownOffer.status === 'rejected' ? 'Ponudba je bila zavrnjena' : 'Ponudba je poslana'}
                          </strong>
                          <p>{ownOffer.message}</p>
                          {ownOffer.price && <span>{ownOffer.price.toLocaleString('sl-SI')} €</span>}
                          {ownOffer.status === 'accepted' && request.profiles && (
                            <div className="request-board-contact">
                              Kontakt stranke: <strong>{`${request.profiles.first_name || ''} ${request.profiles.last_name || ''}`.trim() || 'Stranka'}</strong>
                              {' · '}{request.profiles.email}
                              {request.profiles.phone ? ` · ${request.profiles.phone}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : request.status === 'open' ? (
                      <form onSubmit={(event) => submitOffer(event, request.id)}>
                        <h3>Pošlji ponudbo</h3>
                        <textarea
                          value={drafts[request.id]?.message || ''}
                          minLength={10}
                          required
                          rows={5}
                          placeholder="Na kratko predstavi svojo rešitev, razpoložljivost in kaj vključuje ponudba."
                          onChange={(event) => setDrafts((current) => ({
                            ...current,
                            [request.id]: {
                              message: event.target.value,
                              price: current[request.id]?.price || '',
                            },
                          }))}
                        />
                        <label>
                          Cena ponudbe (€)
                          <input
                            type="number"
                            min="0"
                            value={drafts[request.id]?.price || ''}
                            onChange={(event) => setDrafts((current) => ({
                              ...current,
                              [request.id]: {
                                message: current[request.id]?.message || '',
                                price: event.target.value,
                              },
                            }))}
                            placeholder="Po dogovoru"
                          />
                        </label>
                        <button className="button button-primary button-full" type="submit" disabled={isSubmitting === request.id}>
                          <Send size={15} /> {isSubmitting === request.id ? 'Pošiljam …' : 'Pošlji ponudbo'}
                        </button>
                      </form>
                    ) : (
                      <div className="request-board-closed">Povpraševanje je zaključeno.</div>
                    )}
                    <button className="request-board-message-toggle" type="button" onClick={() => loadThread(request.id)}>
                      <MessageSquareText size={15} /> {openThread === request.id ? 'Zapri sporočila' : 'Piši stranki'} <ArrowRight size={14} />
                    </button>
                    {openThread === request.id && (
                      <div className="request-board-thread">
                        <div>
                          {threadMessages.length === 0 && <p className="request-board-thread-empty">Za začetek pogovora postavi vprašanje stranki.</p>}
                          {threadMessages.map((message) => (
                            <div className={message.sender_id === user.id ? 'is-own' : ''} key={message.id}>
                              <span>{message.sender_id === user.id ? 'Ti' : 'Stranka'}</span>
                              <p>{message.message}</p>
                            </div>
                          ))}
                        </div>
                        <form onSubmit={(event) => sendMessage(event, request.id)}>
                          <input
                            value={messageDrafts[request.id] || ''}
                            required
                            placeholder="Vprašaj stranko po podrobnosti …"
                            onChange={(event) => setMessageDrafts((current) => ({ ...current, [request.id]: event.target.value }))}
                          />
                          <button className="button button-primary button-small" type="submit">Pošlji</button>
                        </form>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
