import CryptoES from "crypto-es";

const decrypt = function (ciphertext: string, iv: string, t: number): string {
  try {
    const key = generateKey(t);
    const decrypted = CryptoES.AES.decrypt(ciphertext, CryptoES.enc.Utf8.parse(key), {
      iv: CryptoES.enc.Hex.parse(iv),
      mode: CryptoES.mode.CBC,
      padding: CryptoES.pad.Pkcs7,
    });
    const dec = CryptoES.enc.Utf8.stringify(decrypted).toString();
    return dec;
  } catch (error) {
    console.error("Decryption failed", error);
    throw error;
  }
};

function h(charArray: string[], modifier: number): string {
  const uniqueChars = Array.from(new Set(charArray));
  const numericModifier = Number(modifier.toString().slice(7));
  const transformedString = uniqueChars.map(char => {
    const charCode = char.charCodeAt(0);
    let newCharCode = Math.abs(charCode - (numericModifier % 127) - 1);
    if (newCharCode < 33) {
      newCharCode += 33;
    }
    return String.fromCharCode(newCharCode);
  }).join("");

  return transformedString;
}

function getParams(t: number): Record<string, string | number> {
  return {
    "akv": "2.8.1496",  // apk_version_name 版本号 
    "apv": "1.3.6", // 内部版本号
    "b": "XiaoMi", // 手机品牌
    "d": "e87a4d5f4f28d7a17d73c524eaa8ac37", // 设备id 可随机生成
    "m": "23046RP50C", // 手机型号
    "mac": "",  // mac地址 
    "n": "23046RP50C",  // 手机型号
    "t": t,  // 时间戳
    "wifiMac": "020000000000",  // wifiMac地址
  };
}

const generateKey = function (t: number): string {
  const params = getParams(t);
  const sortedKeys = Object.keys(params).sort();
  let concatenatedParams = "";

  sortedKeys.forEach(key => {
    if (key !== "t") {
      concatenatedParams += params[key];
    }
  });

  const keyArray = concatenatedParams.split("");
  const hashedKey = h(keyArray, t);
  return CryptoES.MD5(hashedKey).toString(CryptoES.enc.Hex);
};

export { decrypt, getParams };
