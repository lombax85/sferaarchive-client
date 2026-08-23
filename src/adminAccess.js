import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "./config";

export const ADMIN_ONLY_MESSAGE = "Accesso riservato agli amministratori.";
export const ADMIN_CHECK_FAILED_MESSAGE =
  "Impossibile verificare i permessi amministrativi. Riprova più tardi.";

const AdminAccessContext = createContext(undefined);

export function AdminAccessProvider({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    axios
      .get(`${API_URL}/whoami`)
      .then((response) => {
        if (active) {
          setStatus(response.data?.is_admin === true ? "allowed" : "denied");
        }
      })
      .catch((error) => {
        console.error("Error checking admin access:", error);
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      status,
      isAdmin: status === "allowed",
      isLoading: status === "loading",
      message:
        status === "error" ? ADMIN_CHECK_FAILED_MESSAGE : ADMIN_ONLY_MESSAGE,
    }),
    [status]
  );

  return (
    <AdminAccessContext.Provider value={value}>
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess() {
  const access = useContext(AdminAccessContext);
  if (!access) {
    throw new Error("useAdminAccess must be used within AdminAccessProvider");
  }
  return access;
}
