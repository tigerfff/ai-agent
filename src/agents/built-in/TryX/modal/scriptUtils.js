function loadScript(src) {
  return new Promise((resolve, reject) => {
    const setScript = document.createElement('script')
    const head = document.head || document.getElementsByTagName('head')[0]
    setScript.src = src
    head.appendChild(setScript)
    setScript.onload = () => {
      resolve()
    }
    setScript.onerror = () => {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject()
    }
  })
}

function loadCss(path, name) {
  return new Promise((resolve, reject) => {
    const head = document.getElementsByTagName('head')[0]
    const linkId = `skin-${name}`
    let linkTag = document.getElementById(linkId)
    linkTag && linkTag.parentNode.removeChild(linkTag)
    linkTag = document.createElement('link')
    linkTag.rel = 'stylesheet'
    linkTag.type = 'text/css'
    linkTag.href = path
    linkTag.onload = () => resolve()
    linkTag.onerror = (err) => reject(err)
    head.appendChild(linkTag)
  })
}

async function loadEZUIKit() {
  return new Promise(async (resolve, reject) => {
    try {
      if (window.EZUIKit) {
        reject('EZUIKit已加载')
        return
      }
      if (process.env.NODE_ENV === 'development') {
        await loadScript('https://pb.hik-cloud.com/static/hik-cloud-player-static/ezuikit.js')
        resolve(true)
      } else {
        await loadScript(`${window.location.origin}/static/hik-cloud-player-static/ezuikit.js`)
        resolve(true)
      }
    } catch(error) {
      reject(errror)
    }
  })
}

export { loadScript, loadCss, loadEZUIKit }
