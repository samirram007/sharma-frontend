import type { ComponentType } from 'react'
import {
  Building2,
  HandCoinsIcon,
  NotebookTabsIcon,
  Users,
  WarehouseIcon,
} from 'lucide-react'
import {
  IconArchive,
  IconBuildingWarehouse,
  IconChartBar,
  IconClipboardList,
  IconLayoutDashboard,
  IconListDetails,
  IconPackages,
  IconRadar2,
  IconTruck,
  IconUserCheck,
} from '@tabler/icons-react'

type IconType = ComponentType<{ className?: string; size?: number | string }>

/* ------------------------------------------------------------------ */
/* Overview / Getting started                                          */
/* ------------------------------------------------------------------ */

export interface Concept {
  term: string
  description: string
}

export interface GettingStartedStep {
  title: string
  description: string
  path: string
  pathLabel: string
}

export interface Pillar {
  title: string
  description: string
}

export const overviewContent = {
  intro: [
    'The application is a complete enterprise platform for running a trading and distribution business: multi-company financial accounting, inventory, sales & distribution services and management reporting in one place. It is organised around a fiscal-year model — you set up your company and chart of accounts once, open a fiscal year, then record the day-to-day transactions against it.',
    'Everything you enter flows through the same pipeline: master data (ledgers, stock items, parties) feeds transactions (vouchers), transactions feed the day book, ledgers, stock registers and financial statements, and the year-end process rolls one fiscal year into the next.',
  ],
  pillars: [
    {
      title: 'Master data',
      description:
        'The building blocks you set up once: company & fiscal years, chart of accounts (account groups and ledgers), parties (distributors, suppliers, transporters), inventory (stock groups, items, units, godowns) and payroll masters.',
    },
    {
      title: 'Transactions & services',
      description:
        'Daily work: recording payment, receipt and journal vouchers, opening balances, stock journals and movements, and the sales & distribution services such as delivery notes and freight.',
    },
    {
      title: 'Administration',
      description:
        'Who can do what: users, roles and permissions, application modules, feature access and menu visibility.',
    },
    {
      title: 'Reports & year-end',
      description:
        'Financial statements (balance sheet, profit & loss), day book and registers, stock-in-hand summaries, freight & delivery reports, plus opening and closing fiscal year processes.',
    },
  ] satisfies Pillar[],
  concepts: [
    {
      term: 'Company',
      description:
        'A legal entity (with branches) you keep books for. You can maintain several companies side by side.',
    },
    {
      term: 'Fiscal year',
      description:
        'The accounting period (e.g. 01-04-2025 to 31-03-2026). All vouchers belong to the current open fiscal year, and opening balances are recorded when a year is opened.',
    },
    {
      term: 'Chart of accounts',
      description:
        'Your account groups (assets, liabilities, income, expenses) and the individual ledgers (e.g. cash, bank, party accounts) that vouchers are posted to.',
    },
    {
      term: 'Voucher',
      description:
        'A recorded transaction — payment, receipt, journal or stock movement — posted against ledgers and/or stock items.',
    },
    {
      term: 'Day book',
      description:
        'The chronological register of every voucher you enter; the source for ledgers, registers and statements.',
    },
    {
      term: 'Stock & godowns',
      description:
        'Stock items organised under groups and categories, measured in stock units and stored across godowns and storage units.',
    },
    {
      term: 'Party',
      description:
        'Your business partners — distributors, suppliers and transporters — used across vouchers, delivery and freight.',
    },
    {
      term: 'Roles & permissions',
      description:
        'Users are grouped into roles, and each role is granted access to specific application modules, features and menu items.',
    },
  ] satisfies Concept[],
  gettingStarted: [
    {
      title: 'Create your company',
      description:
        'Start with your business identity — name, address, GST/registration details and default currency.',
      path: '/masters/organization/company',
      pathLabel: 'Company',
    },
    {
      title: 'Set up the fiscal year',
      description:
        'Create and open the fiscal year you want to work in. This becomes the period for all transactions.',
      path: '/masters/organization/fiscal_year',
      pathLabel: 'Fiscal Year',
    },
    {
      title: 'Build the chart of accounts',
      description:
        'Add account groups first, then the ledgers (cash, bank, party and expense accounts) under them.',
      path: '/masters/accounts/account_group',
      pathLabel: 'Chart of Accounts',
    },
    {
      title: 'Record opening balances',
      description:
        'Bring forward opening balances of ledgers and stock so your books start from the correct position.',
      path: '/transactions/opening-balance',
      pathLabel: 'Opening Balance Setup',
    },
    {
      title: 'Add parties and inventory masters',
      description:
        'Register suppliers, distributors and transporters, and define stock groups, units, items and godowns.',
      path: '/masters/party/supplier',
      pathLabel: 'Supplier',
    },
    {
      title: 'Create users and assign permissions',
      description:
        'Invite your team, group them into roles and decide which modules, features and menus each role can see.',
      path: '/administration/user',
      pathLabel: 'User',
    },
    {
      title: 'Start recording transactions',
      description:
        'Enter vouchers as the business operates and track everything through the day book and reports.',
      path: '/transactions/vouchers',
      pathLabel: 'Vouchers',
    },
  ] satisfies GettingStartedStep[],
  exploreLinks: [
    { label: 'Dashboard', path: '/' },
    { label: 'Company', path: '/masters/organization/company' },
    { label: 'Fiscal Year', path: '/masters/organization/fiscal_year' },
    { label: 'Chart of Accounts', path: '/masters/accounts/account_group' },
    { label: 'Vouchers', path: '/transactions/vouchers' },
    { label: 'Stock Item', path: '/masters/inventory/stock_item' },
    { label: 'Balance Sheet', path: '/reports/balance_sheet' },
    { label: 'Support Tickets', path: '/help-center' },
  ],
}

