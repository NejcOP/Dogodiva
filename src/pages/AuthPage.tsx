import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { usePageMeta } from '../lib/seo';

type AuthPageProps = { mode: 'login' | 'register' };

export default function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  usePageMeta(
    isLogin ? 'Prijava' : 'Ustvari račun',
    isLogin ? 'Prijavi se v Dogodivo.' : 'Ustvari račun za načrtovanje svojega dogodka.',
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setError('');
    if (!supabase) {
      setError('Prijava trenutno ni aktivna. Najprej je treba povezati Supabase.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const name = String(form.get('name') ?? '').trim();
    setIsSubmitting(true);
    try {
      const result = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
          });
      if (result.error) throw result.error;
      if (isLogin) {
        setNotice('Prijava je uspela.');
        navigate(searchParams.get('redirect') || '/ponudniki');
      } else {
        setNotice('Račun je ustvarjen. Preveri e-pošto, če je v Supabase vključena potrditev naslova.');
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Prijava ni uspela. Poskusi znova.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Na domačo stran</Link>
        <span className="auth-mark"><LockKeyhole size={22} /></span>
        <span className="eyebrow">{isLogin ? 'Dobrodošel_a nazaj' : 'Začni načrtovati'}</span>
        <h1>{isLogin ? 'Prijava' : 'Ustvari svoj račun'}</h1>
        <p>{isLogin ? 'Nadaljuj tam, kjer si ostal_a.' : 'Veseli nas, da si tukaj.'}</p>
        {!isSupabaseConfigured && (
          <div className="config-notice" role="status">
            Supabase še ni povezan. Prijava in ustvarjanje računa sta trenutno onemogočena.
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label>
              Ime in priimek
              <input type="text" name="name" autoComplete="name" minLength={2} required />
            </label>
          )}
          <label>
            E-naslov
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            Geslo
            <input
              type="password"
              name="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={8}
              required
            />
            {!isLogin && <small>Najmanj 8 znakov.</small>}
          </label>
          {!isLogin && (
            <label className="checkbox-label">
              <input type="checkbox" name="terms" required />
              <span>Strinjam se s <Link to="/pogoji">pogoji uporabe</Link> in <Link to="/zasebnost">obvestilom o zasebnosti</Link>.</span>
            </label>
          )}
          <button className="button button-primary button-full" type="submit" disabled={!isSupabaseConfigured || isSubmitting}>
            {isSubmitting ? 'Prosim počakaj …' : isLogin ? 'Prijavi se' : 'Ustvari račun'}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p className="form-notice" role="status">{notice}</p>}
        </form>
        <p className="auth-switch">
          {isLogin ? 'Še nimaš računa?' : 'Že imaš račun?'}{' '}
          <Link to={isLogin ? '/registracija' : '/prijava'}>{isLogin ? 'Ustvari račun' : 'Prijavi se'}</Link>
        </p>
      </div>
    </section>
  );
}
