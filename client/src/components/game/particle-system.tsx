import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export function ParticleSystem() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    
    // Create 12 particles spread across the screen
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: i,
        x: (i * 8.33) + Math.random() * 8.33, // Spread evenly across 100% width
        y: Math.random() * 100, // Random height
        delay: i * 0.5, // Stagger the animations
      });
    }
    
    setParticles(newParticles);
  }, []);

  return (
    <div className="particle-system">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle animate-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      
      {/* Additional floating elements for ocean ambiance */}
      <div className="absolute top-1/4 left-1/4 w-8 h-8 opacity-20 animate-float">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="currentColor" className="text-bubble" />
        </svg>
      </div>
      
      <div className="absolute top-3/4 right-1/4 w-6 h-6 opacity-30 animate-bubble">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="35" fill="currentColor" className="text-bubble" />
        </svg>
      </div>
      
      <div className="absolute top-1/2 left-3/4 w-4 h-4 opacity-25 animate-float" style={{ animationDelay: '1s' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="30" fill="currentColor" className="text-bubble" />
        </svg>
      </div>
      
      <div className="absolute top-1/3 right-1/3 w-10 h-10 opacity-15 animate-bubble" style={{ animationDelay: '2s' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="currentColor" className="text-bubble" />
        </svg>
      </div>
    </div>
  );
}
