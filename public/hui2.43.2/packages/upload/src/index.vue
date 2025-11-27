<script>
import ajax from './ajax';
import UploadList from './upload-list';
import Upload from './upload';
import IframeUpload from './iframe-upload';
import ElProgress from 'hui/packages/progress';
import Migrating from 'hui/src/mixins/migrating';

function noop() {}

export default {
  name: 'ElUpload',

  components: {
    ElProgress,
    UploadList,
    Upload,
    IframeUpload
  },

  mixins: [Migrating],

  props: {
    action: {
      type: String,
      default: ''
    },
    headers: {
      type: Object,
      default() {
        return {};
      }
    },
    data: {
      type: Object,
      default() {
        return {};
      }
    },
    multiple: {
      type: Boolean,
      default: null
    },
    name: {
      type: String,
      default: 'file'
    },
    drag: {
      type: Boolean,
      default: null
    },
    dragger: {
      type: Boolean,
      default: null
    },
    withCredentials: {
      type: Boolean,
      default: null
    },
    showFileList: {
      type: Boolean,
      default: true
    },
    accept: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'select'
    },
    beforeUpload: {
      type: Function,
      default: null
    },
    beforeRemove: {
      type: Function,
      default: null
    },
    onRemove: {
      type: Function,
      default: noop
    },
    onChange: {
      type: Function,
      default: noop
    },
    onPreview: {
      type: Function,
      default: null
    },
    onSuccess: {
      type: Function,
      default: noop
    },
    onProgress: {
      type: Function,
      default: noop
    },
    onError: {
      type: Function,
      default: noop
    },
    onReady: {
      type: Function,
      default: null
    },
    onSubmitError: {
      type: Function,
      default: noop
    },
    fileList: {
      type: Array,
      default() {
        return [];
      }
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    listType: {
      type: String,
      default: 'text' // text,picture,picture-card
    },
    httpRequest: {
      type: Function,
      default: ajax
    },
    disabled: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: null
    },
    onExceed: {
      type: Function,
      default: noop
    },
    fileNameRender: {
      type: Function,
      default: null
    },
    singleFile: {
      type: Boolean,
      default: false
    },
    errorTooltipText: {
      type: String,
      default: 'upload error'
    }
  },

  data() {
    return {
      uploadFiles: [],
      uploadFilesAll: [], // 用于存储所有上传的文件（无论是否showFileList）
      dragOver: false,
      draging: false,
      tempIndex: 1
    };
  },

  watch: {
    fileList: {
      immediate: true,
      handler(fileList) {
        this.uploadFiles = fileList.map(item => {
          item.uid = item.uid || Date.now() + this.tempIndex++;
          item.status = 'success';
          return item;
        });
      }
    }
  },

  methods: {
    reupload(rawFile) {
      this.$refs['upload-inner'].upload(rawFile);
    },
    handleStart(rawFile) {
      rawFile.uid = Date.now() + this.tempIndex++;
      const file = {
        status: 'ready',
        name: rawFile.name,
        size: rawFile.size,
        percentage: 0,
        uid: rawFile.uid,
        raw: rawFile
      };

      try {
        file.url = URL.createObjectURL(rawFile);
      } catch (err) {
        // eslint-disable-next-line
        console.error(err);
        return;
      }

      this.showFileList
        ? this.uploadFiles.push(file)
        : (this.uploadFiles = [file]);

      this.uploadFilesAll.push(file);

      // this.uploadFiles.push(file);
      this.onChange(file, this.uploadFiles);
    },
    handleProgress(ev, rawFile) {
      var file = this.getFile(rawFile);
      this.onProgress(ev, file, this.uploadFiles);
      file.status = 'uploading';
      file.percentage = ev.percent || 0;
    },
    handleSuccess(res, rawFile, xhr) {
      var file = this.getFile(rawFile);

      if (file) {
        file.status = 'success';
        file.response = res;

        this.onSuccess(res, file, this.uploadFiles, xhr);
        this.onChange(file, this.uploadFiles);
      }
    },
    handleError(err, rawFile, xhr) {
      var file = this.getFile(rawFile);
      // var fileList = this.uploadFiles;

      file.status = 'fail';

      // fileList.splice(fileList.indexOf(file), 1);

      this.onError(err, file, this.uploadFiles, xhr);
      this.onChange(file, this.uploadFiles);
    },
    handleRemove(file, raw) {
      if (raw) {
        file = this.getFile(raw);
      }

      const doRemove = () => {
        this.abort(file);
        const fileList = this.uploadFiles;
        fileList.splice(fileList.indexOf(file), 1);
        this.onRemove(file, fileList);
      };

      if (!this.beforeRemove) {
        doRemove();
      } else if (typeof this.beforeRemove === 'function') {
        const before = this.beforeRemove(file, this.uploadFiles);
        if (before && before.then) {
          before.then(() => {
            doRemove();
          }, noop);
        } else if (before !== false) {
          doRemove();
        }
      }
    },
    getFile(rawFile) {
      var fileList =
        this.multiple && this.showFileList === false
          ? this.uploadFilesAll
          : this.uploadFiles;
      var target;
      fileList.every(item => {
        target = rawFile.uid === item.uid ? item : null;
        return !target;
      });
      return target;
    },
    abort(file) {
      this.$refs['upload-inner'] && this.$refs['upload-inner'].abort(file);
    },
    clearFiles() {
      this.uploadFiles = [];
    },
    submit() {
      const readyFiles = this.uploadFiles.filter(
        file => file.status === 'ready'
      );
      readyFiles.length === 0
        ? this.onSubmitError({ type: 'empty', uploadFiles: this.uploadFiles })
        : readyFiles.forEach(file => {
            this.$refs['upload-inner'].upload(file.raw);
          });
    },
    getMigratingConfig() {
      return {
        props: {
          'default-file-list': 'default-file-list is renamed to file-list.',
          'show-upload-list': 'show-upload-list is renamed to show-file-list.',
          'thumbnail-mode':
            'thumbnail-mode has been deprecated, you can implement the same effect according to this case: http://element.eleme.io/#/zh-CN/component/upload#yong-hu-tou-xiang-shang-chuan'
        }
      };
    }
  },

  render() {
    var uploadList;

    var uploadData = {
      props: {
        visible: !(this.singleFile && this.uploadFiles.length >= 1),
        type: this.type,
        drag: this.drag,
        limit: this.limit,
        action: this.action,
        multiple: this.multiple,
        'before-upload': this.beforeUpload,
        'with-credentials': this.withCredentials,
        headers: this.headers,
        name: this.name,
        data: this.data,
        accept: this.accept,
        fileList: this.uploadFiles,
        autoUpload: this.autoUpload,
        listType: this.listType,
        disabled: this.disabled,
        'on-exceed': this.onExceed,
        'on-start': this.handleStart,
        'on-progress': this.handleProgress,
        'on-success': this.handleSuccess,
        'on-error': this.handleError,
        'on-preview': this.onPreview,
        'on-remove': this.handleRemove,
        'on-ready': this.onReady,
        'http-request': this.httpRequest
      },
      ref: 'upload-inner'
    };

    const trigger = this.$slots.trigger || this.$slots.default;
    var uploadComponent =
      typeof FormData !== 'undefined' || this.$isServer ? (
        <upload {...uploadData}>{trigger}</upload>
      ) : (
        <iframeUpload {...uploadData}>{trigger}</iframeUpload>
      );

    /* if (this.singleFile && this.uploadFiles.length >= 1) {
      uploadComponent = undefined;
    } */
    if (this.showFileList) {
      uploadList = (
        <UploadList
          disabled={this.disabled}
          listType={this.listType}
          files={this.uploadFiles}
          reupload={this.reupload}
          autoUpload={this.autoUpload}
          on-remove={this.handleRemove}
          handlePreview={this.onPreview}
          fileNameRender={this.fileNameRender}
          errorTooltipText={this.errorTooltipText}
        >
          {this.listType === 'picture-card' &&
          (this.limit == null || this.uploadFiles.length < this.limit)
            ? uploadComponent
            : ''}
        </UploadList>
      );
    }

    return (
      <div>
        {this.listType === 'picture-card' ? uploadList : ''}
        {this.listType !== 'picture-card'
          ? this.$slots.trigger
            ? [uploadComponent, this.$slots.default]
            : uploadComponent
          : ''}
        {this.$slots.tip}
        {this.listType !== 'picture-card' ? uploadList : ''}
      </div>
    );
  }
};
</script>
