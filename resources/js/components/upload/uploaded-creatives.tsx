import { UploadForm as UploadFormType } from "@/pages/upload";
import { InertiaFormProps } from "@inertiajs/react";

interface Props {
    form: InertiaFormProps<UploadFormType>;
}

export function UploadedCreatives({ form }: Props) {
    return (
        <div className="min-w-0 p-1 bg-gray-100 rounded-2xl shrink-0 ring-inset ring-1 ring-gray-200/30 h-full min-h-0">
            <div className="bg-white shadow-base rounded-xl overflow-hidden h-full flex flex-col min-h-0">
                <div>
                    <div>{JSON.stringify(form.data)}</div>
                </div>
            </div>
        </div>
    );
}

/* <div className="flex-1 min-w-0 min-h-0 p-1 pr-0">
                    <div className="shadow-base bg-white rounded-xl overflow-hidden h-full flex flex-col">
                        <div className="p-5 border-b border-gray-100">foo</div>
                        <div className="flex-1 min-h-0">
                            <div className="h-full overflow-y-auto">
                                <div className="divide-y divide-gray-100 border-b border-gray-100">
                                    {form.data.creatives.map((creative) => (
                                        <div
                                            key={creative.id}
                                            className="px-4 py-4 gap-4 flex items-center truncate cursor-grab hover:bg-gray-50"
                                        >
                                            <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                {creative.thumbnail ? (
                                                    <div className="relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-lg after:ring-black/5 h-full w-full">
                                                        <img
                                                            src={
                                                                creative.thumbnail
                                                            }
                                                            onLoad={() => {
                                                                URL.revokeObjectURL(
                                                                    creative.preview
                                                                );
                                                            }}
                                                            className="object-cover object-center h-full w-full"
                                                        />
                                                    </div>
                                                ) : (
                                                    <i className="fa-regular fa-file" />
                                                )}
                                            </div>

                                            <div className="truncate flex-1">
                                                <div className="flex items-center mb-0.5 gap-1.5 truncate">
                                                    <i
                                                        className={cn(
                                                            "fa-regular text-[12px] shrink-0",
                                                            creative.type.startsWith(
                                                                "video/"
                                                            )
                                                                ? "fa-video"
                                                                : creative.type.startsWith(
                                                                      "image/"
                                                                  )
                                                                ? "fa-image"
                                                                : "fa-file"
                                                        )}
                                                    />
                                                    <div className="font-semibold truncate">
                                                        {creative.name}
                                                    </div>
                                                </div>
                                                <div className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5">
                                                    <div>{creative.size}</div>
                                                    <div className="text-gray-300">
                                                        &bull;
                                                    </div>
                                                    <div>
                                                        {creative.type
                                                            .split("/")[1]
                                                            .toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-black hover:bg-white">
                                                    <i className="fa-regular fa-pencil" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        // We might wanna prompt before deletion
                                                        form.setData(
                                                            "creatives",
                                                            form.data.creatives.filter(
                                                                (c) =>
                                                                    c.id !==
                                                                    creative.id
                                                            )
                                                        );

                                                        // if (
                                                        //     confirm(
                                                        //         "Are you sure you want to delete this creative? Any unsaved changes will be lost."
                                                        //     )
                                                        // ) {
                                                        //     form.setData(
                                                        //         "creatives",
                                                        //         form.data.creatives.filter(
                                                        //             (c) =>
                                                        //                 c.id !==
                                                        //                 creative.id
                                                        //         )
                                                        //     );
                                                        // }
                                                    }}
                                                    className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg text-gray-400 hover:text-red-800 active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out hover:bg-white"
                                                >
                                                    <i className="fa-regular fa-trash-can" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100">
                            <div className="flex items-center justify-end gap-2">
                                <button className="bg-white font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out">
                                    Schedule ads
                                </button>
                                <button className="font-semibold cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out text-white ring-1 bg-brand ring-brand px-3.5 py-2 rounded-md">
                                    Launch {form.data.creatives.length} ads
                                </button>
                            </div>
                        </div>
                    </div>
                </div> */
