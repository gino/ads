import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";

function MediaLibrary() {
    return (
        <div className="p-5">
            <div>yoyo</div>
        </div>
    );
}

export function MediaLibraryButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                Import from media library
            </Button>
            <MediaLibraryPopup open={open} setOpen={setOpen} />
        </>
    );
}

export function MediaLibraryPopup({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (value: boolean) => void;
}) {
    return (
        <Modal open={open} setOpen={setOpen} width="max-w-3xl">
            <MediaLibrary />
        </Modal>
    );
}
