import myFloatingNotify from '/MyFloatingNotify.js';

import generateLoremText from './helper.mjs';

const DefaultConsts = {
    TopUrl: 'https://wu-yijun.github.io/',
    UserHomeUrl: '/UserHome',
    UserHomeUrl: '/UserHome',
    log: `<img src="/Login.svg" height="20px">
        登录
        <img src="/GitHubR.svg" height="15px">
        <img src="/GithubIcon.svg" height="25px">`,
    user: ` <img class="Github-Login-User-Icon" src="/GithubIcon.svg" height="25px">
        <div class="Github-Login-User-Name">UserName</div>
        <div class="Github-Login-Menu-Container">
            <div class="Github-Login-Menu">
                <div class="Github-Login-Usercenter">
                    <div>个人中心</div>
                </div>
                <div class="Github-Login-Homepage">
                    <div>Github主页</div>
                </div>
                <div class="Github-Login-Logout">
                    <div>登出</div>
                </div>
            </div>
        </div>`,
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
        if (typeof obj[item] === 'string') {
            res[item] = decodeURIComponent(obj[item]);
        } else if (typeof obj[item] == 'object') {
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

function jsontoo(json) {
    return uritoo(JSON.parse(json));
}



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


class GitControl {
    oauthInfo = {
        Owner: 'Wu-Yijun',
        Repo: 'git-comment',
        Issue: '4',
        CorsUrl: 'https://cors-anywhere.azm.workers.dev/',
        // CorsUrl: "https://cors-anywhere.herokuapp.com/",
        Scope: 'public_repo',

        GitLoginClass: 'Github-Login',

        drawLoginIcon: false,

        /** Release */
        // ClientID: "dbcd04607ec374d71003",
        // ClientSecret: "10d91bdc6fc31ebccc2cf4a9a8f64365e78e24eb",
        // Url: "https://wu-yijun.github.io/testGitLogin/main.html",
        /** Debug */
        ClientID: '16fbb434c9ac82d2bb67',
        ClientSecret: '37b893febb019776f791e3db171b9fcf6d0e9fcc',
        // Url: "http://localhost:5500/testGitLogin/main.html",
        Url: 'http://localhost:5500/main.html',
    };
    static GithubAuthUrl = 'https://github.com/login/oauth/authorize';
    static GithubAccessTokenUrl = 'https://github.com/login/oauth/access_token';

    access_token = '';
    userInfo = {};
    loggedin = false;

    constructor(oauthInfo) {
        Object.assign(this.oauthInfo, oauthInfo);

        this.access_token = localStorage.getItem('access_token');
        if (this.access_token &&
            (typeof this.access_token === 'string' || this.access_token instanceof String) &&
            this.access_token.length > 0) {
            this.getInfo();
            return;
        }
        let code = null;
        let logged = false;
        try {
            code = new URLSearchParams(location.search).get('code');
            if (code)
                logged = true;
        } catch (e) {
            console.log('Error: ', e);
        }
        if (logged) {
            myFloatingNotify(' code = ' + code);
            this.getAuthorization(code);
        } else {
            this.enableLogin(this.oauthInfo.drawLoginIcon);
        }
    };

    static REQUEST(type = 'POST', url, header, data, resposeFun, retried = 3) {
        var request = new XMLHttpRequest();
        request.open(type, url, true);
        request.timeout = 0;
        request.onreadystatechange = () => {
            if (!request || request.readyState !== 4) {
                return;
            }
            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 &&
                !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
                return;
            }
            resposeFun(request);
            request = null;
        };
        request.ontimeout = () => {
            request = null;
            if (retried <= 0) {
                console.error('request Time out!');
                return;
            }
            console.log('request Timeour... Retried... ' + retried);
            this.REQUEST(type, url, header, data, resposeFun, retried - 1);
        };
        request.onerror = () => {
            request = null;
            if (retried <= 0) {
                console.error('request Error!');
                return;
            }
            console.log('request Error... Retried... ' + retried - 1);
            this.REQUEST(type, url, header, data, resposeFun, retried - 2);
        };
        for (let i in header) {
            request.setRequestHeader(i, header[i]);
        }
        request.send(data);
    }

    enableLogin(reset = false) {
        Array.prototype.forEach.call(
            document.getElementsByClassName(this.oauthInfo.GitLoginClass), (dom) => {
                if (reset)
                    dom.innerHTML = DefaultConsts.log;
                setTimeout(() => {
                    dom.onclick = () => {
                        location.href = GitControl.GithubAuthUrl + '?' +
                            `client_id=${this.oauthInfo.ClientID}` +
                            '&' +
                            `redirect_uri=${this.oauthInfo.Url}` +
                            '&' +
                            `scope=${this.oauthInfo.Scope}`;
                    };
                }, reset ? 1000 : 0);
            });
        myFloatingNotify('You can login to github');
    }

    userInfo = {
        /*icon*/
        avatar_url: 'https://avatars.githubusercontent.com/u/126391865?v=4',  // 1234
        // name
        login: 'Wu-Yijun',
        // github id
        id: 126391865,
        // homepage
        html_url: 'https://github.com/Wu-Yijun',
    };
    // also disable login
    showInfo() {
        if (!this.loggedin) {
            myFloatingNotify('You are not logged in yet!!', 2000);
            this.enableLogin(true);
            return;
        }
        Array.prototype.forEach.call(
            document.getElementsByClassName(this.oauthInfo.GitLoginClass), (elem) => {
                elem.onclick = null;
                elem.innerHTML = DefaultConsts.user;
                Array.prototype.forEach.call(
                    elem.getElementsByClassName('Github-Login-User-Icon'), (dom) => {
                        dom.src = this.userInfo.avatar_url;
                    });
                Array.prototype.forEach.call(
                    elem.getElementsByClassName('Github-Login-User-Name'), (dom) => {
                        dom.innerText = this.userInfo.login;
                    });
                Array.prototype.forEach.call(
                    elem.getElementsByClassName('Github-Login-Usercenter'), (dom) => {
                        dom.onclick = (e) => {
                            // 个人中心
                            location.href = DefaultConsts.UserHomeUrl;
                        };
                    });
                Array.prototype.forEach.call(
                    elem.getElementsByClassName('Github-Login-Homepage'), (dom) => {
                        dom.onclick = (e) => {
                            // Github主页
                            location.href = this.userInfo.html_url;
                        };
                    });
                Array.prototype.forEach.call(
                    elem.getElementsByClassName('Github-Login-Logout'), (dom) => {
                        dom.onclick = (e) => {
                            localStorage.removeItem('access_token');
                            this.loggedin = false;
                            this.userInfo = '';
                            this.access_token = '';
                            this.enableLogin(true);
                            myFloatingNotify('退出登录！');
                        };
                    });
                // Show user menu
                Array.prototype.forEach.call(
                    elem.getElementsByClassName('Github-Login-Menu'), (menu) => {
                        let tm_out = null;
                        elem.onmouseenter = () => {
                            menu.style.maxHeight = '100px';
                            menu.style.opacity = 1;
                            if (tm_out)
                                clearTimeout(tm_out);
                        };
                        elem.onmouseleave = () => {
                            menu.style.maxHeight = '0px';
                            menu.style.opacity = 0;
                            if (tm_out)
                                clearTimeout(tm_out);
                            tm_out = setTimeout(() => {
                                tm_out = null;
                            }, 2000);
                        };
                    });
            });
    }

    getAuthorization(code) {
        const url = this.oauthInfo.CorsUrl + GitControl.GithubAccessTokenUrl;
        const header = {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=utf-8',
        };
        const content = JSON.stringify({
            code: code,
            client_id: this.oauthInfo.ClientID,
            client_secret: this.oauthInfo.ClientSecret,
        });
        GitControl.REQUEST('POST', url, header, content, (request) => {
            const info = JSON.parse(request.responseText);
            if (info.token_type == 'bearer') {
                myFloatingNotify('access_token = ' + info.access_token);
                localStorage.setItem('access_token', info.access_token);
                this.access_token = info.access_token;
                /** this will not reload pages. */
                history.replaceState({code: code}, '', this.oauthInfo.Url);
                this.getInfo();
            }
        }, 1);
    }

    getInfo(retried = 3) {
        const url = 'https://api.github.com/user';
        const header = {
            'Content-Type': 'application/json',
            'Authorization': 'token ' + this.access_token,
        };
        const data = null;
        GitControl.REQUEST('GET', url, header, data, (request) => {
            let userInfo = null;
            let failed = false;
            try {
                userInfo = request.responseText;
                userInfo = JSON.parse(userInfo);
            } catch (e) {
                console.log(e);
                failed = true;
            }
            console.log(userInfo);
            if (failed) {
                if (retried > 0) {
                    myFloatingNotify('Retrying Authorization... ' + retried);
                    GitControl.getInfo(access_token, retried - 1);
                } else {
                    myFloatingNotify('Authorization Invalid! Need to login again!');
                    localStorage.removeItem('access_token');
                    this.enableLogin();
                }
                return;
            } else {
                myFloatingNotify('Successfully get userInfo!', 2 * 1000);
                this.userInfo = userInfo;
                this.loggedin = true;
                this.showInfo();
                return;
            }
        });
    }

    CreateComment(content, callback) {
        if (!this.loggedin) {
            myFloatingNotify('You are not logged in yet!!', 2000);
            this.enableLogin(true);
            return;
        }
        const url = `https://api.github.com/repos/${this.oauthInfo.Owner}/${
            this.oauthInfo.Repo}/issues/${this.oauthInfo.Issue}/comments`;
        const header = {
            'Accept': 'application/vnd.github.v3.full+json',
            'Authorization': 'token ' + this.access_token,
            'Content-Type': 'application/json;charset=utf-8',
        };
        const data = JSON.stringify({
            body: content,
        });
        GitControl.REQUEST('POST', url, header, data, callback);
    }

    asynGetCommentNum() {
        const url = `https://api.github.com/repos/${this.oauthInfo.Owner}/${
            this.oauthInfo.Repo}/issues/${this.oauthInfo.Issue}`;
        const header = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'token ' + this.access_token,
        };
        const data = null;
        return new Promise((resolve, reject) => {
            GitControl.REQUEST('GET', url, header, data, (request) => {
                try {
                    const number = Number(JSON.parse(request.responseText).comments);
                    if (number && number >= 0) {
                        resolve(number);
                    } else {
                        resolve(-1);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
};

class ReplyControl {
    static uid = 0;
    static getUid() {
        return ++ReplyControl.uid;
    }
    config = {
        sampleTextarea: null,
        git: null,
        comment: null,
    };
    comments = [];
    constructor(config) {
        Object.assign(this.config, config);
        setACTION(document, 'comment-textarea', (container) => {
            let node = this.config.sampleTextarea.cloneNode(true);
            container.append(node);
            const cc = container.lastChild;
            const id = ReplyControl.getUid();
            const textarea = cc.getElementsByClassName('comment-textarea-texts')[0];
            if (!(textarea)) {
                return;
            }
            setACTION(cc, 'comment-textarea-submit', (submit) => {
                submit.onclick =
                    () => {
                        const text = textarea.innerHTML;
                        console.log('ready to submit-content:', text);
                        if (!this.config.git.loggedin) {
                            myFloatingNotify('You have not yet logged in');
                            return;
                        }
                        this.config.comment
                            .newComment(text, {
                                exist: false,
                                refered: false,
                                id: -1,
                                username: 'Anonymous',
                                userid: -1,
                                date: new Date(),
                                text: '该引文内容无法正常显示',
                            })
                            .then(() => {myFloatingNotify('Success in creating comment!')});
                    }
            })
        });
    }
}

// console.log(otojson(templateJSON));

export default class commentManager {
    constructor(config) {
        Object.assign(this.config, config);
        this.gitControl = new GitControl(this.config.gitinfo);
        this.relpyControl = new ReplyControl({
            git: this.gitControl,
            comment: this,
            sampleTextarea: parseToDOM(this.config.htmlTextarea),
        });
        this.sampleDom = parseToDOM(this.config.htmlString);

        let i = 0;
        for (let j of config.json) {
            this.addJson(j);
        }
        config.json = null;
        for (let i = 0; i < this.numberPerPage; i++) {
            this.appendDom();
        }
    }
    config = {
        numberPerPage: 10,
        domContainer: document.getElementsByClassName('comment-contents')[0] ||
            document.createElement('div'),
        gitinfo: null,
        htmlTextarea: null,
        htmlString: null,
    };
    defaultComment = {
        requested: false,            /** if this item is requested */
        valid: false,                /** if this item is valid */
        deleted: false,              /** if this item is deleted by user */
        hide: false,                 /** if this item is hidden of any reasons */
        id: -1,                      /** comment id(should be same with orders in git issues) */
        username: 'Anonymous',       /** User name */
        usericon: './Anonymous.svg', /** User Icon Url */
        userid: -1,                  /** User Id in My blog **Not in Github!** */
        date: new Date(),            /** date of the comment */
        quote: {
            /** if have quoted, the quoted origin */
            exist: true,           /** is quoted */
            refered: false,        /** is quoted from my blog instead of comment */
            id: -1,                /** the quoted comment id */
            username: 'Anonymous', /** the quoted comment User name */
            userid: -1,            /** the quoted comment User name */
            date: new Date(),      /** date of the quoted comment */
            text: '该引文内容无法正常显示，请稍后重试或联系开发者.....',
        },
        text: '该正文内容无法正常显示，请稍后重试或联系开发者.....',
    };
    doms = [];
    // comments
    comments = [];

    addJson(j) {
        let json = {};
        Object.assign(json, this.defaultComment);
        try {
            Object.assign(json, jsontoo(j.body));
            console.log(json);
        } catch (e) {
            console.log('Processing body of #' + json.id + ' interrupted with error:\n', e);
        }
        this.comments.push(json);
    }
    appendDom() {
        let a = this.sampleDom.cloneNode(true);
        this.domContainer.append(a);
        this.doms.push(this.domContainer.lastChild);
        this.domContainer.lastChild.style.display = 'none';
    }
    async newComment(text, quote) {
        await this.getCommentNum();
        const qt = {};
        Object.assign(qt, quote);
        Object.assign(qt, this.defaultComment.quote);
        const comment = {
            request: true,
            valid: true,
            deleted: false,
            hide: false,
            id: this.commentsNum,
            username: this.gitControl.userInfo.login,
            usericon: this.gitControl.avatar_url,
            userid: this.gitControl.id,
            date: new Date(),
            text: text,
            quote: qt,
        };
        this.comments[this.gitControl.id] = comment;
        this.gitControl.CreateComment(otojson(comment), (response) => {
            console.log(JSON.parse(response.responseText));
        });
    }
    async getCommentNum() {
        const num = await this.gitControl.asynGetCommentNum();
        if(num > this.commentsNum)
            this.commentsNum = num;
        return this.commentsNum;
    }
    getComment(id) {
        if (id >= 0 && id < this.comments.length) {
            return this.comments[id];
        }
        this.defaultComment;
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
        const dom = this.getDom(index);
        if (comment.requested && comment.valid && (!comment.deleted)) {
            // valid
            dom.style.display = comment.hide ? 'none' : 'block';
        } else {
            // invalid
            return;
        }

        setHTML(dom, 'comment-icon', `<img src="${comment.usericon}">`);
        setHTML(dom, 'comment-user', comment.username);
        setHTML(dom, 'comment-date', comment.date.toLocaleString());
        setHTML(dom, 'comment-id', '#' + comment.id);
        if (comment.quote.exist) {
            setACTION(dom, 'comment-quote-text', (el) => {
                el.innerText = comment.quote.text;
            });
            setACTION(dom, 'comment-quote-container', (el) => {
                el.style.display = 'block';
            });
            if (comment.quote.refered) {
                setACTION(dom, 'comment-quote-toolbar', (el) => {
                    el.style.display = 'none';
                });
            } else {
                setHTML(dom, 'comment-quote-id', '#' + comment.quote.id);
                setHTML(dom, 'comment-quote-user', comment.quote.username);
                setHTML(dom, 'comment-quote-date', new Date(comment.quote.date).toLocaleString());
                setACTION(dom, 'comment-quote-toolbar', (el) => {
                    el.style.display = 'flex';
                });
            }
        } else {
            setACTION(dom, 'comment-quote-container', (el) => {
                el.style.display = 'none';
            });
        }
        setHTML(dom, 'comment-entry', comment.text);
        let overflowed = false;
        setACTION(dom, 'comment-entry', (el) => {
            if (el.clientHeight < el.scrollHeight)
                overflowed = true;
        });
        if (overflowed) {
            setACTION(dom, 'comment-op-expand', (el) => {
                el.style.display = 'block';
            });
        } else {
            setACTION(dom, 'comment-op-expand', (el) => {
                el.style.display = 'none';
            });
        }
    }
}