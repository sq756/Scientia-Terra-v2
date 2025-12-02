export const getTerrainHeight = (x: number, z: number): number => {
  // Base rolling hills using low frequency sine waves
  const baseHeight = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 6;
  
  // High frequency detail noise
  const detail = Math.sin(x * 0.2 + 2) * Math.cos(z * 0.2 + 1) * 1.5;
  
  // Calculate distance from center (0,0)
  const dist = Math.sqrt(x * x + z * z);
  
  // Flatten the spawn area (radius ~15 units) so the player starts on safe ground
  const safeZoneRadius = 15;
  let flattenFactor = 1;
  
  if (dist < safeZoneRadius) {
    // Smoothstep interpolation (0 to 1) for a gentle transition from flat to hilly
    const t = dist / safeZoneRadius;
    flattenFactor = t * t * (3 - 2 * t);
  }

  return (baseHeight + detail) * flattenFactor;
};