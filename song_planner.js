var fs = require('fs');

//var song1 = eval(fs.readFileSync("songarrayFurElise")+'');
var song1 = eval(fs.readFileSync("songarrayFurElise2")+'');
//var song1 = eval(fs.readFileSync("songarrayRamble")+'');

function collide(arm1, arm2, note1, note2){
	if(arm1 == arm2) {
		return true;
	} else if(arm1 == 1 && arm2 == 2 || arm1 == 2 && arm2 == 1 || arm1 == 3 && arm2 == 4 || arm1 == 4 && arm2 == 3) {
		return Math.abs(note1 - note2) <= 2
	} else if(arm1 == 2 && arm2 == 3 || arm1 == 3 && arm2 == 2){
		return Math.abs(note1 - note2) <= 4;
	} else {
		return false;
	}
}

function anyCollide(positions){
	for(var i = 0; i < positions.length - 1; i++){
		if(collide(i + 1, i + 2, positions[i], positions[i + 1])){
			return true;
		}
	}
	return false;
}

function smallestIndex(index, arr){
	for(var i = 0; i < arr.length;i++){
		if(arr[index] > arr[i]){
			return false;
		}
	}
	return true;
}

function closestArm(positions, note){
	var distances = [Math.abs(positions[0] - note), Math.abs(positions[1] - note), 
			Math.abs(positions[2] - note), Math.abs(positions[3] - note)];
	if(smallestIndex(0, distances)){
		return 1;
	} else if(smallestIndex(1, distances)){
		return 1
	} else if(smallestIndex(2, distances)){
		return 2;
	} else {
		return 4;
	}
}

function playingNotes(notes){
	var playing = [];
	for(var i = 0; i < notes.length;i++){
		if(notes[i] != 0){
			playing.push(notes[i])
		}
	}
	playing.sort();
	return playing;
}

function linearOrdering(positions){
	for(var i = 0; i < positions.length - 1;i++){
		if(positions[i] >= positions[i + 1]){
			return false;
		}
	}
	return true;
}

var Queue = function (){
	var arr1 = [];
	var arr2 = [];

	this.push = function (item){
		arr1.push(item);
	};

	this.pop = function (){
		if(arr2.length > 0){
			return arr2.pop();
		} else {
			while(arr1.length > 0){
				arr2.push(arr1.pop());
			}
			return arr2.pop();
		}
	};
	
	this.length = function(){
		return arr1.length + arr2.length;
	};
}

function containsAll(arr, test){
	for(var i = 0; i < test.length; i++){
		if(arr.indexOf(test[i]) == -1){
			return false;
		}
	}
	return true;
}

function l2Distance2(arr1, arr2){
	var distance2 = 0;
	var length = Math.min(arr1.length, arr2.length);
	for(var i = 0; i < length; i++){
		distance2 += Math.pow(arr1[i] - arr2[i], 2);
	}
	return distance2;
}

function velocities(positions, notes){
	var velocities = [0, 0, 0, 0];
	for(var i = 0; i < notes.length; i++){
		for(var j = 0; j < positions.length; j++){
			if(positions[j] == notes[i]){
				velocities[j] = 10;
			}
		}
	}
	return velocities;
}

function minCostNextState(oldPositions, songData, songIndex){
	var minNote = 36;
	var maxNote = 83;
	var notes = playingNotes(songData.slice(0, 4));
	var minDistance = Math.pow(48, 4);
	var minPositions = [-1, -1, -1, -1];
	var minVelocities = [-1, -1, -1, -1];
	for(var i = minNote; i <= maxNote; i++){
		for(var j = i + 1; j < maxNote; j++){
			for(var k = j + 1; k < maxNote; k++){
				for(var l = k + 1; l < maxNote; l++){
					var possibility = [i, j, k, l];
					if(containsAll(possibility, notes) && !anyCollide(possibility)){
						var distance = l2Distance2(possibility, oldPositions);
						if(distance < minDistance){
							minDistance = distance;
							minPositions = possibility;
							minVelocities = velocities(possibility, notes);
						}
					}
				}
			}
		}
	}
	return minPositions.concat(minVelocities).concat([songData[4]]).concat([songIndex]);
}

function dfsAstar(song, arm_positions){
	var ds = [];
	ds.push([arm_positions[0], arm_positions[1], arm_positions[2], arm_positions[3], 0, 0, 0, 0, 0, 0]);
	var visited = [];
	while(ds.length > 0){
		var current = ds.pop();
		var songIndex = current[9];
		if(typeof visited[songIndex] == 'undefined'){
			visited[songIndex] = current.slice(0, 9);
		} else {
			continue;
		}
		if(visited.length >= song.length){
			return visited;
		}
		var next = minCostNextState(current.slice(0, 4), song[songIndex], songIndex + 1);
		ds.push(next);
	}
	return null;
}

function onlineDfsAstar(songData, arm_positions){
	return minCostNextState(arm_positions.slice(0, 4), songData, -1).slice(0, 9);
}

console.log(dfsAstar(song1, [68, 70, 74, 76]));
//console.log(onlineDfsAstar([0, 0, 0, 0, 350], [68, 70, 74, 76]));











