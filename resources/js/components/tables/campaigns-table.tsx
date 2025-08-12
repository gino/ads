import { cn } from "@/lib/cn";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    OnChangeFn,
    RowSelectionState,
    useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";

const columnHelper = createColumnHelper<App.Data.AdCampaignData>();
const columns = [
    columnHelper.accessor("name", {
        header: ({ table }) => (
            <div className="flex items-center gap-6">
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
        cell: ({ cell, row }) => (
            <div className="flex items-center gap-6 min-w-sm">
                <Checkbox
                    aria-label="Select row"
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    indeterminate={row.getIsSomeSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    className="flex-shrink-0"
                />
                <div className="flex items-center gap-6">
                    <Switch checked={cell.getValue() === "ACTIVE"} />
                    <div className="font-semibold">{cell.getValue()}</div>
                </div>
            </div>
        ),
        footer: ({ table }) => (
            <div className="font-semibold text-xs">
                Total of {table.getRowCount()} campaigns
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

interface Props {
    campaigns: App.Data.AdCampaignData[];
    rowSelection: RowSelectionState;
    onRowSelectionChange: OnChangeFn<RowSelectionState>;
}

export function CampaignsTable2({
    campaigns,
    rowSelection,
    onRowSelectionChange,
}: Props) {
    const table = useReactTable({
        data: campaigns,
        columns,
        state: { rowSelection },
        enableRowSelection: true,
        onRowSelectionChange,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="p-2.5 pt-1">
            <table className="w-full overflow-x-auto">
                <thead className="h-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="font-semibold text-left h-[3.4rem] px-5 align-middle whitespace-nowrap border-b-2 border-gray-200"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-gray-200 border-b-2 border-gray-200">
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className="odd:bg-gray-50 hover:bg-gray-50"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className={cn(
                                        "px-5 py-4.5 whitespace-nowrap align-middle"
                                    )}
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
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
                                    className="px-5 py-4.5 whitespace-nowrap align-middle font-normal text-left"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.footer,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </tfoot>
            </table>
        </div>
    );
}
