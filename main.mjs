import commentManager from "./commentManager.mjs"

var hstr = await (await fetch("./comment-item.html")).text();
var cm = new commentManager({
    htmlString: hstr
});
for (let i = 0; i < 10; i++)
    cm.setDomComment(i, 0);

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