# Triglav — Image-Gen Promptovi (ChatGPT / gpt-image-1 / DALL·E 3)

Kompletna lista promptova za generisanje prave art za **sve assete u igri**.
Igra radi i bez slika (proceduralni canvas fallback) — čim ubaciš PNG sa tačnim imenom,
loader (`src/assets/loader.ts`) ga automatski prepozna i prikaže.

> **Naziv fajla = ID iz ovog dokumenta.** Npr. prompt označen `ugriz.png` snimi kao
> `public/assets/cards/ugriz.png`. Vidi mapiranje foldera na dnu dokumenta.

---

## 1. STIL (primjenjuje se na SVE promptove)

Globalna umjetnička direkcija — drži je konzistentnom kroz cijelu igru:

> **Pixel art, 16-bit / 32-bit estetika (u duhu Slay the Spire i klasičnih SNES RPG-ova),
> slavenski mitološki vibe.** Ručno-crtani osjećaj, čiste ivice, ograničena ali bogata
> paleta, dramatično osvjetljenje i sjenčenje. Tonovi po sloju:
> - **Prav** (gornji svijet, bogovi/svjetlost): zlatni, kraljevski, topli, magični.
> - **Jav** (srednji svijet, živi): prirodni zemljani tonovi — mahovina, breza, zalazak.
> - **Nav** (donji svijet, mrtvi): mračni, krvavo-crveni, hladne sjene, magla.
>
> **Tehnički:**
> - Sprite-ovi (likovi, neprijatelji): **transparentna pozadina, PNG 512×512**, cijelo tijelo, blago okrenuto ka kameri.
> - Card art (portreti karata): **PNG 320×448** (ili 4:3 landscape ako želiš da popuni art-prozor karte), bez teksta/okvira — samo ilustracija.
> - Ikone relikvija: **transparentna pozadina, PNG 512×512**, centrirana, ornamentална.
> - Ikone napitaka: **transparentna pozadina, PNG 256×256**, bočica.
> - Pozadine: **PNG 1920×1080**, atmosferičan pejzaž, bez likova.
>
> **Bez teksta, bez watermark-a, bez okvira/border-a osim ako je traženo.**

**Savjet za konzistentnost:** na početku ChatGPT sesije zalijepi ovaj stil-blok kao
"system" instrukciju, pa onda šalji prompte ispod jedan po jedan. Svaki prompt već ima
kratki stil-sufiks da radi i samostalno.

---

## 2. A) LIKOVI (igrive klase)

Igra trenutno koristi **idle** sprite (`player_<klasa>.png`). Poze (attack/hurt) i portret su
opcioni za buduće animacije — generiši ih ako želiš bogatiju prezentaciju.

1. **player_vukodlak.png** — Vukodlak, idle: A fierce Slavic werewolf warrior standing upright, thick brown-grey fur, glowing yellow eyes, long claws, tattered leather straps, feral but heroic stance, moonlit rim light. Pixel art sprite, 16-bit, full body, transparent background, PNG 512×512.
2. **player_vukodlak_attack.png** — Vukodlak, napad poza: same werewolf mid-lunge, claws slashing forward, fur bristling, red rage aura, dynamic motion. Pixel art sprite, transparent background, PNG 512×512.
3. **player_vukodlak_hurt.png** — Vukodlak, povrijeđen: same werewolf recoiling, one claw up to guard, snarling in pain, slight blood. Pixel art sprite, transparent background, PNG 512×512.
4. **player_vjestica.png** — Vještica, idle: A Slavic witch (vještica), dark layered hooded robes, pale gaunt face, glowing pale-green eyes, holding bundled herbs and a bone charm, faint mist at her feet. Pixel art sprite, 16-bit, full body, transparent background, PNG 512×512.
5. **player_vjestica_attack.png** — Vještica, napad poza: same witch casting, hands wreathed in green-violet hex energy, swirling runes, leaves spinning. Pixel art sprite, transparent background, PNG 512×512.
6. **player_vjestica_hurt.png** — Vještica, povrijeđena: same witch flinching, robe whipping, charm cracked, pained expression. Pixel art sprite, transparent background, PNG 512×512.

