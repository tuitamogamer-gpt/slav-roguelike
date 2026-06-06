import type { RunState } from '../types';

export interface EventApi {
  run: RunState;
  heal: (n: number) => void;
  loseHp: (n: number) => void;
  gainGold: (n: number) => void;
  loseGold: (n: number) => void;
  gainMaxHp: (n: number) => void;
  loseMaxHp: (n: number) => void;
  addCard: (id: string, upgraded?: boolean) => void;
  addRandomCardOfRarity: (rarity: 'cesta' | 'neobicna' | 'rijetka') => string | null;
  removeRandomCard: () => string | null;
  upgradeRandomCard: () => string | null;
  addRelic: () => string | null;
  addCurse: () => void;
  addPotion: () => string | null;
  rng: () => number;
}

export interface EventChoice {
  label: string;
  desc?: string;
  // returns the outcome text shown after picking
  resolve: (api: EventApi) => string;
  enabled?: (run: RunState) => boolean;
}

export interface EventDef {
  id: string;
  title: string;
  art: string; // sprite/scene key
  text: string;
  choices: EventChoice[];
}

export const EVENTS: EventDef[] = [
  {
    id: 'rakija',
    title: 'Zaboravljeni podrum',
    art: 'cellar',
    text: 'U trošnoj kući nalaziš bačvu stare rakije od šljive. Miris je oštar, gotovo živ. Nešto u tebi šapće da popiješ — drugi glas savjetuje oprez.',
    choices: [
      {
        label: 'Popij sve',
        desc: 'Izliječi 12, ali dobiješ kletvu Jad.',
        resolve: (api) => {
          api.heal(12);
          api.addCurse();
          return 'Toplina ti se širi grudima, ali ostaje i mukli, gorak talog u duši.';
        },
      },
      {
        label: 'Ponesi bočicu',
        desc: 'Dobij napitak.',
        resolve: (api) => {
          const p = api.addPotion();
          return p
            ? 'Sipaš pažljivo u bočicu i spremaš za teža vremena.'
            : 'Torba ti je puna — proljevaš dragocjenu kap.';
        },
      },
      {
        label: 'Prospi i nastavi',
        desc: 'Ništa se ne događa.',
        resolve: () => 'Rakija curi među daske. Trijezan, krećeš dalje.',
      },
    ],
  },
  {
    id: 'raskrsce',
    title: 'Raskršće pod brijestom',
    art: 'crossroads',
    text: 'Tri puta se sastaju pod starim brijestom o kojem narod priča svašta. Ovdje se, kažu, sklapaju pogodbe sa silama koje ne treba zvati po imenu.',
    choices: [
      {
        label: 'Ponudi krv',
        desc: 'Izgubi 8 zdravlja, dobij relikviju.',
        resolve: (api) => {
          api.loseHp(8);
          const r = api.addRelic();
          return r
            ? 'Tama prihvata ponudu. U prašini blista nešto staro i moćno.'
            : 'Tama šuti. Krv je uzalud prolivena.';
        },
      },
      {
        label: 'Ponudi zlato',
        desc: 'Izgubi 75 zlata, ojačaj kartu.',
        enabled: (run) => run.gold >= 75,
        resolve: (api) => {
          api.loseGold(75);
          const c = api.upgradeRandomCard();
          return c
            ? 'Zveckanje novca utihne. Tvoje umijeće postaje oštrije.'
            : 'Novac nestaje, ali ništa se ne mijenja.';
        },
      },
      {
        label: 'Prekrsti se i prođi',
        resolve: () => 'Ne osvrćeš se. Brijest škripi za tobom na bezvjetrici.',
      },
    ],
  },
  {
    id: 'starica',
    title: 'Starica na pragu',
    art: 'crone',
    text: 'Pogrbljena starica sjedi pred kolibom i prede. „Putniče,“ kaže ne dižući pogled, „mogu ti uzeti teret koji nosiš — ili ti dati novi.“',
    choices: [
      {
        label: 'Neka ukloni teret',
        desc: 'Ukloni nasumičnu kartu iz špila.',
        resolve: (api) => {
          const c = api.removeRandomCard();
          return c
            ? 'Prsti joj se sklapaju oko sjećanja. Lakše ti je.'
            : 'Špil ti je već mršav; nema šta da uzme.';
        },
      },
      {
        label: 'Zatraži dar',
        desc: 'Dobij neobičnu kartu, ali izgubi 6 zdravlja.',
        resolve: (api) => {
          api.loseHp(6);
          const c = api.addRandomCardOfRarity('neobicna');
          return c
            ? 'Bol je oštra, ali znanje koje dobijaš vrijedno je toga.'
            : 'Krv curi uzalud.';
        },
      },
      {
        label: 'Odbij i pođi',
        resolve: () => 'Starica se smije bezubim ustima dok odlaziš.',
      },
    ],
  },
  {
    id: 'idol',
    title: 'Idol u gaju',
    art: 'idol',
    text: 'Drveni idol s tri lica stoji u svetom gaju. Pred njim leže darovi davno mrtvih: nešto zlata, ali i tragovi onih koji su uzeli previše.',
    choices: [
      {
        label: 'Uzmi zlato',
        desc: 'Dobij 90 zlata, ali dobij kletvu.',
        resolve: (api) => {
          api.gainGold(90);
          api.addCurse();
          return 'Zlato je teško u ruci. Tri lica te gledaju dok odlaziš.';
        },
      },
      {
        label: 'Prinesi dar',
        desc: 'Izgubi 50 zlata, dobij +8 maks. zdravlja.',
        enabled: (run) => run.gold >= 50,
        resolve: (api) => {
          api.loseGold(50);
          api.gainMaxHp(8);
          return 'Idol kao da odobrava. Osjećaš se snažnije, izdržljivije.';
        },
      },
      {
        label: 'Klanjaj se i prođi',
        resolve: () => 'Pognute glave prolaziš kroz gaj. Tišina je gusta.',
      },
    ],
  },
  {
    id: 'utopljenik',
    title: 'Glas iz rijeke',
    art: 'river',
    text: 'Iz tamne vode dopire tih plač. Bljedo lice utopljenika izranja: „Pomozi mi da nađem mir — ili uzmi što je sa mnom potonulo.“',
    choices: [
      {
        label: 'Pomozi duši',
        desc: 'Izliječi 15 zdravlja.',
        resolve: (api) => {
          api.heal(15);
          return 'Lice se smiruje i tone. Topla zahvalnost ostaje za njim.';
        },
      },
      {
        label: 'Zaroni za blagom',
        desc: 'Izgubi 10 zdravlja, dobij zlato i napitak.',
        resolve: (api) => {
          api.loseHp(10);
          api.gainGold(60);
          api.addPotion();
          return 'Pluća ti gore, ali izranjaš s punim šakama.';
        },
      },
      {
        label: 'Okreni se',
        resolve: () => 'Plač te prati uz obalu još dugo.',
      },
    ],
  },
  {
    id: 'vatra',
    title: 'Tuđa vatra',
    art: 'campfire',
    text: 'U noći zatičeš ugašeno ognjište i pored njega zaboravljen zavežljaj. Možeš ga pretražiti — ili zapaliti vatru i odmoriti.',
    choices: [
      {
        label: 'Pretraži zavežljaj',
        desc: 'Dobij nasumičnu relikviju ili kartu.',
        resolve: (api) => {
          if (api.rng() < 0.5) {
            const r = api.addRelic();
            if (r) return 'Među dronjcima — pravo blago.';
          }
          const c = api.addRandomCardOfRarity('cesta');
          return c ? 'Nalaziš zapis nečijeg umijeća.' : 'Samo prašina i moljci.';
        },
      },
      {
        label: 'Zapali vatru i odmori',
        desc: 'Izliječi 25% maksimalnog zdravlja.',
        resolve: (api) => {
          api.heal(Math.floor(api.run.maxHp * 0.25));
          return 'Plamen grije kosti. Po prvi put nakon dugo, spavaš mirno.';
        },
      },
    ],
  },
];
