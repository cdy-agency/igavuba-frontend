import { Suspense } from "react"
import VerifyTokenClient from "@/components/instructor/verify-token-client"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Verifying…</div>}>
      <VerifyTokenClient />
    </Suspense>
  )
}