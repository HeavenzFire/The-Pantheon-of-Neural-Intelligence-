import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Constellation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // Create a "Lattice" of agencies
    const agencies = [
      { name: 'DFPS', pos: [-4, 3, 0], color: 0x00f2ff },
      { name: 'HHSC', pos: [4, 3, 0], color: 0x00f2ff },
      { name: 'COURTS', pos: [-4, -3, 0], color: 0x00f2ff },
      { name: 'HOSPITALS', pos: [4, -3, 0], color: 0x00f2ff },
      { name: 'DETENTION', pos: [0, 0, 0], color: 0xff4444 }, // The "Audit Point"
    ];

    const agencyGroup = new THREE.Group();
    scene.add(agencyGroup);

    const sphereGeom = new THREE.SphereGeometry(0.5, 32, 32);
    
    agencies.forEach(agency => {
      const mat = new THREE.MeshBasicMaterial({ color: agency.color, wireframe: true });
      const mesh = new THREE.Mesh(sphereGeom, mat);
      mesh.position.set(agency.pos[0], agency.pos[1], agency.pos[2]);
      agencyGroup.add(mesh);

      // Add a glow
      const glowGeom = new THREE.SphereGeometry(0.7, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({ 
        color: agency.color, 
        transparent: true, 
        opacity: 0.2 
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.position.copy(mesh.position);
      agencyGroup.add(glow);
    });

    // Create "Data Streams" (Lines)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5 });
    const points: THREE.Vector3[] = [];
    
    agencies.forEach((a, i) => {
      agencies.forEach((b, j) => {
        if (i < j) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...a.pos),
            new THREE.Vector3(...b.pos)
          ]);
          const line = new THREE.Line(geometry, lineMat);
          scene.add(line);
        }
      });
    });

    // Add "Audit Particles" flowing along lines
    const particleCount = 200;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particlePaths = [];

    for (let i = 0; i < particleCount; i++) {
      const start = agencies[Math.floor(Math.random() * agencies.length)];
      const end = agencies[Math.floor(Math.random() * agencies.length)];
      particlePaths.push({ start: new THREE.Vector3(...start.pos), end: new THREE.Vector3(...end.pos), t: Math.random() });
      particleSpeeds[i] = 0.002 + Math.random() * 0.005;
    }

    const pMat = new THREE.PointsMaterial({ size: 0.05, color: 0x00f2ff, transparent: true, opacity: 0.8 });
    const pPoints = new THREE.Points(particleGeom, pMat);
    scene.add(pPoints);

    const animate = () => {
      requestAnimationFrame(animate);

      particlePaths.forEach((p, i) => {
        p.t += particleSpeeds[i];
        if (p.t > 1) p.t = 0;
        const pos = new THREE.Vector3().lerpVectors(p.start, p.end, p.t);
        particlePositions[i * 3] = pos.x;
        particlePositions[i * 3 + 1] = pos.y;
        particlePositions[i * 3 + 2] = pos.z;
      });

      particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeom.attributes.position.needsUpdate = true;

      agencyGroup.rotation.y += 0.005;
      agencyGroup.rotation.x += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020205]">
      <div ref={containerRef} className="w-full h-full opacity-60" />
      
      {/* Forensic Overlays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80vw] h-[80vh] border border-cyan-500/10 rounded-full animate-pulse" />
        <div className="absolute w-[60vw] h-[60vh] border border-cyan-500/5 rounded-full animate-reverse-spin" style={{ animationDuration: '60s' }} />
      </div>

      <div className="absolute bottom-24 left-6 font-mono text-cyan-500/40 text-[8px] uppercase tracking-[0.3em] space-y-1">
        <div>SCAN_MODE: SYSTEMIC_CORRELATION</div>
        <div>AUDIT_SUBSTRATE: ZYLPHA-16_ACTIVE</div>
        <div>LATENCY: 0.003ms</div>
        <div>FISCAL_IMPACT_EST: $260,000,000.00</div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-reverse-spin {
          animation: reverse-spin linear infinite;
        }
      `}} />
    </div>
  );
}
