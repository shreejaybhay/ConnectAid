'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/debug/auth');
        const data = await response.json();
        setDebugInfo(data);
      } catch (error) {
        console.error('Error fetching debug info:', error);
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  if (loading) {
    return <div className="p-8">Loading debug information...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Information</h1>
      
      <div className="grid gap-6">
        {/* Client-side Session */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Client-side Session (useSession)</h2>
          <div className="bg-white p-3 rounded border">
            <pre className="text-sm overflow-auto">
              {JSON.stringify({ status, session }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Server-side Debug Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Server-side Debug Info</h2>
          <div className="bg-white p-3 rounded border">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>

        {/* Current URL and Environment */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Environment Info</h2>
          <div className="bg-white p-3 rounded border">
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
                cookies: typeof document !== 'undefined' ? document.cookie : 'N/A'
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
        <h3 className="font-semibold text-yellow-800">Instructions:</h3>
        <p className="text-yellow-700 mt-1">
          1. Try logging in and then visit this page<br/>
          2. Check if the session and token information match<br/>
          3. Verify that cookies are being set correctly<br/>
          4. Compare the results between development and production
        </p>
      </div>
    </div>
  );
}
