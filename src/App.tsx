import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Leaf } from 'lucide-react';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import HomeView from './views/HomeView';
import MarketplaceView from './views/MarketplaceView';
import TechnologyView from './views/TechnologyView';
import GovernanceView from './views/GovernanceView';
import ProjectDetailView from './views/ProjectDetailView';
import AboutView from './views/AboutView';

const App = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState('home'); // home, marketplace, technology, governance, detail
  const [selectedProject, setSelectedProject] = useState<any>(null); // Stores the data of the clicked project
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState('login');

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- 3D Starfield Logic (Three.js) ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.BufferGeometry();
    const count = 3000;
    const posArray = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({
      size: 0.008,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const starMesh = new THREE.Points(geometry, material);
    scene.add(starMesh);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX - window.innerWidth / 2;
      mouseY = event.clientY - window.innerHeight / 2;
    };

    document.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      targetX = mouseX * 0.001;
      targetY = mouseY * 0.001;
      starMesh.rotation.y = elapsedTime * 0.05;
      starMesh.rotation.x += 0.05 * (targetY - starMesh.rotation.x);
      starMesh.rotation.y += 0.05 * (targetX - starMesh.rotation.y);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
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
      document.removeEventListener('mousemove', handleMouseMove);
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // --- Scroll Listener ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Navigation Handler ---
  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setActiveTab('detail');
    window.scrollTo(0, 0);
  };

  // --- Main Render ---
  return (
    <div className="relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-emerald-500/30">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          scrolled={scrolled}
          setAuthType={setAuthType}
          setShowAuth={setShowAuth}
        />
        <AuthModal
          showAuth={showAuth}
          setShowAuth={setShowAuth}
          authType={authType}
          setAuthType={setAuthType}
        />

        <main className="flex-grow">
          {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} handleProjectClick={handleProjectClick} />}
          {activeTab === 'marketplace' && <MarketplaceView handleProjectClick={handleProjectClick} />}
          {activeTab === 'technology' && <TechnologyView />}
          {activeTab === 'governance' && <GovernanceView />}
          {activeTab === 'about' && <AboutView />}
          {activeTab === 'detail' && selectedProject && <ProjectDetailView selectedProject={selectedProject} setActiveTab={setActiveTab} handleProjectClick={handleProjectClick} />}
        </main>

        <footer className="border-t border-white/10 bg-[#020202] pt-20 pb-10 px-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <div className="text-2xl font-serif text-white tracking-wider flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center">
                  <Leaf size={12} className="text-white" />
                </div>
                Terra Nova
              </div>
              <p className="text-white/40 text-sm">
                Building the infrastructure for a net-zero economy. Transparent, secure, and decentralized.
              </p>
            </div>
            <div className="flex gap-16 text-sm">
              <div>
                <h4 className="text-white font-medium mb-4">Platform</h4>
                <ul className="space-y-2 text-white/40">
                  <li><button onClick={() => setActiveTab('marketplace')} className="hover:text-emerald-400 transition-colors">Marketplace</button></li>
                  <li><button onClick={() => setActiveTab('technology')} className="hover:text-emerald-400 transition-colors">Technology</button></li>
                  <li><button onClick={() => setActiveTab('governance')} className="hover:text-emerald-400 transition-colors">Governance</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4">Company</h4>
                <ul className="space-y-2 text-white/40">
                  <li><button onClick={() => setActiveTab('about')} className="hover:text-emerald-400 transition-colors">About Us</button></li>
                  <li><button onClick={() => setActiveTab('home')} className="hover:text-emerald-400 transition-colors">Contact Us</button></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between text-xs text-white/20">
            <div>© 2024 DCCP Protocol. All rights reserved.</div>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
