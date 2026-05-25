"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"

export default function AuthRequiredModal() {
  const { showAuthModal, closeAuthModal } = useAuth()

  return (
    <Dialog open={showAuthModal} onOpenChange={closeAuthModal}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Login Required
          </DialogTitle>
        </DialogHeader>

        <p className="text-center text-gray-600">
          You must be logged in to continue.
        </p>

        <div className="flex flex-col gap-3 mt-4">
          <Link href="/login">
            <Button className="w-full">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full">
              Create an Account
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
