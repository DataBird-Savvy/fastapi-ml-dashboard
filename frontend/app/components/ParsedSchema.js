export default function ParsedSchema({ schema }) {
  if (!schema || schema.length === 0) {
    return <p className="text-gray-400">No schema available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Parsed Schema</h2>
      <table className="min-w-full border border-gray-700 text-sm text-left">
        <thead className="bg-gray-700 text-gray-200">
          <tr>
            <th className="px-4 py-2 border-b border-gray-600">Column</th>
            <th className="px-4 py-2 border-b border-gray-600">Type</th>
            <th className="px-4 py-2 border-b border-gray-600">Null %</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((col, idx) => (
            <tr key={idx} className="border-t border-gray-700 hover:bg-gray-800">
              <td className="px-4 py-2">{col.column}</td>
              <td className="px-4 py-2 capitalize">{col.dtype}</td>
              <td className="px-4 py-2">{col.null_percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
