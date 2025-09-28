"use client";

import { useState } from "react";
import { useBackendApi } from "../../hooks/useBackendApi";

interface ApiTestResult {
  endpoint: string;
  method: string;
  response?: any;
  error?: string;
  status?: number;
  timestamp: string;
}

export default function ApiTestComponent() {
  const { get, post, put, del, isAuthenticated, isLoading } = useBackendApi();
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: Omit<ApiTestResult, "timestamp">) => {
    setResults((prev) => [
      {
        ...result,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const testGet = async () => {
    setLoading(true);
    const result = await get("users");
    addResult({
      endpoint: "users",
      method: "GET",
      ...result,
    });
    setLoading(false);
  };

  const testPost = async () => {
    setLoading(true);
    const result = await post("users", {
      name: "Test User",
      email: "test@example.com",
    });
    addResult({
      endpoint: "users",
      method: "POST",
      ...result,
    });
    setLoading(false);
  };

  const testPut = async () => {
    setLoading(true);
    const result = await put("users/1", {
      name: "Updated User",
      email: "updated@example.com",
    });
    addResult({
      endpoint: "users/1",
      method: "PUT",
      ...result,
    });
    setLoading(false);
  };

  const testDelete = async () => {
    setLoading(true);
    const result = await del("users/1");
    addResult({
      endpoint: "users/1",
      method: "DELETE",
      ...result,
    });
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  if (isLoading) {
    return <div className="p-4">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <h2 className="text-xl font-bold mb-2">API Test</h2>
        <p className="text-yellow-700">
          Please log in to test the API endpoints.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Backend API Test</h2>
        <button
          onClick={clearResults}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <button
          onClick={testGet}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          GET /users
        </button>
        <button
          onClick={testPost}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          POST /users
        </button>
        <button
          onClick={testPut}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          PUT /users/1
        </button>
        <button
          onClick={testDelete}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          DELETE /users/1
        </button>
      </div>

      {loading && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">
          Making API request...
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">API Results</h3>
        {results.length === 0 ? (
          <p className="text-gray-500">No API calls made yet.</p>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded border-l-4 ${
                result.error
                  ? "border-red-500 bg-red-50"
                  : "border-green-500 bg-green-50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                    {result.method} /api/backend/{result.endpoint}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {result.timestamp}
                  </span>
                </div>
                {result.status && (
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      result.status >= 400
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {result.status}
                  </span>
                )}
              </div>

              {result.error ? (
                <div>
                  <p className="text-red-700 font-medium">{result.error}</p>
                  {result.details && (
                    <p className="text-red-600 text-sm mt-1">
                      {result.details}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-green-700 font-medium">Success</p>
                  <pre className="text-xs bg-white p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
