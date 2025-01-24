// Importação
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

// Variáveis principais
let scene, camera, renderer, player;
let currentRoom = "main";
let doors = [];
const keys = {};
let isWalking = false; // Controleo de animação de caminhada
let roomHistory = []; // Histórico de salas



// Configuração inicial
function init() {
    // Cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 7); // Mais alto e distante
    camera.lookAt(0, 1, 0); // Angulo para o corpo do jogador


    // Renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Luz
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    // Criar jogador
    player = createPlayerModel();
    player.position.set(0, 2.5, 4); // Levantar o jogador acima do chão
    scene.add(player);

    // Configuração da sala inicial
    createMainRoom();

    // Eventos
    document.addEventListener('keydown', (e) => (keys[e.key] = true));
    document.addEventListener('keyup', (e) => (keys[e.key] = false));
    window.addEventListener('resize', onWindowResize);

    animate();
}



// Criação do modelo do jogador
function createPlayerModel() {
    const createLimb = (width, height, depth, color = 0x00ff00) => {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ color });
        return new THREE.Mesh(geometry, material);
    };

    const body = createLimb(1, 2, 0.5, 0x808080);

    const head = createLimb(0.7, 0.7, 0.7, 0xffcc99);
    head.position.y = 1.7;
    body.add(head);

    const leftArmPivot = new THREE.Object3D();
    body.add(leftArmPivot);
    leftArmPivot.position.set(-0.8, 1.0, 0);

    const rightArmPivot = new THREE.Object3D();
    body.add(rightArmPivot);
    rightArmPivot.position.set(0.8, 1.0, 0);

    const leftArm = createLimb(0.4, 1.2, 0.4, 0x00ff00);
    const rightArm = createLimb(0.4, 1.2, 0.4, 0x00ff00);
    leftArm.position.set(0, -0.5, 0);
    rightArm.position.set(0, -0.5, 0);
    leftArmPivot.add(leftArm);
    rightArmPivot.add(rightArm);

    const leftLegPivot = new THREE.Object3D();
    body.add(leftLegPivot);
    leftLegPivot.position.set(-0.4, -0.9, 0);

    const rightLegPivot = new THREE.Object3D();
    body.add(rightLegPivot);
    rightLegPivot.position.set(0.4, -0.9, 0);

    const leftLeg = createLimb(0.5, 1.5, 0.5, 0x0000ff);
    const rightLeg = createLimb(0.5, 1.5, 0.5, 0x0000ff);
    leftLeg.position.set(0, -0.75, 0);
    rightLeg.position.set(0, -0.75, 0);
    leftLegPivot.add(leftLeg);
    rightLegPivot.add(rightLeg);

    body.leftArmPivot = leftArmPivot;
    body.rightArmPivot = rightArmPivot;
    body.leftLegPivot = leftLegPivot;
    body.rightLegPivot = rightLegPivot;

    // Ajustar escala do boneco
    body.scale.set(0.5, 0.5, 0.5); // Reduz o tamanho para 50%

    return body;
}


// Criar sala principal
function createMainRoom() {
    clearScene();

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide }) // Ambos os lados visíveis
    );
    
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    floor.position.y = 0; // Ajusta o nível do chão

    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    backWall.position.set(0, 2.5, -5);
    scene.add(backWall);

    const door = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    door.position.set(0, 2, -4.9);
    door.name = "mainDoor";
    scene.add(door);
    doors = [door];
}

//Camara segue o jogador
function updateCameraPosition() {
    camera.position.set(player.position.x, player.position.y + 3, player.position.z + 5); // Segue o jogador
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z); // Mantém o foco no jogador
}


// Criar a sala com três portas
function createRoomWithThreeDoors() {
    clearScene();

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    backWall.position.set(0, 2.5, -5);
    scene.add(backWall);

    doors = [];
    const doorColors = [0xff0000, 0x00ff00, 0x0000ff];
    const doorPositions = [-3, 0, 3];

    for (let i = 0; i < 3; i++) {
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(2, 4, 0.1),
            new THREE.MeshStandardMaterial({ color: doorColors[i] })
        );
        door.position.set(doorPositions[i], 2, -4.9);
        door.name = `door${i + 1}`;
        scene.add(door);
        doors.push(door);
    }
}

