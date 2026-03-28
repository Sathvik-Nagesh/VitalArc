'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Environment, Float, MeshTransmissionMaterial, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// An advanced, glassmorphic 3D representation using transmission materials
// and complex procedural groupings for a premium sci-fi medical look.
function StylizedHumanBody({ selectedOrgan }: { selectedOrgan: string | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Mesh>(null);
  const brainRef = useRef<THREE.Mesh>(null);
  const metabolicRef = useRef<THREE.Mesh>(null);

  // Slowly rotate the body and pulse organs
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
    const t = state.clock.getElapsedTime();
    // Heartbeat pulse (double beat pattern)
    if (heartRef.current) {
       const beat = Math.sin(t * 5) * 0.1 + Math.sin(t * 5 + 0.5) * 0.1;
       heartRef.current.scale.setScalar(0.7 + Math.max(0, beat));
    }
    // Brain pulse (slow throb)
    if (brainRef.current) {
      brainRef.current.scale.setScalar(0.7 + Math.sin(t * 2) * 0.05);
    }
    // Metabolic pulse (gentle undulation)
    if (metabolicRef.current) {
      metabolicRef.current.scale.setScalar(0.8 + Math.sin(t * 1.5) * 0.04);
    }
  });

  const getOrganMaterial = (organId: string, baseColor: number) => {
    const isSelected = selectedOrgan === organId;
    return new THREE.MeshStandardMaterial({
      color: isSelected ? baseColor : 0x223344,
      emissive: isSelected ? baseColor : 0x000000,
      emissiveIntensity: isSelected ? 4 : 0,
      transparent: true,
      opacity: isSelected ? 0.9 : 0.4,
      roughness: 0.1,
      metalness: 0.8
    });
  };

  const GlassShell = ({ geometry, position, rotation, scale = [1,1,1] }: any) => {
     return (
        <mesh position={position} rotation={rotation} scale={scale as any}>
           <primitive object={geometry} />
           <MeshTransmissionMaterial 
             background={new THREE.Color(0x0a1128)}
             thickness={1.5} 
             roughness={0.15} 
             transmission={0.95} 
             ior={1.2} 
             chromaticAberration={0.06} 
             backside
           />
        </mesh>
     )
  };

  return (
    <group ref={groupRef} position={[0, -1.8, 0]}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        
        {/* HEAD */}
        <group position={[0, 4.8, 0]}>
           <GlassShell geometry={new THREE.CapsuleGeometry(0.5, 0.4, 4, 32)} />
           {/* Brain */}
           <mesh ref={brainRef} material={getOrganMaterial('brain', 0x8b5cf6)} position={[0, 0.15, 0]}>
             <boxGeometry args={[0.5, 0.4, 0.6]} />
           </mesh>
           <mesh material={getOrganMaterial('brain', 0x8b5cf6)} position={[0, 0.15, 0]}>
             <sphereGeometry args={[0.45, 16, 16]} />
           </mesh>
        </group>

        {/* NECK */}
        <GlassShell geometry={new THREE.CylinderGeometry(0.2, 0.25, 0.6, 32)} position={[0, 4.0, 0]} />

        {/* TORSO */}
        <group position={[0, 2.2, 0]}>
           {/* Upper Chest */}
           <GlassShell geometry={new THREE.CapsuleGeometry(0.9, 1.2, 8, 32)} position={[0, 0.5, 0]} />
           {/* Lower Abdomen */}
           <GlassShell geometry={new THREE.CapsuleGeometry(0.8, 1.0, 8, 32)} position={[0, -0.8, 0]} />
           
           {/* Heart */}
           <mesh ref={heartRef} material={getOrganMaterial('cardiovascular', 0xef4444)} position={[-0.3, 0.8, 0.2]}>
             <octahedronGeometry args={[0.3, 2]} />
           </mesh>

           {/* Metabolic / Gut */}
           <mesh ref={metabolicRef} material={getOrganMaterial('metabolic', 0xf59e0b)} position={[0, -0.6, 0.1]}>
             <torusGeometry args={[0.3, 0.15, 16, 32]} />
           </mesh>
        </group>

        {/* ARMS (Musculoskeletal highlight possible) */}
        <group position={[-1.3, 3.2, 0]} rotation={[0, 0, 0.2]}>
           <GlassShell geometry={new THREE.CapsuleGeometry(0.25, 1.2, 8, 32)} position={[0, -0.6, 0]} />
           <GlassShell geometry={new THREE.CapsuleGeometry(0.2, 1.1, 8, 32)} position={[0, -2.1, 0.1]} rotation={[-0.1,0,0]} />
           { selectedOrgan === 'musculoskeletal' && (
              <mesh position={[0, -1.3, 0]} material={getOrganMaterial('musculoskeletal', 0x06b6d4)}><sphereGeometry args={[0.3,16,16]}/></mesh>
           )}
        </group>
        <group position={[1.3, 3.2, 0]} rotation={[0, 0, -0.2]}>
           <GlassShell geometry={new THREE.CapsuleGeometry(0.25, 1.2, 8, 32)} position={[0, -0.6, 0]} />
           <GlassShell geometry={new THREE.CapsuleGeometry(0.2, 1.1, 8, 32)} position={[0, -2.1, 0.1]} rotation={[-0.1,0,0]} />
           { selectedOrgan === 'musculoskeletal' && (
              <mesh position={[0, -1.3, 0]} material={getOrganMaterial('musculoskeletal', 0x06b6d4)}><sphereGeometry args={[0.3,16,16]}/></mesh>
           )}
        </group>

        {/* LEGS (Musculoskeletal highlight possible) */}
        <group position={[-0.5, 0.1, 0]}>
           <GlassShell geometry={new THREE.CapsuleGeometry(0.35, 1.4, 8, 32)} position={[0, -1.0, 0]} />
           <GlassShell geometry={new THREE.CapsuleGeometry(0.25, 1.3, 8, 32)} position={[0, -2.8, 0]} />
           { selectedOrgan === 'musculoskeletal' && (
              <mesh position={[0, -1.9, 0]} material={getOrganMaterial('musculoskeletal', 0x06b6d4)}><sphereGeometry args={[0.4,16,16]}/></mesh>
           )}
        </group>
        <group position={[0.5, 0.1, 0]}>
           <GlassShell geometry={new THREE.CapsuleGeometry(0.35, 1.4, 8, 32)} position={[0, -1.0, 0]} />
           <GlassShell geometry={new THREE.CapsuleGeometry(0.25, 1.3, 8, 32)} position={[0, -2.8, 0]} />
           { selectedOrgan === 'musculoskeletal' && (
              <mesh position={[0, -1.9, 0]} material={getOrganMaterial('musculoskeletal', 0x06b6d4)}><sphereGeometry args={[0.4,16,16]}/></mesh>
           )}
        </group>

      </Float>
    </group>
  );
}

export default function BodyModel({ selectedOrgan = null }: { selectedOrgan?: string | null }) {
  return (
    <div className="w-full h-full min-h-[450px] relative">
      <Canvas camera={{ position: [0, 0, 11], fov: 40 }} dpr={[1, 2]}>
        <color attach="background" args={['transparent']} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 20, 10]} angle={0.2} penumbra={1} intensity={2} color="#00d4aa" />
        <spotLight position={[-10, 0, -10]} angle={0.2} penumbra={1} intensity={2} color="#8b5cf6" />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" />
        
        <Center>
          <StylizedHumanBody selectedOrgan={selectedOrgan} />
        </Center>
        
        <Sparkles count={80} scale={10} size={1.5} speed={0.4} opacity={0.3} color="#00d4aa" />

        <ContactShadows position={[0, -4.5, 0]} opacity={0.6} scale={15} blur={2.5} far={5} color="#00d4aa" />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
