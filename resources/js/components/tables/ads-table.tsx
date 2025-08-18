import { formatMoney, formatPercentage } from "@/lib/number-utils";
import {
    useSelectedAds,
    useSelectedAdSets,
    useSelectedCampaigns,
} from "@/pages/campaigns";
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
                            <Switch defaultChecked={getValue() === "ACTIVE"} />
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
                accessorFn: (row) => row.status,
                header: () => <div className="text-right">Status</div>,
                cell: ({ getValue }) => {
                    const value = getValue<string>();
                    return (
                        <div className="text-right">
                            <StatusTag status={value}>{value}</StatusTag>
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
        data: ads,
        columns,
        isLoading,
    });

    const filteredAds = useMemo(() => {
        if (selectedCampaignIds.length > 0 && selectedAdsetIds.length > 0) {
            return data.filter((ad) => {
                return (
                    selectedCampaignIds.includes(ad.campaignId) &&
                    selectedAdsetIds.includes(ad.adsetId)
                );
            });
        }

        if (selectedCampaignIds.length > 0) {
            return data.filter((ad) =>
                selectedCampaignIds.includes(ad.campaignId)
            );
        }

        if (selectedAdsetIds.length > 0) {
            return data.filter((ad) => selectedAdsetIds.includes(ad.adsetId));
        }

        return data;
    }, [selectedCampaignIds, selectedAdsetIds, data]);

    const table = useReactTable({
        data: filteredAds,
        columns: _columns,
        state: {
            rowSelection: selectedAds,
            columnPinning: {
                left: ["ad"],
            },
        },
        enableRowSelection: true,
        onRowSelectionChange: setSelectedAds,
        getRowId: (ad) => ad.id,
        getCoreRowModel: getCoreRowModel(),
    });

    return <Table table={table} />;
}
