/** One stage of the burst walkthrough; index + 1 is the `stage` passed to AikidoBurst. */
export type BurstStep = {
	title: string;
	note: string;
	code: string;
};

/** Code excerpts mirror src/components/aikido/AikidoBurst.tsx. */
export const BURST_STEPS: readonly BurstStep[] = [
	{
		title: "背景を塗る",
		note: "1600×960 の viewBox いっぱいに、ほぼ黒の長方形を 1 枚敷きます。以降の層はすべてこの上に重なります。",
		code: `<rect width={1600} height={960} fill="#1d1d1d" />`,
	},
	{
		title: "粒状パターンを重ねる",
		note: "26px 間隔で繰り返す小さな輪（「0」に見立てたもの）を <pattern> で定義し、背景と同じ大きさの長方形に塗ります。背景よりわずかに明るい線なので、ごく淡く見えます。",
		code: `<pattern id="grain" width={26} height={26} patternUnits="userSpaceOnUse">
  <circle cx={13} cy={13} r={2.6} fill="none"
    stroke="#262626" strokeWidth={1.4} />
</pattern>

<rect width={1600} height={960} fill="url(#grain)" />`,
	},
	{
		title: "ハローを描く",
		note: "バーストの中心 (810, 480) に半径 270 の細い輪を置きます。バーの内側の端がそろう目安になる、ほとんど見えない円です。",
		code: `const CENTER = { x: 810, y: 480 };

<circle cx={CENTER.x} cy={CENTER.y} r={270}
  fill="none" stroke="#1e1e1d" strokeWidth={2} />`,
	},
	{
		title: "放射状のバーを並べる",
		note: "230 本のバーを 360° に等間隔で配置します。角度に ±1° のゆらぎ、中心からの距離 (130〜300)、長さ (50〜200)、太さ (7〜11) は乱数（固定シード）で決めるので、リロードしても同じ形です。線は 44 描いて 7 空ける破線です。この段階ではすべて灰色です。",
		code: `for (let i = 0; i < 230; i++) {
  const deg = (i / 230) * 360 + range(rng, -1.0, 1.0);
  const rad = (deg * Math.PI) / 180;
  const r0 = range(rng, 130, 300);
  const len = range(rng, 50, 200);
  bars.push({
    x1: CENTER.x + Math.sin(rad) * r0,
    y1: CENTER.y - Math.cos(rad) * r0,
    x2: CENTER.x + Math.sin(rad) * (r0 + len),
    y2: CENTER.y - Math.cos(rad) * (r0 + len),
    width: range(rng, 7, 11),
  });
}

<line stroke="#3a3a3a" strokeDasharray="44 7" ... />`,
	},
	{
		title: "攻撃の当たった範囲をオレンジにする",
		note: "角度が 4 つの範囲に入るバーだけ「hot」とし、オレンジで描きます。ここで初めて絵に色が入り、攻撃が当たった方向が分かります。",
		code: `const hot =
  (deg > 150 && deg < 215) ||
  (deg > 240 && deg < 272) ||
  (deg > 296 && deg < 336) ||
  (deg > 56 && deg < 90);

<line stroke={hot ? AK.orange : "#3a3a3a"} ... />`,
	},
	{
		title: "中央にカードを置く",
		note: "バーの内側に、角丸 20 の黒いカードを重ねます。バーの内側の端がカードの後ろに隠れ、中心が空いたバーストになります。",
		code: `<rect x={537} y={345} width={533} height={255}
  rx={20} fill="#191919" />`,
	},
	{
		title: "マストヘッドを置く",
		note: "左上に小さな角丸の長方形を置いて完成です。この段階の絵は /aikido-burst と同じです。",
		code: `<rect x={365} y={52} width={212} height={40}
  rx={8} fill="#242423" />`,
	},
];
