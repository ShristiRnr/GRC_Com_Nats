import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '~/components/ui/scroll-area'
import {
    Plus,
    X,
    Search,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Loader2
} from 'lucide-react'
import { useMapControls, useUnmapControls } from '~/hooks/queries/use-frameworks'
import { toast } from 'sonner'
import type { Control } from '~/lib/api/frameworks'

interface ControlMappingPanelProps {
    frameworkId: string
    mappedControls: Control[]
    unmappedControls: Control[]
}

export function ControlMappingPanel({
    frameworkId,
    mappedControls,
    unmappedControls
}: ControlMappingPanelProps) {
    const [searchMapped, setSearchMapped] = useState('')
    const [searchUnmapped, setSearchUnmapped] = useState('')
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const mapMutation = useMapControls()
    const unmapMutation = useUnmapControls()

    const filteredMapped = mappedControls.filter(c =>
        c.code.toLowerCase().includes(searchMapped.toLowerCase()) ||
        c.title.toLowerCase().includes(searchMapped.toLowerCase())
    )

    const filteredUnmapped = unmappedControls.filter(c =>
        c.code.toLowerCase().includes(searchUnmapped.toLowerCase()) ||
        c.title.toLowerCase().includes(searchUnmapped.toLowerCase())
    )

    const handleMap = (controlId: string) => {
        setLoadingId(controlId)
        mapMutation.mutate(
            { frameworkId, controlIds: [controlId] },
            {
                onSettled: () => setLoadingId(null)
            }
        )
    }

    const handleUnmap = (controlId: string) => {
        setLoadingId(controlId)
        unmapMutation.mutate(
            { frameworkId, controlIds: [controlId] },
            {
                onSettled: () => setLoadingId(null)
            }
        )
    }

    const isPending = mapMutation.isPending || unmapMutation.isPending

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Controls (Left Panel) */}
            <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {unmappedControls.length}
                        </span>
                        Available Controls
                    </CardTitle>
                    <CardDescription>Controls not yet mapped to this framework</CardDescription>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search controls..."
                            className="pl-9"
                            value={searchUnmapped}
                            onChange={(e) => setSearchUnmapped(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-2">
                            {filteredUnmapped.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {unmappedControls.length === 0
                                        ? 'All controls are already mapped'
                                        : 'No matching controls found'
                                    }
                                </div>
                            ) : (
                                filteredUnmapped.map((control) => (
                                    <div
                                        key={control.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-medium text-primary">
                                                    {control.code}
                                                </span>
                                                {control.category && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {control.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                                                {control.title}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                            onClick={() => handleMap(control.id)}
                                            disabled={loadingId === control.id || isPending}
                                        >
                                            {loadingId === control.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    Add
                                                    <ArrowRight className="h-4 w-4 ml-1" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Mapped Controls (Right Panel) */}
            <Card className="h-[600px] flex flex-col border-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {mappedControls.length}
                        </span>
                        Mapped Controls
                    </CardTitle>
                    <CardDescription>Controls assigned to this framework</CardDescription>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search mapped..."
                            className="pl-9"
                            value={searchMapped}
                            onChange={(e) => setSearchMapped(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-2">
                            {filteredMapped.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {mappedControls.length === 0
                                        ? 'No controls mapped yet'
                                        : 'No matching controls found'
                                    }
                                </div>
                            ) : (
                                filteredMapped.map((control) => (
                                    <div
                                        key={control.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-medium text-primary">
                                                    {control.code}
                                                </span>
                                                {control.category && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {control.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                                                {control.title}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-destructive hover:text-destructive"
                                            onClick={() => handleUnmap(control.id)}
                                            disabled={loadingId === control.id || isPending}
                                        >
                                            {loadingId === control.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                                    Remove
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
