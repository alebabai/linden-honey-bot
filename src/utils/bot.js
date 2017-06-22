const Telegraf = require('telegraf')
const Api = require('./api')

module.exports = class Bot {
    constructor({ dataUrl, token, webhookUrl }) {
        this.telegraf = new Telegraf(token)
        this.api = new Api({
            baseUrl: dataUrl
        })
        this.init()
        this.webhook = webhookUrl
    }

    init() {
        this.telegraf.command('lenin', async ctx => {
            const songs = await this.api.findSongs('Песня о Ленине')
            const quote = songs[0] && await this.api.getRandomQuoteFromSong(songs[0]._id)
            ctx.reply(quote.phrase)
        })

        this.telegraf.command('say', async ctx => {
            const quote = await this.api.getRandomQuote()
            ctx.reply(quote.phrase)
        })

    }

    set webhook(webhookUrl) {
        this.telegraf.telegram.setWebhook(webhookUrl)
    }

    handleUpdate(update, webhookResponse) {
        this.telegraf.handleUpdate(update, webhookResponse)
    }
}
