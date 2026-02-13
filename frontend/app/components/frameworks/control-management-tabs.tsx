import { Card, CardContent } from "~/components/ui/card";
import { ControlsDataTable } from "./controls-data-table";
import { Button } from "~/components/ui/button";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { FrameworkStatsBoard } from "./framework-stats-board";
import { exportToCsv } from "~/lib/utils";
import {
    useFrameworkControls,
    useAvailableControls,
    useMapControls,
    useUnmapControls
} from "~/hooks/queries/use-frameworks";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";

interface ControlManagementTabsProps {
    frameworkId: string;
}

export function ControlManagementTabs({ frameworkId }: ControlManagementTabsProps) {
    const { data: mappedControls = [], isLoading: isLoadingMapped } = useFrameworkControls(frameworkId);
    const { data: availableControls = [], isLoading: isLoadingAvailable } = useAvailableControls(frameworkId);

    const mapMutation = useMapControls();
    const unmapMutation = useUnmapControls();

    const handleExport = () => {
        if (!mappedControls.length) {
            toast.error("No data to export");
            return;
        }

        const headers = ["Code", "Title", "Description", "Category", "Status", "Compliance"];

        try {
            exportToCsv(mappedControls, `framework-${frameworkId}-controls`, headers, (c) => [
                c.code,
                c.title,
                c.description || '',
                c.category || '',
                c.status,
                c.compliance_status || 'not_assessed'
            ]);
            toast.success("Export started");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export controls");
        }
    };

    return (
        <div className="space-y-8">
            <FrameworkStatsBoard controls={mappedControls} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-semibold tracking-tight">Mapped Controls</h3>
                        <div className="flex items-center justify-center bg-secondary min-h-6 min-w-6 rounded-full px-2">
                            <span className="text-xs font-medium">{mappedControls.length}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Map Controls
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[90vw] max-w-[90vw] h-[85vh] flex flex-col p-0 overflow-hidden">
                                <div className="p-6 pb-0">
                                    <DialogHeader>
                                        <DialogTitle>Map Controls to Framework</DialogTitle>
                                        <DialogDescription>
                                            Select controls from the library to map to this framework.
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className="flex-1 overflow-auto p-6">
                                    <ControlsDataTable
                                        data={availableControls}
                                        isLoading={isLoadingAvailable}
                                        mode="available"
                                        actionLabel="Map Selected"
                                        isActionPending={mapMutation.isPending}
                                        onAction={(ids) => mapMutation.mutate({ frameworkId, controlIds: ids })}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="outline"
                            onClick={handleExport}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <ControlsDataTable
                            data={mappedControls}
                            isLoading={isLoadingMapped}
                            mode="mapped"
                            actionLabel="Unmap Selected"
                            isActionPending={unmapMutation.isPending}
                            onAction={(ids) => unmapMutation.mutate({ frameworkId, controlIds: ids })}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
