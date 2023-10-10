# Basic Notes

Simple single page CRUD Telegram mini app developed with React that uses Telegram CloudStorage for store and deploys to GitHub Pages.

Implemented bot can be accessed here: https://t.me/basic_notes_bot/notes

## Use cases

- Create new notes
- Review existing notes
- Update existing notes
- Delete notes

## Development Quickstart

Just make a **public** fork of this repository, enable GitHub pages with GitHub Actions (Settings -> Pages -> Source: GitHub Actions) and hack away.

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

This component is responsible for showing user a list of notes. Mainly we do the following here:

- create a loader that will fetch the index of all the notes
- create a callback that will delete a note
- setup telegram's MainButton to create a new note and redirect us to edit it
- setup a callback on the long press that uses the action above with a confirmation PopUp from Telegram

#### Getting data with useLoaderData

`useLoaderData` runs the loader at the top of the file. It does so because we specified the loader for this route in `main.jsx`.

It's only ran exactly once when this specific route loads, i.e. when you navigate to the page `/notes-mini-app/`.

You can read more about loaders in the react-router-dom quickstart [here](https://reactrouter.com/en/main/start/tutorial#loading-data).

#### useState to track the changes to notes

We don't want to reload the page every time we make a change to the list of notes because it would take too much time and too much of our cellular data.
`useState` gives a way to update the list of notes when it changes.

It's a principal concept in react and you can hear more about `useState` [here](https://www.youtube.com/watch?v=O6P86uwfdR0).

#### useEffect to show Telegram's MainButton and it's throbber

`useEffect` is a react hook that takes as an argument a function and an array. It works as follows: the callback will only be run once a value in the array changes.

```js
useEffect(() => {
    mainButton.setText("Create a new note"); // 2
    mainButton.enable();
    mainButton.show();

    return () => mainButton.disable(); // 3
}, []); // 1
```

1. We provide an empty array as the second argument. This means that the callback will be run only once, only when the page loads.
2. Once the page loads, we setup and show the Mini App's MainButton
3. Once the page unloads, we disable the button so that button can no longer be pressed.
We could also `hide()` it here to clean it up, however if your next page also shows MainButton (as in our case with `Edit`) then the button may blink (it will hide and then be shown again).

```js
const navigation = useNavigation();

useEffect(() => {
    if (navigation.state === "idle") {
        mainButton.hideProgress();
    } else {
        mainButton.showProgress();
    }
}, [navigation]);
```

`useNavigation` is a hook from react-router-dom which gives us a way to check the current state of the web page. It will tells is it loading or not.

When the page is loading we will show the throbber on the MainButton and when it fully loads we will hide it.

[Here](https://youtu.be/0ZJgIjIuY7U?si=oNt53HgA-kIZKIOf)'s a helpful video explaining `useEffect` in more detail.
[Here](https://reactrouter.com/en/main/start/tutorial#global-pending-ui)'s the note about `useNavigation` in the `react-router-dom` quickstart.


#### useCallback and useLongPress to delete a note

`useCallback` is really useful when we need to define a function inside the body of our react component but also want to save memory. It works exactly like `useEffect` in the way it changes only in reaction to the values in the second-argument-array. You can hear more about it [here](https://youtu.be/_AyFP5s69N4?si=BQe31k9npcknO3tv).

`useLongPress` is a hook that is useful for detecting long presses on elements. `onCancel` defines a function that is called when user releases before a press is considered a long press. We use it as `OnClick` here, so we navigate to the next page. You can read more about `useLongPress` [here](https://minwork.gitbook.io/long-press-hook/).

`useNavigate` gives us a way to navigate to different pages programmatically.


### Edit component in [edit.jsx](./src/routes/edit.jsx)

This component is responsible for showing user an edit window for the note.

- create a loader that fetches the saved content of a note
- create an action that will save the content of a note
- setup telegram's MainButton to call the action above and redirect us to the list of all the `Notes`
- setup telegram's BackButton to go back or show a Warning PopUp if there are unsaved changes

### Storage manipulation in [storage.js](./src/storage.js)

Here we define a set of functions that will manipulate the storage of notes. You can read more about the layout of the storage in the file comments.

For data-usage optimization we split the note metadata from the content of the note itself.

### Browser compression API in [compress.js](./src/compress.js)

In a Telegram Mini App we can utilize builtin browser functionality, e.g. Browser Compression API for compressing values before we store them.