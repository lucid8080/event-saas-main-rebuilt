import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TestAuthPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p><strong>✅ Authentication Successful!</strong></p>
        <p>User ID: {user.id}</p>
        <p>Email: {user.email}</p>
        <p>Name: {user.name}</p>
        <p>Role: {user.role}</p>
        {user.username && <p>Username: {user.username}</p>}
      </div>
      <div className="mt-4">
        <a 
          href="/dashboard" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
} 