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
      const res = await fetch(`http://localhost:8000/train?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Training failed: ${res.status}`);
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
        {training ? 'Training...' : '🧠 Train AutoML Classification'}
      </button>

      {error && <p className="text-red-400 mt-2">{error}</p>}

      {result && (
        <div className="mt-4 bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold text-white">📈 Training Result</h3>
          <pre className="text-green-300 whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
