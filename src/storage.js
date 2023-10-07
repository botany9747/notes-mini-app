import { compressItem, decompressItem } from "./compress";

/*
    Contents of the storage
    <KEY>: <VALUE> (values are gzipped then encoded with base64)

    INDEX_KEY: [
        {
            id: uuid1,
            title: "Note 1",
        },
        {
            id: uuid2,
            title: "Note 2",
        }
    ]
    uuid1: "This is my first note"
    uuid2: "This is my second note"
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
        ...indexEntry
    };

    const index = await getIndex();
    const newIndex = index ? [indexEntry, ...index] : [indexEntry];
    await setItem(INDEX_KEY, await compressItem(newIndex));
    await setItem(id, await compressItem(note));
    return note;
};

export const updateNote = async (id, content) => {
    const note = await getNote(id);
    await setItem(id, await compressItem({
        ...note,
        content: content,
    }));
    let index = await getIndex();
    index[index.findIndex(object => object.id === id)].title = content.slice(0, 100);
    await setItem(INDEX_KEY, await compressItem(index));
};

export const deleteNote = async (id) => {
    const index = await getIndex();
    index.splice(index.findIndex(note => note.id === id), 1);
    await setItem(INDEX_KEY, await compressItem(index));
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