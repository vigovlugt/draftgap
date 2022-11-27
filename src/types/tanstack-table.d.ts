import "@tanstack/solid-table";

declare module "@tanstack/table-core" {
    interface ColumnMeta<TData extends RowData, TValue> {
        headerClass?: string;
    }
}
