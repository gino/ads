import { formatMoney, formatPercentage } from "@/lib/number-utils";
import { useSelectedAdSets, useSelectedCampaigns } from "@/pages/campaigns";
import {
    ColumnDef,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Checkbox } from "../ui/checkbox";
import { StatusTag } from "../ui/status-tag";
import { Switch } from "../ui/switch";
import { Table } from "./table";
import { useSkeletonLoader } from "./utils";

interface Props {
    isLoading?: boolean;
    adSets: App.Data.AdSetData[];
}

export function AdSetsTable({ isLoading, adSets }: Props) {
    const [selectedAdSets, setSelectedAdSets] = useSelectedAdSets();
    const [selectedCampaigns] = useSelectedCampaigns();

    const selectedCampaignIds = useMemo(
        () => Object.keys(selectedCampaigns),
        [selectedCampaigns]
    );

    const columns: ColumnDef<App.Data.AdSetData>[] = useMemo(
        () => [
            {
                id: "adSet",
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
                        <div className="font-semibold">Ad set</div>
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
                        Total of {table.getRowCount()} ad sets{" "}
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
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? formatMoney(value) : formatMoney(0)}
                        </div>
                    );
                },
                footer: (info) => <div className="text-right">€ 5,67</div>,
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
                footer: (info) => <div className="text-right">€ 1,23</div>,
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
                footer: (info) => <div className="text-right">€ 12,34</div>,
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
                footer: (info) => <div className="text-right">8,24%</div>,
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
                footer: (info) => <div className="text-right">12</div>,
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
                footer: (info) => <div className="text-right">12</div>,
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
                footer: (info) => <div className="text-right">€ 0,47</div>,
            },
            {
                id: "roas",
                accessorFn: (row) => row.insights?.roas,
                header: () => <div className="text-right">ROAS</div>,
                cell: ({ getValue }) => {
                    const value = getValue<number>();
                    return (
                        <div className="text-right">
                            {value ? value : <>&mdash;</>}
                        </div>
                    );
                },
                footer: (info) => <div className="text-right">2.82</div>,
            },
        ],
        []
    );

    const { data, columns: _columns } = useSkeletonLoader({
        data: adSets,
        columns,
        isLoading,
    });

    const filteredAdSets = useMemo(() => {
        if (!data || !Array.isArray(data)) {
            return [];
        }

        if (selectedCampaignIds.length === 0) {
            return data;
        }

        return data.filter((adSet) =>
            selectedCampaignIds.includes(adSet.campaignId)
        );
    }, [selectedCampaignIds, data]);

    const table = useReactTable({
        data: filteredAdSets,
        columns: _columns,
        state: {
            rowSelection: selectedAdSets,
            columnPinning: {
                left: ["adSet"],
            },
        },
        enableRowSelection: true,
        onRowSelectionChange: setSelectedAdSets,
        getRowId: (adSet) => adSet.id,
        getCoreRowModel: getCoreRowModel(),
    });

    return <Table table={table} />;
}
