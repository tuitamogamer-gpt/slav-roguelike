import { useGame } from '../game/store/gameStore';

export default function EndScreen() {
  const screen = useGame((s) => s.screen);
  const meta = useGame((s) => s.meta);
  const goMenu = useGame((s) => s.goMenu);
  const openClassSelect = useGame((s) => s.openClassSelect);
  const win = screen === 'victory';

  return (
    <div className={`scene end-scene vignette fade-in ${win ? 'end-win' : 'end-lose'}`}>
      <div className="end-content">
        <h1 className={`end-title ${win ? 'pulse-gold' : ''}`}>
          {win ? 'POBJEDA' : 'PAO SI'}
        </h1>
        <p className="end-sub">
          {win
            ? 'Babaroga je svladana. Jav je za sada miran — ali Nav čeka u dubini.'
            : 'Tama te je progutala. Tvoja priča postaje šapat uz vatru.'}
        </p>
        {win && (
          <p className="end-unlock">Pokušaj sada drugom klasom — svaki pohod je druga priča.</p>
        )}

        <div className="end-stats">
          <span>Pobjede: {meta.wins}</span>
          <span>Porazi: {meta.losses}</span>
          <span>Pohodi: {meta.totalRuns}</span>
        </div>

        <div className="end-buttons col gap-m">
          <button className="btn btn-primary" onClick={openClassSelect}>
            Novi pohod
          </button>
          <button className="btn" onClick={goMenu}>
            Glavni meni
          </button>
        </div>
      </div>
    </div>
  );
}
