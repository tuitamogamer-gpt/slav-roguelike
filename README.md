# Triglav — Slavenski Roguelike Deckbuilder

Roguelike deckbuilder u duhu *Slay the Spire*, smješten u svijet slavenske mitologije.
Probijaš se kroz tri svijeta triglavske kosmologije — **Prav · Jav · Nav** — gradeći špil
karata, skupljajući relikvije (blagodati) i obarajući mitska bića sve do gazde sloja.

> Napravljeno u jednoj sesiji sa Claude Code (Opus 4.8). Igra, ne demo: prava borbena
> petlja, dvije igrive klase, proceduralna mapa, relikvije, događaji, trgovac, gazda,
> meta-progresija, proceduralni zvuk i particle efekti.

---

## Pokretanje

```bash
npm install
npm run dev      # razvojni server na http://localhost:5173
npm run build    # produkcijski build u dist/ (static, spreman za Vercel/Netlify)
npm run preview  # pregled produkcijskog builda
```

Igra je potpuno klijentska — nema servera, nema baze. Napredak se čuva u `localStorage`.

---

## Kako se igra

1. **Izaberi junaka** — Vukodlak (Bijes) ili Vještica (otrov i kletve, otključava se pobjedom).
2. **Biraj put kroz mapu** — svaki čvor je borba, elita, događaj, trgovac, odmor, blago ili gazda.
3. **Borba** — odigraj karte trošeći energiju (moć). Klikni kartu; ako treba metu, klikni neprijatelja.
   Desni klik otkazuje ciljanje. Neprijatelji **telegrafiraju** svoj sljedeći potez (intent).
4. **Nakon borbe** — uzmi zlato, izaberi 1 od 3 karte, ponekad napitak ili relikviju.
5. **Obori Babarogu**, gazdu sloja Jav, da pobijediš.

### Mehanike klasa

- **Vukodlak — Bijes:** gradiš stakove Bijesa; karte „Pojačane bijesom“ rastu s njim, a neke
  ga troše za eksplozivan učinak. Što duže borba traje, to si smrtonosniji.
- **Vještica — Otrov & kletve:** truješ neprijatelje koji venu potez za potezom; katalizatori
  množe otrov, a kletve i odjeci pretvaraju strpljenje u pokolj.

### Statusi

Ranjivost (+50% štete), Nemoć (−25% nanesene štete), Krhkost (−25% štita), Snaga, Spretnost,
Bijes, Otrov, Trnje, Oklop, Obred, Sjenovitost, Odjek…

---

## Sadržaj

- **2 klase** sa ~30 (Vukodlak) i ~20 (Vještica) karata + neutralne karte, statusi i kletve.
- **12 bića** sa zasebnim AI obrascima i intent sistemom, uključujući 3 elite i gazdu **Babarogu**
  sa dvije faze.
- **~20 relikvija** sa run-mijenjajućim efektima.
- **8 napitaka.**
- **6 tekstualnih događaja** sa izborima i posljedicama.
- **Proceduralna mapa** — granajući DAG sa 60+ čvorova po sloju.
- **Meta-progresija** — pobjede/porazi, otključavanje Vještice, zbirka (bestijarij + biblioteka).

---

## Tehnologija

- **TypeScript + Vite + React** (UI, scene, state)
- **Zustand** (state management; combat state je čista, serijalizabilna data → laki save)
- **Canvas 2D** za sve vizuale:
  - **Proceduralna bića** (`src/render/creatures.ts`) — stilizovani folklorni monstrumi crtani
    putanjama i sjenčenjem, sa idle animacijom i sjajem očiju (bez emoji/SVG ikonica).
  - **Particle sistem** (`src/components/ParticleCanvas.tsx`) — krv, iskre, sjene, otrov, štit.
  - **Ikone relikvija/napitaka** (`src/render/icons.ts`).
- **Web Audio API** (`src/game/audio/audio.ts`) — proceduralni SFX i ambijentalna petlja
  u molskom (eolskom) modusu, slavenskog prizvuka. Bez vanjskih audio fajlova.

### Arhitektura

```
src/
  game/
    types.ts             # cijeli tipski sistem
    engine/              # combat, mapgen, rng, run, rewards (čista logika)
    content/             # karte, bića, relikvije, napici, događaji, registry
    store/               # zustand store + save (localStorage)
    audio/               # proceduralni zvuk
  render/                # canvas crtanje (bića, ikone)
  components/            # React scene i UI
  styles/                # dizajn sistem
```

Combat logika je odvojena od renderiranja preko **FX queue-a**: engine gura događaje
(`hit`, `block`, `heal`, `death`…), a `CombatView` ih pretvara u floating brojeve, screen
shake, hit-flash i particle bursteve. Neprijateljski potez se izvršava **korak po korak**
(stepped) radi boljeg osjećaja.

---

## Feel

Drag/hover animacije karata, lepeza ruke, telegrafirani intenti, floating damage brojevi,
screen shake na teške udarce, hit-flash, particle bursteve, pulsirajuća energetska kugla,
proceduralni soundtrack i SFX, ručno ugođena tamna folklorna paleta i tipografija
(Cinzel / EB Garamond).

---

## Status (v0.1.0)

Sloj **Jav** je u potpunosti igriv od starta do gazde. Slojevi **Prav** i **Nav**,
treća/četvrta klasa i Ascension težine su predviđeni za naredne verzije (skeleton tipova
i mapgena već podržava više slojeva).

Poznata ograničenja: ako napustiš igru usred borbe, borbeno stanje se ne čuva (čuva se run
napredak na mapi). Desktop only (bez touch/mobile).

---

## Krediti

Dizajn, kod i umjetnost generisani proceduralno. Slavenska mitologija kao inspiracija:
Babaroga, Drekavac, Vodnjak, Bauk, Mora, Karakondžula, Vampir, Aždaja, Lešnik, Vještica…
