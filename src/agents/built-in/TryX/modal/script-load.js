export function loadScript(src) {
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
