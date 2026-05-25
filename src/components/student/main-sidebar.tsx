"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  User2,
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Inbox,
  History,
  LifeBuoy,
} from "lucide-react"
import { useEffect, useState } from "react"
import { getMyStudentProfile } from "@/lib/api/student"

export const ICON_W = 56 
export const FULL_W = 220

const navItems = [
  { href: "/student/account",   icon: User2,          label: "Account",   badge: null },
  { href: "/student",           icon: LayoutDashboard, label: "Dashboard", badge: null, exact: true },
  { href: "/student/courses",   icon: BookOpen,        label: "Courses",   badge: null },
  { href: "/student/groups",    icon: Users,           label: "Groups",    badge: null },
  { href: "/student/calendar",  icon: Calendar,        label: "Calendar",  badge: null },
  { href: "/student/inbox",     icon: Inbox,           label: "Inbox",     badge: null },
  { href: "/student/history",   icon: History,         label: "History",   badge: "10" },
  { href: "/student/help",      icon: LifeBuoy,        label: "Help",      badge: null },
]

export interface MainSidebarProps {
  hovered: boolean
  setHovered: (hovered: boolean) => void
}

export function MainSidebar({ hovered, setHovered }: MainSidebarProps) {
  const pathname = usePathname()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyStudentProfile()
        setAvatarUrl(res?.student?.profile_image || null)
      } catch {}
    }
    load()
  }, [])

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: hovered ? FULL_W : ICON_W,
        minWidth: hovered ? FULL_W : ICON_W,
        transition: "width 220ms cubic-bezier(0.4,0,0.2,1), min-width 220ms cubic-bezier(0.4,0,0.2,1)",
      }}
      className="hidden lg:flex fixed left-0 top-0 h-screen flex-col bg-slate-700 border-r border-blue-800 overflow-hidden z-50"
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-600 px-0 overflow-hidden flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 pl-0 w-full"
          style={{ paddingLeft: hovered ? 20 : 0, transition: "padding-left 220ms cubic-bezier(0.4,0,0.2,1)" }}
        >
          {/* Icon area always same width as ICON_W so it doesn't jump */}
          <span
            className="text-red-500 font-bold text-base flex-shrink-0 flex items-center justify-center"
            style={{ width: ICON_W, transition: "width 0ms" }}
          >
            CDY
          </span>
          <span
            className="text-white text-sm font-semibold whitespace-nowrap overflow-hidden"
            style={{
              opacity: hovered ? 1 : 0,
              maxWidth: hovered ? 140 : 0,
              transition: "opacity 180ms ease, max-width 220ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            IGA-VUBA
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ href, icon: Icon, label, badge, exact }) => {
          const active = isActive(href, exact)
          const isAccount = href === "/student/account"

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center h-11 text-white transition-colors duration-150 relative",
                active ? "bg-blue-700" : "hover:bg-blue-800"
              )}
              style={{ width: "100%" }}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 top-0 h-full w-0.5 bg-white rounded-r" />
              )}

              {/* Icon cell — fixed width matches collapsed sidebar */}
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: ICON_W }}
              >
                {isAccount && avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </span>

              {/* Label — fades + slides in */}
              <span
                className="text-sm whitespace-nowrap overflow-hidden flex items-center gap-2"
                style={{
                  opacity: hovered ? 1 : 0,
                  maxWidth: hovered ? 160 : 0,
                  transition: "opacity 160ms ease, max-width 220ms cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {label}
                {badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {badge}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}