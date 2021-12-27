var scnwidth = 800;
var scnheight = 500;

class Winscene extends Phaser.Scene {
    cloudpoints = [];
    cloud = [3];
    max_cloudspeed = 2;
    max_secpoints = 80;
    secpoints_step = 200; // times to loop update() before secpoint move
    mainparticles = [];
    secparticles = [];
    secpoints = [];
    sectangents = [];
    updatet = 0;
    curve = 0;
    
    constructor () {
	super("winscene");
    }

    preload () {
        this.load.image('spark0', 'assets/spark0.png');
	this.load.image('spark1', 'assets/spark1.png');
	this.load.spritesheet('sparks', 'assets/sparks.png',
			      { frameWidth: 132,
				frameHeight: 132});
	this.load.spritesheet('solcara', 'assets/solcara.png',
			      { frameWidth: 466,
				frameHeight: 404});
	this.load.spritesheet('chalupcargo', 'assets/chalupcargo.png',
			      { frameWidth: 768,
				frameHeight: 1024 });
	this.load.image('sky', 'assets/sky.png');
	this.load.image('cloud1', 'assets/cloud1.png');
	this.load.image('cloud2', 'assets/cloud2.png');
	this.load.image('cloud3', 'assets/cloud1.png');
	this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create () {
	this.add.image(scnwidth / 2, scnheight / 2, 'sky');
	let line1 = new Phaser.Geom.Line(50, 50, 750, 50);
	let line2 = new Phaser.Geom.Line(50, 100, 750, 150);
	let line3 = new Phaser.Geom.Line(50, 150, 750, 200);
	let si = 0;
	
	for (let i = 0; i < 25; i++) {
	    this.cloudpoints.push(line1.getRandomPoint());
	    this.cloudpoints.push(line2.getRandomPoint());
	    this.cloudpoints.push(line3.getRandomPoint());
	}
	this.curve = new Phaser.Curves.Ellipse(scnwidth / 2, scnheight / 2, 50);
	var tangents = [];
	var points = [];
	var graphics = this.add.graphics({fillStyle: { color: 0xf8facd}});
	var circle = new Phaser.Geom.Circle(scnwidth / 2, scnheight / 2, 75);
	graphics.fillCircleShape(circle);
	
	for (var c = 0; c < 4; c++) {
	    var t = this.curve.getUtoTmapping(c / 4);
	    points.push(this.curve.getPoint(t));
	    tangents.push(this.curve.getTangent(t));
	}
	
	for (c = 0; c < this.max_secpoints; c++) {
	    t = this.curve.getUtoTmapping(c / this.max_secpoints);
	    this.secpoints.push(this.curve.getPoint(t));
	    this.sectangents.push(this.curve.getTangent(t));
	}
	var tempVec = new Phaser.Math.Vector2();
	/*
	var spark0 = this.add.particles('spark0');
	var spark1 = this.add.particles('spark1');
	*/
	var spark0 = this.add.particles('sparks');
	var spark1 = this.add.particles('sparks');
	spark0.setDepth(1);
	spark1.setDepth(1);
	
	for (var i = 0; i < points.length; i++) {
	    var p = points[i];
	    tempVec.copy(tangents[i]).normalizeRightHand().scale(-32).add(p);
	   var angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(p,
				tempVec));
	    var particles = (i % 2 === 0) ? spark0 : spark1;
	    this.mainparticles.push(particles.createEmitter({
		frame: [2, 3],
		x: tempVec.x,
		y: tempVec.y,
		angle: angle,
		speed: { min: -10, max: 50 },
		gravityY: 0,
		scale: { start: 0.3, end: 0 },
		lifespan: 2500,
		blendMode: 'SCREEN'
	    }));
	    si = parseInt(i * (this.max_secpoints / 4));
	    p = this.secpoints[si];
	    tempVec.copy(this.sectangents[si]).normalizeRightHand().scale(-1).add(p);
	    angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(p, tempVec));

	    particles = (i % 2 === 0) ? spark1 : spark0;
	    this.secparticles.push(particles.createEmitter({
		frame: [0, 1, 2, 3, 4],
		cycle: true,
		x: tempVec.x,
		y: tempVec.y,
		angle: angle,
		speed: { min: -10, max: 50 },
		gravitY: 0,
		scale: { start: 0.2, end: 0 },
		lifespan: 1300,
		blendMode: 'SCREEN'
	    }));
	}
	this.input.on('pointerup', function (pointer) {
	    this.scene.scene.stop();
	    this.scene.scene.start("Scene1");
	});
	let cp = this.cloudpoints.shift();

