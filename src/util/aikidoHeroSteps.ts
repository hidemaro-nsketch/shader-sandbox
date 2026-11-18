import type { WalkthroughStep } from "./aikidoSteps";

/** Code excerpts mirror src/components/aikido/AikidoHero.tsx. */
export const HERO_STEPS: readonly WalkthroughStep[] = [
	{
		title: "背景を塗る",
		note: "1600×960 の viewBox いっぱいに、淡い紙色（AK.paper）の長方形を 1 枚敷きます。以降の層はすべてこの上に重なります。",
		code: `<rect width={1600} height={960} fill={AK.paper} />`,
	},
	{
		title: "スカイラインを描く",
		note: "x = -10 から右端へ、幅 8〜38・高さ 70〜330 のタワーを、10〜34px の隙間をあけて並べます。塗りはなく、細い線（1.6px）の輪郭だけです。約 4 割のタワーには棚の横線が入ります。乱数は固定シードなので、リロードしても同じ街並みです。",
		code: `let x = -10;
while (x < AIKIDO_POSTER.width + 20) {
  const w = range(rng, 8, 38);
  const h = range(rng, 70, 330);
  towers.push({ x, y: 960 - h, w, h,
    shelf: rng() > 0.6 ? 960 - h * range(rng, 0.3, 0.6) : undefined });
  x += w + range(rng, 10, 34);
}

<g stroke={AK.hairline} strokeWidth={1.6} fill="none">…</g>`,
	},
	{
		title: "紫のデータバーを重ねる",
		note: "13.5px ピッチで縦バーを 17 点のプロファイル（高さ 150〜390）に沿って並べ、山脈の形にします。バー幅は 7.5〜12.5、高さには ±18 のゆらぎが入ります。tone が 0.82 超なら濃い紫、0.12 未満なら透明度 0.55 です。山の上には、紙色で塗った紫の枠線だけのタワーを 16 本、背後から突き出させます。",
		code: `const pitch = 13.5;
for (let i = 0; i * pitch + 14 < AIKIDO_POSTER.width - 8; i++) {
  const x = 16 + i * pitch + range(rng, 0, 2.4);
  const h = height(x / AIKIDO_POSTER.width) + range(rng, -18, 18);
  bars.push({ x, y: 960 - h, w: range(rng, 7.5, 12.5), h, tone: rng() });
}

fill={b.tone > 0.82 ? AK.violetDeep : AK.violet}
opacity={b.tone < 0.12 ? 0.55 : 1}`,
	},
	{
		title: "雲をかぶせる",
		note: "CLOUDS の 7 個の仕様（幅 130〜540、こぶ 2〜5 個）から cloudShape で雲の輪郭を作ります。紙色で塗りつぶし、2.2px の黒線で縁取るので、雲の後ろのバーとスカイラインが隠れます。縁には 1.5px の短い目盛り線が付きます。",
		code: `const CLOUDS = [
  { x: -60, y: 505, w: 380, h: 150, lumps: 3, tick: 46 },
  { x: 560, y: 430, w: 420, h: 120, lumps: 4, tick: 42 },
  { x: 1140, y: 350, w: 540, h: 140, lumps: 5, tick: 46 },
  …
];

<path d={c.d} fill={AK.paper} stroke={AK.ink} strokeWidth={2.2} />`,
	},
	{
		title: "カードの影と本体を置く",
		note: "右下に製品カードを置きます。まず黒（不透明度 0.12）の影を (702, 560) に 906×420 で、その上に白い本体を (696, 550) に 912×430 で重ね、角丸 10、黒の 2.5px 線で縁取ります。カードの <g> は translate(0 18) で 18px 下げてあります。",
		code: `<rect x={702} y={560} width={906} height={420} rx={10}
  fill={AK.ink} opacity={0.12} />
<rect x={696} y={550} width={912} height={430} rx={10}
  fill={AK.white} stroke={AK.ink} strokeWidth={2.5} />

<g transform="translate(0 18)"><Card /></g>`,
	},
	{
		title: "パンくずとタブを描く",
		note: "カード上部に、パンくず（104×27 の角丸の枠と、灰色のシェブロン 3 つ）を描き、y=672 に区切り線を引きます。その下に 5 つのタブ（Overview・Issues・Endpoints・Agents・Request Logs）を並べます。件数付きのタブには小さな丸いバッジが付き、Overview だけ 74px の下線が入ります。",
		code: `<rect x={716} y={572} width={104} height={27} rx={13.5}
  fill="none" stroke={AK.hairline} strokeWidth={1.4} />
<line x1={696} y1={672} x2={1608} y2={672}
  stroke={AK.paperDeep} strokeWidth={1.5} />

{ label: "Issues", x: 830, count: "3", pill: 876 },
{ label: "Agents", x: 1082, count: "128", pill: 1129 },`,
	},
	{
		title: "実行中パネルを描く",
		note: "タブの下 (696, 720) に 912×260 の紙色パネルを敷き、中に 872×90 の白いカードを置きます。左の 54×54 の角丸アイコンの中には、14 描いて 40 空ける破線の円（半径 9）があり、実行中のスピナーに見えます。",
		code: `<rect x={696} y={720} width={912} height={260} fill={AK.paper} />
<rect x={716} y={740} width={872} height={90} rx={8}
  fill={AK.white} stroke="#dcd9d5" strokeWidth={1.2} />
<circle cx={761} cy={785} r={9} fill="none"
  stroke={AK.inkSoft} strokeWidth={1.6} strokeDasharray="14 40" />`,
	},
	{
		title: "ステッパーとヘッダーで仕上げる",
		note: "パネルの下に、x=760〜1560 の横線と 3 つの丸（x = 760・1160・1512）のステッパーを引きます。最後の丸だけが白抜きで、まだ終わっていない段階を示します。さらに左上にロゴマーク（高さ 34）、右上に黒いボタン（162×40）、見出し位置に 132×34 の枠と矢印を置いて完成です。",
		code: `{[760, 1160, 1512].map((x, i) => (
  <circle cx={x} cy={886} r={9}
    fill={i === 2 ? AK.white : "#8b8884"} … />
))}

<AikidoMark x={58} y={42} h={34} />
<rect x={1364} y={42} width={162} height={40} fill={AK.ink} />`,
	},
];
