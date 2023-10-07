import { useCallback, useEffect, useState } from "react";
import { useLoaderData, Link, useSubmit, useNavigate, Form, redirect } from "react-router-dom";
import { createNote, getIndex, deleteNote } from "../storage";
import { useLongPress } from 'use-long-press';

export async function loader() {
    const index = await getIndex().catch((error) => {
        console.log(error);
        return null;
    });
    return index ? index : [];
}

export async function action({ request }) {
    const { noteId } = Object.fromEntries(await request.formData());
    await deleteNote(noteId);
    return redirect("/");
}

function Notes() {
    const notes = useLoaderData();
    const submit = useSubmit();
    const navigate = useNavigate();

    const webapp = window.Telegram.WebApp;
    const onLongPressDelete = useCallback((_event, { context: noteId }) => {
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
        webapp.showPopup(popupParams, (buttonId) => {
            if (buttonId !== deleteId) {
                return;
            }
            submit({ noteId }, {
                method: "delete"
            });
        });
    }, []);

    const bind = useLongPress(onLongPressDelete,
        {
            onCancel: (_event, { context: noteId }) => navigate(`/edit/${noteId}`)
        }
    );

    const mainButton = webapp.MainButton;
    const onMainButton = useCallback(async () => {
        mainButton.disable();
        const note = await createNote();
        navigate(`/edit/${note.id}`);
    }, []);

    useEffect(() => {
        mainButton.setText("Create a new note");
        mainButton.show();
        mainButton.enable();
        mainButton.onClick(onMainButton);

        return () => {
            mainButton.offClick(onMainButton);
            mainButton.hide();
        };
    }, []);


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