import { UploadedCreative } from "@/pages/upload";

interface Props {
    creative: UploadedCreative;
}

export function AdCreativePreview({ creative }: Props) {
    return (
        <div data-no-dnd>
            {creative.type.startsWith("video/") ? (
                <video
                    src={creative.preview}
                    className="w-full h-auto rounded-md"
                    loop
                    playsInline
                    muted
                    onPointerEnter={(e) => e.currentTarget.play()}
                    onPointerLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                    }}
                />
            ) : (
                <img
                    src={creative.preview}
                    className="w-full h-auto rounded-md"
                />
            )}
        </div>
    );
}
