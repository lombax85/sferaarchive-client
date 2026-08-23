import React from "react";
import { Link } from "react-router-dom";
import { useAdminAccess } from "./adminAccess";

export default function Navigation() {
  const { isAdmin } = useAdminAccess();

  return (
    <nav className="bg-purple-700 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="text-white hover:text-purple-200">
            Home
          </Link>
        </li>
        {isAdmin && (
          <>
            <li>
              <Link to="/digest" className="text-white hover:text-purple-200">
                Digest
              </Link>
            </li>
            <li>
              <Link to="/stats" className="text-white hover:text-purple-200">
                Stats
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
