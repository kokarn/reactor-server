const { App } = require('@slack/bolt');
const Pusher = require('pusher');
const dockerSecret = require('@stendahls/docker-secrets-or-dotenv');

const emoji = require('./modules/emoji');

const app = new App({
    signingSecret: dockerSecret('SLACK_SIGNING_SECRET'),
    token: dockerSecret('SLACK_BOT_TOKEN'),
});

const pusher = new Pusher({
    appId: dockerSecret('PUSHER_APP_ID'),
    key: '518ab0476ccf565431b1',
    secret: dockerSecret('PUSHER_SECRET'),
    cluster: 'mt1',
    // useTLS: USE_TLS, // optional, defaults to false
    // encryptionMasterKeyBase64: ENCRYPTION_MASTER_KEY, // a base64 string which encodes 32 bytes, used to derive the per-channel encryption keys (see below!)
});

(async () => {
    await app.start(process.env.PORT || 3000);
    const workspaceEmojiResponse = await app.client.emoji.list();
    const workspaceEmoji = workspaceEmojiResponse.emoji;

    app.event('reaction_added', ({payload}) => {
        // console.log(payload);

        let emojiName = payload.reaction;

        if(emojiName.includes('::')){
            emojiName = emojiName.split('::')[0];
        }

        let reactionEmoji = emoji(emojiName);

        if(reactionEmoji.length === 0 && workspaceEmoji[emojiName]){
            reactionEmoji = workspaceEmoji[emojiName];
        }

        if(!reactionEmoji){
            console.error( `Unable to locate emoji ${ emojiName }` );

            return true;
        }

        if(!payload.item_user){
            return true;
        }

        pusher.trigger(payload.item_user, 'reaction', reactionEmoji);
    });

    console.log(`⚡️ Bolt app is running on port ${process.env.PORT || 3000}!`);
})();