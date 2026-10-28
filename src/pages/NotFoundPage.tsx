import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { usePageMeta } from '../lib/seo';

export default function NotFoundPage() {
  usePageMeta('Stran ni najdena', 'Iskana stran na Dogodivi ne obstaja.');
  return (
    <section className="not-found-page">
      <div className="container">
        <span className="not-found-code">404</span>
        <span className="eyebrow">Napačen ovinek</span>
        <h1>Te strani ne najdemo.</h1>
        <p>Vse je v redu — včasih se tudi pri načrtovanju odpre napačna povezava.</p>
        <div className="not-found-actions">
          <Link className="button button-primary" to="/"><ArrowLeft size={16} /> Na domačo stran</Link>
          <Link className="button button-outline" to="/ponudniki"><Search size={16} /> Poišči ponudnike</Link>
        </div>
      </div>
    </section>
  );
}
