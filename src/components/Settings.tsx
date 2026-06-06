import { useGame } from '../game/store/gameStore';
import { startMusic, stopMusic } from '../game/audio/audio';

export default function Settings() {
  const settings = useGame((s) => s.settings);
  const update = useGame((s) => s.updateSettings);
  const goMenu = useGame((s) => s.goMenu);
  const run = useGame((s) => s.run);
  const prevScreen = useGame((s) => s.prevScreen);
  const abandonRun = useGame((s) => s.abandonRun);
  const set = useGame.setState;

  const back = () => {
    if (run && prevScreen && prevScreen !== 'settings') set({ screen: prevScreen });
    else goMenu();
  };

  return (
    <div className="scene settings-scene vignette fade-in">
      <button className="btn btn-ghost back-btn" onClick={back}>
        ‹ Nazad
      </button>
      <h2 className="screen-title">Postavke</h2>

      <div className="settings-panel panel">
        <div className="setting-row">
          <label>Muzika</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.music}
            onChange={(e) => update({ music: parseFloat(e.target.value) })}
          />
          <span className="setting-val">{Math.round(settings.music * 100)}%</span>
        </div>
        <div className="setting-row">
          <label>Zvučni efekti</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.sfx}
            onChange={(e) => update({ sfx: parseFloat(e.target.value) })}
          />
          <span className="setting-val">{Math.round(settings.sfx * 100)}%</span>
        </div>
        <div className="setting-row">
          <label>Utišaj sve</label>
          <button
            className={`toggle ${settings.muted ? 'on' : ''}`}
            onClick={() => {
              update({ muted: !settings.muted });
              if (settings.muted) startMusic();
              else stopMusic();
            }}
          >
            {settings.muted ? 'Utišano' : 'Uključeno'}
          </button>
        </div>
        <div className="setting-row">
          <label>Brže animacije</label>
          <button className={`toggle ${settings.fast ? 'on' : ''}`} onClick={() => update({ fast: !settings.fast })}>
            {settings.fast ? 'Da' : 'Ne'}
          </button>
        </div>

        {run && (
          <div className="setting-row danger-row">
            <label>Napusti pohod</label>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (confirm('Napustiti trenutni pohod? Napredak se gubi.')) {
                  abandonRun();
                }
              }}
            >
              Odustani
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