**Portreti za izbor klase (opciono, PNG 640×640):**

7. **portrait_vukodlak.png** — Dramatic close-up bust of the werewolf warrior, glowing yellow eyes, bared fangs, moonlit, painterly pixel art portrait, dark vignette, PNG 640×640.
8. **portrait_vjestica.png** — Dramatic close-up bust of the Slavic witch, hood shadowing her face, glowing green eyes, drifting embers, painterly pixel art portrait, dark vignette, PNG 640×640.

---

## 3. B) KARTE

Format: `**fajl.png** — Naziv (Klasa, Tip, efekt): prompt`.
Sufiks za sve: *Pixel art card illustration, 16-bit, dark Slavic folklore, dramatic lighting, no text, transparent or scene background, PNG 320×448.*

### Vukodlak (Bijes)

1. **ugriz.png** — Ugriz (Napad, 6 štete): A lone werewolf lunging with a single savage claw swipe, sharp motion lines, splatter of saliva. *[stil sufiks]*
2. **krzno.png** — Krzno (Vještina, 5 štita): A thick grey wolf pelt cloak wrapped around a hunched figure, frost on the fur, defensive warmth. *[stil sufiks]*
3. **razjari.png** — Razjari (Napad, 8 štete + Ranjivost + Bijes): An enraged werewolf roaring, crimson rage aura erupting outward, an enemy flinching back. *[stil sufiks]*
4. **zamah.png** — Zamah (Napad, 4×2): Two overlapping claw-slash arcs cutting through the air, double impact. *[stil sufiks]*
5. **nalet.png** — Nalet (Napad, 7 + Bijes): A werewolf charging headlong, dust and snow trailing behind, lunging silhouette. *[stil sufiks]*
6. **stit_kostiju.png** — Štit od kostiju (Vještina, 8 štita + Bijes): A shield assembled from bones and antlers, carved runes glowing faintly. *[stil sufiks]*
7. **urlik.png** — Urlik (Vještina, sve Nemoć): A werewolf howling at the sky, visible sound waves rippling outward under moonlight. *[stil sufiks]*
8. **krvozednost.png** — Krvožednost (Napad, pogubni): A bloody fanged maw biting down, crimson splatter, hungry red eyes. *[stil sufiks]*
9. **pomama.png** — Pomama (Vještina, 2 Bijesa + vuci): Frenzied glowing wolf eyes, swirling adrenaline energy, blurred motion. *[stil sufiks]*
10. **zubi_kandze.png** — Zubi i kandže (Napad, skalira s Bijesom): Extreme close-up of bared fangs and outstretched dripping claws. *[stil sufiks]*
11. **tvrda_koza.png** — Tvrda koža (Vještina, štit + Oklop): Hardened hide turning into overlapping bark-and-iron plates over muscle. *[stil sufiks]*
12. **pokolj.png** — Pokolj (Napad, 15 štete): A massive two-clawed overhead cleave, brutal downward arc, dust burst. *[stil sufiks]*
13. **zavijanje.png** — Zavijanje (Vještina, 3 Bijesa, gubiš zdravlje): A werewolf howling at a blood-red moon, self-clawing, drops of blood falling. *[stil sufiks]*
14. **trzaj.png** — Trzaj (Napad, 3 + vuci): A quick flicking claw jab, small fast strike with speed lines. *[stil sufiks]*
15. **razderotina.png** — Razderotina (Napad, 6 + Ranjivost): Raking claws tearing flesh open, exposed gash, ragged edges. *[stil sufiks]*
16. **okrilje_noci.png** — Okrilje noći (Vještina, 12 štita + vuci 2): A figure cloaked in living night, shadows wrapping protectively, stars above. *[stil sufiks]*
17. **iznenadni_skok.png** — Iznenadni skok (Napad, 8 + bonus uz štit): A werewolf leaping down from above, pouncing silhouette against the moon. *[stil sufiks]*
18. **grebanje.png** — Grebanje (Napad, 3×3): Three parallel rapid claw scratches, triple slash marks glowing. *[stil sufiks]*
19. **krvavi_pir.png** — Krvavi pir (Moć, +Snaga svaki potez): A feast of blood, a glowing red ritual sigil, rising power aura. *[stil sufiks]*
20. **zvjerska_snaga.png** — Zvjerska snaga (Moć, +Snaga): Bulging beastly muscles, glowing veins of raw power in the arms. *[stil sufiks]*
21. **brutalnost.png** — Brutalnost (Vještina, AoE = Bijes): A shockwave of pure rage bursting outward, red explosion hitting multiple foes. *[stil sufiks]*
22. **preobrazaj.png** — Preobražaj (Vještina, Bijes + Snaga): A human mid-transformation into a werewolf, bones cracking, dramatic shift. *[stil sufiks]*
23. **krvava_zetva.png** — Krvava žetva (Napad, 8×2 + lijek): Scythe-like claws reaping, ribbons of blood flowing back into the wolf. *[stil sufiks]*
24. **neman.png** — Neman (Napad, 12 + Bijes): A towering monstrous werewolf form, hulking and terrifying, glowing eyes. *[stil sufiks]*
25. **probadanje.png** — Probadanje (Napad, 5, iscrpi, vuci): A swift piercing claw thrust, the wolf half-vanishing in motion blur. *[stil sufiks]*
26. **vukodlacki_bijes.png** — Vukodlački bijes (Napad rijetka, troši sav Bijes, AoE + lijek): An explosive full transformation, all-out rage blast radius under a blood moon. *[stil sufiks]*
27. **krvavi_mjesec.png** — Krvavi mjesec (Moć rijetka, +2 Snage svaki potez): A huge blood-red full moon hanging over a howling wolf silhouette, ongoing power. *[stil sufiks]*
28. **zvjerski_gnjev.png** — Zvjerski gnjev (Napad rijetka, X-cijena): Unleashed fury, a storm of overlapping claw strikes, surging energy. *[stil sufiks]*
29. **mesarenje.png** — Mesarenje (Napad rijetka, 9×3): A butchering frenzy, three brutal converging strikes, visceral. *[stil sufiks]*
30. **pradavni_vuk.png** — Pradavni vuk (Moć rijetka, +Snaga +Bijes): An ancient primordial dire-wolf spirit, immense, glowing eyes, ghostly fur. *[stil sufiks]*
31. **neukrotivost.png** — Neukrotivost (Vještina rijetka, štit + Trnje): A wild untamed beast bristling with thorns and spikes, defensive fury. *[stil sufiks]*

