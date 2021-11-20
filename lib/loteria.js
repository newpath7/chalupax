var LocalServer = false;
var client;
var socket;
import GrayScalePipeline from '../assets/pipelines/GrayScale.js';

function curTime() {
    var dt = new Date();
    var ret = '[' + dt.getHours() + ':' +  dt.getMinutes() + ':';
    ret = ret + dt.getSeconds() + ']';
    return ret;
}

var gs;
var timeline;
var scene = new Phaser.Scene("Scene1");

var config = {
    type: Phaser.AUTO,
    width: scnwidth,
    height: scnheight,
    disableContextMenu: true,
    dom: {
	createContainer: true
    },
    scene: [scene, Winscene],
    parent: "gamearea",
    pipeline: { 'Gray': GrayScalePipeline }
};

var game = new Phaser.Game(config);

scene.preload = function () {
    this.load.image('tablesurface', 'assets/tablesurface.png');
    this.load.image('pointerselect', 'assets/slpo.png');
    this.load.image('cardback', 'assets/cardback.png');
    this.load.image('crowncork', 'assets/crowncork.png');
    this.load.spritesheet('ocards', 'assets/ocards.png',
			  { frameWidth: 206,
			    frameHeight: 365,
			    startFrame: 0, endFrame: 53 });
    this.load.json('cardsinfo', 'assets/cardsinfo.json');
};

