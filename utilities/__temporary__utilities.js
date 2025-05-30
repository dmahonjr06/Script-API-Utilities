// discord: finnafinest_
// Useful functions for helping with creating scripts in minecraft bedrock.

import { Player, Entity, Vector3, BlockPermutation } from "@minecraft/server";

/**
 * Some of these functions are NOT created by me.
 * I collected these from the Discord Community of Bedrock Addons.
 * Those are resources meaning anyone can use.
 * And I just collected them into one script.
*/
 
/**
 * Gets the platform/device the player is using.
 * @author Vyse
 * @param {Player} player
 * @returns {string}
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * getDevice(player);
 */
function getDevice(player) {
    const { platformType, memoryTier, maxRenderDistance } = player.clientSystemInfo;
    if (maxRenderDistance < 6 || maxRenderDistance > 96 || platformType === null) return "Bot";
    if (platformType === "Desktop") return "Windows";
    if (platformType === "Mobile") {
      return maxRenderDistance > 16 ? "Android" : "iOS";
    }
    if (platformType === "Console") {
      if (memoryTier === 3 && maxRenderDistance === 12) return "Nintendo Switch";
      if (memoryTier === 4 && maxRenderDistance === 36) return "Xbox Series S";
      if (memoryTier === 5 && maxRenderDistance === 36) return "Xbox Series X";
      if (memoryTier === 4) {
        if (player.name.match(/[_-]/g) && maxRenderDistance === 16) return "PS4";
        if (maxRenderDistance === 16) return "Xbox One";
        if (maxRenderDistance === 18) return "PS4 Pro";
        if (maxRenderDistance === 28) return "PS5";
      }
    }
    return "Unknown Device";
}

/**
 * Move an entity to a location using applyKnockback or applyImpulse

 * @author Coddy
 * @param {Entity} entity The entity to move towards a location
 * @param {Vector3} targetPos The location to move the entity to
 * @param {number} speed The speed of moving the entity
 * @returns {{x: number, z: number, strength: number, y: number} | {x: number, y: number, z: number}} Returns `{x, y, z}` if entity is not a player, otherwise returns `{ x, z, strength, y }`
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * const values = moveToLocation(player, { x: 10, y: 200, z: 5 }, 0.5);
 * player.applyKnockback(values.x, values.z, values.strength, values.y);
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const entity = world.getDimension("overworld").getEntities({ excludeTypes: ["minecraft:player"]})[0];
 * const values = moveToLocation(entity, { x: 10, y: 200, z: 5 }, 0.5);
 * entity.applyKnockback(values.x, values.z, values.strength, values.y);
*/
function moveToLocation(entity, targetPos, speed) {
    const pos = entity.location;
    const dx = targetPos.x - pos.x, dy = targetPos.y - pos.y, dz = targetPos.z - pos.z;
    const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (!mag) return null;
    const x = (dx / mag) * speed, y = (dy / mag) * speed, z = (dz / mag) * speed;
    if (entity.typeId === 'minecraft:player') {
      const hMag = Math.sqrt(x * x + z * z);
      return { x: x / hMag, z: z / hMag, strength: hMag, y };
    }
    return { x, y, z };
}

/**
 * Function to return boolean whether the player is underground or not
 * checks if player is in underground
 * @author Serty
 * @param {Player} player The player to test if they are underground
 * @returns {boolean}
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * isUnderground(player);
 */
function isUnderground(player) {
    if (player.dimension.heightRange.min > player.location.y) return true;
    if (player.dimension.heightRange.max < player.location.y) return false;
  
    let block = player.dimension.getTopmostBlock(player.location)
    if (player.location.y >= block.y) return false
    while (!block.isSolid && block.y > player.dimension.heightRange.min) {
      if (player.location.y >= block.y) return false
      block = block.below()
    }
    return true
}

/**
 * @author Eon
 * @param {Player} player The player to test if they are on surface
 * @returns {boolean} 
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * isPlayerOnSurface(player);
 */
function isPlayerOnSurface(player) {
    const location = player.location;
    const blockBelow = player.dimension.getBlock(new Vec3(player.location.x, player.location.y, player.location.z).subtract({ x: 0, y: 1, z: 0 }));
    const blockAbove = player.dimension.getBlock(new Vec3(location.x, location.y, location.z).add({ x: 0, y: 1, z: 0 }));

    const isSolidGround = blockBelow && blockBelow.typeId !== "minecraft:air";
    const hasOpenSky = !blockAbove || blockAbove.typeId === "minecraft:air";

    if (isSolidGround && hasOpenSky) {
        for (let y = Math.ceil(location.y) + 1; y < 320; y++) {
            const block = player.dimension.getBlock(new Vec3(location.x, y, location.z));
            if (block && block.typeId !== "minecraft:air") {
                return false;
            }
        }
        return true;
    }
    return false;
}


