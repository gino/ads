import DropboxChooser from "react-dropbox-chooser";
import { allowedFileExtensions } from "../constants";
import { useUploadContext } from "../upload-context";
import { createUploadedCreative } from "../upload-form";

export function DropboxButton() {
    const { form } = useUploadContext();

    return (
        <DropboxChooser
            appKey={import.meta.env.VITE_DROPBOX_API_KEY}
            success={async (files) => {
                const creatives = await Promise.all(
                    files.map(async (dbFile) => {
                        const response = await fetch(dbFile.link);
                        const blob = await response.blob();
                        const file = new File([blob], dbFile.name, {
                            type: blob.type || "application/octet-stream",
                        });

                        return createUploadedCreative(file);
                    })
                );

                // Add toast

                form.setData("creatives", [
                    ...form.data.creatives,
                    ...creatives,
                ]);
            }}
            multiselect={true}
            linkType="direct"
            extensions={allowedFileExtensions}
        >
            <button className="bg-white font-semibold flex justify-center items-center gap-2 shadow-base px-3.5 py-2.5 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out w-full">
                <i className="-ml-0.5 fa-brands fa-dropbox text-[#0061FE]" />
                <span>Choose from Dropbox</span>
            </button>
        </DropboxChooser>
    );
}
