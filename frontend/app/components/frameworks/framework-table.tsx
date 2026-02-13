import type { Framework } from '~/lib/api/frameworks'
import { FrameworksDataTable } from './data-table/data-table'
import { columns } from './data-table/columns'

export function FrameworkTable({ frameworks }: { frameworks: Framework[] }) {
    return (
        <FrameworksDataTable columns={columns} data={frameworks} />
    )
}
