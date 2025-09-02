import { router } from "@inertiajs/react";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
} from "react";

type FlushHandler<T, R = unknown> = (items: T[]) => Promise<R> | R;

export type UseDebouncedBatchOptions<T, R = unknown> = {
    // Time window to wait after the latest enqueue before flushing
    waitMs: number;
    // Optional upper bound to ensure a flush happens even with constant activity
    maxWaitMs?: number;
    // Optional deduplication: if provided, the queue will keep only the latest item per key
    key?: (item: T) => string;
    // Optional hard cap: if queue size reaches this, flush immediately
    maxSize?: number;
    // Called when the batch is flushed
    onFlush: FlushHandler<T, R>;
    // If true, flush any remaining items on unmount (default true)
    flushOnUnmount?: boolean;
    // Optional merge/drop policy when re-enqueuing the same key within the window.
    // Return null to drop (e.g., net no-op), or the merged/next value to keep.
    coalesce?: (prev: T | undefined, next: T) => T | null;
    // Auto-flush triggers in addition to unmount
    flushOnBeforeUnload?: boolean; // default false
    flushOnVisibilityHidden?: boolean; // default true
    flushOnPageHide?: boolean; // default true
    flushOnHistoryChange?: boolean; // default false
    // Inertia.js router navigation (SPA) flush
    flushOnInertiaNavigate?: boolean; // default true
};

export type UseDebouncedBatchApi<T, R = unknown> = {
    enqueue: (item: T) => void;
    enqueueMany: (items: T[]) => void;
    flush: () => Promise<void>;
    cancel: () => void;
    reset: (
        opts?: Partial<
            Pick<
                UseDebouncedBatchOptions<T, R>,
                "waitMs" | "maxWaitMs" | "maxSize"
            >
        >
    ) => void;
    getItems: () => T[];
    pendingCount: number;
    isFlushing: boolean;
    lastError: unknown;
};

