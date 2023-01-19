import {get,post,patch, put} from './http';
import fs from 'fs';
import path from 'path';
export const DISCORD_EPOCH=1420070400000;
export class Snowflake {
	timestamp:number;
	workerId:number;
	processId:number;
	increment:number;
	date:Date;
	constructor(rawID:string|number) {
		let raw = BigInt(rawID).toString(2).padStart(64,"0");

		let timestamp:string|number = raw.substring(0,42);
		timestamp = parseInt(timestamp,2);
		timestamp += DISCORD_EPOCH;
		this.timestamp = timestamp;
		this.date = new Date(this.timestamp);

		let workerId = raw.substring(42,47);
		this.workerId = parseInt(workerId,2);

		let processId = raw.substring(47,52);
		this.processId = parseInt(processId,2);
		
		let increment = raw.substring(52);
		this.increment = parseInt(increment,2);
	}
}
class Permissions {
	readonly perms:Array<string>;
	constructor(perm:string){
		const PERM_LIST = {
			"MODERATE_MEMBERS":				0x0000010000000000,
			"USE_EMBEDDED_ACTIVITIES":		0x0000008000000000,
			"SEND_MESSAGES_IN_THREADS":		0x0000004000000000,
			"USE_EXTERNAL_STICKERS":		0x0000002000000000,
			"CREATE_PRIVATE_THREADS":		0x0000001000000000,
			"CREATE_PUBLIC_THREADS":		0x0000000800000000,
			"MANAGE_THREADS":				0x0000000400000000,
			"MANAGE_EVENTS":				0x0000000200000000,
			"REQUEST_TO_SPEAK":				0x0000000100000000,
			"USE_APPLICATION_COMMANDS":		0x0000000080000000,
			"MANAGE_EMOJIS_AND_STICKERS":	0x0000000040000000,
			"MANAGE_WEBHOOKS":				0x0000000020000000,
			"MANAGE_ROLES":					0x0000000010000000,
			"MANAGE_NICKNAMES":				0x0000000008000000,
			"CHANGE_NICKNAME":				0x0000000004000000,
			"USE_VAD":						0x0000000002000000,
			"MOVE_MEMBERS":					0x0000000001000000,
			"DEAFEN_MEMBERS":				0x0000000000800000,
			"MUTE_MEMBERS":					0x0000000000400000,
			"SPEAK":						0x0000000000200000,
			"CONNECT":						0x0000000000100000,
			"VIEW_GUILD_INSIGHTS":			0x0000000000080000,
			"USE_EXTERNAL_EMOJIS":			0x0000000000040000,
			"MENTION_EVERYONE":				0x0000000000020000,
			"READ_MESSAGE_HISTORY":			0x0000000000010000,
			"ATTACH_FILES":					0x0000000000008000,
			"EMBED_LINKS":					0x0000000000004000,
			"MANAGE_MESSAGES":				0x0000000000002000,
			"SEND_TTS_MESSAGES":			0x0000000000001000,
			"SEND_MESSAGES":				0x0000000000000800,
			"VIEW_CHANNEL":					0x0000000000000400,
			"STREAM":						0x0000000000000200,
			"PRIORITY_SPEAKER":				0x0000000000000100,
			"VIEW_AUDIT_LOG":				0x0000000000000080,
			"ADD_REACTIONS":				0x0000000000000040,
			"MANAGE_GUILD":					0x0000000000000020,
			"MANAGE_CHANNELS":				0x0000000000000010,
			"ADMINISTRATOR":				0x0000000000000008,
			"BAN_MEMBERS":					0x0000000000000004,
			"KICK_MEMBERS":					0x0000000000000002,
			"CREATE_INSTANT_INVITE":		0x0000000000000001
		};
		let permInt = parseInt(perm);
		let perms:Array<string> = [];
		for(let permKey of Object.keys(PERM_LIST)) {
			if(PERM_LIST[permKey]<=permInt) {
				perms.push(permKey);
				permInt-=PERM_LIST[permKey];
			}
		}
		this.perms = perms;
	}
}
class PermOverwrite {
	forId:string;
	type:number;
	allow:Permissions;
	deny:Permissions;
	constructor(forId:string,type:number,allow:string,deny:string){
		this.forId = forId;
		this.type = type;
		this.allow = new Permissions(allow);
		this.deny = new Permissions(deny);
	}
}
class ChannelType {
	name:string;
	type:number;
	constructor(type:number) {
		const TYPES = {
			0:	"GUILD_TEXT",
			1:	"DM",
			2:	"GUILD_VOICE",
			3:	"GROUP_DM",
			4:	"GUILD_CATEGORY",
			5:	"GUILD_ANNOUNCEMENT",
			10:	"ANNOUNCEMENT_THREAD",
			11: "PUBLIC_THREAD",
			12:	"PRIVATE_THREAD",
			13:	"GUILD_STAGE_VOICE",
			14:	"GUILD_DIRECTORY",
			15:	"GUILD_FORUM"
		}
		this.name = TYPES[type];
		this.type = type;
	}
}
class UserData {
	readonly id:string;
	readonly username:string;
	readonly avatarId:string;
	readonly discriminator:number;
	readonly publicFlags:number;
	readonly flags:number|null;
	readonly banner:string|null;
	readonly bannerColor:string;
	readonly accentColor:number;
	readonly bio:string;
	readonly lang:string;
	readonly nsfw:boolean;
	readonly mfa:boolean;
	readonly premium:number;
	readonly email:string;
	readonly verified:boolean;
	readonly phone:string;
	constructor(rawData:any) {
		this.id = rawData.id;
		this.username = rawData.username;
		this.avatarId = rawData.avatar;
		this.discriminator = ~~rawData.discriminator;
		this.publicFlags = rawData.public_flags;
		this.flags = rawData.flags;
		this.banner = rawData.banner;
		this.accentColor = rawData.accent_color;
		this.bio = rawData.bio;
		this.lang = rawData.locale;
		this.nsfw = rawData.nsfw_allowed == "true";
		this.mfa = rawData.mfa_enabled == "true";
		this.premium = rawData.premium_type;
		this.email = rawData.email;
		this.verified = rawData.verified == true;
		this.phone = rawData.phone;
	}
}
class BasicUser {
	readonly id:string;
	readonly username:string;
	readonly discriminator:string;
	readonly avatarId:string;
	readonly avatarDecoration:string|null;
	readonly publicFlags:number;
	constructor(id:string,username:string,discriminator:string,avatar_id:string,avatar_decoration:string|number|null,flags:number) {
		this.id=id;
		this.username = username;
		this.discriminator = discriminator;
		this.avatarId = avatar_id;
		this.avatarDecoration = avatar_decoration === null ? null : avatar_decoration+"";
		this.publicFlags = flags;
	}
}
class Attachment {
	id:string;
	filename:string;
	size:number;
	url:string;
	proxyUrl:string;
	width:number;
	height:number;
	type:string;
	constructor(id:string,filename:string,size:number,url:string,proxyUrl:string,width:number,height:number,type:string){
		this.id=id;
		this.filename = filename;
		this.size = size;
		this.url = url;
		this.proxyUrl = proxyUrl;
		this.width = width;
		this.height = height;
		this.type = type;
	}
}
class Embed {
	readonly type:string;
	readonly url:string;
	readonly title:string;
	readonly description:string;
	readonly color:string;
	constructor(type:string,url:string,title:string,description:string,color:string){
		this.type = type;
		this.url = url;
		this.title = title;
		this.description = description;
		this.color = color;
	}
}
class Message {
	readonly id:string;
	readonly type:ChannelType;
	readonly content:string;
	readonly author:BasicUser;
	readonly attachments:Array<Attachment>;
	readonly embeds:Array<Embed>;
	readonly mentions:Array<BasicUser>;
	readonly mentionRoles:Array<string>;
	readonly pinned:boolean;
	readonly mentionEveryone:boolean;
	readonly tts:boolean;
	readonly timestamp:string;
	readonly lastEditTimestamp:string|null;
	readonly flags:number;
	constructor(id:string,
		type:number,
		content:string,
		author:any,
		attachments:Array<any>,
		embeds:Array<any>,
		mentions:Array<any>,
		mentionRoles:Array<string>,
		pinned:boolean,
		mentionEveryone:boolean,
		tts:boolean,
		timestamp:string,
		lastEditTimestamp:string|null,
		flags:number){
			this.id = id;
			this.type = new ChannelType(type);
			this.content = content;
			this.author = new BasicUser(author.id,author.username,author.discriminator,author.avatar_id,author.avatar_decoration,author.public_flags);
			let attachmentList:Array<Attachment> = [];
			for(let attchmnt of attachments) 
				attachmentList.push(new Attachment(attchmnt.id,attchmnt.filename,attchmnt.size,attchmnt.url,attchmnt.proxy_url,attchmnt.width,attchmnt.height,attchmnt.content_type));

			this.attachments = attachmentList;
			let embedList:Array<Embed> = [];
			for(let embed of embeds) 
				embedList.push(new Embed(embed.type,embed.url,embed.title,embed.description,embed.color));

			this.embeds = embedList;
			let mentionList:Array<BasicUser> = [];
			for(let mnt of mentions) 
				mentionList.push(new BasicUser(mnt.id,mnt.username,mnt.discriminator,mnt.avatar,mnt.avatar_decoration,mnt.flags));
			this.mentions = mentionList;
			this.mentionRoles = mentionRoles;
			this.pinned = pinned;
			this.mentionEveryone = mentionEveryone;
			this.tts = tts;
			this.timestamp = timestamp;
			this.lastEditTimestamp = lastEditTimestamp;
			this.flags = flags;
	}
}
export class Channel {
	private readonly user:DiscordUser;
	readonly id:string;
	readonly type:ChannelType;
	readonly lastMessage:string;
	readonly lastPin:string|null;
	readonly flags:number;
	readonly recipients:Array<BasicUser>;
	constructor (user:DiscordUser,id:string,type:number,lastMessage:string,lastPin:string|undefined,flags:number,recipients:Array<any>){
		this.user = user;
		this.id = id;
		this.type = new ChannelType(type);
		this.lastMessage = lastMessage;
		this.lastPin = lastPin === undefined ? null : lastPin;
		this.flags = flags;
		let users:Array<BasicUser> = [];
		for(let usr of recipients) {
			users.push(new BasicUser(usr.id,usr.username,usr.discriminator,usr.avatar,usr.avatar_decoration,usr.public_flags));
		}
		this.recipients = users;
 	}
	async sendMessage(content:string) {
		return await this.user.sendMessage(this.id,content);
	}
	async getMessages(limit:number=50) {
		return await this.user.getMessages(this.id,limit);
	}
	async prepareRemoteForImageUpload(...filePaths:Array<string>) {
		let files:Array<{path:string,name:string,extension:string,data:Buffer,size:number,id:number}> = [];
		for(let i in filePaths) {
			let fileAbsolutePath = path.resolve(filePaths[i]);
			let fileName = path.basename(fileAbsolutePath);
			let fileExtension = path.extname(fileAbsolutePath);

			let fileData = fs.readFileSync(fileAbsolutePath);
			let fileLength = fileData.byteLength;
			files.push({
				path:fileAbsolutePath,
				name: fileName.replace(fileExtension,""),
				extension: fileExtension,
				data: fileData,
				size: fileLength,
				id: parseInt(i)
			});
		}
		let fileList:Array<object> = [];
		for(let file of files) {
			fileList.push({
				"file_size":file.size,
				"filename":file.name+file.extension,
				"id":file.id
			});
		}
		let body = {
			files:fileList,
		};
		let request = await post(`https://discord.com/api/v9/channels/${this.id}/attachments`,body,{"Authorization":this.user.key});
		if(request.statusCode != 200) 
			throw new Error("File preparing failed!");
		let response = JSON.parse(request.body);
		response._files = files;
		return response;
	}
	async editMessage(id:string|number,newParams:object) {
		let result = await patch(`https://discord.com/api/v9/channels/${this.id}/messages/${id}`,newParams,{"Authorization":this.user.key});
		if(result.statusCode!=200)
			throw new Error("Message edit failed!");
		return JSON.parse(result.body);
	}
}
export class ServerChannel {
	private readonly user:DiscordUser;
	readonly id:string;
	readonly name:string;
	readonly type:ChannelType;
	readonly position:number;
	readonly parent:string|null;
	readonly server:string;
	readonly lastMessage:string|null;
	readonly lastPin:string|null;
	readonly flags:number;
	readonly permOverwrite:Array<PermOverwrite>;
	children:Array<ServerChannel>;
	constructor (user:DiscordUser,id:string,name:string,type:number,position:number,parent:string|null,server:string,lastMessage:string|null,lastPin:string|undefined,flags:number,permOverwrites:Array<{id:string,type:number,allow:string,deny:string}>){
		this.user = user;
		this.id = id;
		this.name = name;
		this.type = new ChannelType(type);
		this.position = position;
		this.parent = parent;
		this.server = server;
		this.lastMessage = lastMessage ? lastMessage : null;
		this.lastPin = lastPin? lastPin : null;
		this.flags = flags;
		this.children = null;
		let overwrites:Array<PermOverwrite> = [];
		for(let permOver of permOverwrites) {
			overwrites.push(new PermOverwrite(permOver.id,permOver.type,permOver.allow,permOver.deny));
		}
		this.permOverwrite = overwrites;
 	}
	async sendMessage(content:string) {
		return await this.user.sendMessage(this.id,content);
	}
	async getMessages(limit:number=50) {
		return await this.user.getMessages(this.id,limit);
	}
	async prepareRemoteForImageUpload(...filePaths:Array<string>) {
		let files:Array<{path:string,name:string,extension:string,data:Buffer,size:number,id:number}> = [];
		for(let i in filePaths) {
			let fileAbsolutePath = path.resolve(filePaths[i]);
			let fileName = path.basename(fileAbsolutePath);
			let fileExtension = path.extname(fileAbsolutePath);

			let fileData = fs.readFileSync(fileAbsolutePath);
			let fileLength = fileData.byteLength;
			files.push({
				path:fileAbsolutePath,
				name: fileName.replace(fileExtension,""),
				extension: fileExtension,
				data: fileData,
				size: fileLength,
				id: parseInt(i)
			});
		}
		let fileList:Array<object> = [];
		for(let file of files) {
			fileList.push({
				"file_size":file.size,
				"filename":file.name+file.extension,
				"id":file.id
			});
		}
		let body = {
			files:fileList,
		};
		let request = await post(`https://discord.com/api/v9/channels/${this.id}/attachments`,body,{"Authorization":this.user.key});
		if(request.statusCode != 200) 
			throw new Error("File preparing failed!");
		let response = JSON.parse(request.body);
		response._files = files;
		return response;
	}
	async editMessage(id:string|number,newParams:object) {
		let result = await patch(`https://discord.com/api/v9/channels/${this.id}/messages/${id}`,newParams,{"Authorization":this.user.key});
		if(result.statusCode!=200)
			throw new Error("Message edit failed!");
		return JSON.parse(result.body);
	}
}
class Server {
	private readonly user:DiscordUser;
	readonly id:string;
	readonly name:string;
	readonly icon:string;
	readonly isOwner:boolean;
	readonly permissions:Permissions;
	readonly features:Array<string>;
	constructor(user:DiscordUser,id:string,name:string,icon:string,isOwner:boolean,permissions:string,features:Array<string>) {
		this.user = user;
		this.id = id;
		this.name = name;
		this.icon = icon;
		this.isOwner = isOwner;
		this.permissions = new Permissions(permissions);
		this.features = features;
	}
	async getChannels():Promise<Array<ServerChannel>> {
		return await this.user.getServerChannels(this.id);
	}
}
export class DiscordUser {
	private authKey:string;
	user:UserData;
	channels:Array<Channel>;
	servers:Array<Server>;
	constructor(key:string) {
		this.authKey = key;
	}
	static async checkKey (key:string) {
		if(key=="")
			return false;
		await DiscordUser.checkConnection();
		try {
			let keyTest = await get("https://discord.com/api/v9/users/@me",{Authorization:key});
			if(keyTest.statusCode==200) return true;
			else return false;
		} catch (e) {
			return false;
		}
	}
	static async checkConnection() {
		try {
			let test = await get("https://discord.com/");
			if(test.statusCode!=200)
				throw new Error();
			return true;
		} catch (e) {
				throw new Error("Connection failed! Check internet connection!");
		}
	}
	static sortChannelsByParent(channelList:Array<ServerChannel>) {
		let rootChannels = [];
		for(let i in channelList) {
			if(channelList[i].parent === null) {
				channelList[i].children = [];
				rootChannels.push(channelList[i]);
			}
		}
		for(let server of channelList) {
			for(let roots of rootChannels) {
				if(server.parent==roots.id) roots.children.push(server);
			}
		}
		return rootChannels;
	}
	get key (){
		return this.authKey;
	}
	set key (newKey:string){
		this.authKey=newKey;
	}
	async getUserData(){
		await DiscordUser.checkConnection();
		// Authorization key checking
		if(!await DiscordUser.checkKey(this.authKey))
			throw new Error("Authorization failed: Invalid auth key!");
		let infoRequest = await get("https://discord.com/api/v9/users/@me",{"Authorization":this.authKey});
		if(infoRequest.statusCode!=200)
			throw new Error("Failed to fetch user info!");
		this.user = new UserData(JSON.parse(infoRequest.body));
	};
	async getChannels(){
		let channelsReq = await get("https://discord.com/api/v9/users/@me/channels",{"Authorization":this.authKey});
		if(channelsReq.statusCode!=200)
			throw new Error("Failed to fetch channel data!");
		let parsedChannels = JSON.parse(channelsReq.body)
		let channels:Array<Channel> = [];
		for(let chn of parsedChannels) {
			channels.push(new Channel(this,chn.id,chn.type,chn.last_message_id,chn.last_pin_timestamp,chn.flags,chn.recipients));
		}
		this.channels = channels;
	}
	async getServers(){
		let serversReq = await get("https://discord.com/api/v9/users/@me/guilds",{"Authorization":this.authKey});
		if(serversReq.statusCode!=200) 
			throw new Error("Failed to fetch server data!");
		let parsedServers = JSON.parse(serversReq.body);
		let servers:Array<Server> = [];
		for(let srv of parsedServers) {
			servers.push(new Server(this,srv.id,srv.name,srv.icon,srv.owner,srv.permissions,srv.features));
		}
		this.servers = servers;
	}
	async getMessages(channel:number|string,limit:number=50) {
		await DiscordUser.checkConnection();
		// Authorization key checking
		if(!await DiscordUser.checkKey(this.key))
			throw new Error("Authorization failed: Invalid auth key!");
		let messageRequest = await get(`https://discord.com/api/v9/channels/${channel}/messages?limit=${limit}`,{"Authorization":this.authKey});
		if(messageRequest.statusCode!=200)
			throw new Error("Failed to fetch messages at @"+channel);
		let messages:Array<Message> = [];
		for(let msg of JSON.parse(messageRequest.body)) {
			messages.push(new Message(msg.id,
				msg.type,
				msg.content,
				msg.author,
				msg.attachments,
				msg.embeds,
				msg.mentions,
				msg.mention_roles,
				msg.pinned,
				msg.mention_everyone,
				msg.tts,
				msg.timestamp,
				msg.edited_timestamp,
				msg.flags));
		}
		return messages;
	}
	async sendMessage(channel:number|string,content:string) {
		await DiscordUser.checkConnection();
		// Authorization key checking
		if(!await DiscordUser.checkKey(this.key))
			throw new Error("Authorization failed: Invalid auth key!");	
		if(content.length==0||content.length>2000)
			throw new Error("Message length out of bounds");
		let obj = {
			"content":content,
			"tts":false
		};
		let messageSendReq = await post(`https://discord.com/api/v9/channels/${channel}/messages`,obj,{"Authorization":this.authKey,"Content-Type":"application/json"});
		if(messageSendReq.statusCode!=200)
			throw new Error("Message sending failed!");
		return JSON.parse(messageSendReq.body);		
	}
	async getServerChannels(server:string|number){
		await DiscordUser.checkConnection();
		// Authorization key checking
		if(!await DiscordUser.checkKey(this.key))
			throw new Error("Authorization failed: Invalid auth key!");	
		let serverChannelsReq = await get(`https://discord.com/api/v9/guilds/${server}/channels`,{"Authorization":this.authKey});
		if(serverChannelsReq.statusCode!=200)
			throw new Error("Can't fetch channels!");
		let parsedServerChannelList = JSON.parse(serverChannelsReq.body);
		let channels:Array<ServerChannel> = [];
		for(let chn of parsedServerChannelList) {
			channels.push(new ServerChannel(this,chn.id,chn.name,chn.type,chn.position,chn.parent_id,chn.guild_id,chn.last_message_id,chn.last_pin_timestamp,chn.flags,chn.permission_overwrites));
		}
		return channels;
	}
}
export class PNG {
	files:Array<{id:number,extension:string,data:Buffer,name:string,path:string,size:number}>;
	attachmentsReceiving:Array<{id:number,upload_filename:string,upload_url:string}>;
	attachmentsSending:Array<{id:number,filename:string,uploaded_filename:string}>;
	constructor(specifics:{_files:Array<{id:number,extension:string,data:Buffer,name:string,path:string,size:number}>,
			attachments:Array<{id:number,upload_filename:string,upload_url:string}>}) {
		this.files = specifics._files;
		this.attachmentsReceiving = specifics.attachments;
		let attchmnts = [];
		for(let attchmnt of this.attachmentsReceiving) {
			let href = new URL(attchmnt.upload_url);
			let name = path.resolve(href.pathname);
			name = path.basename(name);
			attchmnts.push({id:attchmnt.id,filename:name,uploaded_filename:href.pathname.substring(1)});
		}
		this.attachmentsSending = attchmnts;
	}
	async upload(){
		let results = [];
		for(let i in this.attachmentsReceiving) {
			let item = this.attachmentsReceiving[i];
			let request = await put(item.upload_url,this.files[i].data,{"Content-type":"image/png"});
			if(request.statusCode!=200) {
				throw new Error("Upload failed!");
			}
			results.push(request);
		}
		return results;
	}
}
export class GIF {
	files:Array<{id:number,extension:string,data:Buffer,name:string,path:string,size:number}>;
	attachmentsReceiving:Array<{id:number,upload_filename:string,upload_url:string}>;
	attachmentsSending:Array<{id:number,filename:string,uploaded_filename:string}>;
	constructor(specifics:{_files:Array<{id:number,extension:string,data:Buffer,name:string,path:string,size:number}>,
			attachments:Array<{id:number,upload_filename:string,upload_url:string}>}) {
		this.files = specifics._files;
		this.attachmentsReceiving = specifics.attachments;
		let attchmnts = [];
		for(let attchmnt of this.attachmentsReceiving) {
			let href = new URL(attchmnt.upload_url);
			let name = path.resolve(href.pathname);
			name = path.basename(name);
			attchmnts.push({id:attchmnt.id,filename:name,uploaded_filename:href.pathname.substring(1)});
		}
		this.attachmentsSending = attchmnts;
	}
	async upload(){
		let results = [];
		for(let i in this.attachmentsReceiving) {
			let item = this.attachmentsReceiving[i];
			let request = await put(item.upload_url,this.files[i].data,{"Content-type":"image/gif"});
			if(request.statusCode!=200) {
				throw new Error("Upload failed!");
			}
			results.push(request);
		}
		return results;
	}
}