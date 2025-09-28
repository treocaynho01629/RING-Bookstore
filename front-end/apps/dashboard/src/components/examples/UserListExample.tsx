"use client";

import { useState, useEffect } from "react";
import { useBackendApi } from "../../hooks/useBackendApi";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function UserListExample() {
  const { get, post, isAuthenticated, isLoading } = useBackendApi();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    const result = await get<User[]>("users");

    if (result.error) {
      setError(result.error);
    } else {
      setUsers(result.data || []);
    }

    setLoading(false);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    setLoading(true);
    setError(null);

    const result = await post<User>("users", newUser);

    if (result.error) {
      setError(result.error);
    } else {
      // Refresh the user list
      await fetchUsers();
      setNewUser({ name: "", email: "" });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <div className="p-4">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <h2 className="text-xl font-bold mb-2">User List Example</h2>
        <p className="text-yellow-700">
          Please log in to view and manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Add User Form */}
      <form onSubmit={createUser} className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-3">Add New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter email"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>

      {/* Users List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Users ({users.length})</h3>
        {loading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No users found. Create your first user above.
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-3 bg-white border rounded-lg flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className="text-sm text-gray-500">ID: {user.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
