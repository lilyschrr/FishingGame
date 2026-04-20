// This is the starting point of your application
import C4C from 'c4c-lib';
import Phaser from 'phaser';
import Boot from './scenes/boot';
import MainGame from './scenes/mainGame';
import TackleBox from './scenes/tacklebox';
import MyFish from './scenes/myfish';
import Market from './scenes/market';
import { printToConsole, printlnToConsole, clearConsole, printErrorToConsole} from './consoleOperations.js';

// Load style.css into our page
import './assets/style.css';

// Constants, sizes
    const gameWidth = 800;
    const gameHeight = 600;

    const codeOutput = document.getElementById('code-output');

// Theme for the C4C editor.  Look into the codemirror documentation for more options
const theme = {
    "&": {
        color: "#00007F",
        backgroundColor: "#fafafa",
        height: "100%",
        width: "100%",
    }
}

// Create the C4C editor
// The functions that you want the code editor to autocomplete
// If you want to add more on the fly depending on the scene, you will have to create a new editor
const autocompleteFunctions = ['cast', 'addBait', 'print', 'println', 'manual', 'clear', 'ricoequip', 'unequip'];
C4C.Editor.create(document.getElementById('code-editor'), theme, false, autocompleteFunctions);

// Create the game
const config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    // Where the game is located (id of the DOM element)
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // All the scenes in the game
    scene: [Boot, MainGame, TackleBox, MyFish, Market]
}

const game = new Phaser.Game(config);

// Resize game canvas when the container size changes (e.g. window resize)
function refreshGameScale() {
    if (game.scale) {
        game.scale.refresh();
    }
}
window.addEventListener('resize', refreshGameScale);
const gameContainerEl = document.getElementById('game-container');
if (gameContainerEl && typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(refreshGameScale);
    resizeObserver.observe(gameContainerEl);
}

// This is only for stepEval code, you can delete this line otherwise
// StepEval does not currently allow functions to be defined in the code editor
const codeRunner = C4C.Runner.createRunner();
// Runs 1 step of code every second
const gameLoopSpeed = 1000;
var gameLoop;

const pageCode = new Map();


// Switch the scene whenever the "Tackle Box" button is pressed
document.getElementById('tackle-box').addEventListener('click', () => {
    // Stop running any code that's currently running
    switchScene()
    // If the current scene is mainGame.js, myfish.js, or market.js, switch to tacklebox.js
    if (game.scene.isActive('MainGame')) {
        saveCode('MainGame')
        game.scene.stop('MainGame');
        game.scene.start('TackleBox');
    } else if(game.scene.isActive('MyFish')) {
        saveCode('MyFish')
        game.scene.stop('MyFish');
        game.scene.start('TackleBox');
    } else if(game.scene.isActive('Market')) {
        saveCode('Market')
        game.scene.stop('Market');
        game.scene.start('TackleBox');
    }

    loadCode("TackleBox");
});

// Switch the scene whenever the "🎣" button is pressed
document.getElementById('MainGame').addEventListener('click', () => {
    // Stop running any code that's currently running
    switchScene()
    // If the current scene is market.js, or tacklebox.js, or myfish.js, switch to MainGame
    if(game.scene.isActive('TackleBox')){
        saveCode('Tacklebox')
        game.scene.stop('TackleBox');
        game.scene.start('MainGame');
    } else if (game.scene.isActive('Market')){
        saveCode('Market')
        game.scene.stop('Market')
        game.scene.start('MainGame')
    } else if (game.scene.isActive('MyFish')){
        saveCode('MyFish')
        game.scene.stop('MyFish');
        game.scene.start('MainGame');
    }

    loadCode("MainGame");
});

