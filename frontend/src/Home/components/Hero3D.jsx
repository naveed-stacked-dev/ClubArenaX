import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';

/**
 * Hero3D — NO LONGER renders its own batsman/ball.
 * Those are handled by the global FloatingBall overlay canvas.
 * This component is kept for potential hero-local 3D effects (environment, shadows).
 * Currently renders minimal scene lighting for the hero area.
 */

function HeroLights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#00f3ff" castShadow />
      <directionalLight position={[-3, 6, -3]} intensity={0.6} color="#bc13fe" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#ffffff" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#00f3ff"
        castShadow
      />
    </>
  );
}

export default function Hero3D({ scrollProgress = 0 }) {
  return (
    <Canvas
      camera={{ position: [0, 2, 6], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <HeroLights />
      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>

      <ContactShadows
        position={[0, -1.51, 0]}
        opacity={0.3}
        scale={10}
        blur={2.5}
        far={6}
      />
    </Canvas>
  );
}
