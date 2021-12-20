let height = 0;
let scroll = 0;

function resize() {
    var handler = document.querySelector('.handler');
    var wrapper = document.querySelector('.wrapper');
    var boxA = document.querySelector('.box');
    var isHandlerDragging = false;

    document.addEventListener('mousedown', function(e) {
        if (e.target === handler) {
            isHandlerDragging = true;
            document.getElementById("shield-left").style.display = "block";
            document.getElementById("shield-right").style.display = "block";
        }
    });

    document.addEventListener('mouseup', function(e) {
        isHandlerDragging = false;
        document.getElementById("shield-left").style.display = "none";
        document.getElementById("shield-right").style.display = "none";
    });

    document.addEventListener('mousemove', function(e) {
        if (!isHandlerDragging) {
            return false;
        }

        var containerOffsetLeft = wrapper.offsetLeft;
        var pointerRelativeXpos = e.clientX - containerOffsetLeft;
        var boxAminWidth = 60;
        boxA.style.width = (Math.max(boxAminWidth, pointerRelativeXpos - 8)) + 'px';
        boxA.style.flexGrow = 0;
    });
}

function onscroll(e) {
    var value = e.target.scrollLeft;
    document.querySelector("#left").contentWindow.postMessage({type:"Scroll", value: value}, '*');
    document.querySelector("#right").contentWindow.postMessage({type:"Scroll", value: value}, '*');
}

function onresize() {
    scroll = 0;
    height = 0;
    document.querySelector("#left").contentWindow.postMessage({type:"Resize"}, '*');
    document.querySelector("#right").contentWindow.postMessage({type:"Resize"}, '*');
}

function onload(e) { 
    let iframe = e.target;
    iframe.contentWindow.postMessage({type: "Load"}, '*');
    window.addEventListener("message", function(event) {
        if (event.data) {
            if (event.data.height && event.data.scroll) {
                var scrollbar = document.querySelector(".scroll");
                height = Math.max(event.data.height, height);
                scroll = Math.max(event.data.scroll, scroll);
                document.body.style.height = height + "px";
                if (scrollbar) {
                    scrollbar.style.width = scroll + "%";
                }
            } else if (event.data.url) {
                var url = $.url(event.data.url);
                // Do not attempt a page refresh if current query is same as the previous query
                // This will help avoid unexpected circumstances where Bing or Google may push new state to only update location hash
                var prevQuery = $.url().param("q");
                var nextQuery = url.param("q");
                if (nextQuery !== prevQuery) {
                    location.href = "/search.html?q=" + encodeURIComponent(nextQuery);
                }
            }
        }
    }, false);
}

const shopPrefix = "shop ";
$( document ).ready(function() {
    resize();
    let left = "https://www.google.com/search?ds=1&q=";
    let right = "https://search.naver.com/search.naver?ds=1&query=";
    var url = $.url();
    var query = url.param("q");
    if (typeof query != 'undefined')
    {
        if (query.toLowerCase().indexOf(shopPrefix) === 0) {
            query = query.substr(shopPrefix.length);
            left = left.replace("search?", "shop?");
            right = "https://search.shopping.naver.com/search/all?query=";
        }
        $("#left").load(onload);
        $("#right").load(onload);
        $("#left").attr("src", left + encodeURIComponent(query));
        $("#right").attr("src", right + encodeURIComponent(query));
        $("#scrollbar").scroll(onscroll);
        $(window).resize(onresize);
        document.title = query.replace(/</g, "&lt;").replace(/>/g, "&gt;") + " - Double Shot Search";
    }
});
