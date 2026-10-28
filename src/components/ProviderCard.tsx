import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoryById } from '../data/categories';
import type { Provider } from '../data/providers';
import { sl } from '../i18n/sl';

export default function ProviderCard({ provider }: { provider: Provider }) {
  const categoryNames = provider.categoryIds
    .map((id) => categoryById.get(id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <article className="provider-card">
      <Link
        className="provider-card-image-link"
        to={`/ponudnik/${provider.id}`}
        aria-label={`Oglej si profil: ${provider.name}`}
      >
        <img className="provider-card-image" src={provider.image} alt="" loading="lazy" />
        <span className="demo-badge">{sl.common.demoLabel}</span>
      </Link>
      <div className="provider-card-body">
        <div className="provider-card-meta">
          <span>{categoryNames.join(' · ')}</span>
          <span className="provider-location">
            <MapPin size={13} /> {provider.city}
          </span>
        </div>
        <h3>
          <Link to={`/ponudnik/${provider.id}`}>{provider.name}</Link>
        </h3>
        <p className="provider-card-description">{provider.description}</p>
        <div className="provider-card-bottom">
          <div>
            <span className="price-caption">Okvirno od</span>
            <strong>
              {provider.priceFrom.toLocaleString('sl-SI')} € <small>{provider.priceUnit}</small>
            </strong>
          </div>
          <Link className="card-arrow" to={`/ponudnik/${provider.id}`} aria-label={`Več o ponudniku ${provider.name}`}>
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}