scene.create = function() {
    var tablas = [];
    gs.cardsinfo = this.cache.json.get('cardsinfo');
    this.add.image(config.width / 2, config.height / 2, 'tablesurface');
    var cardcaption = this.add.dom(config.width / 3,
				   config.height / 1.2, 'div', null, '');
    this.data.set('cardcaption', cardcaption);
    let pcardback = this.add.sprite(100, 100, 'cardback');
    pcardback.setDisplaySize(gs.dims.tcard.w, gs.dims.tcard.h);
    pcardback.visible = false;
    let cardback = this.add.sprite(100, 100, 'cardback');
    cardback.setDisplaySize(gs.dims.tcard.w, gs.dims.tcard.h);
    cardback.visible = false;
    this.data.set('cardbacksx', cardback.scaleX);
    this.data.set('cardbacksy', cardback.scaleY);
    this.data.set('cardback', cardback);
    this.data.set('pcardback', pcardback);
    let scrowncork = this.add.sprite(config.width / 2, 100, 'crowncork');
    scrowncork.visible = false;
    scrowncork.setInteractive({draggable: true, useHandCursor: true}).on('drag', function (pointer, dragX, dragY) {
	this.setPosition(dragX, dragY);
    });
    this.data.set('scrowncork', scrowncork);
    
    for (var i = 0, r = -1; i < gs.tablas.length; i++) {
	r = (i % 5) == 0 ? r + 1 : r;
	let tx = ((i % 5) * (gs.dims.tabla.w + gs.dims.tablamarg.w));
	tx += (gs.dims.tabla.w / 2) + gs.dims.tablamarg.w;
	let ty = ((r % 4) * (gs.dims.tabla.h + gs.dims.tablamarg.h));
	ty += (gs.dims.tabla.h / 2) + gs.dims.tablamarg.h;
	tablas[i] = this.add.container(tx, ty);
	    
	for (var j = 0, k = -1; j < gs.tablas[i].length; j++) {
	    k = (j % 4) == 0 ? k + 1 : k;
	    let sx = ((j % 4) * (gs.dims.tcard.w + gs.dims.tcardmarg.w));
	    sx += (gs.dims.tcard.w / 2);
	    let sy = ((k % 4) * (gs.dims.tcard.h + gs.dims.tcardmarg.h));
	    sy += (gs.dims.tcard.h / 2);
	    sx -= (gs.dims.tabla.w / 2);
	    sy -= (gs.dims.tabla.h / 2);
	    let sprite = this.add.sprite(sx, sy, 'ocards', gs.tablas[i][j] - 1);
	    sprite.setDisplaySize(gs.dims.tcard.w, gs.dims.tcard.h);
	    sprite.setDataEnabled();
	    sprite.data.set('cardn', gs.tablas[i][j]);
	    tablas[i].add(sprite);
	}
	tablas[i].setSize(gs.dims.tabla.w, gs.dims.tabla.h);
	tablas[i].setData('tbli', i);
	tablas[i].setData('ox', tablas[i].x);
	tablas[i].setData('oy', tablas[i].y);
	tablas[i].setInteractive({useHandCursor: true});
	tablas[i].addListener('pointerover', function () {
	    this.setScale(1.2);
	    var cpoint = new Phaser.Geom.Point(this.x, this.y);
	    var dpoint = new Phaser.Geom.Point(config.width / 2,
					       config.height / 2);
	    var npoint = Phaser.Geom.Point.Interpolate(cpoint, dpoint, 0.2);
	    this.setX(npoint.x);
	    this.setY(npoint.y);
	});
	tablas[i].on('pointerdown', function () {
	    gs.selectTabla(this.getData('tbli') + 1);
	});
	
	tablas[i].on('pointerout', function () {
	    this.setScale(1);
	    this.setX(this.getData('ox'));
	    this.setY(this.getData('oy'));
	});
	tablas[i].visible = false;
    }
    this.data.set('tablas', tablas);
	this.data.set('tablasvis', false);
	this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.setTint(0xff69b4);
	    this.children.bringToTop(gameObject);
        }, this);

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            gameObject.setTint();
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });
    this.input.on('dragenter', function (pointer, gameObject, dropZone) {
	gameObject.setTint(0xff0000);
    });
    this.input.on('dragleave', function (pointer, gameObject, dropZone) {
	gameObject.setTint(0x00ff00);
    });
    this.input.on('drop', function (pointer, gameObject, dropZone) {
	let cardn = dropZone.data.get('cardn');

	if (!gs.cards_played.includes(cardn)) {
	    gameObject.setTint();
	    gameObject.x = gameObject.input.dragStartX;
	    gameObject.y = gameObject.input.dragStartY;
	    
	    return;
	}
	let sclf = dropZone.parentContainer.scale;
	gameObject.x = ((dropZone.x * sclf) + dropZone.parentContainer.x);
	gameObject.y = ((dropZone.y * sclf) + dropZone.parentContainer.y);
	gameObject.disableInteractive();
	let scrowncork = scene.add.sprite(config.width / 2, 100,
					      'crowncork');
	scrowncork.setInteractive({draggable: true,
				   useHandCursor: true}).on('drag',
				function (pointer, dragX, dragY) {
		this.setPosition(dragX, dragY);
	    });
    });

    /* card dealing tweens */
    timeline = this.tweens.createTimeline({
	onLoop: function () {
	    let cardcaption = scene.data.get("cardcaption");
	    let newcap = gs.getCardInfo(gs.current_card);
	    cardcaption.setHTML(newcap);
	    
	},
	onStart: function () {
	    let cardcaption = scene.data.get('cardcaption');
	    cardcaption.visible = true;
	    cardcaption.setHTML(gs.getCardInfo(gs.current_card));
	},
	onComplete: function () {
	    let cardcaption = scene.data.get('cardcaption');
	    cardcaption.visible = false;
	    pbcardback.visible = false;
	},
	loop: 54
    });

    timeline.add({
	targets: cardback,
	scaleX: 0,
	scaleY: this.data.get('cardbacksy') * 1.7,
	x: 200,
	duration: gs.cdtd,
	onComplete: function () {
	    cardback.setTexture('ocards', gs.current_card - 1);
	}
    });
    
    timeline.add({
	targets: cardback,
	scaleX: this.data.get('cardbacksx') * 1.7,
	scaleY: this.data.get('cardbacksy') * 1.7,
	x: 300,
	duration: gs.cdtd
    });

    timeline.add({
	targets: cardback,
	scaleX: 0,
	scaleY: this.data.get('cardbacksy') * 2.4,
	y: 200,
	x: 275,
	duration: gs.cdtd,
	onComplete: function () {
	    cardback.setTexture('cardback');
	}
    });

    timeline.add({
	targets: cardback,
	scaleX: this.data.get('cardbacksx') * 2.4,
	scaleY: this.data.get('cardbacksy') * 2.4,
	y: 340,
	x: 250,
	duration: gs.cdtd
    });

    timeline.add({
	targets: cardback,
	scaleX: 0,
	scaleY: this.data.get('cardbacksy') * 3,
	y: 300,
	x: 225,
	duration: gs.cdtd,
	onComplete: function () {
	    cardback.setTexture('ocards', gs.current_card - 1);
	}
    });

    timeline.add({
	targets: cardback,
	scaleX: this.data.get('cardbacksx') * 3,
	scaleY: this.data.get('cardbacksy') * 3,
	y: 250,
	x: 200,
	duration: gs.cdtd,
	onComplete: function () {
	    timeline.pause();
	}
    });
    /* disappaer card */
    timeline.add({
	delay: gs.cdsc,
	targets: cardback,
	scaleX: 2,
	scaleY: 2,
	alpha: 0.5,
	duration: gs.cdtd * 2,
	onComplete: function () {
	    cardback.scaleX = scene.data.get('cardbacksx');
	    cardback.scaleY = scene.data.get('cardbacksy');
	    cardback.setDisplaySize(gs.dims.tcard.w, gs.dims.tcard.h);
	    cardback.x = 100;
	    cardback.y = 100;
	    cardback.setTexture('cardback');
	    cardback.alpha = 1;
	}
    });
};

