import { useCallback, useEffect, useRef, useState } from "react";
import { useLoaderData, Form, redirect, useNavigate, useSubmit } from "react-router-dom";
import { getIndex, getNote, updateNote } from "../storage";

export async function loader({ params }) {
    const { noteId } = params;
    const note = await getNote(noteId);
    return note;
}

export async function action({ request, params }) {
    const { content } = Object.fromEntries(await request.formData());
    await updateNote(params.noteId, content);
    return redirect("/");
}

function Edit() {
    const { content: savedContent } = useLoaderData();
    const contentRef = useRef(savedContent);
    const submit = useSubmit();
    const navigate = useNavigate();
    const webapp = window.Telegram.WebApp;

    const mainButton = webapp.MainButton;

    const onMainButton = useCallback(async () => {
        mainButton.disable();
        submit({ content: contentRef.current }, {
            method: "post",
        });
    }, []);

    const backButton = webapp.BackButton;
    const onBackButton = useCallback(() => {
        if (contentRef.current === savedContent) {
            navigate(-1);
            return;
        }

        const closeId = "close";
        const popupParams = {
            title: "Warning",
            message: "Changes that you made may not be saved.",
            buttons: [
                {
                    id: closeId,
                    type: "destructive",
                    text: "Close anyway",
                },
                {
                    type: "cancel",
                },
            ]
        };

        webapp.showPopup(popupParams, (buttonId) => {
            if (buttonId === closeId) {
                navigate(-1);
            }
        });
    }, []);

    useEffect(() => {
        mainButton.setText("Save and go back");
        mainButton.onClick(onMainButton);
        mainButton.enable();
        mainButton.show();

        backButton.onClick(onBackButton);
        backButton.show();

        webapp.expand();
        webapp.enableClosingConfirmation();

        webapp.ready();

        return () => {
            mainButton.offClick(onMainButton);
            mainButton.hide();

            backButton.offClick(onBackButton);
            backButton.hide();

            webapp.disableClosingConfirmation();
        };
    }, []);

    return (
        <Form method="post">
            <textarea
                defaultValue={savedContent}
                name="content"
                className="edit-area"
                onChange={e => contentRef.current = e.target.value}
            ></textarea>
        </Form>
    );
}

export default Edit;