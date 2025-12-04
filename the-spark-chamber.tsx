import { useState, useEffect, useRef, useCallback } from 'react';

const SPARKS = [
  "You are the glitch the simulation didn't expect.",
  "What if the thing you keep avoiding is your actual portal?",
  "The universe doesn't reward readiness. It rewards movement.",
  "Your chaos is not a bug. It's your source code.",
  "The wound you're hiding is the same shape as your gift.",
  "You didn't come here to fit. You came here to remember.",
  "What dies when you finally stop pretending?",
  "The maze isn't the obstacle. You're the maze solving itself.",
  "Your ancestors dreamed you into existence. Now dream forward.",
  "The thing that terrifies you is just your power wearing a mask.",
  "You're not lost. You're in the loading screen.",
  "What wants to be born through you today?",
  "The scattered pieces aren't broken. They're seeds.",
  "Your restlessness is a compass. Which way is it pointing?",
  "The pattern you keep repeating is trying to teach you its name.",
  "You are someone's ancestor. What are you encoding?",
  "The version of you that already made it is sending signals back.",
  "What if your sensitivity is your superpower buffering?",
  "The edge of your comfort zone is where your character levels up.",
  "You're not behind. Time is a construct and you're right on myth.",
];

const Particle = ({ x, y, angle, speed, life, maxLife, size, hue }) => {
  const progress = life / maxLife;
  const currentX = x + Math.cos(angle) * speed * (maxLife - life) * 3;
  const currentY = y + Math.sin(angle) * speed * (maxLife - life) * 3;
  const opacity = progress * 0.9;
  const currentSize = size * progress;
  
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: currentX,
        top: currentY,
        width: currentSize,
        height: currentSize,
        background: `radial-gradient(circle, hsla(${hue}, 100%, 70%, ${opacity}) 0%, hsla(${hue}, 100%, 50%, 0) 70%)`,
        transform: 'translate(-50%, -50%)',
        filter: `blur(${(1 - progress) * 2}px)`,
      }}
    />
  );
};

const SigilRing = ({ radius, rotation, opacity, hue }) => (
  <div
    className="absolute rounded-full border pointer-events-none"
    style={{
      width: radius * 2,
      height: radius * 2,
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      borderColor: `hsla(${hue}, 70%, 60%, ${opacity})`,
      boxShadow: `0 0 20px hsla(${hue}, 100%, 60%, ${opacity * 0.5}), inset 0 0 20px hsla(${hue}, 100%, 60%, ${opacity * 0.3})`,
    }}
  />
);

