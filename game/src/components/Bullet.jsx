import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, vec3, useRapier } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { MeshBasicMaterial, Vector3 } from "three";
import { WEAPON_OFFSET } from "./CharacterController";
import { useSocket } from "../hooks/useSocket";

const BULLET_SPEED = 20;
const MAX_BULLET_LIFETIME = 10000; // 10 segundos para dar mais tempo de debug
const BULLET_RADIUS = 0.15; // Raio de detecção da bala

const bulletMaterial = new MeshBasicMaterial({
  color: "hotpink",
  toneMapped: false,
});

bulletMaterial.color.multiplyScalar(42);

export const Bullet = ({ player, angle, position, onHit, shooterId, emitBulletPosition }) => {
  const rigidbody = useRef();
  const { rapier, world } = useRapier();
  const createdAt = useRef(Date.now());
  const lastPosition = useRef(new Vector3(position.x, position.y, position.z));
  const hasHit = useRef(false);
  const frameCount = useRef(0);
  const lastEmitTime = useRef(0);

  useEffect(() => {
    console.log("🎯 Bala renderizada com RAYCAST:", {
      bulletId: `${shooterId}-${createdAt.current}`,
      shooterId: shooterId || player,
      position,
      angle,
    });
    
    const audio = new Audio("/audios/rifle.mp3");
    audio.play();
    const velocity = {
      x: Math.sin(angle) * BULLET_SPEED,
      y: 0,
      z: Math.cos(angle) * BULLET_SPEED,
    };

    if (rigidbody.current) {
      rigidbody.current.setLinvel(velocity, true);
    }
  }, []);

  // Raycast a cada frame para detectar colisões
  useFrame(() => {
    frameCount.current++;
    
    if (!rigidbody.current || hasHit.current) return;

    // Verificar timeout
    if (Date.now() - createdAt.current > MAX_BULLET_LIFETIME) {
      console.log("⏱️ Bala expirou por timeout após", frameCount.current, "frames");
      hasHit.current = true;
      const finalPos = rigidbody.current.translation();
      if (finalPos) {
        onHit(vec3(finalPos));
      }
      return;
    }

    try {
      const currentPos = rigidbody.current.translation();
      
      // Verificação defensiva: se currentPos for undefined, a bala foi removida
      if (!currentPos || typeof currentPos.x !== "number" || typeof currentPos.y !== "number" || typeof currentPos.z !== "number") {
        console.warn("⚠️ Rigidbody inválido ou removido, pulando raycast");
        return;
      }
      
      // Enviar posição da bala pro servidor para verificar colisão (a cada 100ms)
      const now = Date.now();
      if (emitBulletPosition && now - lastEmitTime.current > 100) {
        console.log("📤 Enviando posição da bala pro servidor:", {
          bulletId: `${shooterId}-${createdAt.current}`,
          bulletPos: { x: currentPos.x.toFixed(2), y: currentPos.y.toFixed(2), z: currentPos.z.toFixed(2) },
          shooterId: shooterId || player,
        });
        
        emitBulletPosition({
          bulletId: `${shooterId}-${createdAt.current}`,
          position: {
            x: currentPos.x,
            y: currentPos.y,
            z: currentPos.z,
          },
          shooterId: shooterId || player,
        });
        lastEmitTime.current = now;
      }
      
      const origin = lastPosition.current;
      
      // Verificar se origin é válido
      if (!origin || typeof origin.x !== "number" || typeof origin.y !== "number" || typeof origin.z !== "number") {
        console.warn("⚠️ Origin inválido, pulando raycast");
        lastPosition.current = new Vector3(currentPos.x, currentPos.y, currentPos.z);
        return;
      }
      
      const direction = new Vector3(
        currentPos.x - origin.x,
        currentPos.y - origin.y,
        currentPos.z - origin.z
      );
      const length = direction.length();

      if (length < 0.01) return; // Sem movimento significativo, pular raycast

      direction.normalize();
      
      // Verificar se direção é válida (não NaN ou Infinity)
      if (!isFinite(direction.x) || !isFinite(direction.y) || !isFinite(direction.z)) {
        console.warn("⚠️ Direção inválida (NaN/Infinity), pulando raycast");
        return;
      }
      
      // Validação final de origin antes do raycast
      if (!Number.isFinite(origin.x) || !Number.isFinite(origin.y) || !Number.isFinite(origin.z)) {
        console.warn("⚠️ Origin com valores inválidos após validação, resetando", origin);
        lastPosition.current = new Vector3(currentPos.x, currentPos.y, currentPos.z);
        return;
      }

      // Raycast do frame anterior até agora
      // Garantir que todos os valores são válidos e finitos
      const rayOrigin = {
        x: Number.isFinite(origin.x) ? origin.x : 0,
        y: Number.isFinite(origin.y) ? origin.y : 0,
        z: Number.isFinite(origin.z) ? origin.z : 0,
      };
      
      const rayDirection = {
        x: Number.isFinite(direction.x) ? direction.x : 1,
        y: Number.isFinite(direction.y) ? direction.y : 0,
        z: Number.isFinite(direction.z) ? direction.z : 0,
      };
      
      const rayMaxDist = Number.isFinite(length + 0.5) ? Math.max(0.1, length + 0.5) : 1;
      
      // Validação final antes do castRay
      if (!rayOrigin || !rayDirection || typeof rayOrigin.x !== "number" || typeof rayDirection.x !== "number") {
        console.warn("⚠️ Parâmetros raycast inválidos, abortando", { rayOrigin, rayDirection });
        return;
      }

      try {
        const hit = world.castRay(
          rayOrigin,
          rayDirection,
          rayMaxDist,
          true, // Solidez dos colliders
          null // Máscara de grupos
        );

        if (!hit) {
          console.log("🔍 Raycast sem hit. Origem:", { x: rayOrigin.x.toFixed(2), y: rayOrigin.y.toFixed(2), z: rayOrigin.z.toFixed(2) }, 
                      "Direção:", { x: rayDirection.x.toFixed(2), y: rayDirection.y.toFixed(2), z: rayDirection.z.toFixed(2) });
        } else {
          console.log("✅ Raycast HIT! toi:", hit.toi.toFixed(3), "frame:", frameCount.current);
        }

        if (hit && hit.toi > 0) {
          // Verificar se não é a própria bala
          const hitCollider = hit.collider;
          const hitRigidBody = hitCollider?.parent();
          
          if (!hitRigidBody) {
            console.warn("⚠️ RigidBody não encontrado no hit");
            return;
          }
          
          const hitUserData = hitRigidBody.userData;

          console.log("🎯 Raycast HIT:", {
            targetType: hitUserData?.type,
            targetId: hitUserData?.id,
            targetName: hitUserData?.name,
            shooterId: shooterId || player,
            toi: hit.toi,
            userData: hitUserData,
          });

          // Ignorar balas
          if (hitUserData?.type === "bullet") {
            console.log("⏭️ Ignorando hit com bala, continuando raycast");
            return; // Continuar raycast
          }

          // Ignorar o próprio jogador que disparou
          if (hitUserData?.type === "player" && hitUserData?.id === (shooterId || player)) {
            console.log("⏭️ Ignorando hit com próprio jogador, continuando raycast");
            return; // Continuar raycast
          }

          // HIT DETECTADO EM UM ALVO VÁLIDO!
          if (hitUserData?.type === "player") {
            console.log("💥 RAYCAST ACERTOU JOGADOR:", {
              victimId: hitUserData.id,
              victimName: hitUserData.name,
              shooterId: shooterId || player,
              position: currentPos,
              frameCount: frameCount.current,
            });
          } else {
            console.log("⚠️ Hit em algo que não é player:", {
              type: hitUserData?.type,
              userData: hitUserData,
            });
          }

          hasHit.current = true;
          onHit(currentPos);
        } else if (hit) {
          console.log("⚠️ Hit detectado mas toi <= 0:", hit.toi);
        }

        // Atualizar última posição com validação
        if (currentPos && typeof currentPos.x === "number" && typeof currentPos.y === "number" && typeof currentPos.z === "number") {
          lastPosition.current = new Vector3(currentPos.x, currentPos.y, currentPos.z);
        }
      } catch (innerError) {
        console.warn("⚠️ Erro interno no raycast:", innerError);
      }
    } catch (error) {
      console.warn("⚠️ Erro no raycast:", error);
    }
  });

  return (
    <group position={[position.x, position.y, position.z]} rotation-y={angle}>
      <group
        position-x={WEAPON_OFFSET.x}
        position-y={WEAPON_OFFSET.y}
        position-z={WEAPON_OFFSET.z}
      >
        <RigidBody
          ref={rigidbody}
          gravityScale={0}
          sensor
          userData={{
            type: "bullet",
            player: shooterId || player,
            damage: 10,
          }}
        >
          <mesh position-z={0.25} material={bulletMaterial} castShadow>
            <boxGeometry args={[0.05, 0.05, 0.5]} />
          </mesh>
        </RigidBody>
      </group>
    </group>
  );
};
