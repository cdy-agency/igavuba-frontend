import { Chapter, Page } from "@/types/page";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type CourseModuleProps = {
  chapters: Chapter[];
  onSelectPage: (page: Page) => void;
};


export default function CourseModule({ chapters = [], onSelectPage }: CourseModuleProps) {
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  console.log("Rendering CourseModule with chapters:", chapters);
  return (
    <div className="max-w-6xl mx-auto py-6">
      {chapters.map((chapter, index) => (
        <div key={chapter.id} className="border rounded mb-4 bg-white">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center space-x-3">
              <button onClick={() => setExpandedChapterId(expandedChapterId === chapter.id ? null : chapter.id)}>
                {expandedChapterId === chapter.id ? <ChevronDown /> : <ChevronRight />}
              </button>
              <span className="font-medium text-sm">Topic {index + 1}: {chapter.title}</span>
            </div>
          </div>
          {expandedChapterId === chapter.id && (
            <div className="px-8 py-2">
              {chapter.pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onSelectPage(page)}
                  className="block text-left w-full py-1 text-sm text-blue-700 hover:underline"
                >
                  {page.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
