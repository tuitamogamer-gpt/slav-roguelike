import { useMemo, useRef, useEffect } from 'react';
import { useGame } from '../game/store/gameStore';
import type { NodeKind } from '../game/types';
import TopBar from './TopBar';

const KIND_LABEL: Record<NodeKind, string> = {
  borba: 'Borba',
  elita: 'Elita',
  dogadjaj: 'Događaj',
  odmor: 'Odmor',
  trgovac: 'Trgovac',
  blago: 'Blago',
  gazda: 'Gazda',
  start: 'Start',
};

function NodeGlyph({ kind }: { kind: NodeKind }) {
  // simple drawn glyph per node type
  const map: Record<NodeKind, string> = {
    borba: 'M6 4 L18 16 M18 4 L6 16',
    elita: 'M12 3 L15 10 L22 10 L16 14 L18 21 L12 17 L6 21 L8 14 L2 10 L9 10 Z',
    dogadjaj: 'M12 4 a4 4 0 1 1 0 8 q0 3 0 5 M12 19 l0 1',
    odmor: 'M5 18 q7 -14 14 0 Z',
    trgovac: 'M5 9 h14 l-2 9 h-10 Z M8 9 v-2 a4 4 0 0 1 8 0 v2',
    blago: 'M4 9 h16 v9 h-16 Z M4 9 l8 5 l8 -5',
    gazda: 'M3 18 L7 6 L12 12 L17 6 L21 18 Z',
    start: 'M12 4 v16',
  };
  return (
    <svg viewBox="0 0 24 24" className="node-glyph">
      <path d={map[kind]} fill={kind === 'elita' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function MapView() {
  const run = useGame((s) => s.run);
  const chooseNode = useGame((s) => s.chooseNode);
  const scrollRef = useRef<HTMLDivElement>(null);

  const layout = useMemo(() => {
    if (!run) return null;
    const nodes = Object.values(run.map.nodes);
    const maxX = Math.max(...nodes.map((n) => n.px)) + 160;
    const maxY = Math.max(...nodes.map((n) => n.py)) + 120;
    return { nodes, maxX, maxY };
  }, [run]);

  useEffect(() => {
    // scroll to current/available area
    if (!scrollRef.current || !run) return;
    const cur = run.map.currentNodeId ? run.map.nodes[run.map.currentNodeId] : null;
    const x = cur ? cur.px : 0;
    scrollRef.current.scrollTo({ left: Math.max(0, x - 200), behavior: 'smooth' });
  }, [run]);

  if (!run || !layout) return null;
  const { nodes, maxX, maxY } = layout;

  return (
    <div className="scene map-scene vignette fade-in">
      <TopBar />
      <div className="map-banner">
        <span className="map-act">Sloj I — Jav</span>
        <span className="map-hint">Šuma živih · izaberi put</span>
      </div>

      <div className="map-scroll" ref={scrollRef}>
        <div className="map-canvas" style={{ width: maxX, height: maxY }}>
          <svg className="map-edges" width={maxX} height={maxY}>
            {nodes.flatMap((n) =>
              n.next.map((nx) => {
                const m = run.map.nodes[nx];
                if (!m) return null;
                const active = n.visited && (m.available || m.visited);
                return (
                  <path
                    key={`${n.id}-${nx}`}
                    d={`M ${n.px + 26} ${n.py + 26} C ${n.px + 80} ${n.py + 26}, ${m.px - 28} ${m.py + 26}, ${m.px + 26} ${m.py + 26}`}
                    className={`map-edge ${active ? 'edge-active' : ''}`}
                  />
                );
              }),
            )}
          </svg>
          {nodes.map((n) => {
            const isCurrent = run.map.currentNodeId === n.id;
            return (
              <button
                key={n.id}
                className={[
                  'map-node',
                  `node-${n.kind}`,
                  n.available ? 'node-available' : '',
                  n.visited ? 'node-visited' : '',
                  isCurrent ? 'node-current' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ left: n.px, top: n.py }}
                disabled={!n.available}
                onClick={() => chooseNode(n.id)}
                title={KIND_LABEL[n.kind]}
              >
                <NodeGlyph kind={n.kind} />
                <span className="node-label">{KIND_LABEL[n.kind]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
