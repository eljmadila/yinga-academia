"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Grid,
  BookOpen,
  Library,
  Settings,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { icon: Grid, key: "dashboard", path: "/student/dashboard" },
  { icon: BookOpen, key: "myCourses", path: "/student/courses" },
  { icon: Library, key: "catalog", path: "/student/catalog" },
];

const othersItems = [
  { icon: Settings, key: "settings", path: "/student/settings" },
  { icon: HelpCircle, key: "supportMenu", path: "/student/support" },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 border-b border-transparent flex items-center justify-center">
        <Link href="/" className="flex items-center justify-center w-full h-full hover:opacity-90 transition-opacity">
          {state === "expanded" ? (
            <div className="relative w-[120px] h-[100px]">
              <Image
                src="/images/logo/logo-sidebar-expanded.png"
                alt="Logo"
                fill
                priority
                className="object-contain object-center"
              />
            </div>
          ) : (
            <div className="relative w-[36px] h-[36px]">
              <Image
                src="/images/logo/logo-sidebar.png"
                alt="Logo Icon"
                fill
                priority
                className="object-contain object-center drop-shadow-sm"
              />
            </div>
          )}
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="dark:text-white">
        <SidebarGroup>
          <SidebarGroupLabel>{t("groups.menu")}</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton 
                  isActive={pathname === item.path}
                  render={
                    <Link href={item.path}>
                      <item.icon className="w-5 h-5" />
                      <span>{t(`items.${item.key}`)}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("groups.others")}</SidebarGroupLabel>
          <SidebarMenu>
            {othersItems.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton 
                  isActive={pathname === item.path}
                  render={
                    <Link href={item.path}>
                      <item.icon className="w-5 h-5" />
                      <span>{t(`items.${item.key}`)}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
