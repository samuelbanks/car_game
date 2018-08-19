function extractNumber(str)
{
  return str.match(/\d+/g).map(Number)[0];
}

function handleData(data)
{
  console.log(data);
}

function buttonClick()
{
  var message = $("#messageBox").val();
  $.get(`message/${message}`, handleData);
  $("#messageBox").val("");
}

function attachEventListeners()
{
  $("#messageBox").keydown((e) => {
    if (e.keyCode == 13) buttonClick();
  });
  // $("#messageBox").focus(() => {
  //   paddingLeft = extractNumber($("#messageBox").css("padding-left"));
  //   buttonWidth = extractNumber($("#sendButton").css("width"));
  //   paddingRight = paddingLeft + buttonWidth;
  //   $("#sendButton").show();
  //   $("#messageBox").css("padding-right", paddingRight);
  // });
  // $("#submitArea").blur(() => {
  //   paddingLeft = extractNumber($("#messageBox").css("padding-left"));
  //   $("#sendButton").hide();
  //   $("#messageBox").css("padding-right", paddingLeft);
  // });
}

function init()
{
  attachEventListeners();

}

$(document).ready(init);
