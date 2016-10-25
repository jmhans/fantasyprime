//$("#msg").html("change it");

document.getElementById("msg").innerHTML = "Paragraph changed!"

//Added a comment


var url = "https://spreadsheets.google.com/feeds/cells/0AtMEoZDi5-pedElCS1lrVnp0Yk1vbFdPaUlOc3F3a2c/od6/public/basic?alt=json";
$.ajax({
    url: url,
    dataType: "jsonp",
    success: function (data) {
        // data.feed.entry is an array of objects that represent each cell
        alert('got here!');
    },
})