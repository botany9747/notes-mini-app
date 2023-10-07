# Basic Notes

Simple single page CRUD Telegram mini app developed with React that uses Telegram CloudStorage for store and deploys to GitHub Pages.

## Use cases

- Create new notes
- Review existing notes
- Update existing notes
- Delete notes

## Development Quickstart

Just make a **public** fork of this repository and hack away.

Your fork will be deployed to `https://<USERNAME>.github.io/notes-mini-app` and you can set this URL as Web App URL with @BotFather

*NOTE* Make sure **not** to change repository name when forking.
Otherwise, update `base` in [vite.config.js](./vite.config.js) and `basename` in [main.jsx](./src/main.jsx) appropriately.

## Local Development Quickstart

1. install [ngrok](https://ngrok.com/)
1. clone this repo with `git clone`
1. install the dependencies with `npm install`
1. start the local HTTP server with `npm run dev`
1. expose your local HTTP server to the internet with `ngrok http 5173`

ngrok will give you an HTTPS URL that you can give to @BotFather. Don't forget to add `/notes-mini-app/` at the end.

## Before you start

This mini app makes heavy use of react and react-router-dom frameworks.

Both of these frameworks provide excellent quickstart tutorials [tic-tac-toe](https://react.dev/learn/tutorial-tic-tac-toe) for react and [contacts](https://reactrouter.com/en/main/start/tutorial) app for react-router-dom.

If you are completely unfamiliar with react or react-router-dom I would strongly encourage you skim through these pages first.

##

Below you will find a brief explanation for each of the most important files for functionality of this mini app.

### Initialization script in [index.html](./index.html)

Here you can find the most important part for integrating with Telegram, initialization script `<script src="https://telegram.org/js/telegram-web-app.js"></script>`.

This script will make `window.Telegram.WebApp` object available.

https://core.telegram.org/bots/webapps#initializing-mini-apps

### Routes in [main.js](./src/main.jsx)

Here you can find an overview of all different routes of this app.

Currently there are only two:

- `/notes-mini-app/`
When user navigates to this route they will get a list of all notes they have. `Notes` component is responsible for rendering this page.
- `/notes-mini-app/edit/:noteId`
When user navigates to `/notes-mini-app/edit/<UUID>` they will get a window for editing that particular note. `Edit` component is responsible for this one.

Here you can also find actions and loaders:

- [loader](https://reactrouter.com/en/main/route/loader) in simple terms is a function that is used to load some data before the page renders, here it will be used to fetch notes from the CloudStorage.
- [action](https://reactrouter.com/en/main/route/action) in simple terms is a function that is used when that particular page sends any HTTP requests besides GET, e.g. POST or DELETE.

### Notes component in [notes.jsx](./src/routes/notes.jsx)

This component is responsible for showing user a list of notes.

- create a loader that will fetch an index of all the notes
- create an action that will be used to delete notes on DELETE submit
- setup telegram's MainButton to create a new note and redirect us to edit it
- setup a callback on the long press that uses the action above with a confirmation PopUp from Telegram


### Edit component in [edit.jsx](./src/routes/edit.jsx)

This component is responsible for showing user an edit window for the note.

- create a loader that fetches the saved content of a note
- create an action that will save the content of a note
- setup telegram's MainButton to call the action above and redirect us to the list of all the `Notes`
- setup telegram's BackButton to go back or show a Warning PopUp if there are unsaved changes

### Storage manipulation in [storage.js](./src/storage.js)

Here we define a set of functions that will manipulate the storage of notes.
