import {
  CheckCheck,
  ChevronDown,
  ChevronUp,
  LucideUnlockKeyhole,
  Calendar,
  Bell,
  Users,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import React, { useState } from "react";

// Define types
type Page = {
  id: string;
  title: string;
  content: string;
};

type Chapter = {
  id: string;
  title: string;
  pages: Page[];
  status: string;
};

type Course = {
  title: string;
};

type ToDoItem = {
  id: string;
  title: string;
  type: string;
  course: string;
  points: number;
  dueDate: string;
  status: "pending" | "completed";
};

type CourseGroup = {
  id: string;
  name: string;
  members: number;
};

type FeedbackItem = {
  id: string;
  title: string;
  score: string;
  feedback: string;
  status: "completed" | "incomplete";
};

// Mock data
const MOCK_CHAPTERS: Chapter[] = [
  {
    id: "chapter1",
    title: "Introduction to the Course",
    pages: [
      { id: "page1", title: "Welcome", content: "Welcome to the course!" },
      {
        id: "page2",
        title: "Course Overview",
        content: "This is what you'll learn.",
      },
    ],
    status: "Completed",
  },
  {
    id: "chapter2",
    title: "Advanced Concepts",
    pages: [
      { id: "page3", title: "Deep Dive", content: "Let's go deeper." },
      { id: "page4", title: "Case Studies", content: "Real-world examples." },
    ],
    status: "Ongoing",
  },
];

const MOCK_TODO: ToDoItem[] = [
  {
    id: "1",
    title: "Term Paper Module Summative",
    type: "Assignment",
    course: "Communicating for Impact",
    points: 20,
    dueDate: "Jul 31 at 11:59pm",
    status: "pending",
  },
];

const MOCK_GROUPS: CourseGroup[] = [
  {
    id: "1",
    name: "C9 Group 11",
    members: 5,
  },
];

const MOCK_FEEDBACK: FeedbackItem[] = [
  {
    id: "1",
    title: "Create Your First Podcast: Formative Assignment",
    score: "16 out of 20",
    feedback:
      "First of all, thank you for attempting to do this podcast. While I didn't expect the approach you used, I liked the i...",
    status: "completed",
  },
  {
    id: "2",
    title: "Essay Outline: Formative Assignment",
    score: "Incomplete",
    feedback:
      "Hi Dushimimana, thank you for submitting your assignment. However, you did not follow the assignment instructions...",
    status: "incomplete",
  },
];

export default function CourseHome({ course }: { course: Course }) {
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(
    null
  );
  const [activePage, setActivePage] = useState<Page | null>(null);
  const [isOpen, setIsOpen] = useState<string | null>(null);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-2 h-screen overflow-y-auto">
          {/* Course Header */}
          <div className="bg-white border border-gray-200 mb-1">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-900">
                {course.title}
              </h1>
              <div className="flex items-center space-x-3">
                <button className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded bg-white hover:bg-gray-50">
                  Collapse All
                </button>
                <button className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded bg-white hover:bg-gray-50 flex items-center gap-2">
                  <Download size={14} />
                  Export Course Content
                </button>
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="space-y-0">
            {MOCK_CHAPTERS.map((chapter, index) => (
              <div
                key={chapter.id}
                className="bg-white border-l border-r border-b border-gray-200"
              >
                <button
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                  onClick={() =>
                    setExpandedChapterId(
                      expandedChapterId === chapter.id ? null : chapter.id
                    )
                  }
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      Topic {index + 1}: {chapter.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* <span className="text-xs text-gray-500">
                      Prerequisites: Communicating for Impact
                    </span> */}
                    <button
                      className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded bg-white hover:bg-gray-50"
                      onClick={() =>
                        setIsOpen(isOpen === chapter.id ? null : chapter.id)
                      }
                    >
                      <div className="flex gap-3 items-center">
                        <p
                          className={`${
                            chapter.status === "Completed"
                              ? "bg-green-300 p-1 text-xs"
                              : "bg-yellow-300 p-1 text-xs"
                          }`}
                        >
                          {chapter.status}
                        </p>
                        {isOpen === chapter.id ? (
                          <ChevronDown size={15} />
                        ) : (
                          <ChevronUp size={15} />
                        )}
                      </div>
                    </button>
                  </div>
                </button>

                {expandedChapterId === chapter.id && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="px-8 py-3 space-y-1">
                      {chapter.pages.map((page) => (
                        <button
                          key={page.id}
                          className={`block w-full text-left px-4 py-2 text-sm rounded hover:bg-blue-50 ${
                            activePage?.id === page.id
                              ? "bg-blue-100 text-blue-800 font-medium"
                              : "text-gray-700"
                          }`}
                          onClick={() => setActivePage(page)}
                        >
                          {page.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active Page Content */}
          {activePage && (
            <div className="mt-6 bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {activePage.title}
              </h2>
              <div className="text-gray-700">{activePage.content}</div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Course Actions */}
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
                <Eye size={16} />
                View Course Stream
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
                <Calendar size={16} />
                View Course Calendar
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
                <Bell size={16} />
                View Course Notifications
              </button>
            </div>

            {/* To Do Section */}
            <div>
              <h3 className="text-sm font-medium text-red-600 mb-3">To Do</h3>
              <div className="space-y-2">
                {MOCK_TODO.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 p-3 rounded bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          {item.title}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="text-sm">×</span>
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{item.course}</div>
                      <div>{item.points} points</div>
                      <div>{item.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Groups */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Course Groups
              </h3>
              <div className="space-y-2">
                {MOCK_GROUPS.map((group) => (
                  <div key={group.id} className="flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {group.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Feedback */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Recent Feedback
              </h3>
              <div className="space-y-3">
                {MOCK_FEEDBACK.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border-b border-gray-200 pb-3 last:border-b-0"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          feedback.status === "completed"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="text-sm text-blue-600 hover:underline cursor-pointer mb-1">
                          {feedback.title}
                        </div>
                        <div
                          className={`text-sm font-medium mb-2 ${
                            feedback.status === "completed"
                              ? "text-gray-900"
                              : "text-red-600"
                          }`}
                        >
                          {feedback.score}
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-3">
                          {feedback.feedback}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Course Progress
              </h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Completed Topics:</span>
                  <span>1/2</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Points:</span>
                  <span>36/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Assignments Due:</span>
                  <span className="text-red-600">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
