// Event listener
document.addEventListener('pollData', function(e) {
    if (!window._vr_native_) {
        window._vr_native_ = {};
    }
    window._vr_native_.poll = function () {
        return e.detail;
    }
});
document.addEventListener('command1', function(e) {
    if (!window._vr_native_) {
        window._vr_native_ = {};
    }
    window._vr_native_.exec = function () {
        return e.detail;
    }
});

//chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    //projection = msg.projection || def;
    //if (plugins.length) {
        //plugins.forEach(function (p) {
            //p.changeProjection(projection);
        //});
    //}
//});

(function (global) {
    var def = "Plane";
    var projection = def;
    var plugins = [];

    self.port.on("pollUrl", function (url) {
        var s = document.createElement('script');
        s.src = url;
        (document.head||document.documentElement).appendChild(s);
        s.onload = function() {
            s.parentNode.removeChild(s);
        };
    });

    var iconUrl = "unknown.png";
    self.port.on("sendIconUrl", function(url) {
        iconUrl = url;
        setInterval(checkVids, 3000);
    });
    checkVids();
    function checkVids () {
        var vids = document.getElementsByTagName('video');
        for (var i = 0; i < vids.length; i+=1) {
            var video = vids[i];
            if (!video.hasAttribute("data-vr-plugin-found")) {
                var icon = document.createElement("img");
                icon.src = iconUrl
                icon.style["position"] = "absolute";
                icon.style.top = "5px";
                icon.style.right = "5px";
                icon.style.cursor = "pointer";
                icon.addEventListener('click', function (evt) {
                    this.style.display = "none";
                    video.crossOrigin="Anonymous";
                    video.src = video.src;
                    video.load();
                    video.play();

                    //will need to add logic to handle different sites here
                    var contentEl = video.parentNode.children[0];

                    //aspect ratio stuff
                    var style = contentEl.style || {};
                    var aspect = (style.width && style.height) ? (style.width.replace(/\D+/, "") / style.height.replace(/\D+/, "")) : (4/3);

                    plugin = global.MAKE3D.init(video, {container: contentEl, projection: projection, aspectRatio: aspect });
                    plugins.push(plugin);
                    evt.stopPropagation();
                });
                video.setAttribute("data-vr-plugin-found", "true");
                (video.offsetParent || document.body).appendChild(icon);
            }
        };
    }

}(window));
