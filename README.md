# Sfera IT Archive Client

Sfera IT Archive Client è un'applicazione web per la gestione e la consultazione degli archivi di messaggi. Questa applicazione è stata creata utilizzando [Create React App](https://github.com/facebook/create-react-app).

## Requisiti

- Node.js 24.x
- npm 11 o compatibile con il lockfile

## Installazione

1. Clona il repository:

    ```sh
    git clone https://github.com/tuo-username/sfera-it-archive-client.git
    cd sfera-it-archive-client
    ```

2. Installa le dipendenze:

    ```sh
    npm install
    ```

## Avvio dell'Applicazione in Locale

Per avviare l'applicazione in modalità di sviluppo, esegui:

```sh
npm start
```

Apri [http://localhost:3000](http://localhost:3000) nel tuo browser per visualizzarla. La pagina si ricaricherà automaticamente quando apporti modifiche al codice.

## Autenticazione e deep link

Il callback OAuth consegna il JWT nel fragment `#token=...`. Il client lo copia in
`sessionStorage` (quindi resta limitato alla scheda) e rimuove immediatamente il
fragment dalla cronologia. Il vecchio parametro query `?token=...` è accettato solo
come compatibilità di migrazione ed è rimosso nello stesso modo. I link di
navigazione e i permalink dell'archivio non devono mai contenere il token.

Un messaggio archiviato è raggiungibile con un deep link privo di credenziali:

```text
https://sferaarchive-client.vercel.app/?channel=C0BSUCGHU8G&thread_ts=1787395457.104349&message_ts=1787395460.204349
```

Se la sessione non è autenticata, il client invia al backend un `return_to`
relativo e validato. Dopo OAuth il deep link viene ripristinato, il thread è
caricato tramite l'endpoint channel-scoped e il messaggio richiesto è evidenziato.
Non copiare JWT in configurazioni di debug, issue o log.

Le risposte del bot espongono sia il permalink Slack sia questo link durevole.
Il backend verifica nuovamente l'appartenenza ai canali privati prima di restituire
il thread, quindi il deep link non costituisce un'autorizzazione.

## Verifiche automatiche

La CI esegue installazione dal lockfile, test, audit delle sole dipendenze runtime
e build production senza source map. La toolchain Create React App rimane legacy:
gli advisory transitivi confinati agli strumenti di sviluppo non vengono ignorati,
ma non bloccano il deploy finché `npm audit --omit=dev` resta pulito.


## Deployment

Per effettuare il deployment dell'applicazione, è necessario seguire questi passaggi:

1. Effettua una pull request sul branch `main` del repository.
2. Una volta che la pull request è stata approvata, il deployment avverrà automaticamente.

L'applicazione sarà disponibile online all'indirizzo: [https://sferaarchive-client.vercel.app/](https://sferaarchive-client.vercel.app/)

Il processo di deployment è gestito automaticamente da Vercel.
