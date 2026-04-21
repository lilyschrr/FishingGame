import C4C from 'c4c-lib';
import {printErrorToConsole, printlnToConsole, printToConsole, printWarningToConsole} from '../consoleOperations.js';
import marketBkg from '../assets/Marketbkg.PNG';
import item1 from '../assets/Market1-worms.PNG';
import item2 from '../assets/Market2-apple.png';
import item3 from '../assets/Market3-equip&unequip.png';
import item4 from '../assets/Market4-flag.png';
import item5 from '../assets/Market5-pizza.png';
import item6 from '../assets/Market6-baitFor.png';
import item7 from '../assets/Market7-cake.png';
import item8 from '../assets/Market8-crown.png';

const marketFunctions = [
    { name: "print", arguments: ["message"], description: "Prints a message to the in-game console." },
    { name: "details", arguments: ["ID"], description: "Shows details about a market item by its ID." },
    { name: "buy", arguments: ["ID"], description: "Purchases a market item by its ID if you have enough coins." }
];

export default class Market extends Phaser.Scene{
    constructor(){
        super('Market');
    }

    preload(){
        this.load.image('marketBkg', marketBkg);
        this.load.image('item1', item1);
        this.load.image('item2', item2);
        this.load.image('item3', item3);
        this.load.image('item4', item4);
        this.load.image('item5', item5);
        this.load.image('item6', item6);
        this.load.image('item7', item7);
        this.load.image('item8', item8);
    }

    create(){
    // Add images
        this.add.image(400, 300, 'marketBkg').setDisplaySize(800, 600);
        // Items for sale: Create & store
        this.itemImages = {
            1: this.add.image(400, 300, 'item1').setDisplaySize(800, 600),
            2: this.add.image(400, 300, 'item2').setDisplaySize(800, 600),
            3: this.add.image(400, 300, 'item3').setDisplaySize(800, 600),
            4: this.add.image(400, 300, 'item4').setDisplaySize(800, 600),
            5: this.add.image(400, 300, 'item5').setDisplaySize(800, 600),
            6: this.add.image(400, 300, 'item6').setDisplaySize(800, 600),
            7: this.add.image(400, 300, 'item7').setDisplaySize(800, 600),
            8: this.add.image(400, 300, 'item8').setDisplaySize(800, 600)
        };

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
            this.registry.events.off(
            'changedata-coins',
            this.onCoinsChanged,
            this
            );
        });

        const items = [
                {item: 'item1', name: 'Worms', price: 5, type: 'Bait', itemID: 1, description: "Use as a parameter in the addBait() method."},
                {item: 'item2', name: 'Apple', price: 10, type: 'Bait', itemID: 2, description: "Use as a parameter in the addBait() method."},
                {item: 'item3', name: 'Equip', price: 20, type: 'Method', itemID: 3, description: "An instance method.\n// Use on either Rico or the boat to equip an item.\n// Example:\n// Rico.equip(crown);\n// boat.equip(flag);"},
                {item: 'item4', name: 'Flag', price: 10, type: 'Item', itemID: 4, description: "Use as a parameter in the boat.equip() method."},
                {item: 'item5', name: 'Pizza', price: 15, type: 'Bait', itemID: 5, description: "Use as a parameter in the addBait() method."},
                {item: 'item6', name: 'BaitFor', price: 20, type: 'Method', itemID: 6, description: "A static method.\n// Use to find what bait is needed for each species of fish. \n// Example:\n// baitFor(tuna);"},
                {item: 'item7', name: 'Cake', price: 25, type: 'Bait', itemID: 7, description: "Use as a parameter in the addBait() method."},
                {item: 'item8', name: 'Crown', price: 50, type: 'Item', itemID: 8, description: "Use as a parameter in the Rico.equip() method."},
        ]

        // Default text:
        printlnToConsole(`To see item info, enter item number and run: details()`);


        // Define functions used in the C4C written coding area---------------------
        C4C.Interpreter.define('details', (ID) => {
            ID = Number(ID);
            const i = items.find(item => item.itemID === ID);

            // Handles invalid input:
            if (!i) {
                printlnToConsole(`To see item info, enter item number and run: details()`);
                printErrorToConsole(`Please enter a valid number!`);
                return;
            }

            printlnToConsole(`Item ID: ${i.itemID}`)
            printlnToConsole(`Name: ${i.name}`)
            printlnToConsole(`Type: ${i.type}`)
            printlnToConsole(`Price: ${i.price} coins`)
            printlnToConsole()
            printlnToConsole(`Description: ${i.description}`)
            printlnToConsole()

            highlightItem(ID);
        });

        C4C.Interpreter.define('buy', (ID) => {
            ID = Number(ID);
            const i = items.find(item => item.itemID === ID);
            // Handles invalid input:
            if (!i) {
                printlnToConsole('Invalid buy input, try again!')
                return;
            }
            // Variables:
            let coins = this.registry.get('coins');
            let boughtStatus = this.registry.get('bought'+i.name);
            // Check if the item has been purchased already:
            if(boughtStatus){
                printWarningToConsole(`You've already purchased this item!`);
                return;
            }
            // Purchase if able:
            if (coins >= i.price) {
                this.registry.set('coins', coins -= i.price);
                this.registry.set('bought'+i.name, true);
                this.itemImages[i.itemID].setAlpha(0);
            } else {
                printWarningToConsole(`You don't have enough coins!`);
                return;
            }
        });

        // Additional Functions ----------------------------------------------------------------

        C4C.Interpreter.define('manual', () => {
            printlnToConsole("---------------------");
            for (const fn of marketFunctions) {
                const args = fn.arguments.join(", ");
                printlnToConsole(`${fn.name}(${args}) - ${fn.description}`);
            }
            printlnToConsole("---------------------");
        })


        // Grays out all other items
        const highlightItem = (itemID) => {
        Object.entries(this.itemImages).forEach(([id, img]) => {
            if (Number(id) === itemID) {
                img.clearTint();
            } else {
                img.setTint(0x888888); // grey tint
            }
        });
    };
    }

    update(){
        // Game Logic
    }

    // Functions

    onCoinsChanged(parent, value) {
        this.coinText.setText('Coins: ' + value);
    }
}