function createStore<T>() {
    let listeners = new Set<() => void>();
    let snapshot: { count: number; isFlushing: boolean; error: unknown } = {
        count: 0,
        isFlushing: false,
        error: undefined,
    };

    const getSnapshot = () => snapshot;
    const subscribe = (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    const update = (next: Partial<typeof snapshot>) => {
        snapshot = { ...snapshot, ...next };
        listeners.forEach((l) => l());
    };

    return { getSnapshot, subscribe, update };
}

export function useDebouncedBatch<T, R = unknown>(
    options: UseDebouncedBatchOptions<T, R>
): UseDebouncedBatchApi<T, R> {
    const {
        waitMs,
        maxWaitMs,
        key,
        maxSize,
        onFlush,
        flushOnUnmount = true,
        coalesce,
        flushOnBeforeUnload = false,
        flushOnVisibilityHidden = true,
        flushOnPageHide = true,
        flushOnHistoryChange = false,
        flushOnInertiaNavigate = true,
    } = options;

    const storeRef = useRef(createStore<T>());
    const queueMapRef = useRef<Map<string, T> | null>(key ? new Map() : null);
    const queueListRef = useRef<T[]>(key ? [] : []);
    const waitTimerRef = useRef<number | null>(null);
    const maxWaitTimerRef = useRef<number | null>(null);
    const isFlushingRef = useRef(false);
    const lastErrorRef = useRef<unknown>(undefined);
    const currentWaitMsRef = useRef(waitMs);
    const currentMaxWaitMsRef = useRef(maxWaitMs);
    const currentMaxSizeRef = useRef(maxSize);
    const flushRef = useRef<() => Promise<void>>(async () => {});
    const flushOnUnmountRef = useRef<boolean>(flushOnUnmount);

    const getItems = useCallback((): T[] => {
        if (key) {
            return Array.from(queueMapRef.current!.values());
        }
        return queueListRef.current.slice();
    }, [key]);

    const setPendingCount = useCallback(() => {
        storeRef.current.update({ count: getItems().length });
    }, [getItems]);

    const clearTimers = useCallback(() => {
        if (waitTimerRef.current != null) {
            window.clearTimeout(waitTimerRef.current);
            waitTimerRef.current = null;
        }
        if (maxWaitTimerRef.current != null) {
            window.clearTimeout(maxWaitTimerRef.current);
            maxWaitTimerRef.current = null;
        }
    }, []);

    const scheduleTimers = useCallback(() => {
        // Debounce timer
        if (waitTimerRef.current != null) {
            window.clearTimeout(waitTimerRef.current);
        }
        waitTimerRef.current = window.setTimeout(() => {
            void flushRef.current();
        }, Math.max(0, currentWaitMsRef.current));

        // Max wait upper bound
        if (
            currentMaxWaitMsRef.current != null &&
            maxWaitTimerRef.current == null
        ) {
            maxWaitTimerRef.current = window.setTimeout(() => {
                void flushRef.current();
            }, Math.max(0, currentMaxWaitMsRef.current));
        }
    }, []);

    const enqueueMany = useCallback(
        (items: T[]) => {
            if (items.length === 0) return;

            if (key) {
                const map = queueMapRef.current!;
                for (const item of items) {
                    const k = key(item);
                    const prev = map.get(k);
                    const merged = coalesce ? coalesce(prev, item) : item;
                    if (merged === null) {
                        map.delete(k);
                    } else {
                        map.set(k, merged);
                    }
                }
            } else {
                queueListRef.current.push(...items);
            }

            setPendingCount();

            const maxSize = currentMaxSizeRef.current;
            if (typeof maxSize === "number" && getItems().length >= maxSize) {
                void flush();
                return;
            }

            if (getItems().length > 0) {
                scheduleTimers();
            } else {
                clearTimers();
            }
        },
        [key, getItems, scheduleTimers, setPendingCount, coalesce, clearTimers]
    );

    const enqueue = useCallback(
        (item: T) => {
            enqueueMany([item]);
        },
        [enqueueMany]
    );

    const flush = useCallback(async () => {
        if (isFlushingRef.current) return;
        const items = getItems();
        if (items.length === 0) {
            clearTimers();
            return;
        }
        isFlushingRef.current = true;
        storeRef.current.update({ isFlushing: true });
        clearTimers();

        // Take snapshot and clear queue before awaiting
        if (key) {
            queueMapRef.current!.clear();
        } else {
            queueListRef.current.length = 0;
        }
        setPendingCount();

        try {
            await onFlush(items);
            lastErrorRef.current = undefined;
            storeRef.current.update({ error: undefined });
        } catch (error) {
            // Keep error; items are dropped by design. Caller should reconcile state or re-enqueue.
            lastErrorRef.current = error;
            storeRef.current.update({ error });
        } finally {
            isFlushingRef.current = false;
            storeRef.current.update({ isFlushing: false });
        }
    }, [clearTimers, getItems, key, onFlush, setPendingCount]);

    // Keep latest flush function and option in refs for unmount-only cleanup and timer callbacks
    useEffect(() => {
        flushRef.current = flush;
    }, [flush]);
    useEffect(() => {
        flushOnUnmountRef.current = flushOnUnmount;
    }, [flushOnUnmount]);

    // Auto-flush on visibility/page lifecycle
    useEffect(() => {
        const handleVisibility = () => {
            if (
                document.visibilityState === "hidden" &&
                flushOnVisibilityHidden
            ) {
                void flushRef.current();
            }
        };
        const handlePageHide = () => {
            if (flushOnPageHide) {
                void flushRef.current();
            }
        };
        const handleBeforeUnload = () => {
            if (flushOnBeforeUnload) {
                void flushRef.current();
            }
        };

        if (flushOnVisibilityHidden)
            document.addEventListener("visibilitychange", handleVisibility);
        if (flushOnPageHide)
            window.addEventListener("pagehide", handlePageHide);
        if (flushOnBeforeUnload)
            window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (flushOnVisibilityHidden)
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibility
                );
            if (flushOnPageHide)
                window.removeEventListener("pagehide", handlePageHide);
            if (flushOnBeforeUnload)
                window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [flushOnBeforeUnload, flushOnVisibilityHidden, flushOnPageHide]);

    // Auto-flush on history changes within SPA navigation
    useEffect(() => {
        if (!flushOnHistoryChange) return;

        const handlePopState = () => {
            void flushRef.current();
        };

        // Monkeypatch pushState/replaceState to emit events
        const originalPush = history.pushState;
        const originalReplace = history.replaceState;
        const wrap = (fn: typeof history.pushState): typeof history.pushState =>
            function wrapped(
                this: History,
                data: any,
                unused: string,
                url?: string | URL
            ) {
                const result = fn.apply(this, [data, unused, url as any]);
                void flushRef.current();
                return result;
            } as any;

        history.pushState = wrap(originalPush);
        history.replaceState = wrap(originalReplace);
        window.addEventListener("popstate", handlePopState);

        return () => {
            history.pushState = originalPush;
            history.replaceState = originalReplace;
            window.removeEventListener("popstate", handlePopState);
        };
    }, [flushOnHistoryChange]);

    // Auto-flush on Inertia.js router navigations
    useEffect(() => {
        if (!flushOnInertiaNavigate || !router) return;
        const offBefore = router.on("before", () => {
            void flushRef.current();
        });
        const offStart = router.on("start", () => {
            void flushRef.current();
        });
        return () => {
            offBefore?.();
            offStart?.();
        };
    }, [flushOnInertiaNavigate]);

    const cancel = useCallback(() => {
        clearTimers();
        if (key) {
            queueMapRef.current!.clear();
        } else {
            queueListRef.current.length = 0;
        }
        setPendingCount();
    }, [clearTimers, key, setPendingCount]);

    const reset = useCallback(
        (
            opts?: Partial<
                Pick<
                    UseDebouncedBatchOptions<T, R>,
                    "waitMs" | "maxWaitMs" | "maxSize"
                >
            >
        ) => {
            if (opts?.waitMs != null) currentWaitMsRef.current = opts.waitMs;
            if (opts?.maxWaitMs !== undefined)
                currentMaxWaitMsRef.current = opts.maxWaitMs;
            if (opts?.maxSize !== undefined)
                currentMaxSizeRef.current = opts.maxSize;
            // Reschedule using the new timings if there are items pending
            if (getItems().length > 0) scheduleTimers();
        },
        [scheduleTimers, getItems]
    );

    useEffect(() => {
        currentWaitMsRef.current = waitMs;
    }, [waitMs]);

    useEffect(() => {
        currentMaxWaitMsRef.current = maxWaitMs;
    }, [maxWaitMs]);

    useEffect(() => {
        currentMaxSizeRef.current = maxSize;
    }, [maxSize]);

    // Unmount-only cleanup: avoid calling flush on every re-render
    useEffect(() => {
        return () => {
            if (flushOnUnmountRef.current) {
                void flushRef.current();
            } else {
                clearTimers();
            }
        };
    }, [clearTimers]);

    // Expose reactive state via external store (avoids needless rerenders when only timers change)
    const subscribe = useMemo(() => storeRef.current.subscribe, []);
    const getSnapshot = useMemo(() => storeRef.current.getSnapshot, []);
    const { count, isFlushing, error } = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getSnapshot
    );

    return {
        enqueue,
        enqueueMany,
        flush,
        cancel,
        reset,
        getItems,
        pendingCount: count,
        isFlushing,
        lastError: error,
    };
}

export default useDebouncedBatch;
