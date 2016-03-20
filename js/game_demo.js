var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { create: create, update: update, render: render });

var player;
var keys;

var nextFireBall;

var zombies;
var score = 0;
var scoreText;

var zombiesAlive = 10;
var zombiesTotal = 10;
var zombieLookig = 300;

var health = 10;
var score = 0;

var zombieTexture;
var burnedZombieTexture;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#ffffff';

    var fireBallData = [
        '.77.',
        '7337',
        '7337',
        '.77.'
    ];
    game.create.texture('fireBall', fireBallData, 6, 6, 0);


    var playerData = [
        '....CC.......',    
        '...EEEE......',
        '..EECCEE.....',
        '.EEC33CEE.77.',
        'CEC3DD3CE7337',
        'CEC3DD3CE7337',
        '.EEC33CEE.77.',
        '..EECCEE.....',
        '...EEEE......',
        '....CC.......'        
    ];
    game.create.texture('player', playerData, 6, 6, 0);

    var zomvieData = [
        '..BBB.....',
        '.BAAAB....',
        '.BAAEAB...',
        'BAAAEAB000',
        'BAAAAAB...',
        'BAAAAAB...',
        'BAAAEAB000',
        '.BAAEAB...',
        '.BAAAB....',
        '..BBB.....'
    ];
    zombieTexture = game.create.texture('zombie', zomvieData, 6, 6, 0); 

    var burnZombie = [
        '..888.....',
        '.87778....',
        '.873E78...',
        '8733E78000',
        '8733378...',
        '8733378...',
        '8733E78000',
        '.873E78...',
        '.87778....',
        '..888.....'
    ];
    burnedZombieTexture = game.create.texture('burnZombie', burnZombie, 6, 6, 0);



    player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
    player.anchor.set(0.5);
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.body.bounce.setTo(3, 3);


    nextFireBall = game.time.now;
    fireBalls = game.add.group();
    fireBalls.enableBody = true;
    fireBalls.physicsBodyType = Phaser.Physics.ARCADE;
    fireBalls.createMultiple(30, 'fireBall', 0, false);
    fireBalls.setAll('anchor.x', 0.5);
    fireBalls.setAll('anchor.y', 0.5);
    fireBalls.setAll('outOfBoundsKill', true);
    fireBalls.setAll('checkWorldBounds', true);


    zombies = [];

    zombiesTotal = 10;
    for (var i = 0; i < zombiesTotal; i++)
    {
        zombies.push(new Zombie(i, game, player, fireBalls));
    }


    keys = game.input.keyboard.addKeys(
        {
            'up': Phaser.Keyboard.W,
            'left': Phaser.Keyboard.A,
            'down': Phaser.Keyboard.S,
            'right': Phaser.Keyboard.D,
        }
    );

    text = game.add.text(10, 10, '', {} );

}

function update() {
    playerMoving();

    if (game.input.activePointer.isDown)
        fire();     

    zombiesAlive = 0;
    for (var i = 0; i < zombies.length; i++)
    {
        if (zombies[i].alive)
        {
            zombiesAlive++;
            game.physics.arcade.collide(player, zombies[i].zombie, zombieHitPlayer, null, this);
            game.physics.arcade.overlap(fireBalls, zombies[i].zombie, fireBallHitZombie, null, this);
            zombies[i].update();
        } else if( zombies[i].ripTime + 7000 < game.time.now){
            zombies[i].zombie = createZombieBody(i);
            zombies[i].alive = true;
            zombies[i].health = 3;
        }
    }
}

function render () {
    text.text = 'Zombies: ' + zombiesAlive + ' / ' + zombiesTotal + '\n' + 
                'Health: ' + health + '\n' +
                'Score: ' + score;
}

function playerMoving(){
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (keys.left.isDown)
        player.body.velocity.x = -200;
    
    if (keys.right.isDown)
        player.body.velocity.x = 200;
    
    if (keys.up.isDown)
        player.body.velocity.y = -200;
    
    if (keys.down.isDown)
        player.body.velocity.y = 200;
    
    player.rotation = game.physics.arcade.angleToPointer(player);
}


function fire()
{
    var fireBallCallDown = 300;
    var shift = 30;
    var angle = game.physics.arcade.angleToPointer(player);

    if (game.time.now > nextFireBall && fireBalls.countDead() > 0)
    {
        nextFireBall = game.time.now + fireBallCallDown;

        var fireBall = fireBalls.getFirstExists(false);
        fireBall.reset(shiftX(), shiftY());
        fireBall.rotation = game.physics.arcade.moveToPointer(fireBall, 1000, game.input.activePointer, 500);
    }
    
    function shiftX(){
        return shift * Math.cos(angle) + player.x;
    }

    function shiftY(){
        return shift * Math.sin(angle) + player.y;
    }
}

function fireBallHitZombie (zombie, fireBall) {

    fireBall.kill();
    zombies[zombie.id].damage();
    zombies[zombie.id].timeOfBurn = game.time.now;
    zombies[zombie.id].burn = true;
    zombies[zombie.id].zombie.texture = burnedZombieTexture;

}

function zombieHitPlayer (zombie) {
    if(health > 0){
        health--;
        if(health == 0){
            player.kill();
            game.add.text(game.world.centerY, 200, 'GameOver');
        }
    }


}
    

Zombie = function (i, game, player, fireBalls) {
    this.game = game;
    this.health = 3;
    this.player = player;
    this.fireBalls = fireBalls;
    this.alive = true;
    this.moveTime = game.time.now;

    this.zombie = createZombieBody(i);
};

function createZombieBody(i)
{
    var p = {
        x: game.world.randomX,
        y: game.world.randomY
    };

    var z = game.add.sprite(p.x, p.y, 'zombie');

    while(game.physics.arcade.distanceBetween(z, this.player) < 200){
            z.x = game.world.randomX;
            z.y = game.world.randomY;
    }

    z.anchor.set(0.5);
    z.id = i;

    game.physics.enable(z, Phaser.Physics.ARCADE);
    z.body.immovable = false;
    z.body.collideWorldBounds = true;
    z.body.bounce.setTo(5, 5);
    return z;   
}


Zombie.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;

        this.zombie.kill();
        this.ripTime = game.time.now;
        score++;
        return true;
    }

    return false;
}

var walkingDuration = 5000;
var zombieSpeed = 100;
var nullPoint = new Phaser.Point(0, 0);
Zombie.prototype.update = function() {

    this.zombie.rotation = Phaser.Point.angle(nullPoint, this.zombie.body.velocity) + 3.14;

    if (this.game.physics.arcade.distanceBetween(this.zombie, this.player) < zombieLookig)
    {
        this.game.physics.arcade.accelerateToObject(this.zombie, this.player, zombieSpeed, zombieSpeed, zombieSpeed);
    } else if(game.time.now > this.moveTime){
        this.moveTime = game.time.now + walkingDuration;
        this.game.physics.arcade.accelerateToXY(this.zombie, game.world.randomY, 
                                                                              game.world.randomY, 
                                                                              zombieSpeed, zombieSpeed, zombieSpeed); 
    }

    if(this.burn && this.timeOfBurn + 150  < game.time.now){
        this.zombie.texture = zombieTexture;
        this.burn = false;
    }

};