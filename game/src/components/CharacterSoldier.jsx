import { useAnimations, useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import { Color, LoopOnce, MeshStandardMaterial } from "three";
import { SkeletonUtils } from "three-stdlib";
const WEAPONS = [
  "GrenadeLauncher",
  "AK",
  "Knife_1",
  "Knife_2",
  "Pistol",
  "Revolver",
  "Revolver_Small",
  "RocketLauncher",
  "ShortCannon",
  "SMG",
  "Shotgun",
  "Shovel",
  "Sniper",
  "Sniper_2",
];

export function CharacterSoldier({
  color = "black",
  animation = "Idle",
  weapon = "AK",
  model = "Character_Soldier",
  ...props
}) {
  const group = useRef();
  const { scene, materials, animations } = useGLTF(`/models/${model}.gltf`);
  // Skinned meshes cannot be re-used in threejs without cloning them
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  // useGraph creates two flat object collections for nodes and materials
  const { nodes } = useGraph(clone);
  const { actions } = useAnimations(animations, group);
  if (actions["Death"]) {
    actions["Death"].loop = LoopOnce;
    actions["Death"].clampWhenFinished = true;
  }

  useEffect(() => {
    actions[animation].reset().fadeIn(0.2).play();
    return () => actions[animation]?.fadeOut(0.2);
  }, [animation]);

  const playerColorMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(color),
      }),
    [color]
  );
  useEffect(() => {
    // HIDING NON-SELECTED WEAPONS
    WEAPONS.forEach((wp) => {
      const isCurrentWeapon = wp === weapon;
      if (nodes[wp]) {
        nodes[wp].visible = isCurrentWeapon;
      }
    });

    // ASSIGNING CHARACTER COLOR
    if (nodes.Body) {
      nodes.Body.traverse((child) => {
        if (child.isMesh && child.material.name === "Character_Main") {
          child.material = playerColorMaterial;
        }
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
    if (nodes.Head) {
      nodes.Head.traverse((child) => {
        if (child.isMesh && child.material.name === "Character_Main") {
          child.material = playerColorMaterial;
        }
      });
    }
    clone.traverse((child) => {
      if (child.isMesh && child.material.name === "Character_Main") {
        child.material = playerColorMaterial;
      }
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
  }, [nodes, clone]);

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={clone} />
    </group>
  );
}

// useGLTF.preload("/models/Character_Soldier.gltf");
// useGLTF.preload("/models/Character_Hazmat.gltf");
