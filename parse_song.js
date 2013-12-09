#!/usr/bin/env node

var fs = require("fs");
//var data = fs.readFileSync("Ramblin' Wreck.midi",'binary');
//var data = fs.readFileSync("chno0902.mid",'binary');
//var data = fs.readFileSync("jasmid/for_elise_by_beethoven.mid", 'binary');
var data = fs.readFileSync("jasmid/beethoven-fur_elise.mid");
//console.log(data);
var t = data;
var ff = [];
var mx = t.length;
var scc= String.fromCharCode;
for (var z = 0; z < mx; z++) {
	ff[z] = scc(t.charCodeAt(z) & 255);
//	if(z < 30) console.log(t.charCodeAt(z));
}
data = ff.join("");
//console.log(data);
eval(fs.readFileSync("jasmid/stream.js")+'');
eval(fs.readFileSync('jasmid/midifile.js')+'');
eval(fs.readFileSync('jasmid/replayer.js')+'');
eval(fs.readFileSync('jasmid/synth.js')+'');

var song = MidiFile(data);
console.log(song.header);

for(var i = 0; i < song.tracks[1].length; i++){
	var o = song.tracks[1][i];
	if(o.type == "channel" && o.subtype == "noteOff" && o.deltaTime > 0){
		//console.log(o);
		console.log('[' + o.noteNumber + ', ' + '0, ' + '0, ' + '0, ' + o.deltaTime  + '],');
	}
}
