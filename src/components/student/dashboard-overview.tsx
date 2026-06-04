"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Award, BookMarked, X, Search, Bell, Calendar, CheckCircle, AlertCircle, MessageSquare, Megaphone, Target, PlayCircle, FileText, Users, TrendingUp, Star } from "lucide-react";

import { useEffect, useState } from "react";
import { IEnrollment } from "@/types/education";
import { useEducation } from "@/context/educationContext";
import { useRouter } from "next/navigation";
import { getStudentDashboard, getStudentNotifications, getStudentCalendar } from "@/lib/api/student";

export function DashboardOverview() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [dashboard, setDashboard] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { institution, fetchInstitution, setSelectedInstitution, fetchCourseByInstitution } =
    useEducation();
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [calendarItems, setCalendarItems] = useState<any[]>([]);

  const fetchDashboard = async () => {
    try {
      const data = await getStudentDashboard();
      if (data && Array.isArray(data)) {
        setDashboard(data);
      } else if (data?.enrollments && Array.isArray(data.enrollments)) {
        setDashboard(data.enrollments);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      setError("Error fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [notif, cal] = await Promise.all([
        getStudentNotifications().catch(() => []),
        getStudentCalendar().catch(() => []),
      ]);
      setNotifications(Array.isArray(notif) ? notif : []);
      setCalendarItems(Array.isArray(cal) ? cal : []);
    } catch {}
  };

  useEffect(() => {
    fetchDashboard();
    fetchAuxiliaryData();
  }, []);

  useEffect(() => {
    fetchInstitution();
  }, []);

  const handleClickInstitution = async (insId: string) => {
    const selected = institution.find(i => i._id === insId) ?? null;
    setSelectedInstitution(selected);
    if (selected) {
      await fetchCourseByInstitution(insId);
    }
  };

  const handleCourseClick = (courseId: string | undefined) => {
    if (courseId) {
      router.push(`/student/courses/${courseId}`);
    }
  };

  const getDaysUntilDeadline = (dueDate: string) => {
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high': return 'bg-accent/20 text-accent border-accent/30';
      case 'medium': return 'bg-accent/20 text-accent border-accent/30';
      case 'low': return 'bg-primary-muted text-primary-hover border-primary-muted';
      default: return 'bg-muted text-foreground-muted border-border';
    }
  };

  // Loading state handling
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-subtle via-background to-primary-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary-muted border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <p className="text-primary font-semibold text-lg">Loading your dashboard...</p>
            <p className="text-primary-light text-sm">Preparing your learning experience</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state handling
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-subtle via-background to-primary-muted flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl border border-destructive/30 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">
            Oops! Something went wrong
          </h3>
          <p className="text-destructive mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-panel-foreground px-8 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-subtle via-background to-primary-muted">
      <div className="max-w-7xl mx-auto p-2 lg:p-4">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="relative">
            <div className="relative p-8 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-primary mb-3">
                    Welcome back, Learner! 🚀
                  </h1>
                  <p className="text-muted-foreground text-xs">
                    Ready to continue your learning journey? Let{"'"}s make today count!
                  </p>
                </div>
                <div className="mt-6 lg:mt-0">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Last login: Today at 9:32 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-primary-light to-primary text-panel-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Enrolled Courses
                </CardTitle>
                <div className="p-2 bg-background/20 rounded-lg backdrop-blur-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {dashboard.length}
                </div>
                <p className="text-xs opacity-75">Total courses</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent to-destructive text-panel-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  In Progress
                </CardTitle>
                <div className="p-2 bg-background/20 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {dashboard ? dashboard.filter((dash) => dash.status === "active").length : 0}
                </div>
                <p className="text-xs opacity-75">Active learning</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/100 to-success/100 text-panel-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Completed
                </CardTitle>
                <div className="p-2 bg-background/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {dashboard ? dashboard.filter((dash) => dash.status === "completed").length : 0}
                </div>
                <p className="text-xs opacity-75">Finished courses</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary to-primary-muted text-panel-foreground border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Certificates
                </CardTitle>
                <div className="p-2 bg-background/20 rounded-lg backdrop-blur-sm">
                  <Award className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {dashboard ? dashboard.filter((dash) => dash.status === "completed").length : 0}
                </div>
                <p className="text-xs opacity-75">Earned certificates</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Course Progress */}
            <div className="lg:col-span-8 space-y-8">
              {/* Announcements Section */}
              <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-primary-light to-secondary rounded-lg">
                        <Bell className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground">
                        Latest Updates
                      </CardTitle>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {notifications.filter(a => !a.read).length} new
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((announcement: any) => (
                      <div
                        key={announcement.id}
                        className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                          !announcement.read 
                            ? 'bg-primary-subtle border-primary-muted hover:bg-primary-muted' 
                            : 'bg-surface border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg ${
                            announcement.type === 'message' ? 'bg-success/20' :
                            announcement.type === 'update' ? 'bg-primary-muted' : 'bg-secondary/20'
                          }`}>
                            {announcement.type === 'message' && <MessageSquare className="h-4 w-4 text-success" />}
                            {announcement.type === 'update' && <Star className="h-4 w-4 text-primary" />}
                            {announcement.type === 'announcement' && <Megaphone className="h-4 w-4 text-secondary" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-foreground">{announcement.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                                {announcement.priority}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">{announcement.content}</p>
                            <span className="text-xs text-muted-foreground">{announcement.time || ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Progress Section */}
              <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-success/100 to-primary-light rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      Your Learning Progress
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboard && dashboard.length > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-success/10 to-success/10 border border-success/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-success/20 rounded-lg">
                          <Target className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-success font-semibold">
                            Amazing! You{"'"}re enrolled in {dashboard.length} course{dashboard.length > 1 ? "s" : ""}
                          </p>
                          <p className="text-success text-sm">Keep up the excellent work! 🎯</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {dashboard && dashboard.length > 0 ? (
                      dashboard.map((dash) => (
                        <div
                          key={dash.course_id?._id}
                          onClick={() => handleCourseClick(dash.course_id?._id)}
                          className="cursor-pointer group"
                        >
                          <Card className="bg-background border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                  {dash.course_id?.title}
                                </CardTitle>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                                    dash.status === "completed"
                                      ? "bg-success/20 text-success border border-success/30"
                                      : "bg-primary-muted text-primary-hover border border-primary-muted"
                                  }`}>
                                  {dash.status.charAt(0).toUpperCase() + dash.status.slice(1)}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-muted-foreground">Progress</span>
                                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    {dash.progress_percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-primary-light via-secondary to-accent rounded-full transition-all duration-1000 ease-out shadow-md"
                                    style={{
                                      width: `${Math.min(100, Math.max(0, dash.progress_percentage || 0))}%`,
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <BookOpen className="w-3 h-3" />
                                    <span>{dash.completedLessons}/{dash.totalLessons} lessons</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(dash.lastAccessed).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))
                    ) : (
                      <Card className="bg-background border-0 shadow-lg col-span-2">
                        <CardContent className="p-8 text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-primary-muted to-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            Ready to Start Learning?
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Discover amazing courses and begin your educational journey today!
                          </p>
                          <button className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-panel-foreground px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                            Browse Courses
                          </button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Deadlines & Institutions */}
            <div className="lg:col-span-4 space-y-8">
              {/* Upcoming Deadlines */}
              <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-destructive to-accent rounded-lg">
                      <Calendar className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      Upcoming Deadlines
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calendarItems.map((deadline: any) => {
                      const daysLeft = getDaysUntilDeadline(deadline.dueDate || deadline.due_date);
                      return (
                        <div
                          key={deadline.id}
                          className="p-4 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1.5 rounded-lg ${
                                deadline.type === 'quiz' ? 'bg-primary-muted' :
                                deadline.type === 'assignment' ? 'bg-success/20' : 'bg-secondary/20'
                              }`}>
                                {deadline.type === 'quiz' && <PlayCircle className="h-3 w-3 text-primary" />}
                                {deadline.type === 'assignment' && <FileText className="h-3 w-3 text-success" />}
                                {deadline.type === 'task' && <CheckCircle className="h-3 w-3 text-secondary" />}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                                {daysLeft === 0 ? 'Due Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              deadline.status === 'pending' ? 'bg-muted text-muted-foreground' : 'bg-accent/20 text-accent'
                            }`}>
                              {deadline.status}
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground mb-1">{deadline.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{deadline.course || ''}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <span>Due: {new Date(deadline.dueDate || deadline.due_date).toLocaleDateString()}</span>
                            <span>{deadline.dueTime || ''}</span>
                          </div>
                          <button className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                            deadline.type === 'quiz' 
                              ? 'bg-primary hover:bg-primary-hover text-primary-foreground' 
                              : deadline.type === 'assignment'
                              ? 'bg-success hover:bg-success text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary-hover text-primary-foreground'
                          }`}>
                            {deadline.type === 'quiz' ? 'Start Quiz' : 
                             deadline.type === 'assignment' ? 'Submit Assignment' : 
                             'Complete Task'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
