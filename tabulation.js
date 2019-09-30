var spreadsheet = "";
var round = "";
var clicker_judges = [];
var eval_judges = [];
var judge_list = [];
var index = 0;
var positives = [];
var negatives = [];
var restarts = [];
var discards = [];
var detaches = [];
var controlList = [];
var executionList = [];
var variationList = [];
var spaceUseList = [];
var bodyControlList = [];
var choreographyList = [];
var constructionList = [];
var showmanshipList = [];
var playerList = [];
var range = "";
var liveClicks = [];
var liveEvals = [];
var numPlayers = 0;
var selectedJudgeType = "";
var selectedJudgeName = "";
var manualDivision = "";
var manualJudgeType = "";
var manualContest = "";
var manualJudgeName = "";
var evaltype = 0;
var numStop = 0;
var numDisc = 0;
var numDet = 0;
var contests = [];
var roundType = "";


function initClient() {
  var API_KEY = "AIzaSyD-6YxG5mymcHxuw2_oa8FmUCzFas72sfk";  // TODO: Update placeholder with desired API key.
  var CLIENT_ID = "698696933761-acb051hpb6gj7t3aa03g95ed7ocln0le.apps.googleusercontent.com";  // TODO: Update placeholder with desired client ID.
  var SCOPE = "https://www.googleapis.com/auth/spreadsheets";

  gapi.client.init({
    "apiKey": API_KEY,
    "clientId": CLIENT_ID,
    "scope": SCOPE,
    "discoveryDocs": ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  }).then(function() {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
    updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}
function handleClientLoad() {
gapi.load("client:auth2", initClient);
}

function updateSignInStatus(isSignedIn) {
  if (isSignedIn) {
    $("#auth").css("display","none");
    $("#login").css("display","block");
    getContests();
  }
}

function handleSignInClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function getContests()
{
  var contests_list = [];
  gapi.client.sheets.spreadsheets.values.get({
  spreadsheetId: '1FCssxQv3_yPsPt6c-Poeicj_ODNH0ZJyCUI6gwxGFS4',
  range: "A1:C100"
  }).then((response) => {
  contests = response.result.values;
  console.log(contests);
  for (i=0;i<contests.length;i++)
  {
    if (contests_list.includes(contests[i][0]) == false)
    {
      contests_list.push(contests[i][0]);
    }
    else
    {
      continue;
    }
  }
  }, function(reason) {
  console.error("error: " + reason.result.error.message);
  alert("Error.");
  });
}
function append()
{
var link = $('#sheet-link').val();
var panel = "";
var beginId = link.indexOf("d/") + 2;
var endId = link.indexOf("/e");
var range = "";
spreadsheetId = link.slice(beginId, endId);
if ($('#judge-type').val() == "Clicker")
{
  range = "SET-UP!F3:F8";
}
else
{
  range = "SET-UP!F16:F21";
}
gapi.client.sheets.spreadsheets.values.get({
spreadsheetId: spreadsheetId,
range: range
}).then((response) => {
for (var i=0;i<response.result.values.length;i++)
{
  panel += response.result.values[i];
  panel += ",";
}
panel = panel.slice(0,-1);
var profile =
{
  "pin": $('#new-judge-pin').val(),
  "contest": $('#contest').val(),
  "division": $('#division').val(),
  "judgetype": $('#judge-type').val(),
  "name": panel,
  "num_judges": panel.split(',').length
};
//var url = 'https://tabulation-login.appspot.com/append?num=' + $('#admin-pin').val();
var url = 'http://localhost:8080/append?num=' + $('#admin-pin').val();
$.ajax({
type: "POST",
headers: {"Access-Control-Allow-Origin": "scalescollective.com"},
url: url,
dataType: "text",
data: profile,
xhrFields: {
       withCredentials: true
},
success: function(msg) {
  console.log(msg);
  alert("Successfully added to the database!");
},
error: function(msg) {
	//if it does not work, alert an error
	alert("Error");
  console.log(msg);
}
});
}, function(reason) {
  alert("Error.");
  console.log(msg);
});
}

function autoLogin()
{
var pin = $('#judge-pin').val();
var url = 'http://localhost:8080/login?num=' + pin;
//var url = 'https://tabulation-login.appspot.com/login?num=' + pin;
$.ajax({
type: "GET",
headers: {"Access-Control-Allow-Origin": "scalescollective.com"},
url: url,
contentType: "application/json; charset=utf-8",
//data: obj,
dataType: "html",
success: function(msg) {
  console.log(msg);
  profile = msg.split(',');
	//if the call worked, fill the HTML of the empty division with the answer to the calculation
  manualContest = profile[0];
  manualDivision = profile[1];
  manualJudgeType = profile[2];
  manualJudgeName = profile[3];
  chooseJudge();
  setTimeout(startJudging,1000);
},
error: function(msg) {
	//if it does not work, alert an error
	alert("Error.");
  console.log(msg);
}
});
}

//added small code to log the pre/final type
function chooseJudge()
{
  selectedContest = manualContest;
  selectedDivision = manualDivision;
  selectedJudgeType = manualJudgeType;
  for (i=0;i<contests.length;i++)
  {
    if (contests[i][0] == manualContest && contests[i][1] == manualDivision)
    {
      if (manualJudgeType == "Clicker")
      {
        spreadsheet = contests[i][2];
        var beginId = spreadsheet.indexOf("d/") + 2;
        var endId = spreadsheet.indexOf("/e");
        spreadsheetId = spreadsheet.slice(beginId, endId);
        gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: "SET-UP!F3:F8"
        }).then((response) => {
        loadPanel(response.result.values.slice(),"click");
        for (var i=0;i<clicker_judges.length;i++)
        {
          judge_list.push(clicker_judges[i]);
        }
        }, function(reason) {
        console.error("error: " + reason.result.error.message);
        alert("Error.");
        });
      }
      else if (manualJudgeType == "Evaluation")
      {
        spreadsheet = contests[i][2];
        var beginId = spreadsheet.indexOf("d/") + 2;
        var endId = spreadsheet.indexOf("/e");
        spreadsheetId = spreadsheet.slice(beginId, endId);
        gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: "SET-UP!F16:F21"
        }).then((response) => {
        loadPanel(response.result.values.slice(),"eval");
        for (var i=0;i<eval_judges.length;i++)
        {
          judge_list.push(eval_judges[i]);
        }
        }, function(reason) {
        console.error("error: " + reason.result.error.message);
        alert("Error.");
        });
        gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: "SET-UP!A27"
        }).then((response) => {
        if (response.result.values[0] == "This spreadsheet is designed for Final")
        {
          evaltype = 8;
        }
        else
        {
          evaltype = 4;
        }
        }, function(reason) {
        console.error("error: " + reason.result.error.message);
        alert("Error.");
        });
      }
    }
  }
}

function loadPanel(list,type) {
  if (type == "click")
  {
    clicker_judges = list;
  }
  else if (type == "eval")
  {
    eval_judges = list;
  }
}

function startJudging() {
  var contest_title =  manualContest + " - " + manualDivision;
  $('.contest-title').text(contest_title);
  var judge_title =  manualJudgeName + " - " + manualJudgeType;
  console.log(contest_title, judge_title);
  $('.judge-title').text(judge_title);
  $('#login').css("display","none");
  if (selectedJudgeType == "Clicker")
  {
    processType(clicker_judges,manualJudgeName);
  }
  else if (selectedJudgeType == "Evaluation")
  {
    processType(eval_judges,manualJudgeName);
  }
  setTimeout(retrievePlayers,500);
}

function retrievePlayers() {
  // gets players from spreadsheet
  gapi.client.sheets.spreadsheets.values.get({
  spreadsheetId: spreadsheetId,
  range: "PLAYER!B4:B103"
  }).then((response) => {
  var players = response.result.values;
  for (var i=0;i<players.length;i++)
  {
    playerList.push(players[i][0]);
  }
  numPlayers = players.length;
  if (selectedJudgeType == "Clicker")
  {
  loadClickTable(numPlayers);
  loadClickScores();
  }
  else if (selectedJudgeType == "Evaluation")
  {
  loadEvalTable(numPlayers);
  loadEvalScores();
  }
  }, function(reason) {
  console.error("error: " + reason.result.error.message);
  alert("Error.");
  });
}

