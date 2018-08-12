function handleData(data)
{
  console.log(data);
}

function buttonClick()
{
  var message = $("#messageBox")[0].value;
  $.get(`message/${message}`, handleData);
}

function attachEventListeners()
{
  $("#messageBox").keydown((e) => {
    if (e.keyCode == 13) buttonClick();
  })
}

$(document).ready(attachEventListeners);
