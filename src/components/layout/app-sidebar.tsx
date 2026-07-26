'use client';

import { Car } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { appConfig, mainNavItems, secondaryNavItems, type NavItem } from '@/config';
import { ROUTES } from '@/constants';

function NavMenu({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            tooltip={item.title}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip={appConfig.name}>
              <Link href={ROUTES.home}>
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                  aria-hidden="true"
                >
                  <Car className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{appConfig.name}</span>
                  <span className="truncate text-xs text-muted-foreground">Rental Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMenu items={mainNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavMenu items={secondaryNavItems} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
