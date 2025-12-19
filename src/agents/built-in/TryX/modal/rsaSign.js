import jsrsasign from 'jsrsasign'

function RsaSign() {
  
  const key = jsrsasign.KEYUTIL.generateKeypair('RSA', 1024)
  const pubKeyPEM = jsrsasign.KEYUTIL.getPEM(key.pubKeyObj)
  const prvKeyPEM = jsrsasign.KEYUTIL.getPEM(key.prvKeyObj, 'PKCS1PRV')
  this.rsaKeys = {
    pubKeyPEM,
    prvKeyPEM,
  }

  function replaceRsaStr(str) {
    str = str.replace(/-----BEGIN PUBLIC KEY-----/, '');
    str = str.replace(/-----END PUBLIC KEY-----/, '');
    str = str.replace(/-----BEGIN RSA PRIVATE KEY-----/, '');
    str = str.replace(/-----END RSA PRIVATE KEY-----/, '');
    str = str.trim();
    return str
  }

}

RsaSign.prototype.decodeData = function(data) {
  if (!data) return ''
  const prv = jsrsasign.KEYUTIL.getKey(this.rsaKeys.prvKeyPEM)
  return jsrsasign.KJUR.crypto.Cipher.decrypt(
    jsrsasign.b64utohex(data),
    prv
  )
}

RsaSign.prototype.getPurePubKey = function() {
  let str = this.rsaKeys.pubKeyPEM
  str = str.replace(/-----BEGIN PUBLIC KEY-----/, '');
  str = str.replace(/-----END PUBLIC KEY-----/, '');
  str = str.replace(/-----BEGIN RSA PRIVATE KEY-----/, '');
  str = str.replace(/-----END RSA PRIVATE KEY-----/, '');
  str = str.trim();
  return str
}

let rsaSign = new RsaSign()


export default rsaSign