### Vještica (Otrov & kletve)

32. **v_ubod.png** — Ubod iglom (Napad, 6 štete): A witch jabbing forward with a long bone needle, a single sharp puncture. *[stil sufiks]*
33. **v_veo.png** — Veo magle (Vještina, 5 štita): A veil of grey mist swirling protectively around a cloaked witch. *[stil sufiks]*
34. **v_uros.png** — Urok trovanja (Vještina, 5 Otrova): A witch casting a dripping green poison hex, sickly tendrils reaching out. *[stil sufiks]*
35. **v_napoj.png** — Mračni napoj (Vještina, Otrov + Nemoć): A dark potion poured out, sickly green fumes curling upward. *[stil sufiks]*
36. **v_zagasi.png** — Ugarak (Napad, 7 štete): A glowing ember hurled forward, scorching orange trail. *[stil sufiks]*
37. **v_isparenja.png** — Isparenja (Vještina, sve Otrov): Toxic green vapors spreading low across the ground over enemies. *[stil sufiks]*
38. **v_uzdah.png** — Uzdah vjetra (Vještina, 8 štita): A protective gust of wind, dry leaves swirling around the witch. *[stil sufiks]*
39. **v_crna_macka.png** — Crna mačka (Napad, 5 + Ranjivost): A black cat hissing with arched back, an ill-omen evil eye glowing. *[stil sufiks]*
40. **v_zaziv.png** — Zaziv duhova (Vještina, vuci): A witch summoning, faint ghostly wisps drawn toward her outstretched hand. *[stil sufiks]*
41. **v_otrovni_dah.png** — Otrovni dah (Napad, 4 + Otrov): A venomous green cloud exhaled from the witch's mouth. *[stil sufiks]*
42. **v_uvenuce.png** — Uvenuće (Napad, 6 + bonus uz Otrov): Plants and flesh withering and blackening, decay spreading outward. *[stil sufiks]*
43. **v_gavran.png** — Jato gavrana (Napad, 4×2 + Otrov): A flock of black ravens diving to attack, scattered feathers. *[stil sufiks]*
44. **v_katalizator.png** — Katalizator (Vještina, udvostruči Otrov, iscrpi): An alchemical catalyst vial, a bubbling green reaction amplifying. *[stil sufiks]*
45. **v_odjek.png** — Odjek (Vještina, sljedeća karta dvaput): A magical ripple echoing, a spell mirrored into two overlapping sigils. *[stil sufiks]*
46. **v_mrak.png** — Mrak (Vještina, sve Nemoć + Ranjivost): Engulfing darkness, living shadow swallowing the enemies whole. *[stil sufiks]*
47. **v_napitak.png** — Napitak moći (Moć, +Spretnost): A shimmering blue potion radiating quickening light. *[stil sufiks]*
48. **v_so_pepeo.png** — So i pepeo (Vještina, sve Krhkost): Salt and grey ash scattered in an arc, a brittle withering curse. *[stil sufiks]*
49. **v_kuga.png** — Kuga (Vještina rijetka, sve 8 Otrova, iscrpi): A plague cloud swarming with flies, sickly green pestilence over all. *[stil sufiks]*
50. **v_senka.png** — Sjenovitost (Vještina rijetka, Sjenovit): The witch dissolving into a translucent ghostly shadow, untouchable. *[stil sufiks]*
51. **v_morina_kletva.png** — Morina kletva (Moć rijetka, otrov-aura): The Mora nightmare spirit hovering behind the witch, perpetual green poison aura. *[stil sufiks]*

