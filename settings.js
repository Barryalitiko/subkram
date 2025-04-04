require("./all/module.js")

//========== Setting Owner ==========//
global.owner = "923492091511";
global.namaowner = "vfo";
global.version = "v2.0.0";

//======== Setting Bot & Link ========//
global.namabot = "mryyy" 
global.namabot2 = "mryyy"
global.foother = "mryyy"
global.idsaluran = "120363327641576587"
global.linkgc = 'https://youtube.com/channel/UCt5wj7FCoPS4SAl82FavJnw'
global.linksaluran = "https://youtube.com/channel/UCt5wj7FCoPS4SAl82FavJnw"
global.linkyt = 'https://youtube.com/@b4udrogan'
global.linktele = "t.me/no"
global.packname = "bug"
global.author = "bug"

//========== Setting Event ==========//
global.welcome = false
global.autoread = false
global.anticall = false 
global.owneroff = false

//==== Waktu Jeda Pushkontak ====//
global.delaypushkontak = 5500;

//==== settings panel ====//
global.egg = "15";
global.nestid = "5";
global.loc = "1";
global.domain = "";
global.apikey = "";
global.capikey = "";

//========= Setting Payment =========//
//Kalo Gak Ada Isi Aja jadi false
global.dana = "085298108699"
global.gopay = "085946123323"
global.qris = fs.readFileSync("./media/qris.jpg")
                             
//=========== Api Domain ===========//
global.zone1 = "";
global.apitoken1 = "";
global.tld1 = ""

//========== Api Domain 2 ==========//
global.zone2 = "";
global.apitoken2 = "";
global.tld2 = "";
//========== Api Domain 3 ==========//
global.zone3 = "";
global.apitoken3 = "";
global.tld3 = "";
//========== Api Domain 4 ==========//
global.zone4 = "";
global.apitoken4 = "";
global.tld4 = "";

//========= Setting Message =========//
global.msg = {
"error": "Error terjadi kesalahan",
"done": "Done Bang ✅", 
"wait": "Please Wait..", 
"group": "*• Group Only* Fitur Ini Hanya Untuk Di Dalam Grup!", 
"private": "*• Private Chat* Fitur Ini Hanya Untuk Didalam Private Chat!", 
"admin": "*• Admin Only* Fitur Ini Hanya Untuk Admin Grup!", 
"adminbot": "*• Bot Admin* Fitur Ini Dapat Digunakan Ketika Bot Menjadi Admin", 
"owner": "*• Owner Only* Fitur Ini Hanya Untuk Owner Bot!", 
"developer": "*• Developer Only* Fitur Ini Hanya Untuk Developer"
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})