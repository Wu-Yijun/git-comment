function generateLoremText(numParagraphs, numWords, elemTag = { left: "<div>", right: "</div>" }) {
    var loremText = '';
    var words = [
        'Lorem',
        'ipsum',
        'dolor',
        'sit',
        'amet',
        'consectetur',
        'adipiscing',
        'elit',
        'sed',
        'do',
        'eiusmod',
        'tempor',
        'incididunt',
        'ut',
        'labore',
        'et',
        'dolore',
        'magna',
        'aliqua',
        'Ut',
        'enim',
        'ad',
        'minim',
        'veniam',
        'quis',
        'nostrud',
        'exercitation',
        'ullamco',
        'laboris',
        'nisi',
        'ut',
        'aliquip',
        'ex',
        'ea',
        'commodo',
        'consequat',
        'Duis',
        'aute',
        'irure',
        'dolor',
        'in',
        'reprehenderit',
        'in',
        'voluptate',
        'velit',
        'esse',
        'cillum',
        'dolore',
        'eu',
        'fugiat',
        'nulla',
        'pariatur',
        'Excepteur',
        'sint',
        'occaecat',
        'cupidatat',
        'non',
        'proident',
        'sunt',
        'in',
        'culpa',
        'qui',
        'officia',
        'deserunt',
        'mollit',
        'anim',
        'id',
        'est',
        'laborum',
    ];

    for (var i = 0; i < numParagraphs; i++) {
        var paragraph = '';
        for (var j = 0; j < numWords; j++) {
            var randomWord = words[Math.floor(Math.random() * words.length)];
            paragraph += randomWord + ' ';
        }
        loremText += elemTag.left + paragraph + elemTag.right;
        // loremText += paragraph + '.\n';
        // loremText += paragraph + '';
    }
    return loremText;
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
        this.sampleDom = commentManager.parseToDOM(info.htmlString);
        this.domContainer = info.dom || document.getElementsByClassName("comment-container")[0] || document.createElement("div");
        this.doms = [];
        for (let i = 0; i < this.numberPerPage; i++) {
            this.appendDom();
        }
    }
    static parseToDOM(htmlString) {
        const tpl = document.createElement('template');
        tpl.innerHTML = htmlString;
        return tpl.content;
    }
    static setHTML(dom, className, html) {
        Array.prototype.forEach.call(dom.getElementsByClassName(className), (el) => {
            el.innerHTML = html;
        });
    }
    static setACTION(dom, className, action) {
        Array.prototype.forEach.call(dom.getElementsByClassName(className), action);
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
        return {
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
        commentManager.setHTML(dom, "comment-icon", `<img src="${comment.usericon}">`);
        commentManager.setHTML(dom, "comment-user", comment.username);
        commentManager.setHTML(dom, "comment-date", comment.date.toLocaleString());
        commentManager.setHTML(dom, "comment-id", '#' + comment.id);
        if (comment.quote.exist) {
            commentManager.setACTION(dom, "comment-quote-text", (el) => { el.innerText = comment.quote.text; });
            commentManager.setACTION(dom, "comment-quote-container", (el) => { el.style.display = "block"; });
            if (comment.quote.toolbar) {
                commentManager.setHTML(dom, "comment-quote-id", '#' + comment.quote.id);
                commentManager.setHTML(dom, "comment-quote-user", comment.quote.username);
                commentManager.setHTML(dom, "comment-quote-date", comment.quote.date.toLocaleString());
                commentManager.setACTION(dom, "comment-quote-toolbar", (el) => { el.style.display = "flex"; });
            } else {
                commentManager.setACTION(dom, "comment-quote-toolbar", (el) => { el.style.display = "none"; });
            }
        } else {
            commentManager.setACTION(dom, "comment-quote-container", (el) => { el.style.display = "none"; });
        }
        commentManager.setHTML(dom, "comment-entry", comment.text);
        let overflowed = false;
        commentManager.setACTION(dom, "comment-entry", (el) => {
            if (el.clientHeight < el.scrollHeight)
                overflowed = true;
        });
        if(overflowed){
            commentManager.setACTION(dom, "comment-op-expand", (el) => { el.style.display = "block"; });
        }else{
            commentManager.setACTION(dom, "comment-op-expand", (el) => { el.style.display = "none"; });
        }
    }
}