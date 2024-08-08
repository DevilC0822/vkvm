'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DashboardOutlined, PartitionOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, theme, Drawer, Button } from 'antd';
import { MenuOutlined, GithubOutlined } from '@ant-design/icons';
import VercelIcon from '@/assets/vercel.svg';

const { Content, Sider, Header } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Databoard', '/', <DashboardOutlined />),
  getItem('KV Management', '/kv', <PartitionOutlined />),
];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([pathname]);
  const [openMenuDrawer, setOpenMenuDrawer] = useState(false);
  const onOpenMenuDrawer = () => {
    setOpenMenuDrawer(true);
  };
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const goHome = () => {
    router.push('/');
  };
  const onMenuClick: MenuProps['onClick'] = e => {
    if (e.key === pathname) {
      return;
    }
    router.push(e.key);
  };
  const onGoGithub = () => {
    window.open('https://github.com/DevilC0822/vkvm');
  };
  useEffect(() => {
    setSelectedKeys([pathname]);
  }, [pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <div className="flex flex-1 max-md:flex-col">
        <Sider
          className="h-full hidden md:block border-r border-gray-200"
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={value => setCollapsed(value)}
        >
          <div className="inline-flex cursor-pointer h-16 shrink-0 items-center ml-6">
            <Image onClick={goHome} src={VercelIcon} alt="Vercle Icon" width={32} />
          </div>
          <Menu onClick={onMenuClick} theme="light" selectedKeys={selectedKeys} mode="inline" items={items} />
        </Sider>
        <div className="flex-1">
          <Header style={{ backgroundColor: '#fff' }} className="!p-4 border-b border-gray-200">
            <div className="h-full flex justify-between items-center">
              <div className="hidden max-md:flex">
                <Button
                  onClick={onOpenMenuDrawer}
                  type="text"
                  className="cursor-pointer"
                  icon={<MenuOutlined style={{ fontSize: 20, color: '#646b75' }} />}
                />
              </div>
              <div></div>
              <Button onClick={onGoGithub} type="text" icon={<GithubOutlined style={{ fontSize: 20 }} />} />
            </div>
          </Header>
          <Layout className="h-full !bg-white max-md:w-screen" style={{
            overflow: 'scroll',
            maxHeight: 'calc(100vh - 64px)',
          }}>
            <Content>
              <div
                style={{
                  padding: 24,
                  minHeight: 360,
                  borderRadius: 0,
                  background: colorBgContainer,
                }}
              >
                {children}
              </div>
            </Content>
          </Layout>
        </div>
      </div>
      <Drawer
        title="Menu"
        placement="left"
        width={280}
        closable={false}
        onClose={() => setOpenMenuDrawer(false)}
        open={openMenuDrawer}
      >
        <div className="inline-flex cursor-pointer h-16 shrink-0 items-center ml-6">
          <Image onClick={goHome} src={VercelIcon} alt="Vercle Icon" width={32} />
        </div>
        <Menu
          className="mobile-menu"
          onClick={onMenuClick}
          theme="light"
          selectedKeys={selectedKeys}
          mode="inline"
          items={items}
        />
      </Drawer>
    </Layout>
  );
};

export default MainLayout;