### Neutralne

52. **n_udar.png** — Tup udar (Napad, 8, iscrpi): A heavy blunt fist/club impact, single shockwave, dust. *[stil sufiks]*
53. **n_okrjepa.png** — Okrepa (Vještina, lijek, iscrpi): Restorative herbs and soft green healing light cupped in hands. *[stil sufiks]*
54. **n_oprez.png** — Oprez (Vještina, štit + Spretnost): A wary defensive crouch, raised guard, alert eyes. *[stil sufiks]*
55. **n_zamor.png** — Iscrpljujući udarac (Napad, 6 + Nemoć): A draining strike, grey energy being sapped from the enemy. *[stil sufiks]*

### Stanja i kletve (negativne karte)

56. **rana.png** — Rana (Stanje, neigrivo): A raw bleeding wound on torn flesh, painful and useless, muted greys and red. *[stil sufiks]*
57. **opekotina.png** — Opekotina (Stanje, šteta na kraju poteza): A smoldering ember burning a hand, glowing cinders and smoke. *[stil sufiks]*
58. **kletva_jad.png** — Jad (Kletva, mrtav teret): A heavy black sorrowful teardrop, oppressive grief, desaturated. *[stil sufiks]*
59. **kletva_klin.png** — Klin u srcu (Kletva, nestaje na kraju poteza): An iron spike piercing a faintly glowing ethereal heart. *[stil sufiks]*

---

## 4. C) NEPRIJATELJI (sloj Jav)

Igra koristi **idle** sprite (`<id>.png`). Generiši `_attack` i `_death` frame-ove za
buduću animaciju ako želiš. Svi: *Pixel art sprite, 16-bit, full body, transparent background, PNG 512×512.*

### Obični

1. **drekavac.png** — Drekavac, idle: a screaming undead child-spirit, pale wispy translucent ghost, gaping mouth frozen mid-shriek, hollow red eyes, tattered shroud trailing into mist. *[sufiks]*
   - **drekavac_attack.png** — same, mouth wide open emitting a piercing scream shockwave.
   - **drekavac_death.png** — same, dissipating into pale wisps.
