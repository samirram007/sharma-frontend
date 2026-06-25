import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { Main } from "@/layouts/components/main";
import type { FiscalYear, FiscalYearList } from "../fiscal_year/data/schema";
import { useUserFiscalYearMutation } from "./data/queryOptions";


interface UserFiscalYearProps {
    data: FiscalYearList
}

const UserFiscalYear = ({ data: fiscalYearData }: UserFiscalYearProps) => {
    return (
        <Main className="container">
            <header className="text-xl mb-4">Fiscal Year</header>
            <div className="w-[800px]">
                {fiscalYearData.map(fy => (
                    <FiscalYearRow key={fy.id} fy={fy} />

                ))}
            </div>
        </Main>
    )
}

export default UserFiscalYear

const FiscalYearRow = ({ fy }: { fy: FiscalYear }) => {
    const { userFiscalYear } = useAuth();

    return (
        <div className=" p-4 rounded shadow-md border-[1px] border-gray-300 hover:bg-gray-100  gap-4 
        grid grid-cols-[100px_1fr_100px] items-center justify-start">
            <div>{fy.status.toUpperCase()}</div>
            <div>{fy.name}</div>
            <div className="self-end">
                {userFiscalYear?.fiscalYearId !== fy.id ? (
                    <UseButton fy={fy} />
                ) : (
                    <span className="text-sm text-green-600 font-bold">In use</span>
                )}
            </div>
        </div>
    )
}

const UseButton = ({ fy }: { fy: FiscalYear }) => {
    const saveUserFiscalYear = useUserFiscalYearMutation();
    const handleOnClick = () => {
        saveUserFiscalYear.mutate({ fiscalYearId: fy.id }, {
            onSuccess: () => {
                window.location.reload();
            }
        });
    }
    return (
        <Button size="sm" variant="default" onClick={handleOnClick} disabled={saveUserFiscalYear.isPending}
            className="text-sm text-gray-200 shadow-sm">Use it</Button>
    )
}