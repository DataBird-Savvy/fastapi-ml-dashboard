'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParsedSchema from './ParsedSchema';
import ProfilingInsight from './ProfilingInsight';
import TrainModel from './TrainModel';

export default function FileUpload({ selectedView }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(null); // null: checking, false: not auth, true: auth

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthenticated(false);
      router.push('/login');
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('📁 File selected:', selectedFile?.name);
    setFile(selectedFile);
    setSuccess(false);
    setProfile(null);
    setError('');
  };

  const handleUpload = async () => {
    setError('');
    if (!file) {
      setError('❗ Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('🔒 No token found');

      console.log('📤 Uploading file...');
      const uploadRes = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

      const uploadData = await uploadRes.json();
      const session_id = uploadData.session_id;
      setSessionId(session_id);
      console.log('🆔 Session ID received:', session_id);

      console.log('📊 Fetching profile insights...');
      const profileRes = await fetch(`http://localhost:8000/profile?session_id=${session_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);

      const profileData = await profileRes.json();
      setProfile(profileData.profile);
      console.log('✅ Profile Data Set:', profileData.profile);

      setSuccess(true);
    } catch (err) {
      console.error('❌ Upload or profiling failed:', err);
      setError('Upload or profiling failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking auth
  if (authenticated === null) return null;

  return (
    <div className="bg-gray-800 p-6 rounded shadow-md text-white w-full max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="text-white"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-4 py-2 rounded font-semibold ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {success && (
        <p className="text-green-400">
          ✅ Upload successful! Now select "Schema", "Insights", or "Train" from the sidebar.
        </p>
      )}

      {profile && (
        <div className="space-y-8">
          {selectedView === 'schema' && profile?.parsed_schema && (
            <ParsedSchema schema={profile.parsed_schema} />
          )}
          {selectedView === 'insights' && (
            <ProfilingInsight profile={profile} />
          )}
          {selectedView === 'train' && (
            <TrainModel sessionId={sessionId} token={localStorage.getItem('token')} />
          )}
        </div>
      )}
    </div>
  );
}
