export default function ProfilingInsight({ profile }) {
  if (!profile) {
    return <p className="text-gray-400">No profiling data available.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Outliers */}
      <div className="bg-white p-4 border rounded shadow text-gray-900">
        <h3 className="font-semibold mb-2">Outliers</h3>
        <pre className="text-sm bg-blue-100 p-2 rounded">{JSON.stringify(profile.outliers, null, 2)}</pre>
      </div>

      {/* Skewness */}
      <div className="bg-white p-4 border rounded shadow text-gray-900">
        <h3 className="font-semibold mb-2">Skewness</h3>
        <pre className="text-sm bg-orange-100 p-2 rounded">{JSON.stringify(profile.skewness, null, 2)}</pre>
      </div>

      {/* Correlations */}
      <div className="bg-white p-4 border rounded shadow text-gray-900">
        <h3 className="font-semibold mb-2">Correlations</h3>
        <pre className="text-sm bg-purple-100 p-2 rounded">{JSON.stringify(profile.correlation, null, 2)}</pre>
      </div>

      {/* Imbalance */}
      <div className="bg-white p-4 border rounded shadow text-gray-900">
        <h3 className="font-semibold mb-2">Imbalance</h3>
        <pre className="text-sm bg-blue-100 p-2 rounded">{JSON.stringify(profile.imbalance, null, 2)}</pre>
      </div>

      {/* Leakage */}
      {profile.leakage && (
        <div className="col-span-2 bg-red-100 text-red-800 p-4 rounded border border-red-400">
          ⚠️ Feature <strong>{profile.leakage.feature}</strong> is {profile.leakage.strength}% correlated with target <strong>{profile.leakage.target}</strong>
        </div>
      )}
    </div>
  );
}
