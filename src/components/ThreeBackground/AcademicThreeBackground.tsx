import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const AcademicThreeBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    let animationFrameId: number;
    let isDestroyed = false;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xF4F7FC, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 18;
    camera.position.y = 1;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0); // Transparent to show ambient gradient
    container.appendChild(renderer.domElement);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x438dff, 2.2, 50);
    blueLight.position.set(-8, 6, 8);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0xa78bfa, 2.0, 50);
    purpleLight.position.set(8, -4, 6);
    scene.add(purpleLight);

    const mintLight = new THREE.PointLight(0x34d399, 1.2, 35);
    mintLight.position.set(0, 8, -5);
    scene.add(mintLight);

    // Group for objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Connected Graph Nodes & Edges (Discrete Math Conflict Graph G=(V,E))
    const graphGroup = new THREE.Group();
    mainGroup.add(graphGroup);

    const nodeColors = [
      0x438dff, // Sky Blue
      0xa78bfa, // Soft Purple
      0x10b981, // Emerald Mint
      0x38bdf8, // Cyan Blue
      0x818cf8, // Indigo Violet
    ];

    const nodeCount = 18;
    const nodePositions: THREE.Vector3[] = [];
    const nodeMeshes: THREE.Mesh[] = [];

    const sphereGeo = new THREE.SphereGeometry(0.24, 20, 20);

    for (let i = 0; i < nodeCount; i++) {
      const color = nodeColors[i % nodeColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.25,
        metalness: 0.1,
        emissive: color,
        emissiveIntensity: 0.2,
      });

      const mesh = new THREE.Mesh(sphereGeo, mat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 5.5 + Math.sin(i * 1.5) * 2.2;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.5;
      const y = Math.sin(angle) * (radius * 0.55) + (Math.random() - 0.5) * 1.2;
      const z = (Math.random() - 0.5) * 4.5;

      const pos = new THREE.Vector3(x, y, z);
      mesh.position.copy(pos);
      nodePositions.push(pos);
      nodeMeshes.push(mesh);
      graphGroup.add(mesh);
    }

    // Connect close nodes with glowing edge lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < 4.2) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            nodePositions[i],
            nodePositions[j],
          ]);
          const line = new THREE.Line(lineGeo, lineMat);
          graphGroup.add(line);
        }
      }
    }

    // 2. Floating 3D Examination Calendar Tiles
    const createCalendarTexture = (title: string, sub: string, badge: string, isBlue: boolean) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      // Glass style gradient card background
      const grad = ctx.createLinearGradient(0, 0, 256, 256);
      if (isBlue) {
        grad.addColorStop(0, 'rgba(234, 244, 255, 0.95)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.90)');
      } else {
        grad.addColorStop(0, 'rgba(245, 243, 255, 0.95)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.90)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 240, 24);
      ctx.fill();

      // Top color banner
      ctx.fillStyle = isBlue ? '#438DFF' : '#A78BFA';
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 56, [24, 24, 0, 0]);
      ctx.fill();

      // Header text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(badge, 24, 44);

      // Main date / slot text
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(title, 24, 115);

      // Subtitle
      ctx.fillStyle = '#64748B';
      ctx.font = '18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(sub, 24, 155);

      // Bottom Status Pill
      ctx.fillStyle = isBlue ? 'rgba(67, 141, 255, 0.12)' : 'rgba(167, 139, 250, 0.15)';
      ctx.beginPath();
      ctx.roundRect(24, 185, 120, 36, 12);
      ctx.fill();

      ctx.fillStyle = isBlue ? '#2563EB' : '#7C3AED';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✓ CONFLICT-FREE', 34, 209);

      return new THREE.CanvasTexture(canvas);
    };

    const tileConfigs = [
      { title: 'MAY 11', sub: 'Slot 1: 09:30 AM', badge: 'EXAM SESSION A', isBlue: true, pos: [-7.2, 2.5, -2] },
      { title: 'MAY 12', sub: 'Slot 2: 01:30 PM', badge: 'EXAM SESSION B', isBlue: false, pos: [7.5, 3.2, -3] },
      { title: 'MAY 14', sub: 'Slot 3: 09:30 AM', badge: 'EXAM SESSION C', isBlue: true, pos: [-6.5, -3.5, -1] },
      { title: 'MAY 16', sub: 'Slot 4: 01:30 PM', badge: 'EXAM SESSION D', isBlue: false, pos: [6.8, -2.8, -2] },
      { title: 'ROOM 101', sub: 'Capacity: 75 Seats', badge: 'VACANT VENUE', isBlue: true, pos: [0, -5.2, -4] },
    ];

    const tileGroup = new THREE.Group();
    mainGroup.add(tileGroup);

    const cardGeo = new THREE.BoxGeometry(2.4, 2.4, 0.08);

    const tileMeshes: { mesh: THREE.Mesh; initialY: number; speed: number; rotSpeed: number }[] = [];

    tileConfigs.forEach((cfg, idx) => {
      const tex = createCalendarTexture(cfg.title, cfg.sub, cfg.badge, cfg.isBlue);
      const faceMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.88 });
      const edgeMat = new THREE.MeshStandardMaterial({
        color: cfg.isBlue ? 0x93c5fd : 0xd8b4fe,
        roughness: 0.3,
        metalness: 0.1,
      });

      const materials = [edgeMat, edgeMat, edgeMat, edgeMat, faceMat, edgeMat];
      const mesh = new THREE.Mesh(cardGeo, materials);
      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      mesh.rotation.x = 0.15;
      mesh.rotation.y = (idx % 2 === 0 ? 1 : -1) * 0.25;

      tileGroup.add(mesh);
      tileMeshes.push({
        mesh,
        initialY: cfg.pos[1],
        speed: 0.0012 + idx * 0.0003,
        rotSpeed: (idx % 2 === 0 ? 1 : -1) * 0.0004,
      });
    });

    // 3. Floating 3D Geometric Tokens (Rounded Cubes & Icosahedrons)
    const tokenGeo1 = new THREE.IcosahedronGeometry(0.45, 0);
    const tokenGeo2 = new THREE.BoxGeometry(0.6, 0.6, 0.6);

    const tokenGroup = new THREE.Group();
    mainGroup.add(tokenGroup);

    const tokenMeshes: { mesh: THREE.Mesh; rotX: number; rotY: number; floatOffset: number }[] = [];

    for (let i = 0; i < 8; i++) {
      const isIco = i % 2 === 0;
      const mat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x438dff : 0xa78bfa,
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.55,
      });
      const mesh = new THREE.Mesh(isIco ? tokenGeo1 : tokenGeo2, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        -1 - Math.random() * 5
      );
      tokenGroup.add(mesh);
      tokenMeshes.push({
        mesh,
        rotX: (Math.random() - 0.5) * 0.01,
        rotY: (Math.random() - 0.5) * 0.01,
        floatOffset: i * 0.8,
      });
    }

    // Mouse Parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window Resize
    const handleResize = () => {
      if (!mountRef.current || isDestroyed) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      if (isDestroyed) return;

      animationFrameId = requestAnimationFrame(animate);

      // Pause if tab is not visible
      if (document.hidden) return;

      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      camera.position.x = currentMouseX * 1.5;
      camera.position.y = 1 + currentMouseY * 1.0;
      camera.lookAt(0, 0, 0);

      // Rotate graph slowly
      graphGroup.rotation.y = elapsed * 0.04;
      graphGroup.rotation.x = Math.sin(elapsed * 0.03) * 0.08;

      // Float calendar cards gently
      tileMeshes.forEach((item, i) => {
        item.mesh.position.y = item.initialY + Math.sin(elapsed * 1.2 + i * 1.5) * 0.35;
        item.mesh.rotation.y += item.rotSpeed;
      });

      // Rotate small geometric tokens
      tokenMeshes.forEach((item, i) => {
        item.mesh.rotation.x += item.rotX;
        item.mesh.rotation.y += item.rotY;
        item.mesh.position.y += Math.sin(elapsed * 1.5 + item.floatOffset) * 0.003;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* 1. Ambient Background Gradient (Sky Blue + Soft Purple + Pale Blue) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(67, 141, 255, 0.12) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(167, 139, 250, 0.14) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(234, 244, 255, 0.7) 0%, rgba(248, 250, 252, 0.95) 100%)',
        }}
      />

      {/* 2. Soft Floating Colored Light Orbs */}
      <div className="absolute top-12 left-10 w-96 h-96 rounded-full bg-gradient-to-tr from-[#438DFF]/15 to-[#38BDF8]/10 blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-16 right-12 w-96 h-96 rounded-full bg-gradient-to-tr from-[#A78BFA]/18 to-[#C084FC]/10 blur-3xl animate-pulse" style={{ animationDuration: '9s' }} />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-[#EAF4FF]/60 blur-2xl" />

      {/* 3. Subtle Technical Grid / Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#438DFF 1.5px, transparent 1.5px), radial-gradient(#A78BFA 1.5px, transparent 1.5px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      {/* 4. Three.js 3D WebGL Canvas Layer */}
      {webGLSupported && !reducedMotion ? (
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      ) : (
        /* Graceful 2D Fallback for Reduced-Motion or Non-WebGL devices */
        <div className="absolute inset-0 flex items-center justify-center opacity-25">
          <svg className="w-full h-full" viewBox="0 0 1000 800" fill="none">
            <circle cx="200" cy="300" r="160" stroke="#438DFF" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="800" cy="500" r="220" stroke="#A78BFA" strokeWidth="1" strokeDasharray="8 8" />
            <line x1="200" y1="300" x2="800" y2="500" stroke="#CBD5E1" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
};
