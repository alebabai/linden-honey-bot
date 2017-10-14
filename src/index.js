const Koa = require('koa')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')

const { config } = require('./utils')
const { Api, Bot, TemplateEngine } = require('./services')
const { PATH } = require('./utils/constants')
const { telegramController } = require('./controllers')

const server = module.exports = new Koa()

const HELP_CONFIG = config.get('LH:APP:TELEGRAM:BOT:HELP')
const help = {
    caption: HELP_CONFIG.CAPTION,
    commands: Object.keys(HELP_CONFIG.COMMANDS)
        .sort((k1, k2) => k1.localeCompare(k2))
        .map(key => ({
            name: key.toLowerCase(),
            description: HELP_CONFIG.COMMANDS[key]
        }))
}

server.context.bot = new Bot({
    token: config.get('LH:APP:TELEGRAM:BOT:TOKEN'),
    webhookUrl: `${config.get('LH:LB:URL')}${PATH.API_TELEGRAM}/updates`,
    help,
    dependencies: {
        api: new Api({ baseUrl: config.get('LH:APP:API:URL') }),
        templateEngine: new TemplateEngine()
    }
})
server.context.config = config

const telegramRouter = Router({ prefix: PATH.API_TELEGRAM })

telegramRouter
    .post('/updates', telegramController.handleUpdate)

server.use(logger())
server.use(bodyParser())
server.use(telegramRouter.middleware())

server.listen(config.get('LH:APP:PORT'), () => {
    console.log(`${config.get('LH:APP:NAME')} application started!`)
})
