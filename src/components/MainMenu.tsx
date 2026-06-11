import { useState } from 'react';
import { useGame } from '../game/store/gameStore';
import { startMusic } from '../game/audio/audio';

const CLASS_LABEL: Record<string, string> = {
  vukodlak: 'Vukodlak',
  vjestica: 'Vještica',
};

export default function MainMenu() {
  const run = useGame((s) => s.run);
  const meta = useGame((s) => s.meta);
  const user = useGame((s) => s.user);
  const cloudStatus = useGame((s) => s.cloudStatus);
  const loginGoogle = useGame((s) => s.loginGoogle);
  const logoutCloud = useGame((s) => s.logoutCloud);
  const openClassSelect = useGame((s) => s.openClassSelect);
  const goScreen = useGame((s) => s.goScreen);
  const set = useGame.setState;
  const [profileOpen, setProfileOpen] = useState(false);

  const cont = () => {
    if (!run) return;
    startMusic();
    set({ screen: 'map' });
  };

  const cloudLabel =
    cloudStatus === 'ok'
      ? 'sinhronizovano ☁✓'
      : cloudStatus === 'syncing'
        ? 'sinhronizacija…'
        : cloudStatus === 'error'
          ? 'greška sinhronizacije'
          : '';

  return (
    <div className="scene menu-scene vignette fade-in">
      <div className="menu-bg" />

      {/* auth corner */}
      <div className="auth-corner">
        {user ? (
          <button className="user-chip" onClick={() => setProfileOpen(true)} title="Profil">
            {user.photo ? (
              <img src={user.photo} alt="" className="user-avatar" referrerPolicy="no-referrer" />
            ) : (
              <span className="user-avatar user-avatar-fallback">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="user-name">{user.name}</span>
          </button>
        ) : (
          <button className="btn btn-ghost google-btn" onClick={loginGoogle}>
            <GoogleG /> Prijavi se Googleom
          </button>
        )}
      </div>

      <div className="menu-content">
        <div className="menu-title-wrap">
          <h1 className="menu-title pulse-gold">TRIGLAV</h1>
          <div className="menu-sub">Prav · Jav · Nav</div>
          <hr className="gold-rule menu-rule" />
          <div className="menu-tag">slavenski roguelike</div>
        </div>

        <div className="menu-buttons col gap-m">
          {run && (
            <button className="btn btn-primary" onClick={cont}>
              Nastavi pohod
            </button>
          )}
          <button className="btn btn-primary" onClick={openClassSelect}>
            Novi pohod
          </button>
          <button className="btn" onClick={() => goScreen('compendium')}>
            Zbirka
          </button>
          <button className="btn" onClick={() => goScreen('settings')}>
            Postavke
          </button>
        </div>

        <div className="menu-footer">
          <span>Pobjede: {meta.wins}</span>
          <span>·</span>
          <span>Pohodi: {meta.totalRuns}</span>
          {user && cloudLabel && (
            <>
              <span>·</span>
              <span className={`cloud-status cs-${cloudStatus}`}>{cloudLabel}</span>
            </>
          )}
        </div>
      </div>

      {profileOpen && user && (
        <div className="modal-overlay" onClick={() => setProfileOpen(false)}>
          <div className="profile-modal panel" onClick={(e) => e.stopPropagation()}>
            <div className="profile-head">
              {user.photo ? (
                <img src={user.photo} alt="" className="profile-avatar" referrerPolicy="no-referrer" />
              ) : (
                <span className="profile-avatar user-avatar-fallback">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <h3 className="profile-name">{user.name}</h3>
                <div className="profile-email">{user.email}</div>
                <div className={`cloud-status cs-${cloudStatus}`}>
                  {cloudStatus === 'ok'
                    ? 'Napredak sinhronizovan u oblak ☁✓'
                    : cloudStatus === 'syncing'
                      ? 'Sinhronizacija u toku…'
                      : cloudStatus === 'error'
                        ? 'Greška pri sinhronizaciji — napredak je sačuvan lokalno'
                        : ''}
                </div>
              </div>
            </div>
            <hr className="gold-rule" />
            <div className="profile-stats">
              <div className="pstat">
                <span className="pstat-val">{meta.wins}</span>
                <span className="pstat-label">Pobjede</span>
              </div>
              <div className="pstat">
                <span className="pstat-val">{meta.losses}</span>
                <span className="pstat-label">Porazi</span>
              </div>
              <div className="pstat">
                <span className="pstat-val">{meta.totalRuns}</span>
                <span className="pstat-label">Pohodi</span>
              </div>
              <div className="pstat">
                <span className="pstat-val">{meta.seenEnemies.length}</span>
                <span className="pstat-label">Viđena bića</span>
              </div>
            </div>
            <div className="profile-classes">
              <span className="tag">Otključane klase:</span>{' '}
              {meta.unlockedClasses.map((c) => CLASS_LABEL[c] ?? c).join(', ')}
            </div>
            {run && (
              <div className="profile-run">
                <span className="tag">Aktivni pohod:</span> {CLASS_LABEL[run.cls] ?? run.cls} —{' '}
                {run.hp}/{run.maxHp} HP, sprat {run.floorsCleared}, {run.gold} zlata
              </div>
            )}
            <div className="profile-actions">
              <button className="btn btn-ghost" onClick={() => setProfileOpen(false)}>
                Zatvori
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setProfileOpen(false);
                  logoutCloud();
                }}
              >
                Odjavi se
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleG() {
  return (
    <svg className="google-g" viewBox="0 0 24 24" width="16" height="16">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.61 0 3.06.55 4.21 1.64l3.16-3.16A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