scene.update = function () {
    /*
     * Selecting a tabla
     */
    if (gs.phase == "table_selects" || gs.phase == "table_selected") {
	var tablas = this.data.get('tablas');
	if (this.data.get('tablasvis') === false) {
	    for (let i = 0; i < tablas.length; i++) {
		tablas[i].visible = true;
	    }
	    this.data.set('tablasvis', true);
	}
	for (var i = 0; i < tablas.length; i++) {
	    var tbli = tablas[i].getData('tbli') + 1;
	    
	    if (gs.mytabla != tbli &&
		gs.tablasel.find(function (el) { return el[1] == tbli;})) {
		tablas[i].removeInteractive();
		tablas[i].setX(tablas[i].getData('ox'));
		tablas[i].setY(tablas[i].getData('oy'));
		tablas[i].setScale(0.8);
		
		for (let m = 0; m < tablas[i].list.length; m++)
		    tablas[i].list[m].setPipeline(this.renderer.pipelines.get('Gray'));
	    } else if (gs.mytabla == tbli &&
		       gs.tablasel.find(function (el) { return el[1] == tbli; })) {
		tablas[i].removeInteractive();
		tablas[i].setX(tablas[i].getData('ox'));
		tablas[i].setY(tablas[i].getData('oy'));
		tablas[i].setScale(1.4);
		var cpoint = new Phaser.Geom.Point(tablas[i].x, tablas[i].y);
		var dpoint = new Phaser.Geom.Point(config.width / 2,
					       config.height / 2);
		var npoint = Phaser.Geom.Point.Interpolate(cpoint, dpoint, 0.4);
		tablas[i].setX(npoint.x);
		tablas[i].setY(npoint.y);
	    }
	}
    } else if (gs.phase == "shuffle") {
	if (this.data.has("tablas")) {
	    let tablas = this.data.get('tablas');

	    tablas.forEach(function (el, ind) {
		if (ind == (gs.mytabla - 1)) {
 		    el.setX(config.width - (el.displayWidth / 2) - 20);
		    el.setY(config.height - (el.displayHeight / 2) - 20);
		    el.off('pointerover');
		    el.off('pointerdown');
		    el.off('pointerout');
		    scene.data.set('stc', el); /* selected tabla container */

		    for (let i = 0; i < el.list.length; i++) {
			el.list[i].setInteractive();
			el.list[i].input.dropZone = true;
		    }
		  el.setScale(1.5);
		} else {
		    el.destroy();
		}
	    });
	    this.data.remove(['tablas', 'ox', 'oy', 'tbli']);		   
	    let allcards = this.add.container(config.width / 2, config.height /2);
	    allcards.setSize(config.width, config.height);
	    let cardlocs = [];
	    
	    for (var j = 0, k = -1; j < 54; j++) {
		k = (j % 9) == 0 ? k + 1 : k;
		let sx = ((j % 9) * (gs.dims.tcard.w + gs.dims.tcardmarg.w));
		sx += (gs.dims.tcard.w / 2);
		let sy = ((k % 6) * (gs.dims.tcard.h + gs.dims.tcardmarg.h));
		sy += (gs.dims.tcard.h / 2);
		sx -= (config.width / 2);
		sy -= (config.height / 2);
		let sprite = this.add.sprite(sx, sy, 'ocards', j);
		sprite.setDisplaySize(gs.dims.tcard.w, gs.dims.tcard.h);
		allcards.add(sprite);
		cardlocs.push([sx, sy]);
	    }
	    this.data.set('allcards', allcards);
	    this.data.set('allcardslocs', cardlocs);
	} else {
	    var nallcards = this.data.get('allcards');
	    var nallcardslocs = this.data.get('allcardslocs');
	    Phaser.Utils.Array.Shuffle(nallcardslocs);
	    
	    for (var j = 0; j < nallcards.list.length; j++) {
		nallcards.list[j].setX(nallcardslocs[j][0]);
		nallcards.list[j].setY(nallcardslocs[j][1]);
	    }
	}
    } else if (gs.phase == "cantando") {
	if (this.data.get('allcards')) {
	    var nallcards = this.data.get('allcards');
	    var tween = this.tweens.add({
		targets:  nallcards.list,
		scale: 0.01,
		ease: 'linear',
		duration: 1000,
		delay: this.tweens.stagger(20,
				       { from: 'center',
					 ease: 'cubic.out' }),
		onComplete: function () {
		nallcards.list.forEach(function(element) {
			element.visible = false;
		});
		    gs.cantar();
		}
	    });
	    this.data.remove(['allcards', 'allcardslocs']);
	    let cardback = this.data.get('cardback');
	    let pcardback = this.data.get('pcardback');
	    let scrowncork = this.data.get('scrowncork');
	    jQuery("#buenabtn").css("visibility", "visible");
	    cardback.visible = true;
	    pcardback.visible = true;
	    scrowncork.visible = true;
	    
	    if (gs.isHost) {
		jQuery("#pausebtn").css('visibility', 'visible');
	    }
	}
    } else if (gs.phase == "end") {
	jQuery("#joingame").html('Join game');
	jQuery("#joingame").prop("disabled", false);
	scene.scene.start();
    }
};

