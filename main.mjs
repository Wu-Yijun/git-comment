import commentManager from "./commentManager.mjs";

async function run(loadFromStorage) {
    let cmjson = null;
    if (loadFromStorage && localStorage.getItem("cmjson")) {
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
        gitinfo: {
            drawLoginIcon: true,
        },
    });
    // for (let i = 0; i < 2; i++)
    //     cm.setDomComment(i, i);


}

run(true);

