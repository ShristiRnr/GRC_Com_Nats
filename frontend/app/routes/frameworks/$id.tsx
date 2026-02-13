import { useLoaderData, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { getFramework } from "~/lib/api/frameworks";
import { ControlManagementTabs } from "~/components/frameworks/control-management-tabs";
import { EditFrameworkDialog } from "~/components/frameworks/edit-framework-dialog";
import { DeleteFrameworkDialog } from "~/components/frameworks/delete-framework-dialog";
import { PublishFrameworkButton } from "~/components/frameworks/publish-framework-button";

export async function clientLoader({ params }: { params: { id: string } }) {
    const { id } = params;
    if (!id) throw new Error("ID is required");

    const framework = await getFramework(id);
    if (!framework) {
        throw new Response("Not Found", { status: 404 });
    }

    return { framework };
}

export default function FrameworkDetailPage() {
    const { framework } = useLoaderData<typeof clientLoader>();
    const navigate = useNavigate();

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header / Breadcrumbs-ish */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                    <Link to="/frameworks">
                        <Button variant="ghost" size="icon" className="mt-1">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {framework.name}
                            </h2>
                            {framework.version && (
                                <Badge variant="outline" className="font-mono text-sm px-2">
                                    {framework.version}
                                </Badge>
                            )}
                            <Badge
                                variant={framework.status === 'published' ? 'default' : framework.status === 'archived' ? 'destructive' : 'secondary'}
                                className={`capitalize ${framework.status === 'published' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            >
                                {framework.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Manage controls and monitor compliance for this framework.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <PublishFrameworkButton framework={framework} />
                    <EditFrameworkDialog framework={framework} />
                    <DeleteFrameworkDialog framework={framework} />
                </div>
            </div>

            {/* Overview Card */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">About this Framework</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        {framework.description || 'No detailed description available for this framework.'}
                    </p>
                </div>
            </div>

            {/* Controls Management */}
            <ControlManagementTabs frameworkId={framework.id} />
        </div>
    );
}