var gs = { // game state
    wg: 15000,	// 15k milliseconds
    ac: 5000,   // interval between sending hosting game message
   // at: 30000,
    at: 20000,  // total time sending hosting game message
    cw: 10000,   // interval between each canto
    tslw: 3000,  // table selected? wait for answer
    cdtd: 250,  // card dealing timeline duration (8 times before repeat)
    cdsc: 0, // 8010 cw - (cdtd * 8) - 1000 card dealing show card time
    ntablas: 16,
    gid: 0, // game id
    rid: "", // room id
    uid: "",
    phase: "",
    phasepause: false,
    cardsinfo: [], // load title/caption of each card from JSON file
    players: [],
    rands: [],
    tablasel: [],
    buenaslog: [],
    mytabla: 0,
    myrandseed: "",
    randseed: "",
    isHost: false,
    toc: Date.now(),
    cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
	    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
	    29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
	    42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
    tablas: [[41, 42, 37, 38, 50, 51, 46, 47, 5, 6, 1, 2, 14, 15, 10, 11],
	     [40, 23, 4, 5, 27, 28, 9, 30, 32, 13, 34, 35, 37, 18, 39, 22],
	     [1, 2, 3, 4, 10, 11, 12, 13, 19, 20, 21, 22, 28, 29, 30, 31],
	     [6, 7, 8, 9, 15, 16, 17, 18, 24, 25, 26, 27, 33, 34, 35, 36],
	     [2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20],
	     [43, 44, 45, 21, 52, 53, 54, 26, 7, 8, 9, 31, 16, 17, 18, 36],
	     [22, 23, 24, 25, 27, 28, 29, 30, 32, 33, 34, 35, 37, 38, 39, 40],
	     [21, 22, 23, 24, 30, 31, 32, 33, 39, 40, 41, 42, 48, 49, 50, 51],
	     [25, 26, 27, 41, 34, 35, 36, 46, 43, 44, 45, 51, 52, 53, 54, 32],
	     [42, 43, 44, 45, 47, 48, 49, 50, 52, 53, 54, 1, 40, 10, 19, 30]],
    dims: { card: { w: 206, h: 365},
	    tcard: { w: 32, h: 55 },
	    tcardscl: { w: 0.15, h: 0.15}, 
	    tabla: { w: 150, h: 240 },
	    tablamarg: {w: 10, h: 10 },
	    tcardmarg: {w: 5, h: 5}},
    cards_played: [],
    current_card: 0,

    init: function () {
	this.cards_played = [];
	this.current_card = 0;
	this.gid = 0;
	this.phase = "";
	this.phasepause = false;
	this.players = [];
	this.rands = [];
	this.tablasel = [];
	this.mytabla = 0;
	this.myrandseed = "";
	this.randseed = "";
	this.isHost =  false;
	this.toc = Date.now();
	this.buenaslog = [];
    },
    
    sndMsg: function (msg) {
	var smsg = {"msgtype": "m.text", "body": msg};

	if (LocalServer == true) {
			socket.send(JSON.stringify({cmd: "send", data: {rid: this.rid, data: smsg}}));
			console.log("sndMsg (via LocalSever): msg sent");
			return;
	}
	client.sendMessage(this.rid, smsg).then(function () {
	    console.log("sndMsg: msg sent");
	}, function (err) {
	    console.error("sndMsg: err %s", JSON.stringify(err));
	});
    },

    rcvMsg: async function (sndr, msg) {
	if (sndr == this.uid) {
	    console.log("rcvMsg: ignoring msg from " + sndr);
	    return;
	}
	console.log("rcvMsg: (From " + sndr + ") Received " + msg);
	
	if (msg.search("!!") != 0) {
	/*    console.log("rcvMsg: not game command"); */
	    return;
	}
	var msge = msg.split(" ");
	msge.shift();
	console.log("Current phase is %s", this.phase);
	
	switch (this.phase) {
	case "start_wait_an":
	    console.log(msge);
	    if (msge[0] == "HS") {
		this.gid = msge[1];
		this.sndMsg("!! JN", this.gid);
		this.phase = "join_wait_sr";
		jQuery('#status').prepend(curTime() + ' Joined game (id ' + this.gid + ') hosted by ' + sndr + '<br />');
	    }
	    break;
	case "join_wait_sr":
	    if (msge[0] == "SR") {
		console.log("SR received");
		this.phase = "table_selects";
		msge.shift();
		this.players = msge;
		jQuery('#status').prepend(curTime() + ' Game started with players ' + this.players.join(", ") + '<br />');
	    }
	    break;    
	case "start_hosting":
	    if (msge[0] == "JN" && msge[1] == this.gid) {
		if (!this.players.find(function (el) {return el == sndr;})) {
		    this.players.push(sndr);
		}
		console.log("%s added to players", sndr, "[" + this.players + "]");
		this.sndMsg(sndr + " added to game");
		jQuery('#status').prepend(curTime() + ' ' + sndr + ' added to game<br />');
	    }
	    break;
	case "table_selects":
	case "table_selected":
	    if (msge[0] == "TASL") {
		console.log("That table has already been selected.");
		break;
	    }
	    if (msge[0] == "SL") {
		if (!this.tablasel.find(function (el) { return el[0] == sndr})) {
		    if (!this.tablasel.find(function (el) { return el[1] == msge[1];})) {
			console.log("%s selected %s", sndr, msge[1]);
			this.tablasel.push([sndr, msge[1]]);
			let promise = new Promise((resolve, reject) => {
			    setTimeout(() => resolve('done!'), this.tslw)
			});
			let result = await promise;
		    } else {
			console.log("%s table already selected", msge[1]);
			this.sndMsg(msge[1] + " table already selected by " + sndr);
			this.sndMsg("!! TASL" + msge[1]);
			break;
		    }
		} else {
		    console.log("%s has already selected a table", sndr);
		    this.sndMsg(sndr + " has  already selected a table");
		    break;
		}
	    }
	    console.log("tables selected: %s and # players are %s", this.tablasel.length, this.players.length);
	    
	    if (this.tablasel.length == this.players.length) {
		jQuery('#status').prepend(curTime() + ' Shuffling<br />');
		this.sndMsg("!! SHUFFLIING");

		if (!this.myrandseed) {
		    this.myrandseed = CryptoJS.MD5(JSON.stringify(this) + Math.floor(Date.now() / 1000));
		    this.rands.push(this.myrandseed);
		    console.log("this.rands.length ", this.rands.length);
		}
		if (!this.isHost)
		    this.sndMsg("!! GR " + this.myrandseed);
		this.phase = "shuffle";
	    }
	    break;
	case "shuffle":
	    if (this.isHost && sndr != this.uid)
	    {
		if (msge[0] == "GR") { // should also check if sndr has already sent
		    this.rands.push(msge[1]);
		    console.log("rcvMsg: pushed random seed " + msge[1]);
		    console.log("rands.length: %d and players.length %d", this.rands.length, this.players.length);
		    
		    if (this.rands.length == this.players.length) {
			this.sndMsg("!! HOSTGR: " + this.myrandseed); // make no hanky panky
			this.randseed = CryptoJS.MD5(JSON.stringify(this.myrandseed + this.rands.join('')));
			shuffle(this.cards, this.randseed);
			console.log("after shuffle");
			this.phase = "cantando";
			jQuery('#status').prepend(curTime() + ' Cantando<br />');
			console.log("rcvMsg: hosting and sent shuffled cards " + this.cards.join(' '));
			console.log("rcvMsg: now cantando");
			this.sndMsg("!! CS " + this.cards.join(' '));
		    }
		}
	    } else {
		if (msge[0] == "CS") {
		    msge.shift();
		    this.cards = msge.map(function(e){ return +e});
		    this.phase = "cantando";
		    jQuery('#status').prepend(curTime() + ' Cantando<br />');
		    console.log("rcvMsg: got card sequence " + msge);
		    console.log("rcvMsg: now cantando");
		}
	    }
	    break;
	case "cantando":
	    if (msge[0] == "BU") {
		console.log("rcvMsg: got BU from " + sndr + " and checking to see if actually won");
		let [buenatime, nxtbuenasec] = gs.buenaAllowed(gs.uid);

		if (!buenatime) {
		    jQuery('#status').prepend(curTime() + ' ' + (nxtbuenasec / 1000) + " seconds until next buena allowed for " + gs.uid);
		    break;
		}
		
 		if (this.getBuena(sndr)) {
		    this.logWin(sndr);
		}
	    } else if (msge[0] == "EN") {
		this.exitedGame(sndr);
	    } else if (msge[0] == "PAUSE") {
		this.requestPause(sndr);
	    } else if (!gs.isHost && msge[0] == "WON" && msge[1] == gs.uid) {
		jQuery('#status').prepend(curTime() + ' Win confirmation received.<br />');
		gs.saveScore(gs.players, gs.isHost, true);
		this.phase = "end";
		scene.scene.stop();
		scene.scene.start("winscene");
	    }
	    break;
	case "paused":
	    if (msge[0] == "UNPAUSE") {
		jQuery('#status').prepend(curTime() + ' ' + sndr + ' unpaused game.<br />');
		jQuery('#status').prepend(curTime() + ' Cantando<br />');
		this.phasepause = false;
	    }
	    break;
	    
	case "end":
	    console.log("The End");
	    gs.showScoreTable();
	    break;
	    
	default:
	}
    },

    selectTabla: async function (n) {
	n = n + 0;
	this.sndMsg("!! SL " +  n);

	if (!this.isHost) {
	       let promise = new Promise((resolve, reject) => {
		   setTimeout(() => resolve('done!'), this.tslw)
	       });
	    let result = await promise;
	}

	var thisuid = this.uid;
	console.log("this.uid is", thisuid);
	if (!this.tablasel.find(function (el) { return el[0] == thisuid;})) {
	    if (!this.tablasel.find(function (el) { return el[1] == n;})) {
		this.tablasel.push([this.uid, n]);
		this.mytabla = n;

		if (!this.myrandsed) {
		    this.myrandseed = CryptoJS.MD5(JSON.stringify(this) + Math.floor(Date.now() / 1000));
		    this.rands.push(this.myrandseed);
		    console.log("(from selecTabla this.rands.length:  ", this.rands.length);
		}
		/* pause a bit to show last selected table */
		let promise = new Promise((resolve, reject) => {
		   setTimeout(() => resolve('done!'), this.tslw)
		});
		let result = await promise;
		this.phase = this.tablasel.length == this.players.length ? "shuffle" : "table_selected";
		console.log("pushed [%s, %d]", this.uid, n);
	    }
	}
    },

    cantar: async function() {
	while (this.phase == "cantando" && this.cards.length > 0) {
	    if (!this.phasepause) {
		this.current_card = this.cards.shift();
		this.cards_played.push(this.current_card);
		console.log("cantar: current card is " + this.current_card);
		if (gs.isHost)
		    this.sndMsg("!! CCARD " + this.current_card);

		if (!timeline.isPlaying()) {
		    if (this.cards_played.length == 1) {
			timeline.play();
		    } else {
			timeline.resume();
		    }
		}
	    }
	    let promise = new Promise((resolve, reject) => {
		setTimeout(() => resolve('done!'), this.cw)
	    });
	    let result = await promise;
	}
	
	if (this.cards.length == 0) {
	    this.msgYouSleeping();
	}
    },

/*
 * Is Buena requests correctly timed out?
 * Allowed time between buenas requests increase by a geometric progression
 */
    buenaAllowed: function (claimer) {
	let dt = new Date().getTime();
	let retval = false;
	let timeleft = 0;
	
	if (this.buenaslog[claimer] == null) {
	    this.buenaslog[claimer] = { n: 1, ts: dt, nxt: (2 * this.cw) };
	    retval = true;
	    timeleft = this.buenaslog[claimer].nxt;
	    console.log("buenaslog was null");
	} else {
	    console.log("buenaAllowed: dt", dt, " ts", this.buenaslog[claimer].ts, " nxt ", this.buenaslog[claimer].nxt);
	    if ((dt - this.buenaslog[claimer].ts) >= this.buenaslog[claimer].nxt) {
		this.buenaslog[claimer] = { n: this.buenaslog[claimer].n + 1,
					    ts: dt, nxt: (this.buenaslog[claimer].nxt * 2) };
		retval = true;
		timeleft = this.buenaslog[claimer].nxt;
		console.log("buenaslog was not null and time has elapsed");
	    } else {
		timeleft = this.buenaslog[claimer].nxt - (dt - this.buenaslog[claimer].ts);
		console.log("buenaslog was not null and time has not elapsed");
	    }
	}
	return [retval, timeleft];
    },
/*
 * Waits for a claim of "Buena"
 * verifies that "Buena" is valid, updates game state
 * and returns true if valid
 */
    getBuena: function (claimer) {
	return this.tablasel.find(function (el) {
	    console.log("getBuena: is claimer == " + el[0] + "   " + el[1] + "?");
	    if (el[0] == claimer) {
		var possible = true;
		possible = gs.cards_played.some(function (item, index) {
		    let itemin = gs.tablas[el[1] - 1].find(function (il) {
			return il == item;
		    });
		    if (itemin == null)
			return false;
		    else
			return true;
		});
		
		if (possible) {
		    console.log("getBuena: BU possible. Checking if winning.");
		    if (gs.isWinning(parseInt(el[1] - 1))) {
			return true;
		    }
		} else {
		    console.log("getBuena: BU not possible yet");
		    
		    return false;
		}
	    }
	});
    },
    
    isWinning: function (tind) {
	var windices = [[0, 1, 2, 3], [4, 5, 6, 7],
			[8, 9, 10, 11], [12, 13, 14, 15],
			[0, 4, 8, 12], [1, 5, 9, 13],
			[2, 6, 10, 14], [3, 7, 11, 15],
			[0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
			[4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
			[8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15],
			[0, 3, 12, 15]];
	for (var i = 0; i < windices.length; i++) {
	    var k = 0;
	    
	    for (var j = 0; j < windices[i].length; j++) {
		var outs = "Windex_i: " + i;
		
		for (var m = 0; m < this.cards_played.length; m++) {
		    let posv = this.tablas[tind][windices[i][j]];
		    let cpm = this.cards_played[m];
		    outs += " " + posv + "=" + cpm + ",";
		    if (cpm == posv) {
			k++;
		    }
		    if (k > 3) {
			return true;
		    }
		}
	    }
	}
	return false;
    },
/*
 * Send message tp everyone saying that they were sleeping
 * as all cards have been drawn
 */
    msgYouSleeping: function () {
	jQuery('#status').prepend(curTime() + ' You were sleeping!<br />');
	gs.saveScore(gs.players, gs.isHost, false);
	this.phase = "end";
    },
    
    requestPause: function (plr) {
	jQuery('#status').prepend(curTime() + ' ' + plr + ' requested paused. Now pausing.<br />');
	this.phasepause = true;
    },

/*
 * When a player leaves
 */    
    exitedGame: function (plr) {
	jQuery('#status').prepend(curTime() + ' ' + plr + ' has exited.<br />');
	this.phase = "end";
    },
    
    logWin: function (plr) {
	gs.sndMsg("!! WON", plr);
	jQuery('#status').prepend(curTime() + ' ' + plr + ' won!<br />');
	this.phase = "end";
    },
   
    startGame: async function () {
	var j = 0;
	jQuery('#status').prepend(curTime() + ' Waiting for game announcements.<br />');
 	let promise = new Promise((resolve, reject) => {
	    setTimeout(() => resolve('done!'), this.wg)
	});
	let result = await promise;
	    
	if (this.phase == "start_wait_an") {
	    this.players.push(this.uid);
	    this.gid = Math.ceil(Math.random() * 10);
	    jQuery('#status').prepend(curTime() + ' No announcements. Hosting game instead (' + this.gid + ').<br />');	    
	    console.log("startGame: hosting game instead, id %s", this.gid);
	    this.phase = "start_hosting";
	    this.isHost = true;
	    
	    for (let i = 0; i < this.at; i += this.ac) {
		j++;
		console.log("ac: %d and at: %d and i: %d", this.ac, this.at, i);
		console.log("startGame: sending HS " + this.gid + " (" + Date.now() + ") #" + j);
		this.sndMsg("!! HS " + this.gid);
		let promise = new Promise((resolve, reject) => {
		    setTimeout(() => resolve("done!"), this.ac)
		});
		let result = await promise;
	    }
	}

	if (this.players.length > 1) {
	    console.log("startGame: game started %s", this.players);
	    jQuery('#status').prepend(curTime() + ' Game started with ' + this.players + "<br />Select your chalupa table.<br />");
	    
	    if (this.phase == "start_hosting") {
		this.sndMsg("!! SR " + this.players.join(' '));
		this.phase = "table_selects";
	    }
	} else {
	    if (this.isHost) {
	    jQuery('#status').prepend(curTime() + ' No one joined. Ending.<br />');
		this.phase = "end";
	    }
	}
	return;
    },

    getCardInfo: function (n) {
	var retstr = "";
	
	for (let i = 0; i < 54; i++) {
	    if (gs.cardsinfo[i].id == n) {
		retstr = '<h1>' + gs.cardsinfo[i].name + '</h1>';
		retstr += gs.cardsinfo[i].desc;
		break;
	    }
	}
	return retstr;
    },

    saveScore: function (players, hosting, won) {
	let scorelog = localStorage.getItem('chalupax.scorelog');

	if (!scorelog)
	    scorelog = [];
	else
	    scorelog = JSON.parse(scorelog);
	scorelog.push({ts: new Date(), players: players, hosting: hosting,
		       won: won});
	localStorage.setItem('chalupax.scorelog', JSON.stringify(scorelog));
	gs.showScoreTable();
    },

    showScoreTable: function () {
	let scorelog = JSON.parse(localStorage.getItem('chalupax.scorelog'));
	let i = 1;

	if (!scorelog)
	    return "";
	else {
	    let html = '<table id="score">';
	    html += '<tr><th>Time</th><th>Participants</th><th>Result</th></tr>';
	    scorelog.sort((a, b) => {
		if (a.ts > b.ts)
		    return -1;
		else if (b.ts > a.ts)
		    return 1;
		return 0;
	    });
	    
	    scorelog.forEach((score) => {
		html += '<tr><td>' + score.ts + '</td>';
		html += '<td>' + score.players.join(", ") + '</td>';
		html += '<td>' + (score.won ? 'won' : 'loss') + '</td></tr>';
		i++;
		
		if (i > 5)
		    return;
	    });
	    html += '</table>';
	    jQuery('#scoreboard').html('<span id="glt">Chalupa log</span>' + html);
	}
    }
};

/*
 * Donald Knuth's version of Fisher & Yates algo
 * Copied from Nitin Patel's Medium.Com article citation
 * Modified to use a seeded PNRG
 */
function shuffle(array, seed) {
    var myrng = new Math.seedrandom(seed);
    
    for (let i = array.length - 1; i > 0; i--) {
	const j = Math.floor(myrng() * i);
	const temp = array[i];
	array[i] = array[j];
	array[j] = temp;
    }
}

jQuery(document).ready(function ()  {
    if (jQuery("#uselocalsrv").is(":checked")) {
	    LocalServer = true;
    } else {
	    LocalServer = false;
    }
    gs.showScoreTable();

    jQuery("#buenabtn").on('click', function (e) {
	let [buenatime, nxtbuenasec] = gs.buenaAllowed(gs.uid);
	let gbuenares = false;
	
	if (buenatime) {
	    gs.sndMsg("!! BU ");
	    gbuenares = gs.getBuena(gs.uid);
	    
	    if (gbuenares)
	    	jQuery('#status').prepend(curTime() + ' You win. Waiting for confirmation.<br />');
	    if (gs.isHost && gbuenares) {
		gs.logWin(gs.uid);
		gs.saveScore(gs.players, gs.isHost, true);
		scene.scene.stop();
		scene.scene.start("winscene");
	    }
	}
	if (!gbuenares)
	    jQuery('#status').prepend(curTime() + ' ' + (nxtbuenasec / 1000) + " seconds until next buena allowed for " + gs.uid + '<br />');
    });
    jQuery("#pausebtn").on('click', function (e) {
	if (scene.scene.isActive()) {
	    gs.phasepause = true;
	    scene.scene.pause();
	    jQuery('#pausebtn').html('Unpause');
	} else {
	    gs.phasepause = false;
	    scene.scene.resume();
	    jQuery('#pausebtn').html('Pause');
	}	
    });
    jQuery("#joingame").on('click', function (e) {
	if (jQuery("#uselocalsrv").is(":checked")) {
		    LocalServer = true;
    	} else {
	    	LocalServer = false;
    	}
	gs.rid = jQuery('#targetroom').val().trim();
	gs.uid = jQuery('#username').val().trim().toLowerCase();

	    
	if (!LocalServer) {
		if (client === undefined) {
			client = matrixcs.createClient("http://matrix.org");
		}
	} else {
		if (socket === undefined) {
			socket = new WebSocket('ws://' + self.location.hostname + ':8081/chalu');
			socket.onopen = function () {
				console.log("ws.socket.onopen");
				let ouser = jQuery("#username").val().trim().toLowerCase();
				let opassword = jQuery("#password").val();
				let oroom = jQuery("#targetroom").val().trim();
			socket.send(JSON.stringify({cmd: "joingame",
				data: {user: ouser,
					password: opassword,
					room: oroom
				}}));
			console.log("joingame (via LocalServer)");
			scene.scene.start();
			gs.init();
			gs.phase = "start_wait_an";
			gs.startGame();
			jQuery("#joingame").prop("disabled", true);
			};

			socket.onmessage = function(event) {
				const obj = JSON.parse(event.data);

				if (obj.cmd == "rcv") {
					gs.rcvMsg(obj.data.userId, obj.data.body);
				}
			};
			socket.onclose = function(event) {
				console.log("socketClose");
			};

			socket.onerror = function(event) {
				console.log("socketerror");
			};
		}
	}

	if (!LocalServer && !client.getAccessToken()) {
	    client.login("m.login.password", {
		"user": gs.uid,
		"password": jQuery('#password').val()
	    }).then((err, response) => {
		console.log("Connected to server...");
		client.startClient();
		client.once('sync', function(state, prevState, res) {
		    console.log("Sync state: " + state);
		    if (state == "PREPARED") {
			console.log("adding room.timeline");
			scene.scene.start();
			gs.init();
			gs.phase = "start_wait_an";
			gs.startGame();
			jQuery("#joingame").prop("disabled", true);
		client.on("Room.timeline", function(event, room, toStartOfTimeline) {
		    if (event.getType() != "m.room.message") {
			return;
		    }
		    if (event.getRoomId() == gs.rid) {
			gs.rcvMsg(event.sender.userId,
				  event.event.content.body);
		    }
		});
		} else {
		    console.log("Could not immediately sync with Matrix. Please try to login again");
		    jQuery('#status').prepend(curTime() + ' Could not immediately sync<br />');
		
		}});
	    });
	}
    });
});
