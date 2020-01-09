const Telegraf = require('telegraf')

class Bot {
    constructor({
        token,
        webhookUrl,
        dependencies: {
            api,
            templateEngine,
        },
    }) {
        this.telegraf = new Telegraf(token)
        this.api = api
        this.templateEngine = templateEngine
        this.init()
        this.webhook = webhookUrl
    }

    init = () => {
        this.telegraf.command('anthem', async (ctx) => {
            const song = await this.api.getRandomSong()
            const html = await this.templateEngine.render('song.html', song)
            ctx.reply(html, { parse_mode: 'HTML' })
        })

        this.telegraf.command('help', async (ctx) => {
            const data = {
                caption: 'Методичка',
                commands: [
                    {
                        name: 'anthem',
                        description: 'Гимн',
                    },
                    {
                        name: 'help',
                        description: 'Методичка',
                    },
                    {
                        name: 'lenin',
                        description: 'Ленин - это ...',
                    },
                    {
                        name: 'say',
                        description: 'Право говорить',
                    },
                    {
                        name: 'start',
                        description: 'Начать строить коммунизм',
                    },
                    {
                        name: 'stop',
                        description: 'Цикл закончен - пора по местам',
                    },
                ],
            }
            const html = await this.templateEngine.render('help.html', data)
            ctx.reply(html, { parse_mode: 'HTML' })
        })

        const leninMiddleware = async (ctx) => {
            const songs = await this.api.findSongsByTitle('Песня о Ленине')
            const quote = songs[0] && await this.api.getRandomQuoteFromSong(songs[0]._id)
            ctx.reply(quote.phrase)
        }
        this.telegraf.command('lenin', leninMiddleware)
        this.telegraf.hears(/.*ленин.*/i, leninMiddleware)

        this.telegraf.command('say', async (ctx) => {
            const quote = await this.api.getRandomQuote()
            ctx.reply(quote.phrase)
        })

        this.telegraf.command('start', async (ctx) => {
            ctx.replyWithSticker('CAADAgAD0wQAAu75nwV1MhAIlGmvlwI')
        })

        this.telegraf.command('stop', async (ctx) => {
            ctx.replyWithSticker('CAADAgADrwQAAu75nwWJzfxZULhKCQI')
        })

        this.telegraf.on('inline_query', async (ctx) => {
            const limit = 20
            const offset = Number.parseInt(ctx.inlineQuery.offset, 10) || 0
            const previews = await this.api.findSongsByPhrase(
                ctx.inlineQuery.query,
                { offset, limit },
            )
            const songs = await Promise.all(previews.map(({ _id }) => this.api.getSong(_id)))
            const results = await Promise.all(
                songs.map(async (song) => ({
                    id: song._id,
                    type: 'article',
                    title: song.title,
                    input_message_content: {
                        message_text: await this.templateEngine.render('song.html', song),
                        parse_mode: 'HTML',
                    },
                })),
            )
            ctx.answerInlineQuery(results, {
                next_offset: offset + limit,
            })
        })
    }

    set webhook(webhookUrl) {
        this.telegraf.telegram.setWebhook(webhookUrl)
    }

    handleUpdate = (update, webhookResponse) => {
        this.telegraf.handleUpdate(update, webhookResponse)
    }
}

module.exports = Bot
