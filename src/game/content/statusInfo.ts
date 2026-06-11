import type { Status } from '../types';

// Player-facing explanations for every status effect, shown as tooltips
// on status pips and in the keyword hint panel while hovering a card.
export const STATUS_INFO: Record<Status, { label: string; desc: string }> = {
  vulnerable: { label: 'Ranjiv', desc: 'Prima 50% više štete od napada. Smanjuje se za 1 na kraju poteza.' },
  weak: { label: 'Nemoć', desc: 'Napadi nanose 25% manju štetu. Smanjuje se za 1 na kraju poteza.' },
  frail: { label: 'Krhkost', desc: 'Štit koji dobijaš je 25% slabiji. Smanjuje se za 1 na kraju poteza.' },
  strength: { label: 'Snaga', desc: 'Svaki napad nanosi toliko dodatne štete.' },
  dexterity: { label: 'Spretnost', desc: 'Svaka karta štita daje toliko dodatnog štita.' },
  bjes: { label: 'Bijes', desc: 'Gorivo Vukodlaka: karte „Pojačane bijesom" jače su za svaki Bijes. Neke ga troše odjednom.' },
  poison: { label: 'Otrov', desc: 'Na početku poteza gubi toliko zdravlja, pa se smanjuje za 1. Zaobilazi štit.' },
  regen: { label: 'Obnova', desc: 'Na kraju poteza liječi toliko zdravlja.' },
  thorns: { label: 'Trnje', desc: 'Ko god te udari napadom, prima toliko štete nazad.' },
  intangible: { label: 'Sjenovit', desc: 'Sva primljena šteta smanjena na 1. Traje navedeni broj poteza.' },
  metal: { label: 'Oklop', desc: 'Na kraju poteza daje toliko štita. Smanjuje se za 1 kad primiš neblokirani udarac.' },
  ritual: { label: 'Obred', desc: 'Na početku svakog poteza dobija toliko Snage. Raste vremenom!' },
  kletva: { label: 'Kletva', desc: 'Na početku tvog poteza svi neprijatelji dobijaju toliko Otrova.' },
  okovi: { label: 'Okovi', desc: 'Preskače sljedeći potez (omamljen).' },
  echo: { label: 'Odjek', desc: 'Sljedeća odigrana karta igra se dvaput.' },
};

// Terms matched against card text — shown in the hint panel on card hover.
// Order matters: longer/more specific first.
export const CARD_KEYWORDS: { match: RegExp; label: string; desc: string }[] = [
  { match: /[Rr]anjiv/, label: 'Ranjiv', desc: STATUS_INFO.vulnerable.desc },
  { match: /[Nn]emoć/, label: 'Nemoć', desc: STATUS_INFO.weak.desc },
  { match: /[Kk]rhkost/, label: 'Krhkost', desc: STATUS_INFO.frail.desc },
  { match: /[Ss]nag[aeu]/, label: 'Snaga', desc: STATUS_INFO.strength.desc },
  { match: /[Ss]pretnost/, label: 'Spretnost', desc: STATUS_INFO.dexterity.desc },
  { match: /[Bb]ijes/, label: 'Bijes', desc: STATUS_INFO.bjes.desc },
  { match: /[Oo]trov/, label: 'Otrov', desc: STATUS_INFO.poison.desc },
  { match: /[Tt]rnj[ae]/, label: 'Trnje', desc: STATUS_INFO.thorns.desc },
  { match: /[Oo]klop/, label: 'Oklop', desc: STATUS_INFO.metal.desc },
  { match: /[Ss]jenovit/, label: 'Sjenovit', desc: STATUS_INFO.intangible.desc },
  { match: /[Oo]djek|igra se dvaput|igraju se dvaput/, label: 'Odjek', desc: STATUS_INFO.echo.desc },
  { match: /štita?\b/, label: 'Štit', desc: 'Upija štetu umjesto zdravlja. Nestaje na početku tvog sljedećeg poteza.' },
  { match: /[Ii]scrpi/, label: 'Iscrpi', desc: 'Nakon igranja karta se uklanja iz špila do kraja borbe.' },
  { match: /[Ii]zvuci/, label: 'Izvuci', desc: 'Odmah vuče dodatne karte iz špila za vučenje.' },
  { match: /energij/, label: 'Energija', desc: 'Moć za igranje karata. Obnavlja se na početku svakog poteza.' },
  { match: /početku svakog poteza/, label: 'Moć', desc: 'Trajni efekat koji djeluje do kraja borbe.' },
];

export function keywordsForText(text: string): { label: string; desc: string }[] {
  const found: { label: string; desc: string }[] = [];
  for (const k of CARD_KEYWORDS) {
    if (k.match.test(text) && !found.some((f) => f.label === k.label)) {
      found.push({ label: k.label, desc: k.desc });
    }
  }
  return found.slice(0, 4);
}
