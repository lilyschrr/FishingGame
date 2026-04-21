import C4C from 'c4c-lib';
import {printlnToConsole, printSuccessToConsole, printToConsole, printWarningToConsole} from '../consoleOperations.js';
import { gameLoopSpeed } from '..';
import background from '../assets/bkg.png';
import Phaser from 'phaser';
import hook from '../assets/Hook.png';
import player from '../assets/raccoonAndBoat.png';
import playerCrown from '../assets/rico-boat_crown.png';
import playerFlag from '../assets/rico-boat_flag.png';
import playerCrownFlag from '../assets/rico-boat_crownFlag.png';
import fish from '../assets/testFish.png';
import line from '../assets/line.png';
import coin from '../assets/Coin.png';
import rectangle from '../assets/whiterectangle.png';
// Fish images:
import Minnow from '../assets/Minnow.png';
import Carp from '../assets/Carp.png';
import Bluegill from '../assets/Bluegill.png';
import Trout from '../assets/Trout.png';
import Catfish from '../assets/Catfish.png';
import Bass from '../assets/Bass.png';
import Tuna from '../assets/Tuna.png';
import Salmon from '../assets/Salmon.png';
import RedSnapper from '../assets/RedSnapper.png';
import Shark from '../assets/Shark.png';
import Swordfish from '../assets/Swordfish.png';
import Pufferfish from '../assets/Pufferfish.png';
import Megalodon from '../assets/Megalodon.png';
// Bait images:
import Worms from '../assets/Worm.png';
import Apple from '../assets/Apple.png';
import Pizza from '../assets/Pizza.png';
import Cake from '../assets/Cake.png';


// Fish Data:
const depthZone = [
    {min: 200, max: 300}, // Shallow
    {min: 300, max: 400}, // Mid
    {min: 400, max: 500},  // Deep
    {min: 500, max: 600},  // Very Deep
    {min: 570, max: 610}  // Abyss
    ]

const fishSpecies = [
    {fishName: 'Minnow',     speedRange: [-100, 100], depth: depthZone[0], displayX: 70,  displayY: 15,  price: 100,   weight: 25, bait: "none", requiredItems: {}},
    {fishName: 'Carp',       speedRange: [-100, 100], depth: depthZone[0], displayX: 100, displayY: 50,  price: 100,   weight: 25, bait: "none", requiredItems: {}},
    {fishName: 'Bluegill',   speedRange: [-100, 100], depth: depthZone[0], displayX: 70,  displayY: 40,  price: 100,   weight: 25, bait: "none", requiredItems: {}},
    {fishName: 'Bass',       speedRange: [-120, 120], depth: depthZone[1], displayX: 110, displayY: 40,  price: 2,   weight: 18, bait: "worms", requiredItems: {}},
    {fishName: 'Catfish',    speedRange: [-120, 120], depth: depthZone[1], displayX: 110, displayY: 50,  price: 2,   weight: 18, bait: "apple", requiredItems: {}},
    {fishName: 'Trout',      speedRange: [-120, 120], depth: depthZone[1], displayX: 100, displayY: 30,  price: 2,   weight: 18, bait: "apple", requiredItems: {}},
    {fishName: 'Salmon',     speedRange: [-140, 140], depth: depthZone[2], displayX: 105, displayY: 40,  price: 3,   weight: 12, bait: "worms", requiredItems: {}},
    {fishName: 'Tuna',       speedRange: [-140, 140], depth: depthZone[2], displayX: 110, displayY: 45,  price: 3,   weight: 12, bait: "pizza", requiredItems: ["Flag"]},
    {fishName: 'RedSnapper', speedRange: [-140, 140], depth: depthZone[2], displayX: 90,  displayY: 40,  price: 3,   weight: 12, bait: "cake", requiredItems: ["Flag"]},
    {fishName: 'Shark',      speedRange: [-160, 160], depth: depthZone[3], displayX: 135, displayY: 70,  price: 4,   weight: 7, bait: "pizza", requiredItems: ["Flag"]},
    {fishName: 'Swordfish',  speedRange: [-160, 160], depth: depthZone[3], displayX: 145, displayY: 60,  price: 4,   weight: 7, bait: "apple", requiredItems: ["Flag"]},
    {fishName: 'Pufferfish', speedRange: [-160, 160], depth: depthZone[3], displayX: 65,  displayY: 50,  price: 4,   weight: 7, bait: "pizza", requiredItems: ["Flag"]},
    {fishName: 'Megalodon',  speedRange: [-200, 200], depth: depthZone[4], displayX: 500, displayY: 300, price: 100, weight: 1, bait: "cake", requiredItems: ["Flag", "Crown"]},
];

