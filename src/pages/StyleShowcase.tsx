import { motion } from "framer-motion";

/**
 * StyleShowcase - 样式展示页面
 * 展示所有新的视觉增强效果
 */
export default function StyleShowcase() {
  return (
    <div className="min-h-screen p-4 sm:p-8 space-y-8">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold terminal-text">
          AgentPayGuard Style Showcase
        </h1>
        <p className="text-muted-foreground text-lg">
          探索超级酷炫的赛博朋克视觉效果
        </p>
      </motion.div>

      {/* 高级3D和特效 */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold gradient-text-animated">
          🚀 高级3D与特效
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 3D透视卡片 */}
          <div className="card-3d terminal-card">
            <h3 className="text-lg font-bold mb-2 text-terminal-amber">
              3D Perspective Card
            </h3>
            <p className="text-sm text-muted-foreground">
              悬停时呈现3D透视旋转效果
            </p>
          </div>

          {/* 液态金属效果 */}
          <div className="liquid-metal terminal-card">
            <h3 className="text-lg font-bold mb-2 text-terminal-emerald">
              Liquid Metal
            </h3>
            <p className="text-sm text-muted-foreground">
              流动的液态金属质感
            </p>
          </div>

          {/* 镜面倒影 */}
          <div className="mirror-card terminal-card">
            <h3 className="text-lg font-bold mb-2 text-terminal-amber">
              Mirror Reflection
            </h3>
            <p className="text-sm text-muted-foreground">
              卡片下方自动生成镜面倒影
            </p>
          </div>

          {/* 等离子效果 */}
          <div className="plasma-effect glass-premium">
            <h3 className="text-lg font-bold mb-2 terminal-text">
              Plasma Effect
            </h3>
            <p className="text-sm text-muted-foreground">
              三色等离子体流动效果
            </p>
          </div>

          {/* 全息箔纸 */}
          <div className="holographic-foil terminal-card">
            <h3 className="text-lg font-bold mb-2 gradient-text-animated">
              Holographic Foil
            </h3>
            <p className="text-sm text-muted-foreground">
              全息箔纸彩虹流光
            </p>
          </div>

          {/* 能量护盾 */}
          <div className="energy-shield glass-premium">
            <h3 className="text-lg font-bold mb-2 text-terminal-amber">
              Energy Shield
            </h3>
            <p className="text-sm text-muted-foreground">
              能量护盾脉冲效果
            </p>
          </div>
        </div>
      </section>

      {/* 动态扫描效果 */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold terminal-text">
          ⚡ 动态扫描效果
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 霓虹扫描线 */}
          <div className="neon-scanlines glass-premium">
            <h3 className="text-lg font-bold mb-2 text-terminal-emerald">
              Neon Scanlines
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              持续移动的霓虹扫描线
            </p>
            <div className="text-xs text-terminal-amber">
              ● 永久动画
            </div>
          </div>

          {/* 光束扫描 */}
          <div className="light-beam glass-premium">
            <h3 className="text-lg font-bold mb-2 text-terminal-amber">
              Light Beam Scan
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              强光束对角扫描
            </p>
            <div className="text-xs text-terminal-emerald">
              ● 6秒循环
            </div>
          </div>

          {/* 数字雨 */}
          <div className="digital-rain glass-premium">
            <h3 className="text-lg font-bold mb-2 terminal-text">
              Digital Rain
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              黑客帝国风格数字雨
            </p>
            <div className="text-xs text-terminal-emerald">
              ● 8秒循环
            </div>
          </div>
        </div>
      </section>

      {/* 粒子和网格效果 */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold gradient-text-animated">
          ✨ 粒子与网格
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 浮动粒子 */}
          <div className="floating-particles glass-premium">
            <h3 className="text-lg font-bold mb-2 terminal-text">
              Floating Particles
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              背景中漂浮的发光粒子
            </p>
            <div className="stat-number text-terminal-amber">
              8+
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              彩色粒子永久漂浮
            </p>
          </div>

          {/* 赛博网格 */}
          <div className="cyber-grid glass-premium">
            <h3 className="text-lg font-bold mb-2 text-terminal-emerald">
              Cyber Grid
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              持续移动的赛博网格背景
            </p>
            <div className="text-xs text-terminal-amber">
              ● 30x30 网格
            </div>
          </div>
        </div>
      </section>

      {/* 霓虹和边框效果 */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold terminal-text">
          💎 霓虹边框效果
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 霓虹边框脉冲 */}
          <div className="neon-border-pulse p-6">
            <h3 className="text-lg font-bold mb-2 gradient-text-animated">
              Neon Border Pulse
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              三色流动边框 + 脉冲发光
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded bg-terminal-amber/20 text-terminal-amber text-xs">
                琥珀金
              </span>
              <span className="px-3 py-1 rounded bg-terminal-emerald/20 text-terminal-emerald text-xs">
                翡翠绿
              </span>
              <span className="px-3 py-1 rounded bg-info/20 text-info text-xs">
                蓝色
              </span>
            </div>
          </div>

          {/* 故障扭曲 */}
          <div className="glitch-distortion glass-premium">
            <h3 className="text-lg font-bold mb-2 text-terminal-amber">
              Glitch Distortion
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              随机故障扭曲 + 色相旋转
            </p>
            <div className="text-xs text-terminal-emerald">
              ● 每5秒触发一次
            </div>
          </div>
        </div>
      </section>

      {/* 组合效果展示 */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold gradient-text-animated">
          🎨 超级组合效果
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 终极组合1 */}
          <div className="card-3d liquid-metal neon-scanlines floating-particles">
            <div className="p-6">
              <h3 className="text-2xl font-bold terminal-text mb-3">
                Ultimate Combo 1
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                3D透视 + 液态金属 + 扫描线 + 浮动粒子
              </p>
              <div className="stat-number gradient-text-animated mb-2">
                99.9%
              </div>
              <p className="text-xs text-muted-foreground">
                酷炫指数爆表
              </p>
            </div>
          </div>

          {/* 终极组合2 */}
          <div className="plasma-effect light-beam cyber-grid neon-border-pulse">
            <div className="p-6">
              <h3 className="text-2xl font-bold gradient-text-animated mb-3">
                Ultimate Combo 2
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                等离子 + 光束扫描 + 网格 + 霓虹边框
              </p>
              <button className="neon-pulse-btn w-full">
                体验赛博朋克
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 实战应用示例 */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold terminal-text">
          💼 实战应用示例
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 数据展示卡片 */}
          <div className="card-3d plasma-effect neon-scanlines">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-terminal-amber">
                  Total Value Locked
                </h3>
                <span className="px-2 py-1 rounded bg-terminal-emerald/20 text-terminal-emerald text-xs">
                  +24.5%
                </span>
              </div>
              <div className="stat-number gradient-text-animated mb-2">
                $1.2B
              </div>
              <p className="text-sm text-muted-foreground">
                Across all networks
              </p>
            </div>
          </div>

          {/* 操作面板 */}
          <div className="liquid-metal light-beam floating-particles">
            <div className="p-6">
              <h3 className="text-lg font-bold terminal-text mb-4">
                Control Panel
              </h3>
              <div className="space-y-3">
                <button className="cyber-button w-full">
                  Initialize
                </button>
                <button className="cyber-button-success w-full">
                  Deploy
                </button>
                <button className="cyber-button-danger w-full">
                  Freeze
                </button>
              </div>
            </div>
          </div>

          {/* 警告提示 */}
          <div className="energy-shield glitch-distortion digital-rain">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="text-destructive text-2xl">⚠</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-destructive">
                    Security Alert
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Critical action required
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Unusual activity detected. Verify your identity immediately.
              </p>
              <button className="neon-pulse-btn w-full">
                Verify Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 使用指南 */}
      <section className="space-y-4">
        <div className="holographic-foil neon-border-pulse">
          <div className="p-6">
            <h3 className="text-2xl font-bold terminal-text mb-4">
              💡 新增超炫组件清单
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-bold text-terminal-amber mb-2">3D & 高级</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• card-3d - 3D透视卡片</li>
                  <li>• liquid-metal - 液态金属</li>
                  <li>• mirror-card - 镜面倒影</li>
                  <li>• plasma-effect - 等离子</li>
                  <li>• holographic-foil - 全息箔</li>
                  <li>• energy-shield - 能量护盾</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-terminal-emerald mb-2">扫描 & 动画</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• neon-scanlines - 扫描线</li>
                  <li>• light-beam - 光束扫描</li>
                  <li>• digital-rain - 数字雨</li>
                  <li>• glitch-distortion - 故障扭曲</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-terminal-amber mb-2">粒子 & 边框</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• floating-particles - 浮动粒子</li>
                  <li>• cyber-grid - 赛博网格</li>
                  <li>• neon-border-pulse - 霓虹边框</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 rounded bg-muted/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-terminal-amber">提示：</strong>
                这些效果可以自由组合使用，但建议每个元素最多组合2-3个效果，避免性能问题和视觉过载。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
