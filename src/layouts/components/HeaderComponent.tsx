
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from "@/components/search";
import { ThemeSwitch } from '@/components/theme-switch';
import { NotificationBell } from '@/features/modules/app-notification/components/notification-bell';
import React from "react";
import FiscalYearSelector from './fiscal-year-selector';
import { Header } from "./header";
import { TopNav } from "./top-nav";
import { topNavLinks } from '../links/top-nav-links';
// import { GodownItemSearch } from './godown-item-search';


const HeaderComponent: React.FC<{}> = () => {
    return (
        <Header className='mx-2 mt-2 max-w-full rounded-xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/8 dark:bg-card dark:shadow-black/40 dark:backdrop-blur-md'>
            <TopNav links={topNavLinks} />
            <div className='ml-auto flex min-w-0 items-center gap-2 lg:gap-4'>
                {/* <GodownItemSearch className='hidden lg:flex' placeholder='Search items...' /> */}
                <Search className='hidden sm:flex' />
                <NotificationBell />
                <div className='hidden sm:block h-6 w-px bg-slate-300/50 dark:bg-slate-700/50' />
                <ThemeSwitch />
                <FiscalYearSelector visible={true} />
                <ProfileDropdown />
            </div>
        </Header>
    )
}

export default HeaderComponent

