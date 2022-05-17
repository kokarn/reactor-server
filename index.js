const { App, ExpressReceiver } = require('@slack/bolt');

const emoji = require('./modules/emoji');

const MY_USER_ID = 'U02CRLC7A5C';

const messageList = [
    {
        id: `${new Date()}`,
        emoji: '👍',
        uid: MY_USER_ID,
        timestamp: new Date(),
    },
];

const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
    receiver: receiver,
});

(async () => {
    // Start the app
    await app.start(process.env.PORT || 3000);

    app.event('reaction_added', ({payload}) => {
        if(payload.item_user !== MY_USER_ID){
            return true;
        }

        let emojiName = payload.reaction;


        if(emojiName.includes('::')){
            emojiName = emojiName.split('::')[0];
        }

        console.log(emojiName);
        const reactionEmoji = emoji(emojiName);

        if(reactionEmoji.length === 0){
            return true;
        }

        console.log(reactionEmoji);

        messageList.unshift({
            id: `${new Date()}`,
            emoji: reactionEmoji,
            uid: MY_USER_ID,
            timestamp: new Date(),
        });
    });

    receiver.router.get('/messages', (req, res) => {
        res.json(messageList);
    });

    console.log(`⚡️ Bolt app is running on port ${process.env.PORT || 3000}!`);
})();