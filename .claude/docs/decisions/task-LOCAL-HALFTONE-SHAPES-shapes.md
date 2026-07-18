# Task: LOCAL-HALFTONE-SHAPES — ハーフトーンのシェイプパターン追加

## Meta
- linear_id: LOCAL-HALFTONE-SHAPES
- tier: S
- created: 2025-07-23
- status: completed

## Brief

### Current State
- `/halftone` ページが `feat/halftone` ブランチに実装済み（未マージ）。
- 現在のシェイプ: `circle` / `square` の2種のみ。`src/util/halftone.ts` で `mix(distCircle, distSquare, u.shape)` の2値ブレンド。
- GUI は `Segmented` ピショナリコンポーネントで circle/square を切り替え。
- `shape` uniform は 0/1 の float。

### Goal
ハーフトーンのドット形状パターンを大幅に増やす。写真に対して様々なシェイプ（円/角/菱形/六角形/十字/線/リング/三角形）でハーフトーンをかけられるようにする。

### Scope
- `src/util/halftone.ts`: 各シェイプの SDF 風距離関数を TSL で追加。`shape` uniform をインデックス(0-7)で選択 via `select` チェーン。
- `src/components/HalftoneControls.tsx`: `Segmented` を拡張して8シェイプを選べるピッカー（グリッド or ドロップダウン）に変更。
- `src/routes/halftone.tsx`: `shape` uniform 値のマッピング（シェイプ名→インデックス）を更新。

### Shapes (8)
| idx | name | SDF (p = fc - 0.5) |
|-----|------|-------------------|
| 0 | circle | length(p) |
| 1 | square | max(abs(p.x), abs(p.y)) |
| 2 | diamond | abs(p.x) + abs(p.y) |
| 3 | hexagon | max(abs(p.y), abs(0.5p.x+0.866p.y), abs(0.5p.x-0.866p.y)) |
| 4 | cross | min(abs(p.x), abs(p.y)) |
| 5 | line | abs(p.y) (横棒) |
| 6 | ring | abs(length(p) - 0.3) |
| 7 | triangle | max(p.y, -0.866p.x-0.5p.y, 0.866p.x-0.5p.y) / 0.43 * 0.5 |

### Constraints
- 新コア依存追加なし。TSL のみ。
- 既存 circle/square の挙動を維持（インデックス 0/1 は同じ）。
- `feat/halftone` ブランチに継続コミット（前タスク未マージのため同一 PR にまとめる）。

### Success Criteria
- `pnpm check` / `pnpm build` が通る。
- 8シェイプすべて GUI で切り替え可能。
- 既存の circle/square が従来通り描画される。

## Decision Log

[startproject] DECISION
- tier=S（3ファイル・単一パターン・低リスク）。
- Linear 未連携のため LOCAL-HALFTONE-SHAPES。
- feat/halftone ブランチに継続コミット（前タスク未マージ）。
- シェイプは8種（circle/square/diamond/hexagon/cross/line/ring/triangle）。SDF は distance-from-center パターンで既存 circle/square と整合。

[startproject] PRE
- タスク解釈が一意のため Gate 1 自動承認。

[team-implement] POST
- 実装完了。feat/halftone にコミット。biome check + vite build + SSR 煙証クリーン。

[team-review] POST
- 判定 PASS (self-review)。critical/major ゼロ。

[deploy] POST
- ローカルコミット完了 (e9444d9)。リモート push は権限エラーで失敗、ユーザー手動 push/PR が必要。

## Design
<!-- tier=S では詳細設計スキップ -->

## Implementation Notes

### 実装サマリー
- feat/halftone ブランチに継続コミット。tier=S 直接実装。
- `HALFTONE_SHAPES` 配列を halftone.ts に SSoT としてエクスポート（8シェイプ: circle/square/diamond/hexagon/cross/line/ring/triangle）。
- `shapeDistance(p, shape)` 関数で8シェイプの distance-from-center SDF を定義し、`select` チェーンでインデックス選択。
- GUI の shape ピッカーを `Segmented`(2値) から `ShapeGrid`(4列x2行のアイコングリッド) に拡張。各シェイプの SVG アイコンを `ShapeIcon` で描画。
- `halftone.tsx` は `HALFTONE_SHAPES.indexOf(params.shape)` でインデックス変換。

