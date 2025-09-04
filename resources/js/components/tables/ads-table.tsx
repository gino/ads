import { aggregateInsights } from "@/lib/aggregate-insights";
import { useDebouncedBatch } from "@/lib/hooks/use-debounced-batch";
import {
    formatMoney,
    formatNumber,
    formatPercentage,
} from "@/lib/number-utils";
import {
    useSelectedAds,
    useSelectedAdSets,
    useSelectedCampaigns,
} from "@/pages/campaigns";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import {
    ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { useMemo, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { StatusTag } from "../ui/status-tag";
import { Switch } from "../ui/switch";
import { Table } from "./table";
import { useSkeletonLoader } from "./utils";

interface Props {
    isLoading?: boolean;
    ads: App.Data.AdData[];
}

export function AdsTable({ isLoading, ads }: Props) {
    const [selectedAds, setSelectedAds] = useSelectedAds();
    const [selectedAdSets] = useSelectedAdSets();
    const [selectedCampaigns] = useSelectedCampaigns();

    const selectedCampaignIds = useMemo(
        () => Object.keys(selectedCampaigns),
        [selectedCampaigns]
    );
    const selectedAdsetIds = useMemo(
        () => Object.keys(selectedAdSets),
        [selectedAdSets]
    );

    const { props } = usePage<SharedData & { cacheKey: string | null }>();

    const { enqueue } = useDebouncedBatch<App.Data.AdData>({
        waitMs: 1_500, // debounce window
        maxWaitMs: 10_000, // optional upper bound
        key: (ad) => ad.id, // dedupe by ad id -> latest wins
        coalesce: (prev, next) => {
            // If user toggled back to the original status (same as prev), drop it.
            // Here, prev is the last enqueued value for this ad within the window.
            // If you want to drop when status returns to prev.status:
            if (prev && prev.status === next.status) return null;
            return next;
        },
        onFlush: async (items) => {
            console.log("Sending batch to backend", items);
            await axios.patch(route("ads.status.update"), {
                entries: items,
                cacheKey: props.cacheKey,
            });

            // if (response.status === 200) {
            //     // Refresh data
            //     router.get(
            //         route(route().current()!),
            //         { ...route().params },
            //         {
            //             only: ["ads", "cacheKey"],
            //             preserveState: true,
            //             replace: true,
            //         }
            //     );
            // }
        },
        flushOnInertiaNavigate: true,
        flushOnHistoryChange: false,
        flushOnVisibilityHidden: false,
        flushOnPageHide: false,
        flushOnBeforeUnload: false,
    });

    const filteredAds = useMemo(() => {
        if (!ads || !Array.isArray(ads)) {
            return [];
        }

        if (selectedCampaignIds.length > 0 && selectedAdsetIds.length > 0) {
            return ads.filter((ad) => {
                return (
                    selectedCampaignIds.includes(ad.campaignId) &&
                    selectedAdsetIds.includes(ad.adsetId)
                );
            });
        }

        if (selectedCampaignIds.length > 0) {
            return ads.filter((ad) =>
                selectedCampaignIds.includes(ad.campaignId)
            );
        }

        if (selectedAdsetIds.length > 0) {
            return ads.filter((ad) => selectedAdsetIds.includes(ad.adsetId));
        }

        return ads;
    }, [selectedCampaignIds, selectedAdsetIds, ads]);

    const sums = useMemo(() => aggregateInsights(filteredAds), [filteredAds]);

    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<App.Data.AdData>[] = useMemo(
        () => [
            {
                id: "ad",
                accessorFn: (row) => row.name,
                header: ({ table }) => (
                    <div className="flex items-center gap-5">
                        <Checkbox
                            aria-label="Select all rows"
                            checked={table.getIsAllRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                            indeterminate={table.getIsSomeRowsSelected()}
                            className="flex-shrink-0"
                        />
                        <div className="font-semibold">Ad</div>
                    </div>
                ),
                cell: ({ getValue, row }) => (
                    <div className="flex items-center gap-5 min-w-md">
                        <Checkbox
                            aria-label="Select row"
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            indeterminate={row.getIsSomeSelected()}
                            onChange={row.getToggleSelectedHandler()}
                            className="flex-shrink-0"
                        />
                        <div className="flex items-center gap-5">
                            <Switch
                                onChange={async () => {
                                    enqueue({
                                        ...row.original,
                                        status:
                                            row.original.status === "ACTIVE"
                                                ? "PAUSED"
                                                : "ACTIVE",
                                    });
                                }}
                                defaultChecked={
                                    row.original.status === "ACTIVE"
                                }
                            />
                            <div className="font-semibold">
                                {getValue<string>()}
                            </div>
                        </div>
                    </div>
                ),
                footer: ({ table }) => (
                    <div className="font-semibold text-xs">
                        Total of {table.getRowCount()} ads{" "}
                        <i className="fa-solid fa-circle-info align-middle ml-1 text-[12px] text-gray-300" />
                    </div>
                ),
            },
            {
                id: "status",
                accessorFn: (row) => row.effectiveStatus,
                header: () => <div className="text-right">Status</div>,
                cell: ({ getValue }) => {
                    const value = getValue<string>();
                    return (
                        <div className="text-right">
                            <StatusTag status={value} />
                        </div>
                    );
                },
                footer: (info) => <div className="text-right">&mdash;</div>,
            },
            {
                id: "spend",
                accessorFn: (row) => row.insights?.spend,
                header: () => <div className="text-right">Spend</div>,
                sortingFn: (a, b) => {
                    return (
                        Number(a.original.insights?.spend) -
                        Number(b.original.insights?.spend)
                    );
                },
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatMoney(value) : formatMoney(0)}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">{formatMoney(sums.spend)}</div>
                ),
            },
            {
                id: "cpc",
                accessorFn: (row) => row.insights?.cpc,
                header: () => <div className="text-right">CPC</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatMoney(value) : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {isNaN(sums.cpc) ? <>&mdash;</> : formatMoney(sums.cpc)}
                    </div>
                ),
            },
            {
                id: "cpm",
                accessorFn: (row) => row.insights?.cpm,
                header: () => <div className="text-right">CPM</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatMoney(value) : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {isNaN(sums.cpm) ? <>&mdash;</> : formatMoney(sums.cpm)}
                    </div>
                ),
            },
            {
                id: "ctr",
                accessorFn: (row) => row.insights?.ctr,
                header: () => <div className="text-right">CTR</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatPercentage(value) : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {isNaN(sums.ctr) ? (
                            <>&mdash;</>
                        ) : (
                            formatPercentage(sums.ctr)
                        )}
                    </div>
                ),
            },
            {
                id: "clicks",
                accessorFn: (row) => row.insights?.clicks,
                header: () => <div className="text-right">Clicks</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatNumber(value) : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {sums.clicks > 0 ? (
                            formatNumber(sums.clicks)
                        ) : (
                            <>&mdash;</>
                        )}
                    </div>
                ),
            },
            {
                id: "impressions",
                accessorFn: (row) => row.insights?.impressions,
                header: () => <div className="text-right">Impressions</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatNumber(value) : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {sums.impressions > 0 ? (
                            formatNumber(sums.impressions)
                        ) : (
                            <>&mdash;</>
                        )}
                    </div>
                ),
            },
            {
                id: "atc",
                accessorFn: (row) => row.insights?.atc,
                header: () => <div className="text-right">ATC</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? value : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {sums.atc > 0 ? formatNumber(sums.atc) : <>&mdash;</>}
                    </div>
                ),
            },
            {
                id: "conversions",
                accessorFn: (row) => row.insights?.conversions,
                header: () => <div className="text-right">Conversions</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? value : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {sums.conversions > 0 ? (
                            formatNumber(sums.conversions)
                        ) : (
                            <>&mdash;</>
                        )}
                    </div>
                ),
            },
            {
                id: "cpa",
                accessorFn: (row) => row.insights?.cpa,
                header: () => <div className="text-right">CPA</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatMoney(value) : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {isNaN(sums.cpa) ? <>&mdash;</> : formatMoney(sums.cpa)}
                    </div>
                ),
            },
            {
                id: "roas",
                accessorFn: (row) => row.insights?.roas,
                header: () => <div className="text-right">ROAS</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatNumber(value) : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {sums.roas > 0 ? formatNumber(sums.roas) : <>&mdash;</>}
                    </div>
                ),
            },
        ],
        [sums]
    );

    const { data, columns: _columns } = useSkeletonLoader({
        data: filteredAds,
        columns,
        isLoading,
    });

    const table = useReactTable({
        data,
        columns: _columns,
        state: {
            rowSelection: selectedAds,
            columnPinning: {
                left: ["ad"],
            },
            sorting,
        },
        enableRowSelection: true,
        onRowSelectionChange: setSelectedAds,
        onSortingChange: setSorting,
        getRowId: (ad) => ad.id,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return <Table table={table} />;
}