// Criar cidade
function createCity() {
    clearScene();

    // Piso da cidade
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200), //Tamanho do plano
        new THREE.MeshStandardMaterial({ color: 0x505050 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Adicionar o céu
    const sky = new THREE.Mesh(
        new THREE.SphereGeometry(100, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x87ceeb, side: THREE.BackSide }) // Azul claro (sky blue)
    );
    scene.add(sky);

    // Criar limites da cidade
    const cityBounds = createCityBounds();
    scene.add(cityBounds);

    // Criar edifícios variados
    const createBuilding = (width, height, depth, color) => {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ color });
        const building = new THREE.Mesh(geometry, material);
        building.castShadow = true;
        return building;
    };

    for (let i = 0; i < 15; i++) {
        const width = Math.random() * 3 + 2; // Largura entre 2 e 5
        const height = Math.random() * 15 + 5; // Altura entre 5 e 20
        const depth = Math.random() * 3 + 2; // Profundidade entre 2 e 5
        const color = Math.random() * 0xffffff;

        const building = createBuilding(width, height, depth, color);
        building.position.set(
            Math.random() * 50 - 25,
            height / 2, // Ajusta posição vertical
            Math.random() * 50 - 25
        );
        scene.add(building);
    }

    // Criar árvores variadas
    const createTree = () => {
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 12);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);

        foliage.position.y = 2.5; // Colocar acima do tronco
        trunk.add(foliage);

        return trunk;
    };

    for (let i = 0; i < 10; i++) {
        const tree = createTree();
        tree.position.set(
            Math.random() * 50 - 25,
            1.5, // Base do tronco na altura certa
            Math.random() * 50 - 25
        );
        scene.add(tree);
    }

    // Criar postes de luz
    const createLampPost = () => {
        const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 12);
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const post = new THREE.Mesh(postGeometry, postMaterial);

        const lightGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);

        light.position.y = 2.5; // Colocar a luz no topo do poste
        post.add(light);

        return post;
    };

    for (let i = 0; i < 8; i++) {
        const lampPost = createLampPost();
        lampPost.position.set(
            Math.random() * 50 - 25,
            2.5, // Base na altura do chão
            Math.random() * 50 - 25
        );
        scene.add(lampPost);
    }
}

function createCityBounds() {
    const bounds = new THREE.Group();

    // Criar paredes invisíveis (caixas) ao redor da cidade
    const createWall = (width, height, depth, position) => {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true }); // Invisível
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(position.x, position.y, position.z);
        return wall;
    };

    // Limites de colisão (simples caixas de proteção)
    const wallHeight = 10; // Altura das paredes

    // Paredes laterais e fronteira
    bounds.add(createWall(200, wallHeight, 1, { x: 100, y: wallHeight / 2, z: 0 }));
    bounds.add(createWall(200, wallHeight, 1, { x: -100, y: wallHeight / 2, z: 0 }));
    bounds.add(createWall(1, wallHeight, 200, { x: 0, y: wallHeight / 2, z: 100 }));
    bounds.add(createWall(1, wallHeight, 200, { x: 0, y: wallHeight / 2, z: -100 }));

    return bounds;
}


// Limpar cena
function clearScene() {
    scene.children = scene.children.filter(obj =>
        obj === camera || obj === player || obj.isLight
    );
}

// Movimento do jogador
function movePlayer() {
    const speed = 0.07;
    isWalking = false;

    // Verificar se o jogador está a usar as teclas
    if (keys['ArrowUp']) {
        player.position.z -= speed;
        isWalking = true;
    }
    if (keys['ArrowDown']) {
        player.position.z += speed;
        isWalking = true;
    }
    if (keys['ArrowLeft']) {
        player.position.x -= speed;
        isWalking = true;
    }
    if (keys['ArrowRight']) {
        player.position.x += speed;
        isWalking = true;
    }

    // Verificar limites da cidade
    if (currentRoom === "city") {
        const cityBounds = 90; // Defina os limites da cidade
        const maxX = 100;
        const minX = -100;
        const maxZ = 100;
        const minZ = -100;

        // Impedir o movimento do jogador além dos limites da cidade
        if (player.position.x > maxX) player.position.x = maxX;
        if (player.position.x < minX) player.position.x = minX;
        if (player.position.z > maxZ) player.position.z = maxZ;
        if (player.position.z < minZ) player.position.z = minZ;
    }

    if (isWalking) animatePlayer();
    checkCollision();
}

