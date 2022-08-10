const WIDTH = 800;
const HEIGHT = 600;

const FLOOR_SIZE = {
  width: 256,
  height: 32,
};
const FLOOR_COLOR = "0x00ff00";
const PLAYER_COLOR = "0x0000ff";
const JUMP_VELOCITY = -1000;
const GRAVITY_Y = 2000;
const MOVE_ACCELERATION = 2000;
const SCROLL_VELOCITY_Y = 20;
const NEXT_Y_SPAN_DELTA = -10;

class SceneTitle extends Phaser.Scene {
  constructor() {
    super({
      key: "SceneTitle",
    });
  }
  preload() {
    this.load.image("bg", "assets/img/bg.png");
  }
  create() {
    this.add.image(400, 300, "bg");
    const highScoreText = this.add.text(0, 0, "");
    const gamepadTotalText = this.add.text(WIDTH, 0, "").setOrigin(1.0, 0.0);

    this.add
      .text(WIDTH / 2, HEIGHT / 2, "phaser3 jump game")
      .setOrigin(0.5, 0.5);
    this.add
      .text(WIDTH / 2, HEIGHT / 2 + 50, "PRESS SPACE TO START")
      .setOrigin(0.5, 0.5);
    this.add
      .text(WIDTH / 2, HEIGHT / 2 + 70, "OR BUTTON_0 BUTTON_1")
      .setOrigin(0.5, 0.5);

    const space = this.input.keyboard.addKey("SPACE");
    if (!this.registry.has("highScore")) {
      this.registry.set("highScore", 0);
    }
    this.userData = {
      space,
      highScoreText,
      gamepadTotalText,
    };
  }
  update(time, delta) {
    const { space, highScoreText, gamepadTotalText } = this.userData;
    if (space.isDown) {
      this.scene.start("SceneMain");
    }
    this.input.gamepad.gamepads.forEach((pad) => {
      if (pad) {
        if (pad.isButtonDown(0) | pad.isButtonDown(1)) {
          this.scene.start("SceneMain");
        }
      }
    });
    highScoreText.setText("high score:" + this.registry.get("highScore"));

    gamepadTotalText.setText("gamepad.total: " + this.input.gamepad.total);
  }
}

