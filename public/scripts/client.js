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
}

function init()
{
  attachEventListeners();
}

$(document).ready(init);
