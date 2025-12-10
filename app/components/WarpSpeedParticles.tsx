"use client";

import { useEffect, useRef } from "react";

// 星（光の筋）クラスを定義
class Star {
  x: number = 0;
  y: number = 0;
  z: number;
  prevX: number = 0;
  prevY: number = 0;
  angle: number;
  color: string;
  speed: number;

  constructor(canvasWidth: number) {
    this.z = Math.random() * canvasWidth;
    this.angle = Math.random() * Math.PI * 2;

    // 色をピンク〜シアンのグラデーションに
    const hue =
      Math.random() < 0.5
        ? Math.random() * 60 + 280 // ピンク〜紫 (280-340)
        : Math.random() * 60 + 160; // シアン〜緑 (160-220)

    this.color = `hsl(${hue}, 80%, 60%)`;
    this.speed = Math.random() * 5 + 2; // 光の速さ
    this.reset(canvasWidth);
  }

  reset(canvasWidth: number) {
    this.z = canvasWidth;
    this.angle = Math.random() * Math.PI * 2;

    const hue =
      Math.random() < 0.5
        ? Math.random() * 60 + 280
        : Math.random() * 60 + 160;
    this.color = `hsl(${hue}, 80%, 60%)`;
  }

  update(canvas: HTMLCanvasElement) {
    // Z軸方向に移動（手前に近づく）
    this.z -= this.speed;

    // 画面手前まで来たらリセット
    if (this.z <= 0) {
      this.reset(canvas.width);
    }

    // 3D→2D変換
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 遠近感の計算
    const scale = canvas.width / this.z;

    this.x = centerX + Math.cos(this.angle) * scale * 100;
    this.y = centerY + Math.sin(this.angle) * scale * 100;

    // 前のフレームの位置も計算（軌跡を描くため）
    const prevZ = this.z + this.speed;
    const prevScale = canvas.width / prevZ;
    this.prevX = centerX + Math.cos(this.angle) * prevScale * 100;
    this.prevY = centerY + Math.sin(this.angle) * prevScale * 100;
  }

  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // 画面外は描画しない
    if (
      this.x < -100 ||
      this.x > canvas.width + 100 ||
      this.y < -100 ||
      this.y > canvas.height + 100
    ) {
      return;
    }

    // Z値に応じて透明度と太さを変える
    const alpha = 1 - this.z / canvas.width;
    const lineWidth = (1 - this.z / canvas.width) * 3;

    // 光の軌跡を描く
    ctx.strokeStyle = this.color.replace("60%", `60%, ${alpha})`).replace(")", "");
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(this.prevX, this.prevY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    // 先端に光る点を描く
    ctx.fillStyle = this.color.replace("60%", `80%, ${alpha})`).replace(")", "");
    ctx.beginPath();
    ctx.arc(this.x, this.y, lineWidth * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // グロー効果
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color.replace("60%", `90%, ${alpha * 0.5})`).replace(")", "");
    ctx.beginPath();
    ctx.arc(this.x, this.y, lineWidth * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export default function WarpSpeedParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    const numStars = 20; //光の数
    let animationId: number;

    // Canvasのサイズをウィンドウに合わせる
    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    }

    // 星を初期化
    function initStars() {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push(new Star(canvas!.width));
      }
    }

    // アニメーションループ
    function animate() {
      if (!ctx || !canvas) return;

      // 軌跡を残すために完全にクリアせず、半透明の黒で塗る
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 中心にグローを追加（ワープポイント感）
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        200
      );
      gradient.addColorStop(0, "rgba(100, 100, 255, 0.05)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // すべての星を更新・描画
      stars.forEach((star) => {
        star.update(canvas);
        star.draw(ctx, canvas);
      });

      animationId = requestAnimationFrame(animate);
    }

    // リサイズ対応
    window.addEventListener("resize", resizeCanvas);

    // 初期化と開始
    resizeCanvas();
    animate();

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
      />

      {/* コンテンツ */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          color: "white",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontSize: "5rem",
            marginBottom: "1rem",
            textShadow: "0 0 30px rgba(255, 100, 200, 0.8)",
            letterSpacing: "0.5rem",
            fontWeight: 300,
            background: "linear-gradient(45deg, #ff69b4, #00ffff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          PARTICLE?
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            opacity: 0.6,
            letterSpacing: "0.2rem",
          }}
        >
          SAMPLE
        </p>
      </div>
    </div>
  );
}
