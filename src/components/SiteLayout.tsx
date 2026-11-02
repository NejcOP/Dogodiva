import { useState } from 'react';
import * as React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  ArrowRight,
  CalendarHeart,
  ChevronDown,
  Heart,
  Menu,
  X,
  Search,
  Zap,
  Users,
} from 'lucide-react';
import { categories } from '../data/categories';
import { eventTypes } from '../data/eventTypes';
import { sl } from '../i18n/sl';

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Dogodiva – na domačo stran">
      <span className="brand-mark" aria-hidden="true">
        <CalendarHeart size={24} strokeWidth={1.8} />
      </span>
      <span>{sl.brand}</span>
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const closeDropdowns = () => {
    setExploreOpen(false);
    closeMenu();
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setExploreOpen(false);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setExploreOpen(true);
  };

  return (
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="container nav-wrap">
        <Brand />
        <button
          className="icon-button mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Zapri navigacijo' : 'Odpri navigacijo'}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav 
          id="main-nav"
          className={`main-nav ${menuOpen ? 'is-open' : ''}`} 
          aria-label="Glavna navigacija"
        >
          <div 
            className="nav-dropdown"
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <button
              className="nav-link dropdown-trigger"
              type="button"
              aria-expanded={exploreOpen}
              aria-haspopup="true"
            >
              <Search size={16} />
              Razišči <ChevronDown size={16} />
            </button>
            {exploreOpen && (
              <div className="dropdown-panel explore-dropdown">
                <div className="explore-section">
                  <div className="explore-heading">Po kategorijah</div>
                  <div className="dropdown-grid">
                    {categories.slice(0, 8).map((category) => (
                      <Link
                        key={category.id}
                        to={`/ponudniki?kategorija=${category.id}`}
                        onClick={closeDropdowns}
                        className="dropdown-item"
                      >
                        <span className="dropdown-item-icon">{category.icon && <category.icon size={18} />}</span>
                        <span className="dropdown-item-text">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    className="dropdown-footer"
                    to="/ponudniki"
                    onClick={closeDropdowns}
                  >
                    Vse kategorije <ArrowRight size={14} />
                  </Link>
                </div>
                
                <div className="explore-divider"></div>
                
                <div className="explore-section">
                  <div className="explore-heading">Po vrsti dogodka</div>
                  <div className="dropdown-events-list">
                    {eventTypes.map((eventType) => (
                      <Link
                        key={eventType.id}
                        to={eventType.id === 'maturantski-ples' ? '/kategorije/maturantski-plesi' : `/ponudniki?dogodek=${eventType.id}`}
                        onClick={closeDropdowns}
                        className="dropdown-event-item"
                      >
                        <span className="dropdown-event-emoji">{eventType.emoji}</span>
                        <span className="dropdown-event-name">{eventType.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <NavLink 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
            to="/ponudniki" 
            onClick={closeMenu}
          >
            <Search size={16} />
            Najdi ponudnike
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => `nav-link nav-link-primary ${isActive ? 'active' : ''}`}
            to="/organiziraj-dogodek" 
            onClick={closeMenu}
          >
            <Zap size={16} />
            Organiziraj dogodek
          </NavLink>
          
          <Link 
            className="nav-link nav-link-secondary" 
            to="/postani-ponudnik" 
            onClick={closeMenu}
          >
            <Users size={16} />
            Postani ponudnik
          </Link>
          <div className="nav-actions">
            <Link className="nav-login" to="/prijava" onClick={closeMenu}>
              Prijava
            </Link>
            <Link className="button button-small button-primary" to="/registracija" onClick={closeMenu}>
              Ustvari račun
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand-block">
          <Brand />
          <p>Manj iskanja. Več trenutkov, ki štejejo.</p>
          <span className="footer-note">Za zdaj povezujemo dogodke po Sloveniji.</span>
        </div>
        <div className="footer-column">
          <h2>Razišči</h2>
          <Link to="/ponudniki">Vsi ponudniki</Link>
          <Link to="/ponudniki?kategorija=prostori">Prostori za dogodke</Link>
          <Link to="/ponudniki?kategorija=fotografi">Fotografi</Link>
          <Link to="/ponudniki?kategorija=catering">Catering</Link>
        </div>
        <div className="footer-column">
          <h2>Za ponudnike</h2>
          <Link to="/postani-ponudnik">Predstavi svojo storitev</Link>
          <Link to="/#pogosta-vprasanja">Pogosta vprašanja</Link>
          <Link to="/kontakt">Kontaktni obrazec</Link>
        </div>
        <div className="footer-column">
          <h2>Dogodiva</h2>
          <Link to="/o-nas">O nas</Link>
          <Link to="/pogoji">Pogoji uporabe</Link>
          <Link to="/zasebnost">Zasebnost</Link>
          <Link to="/kontakt">Kontaktni obrazec</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Dogodiva. Vse pravice pridržane.</span>
        <span className="footer-social">
          <Heart size={15} aria-hidden="true" /> Ustvarjeno za posebne trenutke
        </span>
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Preskoči na vsebino
      </a>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
