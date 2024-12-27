import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

let scene, camera, renderer, player;
const keys = {};
let currentRoom = "main";
let doors = [];

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

    // Adicionando luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Criando o jogador
    player = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    player.position.set(0, 0.2, 4);
    scene.add(player);

    // Configurando sala inicial
    createMainRoom();

    // Event listeners
    document.addEventListener('keydown', (e) => (keys[e.key] = true));
    document.addEventListener('keyup', (e) => (keys[e.key] = false));
    window.addEventListener('resize', onWindowResize);
}

function createMainRoom() {
    // Limpando objetos da sala anterior
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

    // Criando porta para a próxima sala
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
    // Limpando objetos da sala anterior
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

function clearScene() {
    // Mantém apenas a câmera, o jogador e as luzes
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
        player.position.set(0, 0.2, 4);
    } else if (currentRoom === "roomWithThreeDoors" && door.name === "returnDoor") {
        currentRoom = "main";
        createMainRoom();
        player.position.set(0, 0.2, -4);
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
    renderer.render(scene, camera);
}

// Inicializa o jogo
init();
animate();
