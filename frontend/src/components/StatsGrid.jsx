export default function StatsGrid({ enrolled, completed, avgProgress }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
      <div className="bg-white border rounded-xl p-4 min-w-0">
        <p className="text-2xl font-bold truncate">{enrolled}</p>
        <p className="text-xs text-gray-500 uppercase truncate">Enrolled courses</p>
      </div>
      <div className="bg-white border rounded-xl p-4 min-w-0">
        <p className="text-2xl font-bold truncate">{completed}</p>
        <p className="text-xs text-gray-500 uppercase truncate">Completed</p>
      </div>
      <div className="bg-white border rounded-xl p-4 min-w-0 col-span-2 sm:col-span-1">
        <p className="text-2xl font-bold truncate">{avgProgress}%</p>
        <p className="text-xs text-gray-500 uppercase truncate">Avg. progress</p>
      </div>
    </div>
  );
}
