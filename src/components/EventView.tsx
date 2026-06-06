import { useGame } from '../game/store/gameStore';
import TopBar from './TopBar';

export default function EventView() {
  const event = useGame((s) => s.event);
  const run = useGame((s) => s.run);
  const outcome = useGame((s) => s.eventOutcome);
  const resolveEvent = useGame((s) => s.resolveEvent);
  const closeEvent = useGame((s) => s.closeEvent);
  if (!event || !run) return null;

  return (
    <div className="scene event-scene vignette fade-in">
      <TopBar />
      <div className="event-card panel">
        <h2 className="event-title">{event.title}</h2>
        <hr className="gold-rule" />
        <p className="event-text">{event.text}</p>

        {!outcome ? (
          <div className="event-choices">
            {event.choices.map((c, i) => {
              const disabled = c.enabled ? !c.enabled(run) : false;
              return (
                <button
                  key={i}
                  className="event-choice"
                  disabled={disabled}
                  onClick={() => resolveEvent(i)}
                >
                  <span className="event-choice-label">{c.label}</span>
                  {c.desc && <span className="event-choice-desc">{c.desc}</span>}
                  {disabled && <span className="event-choice-locked">nedostupno</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="event-outcome">
            <p className="event-outcome-text">{outcome.text}</p>
            <button className="btn btn-primary" onClick={closeEvent}>
              Nastavi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
