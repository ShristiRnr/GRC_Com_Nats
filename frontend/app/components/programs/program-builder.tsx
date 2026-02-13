'use client'

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
    Calendar as CalendarIcon,
    Check,
    ArrowRight,
    ArrowLeft,
    Shield,
    Database,
    User,
    FileText,
    List,
    Building,
    Search,
    Loader2,
    ChevronRight
} from 'lucide-react'

import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '~/components/ui/popover'
import { Calendar } from '~/components/ui/calendar'
import { Checkbox } from '~/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'

import { createProgram } from '~/lib/api/programs'
import { getPublishedFrameworks, type Framework } from '~/lib/api/frameworks'
import { getDepartments, type Department } from '~/lib/api/departments'
import { getAssets, getAssetCategories, getAssetTypes, type Asset, type AssetCategory, type AssetType } from '~/lib/api/assets'
import { getProfiles, type Profile } from '~/lib/api/profiles'
import { getAssetControlMappings, getControls, type Control } from '~/lib/api/controls'
import { Switch } from '~/components/ui/switch'

interface ProgramBuilderProps {
    // No longer takes props, fetches internally
}

const PROGRAM_TYPES = [
    { value: 'internal_audit', label: 'Internal Audit', description: 'Self-assessment by your internal team', icon: Shield },
    { value: 'external_audit', label: 'External Audit', description: 'Assessment by a third-party auditor', icon: User },
    { value: 'assessment', label: 'Assessment', description: 'General compliance assessment', icon: FileText },
] as const

// Step indicator component
function StepIndicator({ step, currentStep, label }: { step: number; currentStep: number; label: string }) {
    const isActive = step === currentStep
    const isComplete = step < currentStep
    return (
        <div className="flex items-center gap-2.5">
            <div className={cn(
                "flex items-center justify-center size-8 rounded-full text-sm font-semibold transition-all duration-300",
                isComplete && "bg-emerald-500 text-white",
                isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                !isActive && !isComplete && "bg-muted text-muted-foreground"
            )}>
                {isComplete ? <Check className="size-4" /> : step}
            </div>
            <span className={cn(
                "text-sm font-medium transition-colors hidden sm:inline",
                isActive ? "text-foreground" : "text-muted-foreground"
            )}>{label}</span>
        </div>
    )
}

