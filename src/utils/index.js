export function getVideoFrameUrl(url, t = 0, w = 0, h = 0, f = 'png') {
  if (!url) return ''
  const str = ["video/snapshot", `t_${t}`, `w_${w}`, `h_${h}`, `f_${f}`].join(
    ","
  );
  return `${url}${url.includes('?') ? '&' : '?'}x-oss-process=${str}`;
}