### 変更ファイル
- `src/util/halftone.ts` — `HALFTONE_SHAPES`/`HalftoneShape` エクスポート、`shapeDistance()` 追加、lum 計算を toVar で整理、`equal`/`select`/`min` import 追加。
- `src/components/HalftoneControls.tsx` — `shape` 型を `HalftoneShape` に拡張、`ShapeIcon` + `ShapeGrid` コンポーネント追加、shape ピッカー置換、SVG に `role="img"`/`aria-hidden` で a11y 対応。
- `src/routes/halftone.tsx` — `HALFTONE_SHAPES` import、shape uniform 値を indexOf でマッピング。

### シェイプ SDF 設計
すべて distance-from-center パターン（0 at center, grows outward）で既存 circle/square と整合:
- circle: length(p)
- square: max(|px|,|py|)
- diamond: |px|+|py|
- hexagon: hexagonal norm (3 strips 0°/±60°)
- cross: min(|px|,|py|) — plus shape, arm thickness scales
- line: |py| — horizontal bar
- ring: |length(p)-0.3| — annulus
- triangle: 3 outward-normal forms, normalized to 0.5 at edges

### 検証
- biome check: クリーン (13 files)。
- vite build: 成功。halftone チャンク 11.96KB（旧 10.06KB から増、新シェイプロジック反映）。
- SSR 煙証: GET /halftone → 200, ShapeGrid の8ボタンが `aria-pressed` 8個で SSR されていることを確認。

### 残課題・注意点
- 実ブラウザでの各シェイプ描画確認は未実施（headless）。`pnpm dev` で8シェイプ切り替えとドット描画を視覚確認推奨。
- triangle の SDF は近似（距離 from center で縮小）、半径 0.5 でセルいっぱいの三角形になるよう正規化済み。
- ring は固定 inner radius 0.3、厚みのみ lum 連動。


## Review

### 判定: PASS (self-review, tier=S)

### コードレビュー結果
- [minor] halftone.ts `shapeDistance` — 8シェイプ全 SDF を常に計算して `select` で選択（WGSL は両側コンパイル）。サンドボックス規模では負荷無視できるが、将来的にシェイプが増えたら switchShort の検討余地。
- [minor] triangle SDF は近似（distance-from-center パターンで他シェイプと整合させるため正規化）。視覚的に問題なければ許容。
- [minor] ring は inner radius 固定(0.3)。パラメータ化する場合は uniform 追加で対応可能。
- 品質・a11y・セキュリティ: 問題なし。`HALFTONE_SHAPES` SSoT 化で GUI/ページ/シェーダが一枚岩。

### 動作検証結果
- biome check: クリーン。
- vite build: 成功、halftone チャンク 11.96KB。
- SSR 煙証: GET /halftone → 200, ShapeGrid の8ボタン（aria-pressed x8）SSR 確認。
- 実ブラウザ WebGPU 描画は未確認（残リスク）。

### 申し送り事項
- `pnpm dev` で8シェイプの視覚確認推奨。


## Deploy

### デプロイ結果: PARTIAL（ローカルコミット完了、リモート push 権限エラー）

### 実行内容
- デプロイ日時: 2025-07-23
- feature ブランチ: feat/halftone（継続）
- コミット: e9444d9 (5 files, +317/-20)
- PR/MR: 未作成（push 失敗）

### リモート push 結果
- `git push -u origin feat/halftone` → ERROR: Permission denied to maro525（前タスクと同様）。
- ユーザー側で push 権限のあるアカウントで実行後、前タスク分と合わせて1つの PR 作成推奨:
  ```bash
  git push -u origin feat/halftone
  gh pr create --base main --head feat/halftone \
    --title "feat(halftone): halftone photo effect page with 8 dot shape patterns"
  ```

### デプロイ後検証結果
- SSR 煙証: GET /halftone → 200, ShapeGrid 8ボタン SSR 確認。
- biome check / vite build: クリーン。
- 実ブラウザ WebGPU 描画: 未確認（残リスク）。

### 申し送り事項
- `pnpm dev` で8シェイプ（circle/square/diamond/hexagon/cross/line/ring/triangle）の切り替えとドット描画を視覚確認推奨。

