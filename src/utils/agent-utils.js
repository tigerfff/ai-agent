/**
 * 适配历史消息格式
 * 将后端返回的单一消息对拆分为前端所需的「用户一条 + AI 一条」
 * @param {Object} msg - 后端返回的消息对象
 * @returns {Object} { user, ai }
 */
export function adaptMessage(msg) {
  const images = (msg.files && Array.isArray(msg.files.image)) ? msg.files.image : [];
  const videos = (msg.files && Array.isArray(msg.files.video)) ? msg.files.video : [];

  const userAttachments = [];

  images.forEach((item, idx) => {
    if (item && item.url) {
      userAttachments.push({
        type: 'image',
        url: item.url,
        name: `图片${idx + 1}`
      });
    }
  });

  videos.forEach((item, idx) => {
    if (item && item.url) {
      userAttachments.push({
        type: 'video',
        url: item.url,
        name: `视频${idx + 1}`
      });
    }
  });

  const user = {
    key: `${msg.msgId || msg.chatId || 'user' + Date.now()}-u`,
    role: 'user',
    content: msg.userText || '',
    attachments: userAttachments,
    variant: 'filled',
    placement: 'end',
    time: msg.createTime
  };

  // 将后端的 userEvaluation 映射为前端的 likeStatus
  // 后端: "UPVOTE" | "DOWNVOTE" | "NO_EVAL"
  // 前端: "like" | "dislike" | ""
  let likeStatus = '';
  if (msg.userEvaluation === 'UPVOTE') {
    likeStatus = 'like';
  } else if (msg.userEvaluation === 'DOWNVOTE') {
    likeStatus = 'dislike';
  }

  const ai = {
    key: `${msg.msgId || msg.chatId || 'ai' + Date.now()}-a`,
    role: 'ai',
    content: msg.assistantText || '',
    attachments: [], // 目前后端没给出 AI 侧附件
    variant: 'filled',
    placement: 'start',
    time: msg.createTime,
    msgId: msg.msgId, // 保存 msgId，用于评价接口
    likeStatus // 保存点赞状态
  };

  return { user, ai };
}

