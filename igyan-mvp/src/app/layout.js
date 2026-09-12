import { Inter } from "next/font/google";
import LayoutWrapper from "@/components/layout-wrapper";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata = {
	title: "IGYAN AI - Native Operating System for Education",
	description:
		"India's AI-Native Operating System for Schools & Colleges. Empowering personalized learning, career pathways, and entrepreneurship readiness.",
	icons: {
		icon: "/apple-icon.png",
		apple: "/apple-icon.png",
	},
};

export const viewport = {
	themeColor: "#05070f",
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning data-theme="dark" className={`dark ${inter.variable}`}>
			<body className="antialiased bg-background text-foreground">
				<LayoutWrapper>{children}</LayoutWrapper>
			</body>
		</html>
	);
}
