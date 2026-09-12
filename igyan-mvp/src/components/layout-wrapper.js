"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/app/utils/auth_context";

export default function LayoutWrapper({ children }) {
	const pathname = usePathname();
	const isDashboard = pathname?.startsWith("/dashboard");
	const isLogin = pathname === "/login" || pathname?.startsWith("/login/");
	const isAuthPage = isLogin || pathname === "/forgot-password";
	const isRegister = pathname?.startsWith("/register/");

	return (
		<ThemeProvider>
			<AuthProvider>
				{isDashboard || isAuthPage || isRegister ? (
					// Dashboard & Auth layout - no public navbar/footer
					<>{children}</>
				) : (
					// Public pages layout - with navbar/footer
					<div className="flex min-h-screen flex-col">
						<Navbar />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
				)}
			</AuthProvider>
		</ThemeProvider>
	);
}
