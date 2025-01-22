// Importação
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

// Variáveis principais
let scene, camera, renderer, player;
let currentRoom = "main";
let doors = [];
const keys = {};
let isWalking = false; // Controle de animação de caminhada
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

<<<<<<< HEAD
    // Configuração da sala inicial
=======
    // Configuração sala inicial
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
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
    floor.position.y = 0; // Ajuste o nível do chão

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

function updateCameraPosition() {
    camera.position.set(player.position.x, player.position.y + 3, player.position.z + 5); // Segue o jogador
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z); // Mantém o foco no jogador
}


// Criar sala com três portas
function createRoomWithThreeDoors() {
    clearScene();

<<<<<<< HEAD
=======
    // Criação do piso
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

<<<<<<< HEAD
=======
    // Criação da parede traseira
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    backWall.position.set(0, 2.5, -5);
    scene.add(backWall);

<<<<<<< HEAD
=======
    // Adicionar as 3 portas
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
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
<<<<<<< HEAD
    }
=======
    });

    // Adicionar a porta de retorno
    const returnDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    returnDoor.position.set(0, 2, 4.9);
    returnDoor.name = "returnDoor";
    scene.add(returnDoor);
    doors.push(returnDoor);
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
}

// Criar cidade
function createCity() {
    clearScene();

<<<<<<< HEAD
    // Piso da cidade
=======
    // Criação do piso
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200), // Aumente o tamanho do plano
        new THREE.MeshStandardMaterial({ color: 0x505050 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    

<<<<<<< HEAD
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
=======
    // Criação dos prédios
    for (let i = 0; i < 30; i++) {
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(1 + Math.random() * 2, 2 + Math.random() * 10, 1 + Math.random() * 2),
            new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
        );
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
        building.position.set(
            Math.random() * 50 - 25,
            height / 2, // Ajustar posição vertical
            Math.random() * 50 - 25
        );
        scene.add(building);
    }

<<<<<<< HEAD
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

=======
    // Criação dos carros em movimento
    cityCars = [];
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
    for (let i = 0; i < 10; i++) {
        const tree = createTree();
        tree.position.set(
            Math.random() * 50 - 25,
            1.5, // Base do tronco na altura certa
            Math.random() * 50 - 25
        );
        scene.add(tree);
    }

<<<<<<< HEAD
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
=======
    // Adicionar a porta de retorno
    const returnDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    returnDoor.position.set(0, 2, 24.9);
    returnDoor.name = "returnToThreeDoors";
    scene.add(returnDoor);
    doors.push(returnDoor);
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
}


// Limpar cena
function clearScene() {
    scene.children = scene.children.filter(obj =>
        obj === camera || obj === player || obj.isLight
    );
}

