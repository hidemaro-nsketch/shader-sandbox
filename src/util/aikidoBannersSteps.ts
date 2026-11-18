import type { WalkthroughStep } from "./aikidoSteps";

/** Code excerpts mirror src/components/aikido/AikidoBanners.tsx. */
export const BANNERS_STEPS: readonly WalkthroughStep[] = [
	{
		title: "オレンジの地に暗いカードを置く",
		note: "1600×960 の viewBox をオレンジで塗り、左に 579×689 の暗いカード（CARD_A）を置きます。カードの中身は clipPath で切るので、以降の層がはみ出しても見えません。",
		code: `const CARD_A = { x: 154, y: 135, w: 579, h: 689 };

<rect width={1600} height={960} fill={AK.orange} />

<g clipPath={clip("dark")}>
  <rect x={CARD_A.x} y={CARD_A.y}
    width={CARD_A.w} height={CARD_A.h} fill={AK.night} />
</g>`,
	},
	{
		title: "レンガの壁を敷く",
		note: "高さ 34px の行を重ね、幅 92px（±6）の角丸の輪郭を 100px 間隔で並べます。偶数行は -52、奇数行は +4 ずらすので、レンガ積みのように見えます。幅のゆらぎだけ乱数（固定シード）です。",
		code: `const rowH = 34;
for (let row = 0; row * rowH < height; row++) {
  const offset = row % 2 === 0 ? -52 : 4;
  for (let x = offset; x < width; x += 100) {
    bricks.push({
      x: round(left + x),
      y: round(top + row * rowH + 5),
      w: round(92 + range(rng, -6, 6)),
    });
  }
}`,
	},
	{
		title: "黄色いトンネルの弧を描く",
		note: "中心 (461, 532) から、半径 310 を 20 ずつ減らした 15 本の半円を描きます。線は 100 描いて 8 空ける破線で、弧ごとに 31 ずつ開始位置をずらすので、レンガのように段がずれます。高さ 560 の clipPath で下側を切ります。",
		code: `for (let i = 0; i < 15; i++) {
  const r = 310 - i * 20;
  arcs.push({
    d: \`M\${round(cx - r)} \${cy}A\${r} \${r} 0 0 1 \${round(cx + r)} \${cy}\`,
    r,
    offset: i * 31,
  });
}

<path d={arc.d} stroke={AK.yellow} strokeWidth={8}
  strokeDasharray="100 8" strokeDashoffset={arc.offset} />`,
	},
	{
		title: "紫の帯を通す",
		note: "内側から 5 本目〜10 本目の 6 本について、角度 124° から 56° までの中央部分だけを紫で重ね描きします。弧ごとに破線の位置を 7 ずつずらして、帯が斜めに流れて見えるようにしています。",
		code: `{arcs.slice(4, 10).map((arc, i) => (
  <path d={arcSpan(arc.r, 124, 56)}
    stroke={AK.violet} strokeWidth={8}
    strokeDasharray="100 8"
    strokeDashoffset={arc.offset + 50 + i * 7} />
))}`,
	},
	{
		title: "暗いカードにロゴを添える",
		note: "カードの左下 (182, 732) に、高さ 26 のマークを紙色で置きます。暗いカードはこれで完成です。",
		code: `<PanelLogo x={182} y={732} h={26} color={AK.paper} />`,
	},
	{
		title: "明るいカードと淡いレンガ列を置く",
		note: "右に 678×689 の明るいカード（CARD_B）を置きます。中心 (1040, 1560) の大きな円に沿って、半径 780 から 56 ずつ増やした 9 本の弧を、56 描いて 11 空ける淡い灰色の破線で描きます。太さは 22 と 18 を交互にします。",
		code: `const CARD_B = { x: 766, y: 135, w: 678, h: 689 };

const r = 780 + i * 56;
arcs.push({ d: ..., width: i % 2 === 0 ? 22 : 18 });

<g fill="none" stroke="#e8e8e6" strokeDasharray="56 11">
  {rings.map((ring) => (
    <path d={ring.d} strokeWidth={ring.width} />
  ))}
</g>`,
	},
	{
		title: "カプセルの輪郭とロゴを置く",
		note: "明るいカードの左右の縁に、縦長の楕円の輪郭を 2 つずつ置きます（rx 86 / 120）。細い灰色の線 1.6px です。カード上部の (1005, 183) には、高さ 32 のワードマークを墨色で置きます。",
		code: `<g fill="none" stroke="#cfcfcd" strokeWidth={1.6}>
  <ellipse cx={752} cy={420} rx={86} ry={206} />
  <ellipse cx={746} cy={420} rx={120} ry={232} />
  <ellipse cx={1462} cy={420} rx={86} ry={206} />
  <ellipse cx={1468} cy={420} rx={120} ry={232} />
</g>

<PanelLogo x={1005} y={183} h={32} color={AK.ink} />`,
	},
	{
		title: "バグだらけの球体を置く",
		note: "上下に紫のカプセル（106×30）を置き、中心 (1055, 447)、rx 96・ry 130 の黄色い楕円を描きます。その中に、青い四角 190 個を散らします。位置は楕円の内側にまばらに落ち、1 辺は 6〜12 です。バグを表す紙吹雪です。",
		code: `for (let i = 0; i < 190; i++) {
  const a = rng() * Math.PI * 2;
  const r = Math.sqrt(rng());
  dots.push({
    x: round(1066 + Math.cos(a) * r * 100),
    y: round(447 + Math.sin(a) * r * 128),
    s: round(range(rng, 6, 12)),
  });
}

<ellipse cx={1055} cy={447} rx={96} ry={130} fill={AK.yellow} />`,
	},
	{
		title: "縫い目・フィルタ・出荷コードを重ねる",
		note: "ビーチボールの縫い目を 2 本、右側に紫のフィルタ、さらに右に緑の帯（幅 56、高さ 234）を重ねます。球体の中のバグが、フィルタを通って緑のコードだけになる流れを表します。縫い目とフィルタは球体の clipPath の内側です。",
		code: `<path d="M1010 320a120 128 0 0 1 0 258" />
<path d="M1052 316a112 131 0 0 1 0 262" />

<path d="M1100 320a112 127 0 0 1 0 254l40 0 0-254z"
  fill={AK.violet} />

<g clipPath={clip("code")}>
  <rect x={1160} y={330} width={56} height={234} fill={AK.green} />
</g>`,
	},
	{
		title: "吹き出しの印を付ける",
		note: "球体の左上 (862, 316) と右下 (1256, 557) に、12px のオレンジの四角を置き、それぞれ細い折れ線を墨色で伸ばします。ここで完成です。",
		code: `<rect x={862} y={316} width={12} height={12} fill={AK.orange} />
<path d="M900 336v56h46" fill="none" stroke={AK.ink} strokeWidth={1.6} />
<rect x={1256} y={557} width={12} height={12} fill={AK.orange} />
<path d="M1262 553v-38h-58" fill="none" stroke={AK.ink} strokeWidth={1.6} />`,
	},
];
