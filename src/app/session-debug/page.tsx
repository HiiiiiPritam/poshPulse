"use client";

import { useSession } from "next-auth/react";

export default function SessionDebugPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Session Debugger</h1>
      <p className="mb-4">Status: {status}</p>
      <pre className="bg-gray-100 p-4 rounded border overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
      <div className="mt-6">
        <h2 className="text-xl font-bold">Troubleshooting</h2>
        <ul className="list-disc ml-6 mt-2">
          <li>If <strong>role</strong> is missing or not 'admin', check your database.</li>
          <li>If <strong>session</strong> is null, check <code>NEXTAUTH_URL</code> and <code>AUTH_SECRET</code> in Vercel.</li>
        </ul>
      </div>
    </div>
  );
}
