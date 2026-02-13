// Permission constants - shared between client and server
// This file should not have any server-side imports

export const Permissions = {
    // Controls
    CONTROLS_VIEW: 'controls.view',
    CONTROLS_CREATE: 'controls.create',
    CONTROLS_UPDATE: 'controls.update',
    CONTROLS_DELETE: 'controls.delete',

    // Frameworks
    FRAMEWORKS_VIEW: 'frameworks.view',
    FRAMEWORKS_CREATE: 'frameworks.create',
    FRAMEWORKS_UPDATE: 'frameworks.update',
    FRAMEWORKS_DELETE: 'frameworks.delete',

    // Programs
    PROGRAMS_VIEW: 'programs.view',
    PROGRAMS_CREATE: 'programs.create',
    PROGRAMS_UPDATE: 'programs.update',
    PROGRAMS_DELETE: 'programs.delete',
    PROGRAMS_GENERATE_TASKS: 'programs.generate_tasks',

    // Tasks
    TASKS_VIEW: 'tasks.view',
    TASKS_CREATE: 'tasks.create',
    TASKS_UPDATE: 'tasks.update',
    TASKS_DELETE: 'tasks.delete',
    TASKS_SUBMIT: 'tasks.submit',
    TASKS_REVIEW: 'tasks.review',
    TASKS_ASSESS: 'tasks.assess',

    // Risks
    RISKS_VIEW: 'risks.view',
    RISKS_CREATE: 'risks.create',
    RISKS_UPDATE: 'risks.update',
    RISKS_DELETE: 'risks.delete',

    // Policies
    POLICIES_VIEW: 'policies.view',
    POLICIES_CREATE: 'policies.create',
    POLICIES_UPDATE: 'policies.update',
    POLICIES_DELETE: 'policies.delete',

    // Assets
    ASSETS_VIEW: 'assets.view',
    ASSETS_CREATE: 'assets.create',
    ASSETS_UPDATE: 'assets.update',
    ASSETS_DELETE: 'assets.delete',

    // Departments
    DEPARTMENTS_VIEW: 'departments.view',
    DEPARTMENTS_CREATE: 'departments.create',
    DEPARTMENTS_UPDATE: 'departments.update',
    DEPARTMENTS_DELETE: 'departments.delete',

    // Evidence
    EVIDENCE_VIEW: 'evidence.view',
    EVIDENCE_UPLOAD: 'evidence.upload',
    EVIDENCE_DELETE: 'evidence.delete',

    // Admin
    ADMIN_ROLES: 'admin.roles',
    ADMIN_USERS: 'admin.users',
    ADMIN_SETTINGS: 'admin.settings',
} as const

export type PermissionCode = typeof Permissions[keyof typeof Permissions]
