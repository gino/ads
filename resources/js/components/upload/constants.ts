export const allowedFileTypes = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
    "video/x-msvideo": [".avi"],
    "video/x-m4v": [".mp4", ".m4v"],
};

export const allowedFileExtensions = Object.values(allowedFileTypes).flat();
export const allowedFileMimeTypes = Object.keys(allowedFileTypes).flat();