2. **vodnjak.png** — Vodnjak, idle: a vodyanoy water demon, bloated greenish frog-like river spirit, dripping reeds and algae, webbed clawed hands, drowned mournful eyes, fins. *[sufiks]*
   - **vodnjak_attack.png** — lunging forward, water surging around its claws.
   - **vodnjak_death.png** — collapsing into a puddle and reeds.
3. **bauk.png** — Bauk, idle: a dark lurking under-the-floor monster, shadowy hunched clawed beast, matted fur, two glowing orange eyes in the gloom. *[sufiks]*
   - **bauk_attack.png** — pouncing with both claws raked forward.
   - **bauk_death.png** — sinking back into shadow.
4. **mora.png** — Mora, idle: a Mora nightmare spirit, gaunt violet wraith woman, suffocating presence, long hair drifting, glowing pink-red eyes, semi-transparent. *[sufiks]*
   - **mora_attack.png** — reaching out with both hands toward the viewer's chest.
   - **mora_death.png** — unraveling into purple smoke.
5. **karakondzula.png** — Karakondžula, idle: a winter demon, blue-grey horned humanoid covered in frost and icicles, hunched and bulky, freezing breath, pale ice-blue eyes. *[sufiks]*
   - **karakondzula_attack.png** — swinging a heavy icy fist/club.
   - **karakondzula_death.png** — shattering into ice shards.
6. **vuk.png** — Izgladnjeli vuk, idle: a starving grey wolf, ribs showing through mangy fur, snarling with bared teeth, hungry yellow eyes, lean and twitchy. *[sufiks]*
   - **vuk_attack.png** — leaping bite, jaws wide.
   - **vuk_death.png** — collapsing on its side.
7. **senka.png** — Senka, idle: a living detached shadow, an amorphous pitch-black blob with two glowing violet eyes, edges wavering like smoke. *[sufiks]*
   - **senka_attack.png** — stretching a tendril of darkness forward.
   - **senka_death.png** — evaporating into wisps.
8. **grobna_vjestica.png** — Grobna vještica, idle: a grave witch, hunched green-skinned hag with a gnarled staff, bones and roots woven into her rags, glowing yellow eyes, hooked nose. *[sufiks]*
   - **grobna_vjestica_attack.png** — slamming her staff down, green hex sparks.
   - **grobna_vjestica_death.png** — crumbling to dust and roots.

### Elite

9. **vampir.png** — Vampir, idle (elite): a Slavic vampire, dark red-and-black caped undead nobleman, deathly pale skin, fangs, blood-red eyes, clawed hands, regal and menacing. *[sufiks]*
   - **vampir_attack.png** — swooping with cape spread, fangs bared for a bite.
   - **vampir_death.png** — turning to ash and bats.
10. **azdaja.png** — Aždaja mladunče, idle (elite): a young three-headed dragon (azhdaja), green scales, small leathery wings, stubby horns, smoke curling from three maws, still growing but fearsome. *[sufiks]*
    - **azdaja_attack.png** — all three heads breathing fire forward.
    - **azdaja_death.png** — collapsing, wings folding, smoke fading.
11. **lesnik.png** — Lešnik, idle (elite): a Leshy forest giant, towering humanoid of bark and gnarled wood, mossy beard, great antlers, glowing green eye-hollows, roots for feet. *[sufiks]*
    - **lesnik_attack.png** — bringing down a massive bark fist, splinters flying.
    - **lesnik_death.png** — crumbling into a pile of logs and leaves.

---

## 5. D) BOSS-EVI

1. **babaroga.png** — Babaroga, idle (Gazda sloja Jav): a terrifying hag boss, towering hunched crone in black rags, twisted horns, a great sack on her back (where she stuffs the disobedient), gnarled clawed hands snuffing out nearby flames, blood-red glowing eyes, oppressive darkness around her. Imposing, dramatic, larger than normal enemies. *Pixel art sprite, 16-bit, full body, transparent background, PNG 640×640.*
   - **babaroga_attack.png** — lunging to grab with both clawed hands, sack gaping open, surrounding lights guttering out.
   - **babaroga_phase2.png** — enraged second phase: eyes blazing brighter, shadows swallowing the background, mouth open in a shriek.
   - **babaroga_death.png** — collapsing as her sack tears open and pale wisps escape.

