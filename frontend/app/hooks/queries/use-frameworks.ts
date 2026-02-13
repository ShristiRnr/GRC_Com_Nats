import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "~/lib/api/frameworks";
import { toast } from "sonner";

export const frameworkKeys = {
    all: ['frameworks'] as const,
    lists: () => [...frameworkKeys.all, 'list'] as const,
    list: (filters: string) => [...frameworkKeys.lists(), { filters }] as const,
    details: () => [...frameworkKeys.all, 'detail'] as const,
    detail: (id: string) => [...frameworkKeys.details(), id] as const,
    controls: (id: string) => [...frameworkKeys.detail(id), 'controls'] as const,
    availableControls: (id: string) => [...frameworkKeys.detail(id), 'available-controls'] as const,
};

export function useFrameworks() {
    return useQuery({
        queryKey: frameworkKeys.lists(),
        queryFn: api.getFrameworks,
    });
}

export function useFramework(id: string) {
    return useQuery({
        queryKey: frameworkKeys.detail(id),
        queryFn: () => api.getFramework(id),
        enabled: !!id,
    });
}

export function useFrameworkControls(id: string) {
    return useQuery({
        queryKey: frameworkKeys.controls(id),
        queryFn: () => api.getFrameworkControls(id),
        enabled: !!id,
    });
}

export function useAvailableControls(id: string) {
    return useQuery({
        queryKey: frameworkKeys.availableControls(id),
        queryFn: () => api.getAvailableControls(id),
        enabled: !!id,
    });
}

export function useMapControls() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ frameworkId, controlIds }: { frameworkId: string; controlIds: string[] }) =>
            api.mapControls(frameworkId, controlIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: frameworkKeys.controls(variables.frameworkId) });
            queryClient.invalidateQueries({ queryKey: frameworkKeys.availableControls(variables.frameworkId) });
            queryClient.invalidateQueries({ queryKey: frameworkKeys.detail(variables.frameworkId) });
            toast.success("Controls mapped successfully");
        },
        onError: (error) => {
            toast.error("Failed to map controls: " + (error as Error).message);
        }
    });
}

export function useUnmapControls() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ frameworkId, controlIds }: { frameworkId: string; controlIds: string[] }) =>
            api.unmapControls(frameworkId, controlIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: frameworkKeys.controls(variables.frameworkId) });
            queryClient.invalidateQueries({ queryKey: frameworkKeys.availableControls(variables.frameworkId) });
            queryClient.invalidateQueries({ queryKey: frameworkKeys.detail(variables.frameworkId) });
            toast.success("Controls unmapped successfully");
        },
        onError: (error) => {
            toast.error("Failed to unmap controls: " + (error as Error).message);
        }
    });
}
