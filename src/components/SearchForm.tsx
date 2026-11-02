import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Search, UsersRound } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { eventTypes } from '../data/eventTypes';

type SearchFormProps = {
  compact?: boolean;
  initialCategory?: string;
  initialEventType?: string;
  initialLocation?: string;
  initialDate?: string;
  initialGuests?: string;
};

export default function SearchForm({
  compact = false,
  initialCategory = '',
  initialEventType = '',
  initialLocation = '',
  initialDate = '',
  initialGuests = '',
}: SearchFormProps) {
  const navigate = useNavigate();
  const [eventType, setEventType] = useState(initialEventType);
  const [location, setLocation] = useState(initialLocation);
  const [date, setDate] = useState(initialDate);
  const [guests, setGuests] = useState(initialGuests);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (initialCategory) params.set('kategorija', initialCategory);
    if (eventType) params.set('dogodek', eventType);
    if (location.trim()) params.set('lokacija', location.trim());
    if (date) params.set('datum', date);
    if (guests) params.set('gosti', guests);
    navigate(`/ponudniki${params.size ? `?${params.toString()}` : ''}`);
  }

  return (
    <form className={`search-panel ${compact ? 'search-panel-compact' : ''}`} onSubmit={handleSubmit}>
      <div className="search-field">
        <span className="search-field-icon">
          <Search size={18} />
        </span>
        <span className="search-field-content">
          <span className="search-field-label">Kakšen dogodek?</span>
          <CustomSelect
            options={[
              { value: '', label: 'Vsi dogodki' },
              ...eventTypes.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            ]}
            value={eventType}
            onChange={setEventType}
            placeholder="Vsi dogodki"
          />
        </span>
      </div>
      <label className="search-field">
        <span className="search-field-icon">
          <MapPin size={18} />
        </span>
        <span className="search-field-content">
          <span className="search-field-label">Kje?</span>
          <input
            aria-label="Lokacija dogodka"
            placeholder="Mesto ali regija"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </span>
      </label>
      <label className="search-field search-field-date">
        <span className="search-field-icon">
          <CalendarDays size={18} />
        </span>
        <span className="search-field-content">
          <span className="search-field-label">Kdaj?</span>
          <input
            aria-label="Datum dogodka"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="date-input"
          />
        </span>
      </label>
      <label className="search-field">
        <span className="search-field-icon">
          <UsersRound size={18} />
        </span>
        <span className="search-field-content">
          <span className="search-field-label">Koliko gostov?</span>
          <input
            aria-label="Število gostov"
            type="number"
            min="1"
            max="10000"
            placeholder="Npr. 80"
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
          />
        </span>
      </label>
      <button className="button button-primary search-submit" type="submit">
        <Search size={17} /> Poišči ponudnike
      </button>
    </form>
  );
}
