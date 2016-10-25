$("msg").html("say something");

$.get("https://spreadsheets.google.com/feeds/list/0AtMEoZDi5-pedElCS1lrVnp0Yk1vbFdPaUlOc3F3a2c/od6/public/values?alt=json-in-script&callback=x", function (data) {
    $("msg").html(data);
    alert("Load was performed.");
});
