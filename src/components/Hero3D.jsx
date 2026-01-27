import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

function AvatarModel({ mouseGlobal, interaction, playAnimation }) {
    const group = useRef();

    const { scene, animations: avatarAnims } = useGLTF('/avatar.glb');
    const { animations: winAnims } = useGLTF('/win.glb');
    const { animations: godAnims } = useGLTF('/god.glb');

    if (winAnims.length > 0) winAnims[0].name = "Win";
    if (godAnims.length > 0) godAnims[0].name = "God";

    const { actions } = useAnimations([...avatarAnims, ...winAnims, ...godAnims], group);

    useEffect(() => {
        if (actions) {
            const idleAnim = actions[Object.keys(actions).find(name => name !== "Win" && name !== "God")];
            const winAnim = actions["Win"];
            const godAnim = actions["God"];

            Object.values(actions).forEach(action => action.fadeOut(0.5));

            if (playAnimation === 'Win' && winAnim) {
                winAnim.reset().fadeIn(0.5).setLoop(THREE.LoopOnce).play();
            } else if (playAnimation === 'God' && godAnim) {
                godAnim.reset().fadeIn(0.5).setLoop(THREE.LoopOnce).play();
            } else {
                if (idleAnim) idleAnim.reset().fadeIn(0.5).play();
            }
        }
    }, [playAnimation, actions]);

    useFrame((state) => {
        if (group.current) {
            let targetX = 0;
            let targetY = 0;

            if (playAnimation) {
                targetX = 0;
                targetY = 0;
            } else {
                if (interaction === 'btn-recorrido') {
                    targetX = 0.2;
                    targetY = 0.3;
                } else if (interaction === 'btn-cv') {
                    targetX = 0.2;
                    targetY = 0.6;
                } else {
                    targetY = mouseGlobal.current.x * 0.8;
                    targetX = -mouseGlobal.current.y * 0.3;
                }
            }

            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.1);
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.1);
        }
    });

    return (
        <group ref={group} dispose={null}>
            <primitive object={scene} position={[0, -4.3, 0]} scale={3.3} />
        </group>
    );
}

export default function Hero3D() {
    const [speech, setSpeech] = useState("¡Hola! Soy tu guía. ¿Listo para empezar? 👋");
    const [interaction, setInteraction] = useState(null);
    const [playAnimation, setPlayAnimation] = useState(null);

    const mouseGlobal = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            mouseGlobal.current = {
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1
            };
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleStartJourney = (e) => {
        e.preventDefault();
        setPlayAnimation('Win');
        setSpeech("¡Vamos allá! 🚀");

        setTimeout(() => {
            const section = document.querySelector('#sobre-mi');
            if (section) section.scrollIntoView({ behavior: 'smooth' });

            setPlayAnimation(null);
            setSpeech("¡Aquí tienes mi historia!");
        }, 2500);
    };

    const handleDownloadCV = (e) => {
        e.preventDefault();
        setPlayAnimation('God');
        setSpeech("¡Excelente elección! 📄");

        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '/Tarrio-Alejo-CV.pdf';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setPlayAnimation(null);
            setSpeech("¿Necesitas algo más?");
        }, 2000);
    };

    const handleHoverRecorrido = () => {
        if (!playAnimation) {
            setInteraction('btn-recorrido');
            setSpeech("¿Quieres conocer mi historia?");
        }
    };

    const handleHoverCV = () => {
        if (!playAnimation) {
            setInteraction('btn-cv');
            setSpeech("Formato PDF listo para llevar 💼");
        }
    };

    const handleLeave = () => {
        if (!playAnimation) {
            setInteraction(null);
            setSpeech("¡Hola! Soy tu guía. ¿Listo para empezar? 👋");
        }
    };

    return (
        <section id="hero" className="h-screen w-full bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
            <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                <div className="relative h-[50vh] md:h-[600px] w-full flex items-center justify-center order-1">
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-slate-700 bg-slate-800/50 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 z-0"></div>

                        <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
                            <ambientLight intensity={0.7} />
                            <spotLight position={[5, 5, 5]} intensity={2} color="#60a5fa" />
                            <spotLight position={[-5, 5, 5]} intensity={2} color="#c084fc" />
                            <Environment preset="city" />

                            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>

                                <AvatarModel
                                    mouseGlobal={mouseGlobal}
                                    interaction={interaction}
                                    playAnimation={playAnimation}
                                />

                                <Html position={[1.2, 1, 0]} center>
                                    <div className="bg-white text-slate-900 px-4 py-2 rounded-xl rounded-bl-none shadow-lg font-bold text-sm w-40 animate-bounce md:w-48 text-center border-2 border-blue-500 transform transition-all duration-300">
                                        {speech}
                                    </div>
                                </Html>
                            </Float>
                        </Canvas>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 z-10 order-2">

                    <h2 className="text-blue-400 font-bold tracking-wider uppercase text-sm">
                        Ingeniero Mecatrónico & Full Stack Dev
                    </h2>

                    <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                        HOLA, SOY <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            ALEJO TARRIO
                        </span>
                    </h1>

                    <p className="text-gray-300 text-lg md:text-xl max-w-lg leading-relaxed">
                        Más que escribir líneas de código, me gusta <strong>dar vida a las ideas</strong>. <br />
                        Veo la tecnología como un taller infinito donde puedo mezclar lógica y creatividad para construir cosas que la gente disfrute usar.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <a
                            href="#sobre-mi"
                            onClick={handleStartJourney}
                            onMouseEnter={handleHoverRecorrido}
                            onMouseLeave={handleLeave}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1"
                        >
                            Comenzar Recorrido
                        </a>

                        <a
                            href="/cv.pdf"
                            onClick={handleDownloadCV}
                            onMouseEnter={handleHoverCV}
                            onMouseLeave={handleLeave}
                            className="px-8 py-3 bg-transparent border border-slate-600 text-white font-bold rounded-lg hover:bg-slate-800 transition-all hover:-translate-y-1"
                        >
                            Descargar CV
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
}