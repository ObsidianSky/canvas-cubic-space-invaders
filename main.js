var Game = function(canvasId){
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height};
    var self = this;
    var player = new Player(this, gameSize);

    this.bodies = createInvaders(this).concat(player);

    this.getGameSize = function(){
        return gameSize;
    }

    var tick = function(){
        requestAnimationFrame(tick);
        self.update();
        self.draw(screen, gameSize);
    }   

    tick();
}

Game.prototype = {
    update:function(){
        var bodies = this.bodies;
        var gameSize = this.getGameSize();
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
            this.bodies[i].update();
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
}

Player.prototype ={
    update: function() {
        if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.center.x - this.size.x/2 - 2  > 0){
            this.center.x -= 2;
        } else if(this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.center.x + this.size.x/2 + 2 < this.game.getGameSize().x){
            this.center.x += 2;
        }

        if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)){
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

        }
    }
}
/*
* Player class end
*/

/*
* Invader class
*/
var Invader = function(game, center){
    this.game = game;
    this.size = {x: 15, y:15};
    this.center = center;
    this.patrolX = 0;
    this.speedX = 0.3;
}

Invader.prototype ={
    update: function() {
        if(this.patrolX<0 || this.patrolX >40){
            this.speedX = -this.speedX;
        }   

        this.center.x += this.speedX;
        this.patrolX += this.speedX;

        if(Math.random() > 0.994 && !this.invadersBelow(this)){

            var bullet = new Bullet({
                /*bullet start position*/
                x: this.center.x,
                y: this.center.y + this.size.x/2,   
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
            if(b instanceof Invader && b.center.x - invader.center.x < invader.size.x){
                if(b.center.y > invader.center.y){
                    return true;
                }
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


var createInvaders = function(game){
    var invaders = [];
    for (var i = 0; i<24; i++){
        var x = 30 + (i % 8) * 30;
        var y = 30 + (i % 3) * 30;
        invaders.push(new Invader(game, { x: x, y: y}));
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
   new Game("canvas");
}    

