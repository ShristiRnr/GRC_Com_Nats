export const queryKeys = {
    risks: {
        all: ["risks"] as const,
        lists: () => [...queryKeys.risks.all, "list"] as const,
        list: (filters?: any) => [...queryKeys.risks.lists(), { filters }] as const,
        details: () => [...queryKeys.risks.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.risks.details(), id] as const,
        stats: (context?: any) => [...queryKeys.risks.all, "stats", { context }] as const,
        matrix: (context?: any) => [...queryKeys.risks.all, "matrix", { context }] as const,
    },
    controls: {
        all: ["controls"] as const,
        lists: () => [...queryKeys.controls.all, "list"] as const,
        list: (filters?: any) => [...queryKeys.controls.lists(), { filters }] as const,
        details: () => [...queryKeys.controls.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.controls.details(), id] as const,
        stats: () => [...queryKeys.controls.all, "stats"] as const,
    },
    frameworks: {
        all: ["frameworks"] as const,
        lists: () => [...queryKeys.frameworks.all, "list"] as const,
        list: (filters?: any) => [...queryKeys.frameworks.lists(), { filters }] as const,
        details: () => [...queryKeys.frameworks.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.frameworks.details(), id] as const,
        stats: () => [...queryKeys.frameworks.all, "stats"] as const,
    },
};
