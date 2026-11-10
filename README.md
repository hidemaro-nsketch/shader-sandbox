# Shader Sandbox

Three.js の TSL (Three Shading Language) でいろいろなビジュアル生成を試すためのプレイグラウンド。
各実験は 1 ルート = 1 ページで、トップページのギャラリーから開ける。

- TanStack Start (React 19 + ファイルベースルーティング)
- Three.js `WebGPURenderer` + TSL（WebGPU 非対応ブラウザでは自動で WebGL バックエンド）
- Tailwind CSS 4 / Biome / TypeScript

## 実行

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm check      # Biome の lint + format
pnpm typecheck  # tsc --noEmit
pnpm build
```

## デプロイ (Vercel)

GitHub（`hidemaro-nsketch/shader-sandbox`）を Vercel に import すればそのまま動く。
ビルド時に `VERCEL=1` が入ると nitro が `vercel` プリセットに切り替わり、`.vercel/output`（Build Output API v3）を出力する。

ダッシュボードから:

1. Vercel → Add New… → Project → `shader-sandbox` を import
2. Project Name を `hidemaro-4605` に（Framework Preset は `vercel.json` で Other に固定済み）
3. Deploy

CLI から:

```bash
npx vercel login
npx vercel link --project hidemaro-4605
npx vercel --prod
```

ローカルで Vercel 向けのビルドを確認するとき:

```bash
VERCEL=1 pnpm build   # .vercel/output が生成される
```

## 実験一覧

| ルート | 内容 |
| --- | --- |
| `/basic` | TSL の UV グラデーション + 時間アニメ（最小サンプル。ギャラリーには未掲載） |
| `/halftone` | 写真のハーフトーン（網点）化。密度・形状・角度・色モードをライブ調整、画像アップロード可 |
| `/paper-chain` | 切り絵風の人間チェーン・ポスター生成。シードごとに図形・ピクセルパッチ・注釈ラベルが変わる（PNG 書き出し可） |
| `/surface-plots` | ワイヤーフレームの3Dサーフェス（年 × 国 × 値）を並べたデータビズ風ポスター。ミント色の投影ウォール付き（PNG 書き出し可） |

## 構成

```
src/
  experiments.ts              # 実験の登録簿（SSoT: ギャラリー表示に使う）
  routes/
    index.tsx                 # ギャラリー（experiments.ts から自動生成）
    basic.tsx, halftone.tsx   # 各実験ページ
    paper-chain.tsx           # 切り絵ポスター生成ページ
    surface-plots.tsx         # サーフェスプロットポスター生成ページ
  components/
    ShaderCanvas.tsx          # 共通キャンバス（レンダラ初期化・正射影カメラ・戻るリンク）
    HalftoneControls.tsx      # ハーフトーンのパラメータパネル
    PaperPoster.tsx           # 切り絵ポスターの SVG レンダラ
    SurfacePlotPoster.tsx     # サーフェスプロットポスターの SVG レンダラ
  util/
    halftone.ts               # ハーフトーンの TSL ノードグラフ
    paperPoster.ts            # ポスターのレイアウト生成（シード RNG）
    surfacePlots.ts           # 地形データ生成 + 斜投影の計算
    shader.ts                 # TSL の小道具（アスペクト補正 UV など）
    webgpu-polyfill.ts        # WebGPU 非対応環境向けポリフィル（必ず最初に import）
public/                       # 実験で使う画像などの素材
```

## 新しい実験を追加する

1. `src/routes/<name>.tsx` を作り、`createFileRoute("/<name>")` でページを書く
   （`pnpm dev` 中なら `src/routeTree.gen.ts` は自動更新される）
2. シーンを `<ShaderCanvas>` の中に置く — レンダラの初期化・カメラ・Suspense は共通化済み

   ```tsx
   import { createFileRoute } from "@tanstack/react-router";
   import { ShaderCanvas } from "../components/ShaderCanvas";

   export const Route = createFileRoute("/waves")({
     component: () => (
       <main className="h-screen w-screen bg-slate-900 p-12">
         <ShaderCanvas className="rounded-2xl">{/* シーン */}</ShaderCanvas>
       </main>
     ),
   });
   ```

3. `public/previews/<name>.webp` にスクショを置く（1200×675 / 16:9）
4. `src/experiments.ts` に 1 エントリ追加（タイトル・プレビュー画像・タグ）。
   トップのギャラリーはこの配列から生成される

## シェーダーの書き方メモ

- マテリアルは `MeshBasicNodeMaterial` に `colorNode` を差して使う
- パラメータは `uniform()` で作り、`useMemo` で 1 回だけノードグラフを構築 →
  変更時は `uniform.value` を書き換える（ノード再構築を避けてリアルタイムに反映）
- 連続描画させたい場合は `useFrame(() => {})` を置く
- `three/webgpu` / `three/tsl` を import する前に `util/webgpu-polyfill.ts` を評価しておく必要があるが、
  `<ShaderCanvas>` 経由ならその辺は面倒を見てくれる（自前でレンダラを作る場合のみ先頭で import）
