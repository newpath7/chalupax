
function splay(thiso, a, action="start", conf) {
	if (!useaudio) {
		return;
	}

	switch (action) {
		case "start":
			thiso.sound.play(a);
			break;
		case "stop":
			thiso.sound.stopByKey(a);
			break;
		case "stopall":
			thiso.sound.stopAll();
			break;
		case "startwc":
		default:
			thiso.sound.play(a, conf);
			break;
	}
}

function preloadAudio(thiso) {
	/*
	 * - Modified sound clips Creative Common 0 Licensed from freesound.org
	 * - Ganymede from NASA
	 */
	thiso.load.audio('accordion', ['assets/audio/accordion.ogg', 'assets/audio/accordion.mp3']);
	thiso.load.audio('bees', ['assets/audio/bees.ogg', 'assets/audio/bees.mp3']);
	thiso.load.audio('bells', ['assets/audio/bells.ogg', 'assets/audio/bells.mp3']);
	thiso.load.audio('ganymede', ['assets/audio/ganymede.ogg', 'assets/audio/ganymede.mp3']);
	thiso.load.audio('gavel', ['assets/audio/gavel.ogg', 'assets/audio/gavel.mp3']);
	thiso.load.audio('gong', ['assets/audio/gong.ogg', 'assets/audio/gong.mp3']);
	thiso.load.audio('pop', ['assets/audio/pop.ogg', 'assets/audio/pop.mp3']);
	thiso.load.audio('vendedora', ['assets/audio/vendedora.ogg', 'assets/audio/vendedora.mp3']);
	thiso.load.audio('wawa', ['assets/audio/wawa.ogg', 'assets/audio/wawa.mp3']);
	thiso.load.audio('zap1', ['assets/audio/zap1.ogg', 'assets/audio/zap1.mp3']);
	thiso.load.audio('zap2', ['assets/audio/zap2.ogg', 'assets/audio/zap2.mp3']);
	thiso.load.audio('mariachi', ['assets/audio/mariachi.ogg', 'assets/audio/mariachi.mp3']);
}
