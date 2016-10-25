//$("#msg").html("change it");

document.getElementById("msg").innerHTML = "Paragraph changed!"

//Added a comment


var url = "https://spreadsheets.google.com/feeds/list/1-T37CNjD3u4mO2p21rKbajCPgyhigC-M9pySexxF_Pg/om6s0f5/public/basic?alt=json";
$.ajax({
    url: url,
    dataType: "jsonp",
    success: function (data) {
        // data.feed.entry is an array of objects that represent each cell
        alert('got here!');
    },
})