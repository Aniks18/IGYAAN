"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// SHA-256 hashing function
async function hashPassword(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
	return hashHex;
}

// Generate secure random token
function generateToken() {
	return crypto.randomUUID() + "-" + Date.now() + "-" + Math.random().toString(36);
}

// Get device and browser information
function getDeviceInfo() {
	const userAgent = navigator.userAgent;
	let deviceType = "desktop";
	let osName = "Unknown";
	let browserName = "Unknown";

	// Detect device type
	if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
		deviceType = /iPad|Tablet/i.test(userAgent) ? "tablet" : "mobile";
	}

	// Detect OS
	if (/Windows/i.test(userAgent)) osName = "Windows";
	else if (/Mac/i.test(userAgent)) osName = "macOS";
	else if (/Linux/i.test(userAgent)) osName = "Linux";
	else if (/Android/i.test(userAgent)) osName = "Android";
	else if (/iOS|iPhone|iPad/i.test(userAgent)) osName = "iOS";

	// Detect Browser
	if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent))
		browserName = "Chrome";
	else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent))
		browserName = "Safari";
	else if (/Firefox/i.test(userAgent)) browserName = "Firefox";
	else if (/Edg/i.test(userAgent)) browserName = "Edge";

	return {
		deviceType,
		osName,
		browserName,
		userAgent,
	};
}

// Get user's IP address (simplified - with fast fallback)
async function getUserIP() {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 1200);
		const response = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
		clearTimeout(timeoutId);
		const data = await response.json();
		return data.ip || "0.0.0.0";
	} catch (error) {
		return "0.0.0.0";
	}
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Check for existing session on mount
	useEffect(() => {
		try {
			const cached = localStorage.getItem("cached_user");
			const token = localStorage.getItem("session_token");
			if (token && cached) {
				setUser(JSON.parse(cached));
				setLoading(false);
			}
		} catch (e) {}

		checkSession();
	}, []);

	const checkSession = async () => {
		try {
			const sessionToken = localStorage.getItem("session_token");
			if (!sessionToken) {
				setUser(null);
				setSession(null);
				localStorage.removeItem("cached_user");
				setLoading(false);
				return;
			}

			// Verify session in database
			const { data: sessionData, error } = await supabase
				.from("sessions")
				.select("*, users(*)")
				.eq("session_token", sessionToken)
				.eq("is_active", true)
				.single();

			// Only remove the token when Supabase confirms that no matching session exists.
			if (error?.code === "PGRST116" || (!error && !sessionData)) {
				localStorage.removeItem("session_token");
				localStorage.removeItem("cached_user");
				setUser(null);
				setSession(null);
				setLoading(false);
				return;
			}

			if (error) {
				console.error("Session verification temporarily failed:", error);
				setLoading(false);
				return;
			}

			// Check if session expired
			if (new Date(sessionData.expires_at) < new Date()) {
				await logout();
				return;
			}

			// Update last activity in background without blocking state release
			supabase
				.from("sessions")
				.update({ last_activity_at: new Date().toISOString() })
				.eq("id", sessionData.id)
				.then(() => {})
				.catch(() => {});

			if (sessionData.users) {
				localStorage.setItem("cached_user", JSON.stringify(sessionData.users));
				setUser(sessionData.users);
			}
			setSession(sessionData);
		} catch (error) {
			console.error("Session check error:", error);
		} finally {
			setLoading(false);
		}
	};

	const register = async (email, password, fullName, phone = null, imageBase64 = null, role = "student") => {
		try {
			const passwordHash = await hashPassword(password);

			const { data: userData, error: userError } = await supabase
				.from("users")
				.insert([
					{
						email,
						password_hash: passwordHash,
						full_name: fullName,
						phone,
						image_base64: imageBase64,
						role: role,
						school_id: null,
					},
				])
				.select()
				.single();

			if (userError) {
				throw userError;
			}

			await login(email, password);

			return { success: true, data: userData };
		} catch (error) {
			console.error("Registration error:", error);
			return { success: false, error: error.message };
		}
	};

	const login = async (email, password, loginVariant = null) => {
		try {
			const passwordHash = await hashPassword(password);

			const { data: userData, error: userError } = await supabase
				.from("users")
				.select("*")
				.eq("email", email)
				.single();

			if (userError || !userData) {
				throw new Error("Invalid email address");
			}

			if (userData.password_hash !== passwordHash) {
				return { success: false, error: "Incorrect password", field: "password" };
			}

			const INSTITUTIONAL_ROLES = ['super_admin', 'co_admin', 'principal', 'faculty', 'teacher'];
			const LAUNCH_PAD_ROLES = ['student', 'parent'];

			if (loginVariant === "institutionalSuite") {
				if (!INSTITUTIONAL_ROLES.includes(userData.role)) {
					throw new Error("Access denied. This portal is for super admins, principals, and teachers. Students and parents should use Launch Pad.");
				}
			} else if (loginVariant === "professionalSuite") {
				if (!LAUNCH_PAD_ROLES.includes(userData.role)) {
					throw new Error("Access denied. Launch Pad is for students and parents. Staff should use the Institutional Suite portal.");
				}
			}

			// Create session
			const deviceInfo = getDeviceInfo();
			const ipAddress = await getUserIP();
			const sessionToken = generateToken();
			const refreshToken = generateToken();
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7);

			const { data: sessionData, error: sessionError } = await supabase
				.from("sessions")
				.insert([
					{
						user_id: userData.id,
						session_token: sessionToken,
						refresh_token: refreshToken,
						device_type: deviceInfo.deviceType,
						os_name: deviceInfo.osName,
						browser_name: deviceInfo.browserName,
						user_agent: deviceInfo.userAgent,
						ip_address: ipAddress,
						expires_at: expiresAt.toISOString(),
						is_active: true,
					},
				])
				.select()
				.single();

			if (sessionError) {
				throw sessionError;
			}

			localStorage.setItem("session_token", sessionToken);
			localStorage.setItem("cached_user", JSON.stringify(userData));

			setUser(userData);
			setSession(sessionData);

			router.push("/dashboard");

			return { success: true, data: userData };
		} catch (error) {
			return { success: false, error: error.message || "Unable to sign in. Please try again." };
		}
	};

	const logout = async () => {
		try {
			const sessionToken = localStorage.getItem("session_token");
			if (sessionToken) {
				await supabase
					.from("sessions")
					.update({
						is_active: false,
						logout_at: new Date().toISOString(),
					})
					.eq("session_token", sessionToken);
			}

			localStorage.removeItem("session_token");
			localStorage.removeItem("cached_user");
			setUser(null);
			setSession(null);
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const value = {
		user,
		session,
		loading,
		register,
		login,
		logout,
		checkSession,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
