import { router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

// Converted into a hook - based on: https://github.com/inertiajs/inertia/blob/master/packages/react/src/Deferred.ts

const urlWithoutHash = (url: URL | Location): URL => {
    url = new URL(url.href);
    url.hash = "";
    return url;
};

const isSameUrlWithoutHash = (
    url1: URL | Location,
    url2: URL | Location
): boolean => {
    return urlWithoutHash(url1).href === urlWithoutHash(url2).href;
};

interface UseDeferredOptions {
    data: string | string[];
}

const useDeferred = ({ data }: UseDeferredOptions) => {
    if (!data) {
        throw new Error(
            "`useDeferred` requires a `data` option to be a string or array of strings"
        );
    }

    const [isLoading, setIsLoading] = useState(true);
    const pageProps = usePage().props;
    const keys = useMemo(() => (Array.isArray(data) ? data : [data]), [data]);

    useEffect(() => {
        const removeListener = router.on("start", (e) => {
            const isPartialVisit =
                e.detail.visit.only.length > 0 ||
                e.detail.visit.except.length > 0;
            const isReloadingKey = e.detail.visit.only.find((key) =>
                keys.includes(key)
            );

            if (
                isSameUrlWithoutHash(e.detail.visit.url, window.location) &&
                (!isPartialVisit || isReloadingKey)
            ) {
                setIsLoading(true);
            }
        });

        return () => {
            removeListener();
        };
    }, [keys]);

    useEffect(() => {
        const loaded = keys.every((key) => pageProps[key] !== undefined);
        setIsLoading(!loaded);
    }, [pageProps, keys]);

    return { isLoading, isLoaded: !isLoading };
};

export default useDeferred;
