import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Shared black-and-white UI kit: white page, solid black type, square
 * controls. Every experiment page is wrapped in `ExperimentLayout`.
 */

export function ExperimentLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen w-screen overflow-hidden bg-white font-gothic text-black">
			{children}
		</div>
	);
}

export function Stage({ children }: { children: ReactNode }) {
	return (
		<main className="flex min-w-0 flex-1 items-center justify-center p-5 sm:p-8">
			{children}
		</main>
	);
}

/** Black-bordered frame that fits the artwork ratio into the stage. */
export function Frame({
	children,
	ratio,
}: {
	children: ReactNode;
	/** width / height of the artwork. */
	ratio: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ w: 0, h: 0 });

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			const w = Math.min(width, height * ratio);
			setSize({ w, h: w / ratio });
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, [ratio]);

	return (
		<div ref={ref} className="flex h-full w-full items-center justify-center">
			<div
				className="border border-black"
				style={{ width: size.w, height: size.h }}
			>
				{children}
			</div>
		</div>
	);
}

export function Panel({ children }: { children: ReactNode }) {
	return (
		<aside className="w-[340px] shrink-0 overflow-y-auto border-l border-black bg-white px-6 py-5">
			{children}
		</aside>
	);
}

export function BackLink() {
	return (
		<Link
			to="/"
			className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] hover:opacity-50"
		>
			<ArrowLeft size={12} />
			Sandbox
		</Link>
	);
}

export function PageTitle({ children }: { children: ReactNode }) {
	return (
		<h1 className="mt-8 text-[26px] font-bold uppercase leading-[0.95] tracking-[-0.01em]">
			{children}
		</h1>
	);
}

export function Lead({ children }: { children: ReactNode }) {
	return (
		<p className="mt-3 text-[12px] leading-[1.55] text-black/60">{children}</p>
	);
}

export function Section({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="mt-8 border-t border-black pt-3">
			<h2 className="mb-4 text-[9px] font-bold uppercase tracking-[0.24em] text-black/50">
				{title}
			</h2>
			{children}
		</section>
	);
}

export function Slider(props: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	format?: (v: number) => string;
	onChange: (v: number) => void;
}) {
	const { label, value, min, max, step, format, onChange } = props;
	return (
		<label className="mb-4 block">
			<div className="mb-2 flex items-baseline justify-between gap-3">
				<span className="text-[10px] font-medium uppercase tracking-[0.14em]">
					{label}
				</span>
				<span className="text-[11px] tabular-nums">
					{format ? format(value) : value.toFixed(2)}
				</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number.parseFloat(e.target.value))}
				className="ui-range"
			/>
		</label>
	);
}

export function Toggle(props: {
	label: string;
	value: boolean;
	onChange: (v: boolean) => void;
}) {
	const { label, value, onChange } = props;
	return (
		<div className="mb-3 flex items-center justify-between gap-3">
			<span className="text-[10px] font-medium uppercase tracking-[0.14em]">
				{label}
			</span>
			<button
				type="button"
				role="switch"
				aria-checked={value}
				aria-label={label}
				onClick={() => onChange(!value)}
				className={`h-[18px] w-9 border border-black transition-colors ${
					value ? "bg-black" : "bg-white"
				}`}
			>
				<span
					className={`block h-[14px] w-[14px] border border-black transition-transform ${
						value ? "bg-white" : "bg-black"
					}`}
					style={{ transform: `translateX(${value ? 18 : 1}px)` }}
				/>
			</button>
		</div>
	);
}

export function Segmented<T extends string>(props: {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (v: T) => void;
}) {
	const { label, value, options, onChange } = props;
	return (
		<div className="mb-4">
			<div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em]">
				{label}
			</div>
			<div className="flex border border-black">
				{options.map((opt, i) => (
					<button
						key={opt.value}
						type="button"
						onClick={() => onChange(opt.value)}
						aria-pressed={value === opt.value}
						className={`flex-1 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors ${
							i > 0 ? "border-l border-black" : ""
						} ${value === opt.value ? "bg-black text-white" : "hover:bg-black/5"}`}
					>
						{opt.label}
					</button>
				))}
			</div>
		</div>
	);
}

export function ActionButton(props: {
	children: ReactNode;
	onClick: () => void;
	icon?: ReactNode;
	variant?: "solid" | "outline";
}) {
	const { children, onClick, icon, variant = "solid" } = props;
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex flex-1 items-center justify-center gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-70 ${
				variant === "solid"
					? "bg-black text-white"
					: "border border-black bg-white text-black"
			}`}
		>
			{icon}
			{children}
		</button>
	);
}
