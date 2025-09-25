import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
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

                toast({
                    contents: `Uploaded ${creatives.length} ${
                        creatives.length > 1 ? "creatives" : "creative"
                    }`,
                });

                form.setData("creatives", [
                    ...form.data.creatives,
                    ...creatives,
                ]);
            }}
            multiselect={true}
            linkType="direct"
            extensions={allowedFileExtensions}
        >
            <Button
                icon="fa-brands fa-dropbox text-[#0061FE]"
                className="w-full py-2.5"
            >
                Choose from Dropbox
            </Button>
        </DropboxChooser>
    );
}
