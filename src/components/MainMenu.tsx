import { useGame } from '../game/store/gameStore';
import { startMusic } from '../game/audio/audio';

export default function MainMenu() {
  const run = useGame((s) => s.run);
  const meta = useGame((s) => s.meta);
  const openClassSelect = useGame((s) => s.openClassSelect);
  const goScreen = useGame((s) => s.goScreen);
  const set = useGame.setState;

  const cont = () => {
    if (!run) return;
    startMusic();
    set({ screen: run.map.currentNodeId === run.map.bossId ? 'map' : 'map' });
  };

  return (
    <div className="scene menu-scene vignette fade-in">
      <div className="menu-bg" />
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
          {meta.unlockedClasses.length > 1 && (
            <>
              <span>·</span>
              <span>Vještica otključana</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
