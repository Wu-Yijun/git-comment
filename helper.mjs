export default function generateLoremText(numParagraphs, numWords, elemTag = { left: "<div>", right: "</div>" }) {
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