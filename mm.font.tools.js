/*
Original authors are
Font Busters - http://userscripts.org/scripts/show/42941 (mm font detection)
MM Font Tagger : http://userscripts.org/scripts/review/103745 (modified code particualarly the use of MutationObserver)
*/

function loadJquery(){
    if(jQuery == 'undefined') {
        chrome.tabs.executeScript(null, {file: 'jquery.min.js'})
    }
}

function addHandles() {
    chrome.runtime.onMessage.addListener(function(request, sender, callBack) {
        if (request.what == "getClickedElement") {
            callBack({value: 'hi' });
        }
    });
}

function injectCss(){
    var path = chrome.extension.getURL('mm.css');
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
}

(function() {
    addHandles();
    injectCss();
    var list = document.querySelector('body');
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.nodeType === Node.TEXT_NODE) {} else {
                        tagNode(node);
                    }
                }
            } else if (mutation.type === 'characterData') {
                tagNode(mutation.target);
            }
        });
    });
    
    observer.observe(list, {
        childList: true,
        attributes: false,
        characterData: true,
        subtree: true
    });
    
    var regexMM = new RegExp("[\u1000-\u109f\uaa60-\uaa7f]+");
    var regexZG = new RegExp("\s\u1031| ေ[က-အ]်|[က-အ]း");
    var cZawgyi = "__zg";
    
    var tagNode = function(node) {
        if (node.className && node.className.indexOf && (node.className.indexOf(cZawgyi) !== -1)) {
            return;
        }
        if (node.nodeType == Node.TEXT_NODE) {
            var text = node.textContent;
            if (!regexMM.test(text)) {
                return;
            }
            if (text) {
                var prNode = node.parentNode;
                text = prNode.textContent;
                if (regexZG.test(text)) {
                    prNode.className += ' ' + cZawgyi;
                }
            }
        } else {
            for (var i = 0; i < node.childNodes.length; i++) {
                var child = node.childNodes[i];
                tagNode(child);
            }
        }
    }
    if (document && document.body) tagNode(document.body);
})();
