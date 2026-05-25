import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/axios";
import {
  Bell,
  Calendar,
  Clock,
  FileText,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { IAssignment } from "@/types/assignment";

const StudentCourseHome = ({ courseId }: { courseId?: string }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAssignment, setSelectedAssignment] = useState<IAssignment | null>(null);

  // Course information
  const courseInfo = {
    title: "Academic Writing & Communication",
    code: "ENG 201",
    instructor: "Dr. Sarah Johnson",
    semester: "Summer 2025",
    credits: 3,
    location: "Room 204, Arts Building",
    schedule: "MWF 10:00-11:00 AM",
  };

  // Current assignment (featured)
  const currentAssignment: IAssignment = {
    id: "podcast-1",
    title: "Create Your First Podcast! - Formative Assignment",
    dueDate: "Jun 29 by 11:59pm",
    availableAfter: "after Jun 6 at 12am",
    points: 20,
    submissionType:
      "text entry box, website url, media recording, or file upload",
    attempts: 0,
    allowedAttempts: 2,
    status: "not-submitted",
    grade: "16 (20 pts possible)",
    gradedAnonymously: true,
    introduction:
      "You have been introduced to the power of understanding your audience and how impactful it can be to storytelling. You also understand how your message can be more powerful if you choose the right voice to match your audience. Whether you are interested in solving the unemployment problem in your society, promoting quality education, or creating a tech solution, you must have a message. Let's see how you craft an impactful message to your audience!",
    instructions: [
      {
        step: "Step 1: Form Your Team",
        content:
          "Form a group of your choice composed of 3 to 4 of your classmates. It would be great if you included someone who is not from the same country as you. If you're not in the same location, you may record your session online via Zoom, Google Meet, or any other platform.",
      },
      {
        step: "Step 2: Choose a Topic",
        content:
          "Select a pressing issue affecting an African community or an opportunity that the African continent/country can leverage (e.g., youth unemployment, gender-based violence, food insecurity, waste management, mental health stigma, women empowerment, natural resources management, wildlife conservation etc.). Ensure the topic allows for multiple perspectives and storytelling.",
      },
      {
        step: "Step 3: Get Topic Approval",
        content:
          "Submit a three-sentence topic proposal using this link (to be reviewed by your learning coach). Ensure to include the reason why you have picked that topic. After submitting, reach out to your learning coach for approval. Make sure you have the approval before moving forward.",
      },
      {
        step: "Step 4: Plan and Record Your Podcast!",
        content:
          "Create a plot map or outline of your podcast using different plot mapping techniques that you have learned during this topic. In your podcast, discuss your opinions around the topic that you have selected.",
      },
    ],
    detailedInstructions:
      "Create a plot map or outline of your podcast using different plot mapping techniques that you have learned during this topic. In your podcast, discuss your opinions around the topic that you have selected.",
    viewRubric: true,
    submissionDetails: "Submission Details",
    comments:
      "First of all, thank you for attempting to do this podcast. While I didn't expect the approach you used, I liked the introduction. I think it was good at drawing attention. Good potential, kudos.",
  };

  const [recentAssignments, setRecentAssignments] = useState<IAssignment[]>([
    {
      id: "1",
      title: "Academic Writing Essay - Topic Analysis",
      dueDate: "Jul 28 by 11:59pm",
      availableAfter: "after Jul 1 at 12am",
      status: "in-progress",
      points: 100,
      type: "essay",
      submissionType: "file upload",
      attempts: 0,
      allowedAttempts: 1,
      grade: "Not graded yet",
      gradedAnonymously: false,
      introduction:
        "Write a 1000-word essay analyzing the key components of academic writing style and structure.",
      instructions: [
        {
          step: "Step 1: Choose Your Paper",
          content:
            "Select one academic paper from the provided list for analysis.",
        },
        {
          step: "Step 2: Analyze Structure",
          content:
            "Examine the paper's organization, argumentation, and writing style.",
        },
        {
          step: "Step 3: Write Your Analysis",
          content:
            "Create a comprehensive analysis with proper citations and references.",
        },
      ],
      detailedInstructions:
        "Your essay should demonstrate understanding of academic writing conventions and provide specific examples from your chosen paper.",
      comments: "",
    },
    {
      id: "2",
      title: "Quiz 2: Argumentative Writing Techniques",
      dueDate: "Jul 25 by 11:59am",
      availableAfter: "after Jul 20 at 12am",
      status: "graded",
      points: 50,
      earnedPoints: 43,
      type: "quiz",
      submissionType: "online quiz",
      attempts: 1,
      allowedAttempts: 2,
      grade: "43 (50 pts possible)",
      gradedAnonymously: false,
      introduction:
        "This quiz covers chapters 3-4 on argumentative writing techniques and strategies.",
      instructions: [
        {
          step: "Quiz Instructions",
          content:
            "Answer all multiple choice and short answer questions. You have 60 minutes to complete.",
        },
      ],
      detailedInstructions:
        "Review your notes on argumentative writing before starting. Pay attention to thesis statements and evidence presentation.",
      comments:
        "Good work overall. Pay attention to question 7 about counterarguments.",
    },
    {
      id: "3",
      title: "Discussion Forum: Voice and Audience",
      dueDate: "Jul 30 by 11:59pm",
      availableAfter: "after Jul 25 at 12am",
      status: "submitted",
      points: 25,
      type: "discussion",
      submissionType: "text entry",
      attempts: 1,
      allowedAttempts: 1,
      grade: "Pending review",
      gradedAnonymously: false,
      introduction:
        "Participate in the discussion about adapting voice for different audiences.",
      instructions: [
        {
          step: "Discussion Requirements",
          content:
            "Post your initial response (200 words) and reply to at least 2 classmates (100 words each).",
        },
      ],
      detailedInstructions:
        "Consider how voice changes when writing for academic vs. general audiences. Provide specific examples.",
      comments: "",
    },
  ]);

  // Start with no featured assignment when using real API
  useEffect(() => {
    setSelectedAssignment(null);
  }, [courseId]);

  useEffect(() => {
    const loadAssignments = async () => {
      if (!courseId) return;
      try {
        const res = await axios.get(`${API_URL}/api/assignments/course/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const list = res?.data?.assignments || [];
        const mapped: IAssignment[] = list.map((a: any) => ({
          id: a._id,
          title: a.title,
          dueDate: a.dueDate,
          availableAfter: a.availableAfter || '',
          status: a.status || 'not-started',
          points: a.points || 0,
          type: a.type || 'assignment',
          submissionType: a.submissionType || 'file upload',
          attempts: 0,
          allowedAttempts: 1,
          grade: '',
          gradedAnonymously: false,
          introduction: a.description || '',
          instructions: [],
          detailedInstructions: '',
          comments: '',
        }));
        setRecentAssignments(mapped);
      } catch {}
    };
    loadAssignments();
  }, [courseId]);

  // Announcements
  const announcements = [
    {
      id: 1,
      title: "Podcast Assignment Guidelines Updated",
      date: "July 22, 2025",
      content:
        "Please review the updated rubric for the podcast assignment. Focus on topic selection and approval process.",
      urgent: true,
    },
    {
      id: 2,
      title: "Office Hours This Week",
      date: "July 21, 2025",
      content:
        "I'll be available for extra office hours Tuesday 2-4 PM to help with podcast topics.",
      urgent: false,
    },
  ];

  // Upcoming deadlines
  const upcomingDeadlines = [
    { title: "Quiz 3: Research Methods", date: "Jul 26", type: "quiz" },
    { title: "Podcast Assignment", date: "Jul 29", type: "project" },
    { title: "Discussion: Peer Review", date: "Aug 1", type: "discussion" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not-started":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "in-progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "submitted":
        return "text-green-600 bg-green-50 border-green-200";
      case "graded":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not-started":
        return "Not Started";
      case "in-progress":
        return "In Progress";
      case "submitted":
        return "Submitted";
      case "graded":
        return "Graded";
      case "overdue":
        return "Overdue";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Assignment Detail Component
  const AssignmentDetail = ({ assignment }: { assignment: IAssignment }) => (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white">
        {/* Assignment Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-900 mb-4">
              {assignment.title}
            </h1>
            <div className="flex items-center space-x-6 text-sm text-gray-700">
              <div>
                <span className="font-medium">Due</span> {assignment.dueDate}
              </div>
              <div>
                <span className="font-medium">Points</span> {assignment.points}
              </div>
              <div>
                <span className="font-medium">Submitting</span> {assignment.submissionType}
              </div>
              <div>
                <span className="font-medium">Attempts</span> {assignment.attempts}
              </div>
              <div>
                <span className="font-medium">Allowed Attempts</span> {assignment.allowedAttempts}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-800 text-white px-4 py-2 text-sm font-medium hover:bg-blue-900">
              Start Assignment
            </button>
            <button
              onClick={() => setSelectedAssignment(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Introduction */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {assignment.introduction}
                </p>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Instructions:
                </h2>
                <div className="space-y-6">
                  {assignment.instructions?.map((instruction, index) => (
                    <div key={index}>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm">
                        {instruction.step}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {instruction.content}
                      </p>
                      {instruction.step.includes("Step 3") && (
                        <p className="text-blue-600 text-sm mt-2">
                          Submit a three-sentence topic proposal using{" "}
                          <a href="#" className="text-blue-600 underline">
                            this link
                          </a>{" "}
                          (to be reviewed by your learning coach). Ensure to include
                          the reason why you have picked that topic. After
                          submitting, reach out to your learning coach for approval.
                          Make sure you have the approval before moving forward.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Instructions */}
              {assignment.detailedInstructions && (
                <div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Create a plot map or outline of your podcast using different plot mapping techniques that you have learned during this topic. In your podcast, discuss your opinions around the topic that you have selected.
                  </p>
                </div>
              )}

              {/* Comments Section */}
              {assignment.comments && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Comments:
                  </h3>
                  <div className="bg-gray-50 p-4 text-sm">
                    <p className="text-gray-700">{assignment.comments}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Submission Status */}
              <div>
                <h3 className="text-sm font-bold text-red-600 mb-2">Submission</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-red-600">
                    Not Submitted!
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Available</span> {assignment.availableAfter}
                  </div>
                  <div>
                    <span className="font-medium">Grade:</span> {assignment.grade}
                  </div>
                  <div>
                    <span className="font-medium">Graded Anonymously:</span> {assignment.gradedAnonymously ? "yes" : "no"}
                  </div>
                </div>
                {assignment.viewRubric && (
                  <div className="mt-3">
                    <a href="#" className="text-blue-600 text-sm underline">
                      View Rubric Evaluation
                    </a>
                  </div>
                )}
              </div>

              {/* Submission Details */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Submission Details</h3>
                <div className="text-sm text-gray-600">
                  <p>Available after Jun 6 at 12am</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {courseInfo.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {courseInfo.code} • {courseInfo.semester} •{" "}
                  {courseInfo.credits} Credits
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right text-sm text-gray-600">
                  <p>{courseInfo.instructor}</p>
                  <p>{courseInfo.schedule}</p>
                </div>
                <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "overview", label: "Overview", icon: BookOpen },
                { key: "assignments", label: "Assignments", icon: FileText },
                { key: "grades", label: "Grades", icon: Award },
                { key: "discussions", label: "Discussions", icon: Users },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Show assignment detail if one is selected */}
        {selectedAssignment ? (
          <AssignmentDetail assignment={selectedAssignment} />
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Current Assignment Spotlight */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Current Assignment
                        </h2>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                          Due Soon
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {currentAssignment.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Due:</span>
                          <div className="font-medium text-red-600">
                            {currentAssignment.dueDate}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Points:</span>
                          <div className="font-medium">
                            {currentAssignment.points} pts
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Available:</span>
                          <div className="font-medium">
                            {currentAssignment.availableAfter}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Attempts:</span>
                          <div className="font-medium">
                            {currentAssignment.attempts}/
                            {currentAssignment.allowedAttempts}
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="text-gray-500 text-sm">Submission:</span>
                        <div className="text-sm text-gray-700">
                          {currentAssignment.submissionType}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border font-medium">
                            Not Submitted
                          </span>
                          {currentAssignment.gradedAnonymously && (
                            <span className="text-xs text-gray-500">
                              Graded Anonymously
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedAssignment(currentAssignment)}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                        >
                          Start Assignment
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Assignments */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Recent Assignments
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {recentAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="p-6 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedAssignment(assignment)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">
                              {assignment.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded border font-medium ${getStatusColor(
                                assignment.status
                              )}`}
                            >
                              {getStatusLabel(assignment.status)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Due: {formatDate(assignment.dueDate)}</span>
                            <span>
                              {assignment.status === "graded" &&
                              assignment.earnedPoints !== undefined
                                ? `${assignment.earnedPoints}/${assignment.points} pts`
                                : `${assignment.points} pts`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Announcements */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Announcements
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="p-6">
                          <div className="flex items-start space-x-3">
                            {announcement.urgent ? (
                              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            ) : (
                              <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">
                                  {announcement.title}
                                </h3>
                                <span className="text-sm text-gray-500">
                                  {announcement.date}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {announcement.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Grade</span>
                        <span className="font-semibold text-green-600">
                          B+ (87%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Assignments Completed
                        </span>
                        <span className="font-semibold">8/12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Attendance</span>
                        <span className="font-semibold text-green-600">95%</span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Upcoming Deadlines
                    </h3>
                    <div className="space-y-3">
                      {upcomingDeadlines.map((deadline, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {deadline.title}
                            </p>
                            <p className="text-sm text-gray-500">{deadline.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Course Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500">Instructor:</span>
                        <div className="font-medium">{courseInfo.instructor}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <div className="font-medium">{courseInfo.location}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Schedule:</span>
                        <div className="font-medium">{courseInfo.schedule}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded text-sm font-medium hover:bg-gray-200">
                        View Syllabus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "assignments" && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Assignments
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    View your assignments in the dedicated assignments section.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "grades" && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <h2 className="text-lg font-semibold text-gray-900">Grades</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    Your grade breakdown and detailed feedback will appear here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "discussions" && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Discussions
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    Participate in course discussions and forums here.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentCourseHome;