/*jshint esversion: 6 */
class storyGame{
	constructor(start, end, comp, rela, auto, stress, fati, task){
		this.Task = task;
		this.StartTime = start;
		this.DeadLine = end;
		this.Competence = comp;
		this.Relatedness = rela;
		this.Autonomy = auto;
		this.Stress = stress;
		this.Fatigue = fati;
		this.Progress = 0;
    this.Chapters = [];
		this.Motivation = "(gameStory.autonomy + gameStory.competence + gameStory.relatedness) / 3";
	}
}

class game{
  constructor(story, question, name){
		this.Chapter = name;
    this.Story = story;
    this.Answers = [];
    this["Next chapter"] = [];
    this.Points = {};
    this.Time = [];
    this.Question = question;
  }
}

class ChapterStatus{
	constructor(){
		this.Chapter = [];
		this.Status = [];
	}
}

var story = {};
var points = [];
var answers = 0;
var interval;
var placeHolder = ["Autonomy", "Competence", "Relatedness", "Stress", "Fatigue", "Time", "Progress"];
var uniqueFilename;

$(document).ready(function() {
	uniqueFilename = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".json";
	document.getElementById("loadbutton").href = "tmp/"+uniqueFilename;
	//save
	document.getElementById("savebutton").onclick = showChapters;
	//next
	//document.getElementById("nextbutton").onclick = showChapters;
	for(i=2; i<5; i++){
		document.getElementById("checkBox"+i).style.visibility = 'hidden';
	}
	for(i = 1; i<5; i++){
		document.getElementById('checkBox'+i).addEventListener('click', checkBoxes);
	}
 	interval = setInterval(getSavedData, 100);
});

function getData(){
	var endTime = getEndTime();
	var startTime = getStartTime();
	var chapt = {};
	var answers = [];
	var id;
	if (localStorage.getItem("Story") === null) {
		story = new storyGame(startTime, endTime+startTime, parseInt($("#StatCompetence").val()), parseInt($("#StatRelatedness").val()), parseInt($("#StatAutonomy").val()), parseInt($("#StatStress").val()), parseInt($("#StatFatigue").val()), $("#TaskText").val());
	} else {
		story = JSON.parse(localStorage.getItem('Story'));
		for(var i of story.Chapters){
			if(i.Chapter == "default"){
				id = story.Chapters.indexOf(i);
			}
		}
		story.Chapters.splice(id, 1);
	}
	chapt = new game($("#StoryText").val(), "", "default");
	chapt.Answers.push($("#Choice1").val(), $("#Choice2").val(), $("#Choice3").val(), $("#Choice4").val())
	chapt["Next chapter"].push($("#NextChap1").val(), $("#NextChap2").val(), $("#NextChap3").val(), $("#NextChap4").val());
	chapt.Points["Answer1"] = ["Autonomy", "Competence", "Relatedness", "Stress", "Fatigue", "Progress"];
	chapt.Points["Answer2"] = ["Autonomy", "Competence", "Relatedness", "Stress", "Fatigue", "Progress"];
	chapt.Points["Answer3"] = ["Autonomy", "Competence", "Relatedness", "Stress", "Fatigue", "Progress"];
	chapt.Points["Answer4"] = ["Autonomy", "Competence", "Relatedness", "Stress", "Fatigue", "Progress"];
	chapt.Time = ["Time", "Time", "Time", "Time"];
	for(j=1;j<6;j++){
		chapt.Points.Answer1[j-1]=$("#dropdown"+j).val();
		chapt.Points.Answer2[j-1]=$("#dropdown"+(j+5)).val();
		chapt.Points.Answer3[j-1]=$("#dropdown"+(j+10)).val();
		chapt.Points.Answer4[j-1]=$("#dropdown"+(j+15)).val();
	}
	for(j=1;j<5;j++){
		chapt.Time[j-1] = $("#dropdown2"+j).val();
		chapt.Points["Answer" + j][5]=$("#dropdown" + (j+24)).val();
	}
	story.Chapters.push(chapt);
	var status = new ChapterStatus();
	status.Chapter.push("default");
	status.Status.push(1);
	var total = 1;
	story.Chapters.forEach(function (chapt, index){
		for (i = 0; i<4; i++){
					var name = chapt["Next chapter"][i];
					var newS = 1;
					for(j = 0; j<status.Chapter.length; j++){
						if(status.Chapter[j] == name){
							newS = 0;
						}
					}
					if(newS == 1){
						status.Status.push(0);
						status.Chapter.push(name);
						story.Chapters.forEach(function (chapt2){
							if(name == chapt2.Chapter){
								status.Status[total] = 1;
							}
						});
						total++;
					}
			}
	});
	saveStoryLocal(status);
}

