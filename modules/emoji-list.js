let emojiData = false;

( async () => {
    console.log( 'Loading emoji data' );
    const response = await fetch( 'https://raw.githack.com/iamcal/emoji-data/master/emoji_pretty.json');

    emojiData = await response.json();
} )();

module.exports = function emojiList() {
    return emojiData;
};

