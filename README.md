# パーティクルアニメーション

Next.js × Canvas APIで実装する、奥から手前に光が飛んでくる3D風エフェクト

## 特徴

- **ライブラリ不要** - Canvas APIのみで実装
- **軽量** - 追加の依存関係なし
- **カスタマイズ可能** - 速度・色・数を自由に調整

## クイックスタート

1. コンポーネントを作成
```bash
app/components/WarpSpeedParticles.tsx
```

2. ページで使用
```tsx
import WarpSpeedParticles from "./components/WarpSpeedParticles";

export default function Home() {
  return <WarpSpeedParticles />;
}
```

3. 開発サーバー起動
```bash
npm run dev
```

## カスタマイズ
```tsx
const numStars = 300;              // パーティクルの数
this.speed = Math.random() * 8 + 4; // 速度
const hue = Math.random() * 60 + 280; // 色（280=ピンク, 160=シアン）
```

## 技術スタック

- Next.js 16
- TypeScript
- Canvas API
- React Hooks (useRef, useEffect)

## 📖 仕組み

1. **Z座標で奥行き管理** - 大きい値=奥、小さい値=手前
2. **遠近法で2D投影** - `scale = 画面幅 / z座標`
3. **毎フレーム更新** - Z座標を減らして手前に移動