/**
 * Get the Cardinal direction of the player
 * @author GST378
 * @author finnafinest_
 * @param {Player} player The player to get the Cardinal direction of
 * @returns {"up"|"down"|"north"|"east"|"south"|"west"}
 */
function getCardinalDirection(player) {
    const yaw = player.getRotation().y;
    const pitch = player.getRotation().x;
    if (pitch > 85) return 'down';
    if (pitch < -85) return 'up';
    if (yaw >= -45 && yaw < 45) return 'north';
    else if (yaw >= 45 && yaw < 135) return 'east';
    else if (yaw >= 135 || yaw < -135) return 'south';
    else return 'west';
};

//======================================
// IsDoing SECTION
//======================================

/**
 * Checks if a player is riding a specific entity type.
 * @param {Player} player Player to check if riding an entity
 * @param {string} entityType Type ID of the entity to check, example: "minecraft:horse"
 * @returns {boolean}
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * const isRidingPlayer = isRidingEntity(player, "minecraft:horse");
 * @throws If player is not a Player.
 * @throws if Player doesn't have a `riding` component
 */
function isRidingEntity(player, entityType) {
    // Validate the player object
    if (!player || typeof player.getComponent !== 'function') {
        throw new Error('Invalid player object provided. Player must have a `getComponent` method.');
    }
    // Safely get the 'riding' component
    const riding = player.getComponent('riding');
    // Validate the riding component and entityRidingOn
    if (!riding) {
        throw new Error('Player does not have a `riding` component.');
    }
    if (!riding.entityRidingOn) {
        throw new Error('Player is not riding any entity.');
    }
    // Compare the typeId of the entity being ridden with the provided entityType
    return riding.entityRidingOn.typeId === entityType;
}


/**
 * Checks if the player has a specified quantity of a certain item in their inventory.
 *
 * @param {Player} player - The player whose inventory is being checked.
 * @param {string} typeId - The typeId of the item to check for.
 * @param {number} required - The required quantity of the item.
 * @returns {boolean} - Returns true if the player has at least the required quantity of the item, false otherwise.
 * @example
 * import { world } from "@minecraft/server";
 * 
 * const player = world.getPlayers()[0];
 * const hasDiamonds = isHavingItemQuantity(player, "minecraft:diamond", 5);
 */
function isHavingItemQuantity(player, typeId, required) {
    const inventoryComponent = player.getComponent("inventory");
    const container = inventoryComponent.container;
    if (container === undefined) {
        return false;
    }
    let total = 0;
    for (let slotId = 0; slotId < container.size; slotId++) {
        const itemStack = container.getItem(slotId);
        if (itemStack === undefined || itemStack.typeId !== typeId) {
            continue;
        }
        total += itemStack.amount;
    }
    return total >= required;
}

/**
 * Checks if player is creative
 * @param {Player} player The player to check
 * @returns {boolean}
 * @example 
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * if (isCreative(player)) {
 *  world.sendMessage(`${player.name} is in creative!`)
 * };
 */
const isCreative = (player) => player.getGameMode() == GameMode.creative