function processType(list,name) {
    var selectedJudgeDropdown = document.getElementById("judge-list");
    if (name == "")
    {
      var selectedJudgeName = selectedJudgeDropdown.options[selectedJudgeDropdown.selectedIndex].text;
    }
    else
    {
      selectedJudgeName = name;
      selectedJudgeType = manualJudgeType;
    }
    if (selectedJudgeType == "Clicker")
    {
      for (var i=0; i<list.length; i++)
      {
        if (list[i] == selectedJudgeName)
        {
          if (i == 0)
          {
            range = "RAW-TEx!F4:G104";
          }
          else if (i == 1)
          {
            range = "RAW-TEx!H4:I104";
          }
          else if (i == 2)
          {
            range = "RAW-TEx!J4:K104";
          }
          else if (i == 3)
          {
            range = "RAW-TEx!L4:M104";
          }
          else if (i == 4)
          {
            range = "RAW-TEx!N4:O104";
          }
          else if (i == 5)
          {
            range = "RAW-TEx!P4:Q104";
          }
        }
      }
    }
    else if (selectedJudgeType == "Evaluation" && evaltype == 8)
    {
      roundType = "final";
      for (var i=0; i<list.length; i++)
      {
        if (list[i] == selectedJudgeName)
        {
          if (i == 0)
          {
            range = "RAW-TEvPEv!C4:J104";
          }
          else if (i == 1)
          {
            range = "RAW-TEvPEv!K4:R104";
          }
          else if (i == 2)
          {
            range = "RAW-TEvPEv!S4:Z104";
          }
          else if (i == 3)
          {
            range = "RAW-TEvPEv!A4:AH104";
          }
          else if (i == 4)
          {
            range = "RAW-TEvPEv!AI4:AP104";
          }
          else if (i == 5)
          {
            range = "RAW-TEvPEv!AQ4:AX104";
          }
        }
      }
    }
    else if (selectedJudgeType == "Evaluation" && evaltype == 4)
    {
      roundType = "qualifying";
      for (var i=0; i<list.length; i++)
      {
        if (list[i] == selectedJudgeName)
        {
          if (i == 0)
          {
            range = "RAW-TEvPEv!C4:F104";
          }
          else if (i == 1)
          {
            range = "RAW-TEvPEv!G4:J104";
          }
          else if (i == 2)
          {
            range = "RAW-TEvPEv!K4:N104";
          }
          else if (i == 3)
          {
            range = "RAW-TEvPEv!O4:R104";
          }
          else if (i == 4)
          {
            range = "RAW-TEvPEv!S4:V104";
          }
          else if (i == 5)
          {
            range = "RAW-TEvPEv!W4:Z104";
          }
        }
      }
    }
  }

function loadEvalTable(num) {
if (evaltype == 8)
{
for (var i=0;i<num;i++)
{
  var evalRow = '<tr><td>' + playerList[i] + '</td><td>' + "<input id="+i+"execution-f size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"control-f size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"variation-f size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"space-use-f size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"choreography-f size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"construction-f size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"body-control-f size="+'3'+" </input>" + '</td><td>' + "<input id="+i+"showmanship-f size="+'3'+"</input> </td></tr>";
  $('#eval-final-table').append(evalRow);
}
}
else if (evaltype == 4)
{
for (var i=0;i<num;i++)
{
  var evalRow = '<tr><td>' + playerList[i] + '</td><td>' + "<input id="+i+"execution-q size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"control-q size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"choreography-q size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"body-control-q size="+'3'+"</input>" + '</td></tr>';
  $('#eval-qualifying-table').append(evalRow);
}
}
}

function loadEvalScores() {
var evaloutputparams = {
     spreadsheetId: spreadsheetId,
     ranges: [range],
     includeGridData: false,
   };
   var getevalrequest = gapi.client.sheets.spreadsheets.values.batchGet(evaloutputparams);
   getevalrequest.then(function(response) {
     if (response.result.valueRanges[0].hasOwnProperty('values') == true)
     {
     var evaloutput = (response.result.valueRanges[0].values);
     $('#eval-player-name-final').html(playerList[evaloutput.length]);
     $('#eval-player-name-qualifying').html(playerList[evaloutput.length]);
     for (var i=0;i<evaloutput.length;i++)
     {
       if (roundType == "final")
       {
         index+=1;
         var currentEvalPlayer = playerList[i];
         var ctrl = evaloutput[i][1];
         var exec = evaloutput[i][0];
         var vari = evaloutput[i][2];
         var spcu = evaloutput[i][3];
         var bdcn = evaloutput[i][6];
         var shwm = evaloutput[i][7];
         var cons = evaloutput[i][5];
         var chor = evaloutput[i][4];
         $('#'+i+"control-f").val(ctrl);
         $('#'+i+"execution-f").val(exec);
         $('#'+i+"variation-f").val(vari);
         $('#'+i+"space-use-f").val(spcu);
         $('#'+i+"showmanship-f").val(shwm);
         $('#'+i+"body-control-f").val(cons);
         $('#'+i+"choreography-f").val(chor);
         $('#'+i+"construction-f").val(cons);
         controlList.push(ctrl);
         executionList.push(exec);
         variationList.push(vari);
         spaceUseList.push(spcu);
         showmanshipList.push(shwm);
         bodyControlList.push(bdcn);
         choreographyList.push(chor);
         constructionList.push(cons);
         liveEvals.push({currentEvalPlayer, exec, ctrl, vari, spcu, chor, cons, bdcn, shwm});
       }
       else if (roundType == "qualifying")
       {
         index+=1;
         $('#'+i+"control-q").val(evaloutput[i][1]);
         $('#'+i+"execution-q").val(evaloutput[i][0]);
         $('#'+i+"body-control-q").val(evaloutput[i][2]);
         $('#'+i+"choreography-q").val(evaloutput[i][3]);
       }
     }
   }
   else
   {
     $('#eval-player-name-final').html(playerList[0]);
     $('#eval-player-name-qualifying').html(playerList[0]);
   }
  }, function(reason) {
     console.error('error: ' + reason.result.error.message);
   });
   if (roundType == "final")
   {
     $("#eval8").css("display","block");
   }
   else
   {
     $("#eval4").css("display","block");
   }
}

function appendEval(round) {
var evalinputParams = {
  spreadsheetId: spreadsheetId,
  range: range,
  valueInputOption: "RAW",
};
if (evaltype == 8)
{
var evalinputRangeBody = {
  "range": range,
  "majorDimension": "COLUMNS",
  "values": [executionList, controlList, variationList, spaceUseList, choreographyList, constructionList, bodyControlList, showmanshipList],
};
var evalRequest = gapi.client.sheets.spreadsheets.values.update(evalinputParams, evalinputRangeBody);
evalRequest.then(function(response) {
  console.log("Req successful");
  $('#eval8-update-status').replaceWith('<span id="eval8-update-status" class="badge badge-success">Success</span>');
  setTimeout(revert('eval8'),5000);
}, function(reason) {
  if (reason.result.error.code == 429)
  {
    console.log(reason.result.error);
  }
  else
  {
    $('#eval8-update-status').replaceWith('<span id="eval8-update-status" class="badge badge-danger">Error</span>');
    console.log(reason.result.error);
  }
});
}
else if (evaltype == 4)
{
var evalinputRangeBody = {
  "range": range,
  "majorDimension": "COLUMNS",
  "values": [executionList, controlList, choreographyList, bodyControlList],
};
var evalRequest = gapi.client.sheets.spreadsheets.values.update(evalinputParams, evalinputRangeBody);
evalRequest.then(function(response) {
  $('#eval4-update-status').replaceWith('<span id="eval4-update-status" class="badge badge-success">Success</span>');
  setTimeout(revert('eval4'),5000);
}, function(reason) {
  if (reason.result.error.code == 429)
  {
    console.log(reason.result.error);
  }
  else
  {
    $('#eval4-update-status').replaceWith('<span id="eval4-update-status" class="badge badge-danger">Error</span>');
    console.log(reason.result.error);
  }
});
}
}