function getEndTime(){
	var time = 0;
	var days = $("#DaysToComplete").val();
	var hours = $("#HoursToComplete").val();
	if (hours < 0 || isNaN(hours) || hours == ""){
		hours = 0;
	} else {
		hours = parseInt(hours);
	}
	if (days < 0 || isNaN(days) || days == ""){
		days = 1;
	} else {
		days = parseInt(days);
	}
	time = days*24+hours;
	return time;
}
function getStartTime(){
	var time = $("#TaskTime").val();
	var hours = parseInt(time.charAt(0)+""+time.charAt(1));
	var minutes = parseInt(time.charAt(3)+""+time.charAt(4));
	time = hours+minutes/60
	return time;
}

function saveStoryLocal(c){
	localStorage.setItem('Story', JSON.stringify(story));
	localStorage.setItem('Status', JSON.stringify(c));
	saveStory();
}

function saveStory(){
	console.log(story);
	$.ajax
		({
				type: "GET",
				dataType : 'json',
				async: false,
				url: 'tmp/save_json.php',
				data: { data: JSON.stringify(story), story: uniqueFilename },
				success: function () {alert("Thanks!"); },
				failure: function() {alert("Error!");}
		});
		console.log(story);
}

function getSavedData(){
	story = JSON.parse(localStorage.getItem('Story'));
	var id;
	if (localStorage.getItem("Story") !== null) {
		document.getElementById("StatCompetence").value = story.Competence;
		document.getElementById("StatRelatedness").value = story.Relatedness;
		document.getElementById("StatAutonomy").value = story.Autonomy;
		document.getElementById("StatStress").value = story.Stress;
		document.getElementById("StatFatigue").value = story.Fatigue;
		document.getElementById("TaskText").value = story.Task;
		document.getElementById("DaysToComplete").value = Math.floor(story.DeadLine/24);
		document.getElementById("HoursToComplete").value = Math.floor(story.DeadLine%24);
		for(var i of story.Chapters){
			if(i.Chapter == "default"){
				id = story.Chapters.indexOf(i);
			}
		}
		document.getElementById("dropdown1").value = story.Chapters[id].Points.Answer1[0];
		document.getElementById("StoryText").value = story.Chapters[id].Story;
		for(i=0; i<4; i++){
			document.getElementById("Choice"+(i+1)).value = story.Chapters[id].Answers[i];
			var tempName = story.Chapters[id].Points["Answer"+(i+1)];
			document.getElementById("dropdown"+(25+i)).value = tempName[5];
			document.getElementById("dropdown2"+(i+1)).value = story.Chapters[id].Time[i];
			if(story.Chapters[id].Points["Answer"+(i+1)].length > 0){
				for(j=1;j<6;j++){
					document.getElementById("dropdown"+(5*(i)+j)).value = tempName[j-1];
				}
			}
			document.getElementById("NextChap"+(i+1)).value = story.Chapters[id]["Next chapter"][i];
		}
		var time;
		if(story.StartTime==0){
			time = "00:00";
		} else {
			//var time;
			var minutes = Math.round((story.StartTime%1)*60);
			if(minutes < 10 && minutes > 0){
				minutes = "0"+minutes.toString();
			} else if (minutes == 0){
				minutes = "00";
			}
			var hours = Math.floor(story.StartTime/1);
			if(hours < 10 && hours > 0){
				hours = "0"+hours.toString();
			} else if (hours == 0){
				hours = "00";
			}
			time = hours+":"+minutes;
		}
		document.getElementById("TaskTime").value = time;
	}
		checkAll();
		clearInterval(interval);
}