<<<<<<< HEAD
// Movimento do jogador
function movePlayer() {
    const speed = 0.07;
    isWalking = false;
=======
// Movimentação do jogador
function movePlayer() {
    const speed = 0.1;
    if (keys['ArrowUp']) player.position.z -= speed; // Em frente
    if (keys['ArrowDown']) player.position.z += speed; // Para trás
    if (keys['ArrowLeft']) player.position.x -= speed; // Para a esquerda
    if (keys['ArrowRight']) player.position.x += speed; // Para a direita
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5

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

    // Limites na cidade
    if (currentRoom === "city") {
        const cityBounds = 90; // Defina os limites da cidade
        player.position.x = Math.max(-cityBounds, Math.min(cityBounds, player.position.x));
        player.position.z = Math.max(-cityBounds, Math.min(cityBounds, player.position.z));
    }

    if (isWalking) animatePlayer();
    checkCollision();
}
<<<<<<< HEAD

// Animação do jogador
function animatePlayer() {
    const amplitude = 0.3; // Amplitude reduzida
    const walkSpeed = 0.05; // Velocidade ajustada

    player.leftArmPivot.rotation.x = Math.sin(Date.now() * walkSpeed) * amplitude;
    player.rightArmPivot.rotation.x = -Math.sin(Date.now() * walkSpeed) * amplitude;
    player.leftLegPivot.rotation.x = -Math.sin(Date.now() * walkSpeed) * amplitude;
    player.rightLegPivot.rotation.x = Math.sin(Date.now() * walkSpeed) * amplitude;
}

// Checar colisão com portas
=======
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
function checkCollision() {
    // Cria uma caixa delimitadora em torno do jogador
    const playerBox = new THREE.Box3().setFromObject(player);

<<<<<<< HEAD
    for (const door of doors) { // Certifique-se de verificar somente as portas
=======
    // Itera por todas as portas na cena
    for (const door of doors) {
        // Cria uma caixa delimitadora para a porta
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
        const doorBox = new THREE.Box3().setFromObject(door);

        // Verifica se as caixas do jogador e da porta estão a colidir
        if (playerBox.intersectsBox(doorBox)) {
            // Se houver colisão, chama a função para tratar a colisão com a porta
            handleDoorCollision(door);
        }
    }
}


// Lidar com colisão
function handleDoorCollision(door) {
    // Verifica se o jogador está na sala principal e colidiu com a mainDoor
    if (currentRoom === "main" && door.name === "mainDoor") {
<<<<<<< HEAD
        roomHistory.push(currentRoom);
=======
        // Troca para a sala com três portas
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
        currentRoom = "roomWithThreeDoors";
        createRoomWithThreeDoors();

        // Move o jogador para uma posição específica na nova sala
        player.position.set(0, 0.9, 4);
<<<<<<< HEAD
    } else if (currentRoom === "roomWithThreeDoors") {
        if (door.name === "door1") {
            roomHistory.push(currentRoom);
            currentRoom = "city";
            createCity();
            player.position.set(0, 0.9, 4);
        } else if (door.name === "door2" || door.name === "door3") {
            roomHistory.push(currentRoom);
            currentRoom = "main";
            createMainRoom();
            player.position.set(0, 0.9, 4);
        }
    } else if (currentRoom === "city") {
        // Não volte automaticamente para outra sala na cidade
        console.log("Colisão com porta na cidade - Nenhuma ação necessária.");
=======

    // Verifica se o jogador está na sala com três portas e colidiu com a returnDoor
    } else if (currentRoom === "roomWithThreeDoors" && door.name === "returnDoor") {
        // Volta para a sala principal 
        currentRoom = "main";
        createMainRoom();

        // Move o jogador para uma posição específica na sala principal
        player.position.set(0, 0.9, -4);

    // Verifica se o jogador está na sala com três portas e colidiu com door1, da Ansiedade que tem a cidade
    } else if (currentRoom === "roomWithThreeDoors" && door.name === "door1") {
        // Troca para a sala "cityRoom"
        currentRoom = "cityRoom";
        createCityRoom();

        // Move o jogador para uma posição específica na nova sala
        player.position.set(0, 0.9, -24);
    
    //!Not working - work in progress
    // Verifica se o jogador está na "cityRoom" e colidiu com "returnToThreeDoors"
    } else if (currentRoom === "cityRoom" && door.name === "returnToThreeDoors") {
        // Volta para a sala com três portas
        currentRoom = "roomWithThreeDoors";
        createRoomWithThreeDoors();

        // Move o jogador para uma posição específica na sala com três portas
        player.position.set(0, 0.9, 4);
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
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
        player.position.set(0, 0.9, 4); // Resetar posição do jogador
    }
}



// Redimensionamento da janela
function onWindowResize() {
    // Atualiza a proporção da câmera com base no tamanho atual da janela
    camera.aspect = window.innerWidth / window.innerHeight;

    // Atualiza a matriz de projeção da câmera para refletir a nova proporção
    camera.updateProjectionMatrix();

    // Ajusta o tamanho do renderizador para se adequar ao tamanho da janela
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animação
function animate() {
    // Solicita que o navegador chame essa função novamente no próximo quadro
    requestAnimationFrame(animate);

    // Atualiza a posição do jogador
    movePlayer();
<<<<<<< HEAD
    updateCameraPosition(); 
=======

    // Atualiza os carros da cidade
    animateCity();

    // Renderiza a cena a partir da perspectiva da câmera
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
    renderer.render(scene, camera);

}

<<<<<<< HEAD
// Inicializar
init();
=======
function animateCity() {
    // Se o jogador estiver na "cityRoom", anima os carros da cidade
    if (currentRoom === "cityRoom") {
        cityCars.forEach(car => {
            //! Not working in the correct way - WORK IN PROGRESS
            // Move os carros de forma aleatória no eixo X e Z
            car.position.x += (Math.random() - 0.5) * 0.2;
            car.position.z += (Math.random() - 0.5) * 0.2;
        });
    }
}

// Inicia o ambiente
init();

// Inicia a animação
animate();
>>>>>>> 68f7b705e6384a4fb51d845f069b445de8f1e8b5
