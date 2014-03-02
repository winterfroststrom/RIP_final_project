var fs = require('fs');

function loadSong(file){
	return eval(fs.readFileSync(file)+'');
}

//var song1 = eval(fs.readFileSync("songarrayFurElise")+'');
var song1 = eval(fs.readFileSync("songarrayFurElise2")+'');
//var song1 = eval(fs.readFileSync("songarray_elise", 'utf8'));
//var song1 = loadSong("elise_first.txt");
//var song1 = loadSong("ramblinArray.txt");
//var song1 = eval(fs.readFileSync("songarray2FurElise2")+'');
//var song1 = eval(fs.readFileSync("songarrayRamble")+'');
//var song1 = eval(fs.readFileSync("tt")+'');
//var song1 = loadSong("first.txt");
//var song1 = loadSong("songarrayRamble2");

var minNote = 48;
var maxNote = 95;
var searchDepth = 2;
var branching = 5;

function collide(arm1, arm2, note1, note2){
	if(arm1 == arm2) {
		return true;
	} else if(arm1 == 1 && arm2 == 2 || arm1 == 2 && arm2 == 1 || arm1 == 3 && arm2 == 4 || arm1 == 4 && arm2 == 3) {
		return Math.abs(note1 - note2) <= 2
	} else if(arm1 == 2 && arm2 == 3 || arm1 == 3 && arm2 == 2){
		return Math.abs(note1 - note2) <= 6;
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

var SortedBuffer = function(size){
	var items = [];
	var costs = [];

	this.push = function(item, cost){
		if(items.length == 0){
			items.push(item);
			costs.push(cost);
		} else if(cost < costs[costs.length - 1]){
			if(items.length + 1 > size){
				items.pop();
				costs.pop();	
			}
			items.push(item);
			costs.push(cost);
			var index = costs.length - 1;
			while(costs[index] < costs[index - 1]){
				items[index] = items[index - 1];
				costs[index] = costs[index - 1];
				items[index - 1] = item;
				costs[index - 1] = cost;
				index--;
			}
		}
	};

	this.get = function (index){
		return [items[index], costs[index]];
	};
	
	this.length = function(){
		return items.length;
	};
	
	this.toArray = function(){
		var output = [];
		for(var i = 0; i < costs.length; i++){
			output[i] = this.get(i);
		}
		return output;
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
	var notes = playingNotes(songData.slice(0, 4));
	var minDistance = Math.pow(maxNote - minNote, 4);
	var minPositions = [-1, -1, -1, -1];
	var minVelocities = [-1, -1, -1, -1];
	for(var i = minNote; i < maxNote; i++){
		for(var j = i + 1; j < maxNote; j++){
			for(var k = j + 1; k < maxNote; k++){
				for(var l = k + 1; l <= maxNote; l++){
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
	if(minDistance == Math.pow(maxNote - minNote, 4)){
		return oldPositions.concat([0, 0, 0, 0]).concat([songData[4]]).concat([songIndex]);
	} else {
		return minPositions.concat(minVelocities).concat([songData[4]]).concat([songIndex]);
	}
}

function greedyPlanner(song, arm_positions){
	var plan = [];
	plan.push([arm_positions[0], arm_positions[1], arm_positions[2], arm_positions[3], 0, 0, 0, 0, 0]);
	var t = new Date();
	for(var i = 0; i < song.length; i++){
		var current = plan[plan.length - 1];
//		var next = betterMultiMinCostNextState(current.slice(0, 4), song[i], i + 1)[0];
		var next = minCostNextState(current.slice(0, 4), song[i], i, i + 1);
		if(next[0] != -1){
			plan.push(next.slice(0, 9));
		} else {
//			console.log("Unplayable note " + song[i]+ " at index " + i + "!");
		}
	}
	console.log((new Date()) - t);
	return plan;
}

function multiMinCostNextState(oldPositions, songData, songIndex, limit){
	var notes = playingNotes(songData.slice(0, 4));
	var buffer = new SortedBuffer(limit);
	var commonData = [songData[4], songIndex];
	for(var i = minNote; i < maxNote; i++){
		for(var j = i + 1; j < maxNote; j++){
			for(var k = j + 1; k < maxNote; k++){
				for(var l = k + 1; l <= maxNote; l++){
					var possibility = [i, j, k, l];
					if(containsAll(possibility, notes) && !anyCollide(possibility)){
						var distance = l2Distance2(possibility, oldPositions);
						var item = possibility.concat(velocities(possibility, notes)).concat(commonData);
						buffer.push(item, distance);
					}
				}
			}
		}
	}
	if(buffer.length() == 0){
		buffer.push(oldPositions.concat([0, 0, 0, 0]).concat(commonData), 0);
		return buffer.toArray();		
	} else {
		return buffer.toArray();
	}
}

function betterMultiMinCostNextState(oldPositions, songData, songIndex, limit){
	var notes = playingNotes(songData.slice(0, 4));
	var buffer = new SortedBuffer(limit);
	var commonData = [songData[4], songIndex];
	for(var i = 0; i < notes.length;i++){
		if(notes[i] < minNote || notes[i] > maxNote){
			buffer.push(oldPositions.concat([0, 0, 0, 0]).concat(commonData), 0);
			return buffer.toArray();
		}
	}
	switch(notes.length){
		case 4: 
			var possibility = notes;
			if(!anyCollide(possibility)){
				var distance = l2Distance2(possibility, oldPositions);
				var item = possibility.concat(velocities(possibility, notes)).concat(commonData);
				buffer.push(item, distance);
			}
			break;
		case 3: 
			for(var i = minNote; i <= maxNote; i++){
				if(notes.indexOf(i) != -1) continue;
				var possibility = [i, notes[0], notes[1], notes[2]].sort();
				if(!anyCollide(possibility)){
					var distance = l2Distance2(possibility, oldPositions);
					var item = possibility.concat(velocities(possibility, notes)).concat(commonData);
					buffer.push(item, distance);
				}
			}
			break;
		case 2:
			for(var i = minNote; i < maxNote; i++){
				if(notes.indexOf(i) != -1) continue;
				for(var j = i + 1; j <= maxNote; j++){
					if(notes.indexOf(j) != -1) continue;
					var possibility = [i, j, notes[0], notes[1]].sort();
					if(!anyCollide(possibility)){
						var distance = l2Distance2(possibility, oldPositions);
						var item = possibility.concat(velocities(possibility, notes)).concat(commonData);
						buffer.push(item, distance);
					}
				}
			}
			break;
		case 1:
			for(var i = minNote; i < maxNote; i++){
				if(notes.indexOf(i) != -1) continue;
				for(var j = i + 1; j < maxNote; j++){
					if(notes.indexOf(j) != -1) continue;
					for(var k = j + 1; k <= maxNote; k++){
						if(notes.indexOf(k) != -1) continue;
						var possibility = [i, j, k, notes[0]].sort();
						if(!anyCollide(possibility)){
							var distance = l2Distance2(possibility, oldPositions);
							var item = possibility.concat(velocities(possibility, notes)).concat(commonData);
							buffer.push(item, distance);
						}
					}
				}
			}
			break;
		default:
			for(var i = minNote; i < maxNote; i++){
				for(var j = i + 1; j < maxNote; j++){
					for(var k = j + 1; k < maxNote; k++){
						for(var l = k + 1; l <= maxNote; l++){
							var possibility = [i, j, k, l];
							if(containsAll(possibility, notes) && !anyCollide(possibility)){
								var distance = l2Distance2(possibility, oldPositions);
								var item = possibility.concat(velocities(possibility, notes)).concat(commonData);
								buffer.push(item, distance);
							}
						}
					}
				}
			}
			break;
	}
	if(buffer.length() == 0){
		buffer.push(oldPositions.concat([0, 0, 0, 0]).concat(commonData), 0);
		return buffer.toArray();		
	} else {
		return buffer.toArray();
	}	
}

function limitedSearch(song, arm_positions, startIndex, limit, branching){
	var ds = [];
	ds.push([[arm_positions[0], arm_positions[1], arm_positions[2], arm_positions[3], 0, 0, 0, 0, 0, startIndex, 0]]);
	while(ds.length > 0){
		var currentCost = 999999999999;
		var currentIndex = -1;
		for(var i = 0; i < ds.length;i++){
			var possibleCost = 0;
			for(var j = 0; j < ds[i].length;j++){
				possibleCost += Math.sqrt(ds[i][j][10]);
			}
			if(possibleCost < currentCost){
				currentIndex = i;
				currentCost = possibleCost;
			}
		}
		var current = ds.splice(currentIndex, 1)[0];
		var songIndex = current[current.length - 1][9];
		if(songIndex - startIndex >= limit){
			return current;
		}
		var nexts = betterMultiMinCostNextState(current[current.length - 1].slice(0, 4), song[songIndex], songIndex + 1, branching);
		for(var i = 0; i < nexts.length;i++){
			var next = current.slice(0);
			next.push(nexts[i][0].concat(nexts[i][1]));
			ds.push(next);
		}
	}
	return null;
}

function limitedSearchPlanner(song, arm_positions){
	var plan = [[arm_positions[0], arm_positions[1], arm_positions[2], arm_positions[3], 0, 0, 0, 0, 0]];
	var t = new Date();
	for(var i = 0; i < song.length; i++){
		var next = limitedSearch(song, plan[plan.length - 1].slice(0, 4), i, Math.min(searchDepth, song.length - i), branching);
		if(next != null){
			next = next[1].slice(0, 9);
			plan.push(next);
		}
	}
	//console.log((new Date()) - t);
	return plan;
}

function onlineGreedyPlanner(songData, arm_positions){
	return minCostNextState(arm_positions.slice(0, 4), songData, -1).slice(0, 9);
}

function onlineLimitedSearchPlanner(songData, arm_positions){
	return limitedSearch(song, arm_positions.slice(0, 4), songData, Math.min(searchDepth, song.length - i), branching);
}

var start = [52, 64, 77, 89];
var plan = greedyPlanner(song1, start);
//var plan = limitedSearchPlanner(song1, start);
//console.log(greedyPlanner(song1, start));
//console.log(limitedSearchPlanner(song1, start));






