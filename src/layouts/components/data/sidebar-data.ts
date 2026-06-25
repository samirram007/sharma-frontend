import {
  IconApps,
  IconBarrierBlock,
  IconBook,
  IconBrowserCheck,
  IconBug,
  IconBuildingWarehouse,
  IconChartBar,
  IconChecklist,
  IconClipboardList,
  IconCoin,
  IconScale,
  IconTrendingUp,
  IconUserCheck,
  IconError404,
  IconFileInvoice,
  IconFileText,
  IconHelp,
  IconLayoutDashboard,
  IconListDetails,
  IconLocationBolt,
  IconLock,
  IconLockAccess,
  IconMap,
  IconMapPin,
  IconMessages,
  IconMichelinStar,
  IconNotebook,
  IconNotification,
  IconPackages,
  IconPalette,
  IconPaperBag,
  IconPremiumRights,
  IconRadar2,
  IconReceipt,
  IconReport,
  IconRoute,
  IconRoute2,
  IconServerOff,
  IconSettings,
  IconTool, 
  IconTruck,
  IconTruckDelivery,
  IconUserOff
} from '@tabler/icons-react'
import { AudioWaveform, Building2, Command, GalleryVerticalEnd, HandCoinsIcon, LandmarkIcon, NotebookTabsIcon, Users, WarehouseIcon } from 'lucide-react'
import { type SidebarData } from '../types'



