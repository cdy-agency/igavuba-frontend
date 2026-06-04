'use client';

import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardCheck,
  DollarSign,
  GraduationCap,
  Layers,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/widgets/stat-card';

const dashboardSectionClass = 'space-y-8';

const statsGridClass = 'grid gap-5 sm:grid-cols-2 xl:grid-cols-4';

export function SuperAdminDashboard() {
  return (
    <div className={dashboardSectionClass}>
      <PageHeader
        badge="Platform"
        title="Platform Overview"
        description="Monitor institutions, users, courses, and revenue across the platform."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Institutions" value="128" icon={Building2} accent="blue" trend={{ value: '+12%', positive: true }} />
        <StatCard label="Total Users" value="24,560" icon={Users} accent="violet" trend={{ value: '+8%', positive: true }} />
        <StatCard label="Total Courses" value="1,942" icon={BookOpen} accent="emerald" trend={{ value: '+5%', positive: true }} />
        <StatCard label="Revenue" value="$842K" icon={DollarSign} accent="amber" trend={{ value: '+18%', positive: true }} />
        <StatCard label="Pending Institutions" value="7" icon={TrendingUp} accent="blue" description="Awaiting approval" />
      </div>
    </div>
  );
}

export function InstitutionAdminDashboard() {
  return (
    <div className={dashboardSectionClass}>
      <PageHeader
        badge="Institution"
        title="Institution Dashboard"
        description="Track learners, lecturers, courses, and enrollments for your institution."
      />
      <div className={statsGridClass}>
        <StatCard label="Students" value="3,420" icon={Users} accent="blue" />
        <StatCard label="Lecturers" value="86" icon={GraduationCap} accent="violet" />
        <StatCard label="Courses" value="142" icon={BookOpen} accent="emerald" />
        <StatCard label="Enrollments" value="5,918" icon={ClipboardCheck} accent="amber" />
      </div>
    </div>
  );
}

export function LecturerDashboard() {
  return (
    <div className={dashboardSectionClass}>
      <PageHeader
        badge="Teaching"
        title="Teaching Dashboard"
        description="Manage your courses, students, and pending assignments."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="My Courses" value="6" icon={BookOpen} accent="blue" />
        <StatCard label="My Students" value="248" icon={Users} accent="violet" />
        <StatCard label="Pending Assignments" value="19" icon={Layers} accent="amber" description="Need review" />
      </div>
    </div>
  );
}

export function LearnerDashboard() {
  return (
    <div className={dashboardSectionClass}>
      <PageHeader
        badge="Learner"
        title="My Learning"
        description="Track your progress, courses, and achievements."
      />
      <div className={statsGridClass}>
        <StatCard label="Active Courses" value="4" icon={BookOpen} accent="blue" />
        <StatCard label="Completed Courses" value="12" icon={Award} accent="emerald" />
        <StatCard label="Certificates" value="8" icon={Award} accent="violet" />
        <StatCard label="Progress" value="72%" icon={TrendingUp} accent="amber" description="Overall completion" />
      </div>
    </div>
  );
}

export function DataManagerDashboard() {
  return (
    <div className={dashboardSectionClass}>
      <PageHeader
        badge="Data"
        title="Data Operations"
        description="Monitor student records, enrollments, and reporting data."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Students" value="3,420" icon={Users} accent="blue" />
        <StatCard label="Enrollments" value="5,918" icon={ClipboardCheck} accent="emerald" />
        <StatCard label="Reports" value="24" icon={BarChart3} accent="violet" description="Generated this month" />
      </div>
    </div>
  );
}

export function ContentReviewerDashboard() {
  return (
    <div className={dashboardSectionClass}>
      <PageHeader
        badge="Review"
        title="Content Review"
        description="Review courses and approve submitted learning content."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Course Reviews" value="14" icon={BookOpen} accent="blue" description="Pending review" />
        <StatCard label="Content Approval" value="9" icon={Layers} accent="amber" description="Awaiting decision" />
        <StatCard label="Reports" value="6" icon={BarChart3} accent="violet" />
      </div>
    </div>
  );
}

export function SupportAgentDashboard() {
  return (
    <div className={dashboardSectionClass}>
      <PageHeader
        badge="Support"
        title="Support Center"
        description="Manage support tickets and assist platform users."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Open Tickets" value="23" icon={Ticket} accent="amber" />
        <StatCard label="Users Assisted" value="118" icon={Users} accent="blue" description="This week" />
        <StatCard label="Reports" value="4" icon={BarChart3} accent="violet" />
      </div>
    </div>
  );
}
