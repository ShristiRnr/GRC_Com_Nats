import { useState, useMemo } from "react";
import type { Control } from "~/lib/api/frameworks";
import { useFrameworkControls, useAvailableControls, useMapControls, useUnmapControls } from "~/hooks/queries/use-frameworks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Checkbox } from "~/components/ui/checkbox";
import {
    Search,
    ChevronRight,
    ChevronLeft,
    ChevronsRight,
    ChevronsLeft,
    Loader2,
    Filter
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";

interface ControlTransferListProps {
    frameworkId: string;
}

export function ControlTransferList({ frameworkId }: ControlTransferListProps) {
    const { data: mappedControls = [], isLoading: isLoadingMapped } = useFrameworkControls(frameworkId);
    const { data: availableControls = [], isLoading: isLoadingAvailable } = useAvailableControls(frameworkId);

    const mapMutation = useMapControls();
    const unmapMutation = useUnmapControls();

    const [leftSearch, setLeftSearch] = useState("");
    const [rightSearch, setRightSearch] = useState("");
    const [leftSelection, setLeftSelection] = useState<string[]>([]);
    const [rightSelection, setRightSelection] = useState<string[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

    // Filter Logic
    const filterControls = (controls: Control[], search: string) => {
        return controls.filter(c => {
            const matchesSearch =
                c.code.toLowerCase().includes(search.toLowerCase()) ||
                c.title.toLowerCase().includes(search.toLowerCase());

            const matchesCategory = categoryFilter.length === 0 ||
                (c.category && categoryFilter.includes(c.category));

            return matchesSearch && matchesCategory;
        });
    };

    const filteredAvailable = useMemo(() => filterControls(availableControls, leftSearch), [availableControls, leftSearch, categoryFilter]);
    const filteredMapped = useMemo(() => filterControls(mappedControls, rightSearch), [mappedControls, rightSearch, categoryFilter]);

    // Unique Categories for Filter
    const categories = useMemo(() => {
        const all = [...availableControls, ...mappedControls];
        const cats = new Set(all.map(c => c.category).filter(Boolean) as string[]);
        return Array.from(cats);
    }, [availableControls, mappedControls]);

    // Action Handlers
    const handleMoveRight = () => {
        if (leftSelection.length === 0) return;
        mapMutation.mutate({ frameworkId, controlIds: leftSelection }, {
            onSuccess: () => setLeftSelection([])
        });
    };

    const handleMoveLeft = () => {
        if (rightSelection.length === 0) return;
        unmapMutation.mutate({ frameworkId, controlIds: rightSelection }, {
            onSuccess: () => setRightSelection([])
        });
    };

    const handleMoveAllRight = () => {
        const ids = filteredAvailable.map(c => c.id);
        if (ids.length === 0) return;
        if (confirm(`Are you sure you want to map all ${ids.length} filtered controls?`)) {
            mapMutation.mutate({ frameworkId, controlIds: ids }, {
                onSuccess: () => setLeftSelection([])
            });
        }
    };

    const handleMoveAllLeft = () => {
        const ids = filteredMapped.map(c => c.id);
        if (ids.length === 0) return;
        if (confirm(`Are you sure you want to unmap all ${ids.length} filtered controls?`)) {
            unmapMutation.mutate({ frameworkId, controlIds: ids }, {
                onSuccess: () => setRightSelection([])
            });
        }
    };

    // Selection Toggles
    const toggleSelection = (id: string, current: string[], setter: (ids: string[]) => void) => {
        if (current.includes(id)) {
            setter(current.filter(i => i !== id));
        } else {
            setter([...current, id]);
        }
    };

    const toggleAll = (items: Control[], current: string[], setter: (ids: string[]) => void) => {
        const itemIds = items.map(c => c.id);
        const allSelected = itemIds.every(id => current.includes(id));

        if (allSelected) {
            setter(current.filter(id => !itemIds.includes(id)));
        } else {
            // Add any not currently selected
            const toAdd = itemIds.filter(id => !current.includes(id));
            setter([...current, ...toAdd]);
        }
    };

    const isLoading = isLoadingMapped || isLoadingAvailable || mapMutation.isPending || unmapMutation.isPending;

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed">
                                <Filter className="mr-2 h-4 w-4" />
                                <FilterCategoryLabel count={categoryFilter.length} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                            <DropdownMenuLabel>Categories</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {categories.map((cat) => (
                                <DropdownMenuCheckboxItem
                                    key={cat}
                                    checked={categoryFilter.includes(cat)}
                                    onCheckedChange={(checked) => {
                                        if (checked) setCategoryFilter([...categoryFilter, cat]);
                                        else setCategoryFilter(categoryFilter.filter(c => c !== cat));
                                    }}
                                >
                                    {cat}
                                </DropdownMenuCheckboxItem>
                            ))}
                            {categoryFilter.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                        checked={false}
                                        onCheckedChange={() => setCategoryFilter([])}
                                        className="justify-center text-center"
                                    >
                                        Clear Filters
                                    </DropdownMenuCheckboxItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="text-sm text-muted-foreground">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : null}
                    {mappedControls.length} Controls Mapped
                </div>
            </div>

            {/* Transfer Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-4 h-[600px]">

                {/* LEFT LIST: Available */}
                <ControlList
                    title="Available Controls"
                    items={filteredAvailable}
                    selectedIds={leftSelection}
                    search={leftSearch}
                    onSearchChange={setLeftSearch}
                    onToggleSelection={(id) => toggleSelection(id, leftSelection, setLeftSelection)}
                    onToggleAll={() => toggleAll(filteredAvailable, leftSelection, setLeftSelection)}
                    isLoading={isLoadingAvailable}
                    variant="default"
                />

                {/* ACTIONS: Middle Buttons */}
                <div className="flex lg:flex-col justify-center gap-2 items-center">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleMoveAllRight}
                        disabled={filteredAvailable.length === 0 || isLoading}
                        title="Map All Filtered"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleMoveRight}
                        disabled={leftSelection.length === 0 || isLoading}
                        title="Map Selected"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleMoveLeft}
                        disabled={rightSelection.length === 0 || isLoading}
                        title="Unmap Selected"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleMoveAllLeft}
                        disabled={filteredMapped.length === 0 || isLoading}
                        title="Unmap All Filtered"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                </div>

                {/* RIGHT LIST: Mapped */}
                <ControlList
                    title="Mapped Controls"
                    items={filteredMapped}
                    selectedIds={rightSelection}
                    search={rightSearch}
                    onSearchChange={setRightSearch}
                    onToggleSelection={(id) => toggleSelection(id, rightSelection, setRightSelection)}
                    onToggleAll={() => toggleAll(filteredMapped, rightSelection, setRightSelection)}
                    isLoading={isLoadingMapped}
                    variant="mapped"
                />
            </div>
        </div>
    );
}

