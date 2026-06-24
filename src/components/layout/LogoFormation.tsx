"use client";

import { useFrame } from "@react-three/fiber";
import { Center, Text3D, useTexture } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function LogoFormation() {
  const groupRef = useRef<THREE.Group>(null);
  const aRef = useRef<THREE.Mesh>(null);
  const eRef = useRef<THREE.Mesh>(null);
  const imageRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!aRef.current || !eRef.current || !imageRef.current || !groupRef.current) return;

    const tl = gsap.timeline();

    // Initial state
    aRef.current.position.x = -5;
    aRef.current.rotation.y = Math.PI / 2;
    aRef.current.scale.set(0, 0, 0);
    
    eRef.current.position.x = 5;
    eRef.current.rotation.y = -Math.PI / 2;
    eRef.current.scale.set(0, 0, 0);

    (imageRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
    imageRef.current.scale.set(0.8, 0.8, 0.8);

    // Scene 2: Golden A Formation
    tl.to(aRef.current.scale, { x: 1, y: 1, z: 1, duration: 2, ease: "power3.out" }, 1.5)
      .to(aRef.current.position, { x: -1.2, duration: 2, ease: "power3.out" }, 1.5)
      .to(aRef.current.rotation, { y: 0, duration: 2, ease: "power3.out" }, 1.5);

    // Scene 3: Blue E Formation
    tl.to(eRef.current.scale, { x: 1, y: 1, z: 1, duration: 2, ease: "power3.out" }, 2.5)
      .to(eRef.current.position, { x: 0.5, duration: 2, ease: "power3.out" }, 2.5)
      .to(eRef.current.rotation, { y: 0, duration: 2, ease: "power3.out" }, 2.5);

    // Scene 4: Assembly & Fade out 3D text
    tl.to(aRef.current.position, { x: -0.5, duration: 1.5, ease: "power2.inOut" }, 4.5)
      .to(eRef.current.position, { x: 0.5, duration: 1.5, ease: "power2.inOut" }, 4.5)
      .to(aRef.current.material, { opacity: 0, transparent: true, duration: 1 }, 5)
      .to(eRef.current.material, { opacity: 0, transparent: true, duration: 1 }, 5);

    // Fade in actual logo image
    tl.to(imageRef.current.material, { opacity: 1, duration: 1.5, ease: "power2.out" }, 5)
      .to(imageRef.current.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 2, ease: "power2.out" }, 5);

    // Scene 7: Soft camera push in (handled in Scene3D, but we can scale the group too)
    tl.to(groupRef.current.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 3, ease: "sine.inOut" }, 6);

    // Try loading the user's logo.png
    const loader = new THREE.TextureLoader();
    loader.load(
      "/logo.png",
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        if (imageRef.current) {
          const material = imageRef.current.material as THREE.MeshBasicMaterial;
          material.map = texture;
          material.needsUpdate = true;
          // Scale plane to match image aspect ratio roughly
          const aspect = texture.image.width / texture.image.height;
          imageRef.current.scale.set(aspect, 1, 1);
        }
      },
      undefined,
      (err) => {
        console.log("No logo.png found in public folder yet. Fallback text will be used in 2D UI.");
      }
    );

  }, []);

  return (
    <group ref={groupRef}>
      <Center>
        {/* Golden 'A' */}
        <Text3D
          ref={aRef}
          font="https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_bold.typeface.json"
          size={3}
          height={0.5}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.1}
          bevelSize={0.05}
          bevelOffset={0}
          bevelSegments={5}
        >
          A
          <meshPhysicalMaterial 
            color="#FFD700"
            metalness={1}
            roughness={0.1}
            envMapIntensity={2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Text3D>

        {/* Blue 'E' */}
        <Text3D
          ref={eRef}
          font="https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_bold.typeface.json"
          size={3}
          height={0.5}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.1}
          bevelSize={0.05}
          bevelOffset={0}
          bevelSegments={5}
        >
          E
          <meshPhysicalMaterial 
            color="#003DCC"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={2}
            clearcoat={1}
            clearcoatRoughness={0.2}
            emissive="#001144"
            emissiveIntensity={0.5}
          />
        </Text3D>
      </Center>

      {/* Image plane for the actual logo.png */}
      <mesh ref={imageRef} position={[0, 0, 0.5]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false}>
          {/* We'll assign the texture dynamically to avoid crashing if it doesn't exist */}
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}
