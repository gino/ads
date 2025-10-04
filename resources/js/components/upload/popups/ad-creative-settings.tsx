import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useMemo } from "react";
import { useUploadContext } from "../upload-context";

export function AdCreativeSettingsPopup() {
    const {
        popupCreativeId,
        setPopupCreativeId,
        getCreativeSettings,
        updateCreativeSetting,
    } = useUploadContext();

    const isDisabled = useMemo(() => {
        return true;
    }, []);

    return (
        <Modal
            open={popupCreativeId !== null}
            setOpen={(value) => {
                if (!value) {
                    setPopupCreativeId(null);
                }
            }}
            hideOnInteractOutside={false}
        >
            <div className="p-5">
                <div>{popupCreativeId}</div>
            </div>

            {/* Modal footer */}
            <div className="p-5 sticky bottom-0 border-t border-gray-100 bg-white">
                <div className="flex gap-2 justify-end items-center">
                    <Button
                        onClick={() => {
                            setPopupCreativeId(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        disabled={isDisabled}
                        onClick={() => {
                            if (isDisabled) {
                                return;
                            }

                            setPopupCreativeId(null);
                        }}
                    >
                        Save changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
