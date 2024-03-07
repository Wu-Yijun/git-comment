import commentManager from "./commentManager.mjs";

async function run(loadFromStorage) {
    let cmjson = null;
    if (loadFromStorage) {
        cmjson = JSON.parse(localStorage.getItem("cmjson"));
    } else {
        cmjson = await (await fetch("https://api.github.com/repos/Wu-Yijun/git-comment/issues/4/comments")).json();
        localStorage.setItem("cmjson", JSON.stringify(cmjson));
    }
    const hstr = await (await fetch("./comment-item.html")).text();
    const textarea = await (await fetch("./comment-textarea-item.html")).text();

    let cm = new commentManager({
        htmlString: hstr,
        textarea: textarea,
        json: cmjson,
    });
    for (let i = 0; i < 2; i++)
        cm.setDomComment(i, i);

    Array.prototype.forEach.call(document.getElementsByClassName("Github-Login"), (dom) => {
        const menu = dom.getElementsByClassName("Github-Login-Menu")[0];
        let tm_out = null;
        dom.onmouseenter = ()=>{
            menu.style.display = "flex";
            menu.style.maxHeight = "100px";
            menu.style.opacity = 1;
            if(tm_out)
                clearTimeout(tm_out);
        }
        dom.onmouseleave = ()=>{
            menu.style.maxHeight = "0px";
            menu.style.opacity = 0;
            if(tm_out)
                clearTimeout(tm_out);
            tm_out = setTimeout(()=>{
                menu.style.display = "none";
                tm_out = null;
            }, 2000);
        }

    });
}

run(true);

