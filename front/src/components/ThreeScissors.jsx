import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ScissorHalf = ({ color, rotation, position, isGold }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // Complex path to mimic a barber scissor blade + handle shank
    s.moveTo(0, 0);
    s.lineTo(0.4, 0); // Bottom of blade
    s.lineTo(0.35, 3.5); // Tip (tapered)
    s.quadraticCurveTo(0.2, 3.8, 0, 3.8); // Rounded tip
    s.quadraticCurveTo(-0.2, 3.8, -0.35, 3.5); // Other side tip
    s.lineTo(-0.4, 0); // Back to base
    s.lineTo(0, 0); // Close loop
    return s;
  }, []);

  const handleShape = useMemo(() => {
    const s = new THREE.Shape();
    // Shank connecting blade to finger ring
    s.moveTo(-0.15, 0);
    s.lineTo(-0.1, -1.5);
    s.lineTo(0.1, -1.5);
    s.lineTo(0.15, 0);
    return s;
  }, []);

  return (
    <group rotation={rotation} position={position}>
      {/* Blade */}
      <mesh>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.05,
              bevelEnabled: true,
              bevelThickness: 0.02,
              bevelSize: 0.02,
              bevelSegments: 3,
            },
          ]}
        />
        <meshStandardMaterial
          color={isGold ? "#D4AF37" : "#E5E5E5"}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Shank/Handle Connector */}
      <mesh position={[0, -0.1, 0]}>
        <extrudeGeometry
          args={[
            handleShape,
            { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02 },
          ]}
        />
        <meshStandardMaterial
          color={isGold ? "#D4AF37" : "#E5E5E5"}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Finger Ring */}
      <mesh position={[0, -2, 0]}>
        <torusGeometry args={[0.35, 0.08, 16, 32]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Pinky Rest (Tang) - Only on one side usually, but adding for style if gold */}
      {isGold && (
        <mesh position={[0.4, -2.1, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.04, 0.02, 0.6]} />
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}
    </group>
  );
};

export default function ThreeScissors() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating rotation
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]} rotation={[0, 0, 0]}>
      {/* Pivot Point Group */}
      <group position={[0, 1, 0]}>
        {/* Left Half (Gold) */}
        <ScissorHalf
          isGold={true}
          rotation={[0, 0, 0.2]}
          position={[0, 0, 0.03]}
        />

        {/* Right Half (Silver) */}
        <ScissorHalf
          isGold={false}
          rotation={[0, 0, -0.2]}
          position={[0, 0, -0.03]}
          // Flip it to mirror
          scale={[-1, 1, 1]}
        />

        {/* Center Screw */}
        <mesh position={[0, 0, 0]} rotation={[1.57, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 32]} />
          <meshStandardMaterial color="#A0A0A0" metalness={1} roughness={0.2} />
        </mesh>

        {/* Screw Slot */}
        <mesh position={[0, 0, 0.08]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.18, 0.04, 0.02]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    </group>
  );
}
