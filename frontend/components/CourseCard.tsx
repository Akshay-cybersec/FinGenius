// components/CourseCard.tsx
interface CourseProps {
  title: string;
  lessons: number;
  rating: number;
  color: string;
}

export default function CourseCard({ title, lessons, rating, color }: CourseProps) {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-5 shadow-xl border border-white/50 hover:shadow-2xl transition-all group">
      <div className={`w-full h-40 rounded-2xl mb-4 bg-gradient-to-tr ${color} flex items-center justify-center`}>
        <span className="text-white text-xs opacity-50">Course Preview Image</span>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">✅ {lessons} Lessons</span>
        <span className="flex items-center gap-1 text-yellow-600">⭐ {rating}</span>
      </div>
      <button className={`w-full py-3 rounded-xl font-bold text-white transition-all bg-gradient-to-r ${color} hover:brightness-110 active:scale-95`}>
        Enroll Now &gt;
      </button>
    </div>
  );
}