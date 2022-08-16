const { App } = require('@slack/bolt');
const io = require('socket.io')();

const emoji = require('./modules/emoji');

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
});

io.on('connection', (client) => {
    console.log('Client connected');

    client.on('listen', (roomId) => {
        console.log(`Connecting client to ${roomId}`);
        client.join(roomId);
        io.to(roomId).emit('reaction', '🔗');        
    });
});

io.listen(3001);

(async () => {
    await app.start(process.env.PORT || 3000);

    app.event('reaction_added', ({payload}) => {
        // console.log(payload);

        let emojiName = payload.reaction;

        if(emojiName.includes('::')){
            emojiName = emojiName.split('::')[0];
        }

        // console.log(emojiName);
        const reactionEmoji = emoji(emojiName);

        if(reactionEmoji.length === 0){
            return true;
        }

        io.to(payload.item_user).emit('reaction', reactionEmoji);
    });

    console.log(`⚡️ Bolt app is running on port ${process.env.PORT || 3000}!`);
})();