> **Planirani gazde (vidi sekciju PLANIRANO):** `vodnjak_gazda` (Jav→Nav prelaz),
> `veles` i `crnobog` (finalni, sa po 3 fazne varijacije).

---

## 6. E) RELIKVIJE ("blagodati")

Svi: *Pixel art icon, ornate, single object, centered, soft glow, transparent background, PNG 512×512.*

1. **pasje_srce.png** — Pasje srce: a warm glowing red heart with a wolf fang embedded, encircled by a small golden frame, still faintly beating. *[sufiks]*
2. **vucja_koza.png** — Vučja koža: a folded grey wolf pelt with the head still attached, hanging. *[sufiks]*
3. **perunov_kamen.png** — Perunov kamen: a dark thunderstone etched with blue lightning runes, faint electric crackle (fell from the sky where lightning struck an oak). *[sufiks]*
4. **mokosin_vez.png** — Mokošin vez: an embroidered red-and-white folk cloth with a protective Slavic Mokosh weaving pattern. *[sufiks]*
5. **amajlija.png** — Amajlija: a hanging talisman/amulet shaped like a protective eye, beads and a small bone, ward against evil. *[sufiks]*
6. **crni_petao.png** — Crni pijetao: a carved black rooster figurine with a single glossy black tail feather. *[sufiks]*
7. **runski_kamen.png** — Runski kamen: a flat grey stone carved with glowing Slavic-style runes. *[sufiks]*
8. **crna_kokos.png** — Crna kokoš: a small black hen charm/figurine, folk fetish object. *[sufiks]*
9. **kovacev_nakovanj.png** — Kovačev nakovanj: a small iron anvil with orange sparks flying off it. *[sufiks]*
10. **trnov_vijenac.png** — Trnov vijenac: a twisted crown of dark thorns with a few drops of blood. *[sufiks]*
11. **divlje_srce.png** — Divlje srce: a wild crimson heart sprouting small claws, pulsing with red glow. *[sufiks]*
12. **zlatni_zub.png** — Zlatni zub: a single gleaming golden tooth/fang. *[sufiks]*
13. **putnikova_torba.png** — Putnikova torba: a worn leather traveler's satchel, buckles and straps. *[sufiks]*
14. **medvjeda_sapa.png** — Medvjeđa šapa: a large brown bear paw with extended claws, talisman. *[sufiks]*
15. **velesov_rog.png** — Velesov rog: an ornate cattle drinking horn of Veles, banded with metal, mead dripping. *[sufiks]*
16. **svarogov_ugljen.png** — Svarogov ugljen: a glowing ember/coal radiating heat, sparks rising (from Svarog's heavenly forge). *[sufiks]*
17. **zmajev_zub.png** — Zmajev zub: a large curved dragon fang, faintly translucent. *[sufiks]*
18. **zora_i_sumrak.png** — Zora i sumrak: an amulet split in half — one side golden sun (dawn), other silver moon (dusk). *[sufiks]*
19. **mrtvacka_para.png** — Mrtvačka para: a weathered skull with sickly green vapor rising from its eye sockets. *[sufiks]*
20. **zlatna_jabuka.png** — Zlatna jabuka: a radiant golden apple of youth with a single green leaf. *[sufiks]*

---

## 7. F) NAPICI

Svi: *Pixel art potion flask icon, glass bottle with cork, glowing liquid, transparent background, PNG 256×256.*

1. **napitak_snage.png** — Napitak snage: a flask of glowing deep-red liquid radiating raw strength. *[sufiks]*
2. **napitak_okretnosti.png** — Napitak okretnosti: a flask of swirling cyan-blue liquid, quick and light. *[sufiks]*
3. **krvavi_napitak.png** — Krvavi napitak: a flask of dark crimson blood, thick and ominous. *[sufiks]*
4. **napitak_energije.png** — Napitak energije: a flask of bright golden liquid crackling with light. *[sufiks]*
5. **napitak_bijesa.png** — Napitak bijesa: a flask of bubbling angry crimson-orange liquid, frothing. *[sufiks]*
6. **otrovni_napitak.png** — Otrovni napitak: a flask of toxic bubbling green poison, dripping fumes. *[sufiks]*
7. **napitak_vatre.png** — Napitak vatre: a flask of orange liquid with tiny flames flickering inside. *[sufiks]*
8. **napitak_stita.png** — Napitak štita: a flask of pale icy-blue liquid with a shimmering protective sheen. *[sufiks]*

---

## 8. G) POZADINE (slojevi)

Svi: *Detailed pixel art landscape background, 16-bit, atmospheric, no characters, no UI, PNG 1920×1080.*

1. **jav.png** — Sloj Jav (igra koristi ovo sada): a misty birch forest at golden-hour sunset, white birch trunks, mossy earthy ground, low fog drifting between trees, shafts of warm light, natural earthy tones, mystical and quiet. *[sufiks]*
2. **prav.png** — Sloj Prav (planirano): rolling golden divine meadows under a warm summer sun, ancient grassy burial mounds (kurgans) and carved wooden idols, regal warm light, sky bright and sacred. *[sufiks]*
3. **nav.png** — Sloj Nav (planirano): a blackened underworld of cracked ruins and bone-strewn ground under a huge blood-red moon, cold creeping fog, dead trees, dark dramatic crimson-and-black palette. *[sufiks]*

**Opciono:**

4. **menu.png** — Glavni meni: a brooding wide vista bridging all three worlds vertically (golden sky above, misty forest middle, dark underworld below), a three-faced wooden Triglav idol silhouette centered, moody and epic. PNG 1920×1080.

---

## 9. H) UI ELEMENTI (opciono)

Transparentne pozadine, PNG po potrebi.

1. **ui_card_frame.png** — An ornate carved wooden Slavic card frame/border with subtle folk knotwork in the corners, empty center, PNG 384×512.
2. **ui_energy.png** — A glowing golden energy orb/crystal with a carved rune, PNG 256×256.
3. **ui_gold.png** — A small leather pouch spilling gold coins, PNG 128×128.
4. **ui_relic_frame.png** — A circular golden medallion frame for relic icons, empty center, PNG 128×128.

> Napomena: igra trenutno crta okvire karata, energetsku kuglu i HUD proceduralno (CSS/canvas);
> ovi UI ass/eti nisu auto-učitani loader-om i traže ručno uvezivanje ako ih želiš koristiti.

---

## 10. PLANIRANO (još nije u igri — za buduće faze)

Ovi promptovi prate roadmap (slojevi Prav/Nav, dodatne klase, finalni bossevi). Generiši ih
unaprijed ako želiš; loader će ih pokupiti čim odgovarajući sadržaj bude dodan u kod.

### Dodatne klase

1. **player_junak.png** — Junak (heroj-ratnik, combo mehanika): a Slavic bogatyr hero in lamellar armor and a pointed helm, round shield and broadsword, braided beard, confident heroic stance. Sprite, transparent, PNG 512×512.
2. **player_junak_attack.png** — same hero mid sword-combo swing, motion arcs.
3. **player_hajduk.png** — Hajduk (odmetnik, stealth/zlato): a Balkan hajduk outlaw in dark wool and a fur cap, flintlock pistol and yatagan knife, bandolier, sly half-hidden in shadow. Sprite, transparent, PNG 512×512.
4. **player_hajduk_attack.png** — same outlaw firing from the shadows / ambush lunge.

### Neprijatelji Prav / Nav

5. **vila.png** — Vila: a Slavic fairy/nymph, ethereal pale woman in white with translucent wings, long hair, faint glow (Prav). Sprite, transparent, PNG 512×512.
6. **div.png** — Div: a giant of Prav, huge bearded humanoid in ancient garb, stony skin, immense. Sprite, transparent, PNG 512×512.
7. **vrag.png** — Vrag: a Slavic devil/imp, small horned black-red demon, forked tail, sly grin, embers (Nav). Sprite, transparent, PNG 512×512.
8. **upir.png** — Upir: a feral risen corpse vampire, rotting, bloated, clawed, grave-dirt (Nav). Sprite, transparent, PNG 512×512.
9. **zmaj.png** — Zmaj: a full-grown Slavic dragon, large winged serpent, fire (Nav elite). Sprite, transparent, PNG 640×640.
10. **navije.png** — Navije: restless souls of the unbaptized dead, swarm of pale screaming wraiths (Nav). Sprite, transparent, PNG 512×512.

### Finalni bossevi (sa faznim varijacijama)

11. **veles.png** — Veles (bog podzemlja, finalni): a towering horned god of the underworld, part-serpent part-bull, draped in furs and gold, holding a staff, surrounded by mist and cattle horns, immense and ancient. Boss sprite, transparent, PNG 768×768.
    - **veles_phase2.png** — Veles shifting into his great serpent form, coiling, scales gleaming.
    - **veles_phase3.png** — Veles enraged, eyes blazing, underworld erupting behind him.
12. **crnobog.png** — Černobog (Crni bog, alternativni finalni): a pitch-black god of darkness and misfortune, jagged silhouette, burning red cracks across obsidian skin, crown of black horns, devouring shadow. Boss sprite, transparent, PNG 768×768.
    - **crnobog_phase2.png** — Černobog splitting into living shadow tendrils.
    - **crnobog_phase3.png** — Černobog as a vast shadow maw, only burning eyes and cracks visible.

---

## 11. KAKO KORISTITI (ChatGPT komande)

1. Otvori **ChatGPT** i izaberi model sa image generacijom (**GPT-4o / gpt-image-1**, ili **DALL·E 3**).
2. (Preporučeno) Prvo zalijepi **STIL blok** iz sekcije 1 kao uvodnu instrukciju da svi
   assети budu konzistentni.
3. Zalijepi **jedan prompt** (zamijeni `*[stil sufiks]*` punim stil-sufiksom te kategorije iz
   sekcije 1) i generiši sliku.
4. **Snimi sliku tačno pod imenom fajla** navedenim uz prompt (npr. `ugriz.png`).
5. Po potrebi: u ChatGPT-u zatraži "remove background / make background transparent" za
   sprite-ove, relikvije i napitke (card art i pozadine mogu imati pozadinu).
6. Ubaci fajlove u odgovarajući folder:

```
public/assets/
  sprites/   → likovi i neprijatelji   (player_vukodlak.png, drekavac.png, babaroga.png, …)
  cards/     → karte                    (ugriz.png, v_uros.png, …)
  relics/    → relikvije                (pasje_srce.png, velesov_rog.png, …)
  potions/   → napici                   (napitak_snage.png, …)
  bg/        → pozadine slojeva         (jav.png, prav.png, nav.png)
```

7. Osvježi igru (`npm run dev`). **Igra automatski prepozna i prikaže slike** umjesto
   proceduralnog placeholder-a. Fajlovi koji nedostaju → ostaje proceduralni art. Nije
   potrebno mijenjati kod.

> **Batch savjet:** generiši prvo `sprites/` (najveći vizuelni efekat — zamjenjuje canvas
> monstrume), pa `bg/jav.png`, pa `cards/`, pa `relics/` i `potions/`.

---

### Sažetak količine

| Kategorija | Promptova (u igri) | + poze/faze | + planirano |
|---|---|---|---|
| Likovi | 2 idle (+2 portreta, +4 poze) | | +4 |
| Karte | 59 | | |
| Neprijatelji | 11 idle | +22 (attack/death) | +6 |
| Bossevi | 1 (Babaroga) | +3 faze/poze | +2 (+6 faza) |
| Relikvije | 20 | | |
| Napici | 8 | | |
| Pozadine | 1 aktivna (+2 sloja, +meni) | | |
| UI | 4 (opciono) | | |

**Ukupno ~150 promptova za trenutni sadržaj, 200+ uključujući poze, faze i planirano.**
