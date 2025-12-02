import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { getTerrainHeight } from '../../utils/terrain';

const WALK_SPEED = 5;
const RUN_SPEED = 12;
const JUMP_FORCE = 8;
const GRAVITY = 20;

interface PlayerProps {
  isLocked: boolean;
  onInteract: (id: string) => void;
  onScan: (id: string) => void;
  onHover: (isHovering: boolean) => void;
}

const Player: React.FC<PlayerProps> = ({ isLocked, onInteract, onScan, onHover }) => {
  const [, getKeys] = useKeyboardControls();
  const { camera, scene } = useThree();
  
  // Refs
  const characterRef = useRef<THREE.Group>(null);
  
  // State for physics
  const position = useRef(new THREE.Vector3(0, 5, 0)); // Start higher to avoid spawning under terrain
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const isGrounded = useRef(false);
  
  // Raycaster for interaction
  const raycaster = useRef(new THREE.Raycaster());
  // Track previous hover state to minimize updates
  const prevHoverState = useRef(false);

  // Helper function to check intersection from center of screen
  const getIntersectedNodeId = (): string | null => {
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      let obj = hit.object;
      while(obj.parent && obj.type !== 'Scene') {
          if (obj.userData?.isNode) {
            return obj.userData.nodeId;
          }
          obj = obj.parent;
      }
    }
    return null;
  };

  // Mouse click listener for interaction
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isLocked) return;
      
      const foundNodeId = getIntersectedNodeId();

      if (foundNodeId) {
        if (e.button === 0) { // Left Click
          onInteract(foundNodeId);
        } else if (e.button === 2) { // Right Click
          onScan(foundNodeId);
        }
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [isLocked, camera, scene, onInteract, onScan]);

  useFrame((state, delta) => {
    // Hover Detection
    if (isLocked) {
      const foundNodeId = getIntersectedNodeId();
      const isHovering = !!foundNodeId;
      
      if (isHovering !== prevHoverState.current) {
        onHover(isHovering);
        prevHoverState.current = isHovering;
      }
    } else if (prevHoverState.current) {
      // Reset hover if unlocked
      onHover(false);
      prevHoverState.current = false;
    }

    if (!characterRef.current) return;

    const { forward, backward, left, right, jump, run } = getKeys();
    
    // 1. Handle Orientation
    const cameraEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    cameraEuler.setFromQuaternion(camera.quaternion);
    const rotationY = cameraEuler.y;
    
    // 2. Calculate Movement Direction
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(backward) - Number(forward));
    const sideVector = new THREE.Vector3(Number(left) - Number(right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(run ? RUN_SPEED : WALK_SPEED)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);

    // Dynamic FOV effect when running (Dash sensation)
    const targetFov = run && (forward || backward || left || right) ? 75 : 60;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 5);
    camera.updateProjectionMatrix();

    // 3. Apply Gravity and Jumping
    velocity.current.x = direction.x;
    velocity.current.z = direction.z;

    if (isGrounded.current && jump) {
      velocity.current.y = JUMP_FORCE;
      isGrounded.current = false;
    }

    velocity.current.y -= GRAVITY * delta;

    // 4. Update Position
    position.current.x += velocity.current.x * delta;
    position.current.z += velocity.current.z * delta;
    position.current.y += velocity.current.y * delta;

    // 5. Terrain Collision
    const terrainHeight = getTerrainHeight(position.current.x, position.current.z);
    
    if (position.current.y < terrainHeight) {
      position.current.y = terrainHeight;
      velocity.current.y = 0;
      isGrounded.current = true;
    } else {
      isGrounded.current = false;
    }

    // Apply to mesh
    characterRef.current.position.copy(position.current);
    
    // Smooth rotation of character
    if (direction.length() > 0.1) {
       const targetRotation = Math.atan2(direction.x, direction.z);
       const currentRotation = characterRef.current.rotation.y;
       let diff = targetRotation - currentRotation;
       while (diff < -Math.PI) diff += Math.PI * 2;
       while (diff > Math.PI) diff -= Math.PI * 2;
       characterRef.current.rotation.y += diff * 10 * delta;
    }

    // 6. Camera Follow
    const camOffset = new THREE.Vector3(0, 2.5, 6);
    camOffset.applyEuler(new THREE.Euler(0, rotationY, 0));
    
    const targetCamPos = position.current.clone().add(camOffset);
    camera.position.lerp(targetCamPos, 0.2);
    
    const lookTarget = position.current.clone().add(new THREE.Vector3(0, 2, 0));
    camera.lookAt(lookTarget);
  });

  return (
    <>
      <PointerLockControls isLocked={isLocked} />
      
      {/* Character Model */}
      <group ref={characterRef} position={[0, 0, 0]}>
        {/* Body */}
        <mesh position={[0, 1.3, 0]} castShadow>
           <capsuleGeometry args={[0.4, 1.2, 4, 16]} />
           <meshPhysicalMaterial color="#1e293b" roughness={0.4} metalness={0.6} clearcoat={1} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 2.1, 0]}>
           <sphereGeometry args={[0.35, 32, 32]} />
           <meshPhysicalMaterial color="#000000" roughness={0.1} metalness={0.9} envMapIntensity={1.5} />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 2.1, 0.25]}>
           <boxGeometry args={[0.4, 0.1, 0.1]} />
           <meshBasicMaterial color="#06b6d4" />
        </mesh>
        {/* Backpack */}
        <mesh position={[0, 1.6, -0.3]} castShadow>
           <boxGeometry args={[0.5, 0.8, 0.3]} />
           <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, 1.6, -0.46]}>
           <boxGeometry args={[0.1, 0.6, 0.05]} />
           <meshBasicMaterial color="#06b6d4" />
        </mesh>
        {/* Shadow */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 32]} />
          <meshBasicMaterial color="#000000" opacity={0.4} transparent />
        </mesh>
      </group>
    </>
  );
};

export default Player;