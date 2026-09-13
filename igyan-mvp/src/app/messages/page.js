"use client";

import { MessageCircle, Users, Sparkles, Rocket, Clock, CheckCircle2, Mail, Zap, Star, ArrowRight } from "lucide-react";

export default function MessagesPage() {
	return (
		<div className="min-h-full dashboard-theme p-6 lg:p-10">
			{/* Hero Section */}
			<div className="relative overflow-hidden rounded-3xl border p-12 text-center mb-8" style={{
				borderColor: 'var(--dashboard-border)',
				backgroundColor: 'var(--dashboard-surface-solid)',
				background: 'linear-gradient(135deg, var(--dashboard-surface-solid) 0%, var(--dashboard-surface-muted) 100%)'
			}}>
				{/* Decorative Elements */}
				<div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{
					background: 'radial-gradient(circle, var(--dashboard-primary) 0%, transparent 70%)'
				}}></div>
				<div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{
					background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)'
				}}></div>

				<div className="relative z-10">
					{/* Coming Soon Badge */}
					<div className="inline-flex items-center gap-2 rounded-full px-6 py-2 mb-6 text-sm font-semibold" style={{
						backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)',
						color: 'var(--dashboard-primary)'
					}}>
						<Rocket size={18} className="animate-bounce" />
						Coming Soon
					</div>

					{/* Main Heading */}
					<h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--dashboard-heading)' }}>
						Messages & Mentorship Hub
					</h1>
					<p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--dashboard-muted)' }}>
						Connect seamlessly with early mentors and professional mentors. Your all-in-one communication platform for learning and growth.
					</p>

					{/* CTA Button */}
					<button className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition hover:scale-105" style={{
						background: 'linear-gradient(135deg, var(--dashboard-primary) 0%, color-mix(in srgb, var(--dashboard-primary) 80%, #8b5cf6) 100%)'
					}}>
						<Mail size={24} />
						Get Notified When We Launch
						<ArrowRight size={20} />
					</button>
				</div>
			</div>

			{/* Features Grid */}
			<div className="mb-12">
				<h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--dashboard-heading)' }}>
					What's Coming
				</h2>
				<p className="text-center mb-8" style={{ color: 'var(--dashboard-muted)' }}>
					Powerful features designed to revolutionize how you connect with mentors and peers
				</p>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Feature 1: Early Mentors */}
					<div className="rounded-3xl border p-6 transition hover:scale-105 hover:shadow-xl" style={{
						borderColor: 'var(--dashboard-border)',
						backgroundColor: 'var(--dashboard-surface-solid)'
					}}>
						<div className="rounded-2xl p-4 mb-4 inline-block" style={{
							backgroundColor: 'color-mix(in srgb, #10b981 15%, transparent)'
						}}>
							<Users size={32} className="text-emerald-500" />
						</div>
						<h3 className="text-xl font-bold mb-3" style={{ color: 'var(--dashboard-heading)' }}>
							Connect with Early Mentors
						</h3>
						<p className="text-sm mb-4" style={{ color: 'var(--dashboard-text)' }}>
							Get guidance from experienced peers who've recently mastered the topics you're learning. Perfect for relatable insights and practical tips.
						</p>
						<div className="flex items-center gap-2 text-sm font-semibold text-emerald-500">
							<CheckCircle2 size={16} />
							Peer-to-peer learning
						</div>
					</div>

					{/* Feature 2: Professional Mentors */}
					<div className="rounded-3xl border p-6 transition hover:scale-105 hover:shadow-xl" style={{
						borderColor: 'var(--dashboard-border)',
						backgroundColor: 'var(--dashboard-surface-solid)'
					}}>
						<div className="rounded-2xl p-4 mb-4 inline-block" style={{
							backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)'
						}}>
							<Star size={32} style={{ color: 'var(--dashboard-primary)' }} />
						</div>
						<h3 className="text-xl font-bold mb-3" style={{ color: 'var(--dashboard-heading)' }}>
							Professional Mentors
						</h3>
						<p className="text-sm mb-4" style={{ color: 'var(--dashboard-text)' }}>
							Access industry experts and certified educators for in-depth knowledge, career guidance, and professional development.
						</p>
						<div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--dashboard-primary)' }}>
							<CheckCircle2 size={16} />
							Expert guidance
						</div>
					</div>

					{/* Feature 3: Real-time Messaging */}
					<div className="rounded-3xl border p-6 transition hover:scale-105 hover:shadow-xl" style={{
						borderColor: 'var(--dashboard-border)',
						backgroundColor: 'var(--dashboard-surface-solid)'
					}}>
						<div className="rounded-2xl p-4 mb-4 inline-block" style={{
							backgroundColor: 'color-mix(in srgb, #3b82f6 15%, transparent)'
						}}>
							<MessageCircle size={32} className="text-blue-500" />
						</div>
						<h3 className="text-xl font-bold mb-3" style={{ color: 'var(--dashboard-heading)' }}>
							Real-time Messaging
						</h3>
						<p className="text-sm mb-4" style={{ color: 'var(--dashboard-text)' }}>
							Instant chat with mentors and peers. Share files, code snippets, and collaborate seamlessly in real-time.
						</p>
						<div className="flex items-center gap-2 text-sm font-semibold text-blue-500">
							<CheckCircle2 size={16} />
							Instant communication
						</div>
					</div>

					{/* Feature 4: AI-Powered Assistance */}
					<div className="rounded-3xl border p-6 transition hover:scale-105 hover:shadow-xl" style={{
						borderColor: 'var(--dashboard-border)',
						backgroundColor: 'var(--dashboard-surface-solid)'
					}}>
						<div className="rounded-2xl p-4 mb-4 inline-block" style={{
							backgroundColor: 'color-mix(in srgb, #a855f7 15%, transparent)'
						}}>
							<Sparkles size={32} className="text-purple-500" />
						</div>
						<h3 className="text-xl font-bold mb-3" style={{ color: 'var(--dashboard-heading)' }}>
							AI-Powered Summaries
						</h3>
						<p className="text-sm mb-4" style={{ color: 'var(--dashboard-text)' }}>
							Sudarshan AI automatically generates conversation summaries, action items, and key takeaways from your mentorship sessions.
						</p>
						<div className="flex items-center gap-2 text-sm font-semibold text-purple-500">
							<CheckCircle2 size={16} />
							Smart insights
						</div>
					</div>

					{/* Feature 5: Smart Scheduling */}
					<div className="rounded-3xl border p-6 transition hover:scale-105 hover:shadow-xl" style={{
						borderColor: 'var(--dashboard-border)',
						backgroundColor: 'var(--dashboard-surface-solid)'
					}}>
						<div className="rounded-2xl p-4 mb-4 inline-block" style={{
							backgroundColor: 'color-mix(in srgb, #f59e0b 15%, transparent)'
						}}>
							<Clock size={32} className="text-amber-500" />
						</div>
						<h3 className="text-xl font-bold mb-3" style={{ color: 'var(--dashboard-heading)' }}>
							Smart Scheduling
						</h3>
						<p className="text-sm mb-4" style={{ color: 'var(--dashboard-text)' }}>
							Book mentorship sessions with integrated calendar sync. Get reminders and never miss an important meeting.
						</p>
						<div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
							<CheckCircle2 size={16} />
							Easy booking
						</div>
					</div>

					{/* Feature 6: Lightning Fast */}
					<div className="rounded-3xl border p-6 transition hover:scale-105 hover:shadow-xl" style={{
						borderColor: 'var(--dashboard-border)',
						backgroundColor: 'var(--dashboard-surface-solid)'
					}}>
						<div className="rounded-2xl p-4 mb-4 inline-block" style={{
							backgroundColor: 'color-mix(in srgb, #ec4899 15%, transparent)'
						}}>
							<Zap size={32} className="text-pink-500" />
						</div>
						<h3 className="text-xl font-bold mb-3" style={{ color: 'var(--dashboard-heading)' }}>
							Lightning Fast Responses
						</h3>
						<p className="text-sm mb-4" style={{ color: 'var(--dashboard-text)' }}>
							Get notified instantly when mentors respond. Push notifications ensure you never miss important messages.
						</p>
						<div className="flex items-center gap-2 text-sm font-semibold text-pink-500">
							<CheckCircle2 size={16} />
							Instant notifications
						</div>
					</div>
				</div>
			</div>

			{/* Timeline Section */}
			<div className="rounded-3xl border p-8 mb-8" style={{
				borderColor: 'var(--dashboard-border)',
				backgroundColor: 'var(--dashboard-surface-solid)'
			}}>
				<h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--dashboard-heading)' }}>
					Development Timeline
				</h2>
				<div className="grid gap-6 md:grid-cols-3">
					<div className="text-center">
						<div className="rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white" style={{
							backgroundColor: 'var(--dashboard-primary)'
						}}>
							Q1
						</div>
						<h3 className="font-bold mb-2" style={{ color: 'var(--dashboard-heading)' }}>Phase 1: Beta Testing</h3>
						<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
							Core messaging features with select mentors
						</p>
					</div>
					<div className="text-center">
						<div className="rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white" style={{
							backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 70%, #8b5cf6)'
						}}>
							Q2
						</div>
						<h3 className="font-bold mb-2" style={{ color: 'var(--dashboard-heading)' }}>Phase 2: AI Integration</h3>
						<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
							Smart summaries and scheduling features
						</p>
					</div>
					<div className="text-center">
						<div className="rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white bg-purple-500">
							Q3
						</div>
						<h3 className="font-bold mb-2" style={{ color: 'var(--dashboard-heading)' }}>Phase 3: Full Launch</h3>
						<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
							Complete platform with all features live
						</p>
					</div>
				</div>
			</div>

			{/* CTA Footer */}
			<div className="rounded-3xl border p-12 text-center" style={{
				borderColor: 'var(--dashboard-border)',
				backgroundColor: 'var(--dashboard-surface-solid)',
				background: 'linear-gradient(135deg, var(--dashboard-surface-solid) 0%, var(--dashboard-surface-muted) 100%)'
			}}>
				<h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--dashboard-heading)' }}>
					Be Among the First to Experience It
				</h2>
				<p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: 'var(--dashboard-muted)' }}>
					Join our early access waitlist and get exclusive benefits when we launch the messaging platform.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<input
						id="waitlist-email"
						name="email"
						type="email"
						aria-label="Email address for early access waitlist"
						autoComplete="email"
						placeholder="Enter your email"
						className="px-6 py-3 rounded-xl border w-full sm:w-96 focus:outline-none focus:ring-2"
						style={{
							borderColor: 'var(--dashboard-border)',
							backgroundColor: 'var(--dashboard-surface-muted)',
							color: 'var(--dashboard-text)'
						}}
					/>
					<button className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition hover:scale-105 w-full sm:w-auto" style={{
						background: 'linear-gradient(135deg, var(--dashboard-primary) 0%, color-mix(in srgb, var(--dashboard-primary) 80%, #8b5cf6) 100%)'
					}}>
						Join Waitlist
					</button>
				</div>
			</div>
		</div>
	);
}
