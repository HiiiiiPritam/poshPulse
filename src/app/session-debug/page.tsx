import { auth } from "@/auth";
import { headers, cookies } from "next/headers";

export default async function SessionDebugPage() {
  const session = await auth();
  const headersList = await headers();
  const cookiesList = await cookies();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Session Debugger v2 (Server Side)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Current Session Data:</h2>
          {session ? (
            <pre className="bg-green-100 p-4 rounded border overflow-auto mt-2 text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          ) : (
            <p className="bg-red-100 p-4 rounded border text-red-600 font-bold mt-2">
              No Session Found (Not Logged In)
            </p>
          )}
        </div>

        <div className="mb-6">
           <h2 className="text-lg font-semibold">Cookies Found:</h2>
           <pre className="bg-gray-100 p-4 rounded border overflow-auto mt-2 text-xs">
             {cookiesList.getAll().map(c => `${c.name}: ${c.value.substring(0, 10)}...`).join('\n')}
           </pre>
        </div>
      </div>

      <div className="mb-6">
           <h2 className="text-lg font-semibold">Environment Check:</h2>
           <div className="bg-gray-100 p-4 rounded border mt-2 text-sm">
             <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || '(Not Set)'}</p>
             <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
           </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <h2 className="text-xl font-bold">Diagnosis</h2>
        <ul className="list-disc ml-6 mt-2 space-y-2">
          <li>
            <strong>Session is Null but Cookies Exist?</strong>
            <ul className="list-circle ml-6 mt-1 text-sm text-gray-600">
              <li>This usually means <code>AUTH_SECRET</code> in Vercel does not match the one used to sign the cookie.</li>
              <li>Or <code>NEXTAUTH_URL</code> is mismatching the domain.</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}
