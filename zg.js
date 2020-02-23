/*
Author: Lwin Moe (lwinmoe.org)

Credits:
  - Heavily taken from Myanmar Font Tools (https://github.com/kominko/mmft)
  - Zawgyi Regular Expression was taken from MUA Web Unicode Converter (https://github.com/sanlinnaing/MUA-Web-Unicode-Converter)
*/


var regexMM = new RegExp("[\u1000-\u109f\uaa60-\uaa7f]+");

function isMyanmar(input) {
    if (regexMM.test(input)) {
        return true;
    }
    return false;
}

// This regular expression is from MUA Web Unicode Converter
var zawgyiRegex = "\u1031\u103b" // e+medial ra
    // beginning e or medial ra
    + "|^\u1031|^\u103b"
    // independent vowel, dependent vowel, tone , medial ra wa ha (no ya
    // because of 103a+103b is valid in unicode) , digit ,
    // symbol + medial ra
    + "|[\u1022-\u1030\u1032-\u1039\u103b-\u103d\u1040-\u104f]\u103b"
    // end with asat
    + "|\u1039$"
    // medial ha + medial wa
    + "|\u103d\u103c"
    // medial ra + medial wa
    + "|\u103b\u103c"
    // consonant + asat + ya ra wa ha independent vowel e dot below
    // visarga asat medial ra digit symbol
    + "|[\u1000-\u1021]\u1039[\u101a\u101b\u101d\u101f\u1022-\u102a\u1031\u1037-\u1039\u103b\u1040-\u104f]"
    // II+I II ae
    + "|\u102e[\u102d\u103e\u1032]"
    // ae + I II
    + "|\u1032[\u102d\u102e]"
    // I II , II I, I I, II II
    //+ "|[\u102d\u102e][\u102d\u102e]"
    // U UU + U UU
    //+ "|[\u102f\u1030][\u102f\u1030]" [ FIXED!! It is not so valuable zawgyi pattern ]
    // tall aa short aa
    //+ "|[\u102b\u102c][\u102b\u102c]" [ FIXED!! It is not so valuable zawgyi pattern ]
    // shan digit + vowel
    + "|[\u1090-\u1099][\u102b-\u1030\u1032\u1037\u103c-\u103e]"

    // consonant + medial ya + dependent vowel tone asat
    //+ "|[\u1000-\u102a]\u103a[\u102c-\u102e\u1032-\u1036]"
    // removed 102d because some input system had a bug causing: consonant + 103a 102d 102f
    // it's a bug from input system.
    + "|[\u1000-\u102a]\u103a[\u102c\u102e\u1032-\u1036]"

    // independent vowel dependent vowel tone digit + e [ FIXED !!! - not include medial ]
    + "|[\u1023-\u1030\u1032-\u1039\u1040-\u104f]\u1031"
    // other shapes of medial ra + consonant not in Shan consonant
    + "|[\u107e-\u1084][\u1001\u1003\u1005-\u100f\u1012-\u1014\u1016-\u1018\u101f]"
    // u + asat
    + "|\u1025\u1039"
    // eain-dray
    + "|[\u1081\u1083]\u108f"
    // short na + stack characters
    + "|\u108f[\u1060-\u108d]"
    // I II ae dow bolow above + asat typing error
    + "|[\u102d-\u1030\u1032\u1036\u1037]\u1039"
    // aa + asat awww
    + "|\u102c\u1039"
    // ya + medial wa
    + "|\u101b\u103c"
    // non digit + zero + \u102d (i vowel) [FIXED!!! rules tested zero + i vowel in numeric usage]
    + "|[^\u1040-\u1049]\u1040\u102d"
    // e + zero + vowel
    + "|\u1031?\u1040[\u102b\u105a\u102e-\u1030\u1032\u1036-\u1038]"
    // e + seven + vowel
    + "|\u1031?\u1047[\u102c-\u1030\u1032\u1036-\u1038]"
    // cons + asat + cons + virama
    //+ "|[\u1000-\u1021]\u103A[\u1000-\u1021]\u1039" [ FIXED!!! REMOVED!!! conflict with Mon's Medial ]
    // U | UU | AI + (zawgyi) dot below
    + "|[\u102f\u1030\u1032]\u1094"
    // virama + (zawgyi) medial ra
    + "|\u1039[\u107E-\u1084]";

var regexZG = new RegExp(zawgyiRegex);

function isZawgyi(input) {
    input = input.trim();
    //console.log(input);
    if (regexZG.test(input)) {
        return true;
    }
    return false;
}

function shouldIgnoreNode(node) {
    if (!node) {
        return true;
    }
    if (node.nodeName == "INPUT" || node.nodeName == "SCRIPT" || node.nodeName == "TEXTAREA") {
        return true;
    } else if (node.isContentEditable == true) {
        return true;
    }
    return false;
}

function injectCss(){
    var path = chrome.extension.getURL('zg.css');
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
}

(function() {
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

    var cZawgyi = "__zg";

    var tagNode = function(node) {
        if (node.className && node.className.indexOf && (node.className.indexOf(cZawgyi) !== -1)) {
            return;
        }
        if (shouldIgnoreNode(node.parentNode)) {
            return;
        }
        if (node.nodeType == Node.TEXT_NODE) {
            var text = node.textContent;
            if (!isMyanmar(text)) {
                return;
            }
            if (text) {
                var prNode = node.parentNode;
                text = prNode.textContent;
                if (isZawgyi(text)) {
                    prNode.className += ' ' + cZawgyi;
                    prNode.style.setProperty("font-family", "ZawGyi-One", "important");
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