function FilterCategoryLabel({ count }: { count: number }) {
    if (count === 0) return <span>Filter Category</span>;
    return (
        <>
            Filter Category
            <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                {count}
            </Badge>
        </>
    );
}

interface ControlListProps {
    title: string;
    items: Control[];
    selectedIds: string[];
    search: string;
    onSearchChange: (val: string) => void;
    onToggleSelection: (id: string) => void;
    onToggleAll: () => void;
    isLoading: boolean;
    variant: "default" | "mapped";
}

function ControlList({
    title,
    items,
    selectedIds,
    search,
    onSearchChange,
    onToggleSelection,
    onToggleAll,
    isLoading,
    variant
}: ControlListProps) {
    const allSelected = items.length > 0 && items.every(i => selectedIds.includes(i.id));

    return (
        <Card className={`flex flex-col h-full ${variant === 'mapped' ? 'border-primary/20 bg-primary/5' : ''}`}>
            <CardHeader className="p-4 pb-2 space-y-2">
                <CardTitle className="text-base flex justify-between items-center">
                    {title}
                    <Badge variant="outline">{items.length}</Badge>
                </CardTitle>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-8 h-9"
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 pt-1 border-b pb-2">
                    <Checkbox
                        id={`select-all-${variant}`}
                        checked={allSelected}
                        onCheckedChange={onToggleAll}
                        disabled={items.length === 0}
                    />
                    <label
                        htmlFor={`select-all-${variant}`}
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Select All {items.length > 0 && `(${items.length})`}
                    </label>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                <ScrollArea className="h-[430px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                            <p>No controls found</p>
                        </div>
                    ) : (
                        <div className="divide-y text-left">
                            {items.map(control => (
                                <div
                                    key={control.id}
                                    className={`flex items-start space-x-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${selectedIds.includes(control.id) ? 'bg-muted' : ''}`}
                                    onClick={() => onToggleSelection(control.id)}
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(control.id)}
                                        onCheckedChange={() => onToggleSelection(control.id)}
                                    />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded">
                                                {control.code}
                                            </span>
                                            {control.category && (
                                                <Badge variant="secondary" className="text-[10px] h-5">
                                                    {control.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm line-clamp-2 leading-tight">
                                            {control.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
