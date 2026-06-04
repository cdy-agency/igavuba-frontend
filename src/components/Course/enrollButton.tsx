"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

interface EnrollButtonProps {
  courseId: string;
  courseName?: string;
  isEnrolled?: boolean;
  className?: string;
}

export function EnrollButton({
  courseId,
  courseName,
  isEnrolled = false,
  className = "",
}: EnrollButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);

  if (enrolled === true) {
    return (
      <button
        onClick={() => router.push(`/student/courses/${courseId}/modules`)}
        className={`w-full bg-primary hover:bg-primary text-panel-foreground py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${className}`}
      >
        <BookOpen className="h-4 w-4" />
        Continue Learning
      </button>
    );
  }

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to enroll. Please try again.");
      }

      setEnrolled(true);
      toast.success(
        courseName
          ? `You've enrolled in "${courseName}"!`
          : "You've successfully enrolled!"
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to enroll. Please try again.";

      if (message.toLowerCase().includes("already enrolled")) {
        setEnrolled(true);
        toast.info("You are already enrolled in this course.");
      } else {
        toast.error(message);
      }
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={enrolling}
      className={`w-full bg-primary hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-panel-foreground py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      {enrolling ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        "Enroll Now"
      )}
    </button>
  );
}
