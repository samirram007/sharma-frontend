
import { reportLinks } from "./report-links";

export const topNavLinks = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        visible: false,
        isActive: false,
        disabled: true,
    },
    {
        title: 'Received(GRN)',
        href: '/transactions/vouchers/receipt_note',
        visible: true,
        isActive: false,
        disabled: true,
    },
    {
        title: 'Delivery Note',
        href: '/transactions/vouchers/delivery_note',
        visible: true,
        isActive: false,
        disabled: true,
    },
    {
        title: 'Freight',
        href: '/transactions/freight',
        visible: true,
        isActive: false,
        disabled: false,
    },
    {
        title: 'Day Book',
        href: '/reports/day_book',
        visible: false,
        isActive: true,
        disabled: false,
    },
    {
        title: 'Reports',
        href: '/reports/stock_summary',
        hasSubmenu: true,
        submenuItems: reportLinks,
        visible: true,
        isActive: false,
        disabled: false,
    },
]