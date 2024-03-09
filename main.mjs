import commentManager from './commentManager.mjs';

async function run(loadFromStorage) {
    const cm = new commentManager({
        // domContainer
        htmlString: await (await fetch('./comment-item.html')).text(),
        htmlTextarea: await (await fetch('./comment-textarea-item.html')).text(),
        gitinfo: {
            drawLoginIcon: true,
        },
    });
}

run(false);