// Switch the scene whenever the "My Fish" button is pressed
document.getElementById('my-fish').addEventListener('click', () => {
    // Stop running any code that's currently running
    switchScene()
    // If the current scene is mainGame.js, tacklebox.js, or market switch to myfish.js
    if (game.scene.isActive('MainGame')) {
        saveCode('MainGame')
        game.scene.stop('MainGame');
        game.scene.start('MyFish');
    } else if(game.scene.isActive('TackleBox')){
        saveCode('TackleBox')
        game.scene.stop('TackleBox');
        game.scene.start('MyFish');
    } else if (game.scene.isActive('Market')){
        saveCode('Market')
        game.scene.stop('Market');
        game.scene.start('MyFish');
    }

    loadCode("MyFish");
});

// Switch the scene whenever the "Market" button is pressed
document.getElementById('market').addEventListener('click', () => {
    // Stop running any code that's currently running
    switchScene()
    // If the current scene is mainGame.js, myfish.js, or tacklebox.js, switch to market.js
    if (game.scene.isActive('MainGame')) {
        saveCode('MainGame')
        game.scene.stop('MainGame');
        game.scene.start('Market');
    } else if(game.scene.isActive('MyFish')){
        saveCode('MyFish')
        game.scene.stop('MyFish');
        game.scene.start('Market');
    } else if (game.scene.isActive('TackleBox')){
        saveCode('Tacklebox')
        game.scene.stop('TackleBox');
        game.scene.start('Market');
    }

    loadCode("Market");
});

// Run the code whenever the "Run Code" button is pressed
document.getElementById('run-code').addEventListener('click', () => {
    // Get the code from the editor, and remove any comments
    const code = C4C.Editor.getText().replaceAll(/\/\/.*/g, '');
    console.log(code)

    // We want to use stepEval to run the code one line at a time
    codeRunner.programText = code;
    codeRunner.reset();
    clearInterval(gameLoop);
    // Make sure the code works before running it
    try {
        codeRunner.check();
    } catch (e) {
        // You may want to give better feedback here
        printErrorToConsole(e)
        return;
    }

    // Restart the gameloop right now
    // Note phaser has a way to do a game loop that's probably better than this, I would look into using that instead maybe
    codeRunner.step();
    gameLoop = setInterval(() => codeRunner.step(), gameLoopSpeed);
});

document.getElementById('game-container').addEventListener('click', () => {
    document.activeElement?.blur()
})

/**
 * Some common things that run when switching scenes
 */
function switchScene(){
    codeRunner.reset();
    clearInterval(gameLoop);
    clearConsole();
}

C4C.Interpreter.define('println', (message) => {
    printlnToConsole(message)
});

C4C.Interpreter.define('print', (message) => {
    printToConsole(message)
});

C4C.Interpreter.define('clear', () => {
    clearConsole()
});

// All the items to be used has constants
C4C.Interpreter.define('worm', "worms");
C4C.Interpreter.define('worms', "worms");
C4C.Interpreter.define('apple', "apple");
C4C.Interpreter.define('pizza', "pizza");
C4C.Interpreter.define('cake', "cake");
C4C.Interpreter.define('crown', "crown");
C4C.Interpreter.define('crownflag', "crownflag");
C4C.Interpreter.define('flag',"flag");

// All the fish to be used has constants
C4C.Interpreter.define("minnow", "Minnow");
C4C.Interpreter.define("carp", "Carp");
C4C.Interpreter.define("bluegill", "Bluegill");

C4C.Interpreter.define("bass", "Bass");
C4C.Interpreter.define("catfish", "Catfish");
C4C.Interpreter.define("trout", "Trout");

C4C.Interpreter.define("salmon", "Salmon");
C4C.Interpreter.define("tuna", "Tuna");
C4C.Interpreter.define("redsnapper", "RedSnapper");

C4C.Interpreter.define("shark", "Shark");
C4C.Interpreter.define("swordfish", "Swordfish");
C4C.Interpreter.define("pufferfish", "Pufferfish");

C4C.Interpreter.define("megalodon", "Megalodon");


function saveCode(page){
    pageCode[page] = C4C.Editor.getText().replaceAll(/\/\/.*/g, '');
}

function loadCode(page){
    C4C.Editor.setText(pageCode[page]);
}


export {gameLoopSpeed};
