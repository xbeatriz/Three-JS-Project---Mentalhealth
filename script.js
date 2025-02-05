// Importação
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js";

// Variáveis principais
let scene, camera, renderer, player;
let currentRoom = "main";
let doors = [];
const keys = {};
let isWalking = false; // Controlo da animação da caminhada
let roomHistory = []; // Histórico de salas

//------------------------ Configuração inicial da cena ------------------------
function init() {
  // Cena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Câmara
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
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

  // Criação do jogador
  player = createPlayerModel();
  player.position.set(0, 2.9, 4); // Levantar o jogador acima do chão
  scene.add(player);

  // Configuração da sala inicial
  createMainRoom();

  // Eventos
  document.addEventListener("keydown", (e) => (keys[e.key] = true));
  document.addEventListener("keyup", (e) => (keys[e.key] = false));
  window.addEventListener("resize", onWindowResize);

  animate();
}

// Atualizar a posição da câmara para seguir o jogador
function updateCameraPosition() {
    camera.position.set(
      player.position.x,
      player.position.y + 3,
      player.position.z + 5
    ); 
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z); // Mantém o foco no jogador
  }


//
//
//------------ Criação do modelo do jogador ------------------
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

  // Ajustar a escala do boneco
  body.scale.set(0.5, 0.5, 0.5); // Reduz o tamanho para 50%

  // Adicionar bounding box
  const boundingBox = new THREE.Box3().setFromObject(body);
  body.boundingBox = boundingBox;

  return body;
}



// 
//------------------- Criação das salas -------------------
//

// Criar sala principal
function createMainRoom() {
  clearScene();

  const textureLoader = new THREE.TextureLoader();

    // Criar o chão
    const floorTexture = textureLoader.load("textures/floor1.jpg");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(20,20);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ map: floorTexture, side: THREE.DoubleSide }) // Ambos os lados visíveis
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  floor.position.y = 0; // Ajusta o nível do chão

  const backWallTexture = textureLoader.load("textures/wall2.jpg");
  backWallTexture.wrapS = THREE.RepeatWrapping;
  backWallTexture.wrapT = THREE.RepeatWrapping;
  backWallTexture.repeat.set(7,7);

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ map: backWallTexture })
  );
  backWall.position.set(0, 2.5, -5);
  scene.add(backWall);

  const doorTexture = textureLoader.load("textures/door1.jpg");
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(2, 4, 0.1),
    new THREE.MeshStandardMaterial({ map: doorTexture })
  );
  door.position.set(0, 2, -4.9);
  door.name = "mainDoor";
  scene.add(door);
  doors = [door];
}



// Criar a sala com três portas
function createRoomWithThreeDoors() {
  clearScene();

  const textureLoader = new THREE.TextureLoader();

  // Criar o chão
  const floorTexture = textureLoader.load("textures/floor1.jpg");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(20,20);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ map: floorTexture })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  floor.position.y = 0;

  const backWallTexture = textureLoader.load("textures/wall1.jpg");
  backWallTexture.wrapS = THREE.RepeatWrapping;
    backWallTexture.wrapT = THREE.RepeatWrapping;
    backWallTexture.repeat.set(7,7);
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ map: backWallTexture })
  );
  backWall.position.set(0, 2.5, -5);
  scene.add(backWall);

  const door1Texture = textureLoader.load("textures/door2.jpg");
  const door2Texture = textureLoader.load("textures/door3.jpg");
  const door3Texture = textureLoader.load("textures/door4.jpg");
  doors = [];
  const doorTextures = [door1Texture, door2Texture, door3Texture];
  const doorPositions = [-3, 0, 3];

  for (let i = 0; i < 3; i++) {
    const material = new THREE.MeshStandardMaterial({ map: doorTextures[i] });

    const door = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 0.1), material);
    door.position.set(doorPositions[i], 2, -4.9);
    door.name = `door${i + 1}`;
    scene.add(door);
    doors.push(door);
  }
}


//
//---------------------- AS TRÊS SALAS ----------------------
//

