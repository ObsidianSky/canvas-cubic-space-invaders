var Game = function(canvasId){
    var canvas = document.getElementById('canvas');
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height};
    var self = this;
    var player = new Player(this, gameSize);


    this.bodies = createInvaders(this, gameSize).concat(player);

    var tick = function(){
        requestAnimationFrame(tick);
        self.update(gameSize);
        self.draw(screen, gameSize);
    }   

    tick();
}

Game.prototype = {
    update:function(gameSize){
        var bodies = this.bodies;
        var notCollidingWithAnything = function(b1){
            return bodies.filter(function(b2){ 
                return colliding(b1, b2); 
            }).length === 0;
        };

        var inGameAreaY = function(b){
            return b.center.y > 0 && b.center.y < gameSize.y;
        }

        this.bodies = this.bodies.filter(notCollidingWithAnything).filter(inGameAreaY);

        for (var i = 0; i< this.bodies.length; i++) {
            this.bodies[i].update(gameSize);
        }   
    },

    draw: function(screen, gameSize){
        screen.clearRect(0,0, gameSize.x, gameSize.y);

        for (var i = 0; i< this.bodies.length; i++) {
            drawRect(screen,  this.bodies[i]);
        }
    },

    addBody: function(body){
        this.bodies.push(body);
    }

};

/*
* Player class
*/
var Player = function(game, gameSize){
    this.game = game;
    this.size = {x: 15, y:15};
    this.center = {x:gameSize.x/2, y: gameSize.y - this.size.x/2}
    this.keyboarder = new Keyboarder();
    this.canShoot = true;
}

Player.prototype ={
    update: function(gameSize) {
        var self = this;
        if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.center.x - this.size.x/2 - 2  > 0){
            this.center.x -= 2;
        } else if(this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.center.x + this.size.x/2 + 2 < gameSize.x){
            this.center.x += 2;
        }

        if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE) && this.canShoot){
            this.canShoot = false;

            var bullet = new Bullet({
                /*bullet start position*/
                x: this.center.x,
                y: this.center.y - this.size.x/2,   
            },{
                /*bullet velocity*/
                x: 0,
                y: -6
            });

            this.game.addBody(bullet);

            setTimeout(function(){
                self.canShoot = true;
            },300);

        }
    }
}
/*
* Player class end
*/

/*
* Invader class
*/
var Invader = function(game, center, gameSize){
    this.game = game;
    this.size = {x: 15, y:15};
    this.center = center;
    this.patrolX = 0;
    this.speedX = 0.25;
    this.canShoot = true;
    this.patrolLimit = gameSize.x - 8*30-30;
}

Invader.prototype ={
    update: function(gameSize) {
        if(this.patrolX < 4 || this.patrolX > this.patrolLimit-4){ //magic number
            this.canShoot = false;
        }else{
           this.canShoot = true; 
        }

        if(this.patrolX < 0 || this.patrolX > this.patrolLimit){
            this.speedX = -this.speedX;
            this.center.y +=  this.size.y; 
        }   

        this.center.x += this.speedX;
        this.patrolX += this.speedX;


        if(this.canShoot && !this.invadersBelow(this) && Math.random() > 0.996){

            var bullet = new Bullet({
                /*bullet start position*/
                x: this.center.x,
                y: this.center.y + this.size.y/2 + 2,   
            },{
                /*bullet velocity*/
                x: 0,
                y: 2
            });
            this.game.addBody(bullet);
        }
    },

    invadersBelow: function(invader){
        return this.game.bodies.filter(function(b){
            if(b instanceof Invader && Math.abs(b.center.x - invader.center.x) < invader.size.x && b.center.y > invader.center.y){
                return true;
            }
            return false;      
        }).length > 0;
    }
}
/*
* Invader class end
*/


/*
* Bullet class
*/
var Bullet = function(center, velocity){
    this.size = {x: 3, y:3};
    this.center = center;
    this.velocity = velocity;
}

Bullet.prototype ={
    update: function() {
        this.center.x += this.velocity.x;
        this.center.y += this.velocity.y;
    }
}
/*
* Bullet class end
*/


var createInvaders = function(game, gameSize){
    var invaders = [];
    for (var i = 0; i<24; i++){
        var x = 30 + (i % 8) * 30;
        var y = 30 + (i % 3) * 30;
        invaders.push(new Invader(game, { x: x, y: y}, gameSize));
        console.log(x,y);
    }

    return invaders;
}

var drawRect = function(screen, body){
    screen.fillRect(body.center.x - body.size.x/2,
                    body.center.y - body.size.y/2,
                    body.size.x, body.size.y);
}

var Keyboarder = function() {
    var keyState = {};

    window.onkeydown = function(e) {
        keyState[e.keyCode] = true;
        console.log(e.keyCode);
    };

    window.onkeyup = function(e) {
        keyState[e.keyCode] = false;
    };

    this.isDown = function(keyCode){
        return keyState[keyCode] === true;
    };

    this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32};
}

var colliding = function(b1, b2){
    return !(b1 === b2 ||
             b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
             b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
             b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
             b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2
             );
};

window.onload = function() {
   new Game();
}    

