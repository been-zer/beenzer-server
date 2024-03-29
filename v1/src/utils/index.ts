
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/**
 * @description Get getTime data
 * @date 12/1/2022 - 12:02:42 PM
 *
 * @returns {string}
 */
export const getTime = (): string => {
  const date = new Date;
  const hours = formatTime(date.getUTCHours());
  const minutes = formatTime(date.getMinutes());
  const seconds = formatTime(date.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * @description Get getDate data
 * @date 12/1/2022 - 12:02:42 PM
 *
 * @returns {string}
 */
export const getDate = (): string => {
  const date = new Date
  const year = formatTime(date.getUTCFullYear());
  const month = formatTime(date.getUTCMonth() + 1);
  const day = formatTime(date.getUTCDate());
  return `${year}-${month}-${day}`;
}

/**
 * @description Get formatTime data
 * @date 12/1/2022 - 12:02:42 PM
 *
 * @param {number} num
 * @returns {string}
 */
export const formatTime = (num: number): string => {
  if (String(num).length < 2)
    return '0' + String(num);
  else if (String(num).length < 1)
    return '00';
  return String(num);
}

export const sqlFilter = (text: string): string => {
  const regex = new RegExp(/(\s*([\0\b\'\"\n\r\t\%\_\\]*\s*(((select\s*.+\s*from\s*.+)|(insert\s*.+\s*into\s*.+)|(update\s*.+\s*set\s*.+)|(delete\s*.+\s*from\s*.+)|(drop\s*.+)|(truncate\s*.+)|(alter\s*.+)|(exec\s*.+)|(\s*(all|any|not|and|between|in|like|or|some|contains|containsall|containskey)\s*.+[\=\>\<=\!\~]+.+)|(let\s+.+[\=]\s*.*)|(begin\s*.*\s*end)|(\s*[\/\*]+\s*.*\s*[\*\/]+)|(\s*(\-\-)\s*.*\s+)|(\s*(contains|containsall|containskey)\s+.*)))(\s*[\;]\s*)*)+)/i)
  if (!text.match(regex)) {
    return text.replace(/ /g, '');
  }
  return '';
}

export const concatPubKeys = (pubkey: string, pubkey2: string): string => {
  const a = pubkey.slice(0,1);
  const b = pubkey2.slice(0,1);
  if ( a > b ) {
    return '_'+pubkey+'_'+pubkey2+'_';
  } else if ( a < b ) {
    return  '_'+pubkey2+'_'+pubkey+'_';
  } else {
    const aa = pubkey.slice(0,3);
    const bb = pubkey2.slice(0,3);
    if ( aa > bb ) {
      return  '_'+pubkey+'_'+pubkey2+'_';
    } else if ( aa < bb ) {
      return  '_'+pubkey2+'_'+pubkey+'_';
    } else {
      console.log('utils/concatPubKeys failed!')
      return 'ERROR';
    }
  }
}