function showChapters(){
	var currentStatus = checkAll();
	var currentAtr = checkAtr();
	if(currentStatus == 1 && currentAtr == 1){
		getData();
		document.getElementById("clearbutton").onclick = showAllChapters;
		document.getElementById("savebutton").onclick = saveData;
		story = JSON.parse(localStorage.getItem('Story'));
		var status = JSON.parse(localStorage.getItem('Status'));
		var text = "";
		for(i= 0; i<status.Chapter.length; i++){
			text += '<div id="chapter">';
					if(status.Chapter[i] != ""){
						var name = status.Chapter[i];
						if(status.Status[i] == 1){
							text += `<button class="chapterbutton" id="button" style="color:green;" onclick="newChapter('${name}', ${i})";>`+name.replace(/<[^>]*>?/gm, '');+`</button>`;
						} else {
							text += `<button class="chapterbutton" id="button" style="color:red;" onclick="newChapter('${name}', ${i})";>`+name.replace(/<[^>]*>?/gm, '');+`</button>`;
						}
					}
			text += '</div>';
		};
		document.getElementById("ADTT").innerHTML = text;
		cleanBoxes();
		disableBoxes();
	}
}

function disableBoxes(){
	document.getElementById("StoryText").disabled = true;
	document.getElementById("Choice1").disabled = true;
	document.getElementById("Choice2").disabled = true;
	document.getElementById("Choice3").disabled = true;
	document.getElementById("Choice4").disabled = true;
	document.getElementById("NextChap1").disabled = true;
	document.getElementById("NextChap2").disabled = true;
	document.getElementById("NextChap3").disabled = true;
	document.getElementById("NextChap4").disabled = true;
	document.getElementById("savebutton").disabled = true;
	for(i=1; i<6; i++){
			document.getElementById("dropdown"+i).disabled = true;
			document.getElementById("dropdown"+(i+5)).disabled = true;
			document.getElementById("dropdown"+(i+15)).disabled = true;
			document.getElementById("dropdown1"+i).disabled = true;
	}
	for(i=1; i<5; i++){
		document.getElementById("dropdown"+(20+i)).disabled = true;
		document.getElementById("dropdown"+(24+i)).disabled = true;
		document.getElementById("checkBox"+i).style.visibility = 'hidden';
	}
}

function enableBoxes(){
	document.getElementById("StoryText").disabled = false;
	document.getElementById("Choice1").disabled = false;
	document.getElementById("NextChap1").disabled = false;
	document.getElementById("savebutton").disabled = false;
	for(i=1; i<6; i++){
			document.getElementById("dropdown"+i).disabled = false;
	}
		document.getElementById("dropdown21").disabled = false;
		document.getElementById("dropdown25").disabled = false;
		document.getElementById("checkBox1").style.visibility = 'visible';
}

function cleanBoxes(){
	document.getElementById("StoryText").value = "";
	for(i=1; i<5; i++){
		document.getElementById("Choice"+i).value = "";
		document.getElementById("NextChap"+i).value = "";
		$("#NextChap"+i).css('border', '2px solid #008CBA');
		$("#Choice"+i).css('border', '2px solid #008CBA');
	}
	for(i=1; i<6; i++){
			document.getElementById("dropdown"+i).value = placeHolder[i-1];
			document.getElementById("dropdown"+(i+5)).value = placeHolder[i-1];
			document.getElementById("dropdown"+(i+15)).value = placeHolder[i-1];
			document.getElementById("dropdown1"+i).value = placeHolder[i-1];
	}
	for(i=1; i<5; i++){
		document.getElementById("dropdown"+(20+i)).value = placeHolder[5];
		document.getElementById("dropdown"+(24+i)).value = placeHolder[6];
		document.getElementById("checkBox"+i).style.visibility = 'hidden';
	}
	for(i=1; i<29; i++){
		$("#dropdown"+i).css('border', '2px solid #008CBA');
	}
}

function newChapter(name, i){
	var text = "";
	index = i;
	var status = JSON.parse(localStorage.getItem('Status'));
	if(status.Status[i] == 1){
		cleanBoxes();
		loadData(name, i);
	} else {
		cleanBoxes();
		disableBoxes();
		enableBoxes();
	}
}