export class Utility {
    /**
 * @param {Player} player
 * @param {string} effect
 * @param {seconds} duration
 * @param {boolean} hasParticles
 * @param {number} level
 * @author Gamer99
 * @description Adds effects to the player
 * @example
    if (item.typeId === "minecraft:stick" ) {
         addEffect(player,"speed",20,true,3)
         
     }
 */
    static addEffect(entityType, effect, duration, hasParticles, level) {// func1
        entityType.addEffect(effect, duration * 20, { showParticles: hasParticles, amplifier: level -= 1 })
        // this is the function i created 
    };
    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} item 
     * @param {String|Number} Slot 
     * @readonly @returns typeId
     * @author Gamer99
     * @description gets the item ID in the slot specified 
    
     * @example 
     *    if (Getitem(player,"hand") === "minecraft:stick") {
            console.warn("yes");
            
        };
     */
    static Getitem(player, Slot) {//func2
        const inv = player.getComponent("inventory").container
        const equipment = player.getComponent("equippable")
        if (typeof Slot === "number") {
            const item = inv.getItem(Slot);
            return item?.typeId
        }

        switch (Slot) {
            case "hand":
                return equipment.getEquipment("Mainhand")?.typeId
            case "offhand":
                return equipment.getEquipment("Offhand")?.typeId
            case "head":
                return equipment.getEquipment("Head")?.typeId
            case "chest":
                return equipment.getEquipment("Chest")?.typeId
            case "legs":
                return equipment.getEquipment("Legs")?.typeId
            case "feet":
                return equipment.getEquipment("Feet")?.typeId
        }
    };
    /**
     * 
     * @param {Player} player 
     * @returns Entity ID
     * @author Gamer99
     * @description Gets The ID of the entity the player is looking at 
     * @example
     *  
        if (item.typeId === "minecraft:stick" && getViewEntity(player) === "minecraft:cow") {
            //code 
            
        }
    })
     */
    static getViewEntity(player) {//func3
        for (const entity of player.getEntitiesFromViewDirection().map(entity => entity.entity)) {
            return entity
        }

    };
    /**
  * 
  * @param {Player} player 
  * @param {number} amount 
  * @author Gamer 99
  * @description Reduces Itemstack amount 
  * @example
  *   if (item.typeId === "minecraft:stick" ) {
         ReduceAmount(player,2)
         
     }
  */
    static ReduceAmount(player, amount) {//func4
        const inv = player.getComponent("inventory").container
        const item = inv.getItem(player.selectedSlotIndex)
        if (item.amount > amount) {
            item.amount -= amount
            inv.setItem(player.selectedSlotIndex, item)
        } else {
            inv.setItem(player.selectedSlotIndex, undefined)
        }

    };
    /**
     * 
     * @param {Player} player 
     * @param {number} amount 
     * @author Gamer99
     * @description Increase Itemstack amount 
     * @example
     *   if (item.typeId === "minecraft:stick" ) {
           IncreaseAmoun(player,2)
            
        }
     */
    static IncreaseAmount(player, amount) {//func5
        const inv = player.getComponent("inventory").container
        const item = inv.getItem(player.selectedSlotIndex)
        if (item.amount < 64) {
            item.amount += amount
            inv.setItem(player.selectedSlotIndex, item)
        }

    };
    /**
 * 
 * @param {Player} player 
 * @param {Vector3} location 
 * @param {boolean} checkForBlocks 
 * @param {string} dimensionId 
 * @author Gamer99
 * @description can be used to teleport across dimensions or if the the dimension id is the same as the current dimension or is blank teleport within that dimension
 * @example 
 *  if (item.typeId === "minecraft:stick" ) {
      DimensionTp(player,{x:0,y:500,z:0},false)
        
    }
 */
    static DimensionTp(player, location, checkForBlocks, dimensionId) {//func6
        if (dimensionId === "end") {
            player.teleport(location, { checkForBlocks: checkForBlocks, dimension: world.getDimension(`minecraft:` + `the_` + `${dimensionId}`) })


        } else if (dimensionId !== undefined) {
            player.teleport(location, { checkForBlocks: checkForBlocks, dimension: world.getDimension(`minecraft:` + `${dimensionId}`) })

        };

        if (dimensionId === undefined) {
            player.teleport(location, { checkForBlocks: checkForBlocks })

        }
    };
    /**
     * 
     * @param {Player} player 
     * @returns block ID
     * @description used to get the ID of the block the player is looking at
     * @author Gamer99 
     * 
     */
    static GetblockInView(player) {//func7
        return player.getBlockFromViewDirection().block
    };
    /**
     * 
     * @param {Player} player 
     * @param {string} Newblock
     * @description Used to set the block the player is looking at to a new block
     * @author Gamer99 
     */
    static SetblockInView(player, Newblock) {
        player.getBlockFromViewDirection().block.setType(`${Newblock}`)

    };
    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} item
     * @param {ItemStack.Lore} Lore 
     * @author Gamer99
     * @description SetLore to an Item
     * @example 
     *  world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
        if (item.typeId === "minecraft:stick" && player.isSneaking) {
            setLore(player, "minecraft:nether_star", "test")
        }
    });
           // if you what to add more than one piece of lore it is done like this
        world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
        if (item.typeId === "minecraft:stick" && player.isSneaking) {
            setLore(player, "minecraft:nether_star", ["lol", "test", "g"])
        }
    });  
     */
    static setLore(player, item, Lore) {
        /**
         * @type {container}
         */
        const container = player.getComponent("inventory").container;
        const equipment = player.getComponent("equippable")
        for (let i = 0; i < container.size; i++) {
            try {
                if (Lore !== undefined && container.getSlot(i).typeId === `${item}` && !container.getSlot(i).getLore().includes(`${Lore}`)) {
                    container.getSlot(i).setLore([`${Lore}`])
                } else if (item !== item.hasTag("is_armor")) {
                    container.getSlot(player.selectedSlotIndex).setLore([`${Lore}`])

                };
            } catch (error) {

            }
        }
        if (Lore !== undefined) {
            try {
                if (item.includes("helmet")) {
                    equipment.getEquipmentSlot("Head").setLore([`${Lore}`])


                } else if (item.includes("chestplate")) {
                    equipment.getEquipmentSlot("Chest").setLore([`${Lore}`])


                } else if (item.includes("leggings")) {
                    equipment.getEquipmentSlot("Legs").setLore([`${Lore}`])


                } else if (item.includes("boots")) {
                    equipment.getEquipmentSlot("Feet").setLore([`${Lore}`])

                };

            } catch (error) {

            }


        } else {
            return
        }

    };
    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} item 
     * @param {ItemLockMode.inventory|ItemLockMode.none|ItemLockMode.slot} mode 
     * @author Gamer99
     * @description Sets the targeted items lock mode 
    
     */
    static setLockMode(player, item, mode) {
        /**
         * @type {container}
         */
        const equipment = player.getComponent("equippable")
        const container = player.getComponent("inventory").container;
        for (let i = 0; i < container.size; i++) {
            try {
                if (container.getSlot(i).typeId === `${item}`) {
                    container.getSlot(i).lockMode = `${mode}`
                } else if (item === container.getSlot(player.selectedSlotIndex).typeId) {
                    container.getSlot(player.selectedSlotIndex).lockMode = `${mode}`

                }
            } catch (error) {

            }
        }
        if (item.includes("helmet")) {
            equipment.getEquipmentSlot("Head").lockMode = `${mode}`


        } else if (item.includes("chestplate")) {
            equipment.getEquipmentSlot("Chest").lockMode = `${mode}`


        } else if (item.includes("leggings")) {
            equipment.getEquipmentSlot("Legs").lockMode = `${mode}`


        } else if (item.includes("boots")) {
            equipment.getEquipmentSlot("Feet").lockMode = `${mode}`

        };


    };
    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} item 
     * @param {number} amount 
     * @author Gamer99
     * @description Add Item to Inventory
     */
    static Additem(player, item, amount) {
        /**
         * @type {container}
         */
        const container = player.getComponent("inventory").container;
        const equipment = player.getComponent("equippable");
        const armors = [
            "minecraft:diamond_helmet", 
            "minecraft:leather_helmet", 
            "minecraft:chainmail_helmet",
            "minecraft:iron_helmet", 
            "minecraft:golden_helmet", 
            "minecraft:netherite_helmet", 
            "minecraft:turtle_helmet",
            "minecraft:iron_chestplate",
            "minecraft:diamond_chestplate",
            "minecraft:chainmail_chestplate",
            "minecraft:netherite_chestplate",
            "minecraft:leather_chestplate",
            "minecraft:golden_chestplate",
            "minecraft:chainmail_leggings",
            "minecraft:golden_leggings",
            "minecraft:netherite_leggings",
            "minecraft:iron_leggings",
            "minecraft:leather_leggings",
            "minecraft:diamond_leggings",
            "minecraft:iron_boots",
            "minecraft:diamond_boots",
            "minecraft:leather_boots",
            "minecraft:netherite_boots",
            "minecraft:chainmail_boots",
            "minecraft:golden_boots"



    ]
        if (!armors.includes(item)) {
            container.addItem(new ItemStack(`${item}`, amount))

        }
        if (item.includes("helmet")) {
            equipment.setEquipment("Head", new ItemStack(`${item}`, 1))


        } else if (item.includes("chestplate")) {
            equipment.setEquipment("Chest", new ItemStack(`${item}`, 1))


        } else if (item.includes("leggings")) {
            equipment.setEquipment("Legs", new ItemStack(`${item}`, 1))


        } else if (item.includes("boots")) {
            equipment.setEquipment("Feet", new ItemStack(`${item}`, 1))

        };

    };
    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} item 
     * @param {["identifier",value]} property 
     * @description Allows for easy setting of  dynamic properties to the Itemstack
     */
    static AddItemDynamicProperty(player, item, property) {
        const container = player.getComponent("inventory").container
        for (let i = 0; i < container.size; i++) {
            try {
                if (container.getSlot(i).typeId === `${item}` && container.getSlot(i).isStackable == false) {
                    container.getSlot(i).setDynamicProperty(`${property[0]}`, `${property[1]}`)
                } else if (item === item.typeId && container.getSlot(i).isStackable == false) {
                    container.getSlot(player.selectedSlotIndex).setDynamicProperty(`${property[0]}`, `${property[1]}`)

                }
            } catch (error) {

            }
        }

    };
    /**
     * 
     * @param {Player} player 
     * @param {string} State 
     * @param {string|number} value 
     * @author Gamer99
     * @description changes the block state of the block the player is looking at
     */
    static ChangeBlockState(player, State, value) {
        const block = player.getBlockFromViewDirection().block
        block.setPermutation(BlockPermutation.resolve(`${block.typeId}`).withState(`${State}`, `${value}`))


    };
    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} item 
     * @param {number} value
     * @author Gamer99
     * @description reduces the durability of the item in hand  
     */
    static reduceDurability(player, item, value) {
        const dur = item.getComponent('durability');
        const eq = player.getComponent('equippable');
        const RemainingDurability = dur.maxDurability - dur.damage
        if (RemainingDurability > 0 && RemainingDurability > value) {
            dur.damage += value
            eq.setEquipment("Mainhand", item)

        } else if (value > RemainingDurability) {
            dur.damage += RemainingDurability
            eq.setEquipment("Mainhand", item)
            eq.setEquipment("Mainhand", undefined)
        }
    }
    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} item 
     * @param {number} value 
     * @author Gamer99
     * @description increases the durability of the item in hand  
     * 
     */
    static increaseDurability(player, item, value) {
        const dur = item.getComponent('durability');
        const eq = player.getComponent('equippable');
        const RemainingDurability = dur.maxDurability - dur.damage
        const fulldurability = dur.maxDurability - RemainingDurability

        if (RemainingDurability !== dur.maxDurability && value < fulldurability) {
            dur.damage -= value
            eq.setEquipment("Mainhand", item)


        }
        if (value > fulldurability) {
            dur.damage -= fulldurability
            eq.setEquipment("Mainhand", item)

        }
    }
    /**
     * 
     * @param {Entity|Array<Entity<string>} entity 
     * @param {Array<string>} loot 
     * @param {number} amount 
     * @author Gamer99
     * @description adds custom loot drops to entity without editing the loot table 
     */
    static LootDrop(entity, loot, amount) {
        world.afterEvents.entityDie.subscribe(({ deadEntity: deadEntity }) => {
            for (let i = 0; i < loot.length; i++) {
                const items = loot[i];
                for (let e = 0; e < entity.length; e++) {
                    const entities = entity[e];
                    if (entities.includes(deadEntity.typeId)) {
                        deadEntity.dimension.spawnItem(new ItemStack(`${items}`, amount), deadEntity.location)

                    }
                };
                if (typeof entity === "string") {
                    deadEntity.dimension.spawnItem(new ItemStack(`${items}`, amount), deadEntity.location)

                }
            }


        })
    }
    /**
     * 
     * @param {Player} player 
     * @param {Entity<string>} entity 
     * @param {Vector3} location 
     * @param {number} amount 
     * @param {string} event 
     * @description Allows you to summon an entity and determine the how may to summon as well as running event on summon
     */
    static Summon(player, entity, location, amount, event) {
        for (let i = 0; i < amount; i++) {
            if (event === undefined) {
                player.dimension.spawnEntity(entity, location)

            } else {
                player.dimension.spawnEntity(entity, location).triggerEvent(`${event}`)

            }


        }
    };
    /**
     * 
     * @param {Player} player 
     * @param {EquipmentSlot} slot 
     * @param {Object} param2 
     * @param {string} param2.EnchantmentName 
     * @param {number} param2.level  
     * @author Gamer99
     * @description allows to add enchantments to armor
     */
    static addEnchantment(player, slot, { EnchantmentName, level }) {
        const equip = player.getComponent("equippable");
        const getSlot = equip.getEquipment(`${slot}`);
        const enchantable = getSlot.getComponent("enchantable");
        enchantable.addEnchantment({ type: new EnchantmentType(`${EnchantmentName}`), level: level })
        equip.setEquipment(`${slot}`, getSlot)
    }
}

//vec3
//......
