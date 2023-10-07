import { useCallback, useEffect } from "react";
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
        webapp.showConfirm("Press OK to delete",
            (confirm) => {
                if (!confirm) {
                    return;
                }
                submit({ noteId }, {
                    method: "delete"
                });
            });
    });
    const bind = useLongPress(onLongPressDelete);

    const mainButton = webapp.MainButton;
    const onMainButton = async () => {
        const note = await createNote();
        navigate(`/edit/${note.id}`);
    };
    useEffect(() => {
        mainButton.setText("Create a new note");
        mainButton.show();
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
                        <Link to={`edit/${note.id}`} key={note.id} {...bind(note.id)} className="note-card-container">
                            <div className="note-card-title">{note.title ? note.title : "No title"}</div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p id="note-card-empty">No notes</p>
            )}
        </>
    );

}

export default Notes;