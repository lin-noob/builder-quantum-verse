import { DemoResponse } from "@shared/api";
import { useEffect, useState } from "react";
import { request } from "@/lib/request";

export default function Index() {
  const [exampleFromServer, setExampleFromServer] = useState("");
  // Fetch users on component mount
  useEffect(() => {
    fetchDemo();
  }, []);

  // Example of how to fetch data from the server (if needed)
  const fetchDemo = async () => {
    try {
      const response = await request.get<DemoResponse>("/api/demo");
      setExampleFromServer(response.data.message);
    } catch (error) {
      console.error("Error fetching demo data:", error);

      // In development, provide more helpful error information
      if (process.env.NODE_ENV === 'development') {
        console.log("💡 Tips to debug this error:");
        console.log("1. Check if the backend server is running");
        console.log("2. Verify the API endpoint exists at /api/demo");
        console.log("3. Check the proxy configuration in vite.config.ts");
        console.log("4. Look at Network tab in dev tools to see the actual response");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="text-center">
        {/* TODO: FUSION_GENERATION_APP_PLACEHOLDER replace everything here with the actual app! */}
        <h1 className="text-2xl font-semibold text-slate-800 flex items-center justify-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-slate-400"
            viewBox="0 0 50 50"
          >
            <circle
              className="opacity-30"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
            />
            <circle
              className="text-slate-600"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              strokeDasharray="100"
              strokeDashoffset="75"
            />
          </svg>
          Generating your app...
        </h1>
        <p className="mt-4 text-slate-600 max-w-md">
          Watch the chat on the left for updates that might need your attention
          to finish generating
        </p>
        <p className="mt-4 hidden max-w-md">{exampleFromServer}</p>
      </div>
    </div>
  );
}
