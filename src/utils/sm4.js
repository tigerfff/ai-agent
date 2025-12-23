import { sm4 } from "sec-crypto";
async function readFileAsArrayBuffer(file) {
  // File 对象是“引用”，不是数据本身
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
function base64toHEX(base64) {
  var raw = window.atob(base64);
  var HEX = "";
  for (let i = 0; i < raw.length; i++) {
    var _hex = raw.charCodeAt(i).toString(16);
    HEX += _hex.length == 2 ? _hex : "0" + _hex;
  }
  return HEX;
}
function sm4Encrypt(arrayBuffer, kmsDataKey) {
  // ArrayBuffer 是 JavaScript 中表示原始二进制数据的对象，它可以高效地存储文件的字节数据
  // 将ArrayBuffer转成HEX字符串
  const bytes = new Uint8Array(arrayBuffer);
  const hexData = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const hexDataKey = base64toHEX(kmsDataKey.dataKey);

  // SM4-CBC加密
  const encryptedHex = sm4.encrypt(hexData, hexDataKey.slice(0, 32), {
    iv: hexDataKey.slice(32, 64),
    mode: "cbc",
  });

  // 将HEX字符串转回Uint8Array
  const result = new Uint8Array(
    encryptedHex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))
  );

  return result;
}

export async function createEncryptedBlob(file, { kmsDataKey }) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  // 加密文件
  const encryptedData = sm4Encrypt(arrayBuffer, kmsDataKey);
  // 构造Blob（保留原始文件类型）
  // Blob 是浏览器原生支持的二进制传输格式，而 Uint8Array 需要手动封
  const encryptedBlob = new Blob([encryptedData], { type: file.type });
  return encryptedBlob;
}