export default function SparkChamber() {
  const [spark, setSpark] = useState(null);
  const [isIgniting, setIsIgniting] = useState(false);
  const [particles, setParticles] = useState([]);
  const [rings, setRings] = useState([]);
  const [hue, setHue] = useState(280);
  const [breathPhase, setBreathPhase] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [energy, setEnergy] = useState(0);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  const ignite = useCallback(() => {
    if (isIgniting) return;
    
    setIsIgniting(true);
    setEnergy(100);
    
    const newSpark = SPARKS[Math.floor(Math.random() * SPARKS.length)];
    
    // Create burst particles
    const burstParticles = [];
    for (let i = 0; i < 60; i++) {
      burstParticles.push({
        id: Date.now() + i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        angle: (Math.PI * 2 * i) / 60 + Math.random() * 0.5,
        speed: 2 + Math.random() * 4,
        life: 60 + Math.random() * 40,
        maxLife: 60 + Math.random() * 40,
        size: 10 + Math.random() * 20,
        hue: hue + Math.random() * 60 - 30,
      });
    }
    setParticles(prev => [...prev, ...burstParticles]);
    
    // Create expanding rings
    const newRings = [];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        setRings(prev => [...prev, {
          id: Date.now() + i,
          radius: 0,
          rotation: Math.random() * 360,
          opacity: 0.8,
          hue: hue + i * 20,
          birth: Date.now(),
        }]);
      }, i * 100);
    }
    
    setTimeout(() => {
      setSpark(newSpark);
      setIsIgniting(false);
    }, 400);
    
    setHue(prev => (prev + 40) % 360);
  }, [isIgniting, hue]);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 16;
      lastTimeRef.current = now;
      
      setBreathPhase(prev => (prev + 0.02 * delta) % (Math.PI * 2));
      setEnergy(prev => Math.max(0, prev - 0.5 * delta));
      
      setParticles(prev => 
        prev
          .map(p => ({ ...p, life: p.life - delta }))
          .filter(p => p.life > 0)
      );
      
      setRings(prev =>
        prev
          .map(r => ({
            ...r,
            radius: r.radius + 3 * delta,
            opacity: Math.max(0, r.opacity - 0.008 * delta),
            rotation: r.rotation + 0.5 * delta,
          }))
          .filter(r => r.opacity > 0)
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    // Trail particles on mouse move
    if (Math.random() > 0.7) {
      setParticles(prev => [...prev, {
        id: Date.now() + Math.random(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        angle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random(),
        life: 30,
        maxLife: 30,
        size: 6 + Math.random() * 8,
        hue: hue + Math.random() * 30,
      }]);
    }
  };

  const breathScale = 1 + Math.sin(breathPhase) * 0.05;
  const glowIntensity = 0.3 + Math.sin(breathPhase * 2) * 0.2 + (energy / 100) * 0.5;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden cursor-pointer select-none"
      style={{
        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, 
          hsl(${hue}, 30%, 8%) 0%, 
          hsl(${(hue + 180) % 360}, 20%, 4%) 50%,
          #000 100%)`,
      }}
      onClick={ignite}
      onMouseMove={handleMouseMove}
    >
      {/* Ambient grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsla(${hue}, 50%, 50%, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsla(${hue}, 50%, 50%, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `perspective(500px) rotateX(60deg) translateY(-50%)`,
        }}
      />
      
      {/* Particles */}
      {particles.map(p => (
        <Particle key={p.id} {...p} />
      ))}
      
      {/* Rings */}
      {rings.map(r => (
        <SigilRing key={r.id} {...r} />
      ))}
      
      {/* Central orb */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="relative rounded-full transition-transform duration-300"
          style={{
            width: 200,
            height: 200,
            transform: `scale(${breathScale})`,
            background: `radial-gradient(circle, 
              hsla(${hue}, 100%, 70%, ${glowIntensity}) 0%, 
              hsla(${hue}, 80%, 50%, ${glowIntensity * 0.5}) 30%,
              hsla(${hue}, 60%, 30%, ${glowIntensity * 0.2}) 60%,
              transparent 70%)`,
            boxShadow: `
              0 0 60px hsla(${hue}, 100%, 60%, ${glowIntensity}),
              0 0 120px hsla(${hue}, 100%, 50%, ${glowIntensity * 0.5}),
              inset 0 0 60px hsla(${hue}, 100%, 80%, ${glowIntensity * 0.3})
            `,
          }}
        >
          {/* Inner sigil pattern */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={100 + 70 * Math.cos((angle + breathPhase * 30) * Math.PI / 180)}
                y2={100 + 70 * Math.sin((angle + breathPhase * 30) * Math.PI / 180)}
                stroke={`hsla(${hue + i * 10}, 100%, 70%, ${glowIntensity})`}
                strokeWidth="1"
                filter="url(#glow)"
              />
            ))}
            <circle
              cx="100"
              cy="100"
              r={40 + Math.sin(breathPhase * 2) * 5}
              fill="none"
              stroke={`hsla(${hue}, 100%, 70%, ${glowIntensity * 0.8})`}
              strokeWidth="1"
              filter="url(#glow)"
            />
          </svg>
        </div>
      </div>
      
      {/* Spark text */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-32 w-full max-w-2xl px-8">
        {spark ? (
          <p
            className="text-center text-xl md:text-2xl font-light tracking-wide leading-relaxed"
            style={{
              color: `hsl(${hue}, 60%, 80%)`,
              textShadow: `0 0 30px hsla(${hue}, 100%, 60%, 0.5)`,
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            {spark}
          </p>
        ) : (
          <p
            className="text-center text-lg opacity-50 tracking-widest uppercase"
            style={{
              color: `hsl(${hue}, 40%, 60%)`,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            Click to ignite
          </p>
        )}
      </div>
      
      {/* Corner decoration */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-40">
        <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, transparent, hsl(${hue}, 60%, 50%))` }} />
        <span className="text-xs tracking-[0.3em] uppercase" style={{ color: `hsl(${hue}, 40%, 60%)` }}>
          The First Spark
        </span>
        <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, hsl(${hue}, 60%, 50%), transparent)` }} />
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
