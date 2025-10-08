import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useEffect, useRef } from "react";
import useDrivePicker from "react-google-drive-picker";
import { allowedFileMimeTypes } from "../constants";
import { useUploadContext } from "../upload-context";
import { createUploadedCreative } from "../upload-form";

export function GoogleDriveButton() {
    const { setCreatives } = useUploadContext();

    const [openPicker, authResponse] = useDrivePicker();
    let accessToken = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (authResponse?.access_token !== undefined) {
            accessToken.current = authResponse?.access_token;
        }
    }, [authResponse?.access_token]);

    return (
        <Button
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
                            const mappedCreatives = await Promise.all(
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

                            toast({
                                contents: `Uploaded ${mappedCreatives.length} ${
                                    mappedCreatives.length > 1
                                        ? "creatives"
                                        : "creative"
                                }`,
                            });

                            setCreatives((prev) => [
                                ...prev,
                                ...mappedCreatives,
                            ]);
                        }
                    },
                });
            }}
            icon="fa-brands fa-google-drive text-[#4285F4]"
            className="w-full py-2.5"
        >
            Choose from Google Drive
        </Button>
    );
}