const megalodonSpecies = fishSpecies[fishSpecies.length - 1];

// Pre-compute total weight once so spawnFish doesn't recalculate every call
const totalFishWeight = fishSpecies.reduce((sum, s) => sum + s.weight, 0);

function getWeightedRandomFish() {
    let roll = Phaser.Math.Between(1, totalFishWeight);
    for (const species of fishSpecies) {
        roll -= species.weight;
        if (roll <= 0) return species;
    }
    return fishSpecies[fishSpecies.length - 1];
}

const functions = [
    {
        name: "print",
        arguments: ["message"],
        description: "Prints out the message passed in to the in-game console."
    },
    {
        name: "addBait",
        arguments: ["baitType"],
        description: "Adds a bait to the hook. Valid options: 'apple', 'pizza', 'cake'. Player must own the bait."
    },
    {
        name: "baitFor",
        arguments: ["fish"],
        description: "Gets the bait that is needed for the given fish."
    },
    {
        name: "cast",
        arguments: ["length"],
        description: "Casts the hook into the water. Optionally specify a length (default 100, max 500)."
    },
    {
        name: "ricoequip",
        arguments: ["equipment"],
        description: "Rico will equip the object passed as a parameter."
    }
];


export default class MainGame extends Phaser.Scene{
    constructor(){
        super('MainGame');

        this.speed = 100;
        this.length = 100;
        this.baitType = '';
        
    }

    preload(){
        this.load.image('background', background);
        this.load.image('hook', hook);
        this.load.image('player', player);

        this.load.image('crown', playerCrown);
        this.load.image('flag', playerFlag);
        this.load.image('crownflag', playerCrownFlag);

        this.load.image('fish', fish);
        this.load.image('line', line);
        this.load.image('coin', coin);
        this.load.image('rectangle', rectangle);
        // Fish Images
        this.load.image('Minnow', Minnow);
        this.load.image('Carp', Carp);
        this.load.image('Bluegill', Bluegill);
        this.load.image('Trout', Trout);
        this.load.image('Catfish', Catfish);
        this.load.image('Bass', Bass);
        this.load.image('Tuna', Tuna);
        this.load.image('Salmon', Salmon);
        this.load.image('RedSnapper', RedSnapper);
        this.load.image('Shark', Shark);
        this.load.image('Swordfish', Swordfish);
        this.load.image('Pufferfish',Pufferfish);
        this.load.image('Megalodon', Megalodon);
        // Bait Images
        this.load.image('worms', Worms);
        this.load.image('apple', Apple);
        this.load.image('pizza', Pizza);
        this.load.image('cake', Cake);

    }

    create(){
    // Add images
        this.add.image(400, 300, 'background').setDisplaySize(800, 600);
        this.player = this.physics.add.sprite(400, 110, 'player').setDisplaySize(180,120);
        this.player.setCollideWorldBounds(true);
        this.player.setTexture(this.registry.get('playerTexture'));

        // Graphics object for the fishing line — created here so it renders behind the hook
        this.lineGraphics = this.add.graphics();

        this.hook = null;

        // Create text displaying coin amount
        this.add.image(90, 40, 'rectangle').setDisplaySize(160, 35);
        this.add.image(30, 40, 'coin').setDisplaySize(30,30);
        this.coinText = this.add.text(50, 30, 'Coins: ' + this.registry.get('coins'), {
            fontSize: '20px',
            fill: '#000'
        });
        this.registry.events.on( // Automatically update text
            'changedata-coins',
            this.onCoinsChanged,
            this
        );
          this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.registry.events.off('changedata-coins', this.onCoinsChanged, this);
            this.physics.world?.off('worldbounds', this.onFishWorldBounds);
            this.megalodonTimer?.remove();
        });

        this.fishGroup = this.physics.add.group();
        for (let i = 0; i < 15; i++) {
            this.spawnFish();
        }

        // Guarantee a Megalodon spawns every 40 seconds regardless of weighted random
        this.megalodonTimer = this.time.addEvent({
            delay: 40000,
            callback: () => this.spawnFish(true, megalodonSpecies),
            loop: true,
        });

        // Flip fish sprite when they bounce off world bounds instead of checking every frame
        this.onFishWorldBounds = (body) => {
            const f = body.gameObject;
            if (f && this.fishGroup.contains(f)) {
                f.setFlipX(body.velocity.x > 0);
            }
        };
        this.physics.world.on('worldbounds', this.onFishWorldBounds);

    // Variables
        this.moveFreely = true;
        this.rightFacing = true;
        this.canCast = true;
        this.baitAdded = false;

    // Default text in console
        printlnToConsole(`Enter your code in the editor! manual() to see various functions!`);

    // Keyboard Input
        this.cursor = this.input.keyboard.createCursorKeys();
    // Define functions used in the C4C written coding area---------------------

    C4C.Interpreter.define('baitFor', (fishName) => {
        const fish = fishSpecies.find(f => f.fishName === fishName)

        if (!fish) {
            printWarningToConsole("Fish doesn't exist!")
            return null
        }

        return fish.bait
    })

    // addBait(baitType)
    C4C.Interpreter.define('addBait', (baitType) => {
    if (!this.canCast) return;
    if (!baitType) {
        printWarningToConsole("No bait type on add bait!");
        return;
    }
    baitType = String(baitType).toLowerCase();

    const baitMap = {
        worms: 'boughtWorms',
        apple: 'boughtApple',
        pizza: 'boughtPizza',
        cake: 'boughtCake'
    };

    const registryKey = baitMap[baitType];
    if (!registryKey) {
        printWarningToConsole("Invalid bait type");
        return;
    }

    const isPurchased = this.registry.get(registryKey);
    if (!isPurchased) {
        printWarningToConsole("Bait not purchased")
        return;
    }

    this.baitAdded = true;
    this.baitChosen = baitType;
    printSuccessToConsole("Bait added: ", baitType);
});

    // rico.equip(equipment)
        C4C.Interpreter.define('ricoequip', (equipment) => {
        if (!this.registry.get("boughtEquip")) {
            printWarningToConsole("You have not bought this method!");
            return;
        }
        if (!equipment) {
            printWarningToConsole("Nothing is specified to equip!");
            return;
        }
        equipment = String(equipment).toLowerCase();

        const equipmentMap = {
            crown: 'boughtCrown',
            flag: 'boughtFlag'
        };
        const registryKey = equipmentMap[equipment];
        if (!registryKey) {
            printWarningToConsole("Invalid equipment type");
            return;
        }
        const isPurchased = this.registry.get(registryKey);
        if (!isPurchased) {
            printWarningToConsole("Equipment not purchased");
            return;
        }

        this.textureVar = equipment;

        if((this.registry.get("crownEquipped") && equipment == "flag" ) || ( this.registry.get("flagEquipped") && equipment == "crown")){

            this.textureVar = "crownflag";
        }

        this.registry.set(equipment+"Equipped", true);
        this.registry.set('playerTexture', this.textureVar);
        this.equippedObject = equipment;
        this.player.setTexture(this.textureVar);

        printSuccessToConsole("Object equipped: ", equipment);
    });

        // ___.unequip(equipment)
        C4C.Interpreter.define('unequip', (equipment) => {
        if (!this.registry.get("boughtEquip")) {
            printWarningToConsole("You have not bought this method!");
            return;
        }
        if (!equipment) {
            printWarningToConsole("Nothing is specified to unequip!");
            return;
        }
        equipment = String(equipment).toLowerCase();

        const equipmentMap = {
            crown: 'crownEquipped',
            flag: 'flagEquipped'
        };
        const registryKey = equipmentMap[equipment];
        if (!registryKey) {
            printWarningToConsole("Invalid equipment type");
            return;
        }
        const isEquipped = this.registry.get(registryKey);
        if (!isEquipped) {
            printWarningToConsole("Equipment not currently equipped");
            return;
        }

        this.equippedObject = null;
        this.registry.set('playerTexture', "player");
        this.textureVar = "player"

        if(this.registry.get("crownEquipped") && equipment == "flag" ){
            this.textureVar = "crown";
            this.equippedObject = "crown";
            this.registry.set('playerTexture', "crown");
        }
        
        if ( this.registry.get("flagEquipped") && equipment == "crown"){
            this.textureVar = "flag";
            this.equippedObject = "flag";
            this.registry.set('playerTexture', "flag");
        }

        this.player.setTexture(this.textureVar);
        this.registry.set(equipment+"Equipped", false);

        printSuccessToConsole("Object unequipped: ", equipment);
    });


    C4C.Interpreter.define('manual', () => {
        printlnToConsole("---------------------");
        for (const fn of functions) {
            const args = fn.arguments.join(", ");
            printlnToConsole(`${fn.name}(${args}) - ${fn.description}`);
        }
        printlnToConsole("---------------------");
    })

    C4C.Interpreter.define('cast', (length) => {
    if (!this.canCast) return;

    if (length === undefined) length = 100;
    else if (length > 500) length = 500;

    this.moveFreely = false;
    this.canCast = false;

    const hookX = this.rightFacing
        ? this.player.x + 90
        : this.player.x - 90;

    const hookY = this.player.y - 60;

    // Create physics hook normally (NOT inside container)
    this.hook = this.physics.add.sprite(hookX, hookY, 'hook')
        .setDisplaySize(15, 30);

    this.hook.body.allowGravity = false;

    // Create bait attached visually by positioning relative to hook
    if (this.baitAdded) {
        this.bait = this.add.sprite(hookX, hookY + 20, this.baitChosen)
            .setDisplaySize(25, 25);

        this.hasBaitOnHook = true;
    } else {
        this.hasBaitOnHook = false;
    }

    this.baitAdded = false;

    // Tween hook downward
    this.tweens.add({
        targets: this.hook,
        y: length + 100,
        duration: 1000,
        ease: 'Power2',
        onUpdate: () => {
            // Make bait follow hook manually
            if (this.bait) {
                this.bait.x = this.hook.x;
                this.bait.y = this.hook.y + 20;
            }
        },
        onComplete: () => {
            this.hookCollider = this.physics.add.overlap(
                this.hook,
                this.fishGroup,
                handleOverlap,
                null,
                this
            );
            this.time.delayedCall(3000, resumeGame, null, this);
        }
    });
});




