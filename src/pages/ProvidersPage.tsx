import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownWideNarrow, SlidersHorizontal, X } from 'lucide-react';
import ProviderCard from '../components/ProviderCard';
import SearchForm from '../components/SearchForm';
import { categories } from '../data/categories';
import { providers } from '../data/providers';
import { usePageMeta } from '../lib/seo';

export default function ProvidersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get('minCena') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxCena') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'priporoceno');
  const category = searchParams.get('kategorija') ?? '';
  const eventType = searchParams.get('dogodek') ?? '';
  const location = searchParams.get('lokacija') ?? '';
  const date = searchParams.get('datum') ?? '';
  const guests = Number(searchParams.get('gosti') ?? '');
  const searchTerm = searchParams.get('iskanje')?.trim().toLocaleLowerCase('sl-SI') ?? '';

  usePageMeta(
    'Ponudniki za dogodke',
    'Išči in primerjaj predstavitvene profile ponudnikov za dogodke po Sloveniji.',
  );

  const filteredProviders = useMemo(() => {
    const min = minPrice === '' ? undefined : Number(minPrice);
    const max = maxPrice === '' ? undefined : Number(maxPrice);
    const result = providers.filter((provider) => {
      const matchesCategory = !category || provider.categoryIds.includes(category);
      const matchesEventType = !eventType || provider.eventTypes.includes(eventType);
      const normalizedLocation = location.trim().toLocaleLowerCase('sl-SI');
      const matchesLocation =
        !normalizedLocation ||
        `${provider.city} ${provider.serviceArea}`.toLocaleLowerCase('sl-SI').includes(normalizedLocation);
      const matchesDate = !date || provider.demoAvailabilityDates.includes(date);
      const matchesGuests = !guests || !provider.guestCapacity || provider.guestCapacity >= guests;
      const matchesMin = min === undefined || provider.priceFrom >= min;
      const matchesMax = max === undefined || provider.priceFrom <= max;
      const categoryNames = provider.categoryIds
        .map((id) => categories.find((item) => item.id === id)?.name ?? '')
        .join(' ')
        .toLocaleLowerCase('sl-SI');
      const matchesSearch =
        !searchTerm ||
        `${provider.name} ${provider.city} ${provider.serviceArea} ${categoryNames} ${provider.tags.join(' ')}`
          .toLocaleLowerCase('sl-SI')
          .includes(searchTerm);
      return (
        matchesCategory &&
        matchesEventType &&
        matchesLocation &&
        matchesDate &&
        matchesGuests &&
        matchesMin &&
        matchesMax &&
        matchesSearch
      );
    });

    if (sort === 'cena-nizje') result.sort((a, b) => a.priceFrom - b.priceFrom);
    if (sort === 'cena-visje') result.sort((a, b) => b.priceFrom - a.priceFrom);
    if (sort === 'ime') result.sort((a, b) => a.name.localeCompare(b.name, 'sl'));
    return result;
  }, [category, date, eventType, guests, location, maxPrice, minPrice, searchTerm, sort]);

  function updateSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams(searchParams);
    const query = String(data.get('iskanje') ?? '').trim();
    if (query) next.set('iskanje', query);
    else next.delete('iskanje');
    setSearchParams(next);
  }

  function updatePriceFilters() {
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('minCena', minPrice);
    else next.delete('minCena');
    if (maxPrice) next.set('maxCena', maxPrice);
    else next.delete('maxCena');
    if (sort !== 'priporoceno') next.set('sort', sort);
    else next.delete('sort');
    setSearchParams(next);
  }

  function clearFilters() {
    setMinPrice('');
    setMaxPrice('');
    setSort('priporoceno');
    setSearchParams(new URLSearchParams());
  }

  const selectedCategory = categories.find((item) => item.id === category);

  return (
    <section className="listing-page">
      <div className="listing-heading">
        <div className="container">
          <span className="eyebrow">Poišči pravo ujemanje</span>
          <h1>{selectedCategory ? selectedCategory.name : 'Ponudniki za tvoj dogodek'}</h1>
          <p>Primerjaj predstavitvene profile in odkrij možnosti za svoj naslednji dogodek.</p>
          <div className="listing-search-wrap">
            <SearchForm
              key={searchParams.toString()}
              compact
              initialCategory={category}
              initialEventType={eventType}
              initialLocation={location}
              initialDate={date}
              initialGuests={searchParams.get('gosti') ?? ''}
            />
          </div>
        </div>
      </div>
      <div className="container listing-content">
        <aside className={`filter-panel ${filtersOpen ? 'filter-panel-open' : ''}`} aria-label="Filtri ponudnikov">
          <div className="filter-heading">
            <h2><SlidersHorizontal size={17} /> Filtri</h2>
            <button className="filter-close icon-button" type="button" onClick={() => setFiltersOpen(false)} aria-label="Zapri filtre">
              <X size={18} />
            </button>
            <button className="filter-reset" type="button" onClick={clearFilters}>Počisti</button>
          </div>
          <label className="filter-label" htmlFor="category-filter">Kategorija</label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              if (event.target.value) next.set('kategorija', event.target.value);
              else next.delete('kategorija');
              setSearchParams(next);
            }}
          >
            <option value="">Vse kategorije</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <form className="listing-search" onSubmit={updateSearch}>
            <label className="filter-label" htmlFor="keyword-filter">Išči po imenu ali storitvi</label>
            <div className="keyword-control">
              <input
                id="keyword-filter"
                name="iskanje"
                type="search"
                defaultValue={searchTerm}
                placeholder="Npr. cvetje, Ljubljana"
              />
              <button className="button button-primary button-small" type="submit">Išči</button>
            </div>
          </form>
          <span className="filter-label">Okvirna cena od (EUR)</span>
          <div className="price-filter">
            <label>
              <span className="sr-only">Najnižja cena</span>
              <input
                aria-label="Najnižja cena v evrih"
                type="number"
                min="0"
                placeholder="Od"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </label>
            <span aria-hidden="true">–</span>
            <label>
              <span className="sr-only">Najvišja cena</span>
              <input
                aria-label="Najvišja cena v evrih"
                type="number"
                min="0"
                placeholder="Do"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </label>
          </div>
          <button className="button button-outline filter-apply" type="button" onClick={updatePriceFilters}>
            Uporabi filtre
          </button>
          {date && (
            <p className="filter-hint">
              Datum {new Date(`${date}T12:00:00`).toLocaleDateString('sl-SI')}: prikazani so le profili z ujemajočim se demo datumom.
            </p>
          )}
          {guests > 0 && (
            <p className="filter-hint">
              Kapaciteta je uporabljena tam, kjer je navedena; pri ostalih profilih jo preveri neposredno.
            </p>
          )}
        </aside>
        {filtersOpen && <button className="filter-backdrop" type="button" aria-label="Zapri filtre" onClick={() => setFiltersOpen(false)} />}
        <div className="results-area">
          <div className="results-toolbar">
            <div>
              <button className="button button-outline filter-mobile-button" type="button" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={16} /> Filtri
              </button>
              <p><strong>{filteredProviders.length}</strong> predstavitvenih profilov</p>
            </div>
            <label className="sort-select">
              <ArrowDownWideNarrow size={16} />
              <span className="sr-only">Razvrsti ponudnike</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value === 'priporoceno') next.delete('sort');
                  else next.set('sort', event.target.value);
                  setSearchParams(next);
                }}
              >
                <option value="priporoceno">Priporočeno</option>
                <option value="cena-nizje">Cena: od nižje</option>
                <option value="cena-visje">Cena: od višje</option>
                <option value="ime">Ime ponudnika</option>
              </select>
            </label>
          </div>
          {filteredProviders.length ? (
            <div className="provider-grid listing-grid">
              {filteredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon"><SlidersHorizontal size={22} /></span>
              <h2>Za te filtre še ni ujemanj</h2>
              <p>Poskusi z drugo lokacijo, kategorijo ali širšim cenovnim razponom.</p>
              <button className="button button-primary" type="button" onClick={clearFilters}>Počisti filtre</button>
            </div>
          )}
          <p className="demo-disclaimer">
            Prikazani so izključno predstavitveni profili. Cene, fotografije in datumi razpoložljivosti so demo podatki.
          </p>
        </div>
      </div>
    </section>
  );
}