// Criar cidade - SALA 1
function createCity() {
  clearScene();

  const textureLoader = new THREE.TextureLoader();

  // Chão da cidade
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200), //Tamanho do plano
    new THREE.MeshStandardMaterial({ color: 0x505050 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Adicionar o céu
  const skyTexture = textureLoader.load("textures/sky2.jpg");
  /* skyTexture.wrapS = THREE.RepeatWrapping;
  skyTexture.wrapT = THREE.RepeatWrapping;
  skyTexture.repeat.set(10, 10); */
  const sky = new THREE.Mesh( 
    new THREE.SphereGeometry(100, 32, 32),
    new THREE.MeshStandardMaterial({ map: skyTexture, side: THREE.BackSide }) // Azul claro (sky blue)
  );
  scene.add(sky);

  // Criar limites da cidade
  const cityBounds = createCityBounds();
  scene.add(cityBounds);

  // Criar edifícios
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

  // Criar árvores 
  const createTree = () => {
    const texLoader = new THREE.TextureLoader();
    const woodTexture = texLoader.load("textures/wood.jpg");
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 12);
    const trunkMaterial = new THREE.MeshStandardMaterial({ map: woodTexture });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

    const foliageTexture = texLoader.load("textures/folhas.png");
    const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({
      map: foliageTexture,
    });
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
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffffaa,
    });
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

// Criar segundo quarto
function createBlackRoomWithBed() {
    clearScene();
  
    const objects = [];
  
    const checkCollision = (obj, buffer = 1) => {
      const objBox = new THREE.Box3().setFromObject(obj);
      for (let i = 0; i < objects.length; i++) {
        const other = objects[i];
        if (obj !== other) {
          const otherBox = new THREE.Box3().setFromObject(other);
          if (objBox.intersectsBox(otherBox)) {
            return true;
          }
        }
      }
      return false;
    };
  
    const placeObject = (obj, buffer = 1) => {
      let attempts = 0;
      do {
        obj.position.set(Math.random() * 50 - 25, obj.position.y, Math.random() * 50 - 25);
        attempts++;
      } while (checkCollision(obj, buffer) && attempts < 100);
      objects.push(obj);
      scene.add(obj);
    };
  
    // Chão da cidade
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200), //Tamanho do plano
      new THREE.MeshStandardMaterial({ color: 0x505050 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
  
    // Adicionar o céu
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(100, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x87ceeb, side: THREE.BackSide }) 
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
      building.position.set(0, height / 2, 0); // Ajusta posição vertical
      placeObject(building, 5);
    }
  
    // Criar árvores 
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
      tree.position.set(0, 1.5, 0); // Base do tronco na altura certa
      placeObject(tree, 3);
    }
  
    // Criar postes de luz
    const createLampPost = () => {
      const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 12);
      const postMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
      const post = new THREE.Mesh(postGeometry, postMaterial);
  
      const lightGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const lightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffaa,
        emissive: 0xffffaa,
      });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
  
      light.position.y = 2.5; // Colocar a luz no topo do poste
      post.add(light);
  
      return post;
    };
  
    for (let i = 0; i < 8; i++) {
      const lampPost = createLampPost();
      lampPost.position.set(0, 2.5, 0); // Base na altura do chão
      placeObject(lampPost, 3);
    }
  
    // Criar um carro
    const createCar = () => {
      const carBodyGeometry = new THREE.BoxGeometry(4, 1.5, 2);
      const carBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const carBody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
  
      const carWheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 12);
      const carWheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  
      const createWheel = () => {
        const wheel = new THREE.Mesh(carWheelGeometry, carWheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        return wheel;
      };
  
      const wheelPositions = [
        [-1.5, -0.75, 1],
        [1.5, -0.75, 1],
        [-1.5, -0.75, -1],
        [1.5, -0.75, -1],
      ];
  
      wheelPositions.forEach(position => {
        const wheel = createWheel();
        wheel.position.set(...position);
        carBody.add(wheel);
      });
  
      return carBody;
    };
  
    const cars = [];
    for (let i = 0; i < 5; i++) {
      const car = createCar();
      car.position.set(0, 0.75, 0);
      car.velocity = new THREE.Vector3(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.1 - 0.05);
      placeObject(car, 4);
      cars.push(car);
    }
  
    // Criar um animal
    const createAnimal = () => {
      const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 2);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  
      const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const headMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.set(0, 0.25, 1.25);
      body.add(head);
  
      const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12);
      const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  
      const createLeg = () => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.rotation.z = Math.PI / 2;
        return leg;
      };
  
      const legPositions = [
        [-0.4, -0.25, 0.75],
        [0.4, -0.25, 0.75],
        [-0.4, -0.25, -0.75],
        [0.4, -0.25, -0.75],
      ];
  
      legPositions.forEach(position => {
        const leg = createLeg();
        leg.position.set(...position);
        body.add(leg);
      });
  
      return body;
    };
  
    const animals = [];
    for (let i = 0; i < 5; i++) {
      const animal = createAnimal();
      animal.position.set(0, 0.25, 0);
      animal.velocity = new THREE.Vector3(Math.random() * 0.05 - 0.025, 0, Math.random() * 0.05 - 0.025);
      placeObject(animal, 2);
      animals.push(animal);
    }
  
    // Função de animação para mover os carros e animais
    const animate = () => {
      requestAnimationFrame(animate);
  
      cars.forEach(car => {
        car.position.add(car.velocity);
        if (checkCollision(car, 4)) {
          car.position.sub(car.velocity);
          car.velocity.negate();
        }
      });
  
      animals.forEach(animal => {
        animal.position.add(animal.velocity);
        if (checkCollision(animal, 2)) {
          animal.position.sub(animal.velocity);
          animal.velocity.negate();
        }
      });
  
      renderer.render(scene, camera);
    };
  
    animate();
  }


