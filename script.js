import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

let scene, camera, renderer, player;
const keys = {};
let currentRoom = "main";
let doors = [];
let cityCars = []; // Para animar os carros na cidade

function init() {
    // Criação da cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Configuração da câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // Configuração do renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Configuração das luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Criação do jogador como um modelo simplificado de pessoa
    player = createPlayerModel();
    player.position.set(0, 0.9, 4); // Ajustar posição inicial
    scene.add(player);

    // Configurando sala inicial
    createMainRoom();

    // Event listeners
    document.addEventListener('keydown', (e) => (keys[e.key] = true));
    document.addEventListener('keyup', (e) => (keys[e.key] = false));
    window.addEventListener('resize', onWindowResize);
}

function createPlayerModel() {
    // Grupo para unir as partes do corpo
    const playerGroup = new THREE.Group();

    // Corpo
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 1, 16),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    body.position.y = 0.5; // Levantar o corpo para alinhar os pés
    playerGroup.add(body);

    // Cabeça
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffcc99 })
    );
    head.position.y = 1.2; // Colocar a cabeça acima do corpo
    playerGroup.add(head);

    // Braço esquerdo
    const leftArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.7, 16),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    leftArm.position.set(-0.35, 0.85, 0); // Lado esquerdo do corpo
    leftArm.rotation.z = Math.PI / 6; // Inclinação do braço
    playerGroup.add(leftArm);

    // Braço direito
    const rightArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.7, 16),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    rightArm.position.set(0.35, 0.85, 0); // Lado direito do corpo
    rightArm.rotation.z = -Math.PI / 6; // Inclinação do braço
    playerGroup.add(rightArm);

    // Perna esquerda
    const leftLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.9, 16),
        new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    leftLeg.position.set(-0.15, 0.15, 0); // Lado esquerdo da base do corpo
    playerGroup.add(leftLeg);

    // Perna direita
    const rightLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.9, 16),
        new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    rightLeg.position.set(0.15, 0.15, 0); // Lado direito da base do corpo
    playerGroup.add(rightLeg);

    return playerGroup;
}

function createMainRoom() {
    clearScene();

    // Criação do piso
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Criação da parede traseira
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 5),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    backWall.position.set(0, 2.5, -5);
    scene.add(backWall);

    // Criação daporta para a próxima sala
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    door.position.set(0, 2, -4.9);
    door.name = "mainDoor";
    scene.add(door);
    doors = [door];
}

function createRoomWithThreeDoors() {
    clearScene();

    // Criando piso
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Criando parede traseira
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 5),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    backWall.position.set(0, 2.5, -5);
    scene.add(backWall);

    // Adicionando 3 portas
    doors = [];
    const colors = [0xff0000, 0x00ff00, 0x0000ff];
    const positions = [-3, 0, 3];
    positions.forEach((x, index) => {
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(2, 4, 0.1),
            new THREE.MeshStandardMaterial({ color: colors[index] })
        );
        door.position.set(x, 2, -4.9);
        door.name = `door${index + 1}`;
        scene.add(door);
        doors.push(door);
    });

    // Adicionando porta de retorno
    const returnDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    returnDoor.position.set(0, 2, 4.9);
    returnDoor.name = "returnDoor";
    scene.add(returnDoor);
    doors.push(returnDoor);
}

function createCityRoom() {
    clearScene();

    // Criando piso
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Criando prédios
    for (let i = 0; i < 30; i++) {
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(1 + Math.random() * 2, 2 + Math.random() * 10, 1 + Math.random() * 2),
            new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
        );
        building.position.set(
            (Math.random() - 0.5) * 40,
            building.geometry.parameters.height / 2,
            (Math.random() - 0.5) * 40
        );
        scene.add(building);
    }

    // Criando carros em movimento
    cityCars = [];
    for (let i = 0; i < 10; i++) {
        const car = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.5, 2),
            new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
        );
        car.position.set(
            (Math.random() - 0.5) * 40,
            0.25,
            (Math.random() - 0.5) * 40
        );
        cityCars.push(car);
        scene.add(car);
    }

    // Adicionando porta de retorno
    const returnDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    returnDoor.position.set(0, 2, 24.9);
    returnDoor.name = "returnToThreeDoors";
    scene.add(returnDoor);
    doors.push(returnDoor);
}

function clearScene() {
    scene.children = scene.children.filter(obj =>
        obj === camera || obj === player || obj.isLight
    );
}

function movePlayer() {
    const speed = 0.1;
    if (keys['ArrowUp']) player.position.z -= speed;
    if (keys['ArrowDown']) player.position.z += speed;
    if (keys['ArrowLeft']) player.position.x -= speed;
    if (keys['ArrowRight']) player.position.x += speed;

    checkCollision();
}

function checkCollision() {
    const playerBox = new THREE.Box3().setFromObject(player);

    for (const door of doors) {
        const doorBox = new THREE.Box3().setFromObject(door);
        if (playerBox.intersectsBox(doorBox)) {
            handleDoorCollision(door);
        }
    }
}

function handleDoorCollision(door) {
    if (currentRoom === "main" && door.name === "mainDoor") {
        currentRoom = "roomWithThreeDoors";
        createRoomWithThreeDoors();
        player.position.set(0, 0.9, 4);
    } else if (currentRoom === "roomWithThreeDoors" && door.name === "returnDoor") {
        currentRoom = "main";
        createMainRoom();
        player.position.set(0, 0.9, -4);
    } else if (currentRoom === "roomWithThreeDoors" && door.name === "door1") {
        currentRoom = "cityRoom";
        createCityRoom();
        player.position.set(0, 0.9, -24);
    } else if (currentRoom === "cityRoom" && door.name === "returnToThreeDoors") {
        currentRoom = "roomWithThreeDoors";
        createRoomWithThreeDoors();
        player.position.set(0, 0.9, 4);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    movePlayer();
    animateCity();
    renderer.render(scene, camera);
}

function animateCity() {
    if (currentRoom === "cityRoom") {
        cityCars.forEach(car => {
            car.position.x += (Math.random() - 0.5) * 0.2;
            car.position.z += (Math.random() - 0.5) * 0.2;
        });
    }
}

init();
animate();