function loadData(name, i){
	enableBoxes();
	var status = JSON.parse(localStorage.getItem('Status'));
	story = JSON.parse(localStorage.getItem('Story'));
	for(var index of story.Chapters){
		if(index.Chapter == status.Chapter[i]){
			id = story.Chapters.indexOf(index);
		}
	}
	document.getElementById("StoryText").value = story.Chapters[id].Story;
	document.getElementById("Choice1").value = story.Chapters[id].Answers[0];
	document.getElementById("Choice2").value = story.Chapters[id].Answers[1];
	document.getElementById("Choice3").value = story.Chapters[id].Answers[2];
	document.getElementById("Choice4").value = story.Chapters[id].Answers[3];
	document.getElementById("NextChap1").value = story.Chapters[id]["Next chapter"][0];
	document.getElementById("NextChap2").value = story.Chapters[id]["Next chapter"][1];
	document.getElementById("NextChap3").value = story.Chapters[id]["Next chapter"][2];
	document.getElementById("NextChap4").value = story.Chapters[id]["Next chapter"][3];
	for(i=1; i<6; i++){
			document.getElementById("dropdown"+i).value = story.Chapters[id].Points.Answer1[i-1];
			document.getElementById("dropdown"+(i+5)).value = story.Chapters[id].Points.Answer2[i-1];
			document.getElementById("dropdown1"+i).value = story.Chapters[id].Points.Answer3[i-1];
			document.getElementById("dropdown"+(i+15)).value = story.Chapters[id].Points.Answer4[i-1];
	}
	for(i=0; i<4; i++){
		document.getElementById("dropdown"+(i+21)).value = story.Chapters[id].Time[i];
		document.getElementById("dropdown"+(25+i)).value = story.Chapters[id].Points["Answer"+(i+1)][5];
	}
	checkAll();
}


function showAllChapters(){
	var currentStatus = checkAll();
	if(currentStatus == 1){
		story = JSON.parse(localStorage.getItem('Story'));
		var status = JSON.parse(localStorage.getItem('Status'));
		var text = "";
		for(i= 0; i<status.Chapter.length; i++){
			text += '<div id="chapter">';
					if(status.Chapter[i] != ""){
						var name = status.Chapter[i];
						if(status.Status[i] == 1){
							text += `<button id="button" style="color:green;" onclick="newChapter('${name}', ${i})";>`+name+`</button>`;
						} else {
							text += `<button id="button" style="color:red;" onclick="newChapter('${name}', ${i})";>`+name+`</button>`;
						}
					}
			text += '</div>';
		};
		document.getElementById("ADTT").innerHTML = text;
		cleanBoxes();
		disableBoxes();
	}
}

function saveData(){
	var name = JSON.parse(localStorage.getItem('Status'));
	story = JSON.parse(localStorage.getItem('Story'));
	name = name.Chapter[index];
	var chapt = {};
	var answers = [];
	var id = -1;
	chapt = new game($("#StoryText").val(), "", name);
	chapt.Answers.push($("#Choice1").val(), $("#Choice2").val(), $("#Choice3").val(), $("#Choice4").val());
	chapt["Next chapter"].push($("#NextChap1").val(), $("#NextChap2").val(), $("#NextChap3").val(), $("#NextChap4").val());
	chapt.Points["Answer1"] = ["Autonomy", "Competence", "Relatedness", "Stress", "Fatigue", "Progress"];
	chapt.Points["Answer2"] = ["Autonomy", "Competence", "Relatedness", "Stress", "Fatigue", "Progress"];
	chapt.Points["Answer3"] = ["Autonomy", "Competence", "Relatedness", "Stress", "Fatigue", "Progress"];
	chapt.Points["Answer4"] = ["Autonomy", "Competence", "Relatedness", "Stress", "Fatigue", "Progress"];
	chapt.Time = ["Time", "Time", "Time", "Time"];
	for(j=1;j<6;j++){
		chapt.Points.Answer1[j-1]=$("#dropdown"+j).val();
		chapt.Points.Answer2[j-1]=$("#dropdown"+(j+5)).val();
		chapt.Points.Answer3[j-1]=$("#dropdown"+(j+10)).val();
		chapt.Points.Answer4[j-1]=$("#dropdown"+(j+15)).val();
	}
	for(j=1;j<5;j++){
		chapt.Time[j-1] = $("#dropdown2"+j).val();
		chapt.Points["Answer" + j][5]=$("#dropdown" + (j+24)).val();
	}
	story.Chapters.forEach(function (chap, index){
		if(chap.Chapter == name){
			id = index;
		}
	});
	if(id !== -1){
		story.Chapters.splice(id, 1);
	}
	story.Chapters.push(chapt);
	var status = new ChapterStatus();
	status.Chapter.push("default");
	status.Status.push(1);
	var total = 1;
	story.Chapters.forEach(function (chapt, index){
		for (i = 0; i<4; i++){
					var name = chapt["Next chapter"][i];
					var newS = 1;
					for(j = 0; j<status.Chapter.length; j++){
						if(status.Chapter[j] == name){
							newS = 0;
						}
					}
					if(newS == 1){
						status.Status.push(0);
						status.Chapter.push(name);
						story.Chapters.forEach(function (chapt2){
							if(name == chapt2.Chapter){
								status.Status[total] = 1;
							}
						});
						total++;
					}
			}
	});
	status.Status[index]=1;
	index = 100;
	saveStoryLocal(status);
	showAllChapters();
}

