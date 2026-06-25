import React, { useState } from 'react'





interface ReportContextType {
    currentModule: string
    setCurrentModule: (str: string) => void
    sideBarOpen?: boolean
    setSideBarOpen?: (open: boolean) => void
    headerVisible?: boolean
    setHeaderVisible?: (visible: boolean) => void
    keyName: string
    config: { key: string; value: boolean }[]
}

const ReportContext = React.createContext<ReportContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function ReportProvider({ children }: Props) {
    const [currentModule, setCurrentModule] = useState<string>("user")
    const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)
    const [headerVisible, setHeaderVisible] = useState<boolean>(false)
    const config = [
        { key: 'show_actual_and_billing_quantity', value: false },
        { key: 'show_alternate_unit', value: false },
    ]



    return (
        <ReportContext.Provider value={{
            currentModule,
            setCurrentModule,
            sideBarOpen,
            setSideBarOpen,
            headerVisible,
            setHeaderVisible,
            config,
            keyName: "report"
        }}>
            {children}
        </ReportContext.Provider>
    )
}


export const useReport = () => {
    const reportContext = React.useContext(ReportContext)

    if (!reportContext) {
        throw new Error('useReport has to be used within <ReportProvider>')
    }

    return reportContext
}
