import { useEffect, useState } from "react";
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
    const [content, setContent] = useState(savedContent);
    const submit = useSubmit();
    const navigate = useNavigate();

    const webapp = window.Telegram.WebApp;
    const backButton = webapp.BackButton;
    const mainButton = webapp.MainButton;

    useEffect(() => {
        mainButton.setText("Save and go back");
        mainButton.show();
        backButton.show();

        webapp.expand();
        webapp.enableClosingConfirmation();

        webapp.ready();

        return () => {
            mainButton.hide();
            backButton.hide();

            webapp.disableClosingConfirmation();
        };
    }, []);

    const onMainButton = async () => {
        submit({ content: content }, {
            method: "post",
        });
    };

    const onBackButton = () => {
        if (content === savedContent) {
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
    };

    useEffect(() => {
        mainButton.onClick(onMainButton);
        backButton.onClick(onBackButton);

        return () => {
            mainButton.offClick(onMainButton);
            backButton.offClick(onBackButton);
        };
    }, [content]);


    return (
        <Form method="post">
            <textarea
                defaultValue={savedContent}
                name="content"
                className="edit-area"
                value={content}
                onChange={e => setContent(e.target.value)}
            ></textarea>
        </Form>
    );
}

export default Edit;