	for (let y = 0; y < 3; y++) {
	    cp = this.cloudpoints.shift();
	    this.cloud[y] = this.add.sprite(cp.x, cp.y, 'cloud' + (y + 1));
	    this.cloud[y].direction = this.randir();
	    this.cloud[y].cloudspeed = (Math.random() * this.max_cloudspeed) + 0.1;
	    this.cloud[y].alpha = 0;
	    this.cloud[y].setDepth(10);
	    this.tweens.add({
		targets: this.cloud[y],
		alpha: 1,
		duration: 2000
	    });
	}

	this.anims.create({
	    key: "solazo",
	    frameRate: 12,
	    frames: this.anims.generateFrameNumbers("solcara",
                      {frames: [0, 1, 2, 3, 4, 5, 6, 0]}),
	    repeat: -1,
	    repeatDelay: 7000
	});
	let solazo = this.add.sprite(400, 250, "solcara");
	solazo.displayHeight = 100;
	solazo.displayWidth = 100;
	solazo.play("solazo");

	this.anims.create({
	    key: "chalupcargo",
	    frames: this.anims.generateFrameNumbers("chalupcargo",
						    { start: 2, end: 5}),
	    frameRate: 7,
	    repeat: -1
	});
	let cargito = this.add.sprite(400, 500, "chalupcargo");
	cargito.displayHeight = 200;
	cargito.displayWidth = 150,
	cargito.setDepth(5);
	cargito.play("chalupcargo");
	this.tweens.add({
	    targets: cargito,
	    y: 280,
	    scaleX: 0.001,
	    scaleY: 0.001,
	    duration: 120000,
	    ease:'Power2',
	    delay: 2000
	});
	var add = this.add;
	var input = this.input;
	WebFont.load({
	    google: {
		families: ['Fascinate', 'Indie Flower']
	    },
	    active: function ()
	    {
			let ywntxt = add.text(scnwidth / 2.9, 0, 'You won!', { fontFamily: 'Fascinate', fontSize: 34, color: '#000'});
		let clkatxt = add.text(scnwidth / 2.8, 35, 'Click anywhere to reset.', { fontFamily: 'Indie Flower', fontSize: 14, color: '#000'});
	ywntxt.depth = 100;
	clkatxt.depth = 100;
		input.once('pointerdown', function () {
		    this.scene.scene.stop();
	            splay(this.scene, "any", "stopall");
		    this.scene.scene.start("Scene1");
		});
	    }
	});
	   // PhaserGUIAction(this);
    }

    update () {
	this.updatet++;

	if ((this.updatet % this.secpoints_step) == 0) {
	    let t = 0;
	    var tempVec = new Phaser.Math.Vector2();
	    var angle;
	    var p;
	    
	    for (let m = 0, si = 0; m < 4; m++) {
		si = ((m * (this.max_secpoints / 4)) + parseInt(this.updatet / this.secpoints_step)) % this.max_secpoints;
		p = this.secpoints[si];
		tempVec.copy(this.sectangents[si]).normalizeRightHand().scale(-32).add(p);
		angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(p, tempVec));
		this.secparticles[m].setPosition(tempVec.x, tempVec.y);
		this.secparticles[m].setAngle(angle);
	    }
	}
	
	for (let i = 0; i < 3; i++) {
	    if (this.cloud[i].x > (scnwidth + 100) || this.cloud[i].x < (0 - 100)) {
		if (this.cloudpoints.length == 0) {
		    break;
		}
		let cp = this.cloudpoints.shift();
		this.cloud[i].x = cp.x;
		this.cloud[i].y = cp.y;
		this.cloud[i].direction = this.randir();
		this.cloud[i].cloudspeed = (Math.random() * this.max_cloudspeed) + 0.1;
		this.cloud[i].alpha = 0;
		this.tweens.add({
		    targets: this.cloud[i],
		    alpha: 1,
		    duration: 2000
		});
	    } else {
		this.cloud[i].x += (this.cloud[i].direction * this.cloud[i].cloudspeed);
	    }
	}
    }
    
    randir() {
	if (Math.random() > 0.5) {
	    return 1;
	} else {
	    return -1;
	}
    }
}