/* ------------------------------------------------------------------ */
/* Modules & services                                                  */
/* ------------------------------------------------------------------ */

export interface ModuleEntry {
  name: string
  path: string
  summary: string
}

export interface ModuleArea {
  id: string
  title: string
  icon: IconType
  description: string
  modules: ModuleEntry[]
}

export const moduleAreas: ModuleArea[] = [
  {
    id: 'organization',
    title: 'Organization',
    icon: Building2,
    description:
      'The legal and structural setup of your business: the companies you keep books for and the fiscal years you transact in.',
    modules: [
      {
        name: 'Company',
        path: '/masters/organization/company',
        summary:
          'Your business entity — name, address, registration and statutory details. Multiple companies can be maintained.',
      },
      {
        name: 'Fiscal Year',
        path: '/masters/organization/fiscal_year',
        summary:
          'Create, open and manage accounting periods. Every voucher and report is tied to an open fiscal year.',
      },
      {
        name: 'Currency',
        path: '/masters/organization/currency',
        summary:
          'The currencies available to companies and vouchers, with their codes, symbols and defaults.',
      },
      {
        name: 'Country',
        path: '/masters/organization/country',
        summary:
          'Country reference master used for addresses and statutory/geographic classification.',
      },
      {
        name: 'State',
        path: '/masters/organization/state',
        summary:
          'State reference master (with country linkage) used in addresses and reports.',
      },
    ],
  },
  {
    id: 'accounts',
    title: 'Accounts (Chart of Accounts)',
    icon: NotebookTabsIcon,
    description:
      'The financial structure of your books: how accounts are grouped, where ledgers live and which voucher types you use.',
    modules: [
      {
        name: 'Chart of Accounts',
        path: '/masters/accounts/account_group',
        summary:
          'Account groups organised by nature — assets, liabilities, income and expenses — that structure your ledgers.',
      },
      {
        name: 'Account Ledger',
        path: '/masters/accounts/account_ledger',
        summary:
          'Individual accounts (cash, bank, parties, expenses, incomes) under account groups; vouchers are posted to ledgers.',
      },
      {
        name: 'Voucher Type',
        path: '/masters/accounts/voucher_type',
        summary:
          'The voucher categories (payment, receipt, journal, etc.) available in transactions, with their numbering and defaults.',
      },
    ],
  },
  {
    id: 'party',
    title: 'Party',
    icon: Users,
    description:
      'The people and companies you do business with — distributors, suppliers and transporters.',
    modules: [
      {
        name: 'Distributor',
        path: '/masters/party/distributor',
        summary:
          'Your distribution network — the channel through which goods reach the market.',
      },
      {
        name: 'Supplier',
        path: '/masters/party/supplier',
        summary:
          'Vendors you purchase stock and services from; linked to purchase vouchers and payable ledgers.',
      },
      {
        name: 'Transporter',
        path: '/masters/party/transporter',
        summary:
          'Logistics providers used for delivery notes and freight tracking.',
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: WarehouseIcon,
    description:
      'Everything about your stock: how items are classified, measured and stored across godowns.',
    modules: [
      {
        name: 'Stock Item',
        path: '/masters/inventory/stock_item',
        summary:
          'The products and materials you buy, sell and stock, with units, batches/serials, pricing and godown storage.',
      },
      {
        name: 'Stock Group',
        path: '/masters/inventory/stock_group',
        summary:
          'Hierarchical grouping of stock items (e.g. by product family) for reports and organisation.',
      },
      {
        name: 'Stock Category',
        path: '/masters/inventory/stock_category',
        summary:
          'A secondary classification of stock items (e.g. taxable / non-taxable) used alongside groups.',
      },
      {
        name: 'Stock Unit',
        path: '/masters/inventory/stock_unit',
        summary:
          'Units of measure (pcs, boxes, kg…) in which stock quantities and rates are maintained.',
      },
      {
        name: 'Godown',
        path: '/masters/inventory/godown',
        summary:
          'Your storage locations — warehouses/godowns with storage units — where stock quantities are tracked.',
      },
    ],
  },
  {
    id: 'payroll',
    title: 'Payroll',
    icon: HandCoinsIcon,
    description:
      'Organisation structure and people masters used by payroll and related processes.',
    modules: [
      {
        name: 'Employee',
        path: '/masters/payroll/employee',
        summary:
          'Staff records linked to user accounts, departments and designations.',
      },
      {
        name: 'Department',
        path: '/masters/payroll/department',
        summary: 'The departments employees belong to within the company.',
      },
      {
        name: 'Designation',
        path: '/masters/payroll/designation',
        summary:
          'Job titles/roles (manager, accountant, salesman…) assigned to employees.',
      },
    ],
  },
  {
    id: 'logistics',
    title: 'Sales & Distribution Services',
    icon: IconTruck,
    description:
      'The delivery and freight services that move goods from your godowns to distributors and customers.',
    modules: [
      {
        name: 'Delivery Places',
        path: '/masters/miscellaneous/delivery_places',
        summary:
          'Destinations you deliver to — customers or distributor locations serviced by delivery notes.',
      },
      {
        name: 'Delivery Routes',
        path: '/masters/miscellaneous/delivery_routes',
        summary:
          'Route masters grouping delivery places for planning and zone-wise reporting.',
      },
      {
        name: 'Delivery Vehicles',
        path: '/masters/miscellaneous/delivery_vehicles',
        summary:
          'The vehicles used to dispatch goods, tracked against delivery notes.',
      },
      {
        name: 'Delivery Note Reports',
        path: '/reports/freight/delivery-note-zone-wise',
        summary:
          'Zone-wise and godown-wise delivery note reports for dispatch tracking.',
      },
      {
        name: 'Freight Reports',
        path: '/reports/freight/freight-zone-wise',
        summary:
          'Freight summaries by zone, transporter, voucher, godown and item for logistics costing.',
      },
    ],
  },
  {
    id: 'administration',
    title: 'Administration',
    icon: IconRadar2,
    description:
      'The security and configuration layer: who can log in, what they can do and which menus they see.',
    modules: [
      {
        name: 'User',
        path: '/administration/user',
        summary:
          'User accounts for your team, linked to employees, roles and fiscal years.',
      },
      {
        name: 'Roles',
        path: '/administration/role',
        summary:
          'Role definitions (admin, manager, employee…) that bundle permissions together.',
      },
      {
        name: 'Roles & Permissions',
        path: '/administration/permission',
        summary:
          'Fine-grained assignment of permissions to roles across modules and features.',
      },
      {
        name: 'App Module',
        path: '/administration/app_module',
        summary:
          'The application modules that make up the product; module access is permission-driven.',
      },
      {
        name: 'App Features',
        path: '/administration/app_module_feature',
        summary:
          'Individual features inside each module that can be granted or restricted.',
      },
      {
        name: 'Menu Features',
        path: '/administration/menu',
        summary:
          'Mapping of menu items to feature permissions so menus show only what a role can use.',
      },
      {
        name: 'Menu Manager',
        path: '/administration/menu_manager',
        summary:
          'Tweak how menus are labelled, ordered and displayed for users.',
      },
    ],
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: IconClipboardList,
    description:
      'Where day-to-day activity is recorded — vouchers, opening balances and the day book.',
    modules: [
      {
        name: 'Vouchers',
        path: '/transactions/vouchers',
        summary:
          'Record payment, receipt, journal and stock vouchers against ledgers and stock items.',
      },
      {
        name: 'Day Book',
        path: '/reports/day_book',
        summary:
          'The chronological register of all vouchers — review, verify and trace entries.',
      },
      {
        name: 'Opening Balance Setup',
        path: '/transactions/opening-balance',
        summary:
          'Enter the opening balances of ledgers and stock when you open a new fiscal year.',
      },
      {
        name: 'Opening Journal',
        path: '/masters/organization/fiscal_year/new/open',
        summary:
          'The journal through which opening entries are posted for a newly opened fiscal year.',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: IconChartBar,
    description:
      'Financial statements, registers and operational summaries that draw from your recorded transactions.',
    modules: [
      {
        name: 'Balance Sheet',
        path: '/reports/balance_sheet',
        summary:
          'The financial position of the company — assets, liabilities and equity — for a fiscal year.',
      },
      {
        name: 'Profit & Loss',
        path: '/reports/profit_and_loss',
        summary:
          'Income and expense performance for a period, driven by your income/expense ledgers.',
      },
      {
        name: 'Receipt Book',
        path: '/reports/receipt_book',
        summary: 'Register of receipts recorded through receipt vouchers.',
      },
      {
        name: 'Distributor Book',
        path: '/reports/distributor_book',
        summary:
          'Per-distributor statement of transactions — dispatch, returns and payments.',
      },
      {
        name: 'Stock In Hand',
        path: '/reports/stock_summary/stock-in-hand',
        summary:
          'Current stock position by item — with godown-wise, zone-wise, item-wise and voucher-wise views.',
      },
      {
        name: 'Opening Entry Report',
        path: '/reports/opening_entry',
        summary:
          'The opening balances posted when a fiscal year was opened — for verification.',
      },
    ],
  },
  {
    id: 'year-end',
    title: 'Year-End Process',
    icon: IconArchive,
    description:
      'Roll the business from one fiscal year into the next: close the old year, open the new one and carry balances forward.',
    modules: [
      {
        name: 'Close Fiscal Year',
        path: '/masters/organization/fiscal_year/close',
        summary:
          'Finalise a fiscal year — profit/loss transfer and balance carry-forward.',
      },
      {
        name: 'Opening Journal',
        path: '/masters/organization/fiscal_year/new/open',
        summary:
          'Post the opening entries for the new fiscal year after closing the previous one.',
      },
      {
        name: 'Opening Balance Setup',
        path: '/transactions/opening-balance',
        summary:
          'Enter or verify opening balances of ledgers and stock for the new year.',
      },
      {
        name: 'Opening Entry Report',
        path: '/reports/opening_entry',
        summary:
          'Review everything carried into the new year before you start transacting.',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Workflows & guides                                                  */
/* ------------------------------------------------------------------ */

export interface WorkflowStep {
  title: string
  description?: string
  path?: string
  pathLabel?: string
}

export interface WorkflowGuide {
  id: string
  title: string
  icon: IconType
  summary: string
  appliesTo?: string
  steps: WorkflowStep[]
  tip?: string
}

export const workflowGuides: WorkflowGuide[] = [
  {
    id: 'first-time-setup',
    title: 'First-time setup & opening a fiscal year',
    icon: IconLayoutDashboard,
    summary:
      'From a blank database to a working company: create the company, open a fiscal year and record opening balances.',
    steps: [
      {
        title: 'Create your company',
        description:
          'Add the company with its address, currency and registration details under Masters > Organization > Company.',
        path: '/masters/organization/company',
        pathLabel: 'Company',
      },
      {
        title: 'Create and open a fiscal year',
        description:
          'Under Masters > Organization > Fiscal Year, add the period you want to work in (e.g. 01-04-2025 to 31-03-2026) and open it. The year must be open before you can record vouchers.',
        path: '/masters/organization/fiscal_year',
        pathLabel: 'Fiscal Year',
      },
      {
        title: 'Prepare the chart of accounts',
        description:
          'Add account groups, then create the ledgers you need (cash, bank, parties, expenses). Vouchers can only post to existing ledgers.',
        path: '/masters/accounts/account_group',
        pathLabel: 'Chart of Accounts',
      },
      {
        title: 'Enter opening balances',
        description:
          'Use Opening Balance Setup to bring forward ledger and stock balances so the new year starts correctly.',
        path: '/transactions/opening-balance',
        pathLabel: 'Opening Balance Setup',
      },
      {
        title: 'Verify with the Opening Entry Report',
        description:
          'Confirm the balances that were carried into the year before recording live transactions.',
        path: '/reports/opening_entry',
        pathLabel: 'Opening Entry Report',
      },
    ],
    tip: 'Check that the fiscal year you opened is the one selected for your user — reports and vouchers always work within the current open year.',
  },
  {
    id: 'chart-of-accounts',
    title: 'Building your chart of accounts',
    icon: IconListDetails,
    summary:
      'Set up the account structure that every voucher will post against: groups first, ledgers second, voucher types last.',
    steps: [
      {
        title: 'Define account groups',
        description:
          'In Masters > Accounts > Chart of Accounts, create the hierarchy (assets, liabilities, income, expenses) that matches how you run the business.',
        path: '/masters/accounts/account_group',
        pathLabel: 'Chart of Accounts',
      },
      {
        title: 'Create ledgers under groups',
        description:
          'In Account Ledger, add individual accounts and attach each to an account group. Keep naming consistent so reports group correctly.',
        path: '/masters/accounts/account_ledger',
        pathLabel: 'Account Ledger',
      },
      {
        title: 'Configure voucher types',
        description:
          'In Voucher Type, define the types you will use for transactions and their defaults (numbering, nature).',
        path: '/masters/accounts/voucher_type',
        pathLabel: 'Voucher Type',
      },
      {
        title: 'Validate through a test voucher',
        description:
          'Enter a small test voucher and confirm it appears correctly in the day book and on the ledger.',
      },
    ],
    tip: 'Plan the group hierarchy before creating ledgers — moving a ledger to another group later is easier when the structure is clean from day one.',
  },
  {
    id: 'parties-inventory-masters',
    title: 'Adding parties and inventory masters',
    icon: IconPackages,
    summary:
      'Register the counterparties and the stock catalogue before recording purchase, sales and stock transactions.',
    steps: [
      {
        title: 'Register parties',
        description:
          'Add distributors, suppliers and transporters under Masters > Party with their codes, addresses and contact details.',
        path: '/masters/party/supplier',
        pathLabel: 'Supplier',
      },
      {
        title: 'Set up stock groups and categories',
        description:
          'Define the groupings under Masters > Inventory > Stock Group / Stock Category that organise your items.',
        path: '/masters/inventory/stock_group',
        pathLabel: 'Stock Group',
      },
      {
        title: 'Define stock units',
        description:
          'Add the units of measure (pcs, boxes, kg) your stock is bought and sold in.',
        path: '/masters/inventory/stock_unit',
        pathLabel: 'Stock Unit',
      },
      {
        title: 'Create stock items',
        description:
          'Add each product under Stock Item and assign its group, category, unit, rates and (optionally) batches/serials.',
        path: '/masters/inventory/stock_item',
        pathLabel: 'Stock Item',
      },
      {
        title: 'Set up godowns',
        description:
          'Define the warehouses/godowns and storage units where quantities are tracked, then map stock to them.',
        path: '/masters/inventory/godown',
        pathLabel: 'Godown',
      },
    ],
    tip: 'A party (supplier/distributor) is usually mirrored by a ledger — keep the party and ledger names aligned so vouchers and reports stay readable.',
  },
  {
    id: 'recording-vouchers',
    title: 'Recording vouchers & using the day book',
    icon: IconClipboardList,
    summary:
      'How daily transactions are entered and verified: pick a voucher type, post the entries, then confirm in the day book.',
    steps: [
      {
        title: 'Choose the voucher type',
        description:
          'Go to Transactions > Vouchers and select the type that matches the transaction (payment, receipt, journal, etc.).',
        path: '/transactions/vouchers',
        pathLabel: 'Vouchers',
      },
      {
        title: 'Enter the transaction',
        description:
          'Fill the date, the ledgers/accounts involved and the amount. The voucher type drives the default debit/credit behaviour.',
      },
      {
        title: 'Include stock where applicable',
        description:
          'For stock-related vouchers, select the items, godowns and quantities so stock registers update alongside the accounts.',
      },
      {
        title: 'Save and verify in the day book',
        description:
          'Open Day Book to confirm the voucher appears in date order with the right totals.',
        path: '/reports/day_book',
        pathLabel: 'Day Book',
      },
      {
        title: 'Reconcile through ledgers and reports',
        description:
          'Spot-check the affected ledgers and, at period end, the balance sheet and profit & loss.',
      },
    ],
    tip: 'Run the day book daily — small data entry mistakes are far easier to fix on the same day.',
  },
  {
    id: 'stock-journals',
    title: 'Stock journals & godown transfers',
    icon: IconBuildingWarehouse,
    summary:
      'Move stock between godowns or storage units and record inward/outward movements that do not involve a financial voucher.',
    steps: [
      {
        title: 'Open the stock journal',
        description:
          'From the vouchers/stock journal screen, start a new stock journal entry and choose its type (inward, outward or transfer).',
      },
      {
        title: 'Select items and quantities',
        description:
          'Pick the stock items, the source godown/storage unit and the destination for a transfer, with quantities.',
      },
      {
        title: 'Review batch/serial and rate handling',
        description:
          'If items use batches, serials or tracked rates, confirm the selections so valuation stays accurate.',
      },
      {
        title: 'Save and verify stock reports',
        description:
          'Check the Stock In Hand report — item-wise and godown-wise — to confirm quantities moved correctly.',
        path: '/reports/stock_summary/stock-in-hand',
        pathLabel: 'Stock In Hand',
      },
    ],
    tip: 'Use a transfer journal (not inward/outward pairs) when stock simply moves between godowns — it keeps the books clean.',
  },
  {
    id: 'users-roles-permissions',
    title: 'Users, roles, permissions & menus',
    icon: IconUserCheck,
    summary:
      'Control who can sign in and what each person can see and do, from broad roles down to individual menu items.',
    steps: [
      {
        title: 'Create users',
        description:
          'Add team members under Administration > User and link them to employees where relevant.',
        path: '/administration/user',
        pathLabel: 'User',
      },
      {
        title: 'Define roles',
        description:
          'Create roles (admin, manager, accountant, employee…) under Administration > Roles.',
        path: '/administration/role',
        pathLabel: 'Roles',
      },
      {
        title: 'Assign permissions to roles',
        description:
          'In Roles & Permissions, grant each role access to the application modules and features it needs.',
        path: '/administration/permission',
        pathLabel: 'Roles & Permissions',
      },
      {
        title: 'Check module & feature coverage',
        description:
          'Review App Module and App Features so the modules you enabled actually have the features the role expects.',
        path: '/administration/app_module',
        pathLabel: 'App Module',
      },
      {
        title: 'Verify menus',
        description:
          'Use Menu Features / Menu Manager so each role only sees navigation it is permitted to use.',
        path: '/administration/menu',
        pathLabel: 'Menu Features',
      },
      {
        title: 'Test with a second login',
        description:
          'Sign in as the new user and confirm they see the right menus and can perform the intended tasks.',
      },
    ],
    tip: 'Start permissive and tighten gradually — restricting an existing role later can quietly hide menus users depend on.',
  },
  {
    id: 'reports-overview',
    title: 'Running reports: statements, registers, stock & freight',
    icon: IconChartBar,
    summary:
      'The report centre of the application: from statutory statements to operational stock and logistics summaries.',
    steps: [
      {
        title: 'Financial statements',
        description:
          'Run Balance Sheet and Profit & Loss for the current fiscal year once your transactions are recorded.',
        path: '/reports/balance_sheet',
        pathLabel: 'Balance Sheet',
      },
      {
        title: 'Registers',
        description:
          'Use Day Book, Receipt Book and Distributor Book to trace activity chronologically and per party.',
        path: '/reports/day_book',
        pathLabel: 'Day Book',
      },
      {
        title: 'Stock summaries',
        description:
          'Review Stock In Hand by item, godown, zone or voucher to keep inventory in line with physical stock.',
        path: '/reports/stock_summary/stock-in-hand',
        pathLabel: 'Stock In Hand',
      },
      {
        title: 'Freight & delivery reports',
        description:
          'Track deliveries and freight by zone, godown, transporter, voucher or item for costing and control.',
        path: '/reports/freight/delivery-note-zone-wise',
        pathLabel: 'Delivery Note (Zone Wise)',
      },
      {
        title: 'Export and share',
        description:
          'Export reports for your accountant or management team as needed.',
      },
    ],
    tip: 'Most reports are fiscal-year aware — always confirm you are looking at the intended year before drawing conclusions.',
  },
  {
    id: 'year-end-close',
    title: 'Closing a fiscal year & opening the next',
    icon: IconArchive,
    summary:
      'The controlled handover between accounting periods: close the completed year, carry balances forward and start fresh.',
    steps: [
      {
        title: 'Reconcile the closing year',
        description:
          'Before closing, verify statements, registers and stock so the year-end numbers are final.',
      },
      {
        title: 'Close the fiscal year',
        description:
          'Run Close Fiscal Year under Year-End Process when the year is complete.',
        path: '/masters/organization/fiscal_year/close',
        pathLabel: 'Close Fiscal Year',
      },
      {
        title: 'Open the new fiscal year',
        description: 'Create and open the next fiscal year under Fiscal Year.',
        path: '/masters/organization/fiscal_year',
        pathLabel: 'Fiscal Year',
      },
      {
        title: 'Post the opening journal',
        description:
          'Carry balances into the new year through the Opening Journal / Opening Balance Setup.',
        path: '/masters/organization/fiscal_year/new/open',
        pathLabel: 'Opening Journal',
      },
      {
        title: 'Verify the opening entry report',
        description:
          'Confirm the carried-forward balances with the Opening Entry Report before recording new transactions.',
        path: '/reports/opening_entry',
        pathLabel: 'Opening Entry Report',
      },
    ],
    tip: 'Do not close the year until every reconciling item is resolved — reopening a closed year is disruptive.',
  },
]
