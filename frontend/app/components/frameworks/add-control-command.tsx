import * as React from "react";
import { Check, Plus, Search } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import type { Control } from "~/lib/api/frameworks";

interface AddControlCommandProps {
    availableControls: Control[];
    onMap: (controlIds: string[]) => void;
    isPending: boolean;
}

export function AddControlCommand({ availableControls, onMap, isPending }: AddControlCommandProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[300px] justify-between text-muted-foreground hover:text-foreground"
                    disabled={isPending}
                >
                    <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Add control...
                    </span>
                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search control code or title..." />
                    <CommandList>
                        <CommandEmpty>No control found.</CommandEmpty>
                        <CommandGroup heading="Available Controls">
                            {availableControls.map((control) => (
                                <CommandItem
                                    key={control.id}
                                    value={`${control.code} ${control.title}`}
                                    onSelect={() => {
                                        onMap([control.id]);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-medium text-xs bg-muted px-1.5 py-0.5 rounded">
                                                {control.code}
                                            </span>
                                            <span className="font-medium truncate max-w-[180px]">
                                                {control.title}
                                            </span>
                                        </div>
                                        {control.category && (
                                            <span className="text-xs text-muted-foreground mt-0.5">
                                                {control.category}
                                            </span>
                                        )}
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4 opacity-0" // Always hidden as verified by selection action
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