class SceneMain extends Phaser.Scene {
  constructor() {
    super({
      key: "SceneMain",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: GRAVITY_Y },
        },
      },
    });
    this.userData = {};
  }
  addFloor(x, y) {
    const { floors } = this.userData;

    const floor = this.add.rectangle(
      x,
      y,
      FLOOR_SIZE.width,
      FLOOR_SIZE.height,
      FLOOR_COLOR
    );
    floors.add(floor);
  }
  updateFloors() {
    const { floors } = this.userData;

    const mainCamera = this.cameras.main;

    while (
      mainCamera.scrollY - FLOOR_SIZE.height / 2 <
      this.userData.lastFloorY + this.userData.nextYSpan
    ) {
      const floorX =
        Math.random() * (WIDTH - FLOOR_SIZE.width) + FLOOR_SIZE.width / 2;
      console.log(floorX);
      const floorY = this.userData.lastFloorY + this.userData.nextYSpan;
      this.addFloor(floorX, floorY);
      this.userData.lastFloorY = floorY;
      this.userData.nextYSpan += NEXT_Y_SPAN_DELTA;
    }

    floors.children.each((floor) => {
      if (mainCamera.scrollY + HEIGHT < floor.body.position.y) {
        floors.remove(floor, true);
      }
    });
  }
  preload() {
    this.load.image("bg", "assets/img/bg.png");
  }
  create() {
    this.add.image(400, 300, "bg").setScrollFactor(0);
    const highScoreText = this.add.text(0, 0, "").setScrollFactor(0);
    const scoreText = this.add.text(0, 20, "").setScrollFactor(0);

    const player = this.add.rectangle(
      WIDTH / 2,
      HEIGHT / 2,
      64,
      64,
      PLAYER_COLOR
    );
    player.depth = 1;
    this.physics.add.existing(player);

    const floors = this.physics.add.staticGroup();
    const floorCollider = this.physics.add.collider(player, floors);

    Object.assign(this.userData, {
      floors,
    });
    let lastFloorY = HEIGHT / 2 + 100;
    this.addFloor(WIDTH / 2, lastFloorY);

    const toKey = (key) => this.input.keyboard.addKey(key);
    const upKeys = ["W", "SPACE", "UP"].map(toKey);
    const leftKeys = ["A", "LEFT"].map(toKey);
    const rightKeys = ["D", "RIGHT"].map(toKey);

    // setTimeout(()=>{
    //   this.scene.start('SceneTitle');
    // },1000*2);

    this.data.set({
      score: 0,
    });
    Object.assign(this.userData, {
      player,
      floorCollider,
      highScoreText,
      scoreText,
      upKeys,
      leftKeys,
      rightKeys,
      lastFloorY,
      nextYSpan: -100,
    });
    this.updateFloors();
  }
  update(time, delta) {
    const {
      player,
      floorCollider,
      highScoreText,
      scoreText,
      upKeys,
      leftKeys,
      rightKeys,
    } = this.userData;

    const isGamepadLeft = () => {
      return this.input.gamepad.gamepads.some((pad) => {
        if (pad) {
          if (pad.left) {
            return true;
          }
        }
        return false;
      });
    };
    const isGamepadRight = () => {
      return this.input.gamepad.gamepads.some((pad) => {
        if (pad) {
          if (pad.right) {
            return true;
          }
        }
        return false;
      });
    };
    const isGamepadUp = () => {
      return this.input.gamepad.gamepads.some((pad) => {
        if (pad) {
          if (pad.up || pad.isButtonDown(0) || pad.isButtonDown(1)) {
            return true;
          }
        }
        return false;
      });
    };
    const getGamepadMove = () => {
      const total = this.input.gamepad.gamepads
        .map((pad) => {
          let move = 0;
          move += pad.leftStick.x;
          move += pad.rightStick.x;
          return move;
        })
        .reduce((acc, v) => acc + v, 0);
      return total;
    };

    const mainCamera = this.cameras.main;
    mainCamera.scrollY -= (SCROLL_VELOCITY_Y * delta) / 1000;

    const scoreFromY = Math.floor((player.body.center.y - HEIGHT / 2) * -1);

    this.updateFloors();

    const score = Math.max(this.data.get("score"), scoreFromY);
    this.data.set("score", score);
    if (this.registry.get("highScore") < score) {
      this.registry.set("highScore", score);
    }

    highScoreText.setText("high score:" + this.registry.get("highScore"));
    scoreText.setText("your score:" + this.data.get("score"));

    const canJump = player.body.onFloor();
    const isDown = (key) => key.isDown;
    if (canJump && (upKeys.some(isDown) || isGamepadUp())) {
      player.body.velocity.y = JUMP_VELOCITY;
    }

    const isRising = player.body.velocity.y < 0;
    floorCollider.active = !isRising;

    let move = 0;
    if (leftKeys.some(isDown) || isGamepadLeft()) {
      move -= 1;
    }
    if (rightKeys.some(isDown) || isGamepadRight()) {
      move += 1;
    }
    move += getGamepadMove();

    player.body.acceleration.x =
      MOVE_ACCELERATION * Math.min(1, Math.max(-1, move));

    if (HEIGHT < player.body.center.y) {
      this.scene.pause();
      this.scene.launch("SceneGameover");
      setTimeout(() => {
        this.scene.stop("SceneGameover");
        this.scene.start("SceneTitle");
      }, 1000 * 2);
    }
  }
}

class SceneGameover extends Phaser.Scene {
  constructor() {
    super({
      key: "SceneGameover",
    });
  }
  preload() {}
  create() {
    const highScoreText = this.add
      .text(WIDTH / 2, HEIGHT / 2, "GAME OVER")
      .setOrigin(0.5, 0.5);
  }
  update(time, delta) {}
}

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [SceneTitle, SceneMain, SceneGameover],
  input: {
    gamepad: true,
  },
};

window.game = new Phaser.Game(config);
