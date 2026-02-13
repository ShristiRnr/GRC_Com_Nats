import { ProgramBuilder } from '~/components/programs/program-builder'

export default function NewProgramPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto mb-20 animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Create New Program</h1>
                <p className="text-muted-foreground mt-1">Define scope, select controls, and launch your compliance program.</p>
            </div>
            <ProgramBuilder />
        </div>
    )
}
