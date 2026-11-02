import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../lib/seo';
import { authService } from '../services/auth';
import { storageService } from '../services/storage';

export default function ProfilePage() {
  usePageMeta('Moj profil', 'Upravljaj svoj profil in nastavitve računa.');

  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    city: profile?.city || '',
    country: profile?.country || 'Slovenija',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  if (!user || !profile) {
    return (
      <section className="profile-page">
        <div className="container">
          <div className="profile-empty">
            <p>Najprej se moraš prijavi.</p>
            <button className="button button-primary" onClick={() => navigate('/prijava')}>
              Pojdi na prijavo
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');
    try {
      const url = await storageService.uploadAvatar(user.id, file);
      await authService.updateProfile(user.id, {
        avatar_url: url,
      });
      setFormData((prev) => ({ ...prev }));
      setSuccess('Avatar posodobljen!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nalaganje slike je bilo neuspešno.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await authService.updateProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
        bio: formData.bio || null,
        city: formData.city || null,
        country: formData.country,
      });
      setSuccess('Profil je bil uspešno posodobljen!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Posodobljenje profila je bilo neuspešno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Gesli se ne ujemata.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Geslo mora biti dolgo vsaj 8 znakov.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword('token', passwordForm.newPassword);
      setSuccess('Geslo je bilo uspešno spremenjeno!');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sprememba gesla je bila neuspešna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      setError('Odjava je bila neuspešna.');
    }
  };

  return (
    <section className="profile-page">
      <div className="container profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={`${formData.firstName} ${formData.lastName}`} className="profile-avatar-large" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {formData.firstName?.[0]}
                  {formData.lastName?.[0]}
                </div>
              )}
              <label className="avatar-upload">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <h1 className="profile-name-display">
              {formData.firstName} {formData.lastName}
            </h1>
            <p className="profile-email-display">{formData.email}</p>
          </div>

          <nav className="profile-nav">
            <button className="profile-nav-item active" type="button">
              Osebni podatki
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Profile Form */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h2>Osebni podatki</h2>
              {!isEditing && (
                <button className="button button-secondary button-small" onClick={() => setIsEditing(true)}>
                  Uredi profil
                </button>
              )}
            </div>

            {isEditing ? (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label className="form-group">
                    Ime
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                    />
                  </label>
                  <label className="form-group">
                    Priimek
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                    />
                  </label>
                </div>

                <label className="form-group">
                  E-naslov (ni mogoče spremeniti)
                  <input type="email" value={formData.email} disabled />
                  <small>Če želiš spremeniti e-naslov, nam piši na support.</small>
                </label>

                <label className="form-group">
                  Telefonska številka
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+386 1 234 5678"
                  />
                </label>

                <label className="form-group">
                  O meni
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Povej nam kaj o sebi..."
                    rows={4}
                  />
                </label>

                <div className="form-row">
                  <label className="form-group">
                    Mesto
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="npr. Ljubljana" />
                  </label>
                  <label className="form-group">
                    Država
                    <select name="country" value={formData.country} onChange={handleInputChange}>
                      <option value="Slovenija">Slovenija</option>
                      <option value="Hrvaška">Hrvaška</option>
                      <option value="Srbija">Srbija</option>
                      <option value="Bosna in Hercegovina">Bosna in Hercegovina</option>
                      <option value="Makedonija">Makedonija</option>
                      <option value="Črna gora">Črna gora</option>
                      <option value="Drugo">Drugo</option>
                    </select>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="button button-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Shranjujem...' : 'Shrani spremembe'}
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    Prekliči
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="profile-info-row">
                  <span className="profile-info-label">Ime in priimek</span>
                  <span className="profile-info-value">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">E-naslov</span>
                  <span className="profile-info-value">{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Telefon</span>
                    <span className="profile-info-value">{formData.phone}</span>
                  </div>
                )}
                {formData.bio && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">O meni</span>
                    <span className="profile-info-value">{formData.bio}</span>
                  </div>
                )}
                {formData.city && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Mesto</span>
                    <span className="profile-info-value">{formData.city}</span>
                  </div>
                )}
                <div className="profile-info-row">
                  <span className="profile-info-label">Država</span>
                  <span className="profile-info-value">{formData.country}</span>
                </div>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h2>Varnost</h2>
            </div>

            {showPasswordForm ? (
              <form className="profile-form" onSubmit={handlePasswordSubmit}>
                <label className="form-group">
                  Novo geslo
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    placeholder="Najmanj 8 znakov"
                  />
                </label>

                <label className="form-group">
                  Potrdi geslo
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    placeholder="Ponovi geslo"
                  />
                </label>

                <div className="form-actions">
                  <button type="submit" className="button button-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Spreminjem...' : 'Spremeni geslo'}
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowPasswordForm(false)}
                    disabled={isSubmitting}
                  >
                    Prekliči
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="button button-secondary"
                onClick={() => setShowPasswordForm(true)}
              >
                <Lock size={16} />
                Spremeni geslo
              </button>
            )}
          </div>

          {/* Logout Section */}
          <div className="profile-section profile-section-danger">
            <h2>Odjava</h2>
            <p>Ko se odjaviš, te bo izbrisalo iz napravo in boš moral/a se ponovno prijavi.</p>
            <button className="button button-danger" onClick={handleLogout}>
              <LogOut size={16} />
              Odjava
            </button>
          </div>
        </main>
      </div>
    </section>
  );
}
