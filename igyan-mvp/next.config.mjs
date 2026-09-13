import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
	compress: true,
	poweredByHeader: false,
	async redirects() {
		return [
			{
				source: "/",
				destination: "/features",
				permanent: false,
			},
		];
	},
	images: {
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 2592000,
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				pathname: "/aida-public/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				pathname: "/**",
			},
		],
	},
	experimental: {
		optimizePackageImports: ["lucide-react", "framer-motion", "chart.js", "xlsx", "jspdf", "jspdf-autotable", "react-pdf", "openai"],
	},
	turbopack: {
		root: __dirname,
	},
	webpack(config, { isServer, webpack }) {
		config.context = __dirname;
		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
		};
		config.resolve.modules = [
			path.resolve(__dirname, "node_modules"),
			...(config.resolve.modules || ["node_modules"]),
		];
		config.resolveLoader = config.resolveLoader || {};
		config.resolveLoader.modules = [
			path.resolve(__dirname, "node_modules"),
			...(config.resolveLoader.modules || ["node_modules"]),
		];

		if (!isServer) {
			// pptxgenjs references Node protocol imports that are not needed in the
			// browser bundle used by the content-generator download flow.
			config.resolve.alias = {
				...config.resolve.alias,
				"node:fs": false,
				"node:https": false,
			};
			config.plugins.push(
				new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
					resource.request = resource.request.replace(/^node:/, "");
				}),
			);
		}

		return config;
	},
};

export default nextConfig;
