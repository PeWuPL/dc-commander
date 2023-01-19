// Library for creating tables like this:
/*
+----+---------+----------+
| Nr |   ID    | Service  |
+----+---------+----------+
|  1 | 283438  | Google   |
|  2 | 372864  | YouTube  |
|  3 | 237437  | GMail    |
|  4 | 273523  | Allegro  |
|  5 | 2837647 | Shazam   |
|  6 | 3283127 | Spotify  |
|  7 | 372618  | Reddit   |
|  8 | 237104  | Discord  |
|  9 | 237294  | Steam    |
| 10 | 3827393 | Opera GX |
+----+---------+----------+
*/
// It should support:
// Adding new records
// Editing and adding labels (in this example Nr, ID, Service)
// It should automatically adjust width of column by longest string in collection
// It could also sort records by column
// Names of labels must be centered in column
// Should look and work like MySQL in terminal.

export class Table {
	/**
	 * Creates a prinTable (haha, get it?)
	 * @param  {...String} labels Labels of columns
	 */
	constructor(...labels) { // Should add columns at start
		this.columns = ["ID"].concat(labels);
		this.records = [];
		this.autoIncrement = 0;
		
		this.style = ['|','-','+'];
		
		this.formattedTable = [];
		
		// Create template of table
		// This is required to make string representation of table
		this.addRecord(null);
		this.delRecord(0);
		this.autoIncrement = 0;
	}
	/**
	 * Add a record to the table.
	 * 
	 * Number of elements should be the number of columns.
	 * 
	 * __Example:__
	 * 
	 * ```js
	 * let example = new Table("Security Number", "First name", "Last name");
	 * example.addRecord("000000000000","Adam","Smith");
	 * example.addRecord(null,"Gal","Anonym");
	 * example.addRecord("-99999999999","Anonymous",null);
	 * ```
	 * 
	 * @param  {...any} data Elements of record
	 */
	addRecord(...data) {
		let record = [this.autoIncrement];
		for(let i=0;i<this.columns.length-1;i++) {
			if(data[i]) record.push(data[i]);
			else record.push(null);
		}
		this.records.push(record);
		this.autoIncrement++;

		let columnsWidth = new Array(this.columns.length);
		let lines = ['',''];
		// Max width of column, label line and divider
		for(let i in this.columns) { // Iterate by columns
			//if(showIDs==false&&i==0) continue;
			i = parseInt(i);
			let maxLength = this.columns[i].length;
			for(let rec of this.records) { // Iterate by records
				let strLen;
				if(rec[i]==null) strLen = 4;
				else strLen = rec[i].toString().length;
				if(strLen > maxLength) maxLength = strLen;
			}
			columnsWidth[i] = maxLength;
			// Finalize label line
			let odd = 0;
			let sideSpacing = Math.floor(columnsWidth[i]/2);
			let sideStringLength = Math.floor(this.columns[i].toString().length/2);
			if(columnsWidth[i]%2==1) odd=1;
			if(this.columns[i].toString().length%2==1) odd--;
			lines[0]+=this.style[0]+` ${" ".repeat(sideSpacing-sideStringLength)+this.columns[i]+" ".repeat((sideSpacing-sideStringLength)+odd)} `;
			// Create divider
			lines[1]+=this.style[2]+`${this.style[1].repeat(columnsWidth[i]+2)}`;
			if(i==this.columns.length-1) {
				lines[0]+=this.style[0];
				lines[1]+=this.style[2];
			}
		}
		// Record iteration, adding to lines
		for(let r of this.records) {
			let line = '';
			for(let i in r) {
				//if(i==0&&showIDs==false) continue;
				let ilength;
				if(r[i]==null) ilength=4; // 4 because 'null' has 4 chars
				else ilength=r[i].toString().length;
				line+=this.style[0]+` ${r[i]+' '.repeat(columnsWidth[i]-ilength)} `;
				if(i==r.length-1) line+=this.style[0];
			}
			lines.push(line);
		}
		lines.push(lines[1]); // Add divider to bottom
		lines.unshift(lines[1]); // Add divider to beginning

		this.formattedTable = lines;
	}
	/**
	 * Deletes record by ID (these are assigned by the `Table` instance, `ID` of records starts from 0)
	 * @note It is designed for ID of deleted record to be empty, so record with this `ID` will never appear again
	 * @param {Int} id `ID` of record to remove
	 * @returns {Boolean} `true` if record was deleted, `false` if not found
	 */
	delRecord(id) {
		for(let i in this.records) {
			if(this.records[i][0]==id) {
				this.records.splice(i,1);
				return true;
			}
		}
		return false;
	}
	/**
	 * Modifies the look of table.
	 * @param {String} vertical Vertical line of table. Default: `|`
	 * @param {String} horizontal Horizontal line of table. Default: `-`
	 * @param {String} crossing Crossing of horizontal and vertical line. Default: `+`
	 */
	setStyling(vertical = '|',horizontal='-',crossing='+') {
		this.style = [vertical,horizontal,crossing];
	}
	/**
	 * Prints whole table to the console
	 * @param {Boolean} showIDs If `true` the ID of records will be shown. Default: `true`
	 * @param {int} indent By how much spaces table is indented. Default: 0
	 * @param {boolean} disablePrinting If `true` then printing to console is disabled (useful for returning only table)
	 * @param {boolean} onlyHeaders Show only labels with additional dividers Default: `false`
	 * @returns {String} stringified version of table, lines separated by `\n`.
	 */
	print(showIDs = true,indent=0,disablePrinting = false,onlyHeaders = false) {
		let lines;
		if (!onlyHeaders) lines = this.formattedTable.slice(0);
		else lines = this.formattedTable.slice(0,3);
		if(!showIDs) for(let i in lines) {
			let replacer = new RegExp(`..*?(?=${"\\"+this.style[0]}|${"\\"+this.style[2]})`);
			lines[i] = lines[i].replace(replacer,"");
		}
		if(!disablePrinting) for(let line of lines) console.log(" ".repeat(indent)+line);
		return lines.join('\n');
	}
	/**
	 * Gets columns values from table
	 * @param {String} columnName Column name
	 * @returns {String|Boolean} Values of chosen column. If column is not found, returns `false`
	 */
	getColumn(columnName) {
		let columnIndex = null;
		for(let i in this.columns) if(this.columns[i]==columnName) columnIndex = i;
		if(columnIndex== null) return false; // column not found
		let results = [];
		for(let r of this.records) results.push(r[columnIndex]);
		return results;
	}
	/**
	 * Gets record by `ID`
	 * @param {int} id `ID` of record
	 * @returns {Array<String>|Boolean|String} Array of elements of record (If `formatted` is `true`, instead of Array is returned String). `false` if record not found.
	 */
	getRecord (id,formatted=false,showIDs = true) {
		if(id>this.records.length||id<0||!this.records[id]) return false;
		id=parseInt(id);
		if(!formatted) {//return this.records[id];
			for(let i in this.records) {
				if(this.records[i][0]==id) return this.records[i];
			}
			return false;
		}
		else {
			id=parseInt(id)+3;
			let lines = this.formattedTable.slice(0);
			let replacer = new RegExp(`..*?(?=${"\\"+this.style[0]}|${"\\"+this.style[2]})`);
			if(!showIDs) for(let i in lines) {
				if(lines[i].match(/(?<=\s+)\d+/)&&lines[i].match(/(?<=\s+)\d+/)[0]==id) {
					return lines[i].replace(replacer,"");
				}
			}
			else for(let i in lines) {
				if(lines[i].match(/(?<=\s+)\d+/)&&lines[i].match(/(?<=\s+)\d+/)[0]==id) {
					return lines[i];
				}
			}
			return false;
		}
	}
}
// Statistics, just for fun.
export function characterOccurence (list){
	// It will check how much character repeats.
	let characterList = {}; // Base array for all characters
	for(let str of list) {
		for(let chr of str.split("")) {
			chr=chr.toLowerCase();
			if(characterList[chr]) characterList[chr].hits++;
			else characterList[chr] = {char: chr, hits:1};
		}
	}
	return characterList;
}