function checkBoxes(i){
	if(Number.isInteger(parseInt($(this).attr('value')))){
		console.log(parseInt($(this).attr('value')));
		i=parseInt($(this).attr('value'));
	}
	var allChecked = 1;
	var idObj = {};
	if($("#StoryText").val() == ""){
		$("#StoryText").css('border', '2px solid red');
	} else {
		$("#StoryText").css('border', '2px solid #008CBA');
	}
	idObj.idList1 = ["#Choice1", "#NextChap1", "#dropdown1", "#dropdown2", "#dropdown3", "#dropdown4", "#dropdown5", "#dropdown21", "#dropdown25"];
	idObj.idList2 = ["#Choice2", "#NextChap2", "#dropdown6", "#dropdown7", "#dropdown8", "#dropdown9", "#dropdown10", "#dropdown22", "#dropdown26"];
	idObj.idList3 = ["#Choice3", "#NextChap3", "#dropdown11", "#dropdown12", "#dropdown13", "#dropdown14", "#dropdown15", "#dropdown23", "#dropdown27"];
	idObj.idList4 = ["#Choice4", "#NextChap4", "#dropdown16", "#dropdown17", "#dropdown18", "#dropdown19", "#dropdown20", "#dropdown24", "#dropdown28"];
		for(id = 0; id<$(idObj["idList"+i]).length; id++){
			if(id <= 1){
				if($(idObj["idList"+i][id]).val() == ""){
					$(idObj["idList"+i][id]).css('border', '2px solid red');
					allChecked = 0;
				} else {
					$(idObj["idList"+i][id]).css('border', '2px solid #008CBA');
				}
			} else {
				if(!Number.isInteger(parseInt($(idObj["idList"+i][id]).val()))){
					$(idObj["idList"+i][id]).css('border', '2px solid red');
					allChecked = 0;
				} else {
					$(idObj["idList"+i][id]).css('border', '2px solid #008CBA');
				}
			}
		}
	if(allChecked == 1 && i != 4){
		for(id = 0; id<$(idObj["idList"+i]).length; id++){
			$(idObj["idList"+(i+1)][id]).prop( "disabled", false )
		}
		document.getElementById("checkBox"+(i+1)).style.visibility = 'visible';
		return 1;
	} else {
		return 0;
	}
}

function checkAll(){
	var currentStatus = 1;
	var idList1 = ["#NextChap1", "#NextChap2", "#NextChap3", "#NextChap4"];
	for(i = 1; i<5; i++){
		if($(idList1[i-1]).val() != ""){
			currentStatus = checkBoxes(i);
		}
	}
	checkAtr();
	return currentStatus;
}

function checkAtr(){
		var statusAtr = 1;
		var idList = ["#StatAutonomy", "#StatCompetence", "#StatRelatedness", "#StatStress", "#StatFatigue", "#TaskTime", "#DaysToComplete", "#HoursToComplete", "#TaskText"];
		for(id = 0; id<idList.length; id++){
			if($(idList[id]).val() == ""){
				$(idList[id]).css('border', '2px solid red');
				statusAtr = 0;
			} else {
				$(idList[id]).css('border', '2px solid #008CBA');
			}
		}
		return statusAtr;
}

function infoPop(){
	var popup = document.getElementById("popup");
	popup.classList.toggle("show");
}