# Task: LOCAL-HALFTONE — ハーフトーン実験ページ（写真エフェクト + 右側GUI）

## Meta
- linear_id: LOCAL-HALFTONE
- tier: M
- created: 2025-07-23
- status: completed

## Brief

### Current State
- shader-sandbox は TanStack Start (React 19 SSR) + Vite + Tailwind v4 の WebGPU シェーダー実験環境。
- シェーダー描画は `@react-three/fiber` の `<Canvas>` + `three/webgpu` (`WebGPURenderer`) + `three/tsl` (TSL) パターン。`forceWebGL: !navigator.gpu` でフォールバック。
- 既存サンプル: `/basic`（UVグラデ + sin time）。`src/util/shader.ts` に `screenAspectUV` ヘルパ。
- `src/routes/index.tsx` に `shaders` 配列でカード一覧を管理。`src/components/Header.tsx` にナビ（未使用だがリンク追加で整合性維持）。
- GUI ライブラリなし（leva 等 未導入）。

### Goal
写真に対してハーフトーン（網点）エフェクトをかけ、右側のGUIで複数パラメータをリアルタイム操作できる新しいページ `/halftone` を追加する。

### Scope
- `/halftone` ルート新設: 全画面キャンバス（左）+ 右側コントロールパネルのレイアウト。
- TSL ハーフトーンノード: グリッド分割 → セル中心でテクスチャサンプリング → 輝度→ドット半径 → ドット描画。
- GUI: スライダー / トグル / カラーピッカー / 画像アップロード を自前 Tailwind 実装（新依存なし）。
- デフォルトサンプル画像を `public/` に配置。
- `index.tsx` と `Header.tsx` に `/halftone` エントリ追加。

### Constraints
- 新コア依存追加は Hard Trigger（自動L）のため避ける。GUI は Tailwind 自前実装。
- 保護ブランチ main 上なので feature ブランチで作業。
- WebGPU 非対応環境では WebGL フォールバック（既存パターン踏襲）。
- TSL の `texture()`, `mix`, `step`, `dot`, `floor`, `fract`, `cos/sin`, `oneMinus` 等を利用（API確認済）。

### Success Criteria
- `pnpm dev` で `/halftone` が開き、デフォルト写真にハーフトーンがかかる。
- 右パネルの各スライダー/トグル/カラーがリアルタイムに反映される。
- ユーザー画像アップロードが機能する。
- `pnpm build` と `pnpm check`(biome) が通る。

## Decision Log

[startproject] DECISION
- tier=M 採用（5ファイル・複数パターン・中リスク）。
- Linear 連携なしのためローカル ID `LOCAL-HALFTONE` 使用。
- GUI ライブラリ（leva等）は新コア依存で Hard Trigger になるため導入せず、Tailwind 自前コントロールで実装。
- ハーフトーンは TSL でフル実装（ポストプロセスではなく、全画面 plane + MeshBasicNodeMaterial.colorNode パターン。basic.tsx 踏襲）。

[startproject] PRE
- 設計相談ツール(opencode/gemini)未導入のため Lead が直接設計。
- TSL API を `node_modules/three/build/three.tsl.js` で確認: texture/mix/select/step/lessThan/luminance/rotate/oneMinus/floor/fract/dot/cos/sin/saturate 利用可能。

[team-implement] POST
- 実装完了。feature ブランチ feat/halftone。biome check + vite build クリーン。
- Linear 未連携のためコメント投稿はスキップ。

[team-review] POST
- 判定 PASS (Quality + Security 並列レビュ、critical/major ゼロ)。
- SSR 煙証で /halftone 200 レンダリング確認。実ブラウザ WebGPU 描画は残リスク。
- Linear 未連携のためスキップ。

[deploy] POST
- ローカルコミット完了 (65cb730)。リモート push は SSH 権限エラーで失敗、ユーザー手動 push/PR が必要。
- SSR 煙証確認済み。

## Design

### レイアウト
```
┌────────────────────────────┬──────────────┐
│                            │  Controls    │
│   R3F <Canvas>             │  (右 360px)  │
│   ハーフトーン描画          │  スライダー   │
│   (左 flex-1)              │  トグル       │
│                            │  カラー       │
│                            │  画像UP       │
└────────────────────────────┴──────────────┘
```
- ヘッダなし・全画面（basic.tsx と同様の没入レイアウト）。左キャンバス + 右パネル。
- 戻るリンク（Home）をパネル上部に配置。

### TSL ハーフトーン設計
ヘルパ `src/util/halftone.ts` に `halftoneNode(params)` を TSL `Fn` で定義。

入力（uniform / パラメータ）:
- `tex` (Texture)
- `uv` (vec2) — テクスチャUV
- `cells` (float) — 軸あたりセル数（ドット密度）
- `dotScale` (float) — ドット半径倍率
- `angle` (float) — グリッド回転(rad)
- `contrast` (float), `brightness` (float)
- `invert` (float 0/1)
- `shape` (float 0/1) — 0:円 / 1:角
- `tint` (vec3), `bgColor` (vec3)
- `colorMode` (float 0/1) — 0:モノクロ(輝度→tint色) / 1:カラー保持(元色ドット)