// Additional Functions ----------------------------------------------------------------

    function handleOverlap(hook, fish) {
        var caughtFish = false
        // Disable collider immediately
        if (this.hookCollider) {
            this.physics.world.removeCollider(this.hookCollider);
            this.hookCollider = null;
        }
            // Consume bait if it exists
        const isBaitMatch = (fish.bait === "none") || (this.hasBaitOnHook && fish.bait === this.baitChosen);

        if (isBaitMatch) {
            let coins = this.registry.get('coins');
            coins += fish.price || 1;
            this.registry.set('coins', coins);
            caughtFish = true;

            if (this.hasBaitOnHook && this.bait) {
                this.bait.destroy();
                this.bait = null;
                this.hasBaitOnHook = false;
            }
        }

        // returns early if the fish isn't caught
        if(!caughtFish){
            return
        }

        // Stop both and attach fish to hook
        fish.body.setVelocity(0);
        fish.setY(hook.y + 10);

        // Show popup
        showCatchPopup.call(this, fish);

        // Set [fishName]Caught = true in registry
        this.registry.set('caught' + fish.fishName, true);

        // Make them rise together
        this.tweens.add({
            targets: [hook, fish],
            y: 110,
            duration: 1500,
            ease: 'Power1',
            onComplete: () => {
                fish.destroy();
                hook.destroy();
                this.hook = null;
                this.spawnFish(true);
            },
        });
    }

    function showCatchPopup(fish) {
        const fishName = fish.fishName || 'a Fish?';

        // Create popup text near top center
        const popup = this.add.text(this.player.x, 100, `Caught a ${fishName}!`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffffff',
            backgroundColor: '#16517bff',
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5);

        // Animate popup fading and moving up
        this.tweens.add({
            targets: popup,
            y: 60,
            alpha: 0,
            duration: 8000,
            ease: 'Power3',

            onComplete: () => popup.destroy(),
        });
}

    function resumeGame() {
        this.tweens.add({
            targets: [this.hook],
            y: 110,
            duration: 1500,
            ease: 'Power1',
            onComplete: () => {
        // Remove overlap collider
        if (this.hookCollider) {

            this.physics.world.removeCollider(this.hookCollider);
            this.hookCollider = null;
        }
        // Destroy bait if still attached
        if (this.bait) {
            this.bait.destroy();
            this.bait = null;
        }
        // Destroy hook
        if (this.hook) {
            this.hook.destroy();
            this.hook = null;
        }
        // Reset variables
        this.hasBaitOnHook = false;
        this.moveFreely = true;
        this.canCast = true;
            },
        });
}

