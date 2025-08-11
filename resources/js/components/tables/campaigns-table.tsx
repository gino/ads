import { cn } from "@/lib/cn";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Switch } from "../ui/switch";

const columnHelper = createColumnHelper<App.Data.AdCampaignData>();
const columns = [
    columnHelper.accessor("name", {
        header: () => (
            <div className="flex items-center gap-6">
                <div className="h-4 w-4 rounded shadow-base bg-white"></div>
                <div className="font-semibold">Campaign</div>
            </div>
        ),
        cell: (info) => (
            <div className="flex items-center gap-6">
                <div className="h-4 w-4 rounded shadow-base bg-white"></div>
                <div className="flex items-center gap-6">
                    <Switch defaultChecked />
                    <div className="font-semibold">{info.renderValue()}</div>
                </div>
            </div>
        ),
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">Status</div>,
        cell: (info) => (
            <div className="text-right">
                <div className="inline-flex items-center ring bg-gray-100 ring-gray-100 px-2 leading-5 font-semibold text-[12px] rounded-full">
                    {/* <span className="h-1.5 w-1.5 bg-gray-300 rounded-full mr-2" /> */}
                    <span>Paused</span>
                </div>
            </div>
        ),
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">Spend</div>,
        cell: (info) => <div className="text-right">€ 5,67</div>,
        // footer: (info) => <div className="text-right">€ 5,67</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">CPC</div>,
        cell: (info) => <div className="text-right">€ 1,23</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">CPM</div>,
        cell: (info) => <div className="text-right">€ 12,34</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">CTR</div>,
        cell: (info) => <div className="text-right">8,24%</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">Conversions</div>,
        cell: (info) => <div className="text-right">12</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">CPA</div>,
        cell: (info) => <div className="text-right">€ 0,47</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">ROAS</div>,
        cell: (info) => <div className="text-right">2.82</div>,
    }),
];

interface Props {
    campaigns: App.Data.AdCampaignData[];
}

export function CampaignsTable2({ campaigns }: Props) {
    const table = useReactTable({
        data: campaigns,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div>
            {/* <pre className="font-sans text-xs">
                {JSON.stringify(campaigns, null, 2)}
            </pre> */}

            <div className="p-3 pt-1">
                <table className="w-full overflow-x-auto">
                    <thead className="h-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="font-semibold text-left h-[3.4rem] px-4 align-middle whitespace-nowrap border-b-2 border-gray-200"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="evedn:bg-gray-50 hover:bg-gray-50"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className={cn(
                                            "px-4 py-4 whitespace-nowrap align-middle border-gray-200"
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
                    {/* <tfoot>
                        {table.getFooterGroups().map((footerGroup) => (
                            <tr key={footerGroup.id}>
                                {footerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-4 whitespace-nowrap align-middle font-normal"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .footer,
                                                  header.getContext()
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tfoot> */}
                </table>
            </div>
        </div>
    );
}
