import {
  IconApps,
  IconListDetails,
  IconPaperBag,
  IconPremiumRights,
  IconRadar2,
  IconStatusChange,
  IconUserCog,
} from '@tabler/icons-react'

export const AdministrationLinks = [
  {
    title: 'User',
    url: '/administration/user',
    visible: true,
    icon: IconUserCog,
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
    title: 'Status',
    url: '/administration/status',
    visible: true,
    icon: IconStatusChange,
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
  {
    title: 'App Menu Features',
    url: '/administration/Menu',
    visible: true,
    icon: IconListDetails,
  },
]
