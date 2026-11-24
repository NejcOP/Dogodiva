import { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QUICK_TEMPLATES = [
  'Poroka za 100 gostov',
  'Rojstnodnevna zabava z DJ-jem',
  'Poslovni dogodek s cateringom',
];

export default function AIEventPlannerForm() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickTemplate = (template: string) => {
    setDescription(template);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Prosim vpišite opis vašega dogodka.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Mock data za testiranje
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockResult = {
        event_data: {
          event_type: 'poroka',
          region: 'Ljubljana',
          city: 'Ljubljana',
          guest_count: 100,
          total_budget: 15000,
          needed_categories: ['prostori', 'catering', 'fotografi', 'dj'],
        },
        providers: {
          prostori: [
            { 
              id: '1', 
              name: 'Vila Brezina', 
              slug: 'vila-brezina', 
              categories: ['prostori'], 
              starting_price: 1800, 
              average_rating: 4.8, 
              portfolio_images: ['https://via.placeholder.com/300x200'] 
            },
          ],
          catering: [
            { 
              id: '2', 
              name: 'Catering Ljubljana', 
              slug: 'catering-lj', 
              categories: ['catering'], 
              starting_price: 25, 
              average_rating: 4.6, 
              portfolio_images: ['https://via.placeholder.com/300x200'] 
            },
          ],
          fotografi: [
            { 
              id: '3', 
              name: 'Atelje Luma', 
              slug: 'atelje-luma', 
              categories: ['fotografi'], 
              starting_price: 790, 
              average_rating: 4.9, 
              portfolio_images: ['https://via.placeholder.com/300x200'] 
            },
          ],
          dj: [
            { 
              id: '4', 
              name: 'DJ Marko', 
              slug: 'dj-marko', 
              categories: ['dj'], 
              starting_price: 500, 
              average_rating: 4.7, 
              portfolio_images: ['https://via.placeholder.com/300x200'] 
            },
          ],
        },
        budget_breakdown: {
          prostori: 4500,
          catering: 3750,
          fotografi: 2250,
          dj: 1500,
        },
        timeline: [
          { 
            days_before: 90, 
            task: 'Začni z iskanjem lokacije', 
            checklist: ['Poišči idealne ponudnike', 'Dogovori se za rezervacijo'] 
          },
          { 
            days_before: 60, 
            task: 'Potrdi vse pogodbe', 
            checklist: ['Podpisane pogodbe', 'Plačilo prve anzalje'] 
          },
        ],
      };

      navigate('/ai-event-plan', { state: mockResult });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Napaka pri obdelavi zahteve.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-event-planner-form">
      <form onSubmit={handleSubmit}>
        <div className="ai-input-wrapper">
          <Sparkles className="ai-input-icon" size={20} />
          <textarea
            className="ai-input"
            placeholder="Npr.: Organiziram poroko v okolici Ljubljane za 100 oseb, proračun je 15.000 €. Želim lepo lokacijo, fotografa, DJ-ja in catering."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
        </div>

        {error && <div className="ai-error">{error}</div>}

        <button
          type="submit"
          className="button button-primary ai-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader size={18} className="spinner" />
              Sestavljam ponudbo...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Sestavi ponudbo
            </>
          )}
        </button>
      </form>

      <div className="ai-quick-templates">
        <p className="ai-templates-label">Hitre predloge:</p>
        <div className="ai-templates-grid">
          {QUICK_TEMPLATES.map((template) => (
            <button
              key={template}
              type="button"
              className="ai-template-chip"
              onClick={() => handleQuickTemplate(template)}
            >
              {template}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
