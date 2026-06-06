import { useState } from 'react';
import type { CharClass } from '../game/types';
import { useGame } from '../game/store/gameStore';
import { CreatureCanvas } from './shared';
import { BASE_STATS } from '../game/engine/run';

interface ClassInfo {
  id: CharClass;
  name: string;
  avatar: string;
  title: string;
  mechanic: string;
  desc: string;
}

const CLASSES: ClassInfo[] = [
  {
    id: 'vukodlak',
    name: 'Vukodlak',
    avatar: 'player_vukodlak',
    title: 'Zvijer u ljudskoj koži',
    mechanic: 'Bijes',
    desc: 'Ratnik koji gradi Bijes i pretvara ga u razornu snagu. Što duže traje borba, to je smrtonosniji. Karte „Pojačane bijesom“ rastu s tvojim gnjevom.',
  },
  {
    id: 'vjestica',
    name: 'Vještica',
    avatar: 'player_vjestica',
    title: 'Gospodarica kletvi',
    mechanic: 'Otrov i kletve',
    desc: 'Plete otrov i kletve koje izjedaju neprijatelje potez za potezom. Strpljiva i smrtonosna — gleda kako se otrov množi dok protivnik vene.',
  },
];

export default function ClassSelect() {
  const meta = useGame((s) => s.meta);
  const startRun = useGame((s) => s.startRun);
  const goMenu = useGame((s) => s.goMenu);
  const [sel, setSel] = useState<CharClass>('vukodlak');
  const [seed, setSeed] = useState('');

  const info = CLASSES.find((c) => c.id === sel)!;
  const locked = (c: CharClass) => !meta.unlockedClasses.includes(c);

  return (
    <div className="scene class-scene vignette fade-in">
      <button className="btn btn-ghost back-btn" onClick={goMenu}>
        ‹ Nazad
      </button>
      <h2 className="screen-title">Izaberi junaka</h2>

      <div className="class-layout">
        <div className="class-list">
          {CLASSES.map((c) => (
            <button
              key={c.id}
              className={`class-tab ${sel === c.id ? 'active' : ''} ${locked(c.id) ? 'locked' : ''}`}
              onClick={() => !locked(c.id) && setSel(c.id)}
            >
              <CreatureCanvas ckey={c.avatar} size={64} animate={sel === c.id} />
              <div className="class-tab-name">{locked(c.id) ? '???' : c.name}</div>
            </button>
          ))}
        </div>

        <div className="class-detail panel">
          <div className="class-portrait">
            <CreatureCanvas ckey={info.avatar} size={200} />
          </div>
          <div className="class-info">
            <h3 className="class-name">{info.name}</h3>
            <div className="class-title">{info.title}</div>
            <div className="class-stats">
              <span className="stat-hp">♥ {BASE_STATS[info.id].hp} zdravlja</span>
              <span className="mechanic-pill">{info.mechanic}</span>
            </div>
            <p className="class-desc">{info.desc}</p>
            <div className="seed-row">
              <input
                className="seed-input"
                placeholder="sjeme (opcionalno)"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary class-start"
              onClick={() => startRun(sel, seed.trim() || undefined)}
            >
              Kreni u Jav
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
