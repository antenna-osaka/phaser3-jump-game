class SceneTitle extends Phaser.Scene{
  constructor(){
    super({
      key:"SceneTitle",
    });
  }
  create(){
    this.add.text(0,0,"SceneTitle");
    setTimeout(()=>{
      this.scene.start('SceneA');
    },1000);
  }
  update(){
  }
}

class SceneA extends Phaser.Scene{
  constructor(){
    super({
      key:"SceneA",
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 200 }
        }
      },
    });
  }
  preload(){
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
  
  }
  create(){
    setTimeout(()=>{
      this.scene.start('SceneTitle');
    },1000*10);


    this.add.image(400, 300, 'sky');
    this.add.text(0,0,"SceneA");

    var particles = this.add.particles('red');
  
    var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });
  
    var logo = this.physics.add.image(400, 100, 'logo');

    const rect=this.add.rectangle(400, 100,100,100,0xff00ff);
    this.physics.add.existing(rect);
    rect.body.setCollideWorldBounds(true);

    this.physics.add.collider(rect, logo);

  
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);
  
    emitter.startFollow(logo);

    // const camera=this.cameras.main;
    // camera.startFollow(logo);

  
  }
  update(){
  }
}

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [SceneTitle, SceneA],
};

var game = new Phaser.Game(config);

