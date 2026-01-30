import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

// Hexagon shape path for clip-path
const hexClipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

export function HolographicShield() {
  return (
    <div className="relative w-full max-w-lg aspect-square">
      {/* Layer 0: Background Grid Texture */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Layer 1: Pulse Energy Waves */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            className="w-64 h-64 border border-primary/30"
            style={{ clipPath: hexClipPath }}
            initial={{ scale: 0.4, opacity: 0.6 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{
              duration: 3,
              delay: i * 1,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        </motion.div>
      ))}

      {/* Layer 2: Multi-layer Rotating Hexagons */}
      {/* Outermost - Dashed, slow clockwise */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <div 
          className="w-80 h-80 border border-dashed border-primary/20"
          style={{ clipPath: hexClipPath }}
        />
      </motion.div>

      {/* Second layer - Solid with glow, counter-clockwise */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      >
        <div 
          className="w-64 h-64 border-2 border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
          style={{ clipPath: hexClipPath }}
        />
      </motion.div>

      {/* Third layer - Pulsing */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <motion.div 
          className="w-52 h-52 border border-accent/50"
          style={{ clipPath: hexClipPath }}
          animate={{ 
            boxShadow: [
              '0 0 10px hsl(var(--accent) / 0.2)',
              '0 0 30px hsl(var(--accent) / 0.4)',
              '0 0 10px hsl(var(--accent) / 0.2)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Fourth layer - Breathing effect */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div 
          className="w-44 h-44 border border-primary/60"
          style={{ clipPath: hexClipPath }}
        />
      </motion.div>

      {/* Layer 3: Radar Sweep */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <div 
          className="w-72 h-72"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.4) 20deg, transparent 40deg)',
            clipPath: hexClipPath,
          }}
        />
      </motion.div>

      {/* Layer 4: Orbiting Data Points */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * 60) * (Math.PI / 180);
          const radius = 140;
          return (
            <motion.div
              key={`orbit-${i}`}
              className="absolute w-2 h-2"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: -4,
                marginTop: -4,
              }}
              animate={{
                x: [
                  Math.cos(angle) * radius,
                  Math.cos(angle + Math.PI * 2) * radius,
                ],
                y: [
                  Math.sin(angle) * radius,
                  Math.sin(angle + Math.PI * 2) * radius,
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.2,
              }}
            >
              <motion.div
                className="w-full h-full bg-primary"
                style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Secondary orbit - smaller, faster, accent color */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * 90 + 45) * (Math.PI / 180);
          const radius = 100;
          return (
            <motion.div
              key={`orbit2-${i}`}
              className="absolute w-1.5 h-1.5 bg-accent"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: -3,
                marginTop: -3,
                borderRadius: '50%',
              }}
              animate={{
                x: [
                  Math.cos(angle) * radius,
                  Math.cos(angle - Math.PI * 2) * radius,
                ],
                y: [
                  Math.sin(angle) * radius,
                  Math.sin(angle - Math.PI * 2) * radius,
                ],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}
      </div>

      {/* Layer 5: Central Shield with Glow */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <motion.div 
          className="w-36 h-36 hex-clip gradient-amber p-1"
          animate={{
            boxShadow: [
              '0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)',
              '0 0 40px hsl(var(--primary) / 0.6), 0 0 80px hsl(var(--primary) / 0.3)',
              '0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-full h-full hex-clip bg-background/95 flex items-center justify-center relative overflow-hidden">
            {/* Scanline effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent"
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Shield className="w-14 h-14 text-primary relative z-10" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* HUD Corner Decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/50" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/50" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/50" />

      {/* HUD Floating Labels */}
      <motion.div 
        className="absolute top-8 left-10 text-[10px] font-mono text-primary/70 tracking-wider"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        SEC_LEVEL: MAX
      </motion.div>
      <motion.div 
        className="absolute top-16 left-10 text-[10px] font-mono text-accent/70 tracking-wider"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        SHIELD: ACTIVE
      </motion.div>
      <motion.div 
        className="absolute bottom-16 right-10 text-[10px] font-mono text-primary/70 tracking-wider"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        NODE: ONLINE
      </motion.div>
      <motion.div 
        className="absolute bottom-8 right-10 text-[10px] font-mono text-accent/70 tracking-wider"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      >
        2/3 MULTISIG
      </motion.div>

      {/* Status indicators in corners */}
      <motion.div 
        className="absolute top-2 left-12 w-1 h-1 bg-success rounded-full"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-2 right-12 w-1 h-1 bg-success rounded-full"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
      />
    </div>
  );
}
