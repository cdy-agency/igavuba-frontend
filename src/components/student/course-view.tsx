import { Page } from "@/types/page";

type CourseViewProps = {
  page: Page;
  chapterPages: Page[];
  onNavigate: (page: Page) => void;
  onClose: () => void;
};

export default function CourseView({
  page,
  chapterPages,
  onNavigate,
  onClose,
}: CourseViewProps) {
  const currentIndex = chapterPages.findIndex((p) => p.id === page.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < chapterPages.length - 1;

  return (
    <div className="max-w-4xl mx-auto bg-white px-6 py-8 mt-6 rounded shadow">
      <button onClick={onClose} className="mb-4 text-blue-600 text-sm hover:underline">
        ← Back to Course Modules
      </button>

      <h1 className="text-2xl font-bold">{page.title}</h1>
      <p className="text-gray-800 mt-4">{page.content}</p>

      {/* Resources */}
      {(page.resources ?? []).length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-lg">Resources</h2>
          <ul className="list-disc ml-6 mt-2">
            {page.resources?.map((res, idx) => (
              <li key={idx}>
                <a href={res.url} className="text-blue-600 hover:underline" target="_blank">
                  {res.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 border-t pt-4">
        <button
          onClick={() => hasPrevious && onNavigate(chapterPages[currentIndex - 1])}
          disabled={!hasPrevious}
          className="text-blue-600 disabled:text-gray-400"
        >
          ← Previous
        </button>

        <button
          onClick={() => hasNext && onNavigate(chapterPages[currentIndex + 1])}
          disabled={!hasNext}
          className="text-blue-600 disabled:text-gray-400"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
