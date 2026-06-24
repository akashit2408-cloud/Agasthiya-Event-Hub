"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef } from "react";
import Particles from "./Particles";
import LogoFormation from "./LogoFormation";

export default function Scene3D() {
  return (
    <div className="absolute inset-0 w-full h-full bg-black z-0">
      <Canvas dpr={[1, 2]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 2 + 0.1} 
          minPolarAngle={Math.PI / 2 - 0.1}
        />
        
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 5, 20]} />
        
        {/* Lighting for metallic reflections */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#FFD700" />
        <directionalLight position={[-5, 5, -5]} intensity={2} color="#003DCC" />
        <pointLight position={[0, 0, 5]} intensity={1} color="#ffffff" />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <LogoFormation />
        </Suspense>

        <Particles count={300} />

        {/* Postprocessing for cinematic look */}
        <EffectComposer multisampling={0}>
          <Bloom 
            luminanceThreshold={0.5} 
            luminanceSmoothing={0.9} 
            height={300} 
            intensity={1.5} 
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
