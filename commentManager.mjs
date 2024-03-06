import generateLoremText from "./helper.mjs"

const templateJSON = {
    id: 1, // id of comment
    quoted: true,    // quoted any comment or from article
    refered: false,  // quoted from article
    quote_id: 2,    // if (quoted && !refered) id of quoted comment
    quote_user: "name", // if (quoted && !refered) name of quoted user
    quote_text: "引用文本 quoted sentences",  // if (quoted)
    quote_date: new Date(), // if (quoted && !refered) date of quoted comment
    text: "正文文本 Hello, world"     // contents of this comment
};

function otouri(obj) {
    let res = {};
    for (let item in obj) {
        if (obj[item] instanceof String) {
            res[item] = encodeURIComponent(obj[item]);
        } else if (obj[item] instanceof Date) {
            res[item] = encodeURIComponent(obj[item].toISOString());
        } else if (obj[item] instanceof Object) {
            res[item] = otouri(obj[item]);
        } else {
            res[item] = obj[item];
        }
    }
    return res;
}
function uritoo(obj) {
    let res = {};
    for (let item in obj) {
        if (typeof obj[item] === "string") {
            res[item] = decodeURIComponent(obj[item]);
        } else if (typeof obj[item] == "object") {
            res[item] = uritoo(obj[item]);
        } else {
            res[item] = obj[item];
        }
    }
    return res;
}
function otojson(obj) {
    return JSON.stringify(otouri(obj));
}
function jsontoo(json){
    return uritoo(JSON.parse(json));
}

// console.log(otojson(templateJSON));

function parseToDOM(htmlString) {
    const tpl = document.createElement('template');
    tpl.innerHTML = htmlString;
    return tpl.content;
}
function setHTML(dom, className, html) {
    Array.prototype.forEach.call(dom.getElementsByClassName(className), (el) => {
        el.innerHTML = html;
    });
}
function setACTION(dom, className, action) {
    Array.prototype.forEach.call(dom.getElementsByClassName(className), action);
}



export default class commentManager {
    constructor(info) {
        this.numberPerPage = info.numberPerPage || 10;
        this.comments = info.comments || {
            url: null,
            number: 0,
            overview: [],
            contents: []
        };
        this.sampleDom = parseToDOM(info.htmlString);
        this.domContainer = info.dom || document.getElementsByClassName("comment-container")[0] || document.createElement("div");
        this.doms = [];
        this.json = [];
        let i=0;
        for (let j of info.json) {
                // if(i++==6)
                //     debugger;
            this.addJson(j);
        }
        for (let i = 0; i < this.numberPerPage; i++) {
            this.appendDom();
        }
    }
    addJson(j) {
        let id = "unknown";
        try {
            id = j.id;
            j.json = jsontoo(j.body)
            console.log(j.json)
        } catch (e) {
            console.log("Processing body of #" + id + " interrupted with error:\n", e);
            j.json = templateJSON;
        }
        this.json.push(j);
    }
    appendDom() {
        let a = this.sampleDom.cloneNode(true);
        this.domContainer.append(a);
        this.doms.push(this.domContainer.lastChild);
    }
    addComment(info) {
        const id = ++this.comments.number;
        this.comments.overview.push({
            id: id,
            username: info.username || "Anonymous",
            usericon: info.usericon || "./Anonymous.svg",
            date: info.date || new Date(),
            quote: {
                exist: info.quoted,
                toolbar: info.quoted && info.toolbar,
                id: info.quote_id,
                text: info.quote_text,
            },
        })
        this.comments.contents.push({
            id: id,
        })
    }
    getComment(id) {
        if (id >= 0 && id < this.json.length) {
            let json = this.json[id];
            return {
                hide: false,
                id: Number(json.json.id),
                username: String(json.user.login || "Anonymous"),
                usericon: String(json.user.avatar_url || "./Anonymous.svg"),
                date: new Date(json.updated_at),
                quote: {
                    exist: json.json.quoted,
                    toolbar: !json.json.refered,
                    id: json.json.quote_id,
                    username: json.json.quote_user,
                    date: json.json.quote_date,
                    text: json.json.quote_text,
                },
                text: json.json.text
            };
        }
        return {
            hide: true,
            id: Math.round(Math.random() * 200),
            username: "Anonymous" + generateLoremText(1, 2, { left: " ", right: " " }),
            usericon: "./Anonymous.svg",
            date: new Date(),
            quote: {
                exist: !(Math.random() > 0.5),
                toolbar: !(Math.random() > 0.5),
                id: Math.round(Math.random() * 200),
                username: "Anonymous",
                date: new Date(),
                text: generateLoremText(1, Math.random() * 200, { left: "", right: ". " }),
            },
            text: generateLoremText(Math.random() * 4, Math.random() * 50)
        };
    }
    getDom(index) {
        if (index < 0)
            index = 0;
        if (index >= this.numberPerPage)
            index = this.numberPerPage - 1;
        return this.doms[index];
    }
    setDomComment(index, id) {
        const comment = this.getComment(id);
        let dom = this.getDom(index);
        dom.style.display = comment.hide ? "none" : "block";

        setHTML(dom, "comment-icon", `<img src="${comment.usericon}">`);
        setHTML(dom, "comment-user", comment.username);
        setHTML(dom, "comment-date", comment.date.toLocaleString());
        setHTML(dom, "comment-id", '#' + comment.id);
        if (comment.quote.exist) {
            setACTION(dom, "comment-quote-text", (el) => { el.innerText = comment.quote.text; });
            setACTION(dom, "comment-quote-container", (el) => { el.style.display = "block"; });
            if (comment.quote.toolbar) {
                setHTML(dom, "comment-quote-id", '#' + comment.quote.id);
                setHTML(dom, "comment-quote-user", comment.quote.username);
                setHTML(dom, "comment-quote-date", new Date(comment.quote.date).toLocaleString());
                setACTION(dom, "comment-quote-toolbar", (el) => { el.style.display = "flex"; });
            } else {
                setACTION(dom, "comment-quote-toolbar", (el) => { el.style.display = "none"; });
            }
        } else {
            setACTION(dom, "comment-quote-container", (el) => { el.style.display = "none"; });
        }
        setHTML(dom, "comment-entry", comment.text);
        let overflowed = false;
        setACTION(dom, "comment-entry", (el) => {
            if (el.clientHeight < el.scrollHeight)
                overflowed = true;
        });
        if (overflowed) {
            setACTION(dom, "comment-op-expand", (el) => { el.style.display = "block"; });
        } else {
            setACTION(dom, "comment-op-expand", (el) => { el.style.display = "none"; });
        }
    }
}