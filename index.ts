import {DiscordUser, Channel, ServerChannel, PNG, GIF} from './dc-lib';
import {Table} from '.easy-tables';
import path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
readline.emitKeypressEvents(process.stdin);
let log = console.log;
const auth = "";
if(auth=="") {
	console.log("Hey! Auth key is required!");
	process.exit();
}
let me = new DiscordUser(auth); // Here insert your auth key!
log("=".repeat(20));
log("	Discord commander v1.0");
log("	Made with <3 by PeWu");
log("=".repeat(20));
log("Type 'q' to exit, 'r' to reload commands!");

const loadICommands = ()=>{
	let imageCommands = fs.readFileSync(path.resolve("./commands.image.json")).toString();
	if(!JSON.parse(imageCommands)) 
		throw new Error("Cannot parse image commands from file!");
	imageCommands = JSON.parse(imageCommands);
	return imageCommands;
};
const loadTCommands = ()=>{
	let textCommands = fs.readFileSync(path.resolve("./commands.text.json")).toString();
	if(!JSON.parse(textCommands)) 
		throw new Error("Cannot parse text commands from file!");
		textCommands = JSON.parse(textCommands);
	return textCommands;
};
const loadIDatabase = ()=>{
	let imageDatabase = fs.readFileSync(path.resolve('./image-database.json')).toString();
	if(!JSON.parse(imageDatabase)) 
		throw new Error("Cannot parse image database from file!");
		imageDatabase = JSON.parse(imageDatabase);
	return imageDatabase;
};

const saveIDatabase = (db:any) => {
	fs.writeFileSync(path.resolve("./image-database.json"),JSON.stringify(db,null,4));
}
const everWait = async (awaitVar:Awaited<any>,failureText:string="Failure. Retrying...",successText="Done.")=>{
	for(;;) {
		try {
			var result = await awaitVar();
			if(successText!==null) console.log(successText);
			return result;
		} catch (e) {
			if(failureText!==null) console.log(failureText);
			continue;
		}
	}
}
let imageCommands = loadICommands();
let textCommands = loadTCommands();
let imageDatabase = loadIDatabase();

if(process.stdin.isTTY)
	process.stdin.setRawMode(true);
process.stdin.on('keypress', (chunk, key) => {
	if (key && key.name == 'q') {
		log("Closing program...")
		process.exit();
	}
	if(key && key.name == 'r') {
		let newImageCommands = loadICommands();
		log("");
		log(">".repeat(10))
		log("	Image commands reloaded. New commands: "+(Object.keys(newImageCommands).length-Object.keys(imageCommands).length)+".");
		imageCommands = newImageCommands;

		let newTextCommands = loadTCommands();
		log("	Text commands reloaded. New commands: "+(Object.keys(newTextCommands).length-Object.keys(textCommands).length)+".");
		textCommands = newTextCommands;
		imageDatabase = loadIDatabase();
		log("	Image database reloaded.")
		log(">".repeat(10));
		log("")
	}
});
log('');
log("Image command list:")
let imageCommandTable = new Table('Command name','Image to upload');
for(let command of Object.keys(imageCommands)) {
	imageCommandTable.addRecord(command,imageCommands[command]);
}
imageCommandTable.print(false);
log(" ");
log("Text command list:")
let textCommandTable = new Table('Command name','Message length');
for(let command of Object.keys(textCommands)) {
	textCommandTable.addRecord(command,textCommands[command].length);
}
textCommandTable.print(false);
log("")
log("#### Executing script ####");
log(" ");
let main =async()=>{
	log("Basic info gathering");
	log("-".repeat(50));
	log("Fetching user data...");
	await everWait(async ()=> await me.getUserData(),"	Failed. Retrying...",null);
	log("	Account: "+me.user.username+"#"+me.user.discriminator);
	log("Fetching servers...");
	await everWait(async ()=> await me.getServers(),"	Failed. Retrying...",null);
	log("	"+me.servers.length+" servers detected");
	log("Fetching DMs...")
	await everWait(async ()=> await me.getChannels(),"	Failed. Retrying...",null);
	log("	"+me.channels.length+" DMs detected");
	log("-".repeat(50));
	log("Basic info gathering done.");
	log(" ");
	log("Getting specifics of server");
	log("-".repeat(50));
	let sv = me.servers[0];
	log("Fetching channels of '"+sv.name+"'...")
	let channels = await everWait(async ()=>await me.getServerChannels(sv.id),"	Failed. Retrying...",null);
	let channelTree:Array<ServerChannel> = DiscordUser.sortChannelsByParent(channels);
	
	log("	"+channelTree.length+" parent channels found.");

	let target:Channel|ServerChannel = channelTree[1].children[0]; // example target - change to something suitable
	log("-".repeat(50));
	//log("Focusing on DM with '"+target.recipients[0].username+"#"+target.recipients[0].discriminator+"' to receive master commands");
	log(`Focusing on channel '${target.name}' to receive master commands`);
	log(" ")
	log("Awaiting commands...");
	log("-".repeat(50));
	for(;;) {
		var messageList = await everWait(async ()=>await target.getMessages(10),null,null);
		for(let msg of messageList) {
			for(let cmd of Object.keys(imageCommands)) {
				for(let fragment of msg.content.split(" ")) {
					if(cmd===fragment&&msg.author.username=="PeWu") {
						log('#'.repeat(50));
						log("	>>>Image command detected: "+cmd);
						let destination:any;
						if(!imageDatabase[cmd]) {
							log("	Image isn't registered. Reserving space on remote server...");
							let data = await everWait(async ()=>await target.prepareRemoteForImageUpload(imageCommands[cmd]),"		Failed. Retrying...","		Done.");
							switch(path.extname(imageCommands[cmd])) {
								case '.png':
									destination = new PNG(data);
									break;
								case '.gif':
									destination = new GIF(data);
									break;
								default:
									destination = new PNG(data);
									break;
							}
							log("	Uploading image...");
							await everWait(async()=>await destination.upload(),"		Failed. Retrying...","		Done.");
							destination = destination.attachmentsSending;
							imageDatabase[cmd] = destination;
							log("	Saving database...");
							saveIDatabase(imageDatabase);
							log("		Done.")
						}
						else
							destination = imageDatabase[cmd];
						log("	Replacing message...")
						await everWait(async ()=>await target.editMessage(msg.id,{attachments:destination,content:msg.content.replace(fragment,"")}),"		Failed. Retrying...","		Done.");
						log('#'.repeat(50));
						log(' ')
					}
				}
			}
			for(let cmd of Object.keys(textCommands)) {
				for(let fragment of msg.content.split(" ")) {
					if(cmd===fragment&&msg.author.username=="PeWu") {
						log('#'.repeat(50));
						log("	>>>Text command detected: "+cmd);
						log("	Editing message...");
						await everWait(async ()=>await target.editMessage(msg.id,{content:msg.content.replace(fragment,textCommands[cmd])}),"		Failed. Retrying...","		Done.");
						log('#'.repeat(50));
						log(' ')
					}
				}
			}
		}
	}
};
main();