処理:
1. UV を `angle` で回転（グリッド全体を回転させるため）。
2. `cell = rotUV * cells`; `cellId = floor(cell)`; `cellCenter = (cellId + 0.5) / cells`。
3. `sampleUv = cellCenter`（回転済みUV空間でサンプリング → 自然な結果）。`col = texture(tex, sampleUv).rgb`。
4. 輝度 `lum = dot(col, vec3(0.299,0.587,0.114))` → brightness/contrast 補正 → clamp(0,1) → invert(mix)。
5. フラグメントのセル内位置 `fc = fract(cell)`; 距離 `dCircle = length(fc - 0.5)`; `dSquare = max(abs(fc.x-0.5), abs(fc.y-0.5))`; `d = mix(dCircle, dSquare, shape)`。
6. `radius = lum * 0.5 * dotScale`; `mask = step(d, radius)`（1=ドット内, 0=外）。
7. `dotColor = mix(tint, col, colorMode)`; 出力 `mix(bgColor, dotColor, mask)`。

### GUI コンポーネント `src/components/HalftoneControls.tsx`
- props: `params` オブジェクト + `onChange(key, value)` + `onImageUpload(file)` + `onResetSample`。
- Tailwind でスライダー(range input スタイル)、トグル(button group)、カラー(input type=color + hex表示)、画像アップロード(input file + drag overlay)。
- スライダー: cells(10–250), dotScale(0–1.5), angle(0–π), contrast(0–2), brightness(-1–1)。
- トグル: invert, shape(circle/square), colorMode(mono/color)。
- カラー: tint, bgColor。
- 画像: アップロード button + 「サンプルに戻す」。
- パネルは `overflow-y-auto`、`bg-slate-900/80`、`backdrop-blur`。

### ページ `src/routes/halftone.tsx`
- `useState` で params 管理。`useMemo` で TSL uniforms と colorNode 構築。
- Canvas は basic.tsx と同じ `WebGPURenderer` 初期化パターン。
- 画像は `useLoader(TextureLoader, url)` で読込（Suspense）。アップロード時は `new TextureLoader().load(objectURL)` を state で差し替え。
- テクスチャのアスペクトを保つため plane スケール調整は `useThree(viewport)` で行う。
- `HalftoneControls` を Canvas 外（兄弟 div）に配置。Canvas は `pointerEvents: none`。

### ルート登録
- `src/routes/index.tsx` の `shaders` 配列に halftone エントリ追加。
- `src/components/Header.tsx` のナビに Halftone リンク追加。

### 実装タスクリスト
1. feature ブランチ `feat/halftone` 作成。
2. サンプル画像を `public/sample-photo.jpg` に配置。
3. `src/util/halftone.ts`: halftoneNode TSL Fn 実装。
4. `src/components/HalftoneControls.tsx`: GUI パネル実装。
5. `src/routes/halftone.tsx`: ページ統合。
6. `src/routes/index.tsx` / `src/components/Header.tsx`: エントリ追加。
7. `pnpm check` + `pnpm build` 検証。

## Implementation Notes

### 実装サマリー
- feature ブランチ `feat/halftone` で実装。
- TSL ハーフトーンノードを `Fn` closure パターン（basic.tsx 準拠）で構築。UV回転 → グリッド量子化 → セル中心サンプリング → 輝度→ドット半径 → ドット描画。
- GUI は Tailwind 自前実装（新依存なし）。スライダー / セグメント / トグル / カラーピッカー / 画像アップロード。
- uniform は初回 `useMemo` で生成し、パラメータ変更は `useEffect` で `.value` を in-place 更新（TSL ノードグラフ再構築回避）。
- 画像は `useLoader(TextureLoader, url)` で読込、アップロード時は ObjectURL を差し替え。アスペクト比を保ってレターボックス表示。

### 変更ファイル
- `public/sample-photo.jpg` — サンプル風景写真 (1200x800, picsum) を新規配置。
- `src/util/halftone.ts` — `buildHalftoneColorNode(u)` TSL Fn と `HalftoneUniforms` 型を新規実装。
- `src/components/HalftoneControls.tsx` — 右側コントロールパネル (360px) を新規実装。
- `src/routes/halftone.tsx` — `/halftone` ページ。左キャンバス + 右パネルの flex レイアウト、WebGPURenderer 初期化（既存パターン踏襲）。
- `src/routes/index.tsx` — shaders 配列に Halftone エントリ追加。
- `src/components/Header.tsx` — ナビに Halftone リンク追加、既存 button に `type="button"` を付与 (a11y)。
- `src/styles.css` — `.halftone-range` スライダースタイル追加。
- `vite.config.ts`, `src/routes/__root.tsx`, `src/util/shader.ts`, `src/routes/basic.tsx` — biome organizeImports による自動整形（ロジック変更なし）。

### 検証
- `biome check`: クリーン (13 files, no errors)。
- `vite build`: 成功 (client + SSR + nitro)。halftone チャンク生成確認、routeTree.gen.ts に /halftone 登録反映。
- 備考: `tsc --noEmit` は既存の `three/tsl` 型エクスポート不足（ShaderNodeObject/UniformNode）や WebGPURenderer 型の非互換が basic.tsx 含め従来から存在。本プロジェクトは vite build（型チェック省略）が本番ゲートのため影響なし。

