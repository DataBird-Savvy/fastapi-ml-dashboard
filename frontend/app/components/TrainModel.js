'use client';

import { useState } from 'react';

export default function TrainModel({ sessionId, token }) {
  const [training, setTraining] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTrain = async () => {
    if (!sessionId || !token) {
      alert('Missing session ID or token');
      return;
    }

    setTraining(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('http://localhost:8000/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`Training failed: ${res.status} ${errMsg}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('❌ Training error:', err);
      setError('Training failed. See console for details.');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="bg-gray-700 p-4 mt-6 rounded shadow-md text-white">
      <button
        onClick={handleTrain}
        disabled={training}
        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
      >
        {training ? 'Training...' : '🧠 Train AutoML Model'}
      </button>

      {error && <p className="text-red-400 mt-2">{error}</p>}

      {result && (
        <div className="mt-6 bg-gray-800 p-4 rounded shadow text-sm">
          <h2 className="text-xl font-semibold mb-2">📊 Training Summary</h2>

          <p><strong>📌 Model Type:</strong> {result.model_type}</p>
          <p><strong>🧾 Model File ID:</strong> 
            <code className="bg-gray-900 px-1 py-0.5 rounded ml-1">{result.model_file_id}</code>
          </p>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-green-300">✅ Metrics</h3>
            <ul className="list-disc ml-5 mt-1">
              {Object.entries(result.metrics).map(([key, value]) => (
                <li key={key}>{key}: {value.toFixed(4)}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-yellow-300">🔥 Feature Importances</h3>
            <ul className="list-disc ml-5 mt-1">
              {Object.entries(result.feature_importances)
                .sort((a, b) => b[1] - a[1])
                .map(([feature, importance]) => (
                  <li key={feature}>
                    {feature}: {importance.toFixed(4)}
                  </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
