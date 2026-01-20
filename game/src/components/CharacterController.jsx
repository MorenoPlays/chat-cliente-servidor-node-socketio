import { Billboard, CameraControls, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, vec3 } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { CharacterSoldier } from "./CharacterSoldier";

const MOVEMENT_SPEED = 202;
const FIRE_RATE = 380;
export const WEAPON_OFFSET = {
  x: -0.2,
  y: 1.4,
  z: 0.8,
};

export const CharacterController = ({
  state,
  joystick,
  userPlayer,
  onKilled,
  onFire,
  downgradedPerformance,
  socket = null, // Nova prop para socket
  remotePlayer = null, // Nova prop para jogadores remotos
  ...props
}) => {
  const group = useRef();
  const character = useRef();
  const rigidbody = useRef();
  const [animation, setAnimation] = useState("Idle");
  const [weapon, setWeapon] = useState("AK");
  const lastShoot = useRef(0);

  // Estado das teclas pressionadas
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false,
    jump: false,
  });

  // Estado para controlar se o jogador está no chão
  const [isGrounded, setIsGrounded] = useState(true);

  // Estado para controle da câmera com o mouse
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 });
  const mouseMovement = useRef({ x: 0, y: 0 });

  const scene = useThree((state) => state.scene);
  const spawnRandomly = () => {
    const spawns = [];
    for (let i = 0; i < 1000; i++) {
      const spawn = scene.getObjectByName(`spawn_${i}`);
      if (spawn) {
        spawns.push(spawn);
      } else {
        break;
      }
    }
    const spawnPos = spawns[Math.floor(Math.random() * spawns.length)].position;
    rigidbody.current.setTranslation(spawnPos);
  };

  useEffect(() => {
    if (userPlayer) {
      spawnRandomly();
    }
  }, []);

  //  (apenas para o jogador local)
  useEffect(() => {
    if (!userPlayer) return;

    const handleKeyDown = (e) => {
      if (e.key === "w" || e.key === "W") {
        setKeys((k) => ({ ...k, forward: true }));
      }
      if (e.key === "s" || e.key === "S") {
        setKeys((k) => ({ ...k, backward: true }));
      }
      if (e.key === "a" || e.key === "A") {
        setKeys((k) => ({ ...k, left: true }));
      }
      if (e.key === "d" || e.key === "D") {
        setKeys((k) => ({ ...k, right: true }));
      }
      // Shift para atirar
      if (e.key === "j") {
        setKeys((k) => ({ ...k, shift: true }));
      }
      // Espaço para pular
      // if (e.key === " " || e.key === "Spacebar") {
      //   setKeys((k) => ({ ...k, jump: true }));
      // }
    };

    const handleKeyUp = (e) => {
      if (e.key === "w" || e.key === "W") {
        setKeys((k) => ({ ...k, forward: false }));
      }
      if (e.key === "s" || e.key === "S") {
        setKeys((k) => ({ ...k, backward: false }));
      }
      if (e.key === "a" || e.key === "A") {
        setKeys((k) => ({ ...k, left: false }));
      }
      if (e.key === "d" || e.key === "D") {
        setKeys((k) => ({ ...k, right: false }));
      }
      if (e.key === "j") {
        setKeys((k) => ({ ...k, shift: false }));
      }
      // if (e.key === " " || e.key === "Spacebar") {
      //   setKeys((k) => ({ ...k, jump: false }));
      // }
    };

    const handleMouseMove = (e) => {
      // Sensibilidade do mouse aumentada para rotação mais rápida
      const sensitivity = 0.005;

      mouseMovement.current.x -= e.movementX * sensitivity;
      mouseMovement.current.y += e.movementY * sensitivity;

      // Limitar rotação vertical para evitar que a câmera vire de cabeça para baixo
      mouseMovement.current.y = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, mouseMovement.current.y),
      );

      setCameraRotation({
        x: mouseMovement.current.x,
        y: mouseMovement.current.y,
      });
    };

    const handleMouseDown = (e) => {
      // Botão direito do mouse  para atirar
      if (e.button === 0) {
        e.preventDefault();
        setKeys((k) => ({ ...k, shift: true }));
      }
    };

    const handleMouseUp = (e) => {
      // Soltar botão direito do mouse
      if (e.button === 0) {
        e.preventDefault();
        setKeys((k) => ({ ...k, shift: false }));
      }
    };

    const handleContextMenu = (e) => {
      // Prevenir menu de contexto do botão direito
      e.preventDefault();
    };

    const handleClick = () => {
      // Quando clicar, ativar pointer lock (esconder e travar cursor)
      if (!document.pointerLockElement) {
        document.body.requestPointerLock();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClick);
      // Liberar pointer lock ao desmontar
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
  }, [userPlayer]);

  useEffect(() => {
    if (state.state.dead) {
      const audio = new Audio("/audios/dead.mp3");
      audio.volume = 0.5;
      audio.play();
    }
  }, [state.state.dead]);

  useEffect(() => {
    if (state.state.health < 100) {
      const audio = new Audio("/audios/hurt.mp3");
      audio.volume = 0.4;
      audio.play();
    }
  }, [state.state.health]);

  useFrame((_, delta) => {
    // Rotacionar a câmera com A e D
    if (userPlayer) {
      const rotationSpeed = 2; // Velocidade de rotação
      if (keys.left) {
        mouseMovement.current.x += rotationSpeed * delta;
        setCameraRotation({
          x: mouseMovement.current.x,
          y: mouseMovement.current.y,
        });
      }
      if (keys.right) {
        mouseMovement.current.x -= rotationSpeed * delta;
        setCameraRotation({
          x: mouseMovement.current.x,
          y: mouseMovement.current.y,
        });
      }
    }

    // CAMERA FOLLOW - TERCEIRA PESSOA
    if (controls.current) {
      const playerWorldPos = vec3(rigidbody.current.translation());

      // Distâncias da câmera em terceira pessoa
      const cameraDistance = 5; // Distância atrás do personagem
      const cameraHeight = 2.5; // Altura da câmera acima do personagem

      // A câmera segue DIRETAMENTE a rotação do mouse
      const horizontalAngle = cameraRotation.x;
      const verticalAngle = cameraRotation.y;

      // Calcular posição da câmera atrás do personagem com rotação do mouse
      const cameraX =
        playerWorldPos.x -
        Math.sin(horizontalAngle) * cameraDistance * Math.cos(verticalAngle);
      const cameraZ =
        playerWorldPos.z -
        Math.cos(horizontalAngle) * cameraDistance * Math.cos(verticalAngle);
      const cameraY =
        playerWorldPos.y +
        cameraHeight +
        Math.sin(verticalAngle) * cameraDistance;

      // Ponto para onde a câmera olha (centro do personagem)
      const lookAtY = playerWorldPos.y + 1.5;

      controls.current.setLookAt(
        cameraX,
        state.state.dead ? playerWorldPos.y + 12 : cameraY,
        state.state.dead ? playerWorldPos.z + 2 : cameraZ,
        playerWorldPos.x,
        lookAtY,
        playerWorldPos.z,
        true,
      );
    }

    if (state.state.dead) {
      setAnimation("Death");
      return;
    }

    // Verificar se o jogador está no chão
    const velocity = rigidbody.current.linvel();
    const groundCheck = Math.abs(velocity.y) < 0.1;
    setIsGrounded(groundCheck);

    // Pular quando pressionar espaço (apenas se estiver no chão)
    if (userPlayer && keys.jump && isGrounded) {
      rigidbody.current.applyImpulse({ x: 0, y: 8, z: 0 }, true);
    }

    // Calcular movimento do teclado (apenas para o jogador local)
    let moveDirection = null;
    let isMoving = false;

    if (userPlayer) {
      // Fazer o personagem olhar SEMPRE na direção da câmera/mouse
      character.current.rotation.y = cameraRotation.x;

      const { forward, backward } = keys;

      // Apenas W e S movem o personagem (A e D rotacionam)
      if (forward || backward) {
        isMoving = true;
        let z = 0;

        if (forward) z += 1;
        if (backward) z -= 1;

        // Armazenar direção de movimento (apenas para frente/trás)
        moveDirection = { x: 0, z };
      }
    }

    //Atualiza a posição do jogador com base no joystick ou teclado
    const joystickAngle = joystick ? joystick.angle() : null;
    const isJoystickPressed = joystick ? joystick.isJoystickPressed() : false;

    if ((isJoystickPressed && joystickAngle) || isMoving) {
      setAnimation("Run");

      if (isMoving && moveDirection) {
        // Movimento do teclado: usar a rotação do personagem (que já segue a câmera)
        const playerAngle = character.current.rotation.y;
        const moveX =
          moveDirection.z * Math.sin(playerAngle) +
          moveDirection.x * Math.cos(playerAngle);
        const moveZ =
          moveDirection.z * Math.cos(playerAngle) -
          moveDirection.x * Math.sin(playerAngle);

        const impulse = {
          x: moveX * MOVEMENT_SPEED * delta,
          y: 0,
          z: moveZ * MOVEMENT_SPEED * delta,
        };

        rigidbody.current.applyImpulse(impulse, true);
      } else if (isJoystickPressed && joystickAngle) {
        // Movimento do joystick: manter comportamento original
        character.current.rotation.y = joystickAngle;
        const impulse = {
          x: Math.sin(joystickAngle) * MOVEMENT_SPEED * delta,
          y: 0,
          z: Math.cos(joystickAngle) * MOVEMENT_SPEED * delta,
        };
        rigidbody.current.applyImpulse(impulse, true);
      }
    } else {
      setAnimation("Idle");
    }

    // Verificar se o botão de atirar foi pressionado (joystick ou Shift)
    const isShooting =
      (joystick && joystick.isPressed("fire")) || (userPlayer && keys.shift);

    if (isShooting) {
      // O ângulo de disparo SEMPRE segue a direção do mouse/câmera para o jogador local
      const shootAngle = userPlayer
        ? cameraRotation.x
        : character.current.rotation.y;

      // Atirar
      setAnimation(
        (isJoystickPressed && joystickAngle) || isMoving
          ? "Run_Shoot"
          : "Idle_Shoot",
      );
      if (userPlayer) {
        if (Date.now() - lastShoot.current > FIRE_RATE) {
          lastShoot.current = Date.now();
          const newBullet = {
            id: state.id + "-" + +new Date(),
            position: vec3(rigidbody.current.translation()),
            angle: shootAngle, // Disparo segue exatamente a direção do mouse
            player: state.id,
          };
          onFire(newBullet);
        }
      }
    }

    // Sincronização de estado local (single player)
    // Apenas atualiza o estado local do jogador
    state.setState("pos", rigidbody.current.translation());
    state.setState("rot", character.current.rotation.y);

    // Sincronizar posição/rotação pelo socket (para jogador local)
    if (userPlayer && socket?.connected && socket?.emitMove) {
      socket.emitMove({
        position: rigidbody.current.translation(),
        rotation: { x: 0, y: character.current.rotation.y, z: 0 },
        animation,
        velocity: rigidbody.current.linvel(),
      });
    }

    // Atualizar posição de jogadores remotos
    if (remotePlayer && !userPlayer) {
      const pos = remotePlayer.position || { x: 0, y: 0, z: 0 };
      rigidbody.current.setTranslation(pos);
      if (character.current) {
        character.current.rotation.y = remotePlayer.rotation?.y || 0;
      }
      if (remotePlayer.animation) {
        setAnimation(remotePlayer.animation);
      }
    }
  });
  const controls = useRef();
  const directionalLight = useRef();

  useEffect(() => {
    if (character.current && userPlayer) {
      directionalLight.current.target = character.current;
    }
  }, [character.current]);

  return (
    <group {...props} ref={group}>
      <CameraControls ref={controls} />
      <RigidBody
        ref={rigidbody}
        colliders={false}
        linearDamping={12}
        lockRotations
        type="dynamic"
        onIntersectionEnter={({ other }) => {
          if (
            other.rigidBody.userData.type === "bullet" &&
            state.state.health > 0
          ) {
            // Verificar se a bala não é do próprio jogador
            if (other.rigidBody.userData.player === state.id) {
              return; // Não se machuca com a própria bala
            }

            const newHealth =
              state.state.health - other.rigidBody.userData.damage;
            
            // Enviar hit pelo socket (para jogador local)
            if (userPlayer && socket?.connected && socket?.emitHit && socket?.myId) {
              socket.emitHit(state.id, other.rigidBody.userData.damage);
            }

            if (newHealth <= 0) {
              state.setState("deaths", state.state.deaths + 1);
              state.setState("dead", true);
              state.setState("health", 0);
              rigidbody.current.setEnabled(false);
              setTimeout(() => {
                spawnRandomly();
                rigidbody.current.setEnabled(true);
                state.setState("health", 100);
                state.setState("dead", false);
              }, 2000);
              onKilled(state.id, other.rigidBody.userData.player);
            } else {
              state.setState("health", newHealth);
            }
          }
        }}
      >
        <PlayerInfo state={state.state} />
        <group ref={character}>
          <CharacterSoldier
            color={state.state.color || state.state.profile?.color || "#59bf82"}
            animation={animation}
            weapon={weapon}
            model="spaceman"
          />
          <Crosshair
            position={[WEAPON_OFFSET.x, WEAPON_OFFSET.y, WEAPON_OFFSET.z]}
          />
        </group>
        {/* Luz direcional sempre ativa para single player */}
        <directionalLight
          ref={directionalLight}
          position={[25, 18, -25]}
          intensity={0.3}
          castShadow={!downgradedPerformance}
          shadow-camera-near={0}
          shadow-camera-far={100}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} />
      </RigidBody>
    </group>
  );
};

const PlayerInfo = ({ state }) => {
  const health = state.health;
  const name = state.name || state.profile?.name || "Player";
  const color = state.color || state.profile?.color || "#59bf82";

  return (
    <Billboard position-y={3.0}>
      {/* <Text position-y={0.36} fontSize={0.4}>
        {name}11
        <meshBasicMaterial color={color} />
      </Text> */}
      <mesh position-z={-0.1}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>
      <mesh scale-x={health / 100} position-x={-0.5 * (1 - health / 100)}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color="blue" />
      </mesh>
    </Billboard>
  );
};

const Crosshair = (props) => {
  return (
    <group {...props}>
      <mesh position-z={1}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.9} />
      </mesh>
      <mesh position-z={2}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.85} />
      </mesh>
      <mesh position-z={3}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>

      <mesh position-z={4.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.7} transparent />
      </mesh>

      <mesh position-z={6.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.6} transparent />
      </mesh>

      <mesh position-z={9}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};
