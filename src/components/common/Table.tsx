import { Table as TanstackTable, flexRender, Row } from "@tanstack/solid-table";
import { For, JSX, Show } from "solid-js";

interface Props<T> {
    table: TanstackTable<T>;
    onClickRow?: (row: Row<T>) => void;
}

export function Table<T>({
    table,
    onClickRow,
    ...props
}: Props<T> & JSX.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            class={`rounded-md overflow-x-auto overflow-y-auto max-h-full ${props.class}`}
        >
            <table class="min-w-full divide-y divide-neutral-700">
                <thead class="bg-[#141414] sticky top-0 z-10">
                    <For each={table.getHeaderGroups()}>
                        {(headerGroup) => (
                            <tr>
                                <For each={headerGroup.headers}>
                                    {(header, i) => (
                                        <th
                                            scope="col"
                                            class="py-3 px-2 text-left font-normal uppercase w-full"
                                            classList={{
                                                "pl-4": i() === 0,
                                                "pr-4":
                                                    i() ===
                                                    headerGroup.headers.length -
                                                        1,
                                                [(
                                                    header.column.columnDef
                                                        .meta as any
                                                )?.headerClass]: (
                                                    header.column.columnDef
                                                        .meta as any
                                                )?.headerClass,
                                            }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </th>
                                    )}
                                </For>
                            </tr>
                        )}
                    </For>
                </thead>
                <tbody class="divide-y divide-neutral-800 bg-primary">
                    <For each={table.getRowModel().rows}>
                        {(row) => (
                            <tr
                                class="cursor-pointer hover:bg-neutral-800 transition-colors duration-150 ease-in-out"
                                onClick={() => onClickRow?.(row)}
                            >
                                <For each={row.getVisibleCells()}>
                                    {(cell, i) => (
                                        <td
                                            class="whitespace-nowrap py-3 px-2"
                                            classList={{
                                                "pl-4": i() === 0,
                                                "pr-4":
                                                    i() ===
                                                    row.getVisibleCells()
                                                        .length -
                                                        1,
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    )}
                                </For>
                            </tr>
                        )}
                    </For>
                </tbody>
                <Show
                    when={table
                        .getFooterGroups()
                        .flatMap((g) => g.headers)
                        .some((h) => h.column.columnDef.footer)}
                >
                    <tfoot class="bg-[#141414]">
                        <For each={table.getFooterGroups()}>
                            {(footerGroup) => (
                                <tr>
                                    <For each={footerGroup.headers}>
                                        {(footer, i) => (
                                            <th
                                                scope="col"
                                                class="py-3 px-2 text-left font-normal uppercase w-full"
                                                classList={{
                                                    "pl-4": i() === 0,
                                                    "pr-4":
                                                        i() ===
                                                        footerGroup.headers
                                                            .length -
                                                            1,
                                                    [(
                                                        footer.column.columnDef
                                                            .meta as any
                                                    )?.footerClass]: (
                                                        footer.column.columnDef
                                                            .meta as any
                                                    )?.footerClass,
                                                }}
                                            >
                                                {footer.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          footer.column
                                                              .columnDef.footer,
                                                          footer.getContext()
                                                      )}
                                            </th>
                                        )}
                                    </For>
                                </tr>
                            )}
                        </For>
                    </tfoot>
                </Show>
            </table>
        </div>
    );
}
