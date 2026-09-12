"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import Link from "next/link";

export default function PublicProfilePage() {
	const params = useParams();
	const userId = params.userId;
	const [profileData, setProfileData] = useState(null);
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (userId) {
			fetchPublicProfile();
		}
	}, [userId]);

	const fetchPublicProfile = async () => {
		try {
			// Fetch user basic info
			const { data: user, error: userError } = await supabase
				.from("users")
				.select("id, full_name, email, image_base64, role")
				.eq("id", userId)
				.single();

			if (userError) throw userError;

			// Check if user is B2C user
			if (user.role !== "b2c_student" && user.role !== "b2c_mentor") {
				setError("This profile is not publicly available.");
				setLoading(false);
				return;
			}

			setUserData(user);

			// Fetch profile details
			const { data: profile, error: profileError } = await supabase
				.from("launch_pad_users_details")
				.select("*")
				.eq("user_id", userId)
				.single();

			if (profileError && profileError.code !== "PGRST116") {
				throw profileError;
			}

			setProfileData(profile);
		} catch (err) {
			console.error("Error fetching public profile:", err);
			setError("Failed to load profile. User may not exist.");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600">Loading profile...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
				<div className="text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="mx-auto h-16 w-16 text-zinc-400"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
						/>
					</svg>
					<h1 className="mt-4 text-2xl font-bold text-zinc-900">{error}</h1>
					<Link
						href="/"
						className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
					>
						Go to Home
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			{/* Hero Section */}
			<div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 py-24">
				<div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMjBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')" }}></div>
				<div className="container relative mx-auto max-w-4xl px-6">
					<div className="flex flex-col items-center text-center">
						{userData?.image_base64 ? (
							<img
								src={userData.image_base64}
								alt={userData.full_name}
								className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl"
							/>
						) : (
							<div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white text-4xl font-bold text-indigo-600 shadow-xl">
								{userData?.full_name
									?.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase() || "U"}
							</div>
						)}
						<h1 className="mt-6 text-4xl font-bold text-white md:text-5xl">
							{userData?.full_name}
						</h1>
						{profileData?.title_on_account && (
							<p className="mt-3 text-xl text-indigo-100">
								{profileData.title_on_account}
							</p>
						)}
						<div className="mt-6 flex items-center gap-4 text-sm text-indigo-100">
							{profileData?.age && (
								<span className="flex items-center gap-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="h-5 w-5"
									>
										<path
											fillRule="evenodd"
											d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
											clipRule="evenodd"
										/>
									</svg>
									{profileData.age} years old
								</span>
							)}
							<span className="flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-5 w-5"
								>
									<path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
									<path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
								</svg>
								{userData?.role === "b2c_student" ? "Student" : "Mentor"}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className="container mx-auto max-w-4xl px-6 py-12">
				{/* About Me */}
				{profileData?.about_me && (
					<div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
						<h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-900">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-7 w-7 text-indigo-600"
							>
								<path
									fillRule="evenodd"
									d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
									clipRule="evenodd"
								/>
							</svg>
							About Me
						</h2>
						<p className="mt-4 whitespace-pre-wrap text-zinc-700 leading-relaxed">
							{profileData.about_me}
						</p>
					</div>
				)}

				{/* Experience */}
				{profileData?.experience && (
					<div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
						<h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-900">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-7 w-7 text-indigo-600"
							>
								<path
									fillRule="evenodd"
									d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-6 0v-.09a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5zm-3 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
									clipRule="evenodd"
								/>
								<path d="M3 18.4v-2.796a4.3 4.3 0 00.713.31A26.226 26.226 0 0012 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 01-6.477-.427C4.047 21.128 3 19.852 3 18.4z" />
							</svg>
							Experience
						</h2>
						<p className="mt-4 whitespace-pre-wrap text-zinc-700 leading-relaxed">
							{profileData.experience}
						</p>
					</div>
				)}

				{/* Interests */}
				{profileData?.interest && profileData.interest.length > 0 && (
					<div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
						<h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-900">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-7 w-7 text-indigo-600"
							>
								<path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
							</svg>
							Interests
						</h2>
						<div className="mt-4 flex flex-wrap gap-3">
							{profileData.interest.map((item, index) => (
								<span
									key={index}
									className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700"
								>
									{item}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Awards */}
				{profileData?.awards && profileData.awards.length > 0 && (
					<div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
						<h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-900">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-7 w-7 text-yellow-500"
							>
								<path
									fillRule="evenodd"
									d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
									clipRule="evenodd"
								/>
							</svg>
							Awards & Achievements
						</h2>
						<div className="mt-4 space-y-3">
							{profileData.awards.map((award, index) => (
								<div
									key={index}
									className="flex items-start gap-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="h-6 w-6 flex-shrink-0 text-yellow-600"
									>
										<path
											fillRule="evenodd"
											d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
											clipRule="evenodd"
										/>
									</svg>
									<p className="text-sm font-medium text-zinc-900">{award}</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{!profileData?.about_me &&
					!profileData?.experience &&
					(!profileData?.interest || profileData.interest.length === 0) &&
					(!profileData?.awards || profileData.awards.length === 0) && (
						<div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="mx-auto h-16 w-16 text-zinc-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
								/>
							</svg>
							<h3 className="mt-4 text-lg font-semibold text-zinc-900">
								Profile Not Yet Completed
							</h3>
							<p className="mt-2 text-sm text-zinc-600">
								This user hasn't added their professional details yet.
							</p>
						</div>
					)}
			</div>

			{/* Footer */}
			<div className="border-t border-zinc-200 bg-white py-8">
				<div className="container mx-auto max-w-4xl px-6 text-center">
					<p className="text-sm text-zinc-600">
						Powered by{" "}
						<Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-700">
							IGYAN Launch Pad
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
