import { cn } from "@/lib/cn";
import { useIsScrolled } from "@/lib/hooks/use-is-scrolled";
import { flexRender, RowData, Table as TableType } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { getPinnedColumnStyles, ShadowSeperator } from "./utils";

const ROW_HEIGHT = 52;
const ROW_PADDING = cn("px-5");
const CONTAINER_PADDING = 0;

// const SELECTED_ROW_BG = cn(
//     "bg-brand-lighter even:bg-brand-light hover:bg-brand-light"
// );
// const PINNED_SELECTED_ROW_BG = cn(
//     "bg-brand-lighter group-hover:bg-brand-light group-even:bg-brand-light"
// );

interface Props<T> {
    table: TableType<T>;
}

export function Table<T extends RowData>({ table }: Props<T>) {
    const tableContainerRef = useRef<HTMLDivElement>(null!);
    const isScrolled = useIsScrolled(tableContainerRef, CONTAINER_PADDING);

    return (
        <div
            ref={tableContainerRef}
            className="flex-1 overflow-auto max-h-full"
        >
            <div style={{ padding: `0px ${CONTAINER_PADDING}px` }}>
                <table className="w-full min-w-max">
                    <thead className="sticky top-0 z-20 bg-white [box-shadow:0_1px_0_var(--color-gray-200)]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        style={{
                                            ...getPinnedColumnStyles(
                                                header.column
                                            ),
                                            width:
                                                header.column.columnDef.size !==
                                                undefined
                                                    ? header.column.getSize()
                                                    : undefined,
                                            height: ROW_HEIGHT,
                                        }}
                                        className={cn(
                                            "font-semibold text-left align-middle whitespace-nowrap bg-white border-gray-200 border-r last:border-r-0",
                                            ROW_PADDING,
                                            header.column.getIsPinned() &&
                                                "bg-white"
                                        )}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div className="flex items-center justify-between gap-4">
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext()
                                                )}

                                                {header.column.getCanSort() && (
                                                    <button
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        title={
                                                            header.column.getNextSortingOrder() ===
                                                            "asc"
                                                                ? "Sort ascending"
                                                                : header.column.getNextSortingOrder() ===
                                                                  "desc"
                                                                ? "Sort descending"
                                                                : "Clear sort"
                                                        }
                                                        className={cn(
                                                            !header.column.getIsSorted()
                                                                ? "text-gray-400 hover:text-black hover:bg-gray-100"
                                                                : "text-black bg-gray-100",
                                                            "text-[10px] -mr-[5px] h-5 w-5 rounded flex items-center justify-center cursor-pointer"
                                                        )}
                                                    >
                                                        {header.column.getIsSorted() ===
                                                            "desc" && (
                                                            <i className="fa-solid fa-arrow-up" />
                                                        )}
                                                        {header.column.getIsSorted() ===
                                                            "asc" && (
                                                            <i className="fa-solid fa-arrow-down" />
                                                        )}

                                                        {!header.column.getIsSorted() && (
                                                            <i className="fa-solid fa-arrow-up-arrow-down" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {header.column.getIsPinned() &&
                                            isScrolled && <ShadowSeperator />}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <TableBody
                        tableContainerRef={tableContainerRef}
                        table={table}
                        isScrolled={isScrolled}
                    />
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
                                            height: ROW_HEIGHT,
                                        }}
                                        className={cn(
                                            "whitespace-nowrap align-middle font-normal text-left border-r border-gray-200 last:border-r-0",
                                            ROW_PADDING,
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

interface TableBodyProps<T> {
    table: TableType<T>;
    tableContainerRef: React.RefObject<HTMLDivElement>;
    isScrolled: boolean;
}

function TableBody<T extends RowData>({
    table,
    tableContainerRef,
    isScrolled,
}: TableBodyProps<T>) {
    const rows = table.getRowModel().rows;
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => ROW_HEIGHT,
        getScrollElement: () => tableContainerRef.current,
        overscan: 5,
        getItemKey: (index) => rows[index]?.id ?? index,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    return (
        <tbody>
            {virtualItems.length > 0 && (
                <tr>
                    <td
                        colSpan={table.getVisibleLeafColumns().length}
                        style={{ height: virtualItems[0].start }}
                    />
                </tr>
            )}
            {virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index];
                const isEvenVisualRow = virtualRow.index % 2 === 1;
                return (
                    <tr
                        key={row.id}
                        data-index={virtualRow.index}
                        className={cn(
                            "hover:bg-gray-100 group",
                            isEvenVisualRow && "bg-gray-50",
                            row.getIsSelected() && [
                                "hover:bg-brand-light bg-brand-lighter",
                                isEvenVisualRow && "bg-brand-light",
                            ]
                        )}
                        style={{ willChange: "transform" }}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <td
                                key={cell.id}
                                style={{
                                    ...getPinnedColumnStyles(cell.column),
                                    width:
                                        cell.column.columnDef.size !== undefined
                                            ? cell.column.getSize()
                                            : undefined,
                                    height: ROW_HEIGHT,
                                }}
                                className={cn(
                                    "whitespace-nowrap min-w-32 align-middle relative border-r border-gray-200 last:border-r-0",
                                    ROW_PADDING,
                                    cell.column.getIsPinned() &&
                                        (cell.row.getIsSelected()
                                            ? cn(
                                                  "bg-brand-lighter group-hover:bg-brand-light",
                                                  isEvenVisualRow &&
                                                      "bg-brand-light"
                                              )
                                            : cn(
                                                  "bg-white group-hover:bg-gray-100",
                                                  isEvenVisualRow &&
                                                      "bg-gray-50"
                                              ))
                                )}
                            >
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                                {cell.column.getIsPinned() && isScrolled && (
                                    <ShadowSeperator />
                                )}
                            </td>
                        ))}
                    </tr>
                );
            })}
            {virtualItems.length > 0 && (
                <tr>
                    <td
                        colSpan={table.getVisibleLeafColumns().length}
                        style={{
                            height:
                                rowVirtualizer.getTotalSize() -
                                virtualItems[virtualItems.length - 1].end,
                        }}
                    />
                </tr>
            )}
        </tbody>
    );
}
