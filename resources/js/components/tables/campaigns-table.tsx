import useDebouncedBatch from "@/lib/hooks/use-debounced-batch";
import {
    formatMoney,
    formatNumber,
    formatPercentage,
} from "@/lib/number-utils";
import { aggregateInsights } from "@/lib/table/aggregate-insights";
import { getSortingFunctions } from "@/lib/table/sorting-functions/sorting-functions";
import { useSelectedCampaigns, useSortingState } from "@/pages/campaigns";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import {
    ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import axios, { AxiosError } from "axios";
import { useMemo } from "react";
import { Checkbox } from "../ui/checkbox";
import { StatusTag } from "../ui/status-tag";
import { Switch } from "../ui/switch";
import { toast } from "../ui/toast";
import { Table } from "./table";
import { useSkeletonLoader } from "./utils";

interface Props {
    isLoading?: boolean;
    campaigns: App.Data.AdCampaignData[];
}

const EMPTY_ARRAY: any[] = [];

export function CampaignsTable({ isLoading, campaigns }: Props) {
    const [selectedCampaigns, setSelectedCampaigns] = useSelectedCampaigns();

    const { props } = usePage<SharedData & { cacheKey: string | null }>();

    const { enqueue } = useDebouncedBatch<App.Data.AdCampaignData>({
        waitMs: 1_250,
        maxWaitMs: 10_000,
        key: (campaign) => campaign.id,
        coalesce: (prev, next) => {
            if (prev && prev.status === next.status) return null;
            return next;
        },
        onFlush: async (items) => {
            try {
                const response = await axios.patch(
                    route("campaigns.status.update"),
                    {
                        entries: items,
                        cacheKey: props.cacheKey,
                    }
                );

                if (response.status === 200) {
                    toast({
                        contents: `${items.length} campaign${
                            items.length === 1 ? "" : "s"
                        } updated`,
                    });
                }
            } catch (err) {
                const error = err as AxiosError<{ message: string }>;

                if (error.response?.status === 422) {
                    toast({
                        type: "ERROR",
                        contents:
                            error.response.data?.message ||
                            "There was an error updating the status of your campaigns",
                    });
                }
            }
        },
        flushOnInertiaNavigate: true,
        flushOnHistoryChange: false,
        flushOnVisibilityHidden: false,
        flushOnPageHide: true,
        flushOnBeforeUnload: false,
    });

    const sums = useMemo(() => aggregateInsights(campaigns), [campaigns]);

    const [sorting, setSorting] = useSortingState();

    const columns = useMemo<ColumnDef<App.Data.AdCampaignData>[]>(
        () => [
            {
                id: "campaign",
                accessorFn: (row) => row.name,
                header: ({ table }) => (
                    <div className="flex gap-5 items-center">
                        <Checkbox
                            aria-label="Select all rows"
                            checked={table.getIsAllRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                            indeterminate={table.getIsSomeRowsSelected()}
                            className="flex-shrink-0"
                        />
                        <div className="font-semibold">Campaign</div>
                    </div>
                ),
                cell: ({ getValue, row }) => (
                    <div className="flex gap-5 items-center">
                        <Checkbox
                            aria-label="Select row"
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            indeterminate={row.getIsSomeSelected()}
                            onChange={row.getToggleSelectedHandler()}
                            className="flex-shrink-0"
                        />
                        <div className="flex gap-5 items-center">
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
                                checked={row.original.status === "ACTIVE"}
                            />
                            <div
                                title={getValue<string>()}
                                className="font-semibold w-96 truncate"
                            >
                                {getValue<string>()}
                            </div>
                        </div>
                    </div>
                ),
                footer: ({ table }) => (
                    <div className="text-xs font-semibold">
                        Total of {table.getRowCount()} campaigns{" "}
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
                id: "dailyBudget",
                accessorFn: (row) => row.dailyBudget,
                header: () => <div className="text-right">Daily budget</div>,
                sortingFn: "numberSorting",
                sortUndefined: 1,
                cell: (info) => {
                    return (
                        <div className="text-right">
                            {formatMoney(
                                parseInt(info.getValue<string>()) / 100
                            )}
                        </div>
                    );
                },
                footer: (info) => <div className="text-right">&mdash;</div>,
            },
            {
                id: "spend",
                accessorFn: (row) => row.insights?.spend,
                header: () => <div className="text-right">Spend</div>,
                sortingFn: "numberSorting",
                sortUndefined: 1,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatMoney(value) : formatMoney(0)}
                        </div>
                    );
                },
                footer: (info) => (
                    <div className="text-right">
                        {isNaN(sums.spend) ? (
                            <>&mdash;</>
                        ) : (
                            formatMoney(sums.spend)
                        )}
                    </div>
                ),
            },
            {
                id: "cpc",
                accessorFn: (row) => row.insights?.cpc,
                header: () => <div className="text-right">CPC</div>,
                sortingFn: "numberSorting",
                sortUndefined: 1,
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
                sortingFn: "numberSorting",
                sortUndefined: 1,
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
                sortingFn: "numberSorting",
                sortUndefined: 1,
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
                sortingFn: "numberSorting",
                sortUndefined: 1,
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
                sortingFn: "numberSorting",
                sortUndefined: 1,
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
                sortingFn: "numberSorting",
                sortUndefined: 1,
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
                sortingFn: "numberSorting",
                sortUndefined: 1,
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
                sortingFn: "numberSorting",
                sortUndefined: 1,
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
                sortingFn: "numberSorting",
                sortUndefined: 1,
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
                        {sums.roas > 0 ? formatNumber(sums.roas) : <>&mdash;</>}
                    </div>
                ),
            },
        ],
        [sums]
    );

    const { data, columns: _columns } = useSkeletonLoader({
        data: campaigns,
        columns,
        isLoading,
    });

    const table = useReactTable({
        data,
        columns: _columns,
        state: {
            rowSelection: selectedCampaigns,
            columnPinning: {
                left: ["campaign"],
            },
            sorting,
        },
        enableRowSelection: true,
        onRowSelectionChange: setSelectedCampaigns,
        onSortingChange: setSorting,
        getRowId: (campaign) => campaign.id,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        sortingFns: getSortingFunctions(),
        sortDescFirst: false,
    });

    return <Table table={table} />;
}
