import type { WalkthroughStep } from "./aikidoSteps";

/** Code excerpts mirror src/components/aikido/AikidoContainer.tsx. */
export const CONTAINER_STEPS: readonly WalkthroughStep[] = [
	{
		title: "背景を塗る",
		note: "1600×960 の viewBox いっぱいに、ほぼ黒の長方形を 1 枚敷きます。立方体を浮かび上がらせる土台です。",
		code: `<rect width={1600} height={960} fill="#191918" />`,
	},
	{
		title: "背景のボックスを散らす",
		note: "幅 40〜96、高さ 110〜320 の細い枠線の長方形を 34 個、固定シードの乱数でばらまきます。線は背景よりわずかに明るいだけなので、ごく淡いコンテナ置き場のように見えます。",
		code: `for (let i = 0; i < 34; i++) {
  boxes.push({
    x: round(range(rng, -20, 1560)),
    y: round(range(rng, 0, 920)),
    w: round(range(rng, 40, 96)),
    h: round(range(rng, 110, 320)),
  });
}

<g stroke="#262625" strokeWidth={1.4} fill="none">`,
	},
	{
		title: "立方体の上面を作る",
		note: "13×13 マスの上面を、iso() でアイソメトリック座標（A=24, B=12 の半セル）に変換して暗い菱形にします。その上に 169 個の六角形の「ナット」を並べ、明るさは乱数で 2 段階に振り分けます。",
		code: `const iso = (i: number, j: number, k: number): Pt => ({
  x: CX + (i - j) * A,
  y: CY + (i + j) * B - k * C,
});

<polygon
  points={poly([iso(0, 0, K), iso(N, 0, K), iso(N, N, K), iso(0, N, K)])}
  fill="#252524"
/>
{caps.map((c) => <VoxelCap p={c.p} tone={c.tone} />)}`,
	},
	{
		title: "青い側面を積む",
		note: "右の面（+i）と左の面（+j）に、高さ 14 段 × 幅 13 マス × 2 面＝364 枚の青いボクセル面を貼ります。#2f63ff と #2a58e6 の 2 色を乱数で混ぜ、細い濃青の線で区切ります。",
		code: `for (let k = 0; k < K; k++) {
  for (let n = 0; n < N; n++) {
    const right = [iso(N, n, k), iso(N, n + 1, k),
      iso(N, n + 1, k + 1), iso(N, n, k + 1)];
    ...
    list.push({ pts: poly(right), tone: rng() });
  }
}

<g stroke="#1b46c4" strokeWidth={0.8}>`,
	},
	{
		title: "黄色いパイプを巻く",
		note: "上面の高さ K=14 の縁（左角 → 手前角 → 右角）に、太さ 2.2 の黄色い線を通します。両端は角から 5 セル分外へ延ばし、端に半径 6、途中に半径 4.2 の点を打ってコネクタに見立てます。",
		code: `const extL = { x: waistL.x - A * 5, y: waistL.y - B * 5 };
const extR = { x: waistR.x + A * 5, y: waistR.y - B * 5 };

<g stroke={AK.yellow} strokeWidth={2.2} fill="none">
  <path d={\`M\${extL.x} \${extL.y}L\${waistL.x} \${waistL.y}...\`} />
</g>`,
	},
	{
		title: "オレンジの鍵を 4 つ付ける",
		note: "青い面の 4 か所に、26px の鍵を置きます。オレンジの四角に黒い南京錠、四隅に黄色いブラケットを重ねた部品です。下の 2 つは scale={0.86} でやや小さくして、奥行きを出します。",
		code: `<Lock p={iso(1.6, N, 9.4)} />
<Lock p={iso(N, 3.6, 10.2)} />
<Lock p={iso(9.2, N, 1.1)} scale={0.86} />
<Lock p={iso(N, 9.2, 1.1)} scale={0.86} />`,
	},
	{
		title: "ワードマークとボタンを置く",
		note: "上部 (686, 74) に高さ 58 のロゴマークを紙色で描き、下部に幅 304×高さ 44 の角丸ボタンを置きます。ボタンの右端には矢印（›）を 1 本描いて完成です。",
		code: `<g transform="translate(686 74)">
  <path d={markPath(58)} fill={AK.paper} />
</g>

<rect x={652} y={862} width={304} height={44} rx={6} fill="#2e2e2d" />
<path d="M890 879l5 5-5 5" fill="none"
  stroke="#dcdad6" strokeWidth={1.6} />`,
	},
];
