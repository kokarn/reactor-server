const punycode = require( 'punycode' );
const emojiList = require( './emoji-list' );

module.exports = function( rawText ) {
    const allEmoji = emojiList();
    let emojiText = rawText;

    const emojiData = allEmoji.find( ( currentEmoji ) => {
        return currentEmoji.short_name == rawText;
    } );

    if ( !emojiData ) {
        console.error( `Unable to locate emoji ${ rawText }` );

        return '';
    }

    // Emoji can have multiple unicode points
    let points = emojiData.unified
        .split( '-' )
        .map( ( point ) => {
            return parseInt( point, 16 );
        } );

    emojiText = emojiText.replace( rawText, punycode.ucs2.encode( points ) );

    return emojiText;
}