function getCSV(type) {
var CSVstring = "name,+,-,restart,discard,detach\n";
var i=0;
if (type == "click")
{
  while (i < numPlayers)
  {
    CSVstring += playerList[i] + "," + $('#'+i+"positive").val() + "," + $('#'+i+"negative").val() + "," + $('#'+i+"restart").val() + "," + $('#'+i+"discard").val() + "," + $('#'+i+"detach").val() + "\n"
    i++;
  }
}
else if (evaltype == 4)
{
  while (i < numPlayers)
  {
    CSVstring += $('#'+i+"control-q").val() + "," + $('#'+i+"execution-q").val() + "," + $('#'+i+"body-control-q").val() + "," + $('#'+i+"choreography-q").val() + "\n"
    i++;
  }
}
else if (evaltype == 8)
{
  while (i < numPlayers)
  {
    CSVstring += $('#'+i+"control-f").val() + "," + $('#'+i+"execution-f").val() + "," + $('#'+i+"variation-f").val() + $('#'+i+"space-use-f").val() + $('#'+i+"showmanship-f").val() + $('#'+i+"body-control-f").val() + "," + $('#'+i+"choreography-f").val() + $('#'+i+"construction-f").val() + "\n"
    i++;
  }
}
console.log(CSVstring);
document.getElementById('csv-log').value = CSVstring;

}

function groupUpdate(type) {
var i=0;
if (type == "click")
{
  while (i < numPlayers)
  {
    positives[i] = parseInt($('#'+i+"positive").val());
    negatives[i] = parseInt($('#'+i+"negative").val());
    restarts[i] =  parseInt($('#'+i+"restart").val());
    discards[i] =  parseInt($('#'+i+"discard").val());
    detaches[i] =  parseInt($('#'+i+"detach").val());
    i++;
  }
  appendClick();
  appendMajor();
}
else if (evaltype == 4)
{
  while (i < numPlayers)
  {
    controlList[i] = parseInt($('#'+i+"control-q").val());
    executionList[i] = parseInt($('#'+i+"execution-q").val());
    bodyControlList[i] =  parseInt($('#'+i+"body-control-q").val());
    choreographyList[i] =  parseInt($('#'+i+"choreography-q").val());
    i++;
  }
  appendEval('qualifying');
}
else if (evaltype == 8)
{
  while (i < numPlayers)
  {
    controlList[i] = parseInt($('#'+i+"control-f").val());
    executionList[i] = parseInt($('#'+i+"execution-f").val());
    variationList[i] =  parseInt($('#'+i+"variation-f").val());
    spaceUseList[i] =  parseInt($('#'+i+"space-use-f").val());
    showmanshipList[i] =  parseInt($('#'+i+"showmanship-f").val());
    bodyControlList[i] =  parseInt($('#'+i+"body-control-f").val());
    choreographyList[i] =  parseInt($('#'+i+"choreography-f").val());
    constructionList[i] =  parseInt($('#'+i+"construction-f").val());

    i++;
  }
  appendEval('final');
}
}

function loadClickTable(num) {
for (var i=0;i<num;i++)
{
  var clickRow = '<tr><td>' + playerList[i] + '</td><td>' + "<input id="+i+"positive size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"negative size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"restart size="+'3'+"</input>" + '</td><td>' + "<input id="+i+"discard size="+'3'+"</input>" + '</td><td>' + "<input id=" + i + "detach size="+'3'+"</input>" + "</td></tr>";
  $('#click-table').append(clickRow);
}
}

