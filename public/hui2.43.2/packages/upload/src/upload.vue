<script>
import ajax from './ajax';
import UploadDragger from './upload-dragger.vue';

export default {
  components: {
    UploadDragger
  },
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: 'file'
    },
    data: {
      type: Object,
      default: null
    },
    headers: {
      type: [Function, Object],
      default: null
    },
    withCredentials: {
      type: Boolean,
      default: null
    },
    multiple: {
      type: Boolean,
      default: null
    },
    accept: {
      type: String,
      default: ''
    },
    onStart: {
      type: Function,
      default: null
    },
    onProgress: {
      type: Function,
      default: null
    },
    onSuccess: {
      type: Function,
      default: null
    },
    onError: {
      type: Function,
      default: null
    },
    beforeUpload: {
      type: Function,
      default: null
    },
    drag: {
      type: Boolean,
      default: null
    },
    onPreview: {
      type: Function,
      default: function() {}
    },
    onRemove: {
      type: Function,
      default: function() {}
    },
    onReady: {
      type: Function,
      default: null
    },
    fileList: {
      type: Array,
      default: null
    },
    autoUpload: {
      type: Boolean,
      default: null
    },
    listType: {
      type: String,
      default: ''
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
      default: function() {}
    }
  },

  data() {
    return {
      mouseover: false,
      reqs: {}
    };
  },

  methods: {
    isImage(str) {
      return str.indexOf('image') !== -1;
    },
    handleChange(ev) {
      const files = ev.target.files;

      if (!files) return;
      this.uploadFiles(files);
    },
    uploadFiles(files) {
      if (this.limit && this.fileList.length + files.length > this.limit) {
        this.onExceed && this.onExceed(files, this.fileList);
        return;
      }

      let postFiles = Array.prototype.slice.call(files);
      if (!this.multiple) {
        postFiles = postFiles.slice(0, 1);
      }

      if (postFiles.length === 0) {
        return;
      }

      if (this.onReady) {
        const result = this.onReady(postFiles);
        if (result === false) return;
      }

      this.$parent.uploadFilesAll = [];
      postFiles.forEach(rawFile => {
        this.onStart(rawFile);
        if (this.autoUpload) this.upload(rawFile);
      });
    },
    upload(rawFile) {
      this.$refs.input.value = null;

      if (!this.beforeUpload) {
        return this.post(rawFile);
      }

      const before = this.beforeUpload(rawFile);
      if (before && before.then) {
        before.then(
          processedFile => {
            if (
              Object.prototype.toString.call(processedFile) === '[object File]'
            ) {
              this.post(processedFile);
            } else {
              this.post(rawFile);
            }
          },
          () => {
            this.onRemove(null, rawFile);
          }
        );
      } else if (before !== false) {
        this.post(rawFile);
      } else {
        this.onRemove(null, rawFile);
      }
    },
    abort(file) {
      const { reqs } = this;
      if (file) {
        let uid = file;
        if (file.uid) uid = file.uid;
        if (reqs[uid]) {
          reqs[uid].abort();
        }
      } else {
        Object.keys(reqs).forEach(uid => {
          if (reqs[uid]) reqs[uid].abort();
          delete reqs[uid];
        });
      }
    },
    post(rawFile) {
      const { uid } = rawFile;
      const options = {
        headers: this.headers,
        withCredentials: this.withCredentials,
        file: rawFile,
        data: this.data,
        filename: this.name,
        action: this.action,
        onProgress: e => {
          this.onProgress(e, rawFile);
        },
        onSuccess: (res, xhr) => {
          this.onSuccess(res, rawFile, xhr);
          delete this.reqs[uid];
        },
        onError: (err, xhr) => {
          this.onError(err, rawFile, xhr);
          delete this.reqs[uid];
        }
      };
      const req = this.httpRequest(options);
      this.reqs[uid] = req;
      if (req && req.then) {
        req.then(options.onSuccess, options.onError);
      }
    },
    handleClick() {
      if (!this.disabled) {
        this.$refs.input.value = null;
        this.$refs.input.click();
      }
    }
  },

  render() {
    /* if (!this.visible) return; */

    const {
      visible,
      handleClick,
      drag,
      name,
      handleChange,
      multiple,
      accept,
      listType,
      uploadFiles,
      disabled
    } = this;
    const data = {
      class: {
        'el-upload': true
      },
      on: {
        click: handleClick
      }
    };
    data.class[`el-upload--${listType}`] = true;
    return (
      <div {...data} v-show={visible}>
        {drag ? (
          <upload-dragger disabled={disabled} on-file={uploadFiles}>
            {this.$slots.default}
          </upload-dragger>
        ) : (
          this.$slots.default
        )}
        <input
          class='el-upload__input'
          type='file'
          ref='input'
          name={name}
          on-change={handleChange}
          multiple={multiple}
          accept={accept}
        />
      </div>
    );
  }
};
</script>
