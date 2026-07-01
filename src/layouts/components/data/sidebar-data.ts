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
  IconUserOff,
  IconArchive,
  IconDoorEnter
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
      requiredFeature: 'GENERAL_MENU_VIEW',
      items: [
        {
          title: 'Dashboard',
          visible: true,
          url: '/',
          icon: IconLayoutDashboard,
          requiredFeature: 'DASHBOARD_MENU_VIEW',
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
      requiredFeature: 'TRANSACTION_MENU_VIEW',
      items: [
        {
          title: 'Accounts',
          icon: IconBook,
          requiredFeature: 'ACCOUNTS_MENU_VIEW',
          items: [
            {
              title: 'Vouchers',
              url: '/transactions/vouchers',
              icon: IconClipboardList,
              requiredFeature: 'VOUCHERS_MENU_VIEW',
            },
            {
              title: 'Day Book',
              url: '/reports/day_book',
              icon: IconBook,
              requiredFeature: 'DAYBOOK_MENU_VIEW',
            },
          ],
        },
      ],
    },
    {
      title: 'Masters',
      visible: true,
      requiredFeature: 'MASTER_MENU_VIEW',
      items: [
        {
          title: 'Organization',
          visible: true,
          icon: Building2,
          requiredFeature: 'ORGANIZATION_MENU_VIEW',
          items: [
            {
              title: 'Company',
              url: '/masters/organization/company',
              visible: true,
              icon: Building2,
              requiredFeature: 'COMPANY_MENU_VIEW',
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
              visible: true,
              icon: IconClipboardList,
              requiredFeature: 'FISCAL_YEAR_MENU_VIEW',
            },
            {
              title: 'Currency',
              url: '/masters/organization/currency',
              visible: true,
              icon: IconCoin,
              requiredFeature: 'CURRENCY_MENU_VIEW',
            },
            {
              title: 'Country',
              url: '/masters/organization/country',
              visible: true,
              icon: IconMap,
              requiredFeature: 'COUNTRY_MENU_VIEW',
            },
            {
              title: 'State',
              url: '/masters/organization/state',
              visible: true,
              icon: IconMapPin,
              requiredFeature: 'STATE_MENU_VIEW',
            },
          ]
        },
        {
          title: 'Accounts',
          icon: NotebookTabsIcon,
          requiredFeature: 'ACCOUNTS_MENU_VIEW',
          items: [
            {
              title: 'Chart of Accounts',
              url: '/masters/accounts/account_group',
              icon: IconListDetails,
              requiredFeature: 'CHART_OF_ACCOUNTS_MENU_VIEW',
            },
            {
              title: 'Account Ledger',
              url: '/masters/accounts/account_ledger',
              icon: IconNotebook,
              requiredFeature: 'ACCOUNT_LEDGER_MENU_VIEW',
            },
            {
              title: 'Voucher Type',
              url: '/masters/accounts/voucher_type',
              icon: IconReceipt,
              requiredFeature: 'VOUCHER_TYPE_MENU_VIEW',
            },
          ]
        },
        {
          title: 'Party',
          icon: Users,
          requiredFeature: 'PARTY_MENU_VIEW',
          items: [
            {
              title: 'Distributor',
              url: '/masters/party/distributor',
              icon: IconTruckDelivery,
              requiredFeature: 'DISTRIBUTOR_MENU_VIEW',
            },
            {
              title: 'Supplier',
              url: '/masters/party/supplier',
              icon: IconTruck,
              requiredFeature: 'SUPPLIER_MENU_VIEW',
            },
            {
              title: 'Transporter',
              url: '/masters/party/transporter',
              icon: IconRoute,
              requiredFeature: 'TRANSPORTER_MENU_VIEW',
            },
          ]
        },
        {
          title: 'Inventory',
          icon: WarehouseIcon,
          requiredFeature: 'INVENTORY_MENU_VIEW',
          items: [
            {
              title: 'Stock Item',
              url: '/masters/inventory/stock_item',
              icon: IconPackages,
              requiredFeature: 'STOCK_ITEM_MENU_VIEW',
            },
            {
              title: 'Stock Group',
              url: '/masters/inventory/stock_group',
              icon: IconListDetails,
              requiredFeature: 'STOCK_GROUP_MENU_VIEW',
            },
            {
              title: 'Stock Category',
              url: '/masters/inventory/stock_category',
              icon: IconChecklist,
              requiredFeature: 'STOCK_CATEGORY_MENU_VIEW',
            },
            {
              title: 'Stock Unit',
              url: '/masters/inventory/stock_unit',
              icon: IconScale,
              requiredFeature: 'STOCK_UNIT_MENU_VIEW',
            },
            {
              title: 'Godown',
              url: '/masters/inventory/godown',
              icon: IconBuildingWarehouse,
              requiredFeature: 'GODOWN_MENU_VIEW',
            },
          ]
        },
        {
          title: 'Payroll',
          icon: HandCoinsIcon,
          requiredFeature: 'PAYROLL_MENU_VIEW',
          items: [
            {
              title: 'Employee',
              url: '/masters/payroll/employee',
              icon: Users,
              requiredFeature: 'EMPLOYEE_MENU_VIEW',
            },
            {
              title: 'Department',
              url: '/masters/payroll/department',
              icon: Building2,
              requiredFeature: 'DEPARTMENT_MENU_VIEW',
            },
            {
              title: 'Designation',
              url: '/masters/payroll/designation',
              icon: IconUserCheck,
              requiredFeature: 'DESIGNATION_MENU_VIEW',
            },
          ]
        },
        {
          title: 'Statutory',
          icon: LandmarkIcon,
          requiredFeature: 'STATUTORY_MENU_VIEW',
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
          requiredFeature: 'MISCELLANEOUS_MENU_VIEW',
          items: [
            {
              title: 'Delivery Places',
              url: '/masters/miscellaneous/delivery_places',
              icon: IconLocationBolt,
              requiredFeature: 'DELIVERY_PLACES_MENU_VIEW',
            },
            {
              title: 'Delivery Routes',
              url: '/masters/miscellaneous/delivery_routes',
              icon: IconRoute2,
              requiredFeature: 'DELIVERY_ROUTES_MENU_VIEW',
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
      requiredFeature: 'ADMINISTRATION_MENU_VIEW',
      items: [
        {
          title: 'User',
          url: '/administration/user',
          visible: true,
          icon: Users,
          requiredFeature: 'USER_MENU_VIEW',
        },
        {
          title: 'Roles',
          url: '/administration/role',
          visible: true,
          icon: IconRadar2,
          requiredFeature: 'ROLE_MENU_VIEW',
        },
        {
          title: 'Roles & Permissions',
          url: '/administration/permission',
          visible: true,
          icon: IconPremiumRights,
          requiredFeature: 'PERMISSION_MENU_VIEW',
        },
        {
          title: 'App Module  ',
          url: '/administration/app_module',
          visible: true,
          icon: IconApps,
          requiredFeature: 'APP_MODULE_MENU_VIEW',
        },
        {
          title: 'App Features  ',
          url: '/administration/app_module_feature',
          visible: true,
          icon: IconPaperBag,
          requiredFeature: 'APP_MODULE_FEATURE_VIEW',
        },
        {
          title: 'Menu Features',
          url: '/administration/menu',
          visible: true,
          icon: IconListDetails,
          requiredFeature: 'MENU_VIEW',
        },
        {
          title: 'Menu Manager',
          url: '/administration/menu_manager',
          visible: true,
          icon: IconLockAccess,
          requiredFeature: 'MENU_MANAGER_VIEW',
        },
      ]
    },

    {
      title: 'Reports',
      visible: true,
      requiredFeature: 'REPORTS_MENU_VIEW',
      items: [
        {
          title: 'Financial Statements',
          icon: IconChartBar,
          requiredFeature: 'BALANCE_SHEET_MENU_VIEW',
          items: [
            { title: 'Balance Sheet', url: '/reports/balance_sheet', icon: IconScale, requiredFeature: 'BALANCE_SHEET_MENU_VIEW' },
            { title: 'Profit & Loss', url: '/reports/profit_and_loss', icon: IconTrendingUp, requiredFeature: 'PROFIT_LOSS_MENU_VIEW' },
          ],
        },
        {
          title: 'Day Book & Registers',
          icon: IconBook,
          requiredFeature: 'DAYBOOK_MENU_VIEW',
          items: [
            { title: 'Day Book', url: '/reports/day_book', icon: IconNotebook, requiredFeature: 'DAYBOOK_MENU_VIEW' },
            { title: 'Day Book (Self)', url: '/reports/day_book/self', icon: IconUserCheck, requiredFeature: 'DAYBOOK_SELF_MENU_VIEW' },
            { title: 'Receipt Book', url: '/reports/receipt_book', icon: IconReceipt, requiredFeature: 'RECEIPTBOOK_MENU_VIEW' },
            { title: 'Distributor Book', url: '/reports/distributor_book', icon: IconTruckDelivery, requiredFeature: 'DISTRIBUTORBOOK_MENU_VIEW' },
          ],
        },
        {
          title: 'Stock & Inventory',
          icon: IconPackages,
          requiredFeature: 'STOCKSUMMARY_MENU_VIEW',
          items: [
            { title: 'Stock In Hand (Item Summary)', url: '/reports/stock_summary/stock-in-hand', icon: IconReport, requiredFeature: 'STOCKSUMMARY_MENU_VIEW' },
            { title: 'Stock In Hand (Godown Wise)', url: '/reports/stock_summary/stock-in-hand-godown-wise', icon: IconBuildingWarehouse, requiredFeature: 'STOCKSUMMARY_MENU_VIEW' },
            { title: 'Stock In Hand (Zone Wise)', url: '/reports/stock_summary/stock-in-hand-zone-wise', icon: IconMap, requiredFeature: 'STOCKSUMMARY_MENU_VIEW' },
            { title: 'Stock In Hand (Item Wise)', url: '/reports/stock_summary/stock-in-hand-item-wise', icon: IconListDetails, requiredFeature: 'STOCKSUMMARY_MENU_VIEW' },
            { title: 'Stock In Hand (Voucher Wise)', url: '/reports/stock_summary/stock-in-hand-voucher-wise', icon: IconFileInvoice, requiredFeature: 'STOCKSUMMARY_MENU_VIEW' },
            { title: 'Opening Entry', url: '/reports/opening_entry', icon: IconDoorEnter, requiredFeature: 'OPENING_ENTRY_REPORT_MENU_VIEW' },
          ],
        },
        {
          title: 'Freight & Logistics',
          icon: IconTruck,
          requiredFeature: 'FREIGHT_MENU_VIEW',
          items: [
            { title: 'Delivery Note (Zone Wise)', url: '/reports/freight/delivery-note-zone-wise', icon: IconMapPin, requiredFeature: 'FREIGHT_REPORT_MENU_VIEW' },
            { title: 'Delivery Note (Godown Wise)', url: '/reports/freight/delivery-note-godown-wise', icon: IconBuildingWarehouse, requiredFeature: 'FREIGHT_REPORT_MENU_VIEW' },
            { title: 'Freight (Zone Wise)', url: '/reports/freight/freight-zone-wise', icon: IconRoute, requiredFeature: 'FREIGHT_REPORT_MENU_VIEW' },
            { title: 'Freight (Transporter Wise)', url: '/reports/freight/freight-transporter-wise', icon: IconTruck, requiredFeature: 'FREIGHT_REPORT_MENU_VIEW' },
            { title: 'Freight (Transporter Item Wise)', url: '/reports/freight/freight-transporter-item-wise', icon: IconTruck, requiredFeature: 'FREIGHT_REPORT_MENU_VIEW' },
            { title: 'Freight (Voucher Wise)', url: '/reports/freight/freight-voucher-wise', icon: IconFileText, requiredFeature: 'FREIGHT_REPORT_MENU_VIEW' },
            { title: 'Freight (Godown Wise)', url: '/reports/freight/freight-godown-wise', icon: IconBuildingWarehouse, requiredFeature: 'FREIGHT_REPORT_MENU_VIEW' },
          ],
        },
      ]
    },
    {
      title: 'Year-End Process',
      visible: true,
      requiredFeature: 'YEAR_END_PROCESS_MENU_VIEW',
      items: [
        {
          title: 'Close Fiscal Year',
          url: '/masters/organization/fiscal_year',
          visible: true,
          icon: IconArchive,
          requiredFeature: 'CLOSE_FISCAL_YEAR_MENU_VIEW',
        },
        {
          title: 'Opening Journal',
          url: '/masters/organization/fiscal_year',
          visible: true,
          icon: IconDoorEnter,
          requiredFeature: 'OPENING_JOURNAL_MENU_VIEW',
        },
        {
          title: 'Opening Entry Report',
          url: '/reports/opening_entry',
          visible: true,
          icon: IconReport,
          requiredFeature: 'OPENING_ENTRY_REPORT_MENU_VIEW',
        },
      ],
    },
    {
      title: 'Other',
      visible: false,
      requiredFeature: 'SETTINGS_MENU_VIEW',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          requiredFeature: 'SETTINGS_MENU_VIEW',
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
          requiredFeature: 'HELP_CENTER_MENU_VIEW',
        },
      ],
    },
  ],
}
