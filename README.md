# AXL Studios Site

## Struttura attuale

- `index.html`: shell della pagina e contenuto semantico.
- `styles.css`: stylesheet globale attuale, ancora monolitico.
- `assets/js/main.js`: comportamento client-side della pagina.
- `assets/fonts/`: font locali.
- `assets/icons/`: icone e favicon.
- `assets/`: media statici condivisi.

## Convenzioni

- Evitare script inline in `index.html`: nuova logica va in `assets/js/main.js`.
- Evitare `style="..."` inline: creare classi riusabili nei file CSS dedicati.
- I video decorativi devono restare opzionali: su mobile o con `prefers-reduced-motion` non vanno caricati.
- Per CTA e pattern ripetuti, preferire classi modificatrici come `--center` o `--start`.
- Le regole condivise non devono finire nei file di sezione: prima si valuta `main.css`, poi `layout.css`, poi `components.css`.

## Struttura CSS consigliata

Se il file CSS continua a crescere, la struttura consigliata e` questa:

- `assets/css/main.css`
- `assets/css/layout.css`
- `assets/css/components.css`
- `assets/css/sections/hero.css`
- `assets/css/sections/about.css`
- `assets/css/sections/services.css`
- `assets/css/sections/projects.css`
- `assets/css/sections/team.css`
- `assets/css/sections/toolkit.css`
- `assets/css/sections/faq.css`
- `assets/css/sections/contact.css`
- `assets/css/sections/footer.css`

## Cosa contiene `main.css`

`main.css` e` il file fondativo. Deve contenere solo cio` che serve a tutto il sito, senza dipendere da una sezione specifica.

- reset globale (`*`, `html`, `body`)
- `@font-face`
- variabili CSS in `:root`
- regole globali per tipografia, immagini, video e wrapping testo
- comportamento globale come `scroll-behavior`
- regole di accessibilita` trasversali come `prefers-reduced-motion`
- helper globali davvero condivisi da tutto il sito
- eventuali utility minime e stabili, non legate a una singola sezione

In `main.css` non devono finire:

- navbar
- footer strutturale
- bottoni specifici di componente
- form dei contatti
- regole di una sezione singola

## Cosa contiene `layout.css`

`layout.css` contiene la struttura orizzontale e verticale del sito, cioe` tutto quello che governa contenitori, allineamenti e shell generale.

- wrapper principali
- container e padding condivisi
- navbar e comportamento visivo del menu
- griglie o allineamenti strutturali condivisi
- safe area e regole di impaginazione globale
- footer se viene trattato come parte di layout strutturale

## Cosa contiene `components.css`

`components.css` contiene elementi riusabili in piu` sezioni.

- CTA e bottoni (`pp-btn`, `pp-service-cta`, badge, varianti)
- card glass condivise
- divider
- campi form riusabili
- select custom
- messaggi stato form
- piccoli pattern UI ripetuti in piu` blocchi

Se una regola viene usata in due o piu` sezioni, prima va valutata qui.

## Cosa contiene `hero.css`

- hero section
- overlay hero
- video/background hero
- titolo principale e sottotitolo hero
- spaziature e responsive della hero

## Cosa contiene `about.css`

- sezione storytelling/about
- titolo, sottotitolo e griglia colonne
- citazione finale
- background e responsive specifici del blocco about

## Cosa contiene `services.css`

- header sezione servizi
- strip visuale dei servizi
- track orizzontale e viewport servizi
- card servizio e testo interno
- varianti di layout specifiche della sezione servizi

Nota: il bottone condiviso resta in `components.css`; qui restano solo eventuali aggiustamenti di contesto.

## Cosa contiene `projects.css`

- header sezione progetti
- hero progetto
- split layout dei progetti
- pannelli laterali progetto
- immagini, stack e responsive della sezione progetti

## Cosa contiene `team.css`

- header sezione team
- video/background team
- colonne team
- foto, nomi, ruoli e bio
- CTA contestuale del blocco team se strutturalmente legata alla sezione

## Cosa contiene `toolkit.css`

- header toolkit
- blocchi categorie toolkit
- griglie icone/tool
- CTA contestuale del toolkit se dipende dal layout della sezione
- responsive specifico del blocco toolkit

## Cosa contiene `faq.css`

- header FAQ
- lista FAQ
- riga domanda/risposta
- chevron, stati aperto/chiuso
- spaziature e responsive specifici delle FAQ

## Cosa contiene `contact.css`

- header contatti
- riga `E-Mail / Social`
- form contatti
- consenso, messaggi di stato, responsive del form
- eventuali varianti locali delle card o del form che non sono davvero riusabili altrove

## Cosa contiene `footer.css`

- hero/logo footer
- griglia footer
- social footer
- navigation footer
- claim finale e CTA footer

## Regola pratica di manutenzione

Quando aggiungi una regola CSS, la domanda corretta e`:

- e` globale? allora `main.css`
- e` struttura condivisa? allora `layout.css`
- e` un componente riusabile? allora `components.css`
- e` legata a una sola sezione? allora nel file della sezione

Questa e` la divisione da seguire quando verra` smontato l'attuale `styles.css`.
