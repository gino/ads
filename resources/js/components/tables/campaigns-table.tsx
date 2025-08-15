import { cn } from "@/lib/cn";
import { useIsScrolled } from "@/lib/hooks/use-is-scrolled";
import { formatMoney, formatPercentage } from "@/lib/number-utils";
import { useSelectedCampaigns } from "@/pages/campaigns";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useRef } from "react";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import {
    getPinnedColumnStyles,
    ShadowSeperator,
    useSkeletonLoader,
} from "./utils";

const columns: ColumnDef<App.Data.AdCampaignData>[] = [
    {
        id: "campaign",
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
                <div className="font-semibold">Campaign</div>
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
                    <div className="font-semibold">{getValue<string>()}</div>
                </div>
            </div>
        ),
        footer: ({ table }) => (
            <div className="font-semibold text-xs">
                Total of {table.getRowCount()} campaigns{" "}
                <i className="fa-solid fa-circle-info align-middle ml-1 text-[12px] text-gray-300" />
            </div>
        ),
    },
    {
        id: "status",
        accessorFn: (row) => row.status,
        header: () => <div className="text-right">Status</div>,
        cell: ({ getValue }) => (
            <div className="text-right">
                <span className="inline-flex items-center font-semibold gap-2 rounded-full text-xs">
                    <div className="h-[7px] w-[7px] bg-gray-300 rounded-full" />
                    <span className="capitalize">
                        {getValue<string>().toLowerCase()}
                    </span>
                </span>
            </div>
        ),
        footer: (info) => <div className="text-right">-</div>,
    },
    {
        id: "dailyBudget",
        accessorFn: (row) => row.dailyBudget,
        header: () => <div className="text-right">Daily budget</div>,
        cell: (info) => {
            return (
                <div className="text-right">
                    {formatMoney(parseInt(info.getValue<string>()) / 100)}
                </div>
            );
        },
        footer: () => {
            return <div className="text-right">{formatMoney(12.34)}</div>;
        },
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
        id: "conversions",
        accessorFn: (row) => row.insights?.cpm,
        header: () => <div className="text-right">Conversions</div>,
        cell: (info) => <div className="text-right">12</div>,
        footer: (info) => <div className="text-right">12</div>,
    },
    {
        id: "cpa",
        accessorFn: (row) => row.insights?.cpm,
        header: () => <div className="text-right">CPA</div>,
        cell: (info) => <div className="text-right">€ 0,47</div>,
        footer: (info) => <div className="text-right">€ 0,47</div>,
    },
    {
        id: "roas",
        accessorFn: (row) => row.insights?.cpm,
        header: () => <div className="text-right">ROAS</div>,
        cell: (info) => <div className="text-right">2.82</div>,
        footer: (info) => <div className="text-right">2.82</div>,
    },
];

const ROW_HEIGHT = cn("h-14");

interface Props {
    isLoading?: boolean;
    campaigns: App.Data.AdCampaignData[];
}

export function CampaignsTable({ isLoading, campaigns }: Props) {
    const [selectedCampaigns, setSelectedCampaigns] = useSelectedCampaigns();

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
        },
        enableRowSelection: true,
        onRowSelectionChange: setSelectedCampaigns,
        getRowId: (campaign) => campaign.id,
        getCoreRowModel: getCoreRowModel(),
    });

    const tableContainerRef = useRef<HTMLTableElement>(null!);
    const isScrolled = useIsScrolled(tableContainerRef, 12); // 12px (container padding / p-3)

    return (
        <div
            ref={tableContainerRef}
            className="flex-1 overflow-auto max-h-full"
        >
            <div className="px-3">
                <table className="w-full">
                    <thead className="sticky top-0 z-20 bg-white [box-shadow:0_2px_0_var(--color-gray-200)]">
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
                                            "font-semibold text-left px-5 first:px-4 last:px-4 align-middle whitespace-nowrap border-gray-200 border-r last:border-r-0",
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
                    <tbody>
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
                    <tfoot className="sticky bottom-0 z-20 bg-white [box-shadow:0_-1px_0_var(--color-gray-200)]">
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
