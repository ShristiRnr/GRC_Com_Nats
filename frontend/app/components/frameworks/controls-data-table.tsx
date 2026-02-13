import { useState, useMemo } from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    type SortingState,
    getSortedRowModel,
    type ColumnFiltersState,
    getFilteredRowModel,
    type VisibilityState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { ArrowUpDown, Filter, Loader2, Plus, Trash2, AlertTriangle, CheckCircle2, XCircle, AlertCircle, Unlink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { Control } from "~/lib/api/frameworks";

interface ControlsDataTableProps {
    data: Control[];
    isLoading: boolean;
    mode: "mapped" | "available";
    onAction: (selectedIds: string[]) => void;
    actionLabel: string;
    isActionPending: boolean;
}

export function ControlsDataTable({
    data,
    isLoading,
    mode,
    onAction,
    actionLabel,
    isActionPending,
}: ControlsDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const columns = useMemo<ColumnDef<Control>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "code",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-4 hover:bg-transparent"
                    >
                        Code
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="font-mono text-xs font-medium bg-muted px-2 py-1 rounded-md w-fit text-foreground border border-border/50">
                    {row.getValue("code")}
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[300px]">
                    <div className="font-medium truncate" title={row.getValue("title")}>
                        {row.getValue("title")}
                    </div>
                    {row.original.description && (
                        <span className="text-xs text-muted-foreground truncate" title={row.original.description}>
                            {row.original.description}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const category = row.getValue("category") as string;
                return category ? (
                    <Badge variant="outline" className="text-xs bg-slate-50 truncate max-w-[150px]">
                        {category}
                    </Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                );
            },
        },
        {
            accessorKey: "compliance_status",
            header: "Compliance",
            cell: ({ row }) => {
                const status = row.original.compliance_status || "not_assessed";

                let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
                let className = "capitalize";
                let icon = null;

                switch (status) {
                    case "compliant":
                        variant = "outline";
                        className = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
                        icon = <CheckCircle2 className="mr-1 h-3 w-3" />;
                        break;
                    case "non_compliant":
                        variant = "outline";
                        className = "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
                        icon = <XCircle className="mr-1 h-3 w-3" />;
                        break;
                    case "partial":
                        variant = "outline";
                        className = "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
                        icon = <AlertCircle className="mr-1 h-3 w-3" />;
                        break;
                    default:
                        variant = "outline";
                        className = "text-muted-foreground bg-slate-50";
                        break;
                }

                return (
                    <Badge variant={variant} className={`${className} font-normal`}>
                        {icon}
                        {status.replace("_", " ")}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge
                        variant={status === 'active' ? 'default' : 'secondary'}
                        className={`capitalize ${status === 'active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200' : ''}`}
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const isMapped = mode === "mapped";
                if (!isMapped) return null;

                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onAction([row.original.id])}
                        disabled={isActionPending}
                    >
                        {isActionPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Unlink className="h-4 w-4" />
                        )}
                        <span className="sr-only">Unmap Control</span>
                    </Button>
                );
            },
        },

    ], [mode, isActionPending, onAction]);

    const table = useReactTable({
        data: data || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const selectedIds = Object.keys(rowSelection).map(index => data[parseInt(index)]?.id).filter(Boolean);

    // Unique Categories for Filter
    const categories = Array.from(new Set((data || []).map(c => c.category).filter(Boolean) as string[]));

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <Input
                        placeholder="Filter controls..."
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                    {categories.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="border-dashed">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Category
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px]">
                                <DropdownMenuLabel>Filter Categories</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {categories.map((cat) => (
                                    <DropdownMenuCheckboxItem
                                        key={cat}
                                        checked={(table.getColumn("category")?.getFilterValue() as string[])?.includes(cat)}
                                        onCheckedChange={(checked) => {
                                            const current = (table.getColumn("category")?.getFilterValue() as string[]) || [];
                                            const next = checked
                                                ? [...current, cat]
                                                : current.filter((value) => value !== cat);
                                            table.getColumn("category")?.setFilterValue(next.length ? next : undefined);
                                        }}
                                    >
                                        {cat}
                                    </DropdownMenuCheckboxItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                    checked={!table.getColumn("category")?.getFilterValue()}
                                    onCheckedChange={() => table.getColumn("category")?.setFilterValue(undefined)}
                                    className="justify-center text-center"
                                >
                                    Clear Filters
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {selectedIds.length > 0 && (
                    <Button
                        variant={mode === 'mapped' ? "destructive" : "default"}
                        size="sm"
                        onClick={() => {
                            const selectedRows = table.getFilteredSelectedRowModel().rows;
                            const ids = selectedRows.map(r => r.original.id);
                            onAction(ids);
                            setRowSelection({});
                        }}
                        disabled={isActionPending}
                    >
                        {isActionPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : mode === 'mapped' ? (
                            <Trash2 className="mr-2 h-4 w-4" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        {actionLabel} ({selectedIds.length})
                    </Button>
                )}
            </div>

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin inline text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
