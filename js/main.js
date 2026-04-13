const container = document.getElementById('webgl-container');
const bg911 = document.getElementById('background-911');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.02);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

const backLight = new THREE.PointLight(0xffffff, 3, 20);
backLight.position.set(-5, 5, -5);
scene.add(backLight);

const carGroup = new THREE.Group();
scene.add(carGroup);


const uploadScreen = document.getElementById('upload-screen');
const webglContainer = document.getElementById('webgl-container');
const contentLayer = document.querySelector('.content-layer');
const mainHeader = document.getElementById('main-header');
let isModelLoaded = false;
let baseScaleFactor = 10.5; 

// THEME TOGGLE LOGIC
const themeToggleBtn = document.getElementById('themeToggleBtn');
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');
let isLightMode = false;

// Função inteligente para alterar a pintura do carro sem afetar vidros ou pneus
function applyThemeToCar(isLight) {
    carGroup.traverse((child) => {
        if (child.isMesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            
            materials.forEach(mat => {
                // Guardar a cor original do modelo na primeira vez
                if (!mat.userData.originalColor) {
                    mat.userData.originalColor = mat.color.clone();
                }
                
                const name = (mat.name || child.name || "").toLowerCase();
                
                // Heurística avançada para proteger peças essenciais de serem pintadas de prata
                const keepOriginal = name.includes('glass') || name.includes('window') || name.includes('transp') || name.includes('vidro') ||
                                     name.includes('tire') || name.includes('wheel') || name.includes('rim') || name.includes('rubber') || name.includes('pneu') || name.includes('roda') ||
                                     name.includes('interior') || name.includes('seat') || name.includes('leather') || name.includes('banco') || name.includes('fabric') ||
                                     name.includes('light') || name.includes('lamp') || name.includes('luz') || name.includes('farol') || name.includes('led') ||
                                     name.includes('grill') || name.includes('plastic') || name.includes('plastico') || name.includes('carbon') || name.includes('exhaust') ||
                                     name.includes('brake') || name.includes('caliper') || name.includes('freio') || name.includes('logo') || name.includes('badge') || name.includes('emblem');

                const isPaint = name.includes('paint') || name.includes('body') || name.includes('carroceria') || name.includes('exterior') || name.includes('shell');
                
                // Aplica a cor prata apenas à carroçaria ou elementos não protegidos
                if (isPaint || (!keepOriginal && !mat.transparent)) {
                    if (isLight) {
                        mat.color.setHex(0xe4e4e7); // Prata claro elegante (menos "estourado" que o branco puro)
                        if (mat.emissive) mat.emissive.setHex(0x151515); // Emissão bem mais suave para não ofuscar
                    } else {
                        mat.color.copy(mat.userData.originalColor); // Restaura cor original (escuro)
                        if (mat.emissive) mat.emissive.setHex(0x000000); // Remove a emissão de luz
                    }
                }
            });
        }
    });
}

themeToggleBtn.addEventListener('click', () => {
    isLightMode = !isLightMode;
    document.body.classList.toggle('light-mode');
    
    iconSun.classList.toggle('hidden');
    iconMoon.classList.toggle('hidden');
    
    // Adjust 3D environment for better visibility in light mode
    if (isLightMode) {
        scene.fog.color.setHex(0xf4f4f5); // Fundo cinza claro
        ambientLight.intensity = 8.0; // Luz reduzida para um brilho mais natural
        directionalLight.intensity = 15.0; 
        spotLight.intensity = 25.0; 
        backLight.intensity = 10.0; 
    } else {
        scene.fog.color.setHex(0x050505); // Fundo preto original
        ambientLight.intensity = 1.2;
        directionalLight.intensity = 3.0;
        spotLight.intensity = 8.0;
        backLight.intensity = 3.0;
    }

    // Atualiza a cor do carro para combinar com o tema
    applyThemeToCar(isLightMode);
});

const loader = new THREE.GLTFLoader();
const modelPath = 'assets/free_porsche_911_carrera_4s.glb';

loader.load(
    modelPath, 
    function(gltf) {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        const finalScale = baseScaleFactor / maxDim;
        model.scale.set(finalScale, finalScale, finalScale);
        
        model.position.x = -center.x * finalScale;
        model.position.y = -box.min.y * finalScale; 
        model.position.z = -center.z * finalScale;

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        carGroup.add(model);
        isModelLoaded = true;
        
        // Garante que o carro carregue na cor prata se o utilizador já estiver no Light Mode
        applyThemeToCar(isLightMode);
        
        uploadScreen.style.opacity = '0';
        setTimeout(() => {
            uploadScreen.style.display = 'none';
            webglContainer.style.opacity = '1';
            contentLayer.style.opacity = '1';
            mainHeader.style.opacity = '1';
            bg911.style.opacity = '1';
            checkSectionsVisibility();
        }, 800);
    }, 
    function(xhr) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            if (xhr.total > 0) {
                const percent = Math.round(xhr.loaded / xhr.total * 100);
                loadingText.textContent = `LOADING EXPERIENCE... ${percent}%`;
            } else {
                const downloadedMB = (xhr.loaded / (1024 * 1024)).toFixed(1);
                loadingText.textContent = `LOADING EXPERIENCE... ${downloadedMB}MB`;
            }
        }
    }, 
    function(error) {
        console.error('An error happened loading the model:', error);
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.textContent = "Error loading 3D model.";
    }
);