//Criar terceira sala 
function createRoomWithCube() {
    clearScene();
  // Chão
  const textureLoader = new THREE.TextureLoader();

  const floorTexture = textureLoader.load("textures/relva.jpg");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(20,20);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200), 
    new THREE.MeshStandardMaterial({ map: floorTexture })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Adicionar o céu
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(100, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x87ceeb, side: THREE.BackSide }) 
  );
  scene.add(sky);

  // Adicionar luz ambiente
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Cor branca, intensidade 0.5
  scene.add(ambientLight);

  // Adicionar luz direcional
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Cor branca, intensidade 1
  directionalLight.position.set(50, 50, 50); // Posição da luz
  scene.add(directionalLight);

  // Criar limites da cidade
  const cityBounds = createCityBounds();
  scene.add(cityBounds);

  // Criar edifícios 
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

  // Criar árvores 
  const createPineTree = () => {
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 12);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });

    const foliageGeometry1 = new THREE.ConeGeometry(1.5, 2, 8);
    const foliage1 = new THREE.Mesh(foliageGeometry1, foliageMaterial);
    foliage1.position.y = 2.5; // Colocar acima do tronco
    trunk.add(foliage1);

    const foliageGeometry2 = new THREE.ConeGeometry(1.2, 2, 8);
    const foliage2 = new THREE.Mesh(foliageGeometry2, foliageMaterial);
    foliage2.position.y = 4; // Colocar acima da primeira camada de folhagem
    trunk.add(foliage2);

    const foliageGeometry3 = new THREE.ConeGeometry(0.9, 2, 8);
    const foliage3 = new THREE.Mesh(foliageGeometry3, foliageMaterial);
    foliage3.position.y = 5.5; // Colocar acima da segunda camada de folhagem
    trunk.add(foliage3);

    return trunk;
};

for (let i = 0; i < 10; i++) {
    const tree = createPineTree();
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
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffffaa,
    });
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

  // Criar aviões
  const createPlane = () => {
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    const wingGeometry = new THREE.BoxGeometry(1, 0.1, 3);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.position.y = 0.2;
    body.add(wing);

    const tailGeometry = new THREE.BoxGeometry(0.5, 0.1, 1);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.2, -1);
    body.add(tail);

    return body;
  };

  const planes = [];
  for (let i = 0; i < 15; i++) { // número de aviões
    const plane = createPlane();
    plane.position.set(
      Math.random() * 50 - 25,
      Math.random() * 20 + 10, // Altura
      Math.random() * 50 - 25
    );
    plane.velocity = new THREE.Vector3(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.1 - 0.05);
    scene.add(plane);
    planes.push(plane);
  }

  // Função de animação para os aviões
  const animatePlanes = () => {
    requestAnimationFrame(animatePlanes);

    planes.forEach(plane => {
      plane.position.add(plane.velocity);
      if (plane.position.x > 50 || plane.position.x < -50) plane.velocity.x *= -1;
      if (plane.position.z > 50 || plane.position.z < -50) plane.velocity.z *= -1;
    });

    renderer.render(scene, camera);
  };

  animatePlanes();

}





