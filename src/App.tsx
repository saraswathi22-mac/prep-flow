import { useEffect, useState, useRef } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { observeAuthState } from "./firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "./firebase/config";

import { loadTasks, saveTasks } from "./firebase/taskStorage";

import { setTasks } from "./features/interviewTasks/interviewTaskSlice";

import AddInterviewTask from "./features/interviewTasks/AddInterviewTask";
import EditInterviewTask from "./features/interviewTasks/EditInterviewTask";
import InterviewTaskList from "./features/interviewTasks/InterviewTaskList";
import Login from "./pages/Login";

import { Toaster, toast } from "sonner";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

import TechStackSetup from "./pages/TechStackSetup";
import { loadTechStacks } from "./firebase/techStackStorage";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import type { MouseEvent } from "react";

import type { User } from "firebase/auth";
import { AppDispatch, RootState } from "./store/store";

import ManageTechStack from "./pages/ManageTechStack";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import AccountSettings from "./pages/AccountSettings";
import PersonIcon from "@mui/icons-material/Person";
import Divider from "@mui/material/Divider";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasTechStack, setHasTechStack] = useState(false);
  const [techStackLoading, setTechStackLoading] = useState(true);
  const isLoggingIn = useRef(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const tasks = useSelector((state: RootState) => state.interviewTasks);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Observe Firebase auth state
  useEffect(() => {
    const unsubscribe = observeAuthState(
      async (currentUser: User | null): Promise<void> => {
        setUser(currentUser);

        setDisplayName(
          currentUser?.displayName ||
            currentUser?.email?.split("@")[0] ||
            "User",
        );

        if (currentUser) {
          const [savedTasks, savedTechStacks] = await Promise.all([
            loadTasks(currentUser),
            loadTechStacks(currentUser),
          ]);

          dispatch(setTasks(savedTasks));

          setHasTechStack(savedTechStacks.length >= 5);
          setTechStackLoading(false);

          if (isLoggingIn.current) {
            navigate("/");
            toast.success(
              currentUser.displayName
                ? `Welcome back, ${currentUser.displayName}!`
                : "Welcome back!",
              {
                description: "You're successfully signed in.",
              },
            );

            isLoggingIn.current = false;
          }
        } else {
          dispatch(setTasks([]));
          setHasTechStack(false);
          setTechStackLoading(false);
        }

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [dispatch]);

  // Save tasks whenever tasks change
  useEffect(() => {
    if (loading || !user) return;

    const saveData = async () => {
      await saveTasks(user, tasks);
    };

    saveData();
  }, [tasks, user, loading]);

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLoginStart = () => {
    isLoggingIn.current = true;
  };

  const userName = displayName
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      {loading || techStackLoading ? (
        <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4">
          <div className="flex flex-col items-center text-center">
            <img
              src="/prep-flow.png"
              alt="PrepFlow"
              className="h-16 w-16 object-contain"
            />

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
              PrepFlow
            </h1>

            <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#5A9C43]" />
              Getting PrepFlow ready...
            </div>
          </div>
        </div>
      ) : !user ? (
        <Login onLoginStart={handleLoginStart} />
      ) : !hasTechStack ? (
        <TechStackSetup onComplete={() => setHasTechStack(true)} />
      ) : (
        <div className="min-h-screen bg-blue-50">
          {/* Navbar */}
          <header className="sticky top-0 z-50 h-16 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <img
                  src="/prep-flow.png"
                  alt="PrepFlow"
                  className="h-10 w-10 object-contain"
                />

                <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                  PrepFlow
                </h1>
              </div>

              {/* Right Section */}
              <div className="flex items-center">
                {/* Profile Button */}
                <button
                  type="button"
                  onClick={handleMenuOpen}
                  aria-label={`Open profile menu for ${userName}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-gray-100"
                >
                  {/* Avatar */}
                  <div
                    className="
flex h-10 w-10 items-center justify-center
rounded-full
bg-[#5A9C43]
text-white
font-semibold
shadow-sm
"
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>

                  {/* User Name */}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-700">
                      {userName}
                    </p>
                  </div>

                  <KeyboardArrowDownIcon
                    fontSize="small"
                    className={`transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  slotProps={{
                    paper: {
                      elevation: 3,
                      sx: {
                        mt: 1,
                        minWidth: {
                          xs: 120,
                          sm: 140,
                          md: 160,
                        },
                        borderRadius: 2,
                      },
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/account-settings");
                    }}
                    sx={{
                      px: {
                        xs: 1.25,
                        sm: 1.5,
                        md: 2,
                      },
                      py: {
                        xs: 0.5,
                        sm: 0.75,
                        md: 1,
                      },
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.85rem",
                        md: "0.875rem",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: {
                          xs: 28,
                          sm: 30,
                          md: 36,
                        },
                      }}
                    >
                      <PersonIcon fontSize="small" sx={{ color: "#6366F1" }} />
                    </ListItemIcon>
                    Account Settings
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/manage-tech-stack");
                    }}
                    sx={{
                      px: {
                        xs: 1.25,
                        sm: 1.5,
                        md: 2,
                      },
                      py: {
                        xs: 0.5,
                        sm: 0.75,
                        md: 1,
                      },
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.85rem",
                        md: "0.875rem",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: {
                          xs: 28,
                          sm: 30,
                          md: 36,
                        },
                      }}
                    >
                      <SettingsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Manage Tech Stack
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      handleLogout();
                    }}
                    sx={{
                      px: {
                        xs: 1.25,
                        sm: 1.5,
                        md: 2,
                      },
                      py: {
                        xs: 0.5,
                        sm: 0.75,
                        md: 1,
                      },
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.85rem",
                        md: "0.875rem",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: {
                          xs: 28,
                          sm: 30,
                          md: 36,
                        },
                      }}
                    >
                      <LogoutOutlinedIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto max-w-5xl px-4 py-8">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <Routes>
                <Route
                  path="/"
                  element={<InterviewTaskList displayName={displayName} />}
                />
                <Route path="/add-task" element={<AddInterviewTask />} />
                <Route path="/edit-task/:id" element={<EditInterviewTask />} />
                <Route
                  path="/manage-tech-stack"
                  element={<ManageTechStack />}
                />
                <Route
                  path="/account-settings"
                  element={
                    <AccountSettings
                      user={user}
                      onNameUpdated={setDisplayName}
                    />
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default App;