export function ProgramBuilder({ }: ProgramBuilderProps) {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    // Dependency Data State
    const [frameworks, setFrameworks] = useState<Framework[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([])
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([])
    const [assessors, setAssessors] = useState<Profile[]>([])
    const [assetControlMap, setAssetControlMap] = useState<Record<string, string[]>>({})
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    // Fetch dependencies
    useEffect(() => {
        async function loadDependencies() {
            try {
                const [fw, dept, ass, cat, typ, prof, map] = await Promise.all([
                    getPublishedFrameworks(),
                    getDepartments(),
                    getAssets(),
                    getAssetCategories(),
                    getAssetTypes(),
                    getProfiles(),
                    getAssetControlMappings(),
                ])
                setFrameworks(fw)
                setDepartments(dept)
                setAssets(ass)
                setAssetCategories(cat)
                setAssetTypes(typ)
                setAssessors(prof)
                setAssetControlMap(map)
            } catch (error) {
                console.error("Failed to load dependency data", error)
                toast.error("Some data failed to load. The form may be incomplete.")
            } finally {
                setIsInitialLoading(false)
            }
        }
        loadDependencies()
    }, [])

    // Program Details
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<'internal_audit' | 'external_audit' | 'assessment'>('internal_audit')
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [assessorId, setAssessorId] = useState<string>('')

    // Scope Selection
    const [selectedFrameworkIds, setSelectedFrameworkIds] = useState<string[]>([])
    const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([])
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])

    // Controls Logic
    const [availableControls, setAvailableControls] = useState<Control[]>([])
    const [selectedControlIds, setSelectedControlIds] = useState<Set<string>>(new Set())
    const [isLoadingControls, setIsLoadingControls] = useState(false)
    const [controlSearch, setControlSearch] = useState('')
    const [autoSelectByDepartment, setAutoSelectByDepartment] = useState(true)
    const [autoSelectByAsset, setAutoSelectByAsset] = useState(true)

    // Asset search
    const [assetSearch, setAssetSearch] = useState('')

    // Fetch controls when frameworks change
    useEffect(() => {
        const fetchControls = async () => {
            if (selectedFrameworkIds.length === 0) {
                setAvailableControls([])
                return
            }

            setIsLoadingControls(true)
            try {
                const controls = await getControls(selectedFrameworkIds.join(','))
                setAvailableControls(controls)
            } catch (error) {
                console.error("Failed to fetch controls", error)
                toast.error("Failed to load controls")
            } finally {
                setIsLoadingControls(false)
            }
        }

        fetchControls()
    }, [selectedFrameworkIds])

    // Build set of control IDs linked to selected assets (from actual junction table)
    const assetLinkedControlIds = useMemo(() => {
        const ids = new Set<string>()
        selectedAssetIds.forEach(assetId => {
            const linked = assetControlMap[assetId]
            if (linked) linked.forEach(cid => ids.add(cid))
        })
        return ids
    }, [selectedAssetIds, assetControlMap])

    // Auto-select controls based on Department and Asset selection
    useEffect(() => {
        if (!availableControls || availableControls.length === 0) return

        const updatedSelection = new Set(selectedControlIds)

        availableControls.forEach(control => {
            let shouldSelect = false

            // Match by department - Add safety check for control.department_id
            if (autoSelectByDepartment && control.department_id && selectedDepartmentIds.includes(control.department_id)) {
                shouldSelect = true
            }

            // Match by asset (actual junction table linkage)
            if (autoSelectByAsset && assetLinkedControlIds.has(control.id)) {
                shouldSelect = true
            }

            if (shouldSelect) {
                updatedSelection.add(control.id)
            }
        })

        // Only update if the selection actually changed
        if (updatedSelection.size !== selectedControlIds.size ||
            ![...updatedSelection].every(id => selectedControlIds.has(id))) {
            setSelectedControlIds(updatedSelection)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDepartmentIds, selectedAssetIds, availableControls, autoSelectByDepartment, autoSelectByAsset, assetLinkedControlIds])

    // Helpers
    const toggleSelection = (id: string, current: string[], set: (v: string[]) => void) => {
        if (current.includes(id)) {
            set(current.filter(i => i !== id))
        } else {
            set([...current, id])
        }
    }

    const toggleControl = (id: string) => {
        const next = new Set(selectedControlIds)
        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }
        setSelectedControlIds(next)
    }

    // const selectAllControls = () => {
    //     setSelectedControlIds(new Set(filteredControls.map(c => c.id)))
    // }

    // const deselectAllControls = () => {
    //     setSelectedControlIds(new Set())
    // }

    const handleSubmit = async () => {
        if (!name) {
            toast.error("Program name is required")
            setCurrentStep(1)
            return
        }
        if (selectedFrameworkIds.length === 0) {
            toast.error("At least one framework is required")
            setCurrentStep(2)
            return
        }
        if (selectedControlIds.size === 0) {
            toast.error("At least one control must be selected")
            setCurrentStep(3)
            return
        }

        setIsSubmitting(true)
        try {
            await createProgram({
                name,
                description,
                type,
                start_date: startDate?.toISOString(),
                end_date: endDate?.toISOString(),
                framework_ids: selectedFrameworkIds,
                department_ids: selectedDepartmentIds,
                asset_ids: selectedAssetIds,
                control_ids: Array.from(selectedControlIds),
                assessor_id: assessorId || undefined
            })

            toast.success("Program created successfully")
            navigate('/programs')
        } catch (error) {
            console.error(error)
            toast.error("Failed to create program")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Filter controls for display
    const filteredControls = useMemo(() => {
        return availableControls.filter(c =>
            c.title.toLowerCase().includes(controlSearch.toLowerCase()) ||
            c.code.toLowerCase().includes(controlSearch.toLowerCase())
        )
    }, [availableControls, controlSearch])

    // Filtered assets - Add safety check for a.name
    const filteredAssets = useMemo(() => {
        if (!assets) return []
        if (!assetSearch) return assets
        const search = assetSearch.toLowerCase()
        return assets.filter(a =>
            a.name?.toLowerCase().includes(search)
        )
    }, [assets, assetSearch])

    // Control counts per framework/department/asset
    const controlCountsByFramework = useMemo(() => {
        const map = new Map<string, number>()
        availableControls.forEach(control => {
            // Use framework_id from backend (UUID string)
            if (control.framework_id) {
                map.set(control.framework_id, (map.get(control.framework_id) || 0) + 1)
            }
            // Fallback: also check frameworks[] array if present (grc-compli-v1 compat)
            control.frameworks?.forEach((f: { name: string }) => {
                const framework = frameworks.find(fw => fw.name === f.name)
                if (framework && !control.framework_id) {
                    map.set(framework.id, (map.get(framework.id) || 0) + 1)
                }
            })
        })
        return map
    }, [availableControls, frameworks])

    const controlCountsByDepartment = useMemo(() => {
        const map = new Map<string, number>()
        availableControls.forEach(control => {
            if (control.department_id) {
                map.set(control.department_id, (map.get(control.department_id) || 0) + 1)
            }
        })
        return map
    }, [availableControls])

    const controlCountsByAsset = useMemo(() => {
        const map = new Map<string, number>()
        const availableControlIds = new Set(availableControls.map(c => c.id))
        Object.entries(assetControlMap).forEach(([assetId, controlIds]) => {
            const count = controlIds.filter(cid => availableControlIds.has(cid)).length
            if (count > 0) map.set(assetId, count)
        })
        return map
    }, [assetControlMap, availableControls])

    // Stats
    const stats = useMemo(() => ({
        frameworks: selectedFrameworkIds.length,
        departments: selectedDepartmentIds.length,
        assets: selectedAssetIds.length,
        controls: selectedControlIds.size,
        totalControls: availableControls.length
    }), [selectedFrameworkIds, selectedDepartmentIds, selectedAssetIds, selectedControlIds, availableControls])

    // Step validation
    const canProceedFromStep1 = name.trim().length > 0
    const canProceedFromStep2 = selectedFrameworkIds.length > 0
    // const canSubmit = canProceedFromStep1 && canProceedFromStep2 && selectedControlIds.size > 0

    return (
        <div>
            {/* Stepper Header */}
            <div className="bg-card border rounded-xl shadow-sm mb-6 p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-8">
                        <StepIndicator step={1} currentStep={currentStep} label="Program Details" />
                        <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
                        <StepIndicator step={2} currentStep={currentStep} label="Scope & Assets" />
                        <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
                        <StepIndicator step={3} currentStep={currentStep} label="Controls" />
                    </div>
                    {/* Summary badges */}
                    <div className="hidden lg:flex items-center gap-2">
                        {stats.frameworks > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800">
                                {stats.frameworks} Framework{stats.frameworks !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {stats.departments > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800">
                                {stats.departments} Dept{stats.departments !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {stats.controls > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800">
                                {stats.controls} Control{stats.controls !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div>
                {/* ==================== STEP 1: PROGRAM DETAILS ==================== */}
                {currentStep === 1 && (
                    <div>
                        <div>
                            <div className="max-w-3xl mx-auto space-y-6 pb-6">
                                {/* Program Name & Description */}
                                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/30">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <FileText className="size-4 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">Basic Information</h3>
                                                <p className="text-xs text-muted-foreground">Name and describe your program</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div>
                                            <Label className="text-sm font-medium">Program Name <span className="text-destructive">*</span></Label>
                                            <Input
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="e.g. ISO 27001 Internal Audit Q1 2026"
                                                className="mt-2 h-11"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1.5">A clear, descriptive name for your compliance program.</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Description</Label>
                                            <Textarea
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                placeholder="Describe the objectives, scope, and expected outcomes of this program..."
                                                className="mt-2 min-h-[80px] resize-none"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Program Type */}
                                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                                                <Shield className="size-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">Program Type</h3>
                                                <p className="text-xs text-muted-foreground">Select the type of audit or assessment</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <RadioGroup
                                            value={type}
                                            onValueChange={(v) => setType(v as typeof type)}
                                            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                                        >
                                            {PROGRAM_TYPES.map(pt => {
                                                const Icon = pt.icon
                                                const isSelected = type === pt.value
                                                return (
                                                    <div key={pt.value}>
                                                        <RadioGroupItem value={pt.value} id={pt.value} className="peer sr-only" />
                                                        <Label
                                                            htmlFor={pt.value}
                                                            className={cn(
                                                                "flex flex-col items-center gap-2 rounded-xl border-2 p-5 hover:bg-muted/50 cursor-pointer transition-all text-center",
                                                                isSelected
                                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                                    : "border-muted"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "size-10 rounded-lg flex items-center justify-center transition-colors",
                                                                isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                <Icon className="size-5" />
                                                            </div>
                                                            <span className="text-sm font-semibold">{pt.label}</span>
                                                            <span className="text-xs text-muted-foreground leading-relaxed">{pt.description}</span>
                                                        </Label>
                                                    </div>
                                                )
                                            })}
                                        </RadioGroup>
                                    </div>
                                </div>

                                {/* Schedule & Assessor */}
                                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                                                <CalendarIcon className="size-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">Schedule & Assignment</h3>
                                                <p className="text-xs text-muted-foreground">Set timeline and assign an assessor</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Start Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 mt-2", !startDate && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {startDate ? format(startDate, "PPP") : <span>Select start date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">End Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 mt-2", !endDate && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {endDate ? format(endDate, "PPP") : <span>Select end date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Lead Assessor</Label>
                                            <Select value={assessorId} onValueChange={setAssessorId}>
                                                <SelectTrigger className="mt-2 h-11 relative">
                                                    <SelectValue placeholder={isInitialLoading ? "Loading assessors..." : "Choose an assessor..."} />
                                                    {isInitialLoading && (
                                                        <Loader2 className="absolute right-10 size-4 animate-spin text-muted-foreground" />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {assessors.map(assessor => (
                                                        <SelectItem key={assessor.id} value={assessor.id}>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={assessor.avatar_url} />
                                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                                        {assessor.full_name?.slice(0, 2).toUpperCase() || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm">{assessor.full_name || assessor.email}</span>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                    {!isInitialLoading && assessors.length === 0 && (
                                                        <p className="text-xs text-muted-foreground p-3 text-center italic">No assessors available</p>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground mt-1.5">The assessor responsible for evaluating compliance.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 1 Footer */}
                        <div className="bg-card border rounded-xl shadow-sm p-4 flex items-center justify-between mt-6">
                            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                            <Button
                                onClick={() => setCurrentStep(2)}
                                disabled={!canProceedFromStep1}
                                className="gap-2 min-w-[140px]"
                            >
                                Next: Define Scope
                                <ArrowRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* ==================== STEP 2: SCOPE & ASSETS ==================== */}
                {currentStep === 2 && (
                    <div>
                        <div>
                            <div className="max-w-5xl mx-auto pb-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Frameworks */}
                                    <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-5 py-4 border-b bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                                                        <Shield className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold">Frameworks</h3>
                                                        <p className="text-xs text-muted-foreground">Required <span className="text-destructive">*</span></p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                    {selectedFrameworkIds.length} selected
                                                </Badge>
                                            </div>
                                        </div>
                                        <ScrollArea className="flex-1 h-[400px]">
                                            <div className="p-3 space-y-1.5">
                                                {frameworks.map(fw => {
                                                    const isSelected = selectedFrameworkIds.includes(fw.id)
                                                    return (
                                                        <div
                                                            key={fw.id}
                                                            className={cn(
                                                                "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                                                isSelected
                                                                    ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20"
                                                                    : "border-transparent hover:bg-muted/50"
                                                            )}
                                                            onClick={() => toggleSelection(fw.id, selectedFrameworkIds, setSelectedFrameworkIds)}
                                                        >
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleSelection(fw.id, selectedFrameworkIds, setSelectedFrameworkIds)}
                                                                className="mt-0.5"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-sm font-medium leading-none block">{fw.name}</span>
                                                                {fw.description && (
                                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{fw.description}</p>
                                                                )}
                                                            </div>
                                                            <Badge variant="secondary" className="text-[10px] shrink-0 tabular-nums">
                                                                {controlCountsByFramework.get(fw.id) ?? fw.control_count ?? 0} controls
                                                            </Badge>
                                                        </div>
                                                    )
                                                })}
                                                {frameworks.length === 0 && (
                                                    <p className="text-sm text-muted-foreground text-center py-6">No published frameworks found</p>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Departments */}
                                    <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-5 py-4 border-b bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                                                        <Building className="size-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold">Departments</h3>
                                                        <p className="text-xs text-muted-foreground">Optional scope filter</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400">
                                                    {selectedDepartmentIds.length} selected
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="px-3 pt-3 pb-1">
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                                                <Switch id="auto-dept" checked={autoSelectByDepartment} onCheckedChange={setAutoSelectByDepartment} className="scale-90" />
                                                <Label htmlFor="auto-dept" className="text-xs cursor-pointer leading-tight">
                                                    Auto-select controls by department
                                                </Label>
                                            </div>
                                        </div>
                                        <ScrollArea className="flex-1 h-[340px]">
                                            <div className="p-3 space-y-1.5">
                                                {departments.map(dept => {
                                                    const isSelected = selectedDepartmentIds.includes(dept.id)
                                                    return (
                                                        <div
                                                            key={dept.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                                                isSelected
                                                                    ? "border-blue-300 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/20"
                                                                    : "border-transparent hover:bg-muted/50"
                                                            )}
                                                            onClick={() => toggleSelection(dept.id, selectedDepartmentIds, setSelectedDepartmentIds)}
                                                        >
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleSelection(dept.id, selectedDepartmentIds, setSelectedDepartmentIds)}
                                                            />
                                                            <span className="text-sm font-medium leading-none flex-1">{dept.name}</span>
                                                            {(controlCountsByDepartment.get(dept.id) ?? 0) > 0 && (
                                                                <Badge variant="secondary" className="text-[10px] shrink-0 tabular-nums">
                                                                    {controlCountsByDepartment.get(dept.id)} controls
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                                {departments.length === 0 && (
                                                    <p className="text-sm text-muted-foreground text-center py-6">No departments found</p>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Assets */}
                                    <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-5 py-4 border-b bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                                                        <Database className="size-4 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold">Assets</h3>
                                                        <p className="text-xs text-muted-foreground">In-scope assets</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400">
                                                    {selectedAssetIds.length} selected
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="px-3 pt-3 space-y-2 pb-1">
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                                                <Switch id="auto-asset" checked={autoSelectByAsset} onCheckedChange={setAutoSelectByAsset} className="scale-90" />
                                                <Label htmlFor="auto-asset" className="text-xs cursor-pointer leading-tight">
                                                    Auto-select linked controls
                                                </Label>
                                            </div>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search assets..."
                                                    className="pl-8 h-8 text-xs"
                                                    value={assetSearch}
                                                    onChange={e => setAssetSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <ScrollArea className="flex-1 h-[290px]">
                                            <div className="p-3 space-y-1.5">
                                                {filteredAssets.slice(0, 100).map(asset => {
                                                    const isSelected = selectedAssetIds.includes(asset.id)
                                                    return (
                                                        <div
                                                            key={asset.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                                                isSelected
                                                                    ? "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20"
                                                                    : "border-transparent hover:bg-muted/50"
                                                            )}
                                                            onClick={() => toggleSelection(asset.id, selectedAssetIds, setSelectedAssetIds)}
                                                        >
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleSelection(asset.id, selectedAssetIds, setSelectedAssetIds)}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-sm font-medium leading-none truncate block">{asset.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {(controlCountsByAsset.get(asset.id) ?? 0) > 0 && (
                                                                    <Badge variant="secondary" className="text-[10px] tabular-nums">
                                                                        {controlCountsByAsset.get(asset.id)} ctrl
                                                                    </Badge>
                                                                )}
                                                                {asset.criticality && (
                                                                    <Badge variant="outline" className={cn("text-[10px]",
                                                                        asset.criticality === 'Critical' && "border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/20",
                                                                        asset.criticality === 'High' && "border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950/20",
                                                                    )}>
                                                                        {asset.criticality}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {filteredAssets.length > 100 && (
                                                    <p className="text-xs text-muted-foreground text-center py-2">...and {filteredAssets.length - 100} more</p>
                                                )}
                                                {filteredAssets.length === 0 && (
                                                    <p className="text-sm text-muted-foreground text-center py-6">No assets match your search</p>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 Footer */}
                        <div className="bg-card border rounded-xl shadow-sm p-4 flex items-center justify-between mt-6">
                            <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                                <ArrowLeft className="size-4" />
                                Back
                            </Button>
                            <Button
                                onClick={() => setCurrentStep(3)}
                                disabled={!canProceedFromStep2}
                                className="gap-2 min-w-[160px]"
                            >
                                Next: Select Controls
                                <ArrowRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* ==================== STEP 3: CONTROLS SELECTION ==================== */}
                {currentStep === 3 && (
                    <div className="flex flex-col" style={{ height: 'calc(100vh - 240px)' }}>
                        <div className="bg-card border rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
                            {/* Controls Header */}
                            <div className="p-4 border-b bg-gradient-to-r from-muted/30 to-transparent flex flex-col sm:flex-row gap-3 justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <List className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Controls Scope</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedControlIds.size} selected of {availableControls.length} available
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search controls..."
                                            className="pl-9"
                                            value={controlSearch}
                                            onChange={e => setControlSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Controls List */}
                            <div className="flex-1 overflow-hidden relative">
                                {isLoadingControls ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                                        <Loader2 className="size-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <ScrollArea className="h-full">
                                        <div className="p-2 space-y-1">
                                            {filteredControls.map(control => {
                                                const isSelected = selectedControlIds.has(control.id)
                                                return (
                                                    <div
                                                        key={control.id}
                                                        className={cn(
                                                            "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer group",
                                                            isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50 border-transparent"
                                                        )}
                                                        onClick={() => toggleControl(control.id)}
                                                    >
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleControl(control.id)}
                                                            className="mt-1"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                                    {control.code}
                                                                </span>
                                                                <h4 className="font-medium text-sm truncate">{control.title}</h4>
                                                            </div>
                                                            {control.description && (
                                                                <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-1">
                                                                    {control.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-2">
                                                                {control.frameworks && control.frameworks.length > 0 ? (
                                                                    control.frameworks.map((fw: any, idx: number) => (
                                                                        <Badge key={idx} variant="outline" className="text-[10px] h-5 px-1.5 bg-background">
                                                                            {fw.name}
                                                                        </Badge>
                                                                    ))
                                                                ) : control.framework_id ? (
                                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background">
                                                                        {frameworks.find(f => f.id === control.framework_id)?.name || 'Unknown'}
                                                                    </Badge>
                                                                ) : null}
                                                                {control.department_id && (
                                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                                        Dep: {departments.find(d => d.id === control.department_id)?.name}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {filteredControls.length === 0 && (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    No controls found needed.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>
                        </div>

                        {/* Step 3 Footer */}
                        <div className="bg-card border rounded-xl shadow-sm p-4 flex items-center justify-between mt-6">
                            <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
                                <ArrowLeft className="size-4" />
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || selectedControlIds.size === 0}
                                className="gap-2 min-w-[160px]"
                            >
                                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                Create Program
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