// Criar limites da cidade
function createCityBounds() {
  const bounds = new THREE.Group();

    // Criar paredes invisíveis (caixas) ao redor da cidade
  const createWall = (width, height, depth, position) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0,
      transparent: true,
    }); // Invisível
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(position.x, position.y, position.z);
    return wall;
  };

  // Limites de colisão 
  const wallHeight = 10; // Altura das paredes

  // Paredes laterais e fronteira
  bounds.add(
    createWall(200, wallHeight, 1, { x: 100, y: wallHeight / 2, z: 0 })
  );
  bounds.add(
    createWall(200, wallHeight, 1, { x: -100, y: wallHeight / 2, z: 0 })
  );
  bounds.add(
    createWall(1, wallHeight, 200, { x: 0, y: wallHeight / 2, z: 100 })
  );
  bounds.add(
    createWall(1, wallHeight, 200, { x: 0, y: wallHeight / 2, z: -100 })
  );

  return bounds;
}

// Limpar cena
function clearScene() {
  scene.children = scene.children.filter(
    (obj) => obj === camera || obj === player || obj.isLight
  );
}

// Movimento do jogador
function movePlayer() {
    player.velocityY = 0;
    const speed = 0.07;
    const jumpHeight = 2.0; 
    const gravity = 0.05; 
    const groundLevel = 2.5; 
    isWalking = false;
  
    // Verificar se o jogador está a usar as teclas
    if (keys["ArrowUp"]) {
      player.position.z -= speed;
      isWalking = true;
    }
    if (keys["ArrowDown"]) {
      player.position.z += speed;
      isWalking = true;
    }
    if (keys["ArrowLeft"]) {
      player.position.x -= speed;
      isWalking = true;
    }
    if (keys["ArrowRight"]) {
      player.position.x += speed;
      isWalking = true;
    }
  
    // Verificar se o jogador está a usar a tecla espaço para saltar
    if (keys[" "]) {
      if (player.position.y === groundLevel) { // Verificar se o jogador está no chão
        player.velocityY = jumpHeight; // Adicionar velocidade de salto
      }
    }
  
    // Aplicar gravidade
    if (player.position.y > groundLevel || player.velocityY > 0) {
      player.velocityY -= gravity; // Aplicar gravidade à velocidade
      player.position.y += player.velocityY; // Atualizar posição do jogador
  
      if (player.position.y < groundLevel) {
        player.position.y = groundLevel; // Garantir que o jogador não passa do chão
        player.velocityY = 0; // Normalizar velocidade ao tocar o chão
      }
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
  player.rightArmPivot.rotation.x =
    -Math.sin(Date.now() * walkSpeed) * amplitude;
  player.leftLegPivot.rotation.x =
    -Math.sin(Date.now() * walkSpeed) * amplitude;
  player.rightLegPivot.rotation.x =
    Math.sin(Date.now() * walkSpeed) * amplitude;
}


//------------ Colisão com portas ----------------
// Check colisão com portas
function checkCollision() {
  const playerBox = new THREE.Box3().setFromObject(player);

  for (const door of doors) {
    // Certifica de verificar somente as portas
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
    player.position.set(0, 2.5, 4); //Coordenadas
  } else if (currentRoom === "roomWithThreeDoors") {
    if (door.name === "door1") {
      roomHistory.push(currentRoom);
      currentRoom = "city";
      createCity();
      player.position.set(0, 2.5, 4); //Coordenadas
    } else if (door.name === "door2") {
      roomHistory.push(currentRoom);
      currentRoom = "blackRoomWithBed";
      createBlackRoomWithBed();
      player.position.set(0, 2.5, 4); // Coordenadas
    } else if (door.name === "door3") {
      roomHistory.push(currentRoom);
      currentRoom = "roomWithCube";
      createRoomWithCube();
      player.position.set(0, 2.5, 4); // Coordenadas
    }
  } else if (currentRoom === "city") {
    // Não volta automaticamente para outra sala na cidade
    console.log("Colisão com porta na cidade - Nenhuma ação necessária.");
  }
}



//VOLTAR PARA O QUARTO ANTERIOR COM TECLA"p"
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === "P" || e.key === "p") {
    // Verifica se a tecla "P" foi pressionada
    goToPreviousRoom();
  }
});



//Função para ir para o quarto anterior
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
    player.position.set(0, 2.5, 4); // Restaura a posição do jogador
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