//--------------------------------------------------------------------------------------
    }

    update(){

    // Draw fishing line from rod tip to hook while hook is active
    this.lineGraphics.clear();
    if (this.hook) {
        const rodTipY = this.player.y - 60;
        this.lineGraphics.lineStyle(1, 0xFFFFF0, 1);
        this.lineGraphics.beginPath();
        this.lineGraphics.moveTo(this.hook.x, rodTipY);
        this.lineGraphics.lineTo(this.hook.x + 4, this.hook.y - 13);
        this.lineGraphics.strokePath();
    }

    // Conditional logic for keyboard controls
    const speed = this.cursor.shift.isDown ? 300 : 160;

    if(this.moveFreely) {
        // Boat & Raccoon movement
            if (this.cursor.left.isDown) {
                this.player.setVelocityX(-speed);
                this.player.setFlipX(true);
                this.rightFacing = false;
                this.canCast = false;
                this.bobObject(this.player, 10, 1000, 1)
            } else if (this.cursor.right.isDown) {
                this.player.setVelocityX(speed);
                this.player.setFlipX(false);
                this.rightFacing = true;
                this.canCast = false;
                this.bobObject(this.player, 10, 1000, 1)
            } else {
                this.player.setVelocityX(0);
                this.canCast = true;
            }
    }

        // Collect out-of-bounds fish before destroying to avoid mutating during iterate
        const toRespawn = [];
        this.fishGroup.children.iterate((fish) => {
            if (fish.x < -150 || fish.x > this.scale.width + 150) {
                toRespawn.push(fish);
            }
        });
        toRespawn.forEach(fish => {
            fish.destroy();
            this.spawnFish(true);
        });
    }

    spawnFish(fadeIn = false, species = null) {
        if (!species) species = getWeightedRandomFish();
        const startX = Phaser.Math.Between(100, 700);
        const startY = Phaser.Math.Between(species.depth.min + 10, species.depth.max - 10);
        let velocityX = Phaser.Math.RND.pick([species.speedRange[0], species.speedRange[1]]);

        // Fish near the left edge face right, near the right edge face left
        if (startX < 250)      velocityX =  Math.abs(velocityX);
        else if (startX > 550) velocityX = -Math.abs(velocityX);

        const f = this.physics.add.sprite(startX, startY, species.fishName)
            .setDisplaySize(species.displayX, species.displayY);
        f.fishName = species.fishName;
        f.price = species.price;
        f.bait = species.bait;
        f.body.allowGravity = false;
        f.body.onWorldBounds = true;
        f.setBounce(1, 1);
        f.setCollideWorldBounds(true);
        f.depthRange = species.depth;
        f.setFlipX(velocityX > 0);

        if (fadeIn) {
            f.alpha = 0;
            this.tweens.add({ targets: f, alpha: 1, duration: 1000, ease: 'Power2' });
        }

        this.fishGroup.add(f);
        f.setVelocity(velocityX, 0);
        return f;
    }

    onCoinsChanged(parent, value) {
        this.coinText.setText('Coins: ' + value);
    }

    /**
     * Makes the selected object go up and down for the selected duration and distance
     *
     * @param obj - The obj that will bob
     * @param distance - The max distance to bob in one direction
     * @param duration - The amount of time the object should bob for, measured in milliseconds
     * @param cycles - The amount of times the boat should go up and down
     */
    bobObject(obj, distance, duration, cycles){
        if(obj.bobTween && obj.bobTween.isPlaying()) return;

        obj.bobTween = this.tweens.add({
            targets: obj,
            y: obj.y - distance,
            duration: duration / 2,
            yoyo: true,
            repeat: cycles - 1
        })
    }
}

