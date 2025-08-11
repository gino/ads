import { Layout } from "@/components/layouts/app-layout";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { Deferred, router } from "@inertiajs/react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

interface Props {
    campaigns: App.Data.AdCampaignData[];
}

export default function Campaigns({ campaigns }: Props) {
    return (
        <Layout title="Campaigns">
            <div className="bg-white shadow-base rounded-xl overflow-auto">
                <Deferred data="campaigns" fallback={<div>Loading...</div>}>
                    <CampaignsTable campaigns={campaigns} />
                </Deferred>
            </div>

            <button
                className="cursor-pointer mt-3"
                onClick={() => router.post(route("logout"))}
            >
                logout
            </button>
        </Layout>
    );
}

const columnHelper = createColumnHelper<App.Data.AdCampaignData>();
const columns = [
    columnHelper.accessor("name", {
        footer: ({ table }) => (
            <div className="flex">
                <div className="text-xs text-gray-500 font-medium">
                    Results of{" "}
                    <span className="font-semibold">{table.getRowCount()}</span>{" "}
                    campaigns
                </div>
            </div>
        ),
        header: () => (
            <div className="flex items-center gap-4">
                <div className="h-4 w-4 rounded shadow-base bg-white"></div>
                <div className="font-semibold">Campaign</div>
            </div>
        ),
        cell: (info) => (
            <div className="flex items-center gap-4">
                <div className="h-4 w-4 rounded shadow-base bg-white"></div>
                <div className="font-semibold">
                    <span className="h-2 w-2 bg-emerald-600 rounded-full mr-2 inline-block align-baseline" />{" "}
                    {info.renderValue()}
                </div>
            </div>
        ),
    }),
    columnHelper.display({
        id: "switch",
        cell: () => (
            <div className="flex justify-center">
                <Switch defaultChecked />
            </div>
        ),
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">Status</div>,
        cell: (info) => <div className="text-right">{info.getValue()}</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">Spend</div>,
        cell: (info) => <div className="text-right">€ 5,67</div>,
        footer: () => <div className="text-right">€ 5,67</div>,
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
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">Conversions</div>,
        cell: (info) => <div className="text-right">12</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">CPA</div>,
        cell: (info) => <div className="text-right">€ 0,47</div>,
        footer: (info) => <div className="text-right">€ 0,47</div>,
    }),
    columnHelper.accessor("status", {
        header: () => <div className="text-right">ROAS</div>,
        cell: (info) => <div className="text-right">2.82</div>,
    }),
];

function CampaignsTable({
    campaigns,
}: {
    campaigns: App.Data.AdCampaignData[];
}) {
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

            <div className="">
                <table className="w-full overflow-x-auto">
                    <thead className="h-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="font-semibold text-left h-[3.4rem] px-5 align-middle bg-gray-50 whitespace-nowrap border-b last:border-r-0 border-gray-200 border-r"
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
                    <tbody className="divide-y border-b border-gray-200 divide-gray-200">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className={cn(
                                            "px-5 py-4 whitespace-nowrap align-middle border-r border-gray-200 last:border-r-0"
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
                                        className="px-5 py-4 whitespace-nowrap align-middle border-r border-gray-200 last:border-r-0 font-normal"
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
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