const APP_NAME = import.meta.env.VITE_APP_NAME || 'AIPT Admin'
const APP_SUBTITLE = import.meta.env.VITE_APP_SUBTITLE || 'Admin Dashboard'
export const sidebarData: SidebarData = {
  user: {
    name: 'samir',
    visible: false,
    email: 'admin@admin.com',
    avatar: '/avatars/shadcn.jpg',
  },
  header: {
    logo: GalleryVerticalEnd,
    visible: true,
    title: APP_NAME,
    subtitle: APP_SUBTITLE,
  },
  teams: [
    {
      name: 'ShadcnAdminBike',
      visible: true,
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      visible: true,
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      visible: true,
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],

  navGroups: [

    {
      title: 'General',
      visible: true,
      items: [
        {
          title: 'Dashboard',
          visible: true,
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Tasks',
          visible: false,
          url: '/tasks',
          icon: IconChecklist,
        },
        {
          title: 'Apps',
          visible: false,
          url: '/apps',
          icon: IconPackages,
        },
        {
          title: 'Chats',
          visible: false,
          url: '/chats',
          badge: '3',
          icon: IconMessages,
        },

      ],
    },
    {
      title: 'Pages',
      visible: false,
      items: [
        {
          title: 'Auth',
          icon: IconLockAccess,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: IconBug,
          items: [
            {
              title: 'Unauthorized',
              url: '/401',
              icon: IconLock,
            },
            {
              title: 'Forbidden',
              url: '/403',
              icon: IconUserOff,
            },
            {
              title: 'Not Found..',
              url: '/404',
              icon: IconError404,
            },
            {
              title: 'Internal Server Error',
              url: '/500',
              icon: IconServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/503',
              icon: IconBarrierBlock,
            },
          ],
        },
      ],
    },
    {
      title: 'Transactions',
      visible: true,
      items: [
        {
          title: 'Accounts',
          icon: IconBook,
          items: [
            {
              title: 'Vouchers',
              url: '/transactions/vouchers',
              icon: IconClipboardList,
            },
            {
              title: 'Day Book',
              url: '/reports/day_book',
              icon: IconBook,
            },
          ],
        },

      ],

    },
    {
      title: 'Masters',
      visible: true,
      items: [
        {
          title: 'Organization',
          visible: true,
          icon: Building2,
          items: [
            {
              title: 'Company',
              url: '/masters/organization/company',
              visible: true,
              icon: Building2,
            },
            {
              title: 'Branch',
              url: '/masters/organization/branch',
              visible: false,
              icon: Building2,
            },
            {
              title: 'Fiscal Year',
              url: '/masters/organization/fiscal_year',
              visible: false,
              icon: IconClipboardList,
            },
            {
              title: 'Currency',
              url: '/masters/organization/currency',
              visible: true,
              icon: IconCoin,
            },
            {
              title: 'Country',
              url: '/masters/organization/country',
              visible: true,
              icon: IconMap,
            },
            {
              title: 'State',
              url: '/masters/organization/state',
              visible: true,
              icon: IconMapPin,
            },

          ]
        },
        {
          title: 'Accounts',
          icon: NotebookTabsIcon,
          items: [

            {
              title: 'Chart of Accounts',
              url: '/masters/accounts/account_group',
              icon: IconListDetails,
            },
            {
              title: 'Account Ledger',
              url: '/masters/accounts/account_ledger',
              icon: IconNotebook,
            },
            {
              title: 'Voucher Type',
              url: '/masters/accounts/voucher_type',
              icon: IconReceipt,
            },

          ]
        },
        {
          title: 'Party',
          icon: Users,
          items: [
            {
              title: 'Distributor',
              url: '/masters/party/distributor',
              icon: IconTruckDelivery,
            },
            {
              title: 'Supplier',
              url: '/masters/party/supplier',
              icon: IconTruck,
            },
            {
              title: 'Transporter',
              url: '/masters/party/transporter',
              icon: IconRoute,
            },

          ]
        },
        {
          title: 'Inventory',
          icon: WarehouseIcon,
          items: [
            {
              title: 'Stock Item',
              url: '/masters/inventory/stock_item',
              icon: IconPackages,
            },
            {
              title: 'Stock Group',
              url: '/masters/inventory/stock_group',
              icon: IconListDetails,
            },
            {
              title: 'Stock Category',
              url: '/masters/inventory/stock_category',
              icon: IconChecklist,
            },
            {
              title: 'Stock Unit',
              url: '/masters/inventory/stock_unit',
              icon: IconScale,
            },
            {
              title: 'Godown',
              url: '/masters/inventory/godown',
              icon: IconBuildingWarehouse,
            },
          ]
        },
        {
          title: 'Payroll',
          icon: HandCoinsIcon,
          items: [
            {
              title: 'Employee',
              url: '/masters/payroll/employee',
              icon: Users,
            },
            {
              title: 'Department',
              url: '/masters/payroll/department',
              icon: Building2,
            },
            {
              title: 'Designation',
              url: '/masters/payroll/designation',
              icon: IconUserCheck,
            },

          ]
        },
        {
          title: 'Statutory',
          icon: LandmarkIcon,
          items: [
            {
              title: 'Stock Item',
              url: '/masters/inventory/stock_item',
              icon: IconNotebook,
            },
            {
              title: 'Stock Group',
              url: '/masters/inventory/stock_group',
              icon: IconListDetails,
            },
            {
              title: 'Stock Category',
              url: '/masters/inventory/stock_category',
              icon: IconChecklist,
            },
            {
              title: 'Stock Unit',
              url: '/masters/inventory/stock_unit',
              icon: IconScale,
            },
            {
              title: 'Godown',
              url: '/masters/inventory/godown',
              icon: IconBuildingWarehouse,
            },
          ]
        },
        {
          title: 'Miscellaneous',
          visible: true,
          icon: IconMichelinStar,
          items: [
            {
              title: 'Delivery Places',
              url: '/masters/miscellaneous/delivery_places',
              icon: IconLocationBolt,
            },
            {
              title: 'Delivery Routes',
              url: '/masters/miscellaneous/delivery_routes',
              icon: IconRoute2,
            },
            {
              title: 'Delivery Vehicles',
              visible: false,
              url: '/masters/miscellaneous/delivery_vehicles',
              icon: IconTruck,
            },

          ]
        },
      ],
    },
    {
      title: 'Administration',
      visible: true,
      items: [
        {
          title: 'User',
          url: '/administration/user',
          visible: true,
          icon: Users,
        },
        {
          title: 'Roles',
          url: '/administration/role',
          visible: true,
          icon: IconRadar2,
        },
        {
          title: 'Roles & Permissions',
          url: '/administration/permission',
          visible: true,
          icon: IconPremiumRights,
        },
        {
          title: 'App Module  ',
          url: '/administration/app_module',
          visible: true,
          icon: IconApps,
        },
        {
          title: 'App Features  ',
          url: '/administration/app_module_feature',
          visible: true,
          icon: IconPaperBag,
        },
      ]
    },

    {
      title: 'Reports',
      visible: true,
      items: [
        {
          title: 'Financial Statements',
          icon: IconChartBar,
          items: [
            { title: 'Balance Sheet', url: '/reports/balance_sheet', icon: IconScale },
            { title: 'Profit & Loss', url: '/reports/profit_and_loss', icon: IconTrendingUp },
          ],
        },
        {
          title: 'Day Book & Registers',
          icon: IconBook,
          items: [
            { title: 'Day Book', url: '/reports/day_book', icon: IconNotebook },
            { title: 'Day Book (Self)', url: '/reports/day_book/self', icon: IconUserCheck },
            { title: 'Receipt Book', url: '/reports/receipt_book', icon: IconReceipt },
            { title: 'Distributor Book', url: '/reports/distributor_book', icon: IconTruckDelivery },
          ],
        },
        {
          title: 'Stock & Inventory',
          icon: IconPackages,
          items: [
            { title: 'Stock In Hand (Item Summary)', url: '/reports/stock_summary/stock-in-hand', icon: IconReport },
            { title: 'Stock In Hand (Godown Wise)', url: '/reports/stock_summary/stock-in-hand-godown-wise', icon: IconBuildingWarehouse },
            { title: 'Stock In Hand (Zone Wise)', url: '/reports/stock_summary/stock-in-hand-zone-wise', icon: IconMap },
            { title: 'Stock In Hand (Item Wise)', url: '/reports/stock_summary/stock-in-hand-item-wise', icon: IconListDetails },
            { title: 'Stock In Hand (Voucher Wise)', url: '/reports/stock_summary/stock-in-hand-voucher-wise', icon: IconFileInvoice },
          ],
        },
        {
          title: 'Freight & Logistics',
          icon: IconTruck,
          items: [
            { title: 'Delivery Note (Zone Wise)', url: '/reports/freight/delivery-note-zone-wise', icon: IconMapPin },
            { title: 'Delivery Note (Godown Wise)', url: '/reports/freight/delivery-note-godown-wise', icon: IconBuildingWarehouse },
            { title: 'Freight (Zone Wise)', url: '/reports/freight/freight-zone-wise', icon: IconRoute },
            { title: 'Freight (Transporter Wise)', url: '/reports/freight/freight-transporter-wise', icon: IconTruck },
            { title: 'Freight (Voucher Wise)', url: '/reports/freight/freight-voucher-wise', icon: IconFileText },
            { title: 'Freight (Godown Wise)', url: '/reports/freight/freight-godown-wise', icon: IconBuildingWarehouse },
          ],
        },
      ]
    },
    {
      title: 'Other',
      visible: false,
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCheck,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}
