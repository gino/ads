export const allowedFileTypes = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "video/mp4": [".mp4", ".mov"],
    "video/quicktime": [".mov"],
};

export const allowedFileExtensions = Object.values(allowedFileTypes).flat();
export const allowedFileMimeTypes = Object.keys(allowedFileTypes).flat();