### 残課題・注意点
- 実ブラウザでの WebGPU レンダリング確認は未実施（headless 環境のため）。レビュアーが `pnpm dev` で /halftone を開いてドット描画・パラメータ反映を確認推奨。
- `three.tsl` チャンクが 1.48MB と大きい（既存 basic と同等）。コード分割検討は別タスク。

## Review

### 判定: PASS

tier=M で Quality + Security レビュアを並列起動。両者とも critical / major ゼロ。全指摘は [minor] のポライト項目。

### コードレビュー統合結果
Quality (refs: basic.tsx / shader.ts パターン準拠、SRP分解、a11y type=button / role=switch):
- [minor] halftone.ts:74-75 — クランプの関数形式(max)とメソッド形式(.min)が混在。統一推奨。
- [minor] halftone.ts:72-76 — `let lum` の再代入が他変数の .toVar() パターンと異なる。chaining or toVar 推奨。
- [minor] halftone.tsx:96-119 — hex→Color 変換が useMemo 初期化と useEffect 同期で重複。applyParams ヘルパ推奨。
- [minor] halftone.tsx:194 — `useFrame(()=>{})` で常時レンダリングループ。frameloop="demand" + invalidate 検討（実験サンドボックスなら許容）。
- [minor] halftone.tsx:160-164 — texture.image の HTMLImageElement キャストが unchecked。ガード推奨。
- [minor] 設計 doc は halftoneNode、実装は buildHalftoneColorNode。doc/code 同期推奨。

Security (client-only、影響は自己セッションのみ):
- [minor] HalftoneControls.tsx:172 / halftone.tsx:48 — file.type/size 検証なし。accept="image/*" は UI ヒントのみ。file.type が image/ 且つ size 上限チェック推奨。
- [minor] halftone.tsx — useLoader 失敗時の ErrorBoundary なし。非画像アップロードでルート崩落。ErrorBoundary + フォールバック UI 推奨。
- [minor] halftone.tsx:104 — 画像差替時に旧テクスチャの dispose / useLoader.clear なし。繰り返しアップロードでメモリ増加可能性。
- [minor] halftone.tsx:24 — hexToRgb の入力検証なし（現状は <input type=color> のみなので安全）。
- 安全確認: XSS なし(React 自動エスケープ)、ObjectURL ライフサイクル適正(revoke 順序正)、シェーダ入力は全て数値/型付きで文字列補差なし、ナビは静的 Link のみ。

### 動作検証結果
- biome check: クリーン (13 files)。
- vite build: 成功 (client + SSR + nitro)。/halftone チャンク生成、routeTree に /halftone 反映。
- SSR 煙証: preview サーバで GET /halftone → 200, HTML に "Halftone"/"Density"/"sample-photo" 含まれる。GET / → "Halftone" カード表示確認。SSR 崩落なし。
- 実ブラウザ WebGPU 描画確認は headless 環境のため未実施（残リスク: ドット描画・パラメータ反映の視覚確認は `pnpm dev` で要確認）。

### 申し送り事項（minor）
- deploy 後、ユーザーが `pnpm dev` で /halftone を開き WebGPU/WebGL でハーフトーンが描画され、スライダー/カラー/アップロードがリアルタイム反映されることを確認推奨。
- 次タスク候補: ファイル検証 + ErrorBoundary + テクスチャ dispose の本格化、frameloop demand 化、doc/code 名寄せ。


## Deploy

### デプロイ結果: PARTIAL（ローカルコミットまで完了、リモート push は権限エラー）

### 実行内容
- デプロイ日時: 2025-07-23
- feature ブランチ: feat/halftone
- コミット: 65cb730 (17 files, +1113/-253)
- PR/MR: 未作成（push 失敗のため）

### リモート push 結果
- `git push -u origin feat/halftone` → ERROR: Permission to hidemaro-nsketch/shader-sandbox.git denied to maro525.
- 原因: 環境の SSH 認証ユーザ (maro525) にリポジトリへの push 権限がない。
- ユーザー側で push 権限のあるアカウントで `git push -u origin feat/halftone` を実行後、`gh pr create --base main --head feat/halftone --title "feat(halftone): add halftone photo effect page with live GUI controls"` で PR 作成してください。

### デプロイ後検証結果
- SSR 煙証: preview サーバで GET /halftone → 200, HTML に "Halftone"/"Density"/"sample-photo" 含まれる。GET / → Halftone カード表示。SSR 崩落なし。
- biome check / vite build: クリーン。
- 実ブラウザ WebGPU 描画確認: headless 環境のため未実施（残リスク）。

### 申し送り事項
- ユーザーが `pnpm dev` で /halftone を開き、ハーフトーン描画と GUI パラメータ反映を視覚確認推奨。
- team-review の minor 指摘（ファイル検証 / ErrorBoundary / テクスチャ dispose / frameloop demand / doc-code 名寄せ）は次タスクで対応推奨。

