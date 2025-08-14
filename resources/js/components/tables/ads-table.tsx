import { cn } from "@/lib/cn";
import { useIsScrolled } from "@/lib/hooks/use-is-scrolled";
import {
    useSelectedAds,
    useSelectedAdSets,
    useSelectedCampaigns,
} from "@/pages/campaigns";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useMemo, useRef } from "react";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import {
    getPinnedColumnStyles,
    ShadowSeperator,
    useSkeletonLoader,
} from "./utils";

const columnHelper = createColumnHelper<App.Data.AdData>();
const columns = [
    columnHelper.accessor("name", {
        id: "ad",
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
        cell: ({ cell, row }) => (
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
                    <Switch defaultChecked={cell.getValue() === "ACTIVE"} />
                    <div className="font-semibold">{cell.getValue()}</div>
                </div>
            </div>
        ),
        footer: ({ table }) => (
            <div className="font-semibold text-xs">
                Total of {table.getRowCount()} ads{" "}
                <i className="fa-solid fa-circle-info align-middle ml-1 text-[12px] text-gray-300" />
            </div>
        ),
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">Status</div>,
        cell: (info) => (
            <div className="text-right">
                <span className="inline-flex items-center font-semibold gap-2 rounded-full text-xs">
                    <div className="h-[7px] w-[7px] bg-gray-300 rounded-full" />
                    <span className="capitalize">
                        {info.getValue().toLowerCase()}
                    </span>
                </span>
            </div>
        ),
        footer: (info) => <div className="text-right">-</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">Spend</div>,
        cell: (info) => <div className="text-right">€ 5,67</div>,
        footer: (info) => <div className="text-right">€ 5,67</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">CPC</div>,
        cell: (info) => <div className="text-right">€ 1,23</div>,
        footer: (info) => <div className="text-right">€ 1,23</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">CPM</div>,
        cell: (info) => <div className="text-right">€ 12,34</div>,
        footer: (info) => <div className="text-right">€ 12,34</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">CTR</div>,
        cell: (info) => <div className="text-right">8,24%</div>,
        footer: (info) => <div className="text-right">8,24%</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">Conversions</div>,
        cell: (info) => <div className="text-right">12</div>,
        footer: (info) => <div className="text-right">12</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">CPA</div>,
        cell: (info) => <div className="text-right">€ 0,47</div>,
        footer: (info) => <div className="text-right">€ 0,47</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">ROAS</div>,
        cell: (info) => <div className="text-right">2.82</div>,
        footer: (info) => <div className="text-right">2.82</div>,
    }),
];

const ROW_HEIGHT = cn("h-14");

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

    const tableContainerRef = useRef<HTMLTableElement>(null!);
    const isScrolled = useIsScrolled(tableContainerRef, 12); // 12px (container padding / p-3)

    return (
        <div ref={tableContainerRef} className="overflow-x-auto">
            <div className="px-3">
                <table className="w-full">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        style={{
                                            ...getPinnedColumnStyles(
                                                header.column
                                            ),
                                        }}
                                        className={cn(
                                            "font-semibold text-left px-5 first:px-4 last:px-4 align-middle whitespace-nowrap border-b-2 border-gray-200 border-r last:border-r-0",
                                            ROW_HEIGHT,
                                            header.column.getIsPinned() &&
                                                "bg-white"
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}

                                        {header.column.getIsPinned() &&
                                            isScrolled && <ShadowSeperator />}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="border-b border-gray-200">
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className={cn(
                                    "hover:bg-gray-100 group even:bg-gray-50",
                                    row.getIsSelected() && "bg-gray-100"
                                )}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        style={{
                                            ...getPinnedColumnStyles(
                                                cell.column
                                            ),
                                        }}
                                        className={cn(
                                            "px-5 first:px-4 last:px-4 whitespace-nowrap align-middle relative border-r border-gray-200 last:border-r-0",
                                            ROW_HEIGHT,
                                            cell.column.getIsPinned() &&
                                                (cell.row.getIsSelected()
                                                    ? "bg-gray-100"
                                                    : "bg-white group-even:bg-gray-50 group-hover:bg-gray-100")
                                        )}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                        {cell.column.getIsPinned() &&
                                            isScrolled && <ShadowSeperator />}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {table.getFooterGroups().map((footerGroup) => (
                            <tr key={footerGroup.id}>
                                {footerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        style={{
                                            ...getPinnedColumnStyles(
                                                header.column
                                            ),
                                        }}
                                        className={cn(
                                            "px-5 first:px-4 last:px-4 whitespace-nowrap align-middle font-normal text-left border-r border-gray-200 last:border-r-0",
                                            ROW_HEIGHT,
                                            header.column.getIsPinned() &&
                                                "bg-white"
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .footer,
                                                  header.getContext()
                                              )}
                                        {header.column.getIsPinned() &&
                                            isScrolled && <ShadowSeperator />}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
