import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import SearchForm from './SearchForm';
import AIEventPlannerForm from './AIEventPlannerForm';

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState<'classic' | 'ai'>('classic');

  return (
    <div className="hero-search">
      <div className="hero-search-tabs">
        <button
          className={`hero-search-tab ${activeTab === 'classic' ? 'active' : ''}`}
          onClick={() => setActiveTab('classic')}
          aria-selected={activeTab === 'classic'}
        >
          Klasično iskanje
        </button>
        <button
          className={`hero-search-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
          aria-selected={activeTab === 'ai'}
        >
          <Sparkles size={16} />
          AI Načrtovalec
        </button>
      </div>

      {activeTab === 'classic' && (
        <div className="hero-search-content">
          <SearchForm />
          <p>Začnite z idejo — ponudnike lahko primerjate brez obveznosti.</p>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="hero-search-content">
          <AIEventPlannerForm />
        </div>
      )}
    </div>
  );
}
