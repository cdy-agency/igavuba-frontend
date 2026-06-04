"use client";

import React, { useEffect, useState } from "react";
import { Check, X, Clock, CreditCard } from "lucide-react";
import { getAccountOverview } from "@/lib/api/student";
import DateFormatter from "@/components/dateFormatter";

interface AccountOverviewResponse {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    memberSince?: string;
    accountAge?: string;
  };
  accountStatus: {
    isActive: boolean;
    paymentStatus: "paid" | "pending" | "unpaid";
    lastUpdated?: string;
  };
  profileCompletion: {
    percentage: number;
    missingFields: string[];
  };
}

export default function AccountOverview() {
  const [overview, setOverview] = useState<AccountOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAccountOverview();
        setOverview(res.overview);
      } catch (err: any) {
        setError(err.message || "Failed to fetch account overview");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      paid: { color: "bg-success/20 text-success border-success/30", icon: Check, text: "Paid" },
      pending: { color: "bg-accent/20 text-accent border-accent/30", icon: Clock, text: "Pending" },
      unpaid: { color: "bg-destructive/20 text-destructive border-destructive/30", icon: X, text: "Unpaid" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}
      >
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  if (loading) return <p className="text-muted-foreground">Loading account overview...</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;
  if (!overview) return <p className="text-muted-foreground">No account data found.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Personal Info Card */}
      <div className="lg:col-span-2 bg-background rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Full Name</label>
            <p className="text-foreground font-medium">{overview.personalInfo.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Email Address</label>
            <p className="text-foreground">{overview.personalInfo.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Phone Number</label>
            <p className="text-foreground">{overview.personalInfo.phone || "Not provided"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Member Since</label>
            <p className="text-foreground">
                <DateFormatter value={overview.personalInfo.memberSince} />
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Account Age</label>
            <p className="text-foreground">{overview.personalInfo.accountAge}</p>
          </div>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="bg-background rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Account Status</h2>
        <div className="text-center py-6">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <div className="mb-4">{getPaymentStatusBadge(overview.accountStatus.paymentStatus)}</div>
          <p className="text-sm text-muted-foreground mb-2">
            {overview.accountStatus.isActive ? "Account is active" : "Account is inactive"}
          </p>
          <p className="text-foreground">
            <DateFormatter value={overview.accountStatus.lastUpdated} />
        </p>
        </div>
      </div>

      {/* Profile Completion Card */}
      <div className="lg:col-span-3 bg-background rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Profile Completion</h2>
        <div className="mb-2">
          <div className="w-full bg-muted rounded-full h-4">
            <div
              className="bg-primary h-4 rounded-full text-xs text-panel-foreground text-center"
              style={{ width: `${overview.profileCompletion.percentage}%` }}
            >
              {overview.profileCompletion.percentage}%
            </div>
          </div>
        </div>
        {overview.profileCompletion.missingFields.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Missing: {overview.profileCompletion.missingFields.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
