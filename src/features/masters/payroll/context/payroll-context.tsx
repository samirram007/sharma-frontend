import React, { useState } from 'react'





interface PayrollContextType {
    currentModule: string
    setCurrentModule: (str: string) => void
    sideBarOpen?: boolean
    setSideBarOpen?: (open: boolean) => void
    keyName: string
}

const PayrollContext = React.createContext<PayrollContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function PayrollProvider({ children }: Props) {
    const [currentModule, setCurrentModule] = useState<string>("employee")
    const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)



    return (
        <PayrollContext.Provider value={{
            currentModule,
            setCurrentModule,
            sideBarOpen,
            setSideBarOpen,
            keyName: "payroll"
        }}>
            {children}
        </PayrollContext.Provider>
    )
}


export const usePayroll = () => {
    const payrollContext = React.useContext(PayrollContext)

    if (!payrollContext) {
        throw new Error('usePayroll has to be used within <PayrollProvider>')
    }

    return payrollContext
}
