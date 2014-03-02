#!/usr/bin/env node

var fs = require("fs");
var data = fs.readFileSync("jasmid/Ramblin' Wreck.midi",'binary');
//var data = fs.readFileSync("jasmid/chno0902.mid",'binary');
//var data = fs.readFileSync("jasmid/for_elise_by_beethoven.mid", 'binary');
//var data = fs.readFileSync("jasmid/beethoven-fur_elise.mid", 'binary');
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

var song = MidiFile(data);
var tpb = song.header.ticksPerBeat;
var trackCount = song.header.trackCount;
var maxLength = 0;
var trackIndices = [];
var trackTimes = [];
for(var i = 0; i < trackCount;i++){
	maxLength += song.tracks[i].length;
	trackIndices[i] = 0;
	trackTimes[i] = 0;
}
var minNote = 48;
var maxNote = 95;
var time = 0;

function normalizeTime(eventTime){
	return Math.round((eventTime - time) / tpb * 1000);
}

var outputNotes = [];
var outputTime = [];
var outputIndex = -1;

for(var i = 0; i < maxLength;i++){
	var nextIndex = -1;
	var nextTime = 999999999;
	for(var j = 0; j < trackCount;j++){
		if(trackIndices[j] < song.tracks[j].length){
			var trackTime = trackTimes[j] + song.tracks[j][trackIndices[j]].deltaTime;
			if(trackTime < nextTime){
				nextIndex = j;
				nextTime = trackTime;
			}
		}
	}
	var o = song.tracks[nextIndex][trackIndices[nextIndex]];
	if(o.type == "channel" && o.subtype == "noteOff"){
		var deltaTime = normalizeTime(nextTime);
		if(deltaTime == 0){
			if(outputNotes[outputIndex].indexOf(o.noteNumber) == -1 && 
					outputNotes[outputIndex].length < 4 && o.noteNumber <= maxNote && o.noteNumber >= minNote){
				outputNotes[outputIndex].push(o.noteNumber);
			}
		} else {
			outputIndex++;
			if(o.noteNumber <= maxNote && o.noteNumber >= minNote){
				outputNotes[outputIndex] = [o.noteNumber];
			} else {
				outputNotes[outputIndex] = [0];
			}
			outputTime[outputIndex] = deltaTime;
		}
	}
	trackTimes[nextIndex] += o.deltaTime;
	time = Math.min(time + o.deltaTime, nextTime);
	trackIndices[nextIndex]++;
}
var output = [];
for(var i = 0; i <= outputIndex;i++){
	while(outputNotes[i].length < 4){
		outputNotes[i].push(0);
	}
	output.push(outputNotes[i].concat(outputTime[i]));
}

console.log(output);
/*
for(var i = 0; i < song.tracks[1].length; i++){
	var o = song.tracks[1][i];
	if(o.type == "channel" && o.subtype == "noteOff" && o.deltaTime > 0){
		//console.log(o);
		console.log('[' + o.noteNumber + ', ' + '0, ' + '0, ' + '0, ' + o.deltaTime  + '],');
	}
}*/













