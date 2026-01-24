import type { MenuList } from '@/interface/layout/menu.interface';

import { intercepter, mock } from '../config';

const mockMenuList: MenuList = [
  {
    code: 'dashboard',
    label: {
      zh_CN: '首页',
      en_US: 'Dashboard',
    },
    icon: 'dashboard',
    path: '/dashboard',
  },

  {
    code: 'Chat',
    label: {
      zh_CN: '聊天',
      en_US: 'Chat',
    },
    icon: 'chat',
    path: '/chat',
  },

  {
    code: 'business',
    label: {
      zh_CN: '业务',
      en_US: 'Business',
    },
    icon: 'permission',
    path: '/business',
    children: [
      {
        code: 'basic',
        label: {
          zh_CN: '基本',
          en_US: 'Basic',
        },
        path: '/business/basic',
      },
      {
        code: 'withSearch',
        label: {
          zh_CN: '带查询',
          en_US: 'WithSearch',
        },
        path: '/business/with-search',
      },
      {
        code: 'withAside',
        label: {
          zh_CN: '带侧边栏',
          en_US: 'WithAside',
        },
        path: '/business/with-aside',
      },
      {
        code: 'withRadioCard',
        label: {
          zh_CN: '带单选卡片',
          en_US: 'With Nav Tabs',
        },
        path: '/business/with-radio-cards',
      },
      {
        code: 'withTabs',
        label: {
          zh_CN: '带选项卡',
          en_US: 'With Tabs',
        },
        path: '/business/with-tabs',
      },
    ],
  },
];

mock.mock('/user/menu', 'get', intercepter(mockMenuList));
