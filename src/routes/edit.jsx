import { useCallback, useEffect, useRef } from "react";
import { useLoaderData, Form, redirect, useNavigate, useSubmit } from "react-router-dom";
import { getNote, updateNote } from "../storage";

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
    if (!window.Telegram.WebApp.isVersionAtLeast('6.2')) {
        throw new Error("Unsupported version of Telegram Bot API");
    }

    const { content: savedContent } = useLoaderData();
    const contentRef = useRef(savedContent);
    const submit = useSubmit();
    const navigate = useNavigate();

    const onMainButton = useCallback(async () => {
        const mainButton = window.Telegram.WebApp.MainButton;

        mainButton.disable();
        submit({ content: contentRef.current }, {
            method: "post",
        });
    }, [submit]);

    const onBackButton = useCallback(() => {
        const webapp = window.Telegram.WebApp;

        if (contentRef.current === savedContent) {
            navigate(-1);
            return;
        }

        const closeId = "close";
        const popupParams = {
            title: "Warning",
            message: "Changes that you made will not be saved.",
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
    }, [navigate, savedContent]);

    useEffect(() => {
        const webapp = window.Telegram.WebApp;
        const mainButton = webapp.MainButton;
        const backButton = webapp.BackButton;

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
    }, [onBackButton, onMainButton]);

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