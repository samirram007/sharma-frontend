
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Main } from '@/layouts/components/main'







import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'

import { useStockSummary } from './contexts/stock_summary-context'
import { toSentenceCase, capitalizeAllWords } from '../../../../utils/removeEmptyStrings';
import { IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { reportLinks } from '@/layouts/links/report-links'
import { useLayoutEffect, useMemo } from 'react';

import ReportingPeriod from '@/features/global/components/reporting-period'




export default function StockSummary() {
    const location = useLocation();
    const { currentReport, setCurrentReport } = useStockSummary();
    const reportPeriodVisible = [
        'Stock In Hand (Item Summary)',
        'Stock In Hand (Item Wise)', 
        'Stock In Hand (Godown Wise)',
        'Stock In Hand (Voucher Wise)',
        'Day Book',
        'Receipt Book',
        'Distributor Book'
    ];
    const allLinksPlucked = useMemo(() => {
        return reportLinks.flatMap(report =>
            report.menus.map(menu => ({
                href: menu.href,
                title: menu.title,
            }))
        );
    }, []);
    useLayoutEffect(() => {
        const currentLink =
            allLinksPlucked.find(
                item =>
                    location.pathname === item.href ||
                    (location.pathname.startsWith(item.href) &&
                        location.pathname[item.href.length] === '/')
            ) ?? { href: '', title: '' };

        const reportName = currentLink.title.split('/').pop() || '';

        setCurrentReport(reportName);

        document.title = `AIPT - ${capitalizeAllWords(
            toSentenceCase(reportName)
        ).replace(/_/g, ' ')}`;
    }, [location.pathname]);
    return (

        <Main className='min-w-full min-h-full!'>
            <div className='mb-3 flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0 space-y-1'>
                    <h3 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                        {capitalizeAllWords(toSentenceCase(currentReport)).replace(/_/g, ' ')} </h3>
                    {/* {currentReport} */}
                    {reportPeriodVisible.includes(currentReport) && <p className='text-slate-600 dark:text-slate-300'><ReportingPeriod disableHotkey /></p>}
                    {/* <p className='text-muted-foreground pt-4 text-sm'>
                        <ReportingPeriod disableHotkey />
                    </p> */}
                </div>
                <PrimaryButtons />
            </div>
            <div className='min-h-full flex-1 overflow-auto py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                <Outlet />
            </div>
        </Main>

    )
}



const PrimaryButtons = () => {

    const { currentReport } = useStockSummary();

    const reports = useMemo(() => {
        const allLinksPlucked = reportLinks.flatMap(report =>
            report.menus.filter(menu => menu.visible).map(menu => ({
                // link: menu.href.split('/').pop() || '',
                link: menu.href || '',
                label: menu.title,
                visible: menu.visible,
            }))
        );
        return allLinksPlucked;
    }, []);
    // console.log("reports", reportLinks)
    return (
        <div className='flex w-full justify-end sm:w-auto'>
            {/* Add Dropdown  here */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className='min-w-[210px] justify-between'>
                        {capitalizeAllWords(toSentenceCase(currentReport)).replace(/_/g, ' ')}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-full">
                    {reports.map((report) => (
                        <DropdownItem
                            key={report.link}
                            label={report.label}
                            link={report.link}
                            visible={report.visible}
                        />
                    ))}

                </DropdownMenuContent>
            </DropdownMenu>

        </div>
    )
}

const DropdownItem = ({ label, link, visible }: { label: string, link: string, visible: boolean }) => {
    const navigate = useNavigate();

    const { currentReport, setCurrentReport } = useStockSummary();

    const handleOnclick = () => {
        // get links and title from reportLinks

        const allLinksPlucked = reportLinks.flatMap(report =>
            report.menus.map(menu => ({
                href: menu.href,
                title: menu.title,
            }))
        );

        const currentLink = allLinksPlucked.find((item) => item.href === link) || { href: '', title: '' };

        setCurrentReport(currentLink.title.split('/').pop() || '');
        navigate({ to: `${link}` });
    }

    return (
        visible &&
        <DropdownMenuItem onClick={handleOnclick} className={currentReport === link ? 'bg-gray-200' : ''}>
            <IconCheck size={18} className={cn('mr-2 h-4 w-4', currentReport === link ? 'visible' : 'invisible')} />   {label}
            </DropdownMenuItem>

    )
}