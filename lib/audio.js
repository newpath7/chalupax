
function splay(thiso, a) {
	if (!useaudio) {
		return;
	}
	console.log("Playing " + a);
	thiso.sound.play(a);
}
/*
function addAudios(thiso) {
	let audios = ["pong"];

	for (audio in audios) {
		thiso.sound.add(audio);
	}
}
*/
function preloadAudio(thiso) {
	thiso.load.audio('pong', ['assets/audio/pong.ogg',
		'assets/audio/pong.mp3']);
}
