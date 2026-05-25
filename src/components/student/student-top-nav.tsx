// @ts-nocheck
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/hooks/use-auth"
import { getMyStudentProfile } from "@/lib/api/student"

function getTitleFromPath(pathname: string): string {
  if (!pathname || pathname === "/student") return "Dashboard"
  const parts = pathname.replace(/^\/+|\/+$/g, "").split("/")
  const afterStudent = parts.slice(1)
  if (afterStudent.length === 0) return "Dashboard"
  if (afterStudent[0] === "courses") {
    if (afterStudent.length === 1) return "My Courses"
    return "Course"
  }
  return afterStudent[0]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function StudentTopNav() {
  const pathname = usePathname()
  const title = getTitleFromPath(pathname)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")

  const { logout } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyStudentProfile()

        let url =
          res?.student?.profile_image ||
          res?.student?.avatarUrl ||
          null

        let name = res?.student?.user_id?.name || "Student"
        let email = res?.student?.user_id?.email || ""

        if (url && url.startsWith("/")) {
          url = `${process.env.NEXT_PUBLIC_API_URL}${url}`
        }

        setAvatarUrl(url)
        setName(name)
        setEmail(email)
      } catch (error) {
        console.error("Failed to load student profile:", error)
      }
    }

    load()
  }, [])

  return (
    <div className="sticky top-0 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-12 w-full items-center px-2 sm:h-14 sm:px-16">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden text-sm font-medium text-gray-800 sm:inline lg:text-base">
            {title}
          </span>
        </div>

        {/* CENTER SEARCH (MOBILE) */}
        <div className="flex-1 mx-2 sm:hidden">
          <div className="flex items-center gap-2 rounded-md border bg-white px-2 py-1">
            <Search className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <Input
              className="h-6 border-0 p-0 shadow-none focus-visible:ring-0 text-sm"
              placeholder="Search"
            />
          </div>
        </div>

        {/* RIGHT SIDE — pushed to far right */}
        <div className="ml-auto flex items-center gap-3">

          {/* DESKTOP SEARCH */}
          <div className="hidden sm:flex min-w-[200px] lg:min-w-[240px] items-center gap-2 rounded-md border bg-white px-2">
            <Search className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <Input
              className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
              placeholder="Search courses..."
            />
          </div>

          {/* USER DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-3 rounded-full outline-none ring-0 focus-visible:ring-2 focus-visible:ring-blue-300 transition-all duration-200 hover:scale-105">

                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                  <AvatarFallback className="text-xs">ST</AvatarFallback>
                </Avatar>

                {/* Name + Email */}
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[13px] font-semibold text-gray-800">
                    {name}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {email}
                  </span>
                </div>

              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/student/account">Account</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/student/calendar">Calendar</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/">Back Home</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </div>
  )
}