// Animação do jogador
function animatePlayer() {
    const amplitude = 0.3; // Amplitude reduzida
    const walkSpeed = 0.05; // Velocidade ajustada

    player.leftArmPivot.rotation.x = Math.sin(Date.now() * walkSpeed) * amplitude;
    player.rightArmPivot.rotation.x = -Math.sin(Date.now() * walkSpeed) * amplitude;
    player.leftLegPivot.rotation.x = -Math.sin(Date.now() * walkSpeed) * amplitude;
    player.rightLegPivot.rotation.x = Math.sin(Date.now() * walkSpeed) * amplitude;
}

// Check colisão com portas
function checkCollision() {
    const playerBox = new THREE.Box3().setFromObject(player);

    for (const door of doors) { // Certifica de verificar somente as portas
        const doorBox = new THREE.Box3().setFromObject(door);
        if (playerBox.intersectsBox(doorBox)) {
            handleDoorCollision(door);
        }
    }
}


// Lidar com colisão
function handleDoorCollision(door) {
    if (currentRoom === "main" && door.name === "mainDoor") {
        roomHistory.push(currentRoom);
        currentRoom = "roomWithThreeDoors";
        createRoomWithThreeDoors();
        player.position.set(0, 0.9, 4); //Coordenadas
    } else if (currentRoom === "roomWithThreeDoors") {
        if (door.name === "door1") {
            roomHistory.push(currentRoom);
            currentRoom = "city";
            createCity();
            player.position.set(0, 0.9, 4); //Coordenadas
        } else if (door.name === "door2") {
            roomHistory.push(currentRoom);
            currentRoom = "blackRoomWithBed";
            createBlackRoomWithBed();
            player.position.set(0, 0.9, 4); // Coordenadas
        } else if (door.name === "door3") {
            roomHistory.push(currentRoom);
            currentRoom = "roomWithCube";
            createRoomWithCube();
            player.position.set(0, 0.9, 4); // Coordenadas
        }
    } else if (currentRoom === "city") {
        // Não volta automaticamente para outra sala na cidade
        console.log("Colisão com porta na cidade - Nenhuma ação necessária.");
    }
}
// Criar a sala com cama (depression room)
function createBlackRoomWithBed() {
    clearScene(); // Limpa os objetos da sala anterior

    // Piso
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Paredes pretas
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    // Parede de trás
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 20),
        wallMaterial
    );
    backWall.position.set(0, 10, -30);
    scene.add(backWall);

    // Parede da direita
    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 20),
        wallMaterial
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(30, 10, 0);
    scene.add(rightWall);

    // Parede da esquerda
    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 20),
        wallMaterial
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-30, 10, 0);
    scene.add(leftWall);

    // Teto
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        wallMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 20, 0);
    scene.add(ceiling);

    // Cama branca
    const bedMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bedGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const bed = new THREE.Mesh(bedGeometry, bedMaterial);
    bed.position.set(0, 0.25, 0); // Ajustar a posição conforme necessário
    scene.add(bed);
}


function createRoomWithCube() {
       clearScene(); // Limpa os objetos da sala anterior

    // Piso
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Paredes pretas
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    // Parede de trás
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 20),
        wallMaterial
    );
    backWall.position.set(0, 10, -30);
    scene.add(backWall);

    // Parede da direita
    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 20),
        wallMaterial
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(30, 10, 0);
    scene.add(rightWall);

    // Parede da esquerda
    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 20),
        wallMaterial
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-30, 10, 0);
    scene.add(leftWall);

    // Teto
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        wallMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 20, 0);
    scene.add(ceiling);

    // Cubo
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Cubo vermelho
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0.5, 0); // Ajustar a posição conforme necessário
    scene.add(cube);
}

function clearCurrentRoom() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
}


document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === 'P' || e.key === 'p') { // Verifica se a tecla "P" foi pressionada
        goToPreviousRoom();
    }
});

function goToPreviousRoom() {
    if (roomHistory.length > 0) {
        const previousRoom = roomHistory.pop(); // Retira a última sala do histórico
        if (previousRoom === "main") {
            createMainRoom();
        } else if (previousRoom === "roomWithThreeDoors") {
            createRoomWithThreeDoors();
        } else if (previousRoom === "city") {
            createCity();
        }
        currentRoom = previousRoom;
        player.position.set(0, 0.9, 4); // Reseta a posição do jogador
    }
}



// Redimensionamento da janela
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animação
function animate() {
    requestAnimationFrame(animate);
    movePlayer();
    updateCameraPosition(); 
    renderer.render(scene, camera);

}

// Inicializar
init();
