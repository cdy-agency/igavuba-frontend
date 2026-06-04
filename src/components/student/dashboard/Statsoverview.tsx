import { BookOpen, CheckCircle, Award, Users } from "lucide-react";
import { IEnrollment } from "@/types/education";

interface StatsOverviewProps {
  enrollments: IEnrollment[];
  stats: any;
}

export default function StatsOverview({ enrollments, stats }: StatsOverviewProps) {
  const statsData = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Course in Progress",
      value: enrollments.filter(e => e.status === "active").length,
      color: "bg-accent/10 text-accent border-accent/30",
      iconBg: "bg-accent/20"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      label: "Course Completed",
      value: enrollments.filter(e => e.status === "completed").length,
      color: "bg-success/10 text-success border-success/30",
      iconBg: "bg-success/20"
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: "Certificates Earned",
      value: stats?.totalAssignments || 0,
      color: "bg-primary-subtle text-primary border-primary-muted",
      iconBg: "bg-primary-muted"
    },
  ];

  return (
    <div className="bg-background p-2 border-b border-border">
      <h2 className="text-xl font-bold text-foreground mb-4">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div key={index} className={`p-4 rounded`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`rounded flex items-start gap-5`}>
                <p className={`${stat.iconBg} p-1 rounded`}> {stat.icon}</p>
                <p className="text-sm font-medium opacity-80">{stat.label}</p> 
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}