# Sfera IT Archive Client

Sfera IT Archive Client è un'applicazione web per la gestione e la consultazione degli archivi di messaggi. Questa applicazione è stata creata utilizzando [Create React App](https://github.com/facebook/create-react-app).

## Requisiti

- Node.js (versione 14 o superiore)
- npm (versione 6 o superiore) o yarn

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

## Token

Un token JWT può essere ottenuto dalla versione di produzione dell'applicazione. Segui questi passaggi per ottenerlo e utilizzarlo per il debug:

1. Accedi alla versione di produzione dell'applicazione.
2. Effettua il login per generare un token JWT.
3. Copia il token JWT dall'URL o dagli strumenti di sviluppo del browser.
4. Apri il file `launch.json` nel tuo progetto.
5. Inserisci il token JWT copiato nel campo appropriato per poter debuggare l'applicazione localmente.

Esempio di configurazione in `launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
      {
          "type": "chrome",
          "request": "launch",
          "name": "Debug React Run",
          "url": "http://localhost:3000?token=INSERISCI_IL_TOKEN_QUI",
          "webRoot": "${workspaceFolder}/src",
          "runtimeArgs": [
        "--disable-web-security",
      ],
      }
  ]
}
```

In questo modo, il token JWT verrà utilizzato durante il debug dell'applicazione. 


## Deployment

Per effettuare il deployment dell'applicazione, è necessario seguire questi passaggi:

1. Effettua una pull request sul branch `main` del repository.
2. Una volta che la pull request è stata approvata, il deployment avverrà automaticamente.

L'applicazione sarà disponibile online all'indirizzo: [https://sferaarchive-client.vercel.app/](https://sferaarchive-client.vercel.app/)

Il processo di deployment è gestito automaticamente da Vercel.

