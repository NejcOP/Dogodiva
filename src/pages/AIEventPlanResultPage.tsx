import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ExtractedEventData {
  event_type: string;
  region: string;
  city?: string;
  event_date?: string;
  guest_count?: number;
  total_budget?: number;
  needed_categories: string[];
}

interface Provider {
  id: string;
  name: string;
  categories: string[];
  starting_price?: number;
  average_rating?: number;
  portfolio_images: string[];
  slug: string;
}

interface TimelineItem {
  days_before: number;
  task: string;
  checklist: string[];
}

interface PlanResult {
  event_data: ExtractedEventData;
  providers: { [key: string]: Provider[] };
  budget_breakdown: { [key: string]: number };
  timeline: TimelineItem[];
}

export default function AIEventPlanResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as PlanResult | null;

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<{ [key: string]: string }>({});

  if (!result) {
    return (
      <div className="ai-plan-error">
        <AlertCircle size={48} />
        <h2>Ni rezultatov</h2>
        <p>Prosimo, se vrnite in poskusite znova.</p>
        <button onClick={() => navigate('/')} className="button button-primary">
          Nazaj na domačo stran
        </button>
      </div>
    );
  }

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const toggleChecklistItem = (item: string) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleSelectProvider = (category: string, providerId: string) => {
    setSelectedProviders(prev => ({
      ...prev,
      [category]: providerId
    }));
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await (supabase as any).auth.getUser();
      
      if (!user) {
        navigate('/prijava');
        return;
      }

      // Spremi plan u bazu (ako postoji tabela saved_plans)
      const { error } = await (supabase as any).from('saved_plans').insert({
        user_id: user.id,
        event_data: result.event_data,
        selected_providers: selectedProviders,
        budget_breakdown: result.budget_breakdown,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      alert('Plan je uspešno sačuvan u vaš profil!');
    } catch (error) {
      console.error('Greška pri čuvanju plana:', error);
      alert('Greška pri čuvanju plana. Pokušajte kasnije.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendInquiries = async () => {
    setIsSending(true);
    try {
      const { data: { user } } = await (supabase as any).auth.getUser();
      
      if (!user) {
        navigate('/prijava');
        return;
      }

      // Za svaki izbrani ponudnik, pošalji povpraševanje
      const inquiries = [];
      
      for (const [category, providerId] of Object.entries(selectedProviders)) {
        // Pronađi ponudnika
        const provider = result.providers[category]?.find(p => p.id === providerId);
        if (provider) {
          inquiries.push({
            client_id: user.id,
            provider_id: providerId,
            category,
            event_type: result.event_data.event_type,
            guest_count: result.event_data.guest_count,
            budget: result.budget_breakdown[category],
            message: `Automatski generirano povpraševanje za ${result.event_data.event_type} događaj iz AI Načrtovalca.`,
            created_at: new Date().toISOString(),
          });
        }
      }

      if (inquiries.length === 0) {
        alert('Prosimo, izberite najmanj enega ponudnika.');
        return;
      }

      // Spremi povpraševanja
      const { error } = await (supabase as any).from('marketplace_requests').insert(inquiries);
      
      if (error) throw error;
      
      alert(`Uspešno ste poslali ${inquiries.length} povpraševanj ponudnikom!`);
      navigate('/profil?tab=zahtevki');
    } catch (error) {
      console.error('Napaka pri pošiljanju povpraševanj:', error);
      alert('Napaka pri pošiljanju povpraševanj. Poskusite kasneje.');
    } finally {
      setIsSending(false);
    }
  };

  const eventTypeLabel: { [key: string]: string } = {
    poroka: 'Poroka',
    rojstnodnevna: 'Rojstni dan',
    poslovni: 'Poslovni dogodek',
    krštenje: 'Krst',
    promocija: 'Promocija',
    ostalo: 'Drugi dogodek',
  };

  const categoryLabel: { [key: string]: string } = {
    prostori: 'Prostori za dogodke',
    catering: 'Catering in hrana',
    fotografi: 'Fotografija',
    videografi: 'Videografija',
    dj: 'DJ in glasba',
    dekoracija: 'Dekoracija',
    cveće: 'Cvetje in floral',
    razglašivač: 'Razglašivač',
    organizator: 'Event organizator',
  };

  return (
    <main className="ai-plan-result-page">
      <div className="ai-plan-container">
        {/* Header sa povzetkom */}
        <section className="ai-plan-header">
          <div className="ai-plan-header-top">
            <div className="ai-plan-title">
              <Sparkles className="sparkles-icon" size={32} />
              <div>
                <h1>Vaš AI generirani plan dogodka</h1>
                <p>Prilagojeni paket ponudnikov za {eventTypeLabel[result.event_data.event_type]} na {result.event_data.region}</p>
              </div>
            </div>
          </div>

          <div className="ai-plan-summary">
            <div className="summary-card">
              <div className="summary-label">Vrsta dogodka</div>
              <div className="summary-value">{eventTypeLabel[result.event_data.event_type]}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Lokacija</div>
              <div className="summary-value">{result.event_data.city || result.event_data.region}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Število gostov</div>
              <div className="summary-value">{result.event_data.guest_count || 'Ni navedeno'}</div>
            </div>
            <div className="summary-card highlight">
              <div className="summary-label">Skupni proračun</div>
              <div className="summary-value">{result.event_data.total_budget ? `${result.event_data.total_budget}€` : 'Ni navedeno'}</div>
            </div>
          </div>
        </section>

        {/* Razdelitev budžeta */}
        {result.event_data.total_budget && (
          <section className="ai-plan-section">
            <h2>Razdelitev proračuna</h2>
            <div className="budget-breakdown">
              {Object.entries(result.budget_breakdown).map(([category, amount]) => (
                <div key={category} className="budget-item">
                  <div className="budget-label">
                    <span>{categoryLabel[category] || category}</span>
                    <span className="budget-percentage">
                      {Math.round((amount / (result.event_data.total_budget || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="budget-bar">
                    <div 
                      className="budget-fill" 
                      style={{
                        width: `${(amount / (result.event_data.total_budget || 1)) * 100}%`
                      }}
                    />
                  </div>
                  <div className="budget-amount">{amount}€</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ponudnici po kategorijama */}
        <section className="ai-plan-section">
          <h2>Priporočeni ponudniki</h2>
          <p className="section-subtitle">Izberite ponudnike za vsako kategorijo ali jih zamenjajte z drugimi</p>
          
          <div className="providers-list">
            {Object.entries(result.providers).map(([category, providers]) => (
              <div key={category} className="provider-category">
                <button
                  className="category-header"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="category-info">
                    <div className="category-title">
                      {categoryLabel[category] || category}
                      {selectedProviders[category] && (
                        <span className="selected-badge">✓ Izbrano</span>
                      )}
                    </div>
                    {providers.length === 0 && (
                      <div className="category-status warning">
                        ⚠️ Priporučena kategorija (još nema dostupnih ponudnika)
                      </div>
                    )}
                  </div>
                  {expandedCategories.has(category) ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>

                {expandedCategories.has(category) && (
                  <div className="category-content">
                    {providers.length === 0 ? (
                      <div className="no-providers">
                        <AlertCircle size={24} />
                        <p>Ni razpoložljivih ponudnikov za to kategorijo v vaši regiji.</p>
                        <p className="small">Lahko se javite direktno ali počakate nove ponudnike.</p>
                      </div>
                    ) : (
                      <div className="providers-grid">
                        {providers.map((provider) => (
                          <div
                            key={provider.id}
                            className={`provider-card ${selectedProviders[category] === provider.id ? 'selected' : ''}`}
                            onClick={() => handleSelectProvider(category, provider.id)}
                          >
                            {provider.portfolio_images && provider.portfolio_images[0] && (
                              <img
                                src={provider.portfolio_images[0]}
                                alt={provider.name}
                                className="provider-image"
                              />
                            )}
                            <div className="provider-info">
                              <h4>{provider.name}</h4>
                              {provider.average_rating && (
                                <div className="rating">★ {provider.average_rating.toFixed(1)}</div>
                              )}
                              {provider.starting_price && (
                                <div className="price">Od {provider.starting_price}€</div>
                              )}
                            </div>
                            {selectedProviders[category] === provider.id && (
                              <div className="select-badge">
                                <Check size={20} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="ai-plan-section">
          <h2>Časovnica priprave</h2>
          <div className="timeline">
            {result.timeline.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                  <div className="timeline-label">
                    {item.days_before} dni pred tem
                  </div>
                </div>
                <div className="timeline-content">
                  <h4>{item.task}</h4>
                  <ul className="timeline-checklist">
                    {item.checklist.map((task, idx) => (
                      <li key={idx}>
                        <input
                          type="checkbox"
                          id={`timeline-${index}-${idx}`}
                          checked={checklist[`${index}-${idx}`] || false}
                          onChange={() => toggleChecklistItem(`${index}-${idx}`)}
                        />
                        <label htmlFor={`timeline-${index}-${idx}`}>
                          {task}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Buttons */}
        <section className="ai-plan-actions">
          <button
            className="button button-primary button-lg"
            onClick={handleSendInquiries}
            disabled={isSending || Object.keys(selectedProviders).length === 0}
          >
            {isSending ? 'Pošiljam povpraševanja...' : 'Pošlji povpraševanja vsem izbranim ponudnikom'}
          </button>
          <button
            className="button button-secondary button-lg"
            onClick={handleSavePlan}
            disabled={isSaving}
          >
            {isSaving ? 'Shranjujem...' : '📋 Shrani načrt v moj profil'}
          </button>
          <button
            className="button button-outline button-lg"
            onClick={() => navigate('/')}
          >
            Nazaj na domačo stran
          </button>
        </section>
      </div>
    </main>
  );
}


