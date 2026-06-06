# Assets folder

Ovdje idu slike koje generišeš preko ChatGPT-a (vidi `image-prompts.md` u root-u).
Igra radi i bez ijedne slike — koristi proceduralni canvas art kao fallback. Čim ubaciš
PNG sa tačnim imenom, igra ga automatski prepozna i prikaže.

## Struktura

```
public/assets/
  sprites/   player_vukodlak.png, player_vjestica.png, drekavac.png, babaroga.png, ...
  cards/     ugriz.png, razjari.png, v_uros.png, ...   (po ID-u karte)
  relics/    pasje_srce.png, velesov_rog.png, ...       (po ID-u relikvije)
  potions/   napitak_snage.png, krvavi_napitak.png, ... (po ID-u napitka)
  bg/        jav.png, prav.png, nav.png                 (pozadine slojeva)
```

Imena fajlova **moraju** odgovarati ID-evima iz `image-prompts.md`. Loader logika je u
`src/assets/loader.ts`.
