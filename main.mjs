import commentManager from "./commentManager.mjs"

var cmjson = await (await fetch("https://api.github.com/repos/Wu-Yijun/git-comment/issues/2/comments")).json();
var hstr = await (await fetch("./comment-item.html")).text();

var cm = new commentManager({
    htmlString: hstr,
    json: cmjson
});
for (let i = 0; i < 10; i++)
    cm.setDomComment(i, i);

// let doms = document.getElementsByClassName("comment-container");
// for (let i = 0; i < doms.length; ++i) {
//     let dom = doms[i];
//     // dom.content = cm.sampleDom;
//     let a = cm.sampleDom.cloneNode(true);
//     console.log(a)
//     console.log(cm.sampleDom)
//     dom.append(cm.sampleDom)
//     cm.sampleDom = dom.lastChild
//     dom.append(a)
//     a = dom.lastChild
//     console.log(cm.sampleDom)
//     console.log(a)
//     // console.log(cm.sampleDom)
// }