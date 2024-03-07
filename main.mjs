import commentManager from "./commentManager.mjs"

async function run(loadFromStorage){
    let cmjson = null;
    if(loadFromStorage){
        cmjson = JSON.parse(localStorage.getItem("cmjson"));
    }else{
        cmjson = await (await fetch("https://api.github.com/repos/Wu-Yijun/git-comment/issues/2/comments")).json();
        localStorage.setItem("cmjson",JSON.stringify(cmjson));
    }
    let hstr = await (await fetch("./comment-item.html")).text();

    let cm = new commentManager({
        htmlString: hstr,
        json: cmjson
    });
    for (let i = 0; i < 10; i++)
        cm.setDomComment(i, i);
}

run(true);

