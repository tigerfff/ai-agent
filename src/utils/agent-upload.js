/**
 * 通用的附件预上传处理逻辑
 * @param {Array<File>} rawFiles - 原始文件列表
 * @param {Object} context - 上下文 { updateItem }
 * @param {Object} uploader - OssUploader 实例
 * @param {Function} setUploadingState - 设置上传状态的回调 (state: boolean) => void
 */
export async function handleAgentPreUpload(rawFiles, context, uploader, setUploadingState) {
  console.log('handleAgentPreUpload', rawFiles, context, uploader, setUploadingState);
  const { updateItem } = context;

  if (!uploader) {
    // 本地模式
    if (typeof updateItem === 'function') {
      rawFiles.forEach((file, i) => {
        updateItem(i, {
          type: file.type.startsWith('video') ? 'video' : 'image',
          status: 'done',
          percent: 100
        });
      });
    }
    return;
  }

  if (setUploadingState) setUploadingState(true);
  
  try {
    await Promise.all(
      rawFiles.map(async (file, index) => {
        const res = await uploader.upload(file, (percent) => {
          if (typeof updateItem === 'function') {
            updateItem(index, {
              status: 'uploading',
              percent: Math.round(percent * 100)
            });
          }
        });

        if (typeof updateItem === 'function') {
          updateItem(index, {
            url: res.url,
            name: res.name || file.name,
            size: file.size,
            type: file.type.startsWith('video') ? 'video' : 'image',
            rawFile: null,
            status: 'done',
            percent: 100
          });
        }
      })
    );
  } catch (e) {
    console.error('[AgentUpload] OSS pre-upload failed:', e);
    if (typeof updateItem === 'function') {
      rawFiles.forEach((file, i) => {
        updateItem(i, {
          status: 'error',
          percent: 0
        });
      });
    }
  } finally {
    if (setUploadingState) setUploadingState(false);
  }
}

