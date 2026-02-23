import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (role && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser({ role });
    }
  }, []);

const login = (token, role, mustChangePassword) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("mustChangePassword", mustChangePassword);
  setUser({ role, mustChangePassword });
};

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };