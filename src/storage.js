import { compressItem, decompressItem } from "./compress";

/*
    For data-usage optimization we separate the title of the note from it's content and gzip all values.

    Contents of the storage
    <KEY>: <VALUE> (values are gzipped then encoded with base64)

    INDEX_KEY: [
        {
            id: <random uuid>
            title: <first 100 characters of the note>
        },
        ...
    ]

    <some-uuid>: {
        content: <text of the note>
    }
*/
const INDEX_KEY = "0be28740-fc01-4947-9b2c-c33cc005428e";
export const getIndex = () => {
    return getItemDecompressed(INDEX_KEY);
};

export const getNote = (id) => {
    return getItemDecompressed(id);
};

export const createNote = async () => {
    const id = crypto.randomUUID();
    const indexEntry = {
        id: id,
        title: "No title",
    };
    const note = {
        content: "",
    };

    // update the index
    const index = await getIndex();
    const newIndex = index ? [indexEntry, ...index] : [indexEntry];
    await setItem(INDEX_KEY, await compressItem(newIndex));

    // create the object
    await setItem(id, await compressItem(note));
    return note;
};

export const updateNote = async (id, content) => {
    const note = await getNote(id);
    // update the note itself
    await setItem(id, await compressItem({
        ...note,
        content: content,
    }));
    // update title in the index
    let index = await getIndex();
    index[index.findIndex(object => object.id === id)].title = content.slice(0, 100);
    await setItem(INDEX_KEY, await compressItem(index));
};

export const deleteNote = async (id) => {
    // delete from index
    const index = await getIndex();
    index.splice(index.findIndex(note => note.id === id), 1);
    await setItem(INDEX_KEY, await compressItem(index));
    // delete the note itself
    await removeItem(id);
};

const getItemDecompressed = (key) => {
    return getItem(key).then(async (item) =>
        item !== "" ? await decompressItem(item) : null
    );
};

const getStorage = () => {
    const cloudStorage = window?.Telegram.WebApp.CloudStorage;
    return cloudStorage === undefined ? window.localStorage : cloudStorage;
};

const getItem = (key) => {
    return new Promise((resolve, reject) => {
        const storage = getStorage();
        try {
            storage.getItem(key, (error, item) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(item);
            });
        } catch (error) {
            reject(error);
            return;
        }
    });
};

const setItem = (key, value) => {
    return new Promise((resolve, reject) => {
        const storage = getStorage();
        try {
            storage.setItem(key, value, (error, isStored) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (!isStored) {
                    reject(new Error("value was not stored"));
                    return;
                }
                resolve();
            });
        } catch (error) {
            reject(error);
            return;
        }
    });
};

const removeItem = (key) => {
    return new Promise((resolve, reject) => {
        const storage = getStorage();

        try {
            storage.removeItem(key, (error, isDeleted) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (!isDeleted) {
                    reject(new Error("value was not deleted"));
                    return;
                }
                resolve();
            });
        } catch (error) {
            reject(error);
            return;
        }
    });
};