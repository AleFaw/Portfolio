import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- COMPONENTE DEL AVATAR ---
function AvatarModel({ mouseGlobal, interaction, playAnimation, isMobile }) {
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
                // AJUSTE MÓVIL: Rotamos menos en pantallas chicas para que no se gire de más
                const rotationFactor = isMobile ? 0.5 : 1;

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

    // AJUSTE MÓVIL: Escala y posición condicional
    // En móvil lo subimos (-3.5) y achicamos (2.6) para que entre en el recuadro superior
    const scale = isMobile ? 2.6 : 3.3;
    const posY = isMobile ? -3.5 : -4.3;

    return (
        <group ref={group} dispose={null}>
            <primitive object={scene} position={[0, posY, 0]} scale={scale} />
        </group>
    );
}

export default function Hero3D() {
    const [speech, setSpeech] = useState("¡Hola! Soy tu guía. ¿Listo para empezar? 👋");
    const [interaction, setInteraction] = useState(null);
    const [playAnimation, setPlayAnimation] = useState(null);
    const [isMobile, setIsMobile] = useState(false); // Estado para detectar móvil

    const mouseGlobal = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Detectar tamaño de pantalla
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // Chequear al inicio
        window.addEventListener('resize', checkMobile); // Chequear si cambian tamaño

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
            link.href = '/Tarrio-Alejo-CV.pdf'; // Tu archivo original
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
        <section id="hero" className="h-screen w-full bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
            
            {/* LAYOUT RESPONSIVO (GRID):
               - Móvil: 1 columna, 2 filas (45% arriba para avatar, Auto abajo para texto).
               - PC (md): 2 columnas, 1 fila.
            */}
            <div className="w-full h-full max-w-7xl grid grid-cols-1 grid-rows-[45%_auto] md:grid-rows-1 md:grid-cols-2 gap-4 md:gap-8 items-center">

                {/* COLUMNA AVATAR (Arriba en móvil, Izquierda en PC) */}
                <div className="relative w-full h-full flex items-center justify-center order-1">
                    {/* En móvil quitamos altura fija en px para que use el % del grid */}
                    <div className="relative w-full h-full md:h-[600px] rounded-3xl overflow-hidden border border-slate-700 bg-slate-800/50 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 z-0"></div>

                        {/* FOV adaptativo: 50 en móvil para ver más lejos */}
                        <Canvas camera={{ position: [0, 0, 5], fov: isMobile ? 50 : 40 }}>
                            <ambientLight intensity={0.7} />
                            <spotLight position={[5, 5, 5]} intensity={2} color="#60a5fa" />
                            <spotLight position={[-5, 5, 5]} intensity={2} color="#c084fc" />
                            <Environment preset="city" />

                            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                                <AvatarModel
                                    mouseGlobal={mouseGlobal}
                                    interaction={interaction}
                                    playAnimation={playAnimation}
                                    isMobile={isMobile} // Pasamos el estado
                                />

                                {/* Globo de texto: Posición ajustada para móvil */}
                                <Html position={isMobile ? [0, 1.8, 0] : [1.2, 1, 0]} center>
                                    <div className="bg-white text-slate-900 px-3 py-1 md:px-4 md:py-2 rounded-xl rounded-b-none md:rounded-bl-none shadow-lg font-bold text-xs md:text-sm w-32 md:w-48 text-center border-2 border-blue-500 transform transition-all duration-300 animate-bounce">
                                        {speech}
                                    </div>
                                </Html>
                            </Float>
                        </Canvas>
                    </div>
                </div>

                {/* COLUMNA TEXTO (Abajo en móvil, Derecha en PC) */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 md:space-y-6 z-10 order-2 h-full justify-start md:justify-center pt-2 md:pt-0">

                    <h2 className="text-blue-400 font-bold tracking-wider uppercase text-xs md:text-sm">
                        Ingeniero Mecatrónico & Full Stack Dev
                    </h2>

                    {/* Títulos más chicos en móvil (text-4xl vs 7xl) */}
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-tight">
                        HOLA, SOY <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            ALEJO TARRIO
                        </span>
                    </h1>

                    <p className="text-gray-300 text-sm md:text-xl max-w-lg leading-relaxed px-2 md:px-0">
                        Más que escribir líneas de código, me gusta <strong>dar vida a las ideas</strong>.
                        {/* Ocultamos la segunda frase en móviles muy chicos para ahorrar espacio */}
                        <span className="hidden md:inline"> Veo la tecnología como un taller infinito donde puedo mezclar lógica y creatividad para construir cosas que la gente disfrute usar.</span>
                    </p>

                    <div className="flex flex-wrap gap-3 md:gap-4 pt-2 md:pt-4 justify-center md:justify-start w-full">
                        <a
                            href="#sobre-mi"
                            onClick={handleStartJourney}
                            onMouseEnter={handleHoverRecorrido}
                            onMouseLeave={handleLeave}
                            className="px-6 py-2 md:px-8 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm md:text-base transition-all shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1 active:scale-95"
                        >
                            Comenzar Recorrido
                        </a>

                        <a
                            href="/Tarrio-Alejo-CV.pdf"
                            onClick={handleDownloadCV}
                            onMouseEnter={handleHoverCV}
                            onMouseLeave={handleLeave}
                            className="px-6 py-2 md:px-8 md:py-3 bg-transparent border border-slate-600 text-white font-bold rounded-lg text-sm md:text-base hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95"
                        >
                            Descargar CV
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
}