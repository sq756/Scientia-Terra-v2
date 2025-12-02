import React, { useMemo } from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { getTerrainHeight } from '../../utils/terrain';

const Terrain: React.FC = () => {
  // Generate geometry with height displacement
  const geometry = useMemo(() => {
    // 256 segments for smooth hills
    const geo = new THREE.PlaneGeometry(300, 300, 256, 256);
    const posAttribute = geo.attributes.position;
    
    // Displace vertices
    for (let i = 0; i < posAttribute.count; i++) {
      // Plane is initialized on XY plane. 
      // We will rotate it -90deg on X later, so local Z becomes world Y (up).
      // However, for the heightmap function, we map local X/Y to world X/Z.
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i); // Corresponds to world Z (inverted depending on rotation)
      
      // Calculate height. Note: We use 'y' as 'z' input for the function.
      // We invert y because texture coords often flip on rotation.
      const height = getTerrainHeight(x, -y);
      
      // Set local Z (which becomes world Y height)
      posAttribute.setZ(i, height);
    }
    
    // Recompute normals for correct lighting on hills
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, -0.1, 0]}>
      {/* Main Ground Mesh */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry} receiveShadow>
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={15} // Reduced reflection strength for rougher terrain look
          roughness={0.8}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#1e293b" // Slate 800
          metalness={0.4}
          mirror={0.2} 
        />
      </mesh>
      
      {/* Wireframe Grid Overlay for "Digital Simulation" aesthetic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
         {/* Use same geometry so grid follows hills */}
         <primitive object={geometry} attach="geometry" />
         <meshBasicMaterial 
            color="#06b6d4" 
            wireframe 
            transparent 
            opacity={0.05} 
         />
      </mesh>
    </group>
  );
};

export default Terrain;