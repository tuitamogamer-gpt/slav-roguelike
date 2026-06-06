import { useEffect } from 'react';
import { useGame } from './game/store/gameStore';
import { initAudio } from './game/audio/audio';
import MainMenu from './components/MainMenu';
import ClassSelect from './components/ClassSelect';
import MapView from './components/MapView';
import CombatView from './components/CombatView';
import RewardScreen from './components/RewardScreen';
import ShopView from './components/ShopView';
import RestView from './components/RestView';
import EventView from './components/EventView';
import Compendium from './components/Compendium';
import Settings from './components/Settings';
import EndScreen from './components/EndScreen';

export default function App() {
  const screen = useGame((s) => s.screen);
  const bootstrap = useGame((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
    const unlock = () => initAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [bootstrap]);

  return (
    <div className="app-root">
      {screen === 'menu' && <MainMenu />}
      {screen === 'classSelect' && <ClassSelect />}
      {screen === 'map' && <MapView />}
      {screen === 'combat' && <CombatView />}
      {screen === 'reward' && <RewardScreen />}
      {screen === 'shop' && <ShopView />}
      {screen === 'rest' && <RestView />}
      {screen === 'event' && <EventView />}
      {screen === 'compendium' && <Compendium />}
      {screen === 'settings' && <Settings />}
      {(screen === 'gameover' || screen === 'victory') && <EndScreen />}
      <div className="noise" />
    </div>
  );
}
