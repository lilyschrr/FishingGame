import C4C from 'c4c-lib';

// Fish images:
import myMinnow from '../assets/MyMinnow.png';
import myCarp from '../assets/MyCarp.png';
import myBluegill from '../assets/MyBluegill.png';
import myTrout from '../assets/MyTrout.png';
import myCatfish from '../assets/MyCatfish.png';
import myBass from '../assets/MyBass.png';
import myTuna from '../assets/MyTuna.png';
import mySalmon from '../assets/MySalmon.png';
import myRedSnapper from '../assets/MyRedSnapper.png';
import myShark from '../assets/MyShark.png';
import mySwordfish from '../assets/MySwordfish.png';
import myPufferfish from '../assets/MyPufferfish.png';
import myMegalodon from '../assets/MyMegalodon.png';

import roomBkg from '../assets/MyFishbkg.png';


export default class MyFish extends Phaser.Scene{
    constructor(){
        super('MyFish');
    }

    preload(){
        this.load.image('roomBkg', roomBkg);

        this.load.image('myMinnow', myMinnow);
        this.load.image('myCarp', myCarp);
        this.load.image('myBluegill', myBluegill);
        this.load.image('myTrout', myTrout);
        this.load.image('myCatfish', myCatfish);
        this.load.image('myBass', myBass);
        this.load.image('myTuna', myTuna);
        this.load.image('mySalmon', mySalmon);
        this.load.image('myRedSnapper', myRedSnapper);
        this.load.image('myShark', myShark);
        this.load.image('mySwordfish', mySwordfish);
        this.load.image('myPufferfish',myPufferfish);
        this.load.image('myMegalodon', myMegalodon);
    }

    create(){

        this.add.image(400, 300, 'roomBkg').setDisplaySize(800, 600);

        const fishTypes = ['Minnow', 'Carp', 'Bluegill', 'Trout', 'Catfish', 'Bass', 'Tuna', 'Salmon', 'RedSnapper', 'Shark', 'Swordfish', 'Pufferfish', 'Megalodon'];
        
        for (const x of fishTypes){
            if (this.registry.get('caught' + x)){
                this.add.image(400, 300, 'my'+x); // If you caught the fish, add its image
                }
            }
        }

    update(){
        
    }
}