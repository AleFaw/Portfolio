import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, Float, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function AvatarModel({ mouseGlobal, interaction, playAnimation, isMobile, speech }) {
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
                const rotationFactor = isMobile ? 0.3 : 0.8;

                if (interaction === 'btn-recorrido') {
                    targetX = 0.2;
                    targetY = 0.3 * rotationFactor;
                } else if (interaction === 'btn-cv') {
                    targetX = 0.2;
                    targetY = 0.6 * rotationFactor;
                } else {
                    targetY = mouseGlobal.current.x * 0.8 * rotationFactor;
                    targetX = -mouseGlobal.current.y * 0.3;
                }
            }

            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.1);
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.1);
        }
    });

    const currentScale = isMobile ? 2.1 : 1.6;
    const currentPos = isMobile ? [0, -2.3, 0] : [0, -1.7, 0];

    const bubblePos = isMobile ? [0.7, 1.6, 0] : [0.8, 1.3, 0];

    return (
        <group ref={group} dispose={null}>
            <primitive object={scene} position={currentPos} scale={currentScale} />
            
            <Html position={bubblePos} center zIndexRange={[100, 0]}>
                <div className={`pointer-events-none bg-white/95 backdrop-blur-sm text-slate-900 px-3 py-2 rounded-xl rounded-bl-none shadow-lg font-bold text-xs md:text-sm w-28 md:w-40 text-center border-2 border-blue-500 transition-all duration-300 ${isMobile ? 'mt-2' : ''}`}>
                    {speech}
                </div>
            </Html>
        </group>
    );
}

export default function Hero3D() {
    const [speech, setSpeech] = useState("¡Hola! Soy tu guía. 👋");
    const [interaction, setInteraction] = useState(null);
    const [playAnimation, setPlayAnimation] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const mouseGlobal = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleMouseMove = (event) => {
            mouseGlobal.current = {
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1
            };
        };
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', checkMobile);
        };
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

    const handleHoverRecorrido = () => { if (!playAnimation) { setInteraction('btn-recorrido'); setSpeech("¿Quieres conocer mi historia?"); }};
    const handleHoverCV = () => { if (!playAnimation) { setInteraction('btn-cv'); setSpeech("Formato PDF listo 💼"); }};
    const handleLeave = () => { if (!playAnimation) { setInteraction(null); setSpeech("¡Hola! Soy tu guía. 👋"); }};

    return (
        <section id="hero" className="h-[100dvh] w-full bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
            <div className="w-full h-full max-w-7xl grid grid-cols-1 grid-rows-[45%_55%] md:grid-rows-1 md:grid-cols-2 gap-2 md:gap-8 items-center">

                <div className="relative w-full h-full flex items-center justify-center order-1">
                    <div className="relative w-full h-full md:h-[500px] rounded-3xl overflow-hidden border border-slate-700 bg-slate-800/50 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 z-0"></div>

                        <Canvas shadows camera={{ position: [0, 0, 5], fov: isMobile ? 50 : 40 }}>
                            <ambientLight intensity={0.5} />
                            <spotLight position={[3, 5, 5]} angle={0.5} penumbra={1} intensity={2.5} color="#ffffff" castShadow />
                            <spotLight position={[-5, 5, -5]} intensity={4} color="#a855f7" />
                            <Environment preset="city" environmentIntensity={0.5} />

                            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                                <AvatarModel
                                    mouseGlobal={mouseGlobal}
                                    interaction={interaction}
                                    playAnimation={playAnimation}
                                    isMobile={isMobile}
                                    speech={speech}
                                />
                            </Float>

                            <ContactShadows opacity={0.5} scale={10} blur={2} far={4.5} resolution={256} color="#000000" />
                        </Canvas>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2 md:space-y-6 z-10 order-2 h-full justify-start md:justify-center pt-4 md:pt-0">
                    <h2 className="text-blue-400 font-bold tracking-wider uppercase text-[10px] md:text-sm">
                        Ingeniero Mecatrónico & Full Stack Dev
                    </h2>
                    <h1 className="text-3xl md:text-7xl font-black text-white leading-tight">
                        HOLA, SOY <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            ALEJO TARRIO
                        </span>
                    </h1>
                    <p className="text-gray-300 text-xs md:text-xl max-w-lg leading-relaxed px-2 md:px-0">
                        Apasionado por <strong>mi familia, mis amigos y la programación</strong>. <br className="hidden md:block"/>
                        <span className="hidden sm:inline"> La tecnología para mi es como un taller, mezclo cosas que voy aprendiendo y creo experiencias comodas y funcionales que la gente disfrute usar.</span>
                    </p>

                    <div className="flex flex-wrap gap-2 md:gap-4 pt-2 md:pt-4 justify-center md:justify-start w-full">
                        <a href="#sobre-mi" onClick={handleStartJourney} onMouseEnter={handleHoverRecorrido} onMouseLeave={handleLeave} className="px-6 py-2 md:px-8 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs md:text-base transition-all shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1 active:scale-95">
                            Comenzar Recorrido
                        </a>
                        <a href="/Tarrio-Alejo-CV.pdf" onClick={handleDownloadCV} onMouseEnter={handleHoverCV} onMouseLeave={handleLeave} className="px-6 py-2 md:px-8 md:py-3 bg-transparent border border-slate-600 text-white font-bold rounded-lg text-xs md:text-base hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95">
                            Descargar CV
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
}