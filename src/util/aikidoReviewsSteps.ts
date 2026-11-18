import type { WalkthroughStep } from "./aikidoSteps";

/** Code excerpts mirror src/components/aikido/AikidoReviews.tsx. */
export const REVIEWS_STEPS: readonly WalkthroughStep[] = [
	{
		title: "紙の背景を敷く",
		note: "1600×960 の viewBox いっぱいに、クリーム色の紙（AK.paper）の長方形を 1 枚敷きます。ポスター全体の土台で、以降の層はすべてこの上に重なります。",
		code: `<rect width={1600} height={960} fill={AK.paper} />`,
	},
	{
		title: "雲を浮かべる",
		note: "6 つの雲を CLOUDS の仕様（位置・幅・高さ・こぶの数）から cloudShape で生成します。形は固定シード (0x4c0d) の乱数で決まるので、リロードしても同じです。紙色で塗って太さ 2 の黒い輪郭を引き、下に太さ 1.2 の短いハッチ線を並べます。",
		code: `const rng = createRng(SEED); // 0x4c0d
const clouds = CLOUDS.map((spec) =>
  cloudShape(rng, { ...spec, lumps: spec.lumps }));

{clouds.map((c) => (
  <g key={c.d.slice(0, 24)}>
    <path d={c.d} fill={AK.paper}
      stroke={AK.ink} strokeWidth={2} />
    <g stroke={AK.ink} strokeWidth={1.2}>
      {c.ticks.map((t) => <line ... />)}
    </g>
  </g>
))}`,
	},
	{
		title: "グレーのハッチの丘を置く",
		note: "丘の形は、頂点 (peak) を中心にしたガウス曲線 base − amp·exp(−((x−peak)/spread)²) です。グレーの丘は peak 410・高さ 220・広がり 434 で、左側に低く盛り上がります。この曲線を 8px ごとにたどったパスで clipPath を作り、紙色の上に 44px 周期の斜めの短冊（#5d5d5b）を敷き詰めます。",
		code: `grey: { base: 880, amp: 220, peak: 410, spread: 434 },

const hillY = (h: Hill, x: number) =>
  h.base - h.amp * Math.exp(-(((x - h.peak) / h.spread) ** 2));

<g clipPath={clip("grey")}>
  <rect width={1600} height={960} fill={AK.paper} />
  <rect width={1600} height={960} fill={\`url(#\${ids}-hatch)\`} />
</g>`,
	},
	{
		title: "黄色の丘と橙の網点を重ねる",
		note: "黄色の丘は peak 1030・高さ 309・広がり 777 と、右寄りで大きな山です。クレストの下 52px の帯 (crestBand) を、22px 周期の橙の四角（10×10）で塗り、尾根に沿った網点にします。グレーの丘の右側が隠れます。",
		code: `yellow: { base: 1000, amp: 309, peak: 1030, spread: 777 },

<g clipPath={clip("yellow")}>
  <rect width={1600} height={960} fill={AK.yellow} />
  <path d={crestBand(HILLS.yellow, 52)}
    fill={\`url(#\${ids}-dots)\`} />
</g>`,
	},
	{
		title: "青い短冊を立てる",
		note: "黄色の丘の上、(342, 772) に幅 18・高さ 92 の青い短冊を 1 本置きます。コードレビューで「ここを見て」と付ける目印にあたり、変更箇所を示すイメージです。",
		code: `<rect x={342} y={772} width={18} height={92} fill={AK.blue} />`,
	},
	{
		title: "紙色の帯と紫の破線を重ねる",
		note: "violet の丘（peak 1075・高さ 246・広がり 500）を紙色で塗り、黄色の丘の手前に紙の帯を作ります。その上に、丘に沿った太さ 9 の紫の破線（34 描いて 22 空ける）を、クレストから 9・41・73・105px 下に 4 本引きます。",
		code: `violet: { base: 995, amp: 246, peak: 1075, spread: 500 },

<path d={hillPath(HILLS.violet)} fill={AK.paper} />
<g fill="none" stroke={AK.violet} strokeWidth={9}
  strokeDasharray="34 22">
  {[9, 41, 73, 105].map((offset) => (
    <path key={offset} d={followHill(HILLS.violet, offset)} />
  ))}
</g>`,
	},
	{
		title: "緑の丘とハッチ、赤い棒を加える",
		note: "最前面の緑の丘（peak 1100・高さ 180・広がり 381）を AK.green で塗ります。x=930〜1130 の幅 200 の範囲だけ、26px 周期の濃い緑の斜線 (#0b5c3d) を重ねます。さらに (1113, 800) に、幅 13・高さ 160 の赤い棒（#e2450f）を立てます。",
		code: `green: { base: 992, amp: 180, peak: 1100, spread: 381 },

<g clipPath={clip("green")}>
  <rect width={1600} height={960} fill={AK.green} />
  <rect x={930} width={200} height={960}
    fill={\`url(#\${ids}-greenhatch)\`} />
</g>
<rect x={1113} y={800} width={13} height={160} fill="#e2450f" />`,
	},
	{
		title: "ロゴを置く",
		note: "最後に、中央上寄り (704, 274) へ Aikido のマークを黒 (AK.ink) で置きます。markPath(45) はサイズ 45 のマークの輪郭を返す関数で、雲と丘に囲まれた画面の主役になります。",
		code: `<g transform="translate(704 274)">
  <path d={markPath(45)} fill={AK.ink} />
</g>`,
	},
];
