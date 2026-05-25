// @ts-nocheck
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Calendar, Inbox, User2 } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
	{ href: "/student", label: "Home", icon: LayoutDashboard },
	{ href: "/student/courses", label: "Courses", icon: BookOpen },
	{ href: "/student/calendar", label: "Calendar", icon: Calendar },
	{ href: "/student/inbox", label: "Inbox", icon: Inbox },
	{ href: "/student/account", label: "Account", icon: User2 },
]

export default function MobileBottomNav() {
	const pathname = usePathname()

	return (
		<nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
			<ul className="mx-auto flex max-w-6xl items-stretch justify-between gap-1 px-1">
				{items.map(({ href, label, icon: Icon }) => {
					const active = pathname === href || pathname.startsWith(href + "/")
					return (
						<li key={href} className="flex-1">
							<Link
								href={href}
								className={cn(
									"flex h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
									active ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
								)}
								aria-current={active ? "page" : undefined}
							>
								<Icon className="h-5 w-5" />
								<span>{label}</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}