const floorGeo = new THREE.PlaneGeometry(200, 200);
const floorMat = new THREE.ShadowMaterial({ opacity: 0.5 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const spotLight = new THREE.SpotLight(0xffffff, 8);
spotLight.position.set(0, 15, 0);
spotLight.angle = Math.PI / 5;
spotLight.penumbra = 0.8;
spotLight.castShadow = true;
spotLight.target = carGroup;
scene.add(spotLight);

let scrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (!isModelLoaded) return;
    scrollY = window.scrollY;
    checkSectionsVisibility();

    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;

    // Header Visibility
    if (scrollY > 60) {
        mainHeader.style.opacity = '0';
        mainHeader.style.transform = 'translateY(-20px)';
        mainHeader.style.pointerEvents = 'none';
    } else {
        mainHeader.style.opacity = '1';
        mainHeader.style.transform = 'translateY(0)';
        mainHeader.style.pointerEvents = 'auto';
    }

    // BACKGROUND 911 (Secção 1 - Hero)
    if (scrollProgress < 0.08) {
        bg911.style.opacity = '1';
        bg911.style.transform = 'translate(-50%, -50%) scale(1)';
    } else {
        bg911.style.opacity = '0';
        bg911.style.transform = 'translate(-50%, -60%) scale(0.95)';
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCarousel(); 
});

const sections = document.querySelectorAll('section');
function checkSectionsVisibility() {
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
            section.classList.add('visible');
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (isModelLoaded) {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;

        const targetRotY = scrollProgress * (Math.PI * 3.5); 
        carGroup.rotation.y += (targetRotY - carGroup.rotation.y) * 0.08;

        let targetX = 0;
        let targetY = 0;
        let targetZ = 0;

        if (scrollProgress <= 0.05) {
            targetX = 0;
        }
        else if (scrollProgress > 0.05 && scrollProgress <= 0.20) {
            const p = (scrollProgress - 0.05) / 0.15;
            targetX = (p * p * (3 - 2 * p)) * 4.2; 
        }
        else if (scrollProgress > 0.20 && scrollProgress <= 0.25) {
            targetX = 4.2;
        }
        else if (scrollProgress > 0.25 && scrollProgress <= 0.40) {
            const p = (scrollProgress - 0.25) / 0.15;
            targetX = 4.2 - ((p * p * (3 - 2 * p)) * 8.4); 
        }
        else if (scrollProgress > 0.40 && scrollProgress <= 0.45) {
            targetX = -4.2;
        }
        else if (scrollProgress > 0.45 && scrollProgress <= 0.60) {
            const p = (scrollProgress - 0.45) / 0.15;
            const easeP = p * p * (3 - 2 * p);
            targetX = -4.2 + (easeP * 4.2); 
            targetY = easeP * 1.5; 
            targetZ = easeP * -2.0; 
        }
        else if (scrollProgress > 0.60 && scrollProgress <= 0.65) {
            targetX = 0;
            targetY = 1.5;
            targetZ = -2.0;
        }
        else if (scrollProgress > 0.65 && scrollProgress <= 0.80) {
            const p = (scrollProgress - 0.65) / 0.15;
            const easeP = p * p * (3 - 2 * p);
            targetX = 0; 
            targetY = 1.5 - (easeP * 4.0);
            targetZ = -2.0 - (easeP * 3.0);
        }
        else if (scrollProgress > 0.80 && scrollProgress <= 0.86) {
            targetX = 0;
            targetY = -2.5;
            targetZ = -5.0;
        }
        else if (scrollProgress > 0.86) {
            const p = Math.min((scrollProgress - 0.86) / 0.14, 1.0);
            targetX = 0;
            targetY = -2.5 + (p * 5.8); 
            targetZ = -5.0;
        }

        carGroup.position.x += (targetX - carGroup.position.x) * 0.06;
        carGroup.position.y += (targetY - carGroup.position.y) * 0.06;
        carGroup.position.z += (targetZ - carGroup.position.z) * 0.06;
    }

    renderer.render(scene, camera);
}

// LÓGICA DO CARROSSEL (ENGENHARIA)
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dots = document.querySelectorAll('.dot');
const navTabs = document.querySelectorAll('.nav-tab');
let currentSlide = 0;

function updateCarousel() {
    if (!track) return;
    const maxIndex = navTabs.length - 1;

    if (currentSlide < 0) currentSlide = 0;
    if (currentSlide > maxIndex) currentSlide = maxIndex;

    const slideWidth = track.children[0].getBoundingClientRect().width;
    
    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;

    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.remove('bg-white/30', 'w-2');
            dot.classList.add('bg-white', 'w-8');
        } else {
            dot.classList.remove('bg-white', 'w-8');
            dot.classList.add('bg-white/30', 'w-2');
        }
    });

    navTabs.forEach((tab, index) => {
        if (index === currentSlide) {
            tab.classList.add('text-white', 'border-b-2', 'border-red-600');
            tab.classList.remove('text-white/50');
        } else {
            tab.classList.remove('text-white', 'border-b-2', 'border-red-600');
            tab.classList.add('text-white/50');
        }
    });
}

if (prevBtn && nextBtn) {
    nextBtn.addEventListener('click', () => {
        const maxIndex = navTabs.length - 1;
        if (currentSlide < maxIndex) {
            currentSlide++;
            updateCarousel();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    });

    navTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });

    setTimeout(updateCarousel, 100);
}

animate();