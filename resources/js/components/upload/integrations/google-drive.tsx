import { useEffect, useRef } from "react";
import useDrivePicker from "react-google-drive-picker";
import { allowedFileMimeTypes } from "../constants";
import { useUploadContext } from "../upload-context";
import { createUploadedCreative } from "../upload-form";

export function GoogleDriveButton() {
    const { form } = useUploadContext();

    const [openPicker, authResponse] = useDrivePicker();
    let accessToken = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (authResponse?.access_token !== undefined) {
            accessToken.current = authResponse?.access_token;
        }
    }, [authResponse?.access_token]);

    return (
        <button
            onClick={() => {
                openPicker({
                    clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
                    developerKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
                    token: accessToken.current,
                    viewId: "DOCS",
                    showUploadView: true,
                    showUploadFolders: true,
                    supportDrives: true,
                    multiselect: true,
                    viewMimeTypes: allowedFileMimeTypes.join(","),
                    callbackFunction: async (data) => {
                        if (data.action === "picked" && data.docs) {
                            const creatives = await Promise.all(
                                data.docs.map(async (doc) => {
                                    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`;
                                    const response = await fetch(downloadUrl, {
                                        headers: {
                                            Authorization: `Bearer ${accessToken.current}`,
                                        },
                                    });

                                    if (!response.ok) {
                                        throw new Error(
                                            `Failed to download file: ${response.statusText}`
                                        );
                                    }

                                    const blob = await response.blob();
                                    const file = new File([blob], doc.name, {
                                        type: blob.type || doc.mimeType,
                                    });

                                    return createUploadedCreative(file);
                                })
                            );

                            // Add toast

                            form.setData("creatives", [
                                ...form.data.creatives,
                                ...creatives,
                            ]);
                        }
                    },
                });
            }}
            className="bg-white font-semibold flex justify-center items-center gap-2 shadow-base px-3.5 py-2.5 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out"
        >
            <i className="-ml-0.5 fa-brands fa-google-drive text-[#4285F4]" />
            <span>Choose from Google Drive</span>
        </button>
    );
}
