<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AstroFocus Study Tracker | Cosmic Architecture</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Rajdhani', sans-serif;
            background: #050505;
            color: #e0e0e0;
            overflow-x: hidden;
        }
        
        .font-orbitron {
            font-family: 'Orbitron', sans-serif;
        }
        
        /* Cosmic Background */
        #cosmic-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.6;
        }
        
        /* Neon Glow Effects */
        .neon-text-pink {
            text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff;
        }
        
        .neon-text-cyan {
            text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff;
        }
        
        .neon-border {
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.2);
        }
        
        .neon-card {
            background: rgba(10, 10, 20, 0.8);
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        
        .neon-card:hover {
            box-shadow: 0 0 30px rgba(255, 0, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.2);
            transform: translateY(-5px);
            border-color: rgba(255, 0, 255, 0.5);
        }
        
        /* Glitch Effect */
        .glitch {
            position: relative;
            animation: glitch-skew 1s infinite;
        }
        
        @keyframes glitch-skew {
            0% { transform: skew(0deg); }
            20% { transform: skew(-2deg); }
            40% { transform: skew(2deg); }
            60% { transform: skew(-1deg); }
            80% { transform: skew(1deg); }
            100% { transform: skew(0deg); }
        }
        
        /* Floating Animation */
        .float {
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        /* Pulse Animation */
        .pulse-neon {
            animation: pulse-neon 2s ease-in-out infinite;
        }
        
        @keyframes pulse-neon {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        /* Tech Stack Icons */
        .tech-icon {
            width: 60px;
            height: 60px;
            filter: grayscale(100%) brightness(0.8);
            transition: all 0.3s ease;
        }
        
        .tech-icon:hover {
            filter: grayscale(0%) brightness(1.2) drop-shadow(0 0 10px currentColor);
            transform: scale(1.2) rotate(5deg);
        }
        
        /* Code Block Styling */
        .code-block {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            border-left: 4px solid #00ffff;
            position: relative;
            overflow: hidden;
        }
        
        .code-block::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff);
            background-size: 200% 100%;
            animation: scanline 3s linear infinite;
        }
        
        @keyframes scanline {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: #0a0a0a;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #ff00ff, #00ffff);
            border-radius: 5px;
        }
        
        /* Feature Cards Grid */
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        /* Verification Flow Diagram */
        .flow-step {
            position: relative;
            padding: 1.5rem;
            background: rgba(255, 0, 255, 0.1);
            border: 1px solid rgba(255, 0, 255, 0.3);
            border-radius: 10px;
            margin: 1rem 0;
        }
        
        .flow-step::after {
            content: '↓';
            position: absolute;
            bottom: -2rem;
            left: 50%;
            transform: translateX(-50%);
            color: #00ffff;
            font-size: 2rem;
            animation: bounce 1s infinite;
        }
        
        .flow-step:last-child::after {
            display: none;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(10px); }
        }
        
        /* Terminal Effect */
        .terminal {
            background: #0c0c0c;
            border-radius: 10px;
            padding: 1rem;
            font-family: 'Courier New', monospace;
            position: relative;
            overflow: hidden;
        }
        
        .terminal-header {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #333;
        }
        
        .terminal-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .typing-effect {
            overflow: hidden;
            white-space: nowrap;
            animation: typing 3s steps(40, end);
        }
        
        @keyframes typing {
            from { width: 0; }
            to { width: 100%; }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .neon-text-pink, .neon-text-cyan {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body class="antialiased">

    <!-- Three.js Cosmic Background -->
    <canvas id="cosmic-canvas"></canvas>

    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center animate-spin-slow">
                        <span class="text-2xl">🚀</span>
                    </div>
                    <span class="font-orbitron text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                        ASTROFOCUS
                    </span>
                </div>
                <div class="hidden md:flex space-x-8">
                    <a href="#architecture" class="text-gray-300 hover:text-cyan-400 transition-colors">Architecture</a>
                    <a href="#verification" class="text-gray-300 hover:text-pink-400 transition-colors">Identity Verify</a>
                    <a href="#tech-stack" class="text-gray-300 hover:text-cyan-400 transition-colors">Tech Stack</a>
                    <a href="#features" class="text-gray-300 hover:text-pink-400 transition-colors">Features</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-black pointer-events-none"></div>
        
        <div class="relative z-10 text-center px-4 max-w-6xl mx-auto">
            <div class="float">
                <h1 class="font-orbitron text-6xl md:text-8xl font-black mb-6 glitch">
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 neon-text-pink">
                        ASTROFOCUS
                    </span>
                </h1>
                <p class="text-2xl md:text-4xl font-light mb-4 text-cyan-300 neon-text-cyan">
                    Cosmic Study Tracker
                </p>
                <div class="flex items-center justify-center gap-4 mb-8">
                    <span class="px-4 py-1 rounded-full border border-pink-500/50 text-pink-400 text-sm">React 19</span>
                    <span class="px-4 py-1 rounded-full border border-cyan-500/50 text-cyan-400 text-sm">TypeScript</span>
                    <span class="px-4 py-1 rounded-full border border-purple-500/50 text-purple-400 text-sm">Vite 7</span>
                </div>
            </div>
            
            <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                A neon-astro themed academic companion featuring <span class="text-pink-400">persistence</span>, 
                <span class="text-cyan-400">attendance analytics</span>, 
                <span class="text-purple-400">Pomodoro focus</span>, and 
                <span class="text-pink-400">student identity verification</span>.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button class="group relative px-8 py-4 bg-transparent border-2 border-cyan-500 text-cyan-400 font-orbitron font-bold rounded-lg overflow-hidden transition-all hover:text-black">
                    <span class="absolute inset-0 w-full h-full bg-cyan-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                    <span class="relative z-10">Explore Architecture</span>
                </button>
                <button class="group relative px-8 py-4 bg-transparent border-2 border-pink-500 text-pink-400 font-orbitron font-bold rounded-lg overflow-hidden transition-all hover:text-black">
                    <span class="absolute inset-0 w-full h-full bg-pink-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                    <span class="relative z-10">View Demo</span>
                </button>
            </div>
        </div>

        <!-- Floating Elements -->
        <div class="absolute top-1/4 left-10 w-20 h-20 border border-pink-500/30 rounded-full animate-pulse"></div>
        <div class="absolute bottom-1/4 right-10 w-32 h-32 border border-cyan-500/30 rounded-full animate-pulse delay-1000"></div>
    </section>

    <!-- Tech Stack Constellation -->
    <section id="tech-stack" class="py-24 relative">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="font-orbitron text-4xl md:text-5xl font-bold text-center mb-16">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                    Tech Constellation
                </span>
            </h2>

            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
                <!-- React -->
                <div class="group flex flex-col items-center gap-3 p-6 rounded-2xl neon-card cursor-pointer">
                    <svg class="tech-icon text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/>
                        <path fill-rule="evenodd" d="M12 8c3.079 0 6.155 1.462 8.672 3.048C22.11 12.462 24 13.944 24 12c0-1.944-1.89-3.462-3.328-4.952C18.155 1.462 15.079 0 12 0S5.845 1.462 3.328 3.048C1.89 4.538 0 6.056 0 8c0 1.944 1.89 3.462 3.328 4.952C5.845 14.538 8.921 16 12 16s6.155-1.462 8.672-3.048C22.11 11.462 24 9.944 24 8c0-1.944-1.89-3.462-3.328-4.952C18.155 1.462 15.079 0 12 0Z"/>
                    </svg>
                    <span class="text-sm font-bold text-cyan-400">React 19</span>
                </div>

                <!-- TypeScript -->
                <div class="group flex flex-col items-center gap-3 p-6 rounded-2xl neon-card cursor-pointer">
                    <svg class="tech-icon text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3h18v18H3V3Zm10.71 12.29v1.85c.3.15.66.26 1.07.33.41.07.84.1 1.29.1.44 0 .85-.04 1.23-.13.38-.09.71-.22.99-.41.28-.19.5-.43.66-.71.16-.28.24-.61.24-.99 0-.27-.04-.51-.13-.71-.09-.2-.21-.38-.37-.53-.16-.15-.35-.29-.57-.41-.22-.12-.46-.23-.72-.33-.19-.07-.36-.14-.51-.21-.15-.07-.28-.14-.38-.21-.1-.07-.18-.15-.24-.22-.06-.07-.09-.15-.09-.24 0-.09.02-.17.07-.24.05-.07.12-.13.21-.18.09-.05.2-.09.33-.11.13-.02.27-.04.42-.04.15 0 .31.01.48.04.17.03.34.07.51.13.17.06.33.13.48.22.15.09.28.19.39.31V8.31c-.28-.11-.58-.19-.91-.24-.33-.05-.68-.08-1.06-.08-.43 0-.84.05-1.21.15-.37.1-.69.25-.96.45-.27.2-.48.45-.63.74-.15.29-.23.63-.23 1.01 0 .48.14.89.41 1.22.27.33.68.6 1.23.8.2.07.39.14.57.21.18.07.34.14.48.21.14.07.25.15.33.23.08.08.12.18.12.29 0 .09-.02.17-.07.24-.05.07-.12.13-.22.18-.1.05-.22.08-.36.1-.14.02-.3.03-.48.03-.32 0-.63-.05-.93-.16-.3-.11-.58-.26-.84-.47Zm-3.29-.76H8.57v2.35H6.83V7.83h3.72c.73 0 1.32.18 1.77.55.45.37.67.88.67 1.53 0 .47-.11.86-.34 1.18-.23.32-.54.56-.95.72l1.51 2.66h-1.92l-1.27-2.35Z"/>
                    </svg>
                    <span class="text-sm font-bold text-blue-400">TypeScript</span>
                </div>

                <!-- Vite -->
                <div class="group flex flex-col items-center gap-3 p-6 rounded-2xl neon-card cursor-pointer">
                    <svg class="tech-icon text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.67 1.55c-.1-.35-.38-.62-.73-.72L11.97 0c-.36-.1-.74.02-.99.29L.43 11.14c-.26.27-.35.66-.23 1.01l4.43 13.21c.11.34.39.6.73.7l10.97 2.83c.36.09.74-.02 1-.29l10.55-10.85c.26-.27.35-.66.23-1.01L23.67 1.55ZM11.74 21.75c-4.5 0-8.15-3.65-8.15-8.15 0-4.5 3.65-8.15 8.15-8.15 4.5 0 8.15 3.65 8.15 8.15 0 4.5-3.65 8.15-8.15 8.15Z"/>
                    </svg>
                    <span class="text-sm font-bold text-purple-400">Vite 7</span>
                </div>

                <!-- Tailwind -->
                <div class="group flex flex-col items-center gap-3 p-6 rounded-2xl neon-card cursor-pointer">
                    <svg class="tech-icon text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
                    </svg>
                    <span class="text-sm font-bold text-cyan-400">Tailwind</span>
                </div>

                <!-- Framer Motion -->
                <div class="group flex flex-col items-center gap-3 p-6 rounded-2xl neon-card cursor-pointer">
                    <svg class="tech-icon text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm0 2.3l8.2 4.7-3.5 2L12 6.3l-4.7 2.7-3.5-2L12 2.3zM4.5 8.4l3.5 2v5.4l4.7 2.7v4l-8.2-4.7V8.4zm15 0v9.4l-8.2 4.7v-4l4.7-2.7V10.4l3.5-2z"/>
                    </svg>
                    <span class="text-sm font-bold text-pink-400">Framer</span>
                </div>

                <!-- Recharts -->
                <div class="group flex flex-col items-center gap-3 p-6 rounded-2xl neon-card cursor-pointer">
                    <svg class="tech-icon text-green-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3v18h18v-2H5V3H3zm4 14h2v-7H7v7zm4 0h2V7h-2v10zm4 0h2v-4h-2v4z"/>
                    </svg>
                    <span class="text-sm font-bold text-green-400">Recharts</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Architecture Deep Dive -->
    <section id="architecture" class="py-24 relative bg-black/50">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="font-orbitron text-4xl md:text-5xl font-bold text-center mb-16">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                    System Architecture
                </span>
            </h2>

            <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div class="space-y-6">
                    <div class="neon-card p-6 rounded-xl">
                        <h3 class="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
                            <span class="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">1</span>
                            LocalStorage-First Design
                        </h3>
                        <p class="text-gray-400 leading-relaxed">
                            University students often face unreliable internet. Our architecture prioritizes offline functionality 
                            with intelligent sync capabilities. All data persists locally with hydration guards to prevent accidental overwrites.
                        </p>
                    </div>

                    <div class="neon-card p-6 rounded-xl">
                        <h3 class="text-xl font-bold text-pink-400 mb-3 flex items-center gap-2">
                            <span class="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">2</span>
                            React Context State Management
                        </h3>
                        <p class="text-gray-400 leading-relaxed">
                            Moderate state complexity managed through React Context API with custom hooks. 
                            No Redux boilerplate—just clean, type-safe state propagation.
                        </p>
                    </div>

                    <div class="neon-card p-6 rounded-xl">
                        <h3 class="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                            <span class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">3</span>
                            TypeScript Strict Mode
                        </h3>
                        <p class="text-gray-400 leading-relaxed">
                            Compile-time guarantees for attendance calculations and GPA computations. 
                            Zero runtime type errors in financial/academic logic.
                        </p>
                    </div>
                </div>

                <div class="terminal">
                    <div class="terminal-header">
                        <div class="terminal-dot bg-red-500"></div>
                        <div class="terminal-dot bg-yellow-500"></div>
                        <div class="terminal-dot bg-green-500"></div>
                        <span class="ml-4 text-gray-500 text-sm">architecture.tsx</span>
                    </div>
                    <pre class="text-sm text-gray-300 overflow-x-auto"><code class="typing-effect">src/
├── components/          # Neon-astro design system
│   ├── Dashboard/       # Mission Control
│   ├── Timer/           # AstroFocus Mode
│   ├── Attendance/      # Analytics engine
│   └── Wardrobe/        # Knowledge library
├── hooks/
│   ├── useLocalStorage  # Persistence layer
│   ├── useAttendance    # Calculation engine
│   └── useTimer         # Pomodoro logic
├── context/
│   ├── AuthContext      # Student verification
│   └── ThemeContext     # Neon aesthetic
└── services/
    ├── verificationService.ts  # NEW: JSS API
    └── aiService.ts            # OpenAI integration</code></pre>
                </div>
            </div>
        </div>
    </section>

    <!-- Student Identity Verification Feature -->
    <section id="verification" class="py-24 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-pink-900/20 to-cyan-900/20"></div>
        
        <div class="max-w-7xl mx-auto px-4 relative z-10">
            <div class="text-center mb-16">
                <span class="inline-block px-4 py-1 rounded-full bg-pink-500/20 text-pink-400 text-sm font-bold mb-4 border border-pink-500/50">
                    NEW FEATURE
                </span>
                <h2 class="font-orbitron text-4xl md:text-6xl font-bold mb-6">
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                        Identity Verification
                    </span>
                </h2>
                <p class="text-xl text-gray-400 max-w-3xl mx-auto">
                    Secure, university-integrated verification system. Students validate against official JSS records 
                    using Roll Number + Mobile for personalized access.
                </p>
            </div>

            <!-- Verification Flow -->
            <div class="max-w-3xl mx-auto mb-16">
                <div class="flow-step">
                    <div class="flex items-center gap-4 mb-2">
                        <div class="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">1</div>
                        <h3 class="text-lg font-bold text-white">Entry Gate</h3>
                    </div>
                    <p class="text-gray-400 pl-14">Student enters Roll Number (e.g., 21BCE001) and Mobile Number in neon-animated verification form.</p>
                </div>

                <div class="flow-step">
                    <div class="flex items-center gap-4 mb-2">
                        <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">2</div>
                        <h3 class="text-lg font-bold text-white">University API Validation</h3>
                    </div>
                    <p class="text-gray-400 pl-14">Secure HTTPS POST to JSS University database. Credentials validated in real-time.</p>
                </div>

                <div class="flow-step">
                    <div class="flex items-center gap-4 mb-2">
                        <div class="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold">3</div>
                        <h3 class="text-lg font-bold text-white">Data Retrieval & Storage</h3>
                    </div>
                    <p class="text-gray-400 pl-14">Name, Department, and Year fetched. Mobile hashed (SHA-256). Data persisted to namespaced LocalStorage.</p>
                </div>

                <div class="flow-step">
                    <div class="flex items-center gap-4 mb-2">
                        <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">4</div>
                        <h3 class="text-lg font-bold text-white">Personalized Dashboard</h3>
                    </div>
                    <p class="text-gray-400 pl-14">"Welcome back, [Name] 🚀" — All academic data (attendance, GPA, assignments) linked to verified identity.</p>
                </div>
            </div>

            <!-- Code Implementation -->
            <div class="code-block rounded-xl p-6 max-w-4xl mx-auto mb-12">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-cyan-400 font-mono text-sm">verificationService.ts</span>
                    <span class="text-gray-500 text-xs">TypeScript</span>
                </div>
                <pre class="text-sm text-gray-300 overflow-x-auto"><code><span class="text-purple-400">interface</span> <span class="text-cyan-400">StudentRecord</span> {
  <span class="text-pink-400">rollNumber</span>: <span class="text-yellow-400">string</span>;
  <span class="text-pink-400">mobileHash</span>: <span class="text-yellow-400">string</span>;  <span class="text-gray-500">// SHA-256 encrypted</span>
  <span class="text-pink-400">name</span>: <span class="text-yellow-400">string</span>;
  <span class="text-pink-400">department</span>: <span class="text-yellow-400">string</span>;
  <span class="text-pink-400">year</span>: <span class="text-yellow-400">number</span>;
  <span class="text-pink-400">isVerified</span>: <span class="text-yellow-400">boolean</span>;
}

<span class="text-purple-400">class</span> <span class="text-cyan-400">StudentVerificationService</span> {
  <span class="text-purple-400">async</span> <span class="text-blue-400">verifyStudent</span>(rollNo: <span class="text-yellow-400">string</span>, mobile: <span class="text-yellow-400">string</span>) {
    <span class="text-gray-500">// Validate against JSS University API</span>
    <span class="text-purple-400">const</span> response = <span class="text-purple-400">await</span> <span class="text-blue-400">fetch</span>(<span class="text-green-400">`/api/verify`</span>, {
      method: <span class="text-green-400">'POST'</span>,
      body: <span class="text-yellow-400">JSON</span>.<span class="text-blue-400">stringify</span>({ rollNo, mobile })
    });
    
    <span class="text-purple-400">if</span> (response.ok) {
      <span class="text-purple-400">const</span> data = <span class="text-purple-400">await</span> response.<span class="text-blue-400">json</span>();
      <span class="text-purple-400">this</span>.<span class="text-blue-400">storeVerifiedStudent</span>(data);
      <span class="text-purple-400">return</span> data;
    }
  }
}</code></pre>
            </div>

            <!-- Security Features -->
            <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div class="neon-card p-6 rounded-xl text-center">
                    <div class="text-4xl mb-4">🔒</div>
                    <h3 class="text-lg font-bold text-cyan-400 mb-2">Privacy First</h3>
                    <p class="text-gray-400 text-sm">Mobile numbers hashed. Only name and academic metadata stored.</p>
                </div>
                <div class="neon-card p-6 rounded-xl text-center">
                    <div class="text-4xl mb-4">💾</div>
                    <h3 class="text-lg font-bold text-pink-400 mb-2">Persistent Data</h3>
                    <p class="text-gray-400 text-sm">Verified status cached. No re-verification needed on browser restart.</p>
                </div>
                <div class="neon-card p-6 rounded-xl text-center">
                    <div class="text-4xl mb-4">⚡</div>
                    <h3 class="text-lg font-bold text-purple-400 mb-2">Offline Capable</h3>
                    <p class="text-gray-400 text-sm">Once verified, app functions fully offline. Data syncs when online.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Core Features Grid -->
    <section id="features" class="py-24 relative bg-black/50">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="font-orbitron text-4xl md:text-5xl font-bold text-center mb-16">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                    Mission Control Features
                </span>
            </h2>

            <div class="feature-grid">
                <!-- Dashboard -->
                <div class="neon-card rounded-2xl p-8 group hover:scale-105 transition-transform duration-300">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl mb-6 group-hover:animate-bounce">
                        🎯
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-3">Mission Control</h3>
                    <p class="text-gray-400 mb-4">North Star Goals, GPA tracking with Distance-to-Target analytics, and daily heatmaps with neon pink visualization.</p>
                    <div class="flex gap-2 flex-wrap">
                        <span class="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">Heatmap</span>
                        <span class="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">Analytics</span>
                    </div>
                </div>

                <!-- Timer -->
                <div class="neon-card rounded-2xl p-8 group hover:scale-105 transition-transform duration-300">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl mb-6 group-hover:animate-bounce">
                        ⏱️
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-3">AstroFocus Timer</h3>
                    <p class="text-gray-400 mb-4">Pomodoro with Focus Burst and Recharge Orbit modes. Ambient soundscapes, subject tagging, and XP gain (+1/min).</p>
                    <div class="flex gap-2 flex-wrap">
                        <span class="text-xs px-2 py-1 rounded bg-pink-500/20 text-pink-400">Pomodoro</span>
                        <span class="text-xs px-2 py-1 rounded bg-pink-500/20 text-pink-400">XP System</span>
                    </div>
                </div>

                <!-- Attendance -->
                <div class="neon-card rounded-2xl p-8 group hover:scale-105 transition-transform duration-300">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-2xl mb-6 group-hover:animate-bounce">
                        📊
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-3">Smart Attendance</h3>
                    <p class="text-gray-400 mb-4">Drag-drop timetable editor, predictive analytics (skipable/needed classes), and automated calculations excluding holidays.</p>
                    <div class="flex gap-2 flex-wrap">
                        <span class="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Predictions</span>
                        <span class="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">75% Target</span>
                    </div>
                </div>

                <!-- Wardrobe -->
                <div class="neon-card rounded-2xl p-8 group hover:scale-105 transition-transform duration-300">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl mb-6 group-hover:animate-bounce">
                        🧠
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-3">Knowledge Wardrobe</h3>
                    <p class="text-gray-400 mb-4">Per-subject markdown notes, diagram canvas, AI summaries, and auto-generated quizzes. Video tracking with XP rewards.</p>
                    <div class="flex gap-2 flex-wrap">
                        <span class="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">AI Quiz</span>
                        <span class="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">Canvas</span>
                    </div>
                </div>

                <!-- Assignments -->
                <div class="neon-card rounded-2xl p-8 group hover:scale-105 transition-transform duration-300">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-2xl mb-6 group-hover:animate-bounce">
                        📝
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-3">Mission Assignments</h3>
                    <p class="text-gray-400 mb-4">Priority Gravity Wells (High/Medium/Low), subtask checklists, and resource linking with quick-play functionality.</p>
                    <div class="flex gap-2 flex-wrap">
                        <span class="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">+50 XP</span>
                        <span class="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">Priority</span>
                    </div>
                </div>

                <!-- Grade Calculator -->
                <div class="neon-card rounded-2xl p-8 group hover:scale-105 transition-transform duration-300">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-2xl mb-6 group-hover:animate-bounce">
                        🎓
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-3">Grade Calculator</h3>
                    <p class="text-gray-400 mb-4">SGPA computation with custom grading scales (10-point system). Real-time grade point analysis and credit tracking.</p>
                    <div class="flex gap-2 flex-wrap">
                        <span class="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">SGPA</span>
                        <span class="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">Credits</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- XP & Levels System -->
    <section class="py-24 relative">
        <div class="max-w-5xl mx-auto px-4 text-center">
            <h2 class="font-orbitron text-4xl font-bold mb-12">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                    Gamification System
                </span>
            </h2>
            
            <div class="neon-card rounded-2xl p-8 max-w-3xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <div class="text-left">
                        <p class="text-gray-400 text-sm">Current Level</p>
                        <p class="text-3xl font-bold text-cyan-400">Level 5</p>
                    </div>
                    <div class="text-right">
                        <p class="text-gray-400 text-sm">Total XP</p>
                        <p class="text-3xl font-bold text-pink-400">7,240 XP</p>
                    </div>
                </div>
                
                <div class="relative h-4 bg-gray-800 rounded-full overflow-hidden mb-6">
                    <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 w-3/4 animate-pulse"></div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="bg-black/50 p-3 rounded-lg">
                        <span class="text-cyan-400 font-bold">+1 XP</span>
                        <p class="text-gray-500">Per Study Minute</p>
                    </div>
                    <div class="bg-black/50 p-3 rounded-lg">
                        <span class="text-pink-400 font-bold">+50 XP</span>
                        <p class="text-gray-500">Assignment Done</p>
                    </div>
                    <div class="bg-black/50 p-3 rounded-lg">
                        <span class="text-green-400 font-bold">+10 XP</span>
                        <p class="text-gray-500">Class Present</p>
                    </div>
                    <div class="bg-black/50 p-3 rounded-lg">
                        <span class="text-yellow-400 font-bold">+100 XP</span>
                        <p class="text-gray-500">Level Up Bonus</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Start -->
    <section class="py-24 relative bg-gradient-to-b from-black to-purple-900/20">
        <div class="max-w-4xl mx-auto px-4">
            <h2 class="font-orbitron text-4xl font-bold text-center mb-12">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                    Launch Sequence
                </span>
            </h2>

            <div class="space-y-6">
                <div class="code-block rounded-xl p-6">
                    <div class="flex items-center gap-4 mb-4">
                        <span class="text-cyan-400 font-mono">$</span>
                        <span class="text-gray-300 font-mono">git clone https://github.com/krix2112/AstroFocus-Study-Tracker.git</span>
                    </div>
                    <div class="flex items-center gap-4 mb-4">
                        <span class="text-cyan-400 font-mono">$</span>
                        <span class="text-gray-300 font-mono">cd AstroFocus-Study-Tracker</span>
                    </div>
                    <div class="flex items-center gap-4 mb-4">
                        <span class="text-cyan-400 font-mono">$</span>
                        <span class="text-gray-300 font-mono">npm install</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="text-cyan-400 font-mono">$</span>
                        <span class="text-gray-300 font-mono">npm run dev</span>
                        <span class="text-gray-500 ml-4"># Launch at http://localhost:5173</span>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="neon-card p-6 rounded-xl">
                        <h3 class="text-lg font-bold text-cyan-400 mb-3">Environment Setup</h3>
                        <pre class="text-xs text-gray-400 overflow-x-auto">VITE_UNIVERSITY_API_URL=https://api.jssuniversity.edu
VITE_AI_ENDPOINT=your_openai_endpoint
VITE_AI_API_KEY=your_api_key</pre>
                    </div>
                    <div class="neon-card p-6 rounded-xl">
                        <h3 class="text-lg font-bold text-pink-400 mb-3">Deploy to Vercel</h3>
                        <p class="text-sm text-gray-400">Build command: <span class="text-cyan-400">npm run build</span><br>
                        Output directory: <span class="text-cyan-400">dist</span><br>
                        Framework: <span class="text-cyan-400">Vite</span></p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <div class="flex items-center justify-center gap-3 mb-6">
                <span class="text-3xl">🚀</span>
                <span class="font-orbitron text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                    ASTROFOCUS
                </span>
            </div>
            <p class="text-gray-500 mb-6">Built with 💜 for JSS University Students</p>
            <div class="flex justify-center gap-6 text-sm">
                <a href="#" class="text-gray-400 hover:text-cyan-400 transition-colors">Documentation</a>
                <a href="#" class="text-gray-400 hover:text-pink-400 transition-colors">GitHub</a>
                <a href="#" class="text-gray-400 hover:text-purple-400 transition-colors">Report Issue</a>
            </div>
            <p class="text-gray-600 text-xs mt-8">© 2024 AstroFocus. MIT License.</p>
        </div>
    </footer>

    <script>
        // Three.js Cosmic Background
        const canvas = document.getElementById('cosmic-canvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Create stars
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 2000;
        const posArray = new Float32Array(starsCount * 3);
        const colorArray = new Float32Array(starsCount * 3);
        
        for(let i = 0; i < starsCount * 3; i += 3) {
            // Positions
            posArray[i] = (Math.random() - 0.5) * 100;
            posArray[i+1] = (Math.random() - 0.5) * 100;
            posArray[i+2] = (Math.random() - 0.5) * 100;
            
            // Colors (pink, cyan, purple, white)
            const colorChoice = Math.random();
            if(colorChoice < 0.25) {
                colorArray[i] = 1; colorArray[i+1] = 0; colorArray[i+2] = 1; // Pink
            } else if(colorChoice < 0.5) {
                colorArray[i] = 0; colorArray[i+1] = 1; colorArray[i+2] = 1; // Cyan
            } else if(colorChoice < 0.75) {
                colorArray[i] = 0.5; colorArray[i+1] = 0; colorArray[i+2] = 1; // Purple
            } else {
                colorArray[i] = 1; colorArray[i+1] = 1; colorArray[i+2] = 1; // White
            }
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starsMesh);
        
        camera.position.z = 30;
        
        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            starsMesh.rotation.x += 0.0005;
            starsMesh.rotation.y += 0.0005;
            
            // Subtle mouse parallax
            starsMesh.rotation.x += mouseY * 0.0005;
            starsMesh.rotation.y += mouseX * 0.0005;
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Smooth scroll for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if(target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.neon-card').forEach((el) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    </script>
</body>
</html>
