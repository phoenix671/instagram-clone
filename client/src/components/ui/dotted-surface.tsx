'use client';
import { cn } from '@/lib/utils';
// import { useTheme } from 'next-themes';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	// Replacing next-themes with a permanent light theme structure to match the palette
	const theme = 'light'; 

	const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		particles: THREE.Points[];
		animationId: number;
		count: number;
	} | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const SEPARATION = 150;
		const AMOUNTX = 40;
		const AMOUNTY = 60;

		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x000000, 2000, 10000); // Black Fog for dark theme

		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			10000,
		);
		camera.position.set(0, 150, 1000);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(scene.fog.color, 0);

        if (containerRef.current) {
            containerRef.current.innerHTML = ''; // Prevent double canvas in StrictMode
            containerRef.current.appendChild(renderer.domElement);
        }

		const positions: number[] = [];
		const colors: number[] = [];

		const geometry = new THREE.BufferGeometry();

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				const y = 0; 
				const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

				positions.push(x, y, z);
        // Neon Blue for ultra-visibility on black
				colors.push(0.0, 0.8, 1.0); 
			}
		}

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		const material = new THREE.PointsMaterial({
			size: 16,
			vertexColors: true,
			transparent: true,
			opacity: 0.9,
			sizeAttenuation: true,
		});

		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let count = 0;

		const animate = () => {
			const positionAttribute = geometry.attributes.position;
			const positions = positionAttribute.array as Float32Array;

			let i = 0;
			for (let ix = 0; ix < AMOUNTX; ix++) {
				for (let iy = 0; iy < AMOUNTY; iy++) {
					const index = i * 3;
					positions[index + 1] =
						Math.sin((ix + count) * 0.3) * 80 + // Increased wave intensity from 50 to 80
						Math.sin((iy + count) * 0.5) * 80;
					i++;
				}
			}

			positionAttribute.needsUpdate = true;
			renderer.render(scene, camera);
			count += 0.05; 

            requestRef.current = requestAnimationFrame(animate);
		};

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', handleResize);
		animate();

		sceneRef.current = { scene, camera, renderer, particles: [points], animationId: 0, count };

		return () => {
			window.removeEventListener('resize', handleResize);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
			if (sceneRef.current) {
				sceneRef.current.scene.traverse((object) => {
					if (object instanceof THREE.Points) {
						object.geometry.dispose();
						if (Array.isArray(object.material)) {
							object.material.forEach((material) => material.dispose());
						} else {
							object.material.dispose();
						}
					}
				});
				sceneRef.current.renderer.dispose();
				if (containerRef.current && sceneRef.current.renderer.domElement) {
					containerRef.current.removeChild(sceneRef.current.renderer.domElement);
				}
			}
		};
	}, [theme]);

	return (
		<div ref={containerRef} className={cn('pointer-events-none fixed inset-0 -z-10', className)} {...props} />
	);
}