function loadClickScores() {
var clickoutputparams = {
     spreadsheetId: spreadsheetId,
     ranges: [range, "RAW-TEx!C4:E104"],
     valueRenderOption: 'FORMATTED_VALUE',
     dateTimeRenderOption: 'FORMATTED_STRING',
   };
   var getclickrequest = gapi.client.sheets.spreadsheets.values.batchGet(clickoutputparams);
   getclickrequest.then(function(response)
   {
     if (response.result.valueRanges[0].hasOwnProperty('values') == true)
     {
     var clickoutput = (response.result.valueRanges[0].values);
     var majoroutput = (response.result.valueRanges[1].values);
     $('#click-player-name').html(playerList[clickoutput.length]);
     for (var i=0;i<clickoutput.length;i++)
     {
       index+=1;
       var pos = parseInt(clickoutput[i][0]);
       var neg = parseInt(clickoutput[i][1]);
       var res = parseInt(majoroutput[i][0]);
       var dis = parseInt(majoroutput[i][1]);
       var det = parseInt(majoroutput[i][2]);
       var currentClickPlayer = playerList[i];
       $('#'+i+"positive").val(pos);
       $('#'+i+"negative").val(neg);
       $('#'+i+"restart").val(res);
       $('#'+i+"discard").val(dis);
       $('#'+i+"detach").val(det);
       positives.push(pos);
       negatives.push(neg);
       restarts.push(res);
       discards.push(dis);
       detaches.push(det);
       liveClicks.push({currentClickPlayer, pos, neg, res, dis, det});
       for (prop in liveClicks)
       {
         if (typeof prop == "string")
         {
           continue;
         }
         else if (prop<0)
         {
           alert("You have input a value that is out of range of scoring (negative number).");
         }
       }
     }
   }
   else
   {
     $('#click-player-name').html(playerList[0]);
   }
   }, function(reason) {
     console.error('error: ' + reason.result.error.message);
   });
   $('#click').css("display","block");
}

function revert(type) {
if (type == "click")
{
  $('#click-update-status').replaceWith('<span id="click-update-status"></span>');
}
if (type == "eval4")
{
  $('#eval4-update-status').replaceWith('<span id="eval4-update-status"></span>');
}
if (type == "eval8")
{
  $('#eval8-update-status').replaceWith('<span id="eval8-update-status"></span>');
}

}

function appendClick() {
var clickinputParams = {
  spreadsheetId: spreadsheetId,
  range: range,
  valueInputOption: "RAW",
};
var clickinputRangeBody = {
  "range": range,
  "majorDimension": "COLUMNS",
  "values": [positives, negatives],
};
var clickRequest = gapi.client.sheets.spreadsheets.values.update(clickinputParams, clickinputRangeBody);
clickRequest.then(function(response) {
  console.log("Req successful");
  $('#click-update-status').replaceWith('<span id="click-update-status" class="badge badge-success">Success</span>');
  setTimeout(revert('click'),5000);
}, function(reason) {
  if (reason.result.error.code == 429)
  {
    console.log(reason.result.error);
  }
  else
  {
    $('#click-update-status').replaceWith('<span id="click-update-status" class="badge badge-danger">Error</span>');
    console.log(reason.result.error);
  }
});
}

function appendMajor()
{
var majorinputParams = {
  spreadsheetId: spreadsheetId,
  range: "RAW-TEx!C4:E104",
  valueInputOption: "RAW",
};
var majorinputRangeBody = {
  "range": "RAW-TEx!C4:E104",
  "majorDimension": "COLUMNS",
  "values": [restarts,
  discards, detaches],
};
var majorRequest = gapi.client.sheets.spreadsheets.values.update(majorinputParams, majorinputRangeBody);
majorRequest.then(function(response) {
}, function(reason) {
  if (reason.result.error.code == 429)
  {
    console.log(reason.result.error);
  }
  else
  {
    alert("Error")
    console.log(reason.result.error);
  }
});
numStop = 0;
numDisc = 0;
numDet = 0;
}
