import { Table as TanstackTable, flexRender, Row } from "@tanstack/solid-table";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createEffect, For, JSX, Show } from "solid-js";

interface Props<T> {
    table: TanstackTable<T>;
    onClickRow?: (row: Row<T>) => void;
}

export function Table<T>({
    table,
    onClickRow,
    ...props
}: Props<T> & JSX.HTMLAttributes<HTMLDivElement>) {
    let tableEl: HTMLTableElement | undefined;

    const rows = () => table.getRowModel().rows;

    const rowVirtualizer = createVirtualizer({
        getScrollElement: () => tableEl!,
        estimateSize: () => 57,
        get count() {
            return rows().length;
        },
        overscan: 10,
    });

    const virtualRows = () => rowVirtualizer.getVirtualItems();

    const paddingTop = () =>
        virtualRows().length > 0 ? virtualRows()?.[0]?.start || 0 : 0;
    const paddingBottom = () =>
        virtualRows().length > 0
            ? rowVirtualizer.getTotalSize() -
              (virtualRows()?.[virtualRows().length - 1]?.end || 0)
            : 0;

    return (
        <div
            ref={tableEl}
            {...props}
            class={`rounded-md overflow-auto max-h-full max-w-full ${props.class}`}
        >
            <table class="min-w-full divide-y divide-neutral-700 text-lg md:text-xl lg:text-2xl">
                <thead class="bg-neutral-900 sticky top-0 z-[1]">
                    <For each={table.getHeaderGroups()}>
                        {(headerGroup) => (
                            <tr>
                                <For each={headerGroup.headers}>
                                    {(header, i) => (
                                        <th
                                            scope="col"
                                            class="py-3 px-2 text-left font-normal uppercase w-full whitespace-nowrap"
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
                                                "cursor-pointer":
                                                    header.column.getCanSort(),
                                            }}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div class="flex items-center gap-1">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext()
                                                      )}
                                                <Show
                                                    when={
                                                        header.column.getIsSorted() !==
                                                        false
                                                    }
                                                >
                                                    <span class="text-base mr-">
                                                        {
                                                            {
                                                                asc: " ???",
                                                                desc: " ???",
                                                            }[
                                                                header.column.getIsSorted() as string
                                                            ]
                                                        }
                                                    </span>
                                                </Show>
                                            </div>
                                        </th>
                                    )}
                                </For>
                            </tr>
                        )}
                    </For>
                </thead>
                <tbody class="divide-y divide-neutral-800 bg-primary">
                    <Show when={paddingTop() > 0}>
                        <tr>
                            <td style={{ height: `${paddingTop()}px` }} />
                        </tr>
                    </Show>
                    <For
                        each={rowVirtualizer
                            .getVirtualItems()
                            .map((i) => rows()[i.index])
                            .filter((r) => r)}
                    >
                        {(row) => (
                            <tr
                                class="transition duration-200 ease-out group/row"
                                classList={{
                                    "cursor-pointer hover:bg-neutral-800":
                                        Boolean(onClickRow),
                                }}
                                onClick={() => onClickRow?.(row)}
                                tabindex={onClickRow ? 0 : undefined}
                                onSubmit={() => onClickRow?.(row)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        onClickRow?.(row);
                                    }
                                }}
                            >
                                <For each={row.getVisibleCells()}>
                                    {(cell, i) => (
                                        <td
                                            class="whitespace-nowrap py-3 px-2 group/cell"
                                            classList={{
                                                "pl-4": i() === 0,
                                                "pr-4":
                                                    i() ===
                                                    row.getVisibleCells()
                                                        .length -
                                                        1,
                                                "cursor-pointer": Boolean(
                                                    (
                                                        cell.column.columnDef
                                                            .meta as any
                                                    )?.onClickCell
                                                ),
                                            }}
                                            onClick={(e) =>
                                                (
                                                    cell.column.columnDef
                                                        .meta as any
                                                )?.onClickCell?.(
                                                    e,
                                                    cell.getContext()
                                                )
                                            }
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
                    <Show when={paddingBottom() > 0}>
                        <tr>
                            <td style={{ height: `${paddingBottom()}px` }} />
                        </tr>
                    </Show>
                </tbody>
                <Show
                    when={table
                        .getFooterGroups()
                        .flatMap((g) => g.headers)
                        .some((h) => h.column.columnDef.footer)}
                >
                    <tfoot class="bg-neutral-900">
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
