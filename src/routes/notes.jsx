import { useCallback, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { createNote, getIndex, deleteNote } from "../storage";
import { useLongPress } from 'use-long-press';

export async function loader() {
    const index = await getIndex().catch((error) => {
        console.log(error);
        return null;
    });
    return index ? index : [];
}

function Notes() {
    if (!window.Telegram.WebApp.isVersionAtLeast('6.2')) {
        throw new Error("Unsupported version of Telegram Bot API");
    }

    const savedNotes = useLoaderData();
    const [notes, setNotes] = useState(savedNotes);
    const navigate = useNavigate();

    const onLongPressDelete = useCallback((_event, { context: noteId }) => {
        const webapp = window.Telegram.WebApp;
        webapp.HapticFeedback.impactOccurred("medium");

        const deleteId = "delete";
        const popupParams = {
            message: "Delete this note?",
            buttons: [
                {
                    id: deleteId,
                    type: "destructive",
                    text: "Delete",
                },
                {
                    type: "cancel",
                },
            ]
        };

        webapp.showPopup(popupParams, async (buttonId) => {
            if (buttonId !== deleteId) {
                return;
            }
            setNotes([...notes.filter((note) => note.id != noteId)]);
            await deleteNote(noteId);
        });
    }, [notes]);

    const bind = useLongPress(onLongPressDelete,
        {
            // this is called when user releases the button before it is considered a longpress
            onCancel: (_event, { context: noteId }) => navigate(`/edit/${noteId}`)
        }
    );

    const onMainButton = useCallback(async () => {
        window.Telegram.WebApp.MainButton.disable();
        const noteId = await createNote();
        navigate(`/edit/${noteId}`);
    }, [navigate]);

    useEffect(() => {
        const mainButton = window.Telegram.WebApp.MainButton;

        mainButton.setText("Create a new note");
        mainButton.show();
        mainButton.enable();
        mainButton.onClick(onMainButton);

        return () => {
            mainButton.offClick(onMainButton);
            mainButton.hide();
        };
    }, [onMainButton]);


    return (
        <>
            {notes.length ? (
                <div className="note-card-list">
                    {notes.map((note) => (
                        <div key={note.id} {...bind(note.id)} className="note-card-container">
                            <div className="note-card-title">{note.title ? note.title : "No title"}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p id="note-card-empty">No notes</p>
            )}
        </>
    );

}

export default Notes;