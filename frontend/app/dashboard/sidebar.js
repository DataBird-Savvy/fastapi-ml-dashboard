export default function Sidebar({ onSelectView }) {
  return (
    <aside className="w-64 bg-gray-800 p-6 space-y-4">
      <h2 className="text-xl font-bold text-white">Mini AI Analyst</h2>
      <nav className="space-y-2">
        <button
          onClick={() => onSelectView('schema')}
          className="block text-left w-full text-gray-300 hover:text-white"
        >
          Schema
        </button>
        <button
          onClick={() => onSelectView('insights')}
          className="block text-left w-full text-gray-300 hover:text-white"
        >
          Profiling Insights
        </button>
        <button
          onClick={() => onSelectView('train')}
          className="block text-left w-full text-gray-300 hover:text-white"
        >
          Train Model
        </button>
      </nav>
    </aside>
  );
}
