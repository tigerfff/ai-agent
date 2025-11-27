<script>
import UploadDragger from './upload-dragger.vue';
import { hasOwn } from 'hui/src/utils/util';

export default {
  components: {
    UploadDragger
  },
  props: {
    type: {
      type: String,
      default: null
    },
    data: {
      type: null,
      default: null
    },
    action: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: 'file'
    },
    withCredentials: {
      type: Boolean,
      default: null
    },
    accept: {
      type: String,
      default: null
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
    onPreview: {
      type: Function,
      default: function() {}
    },
    onRemove: {
      type: Function,
      default: function() {}
    },
    drag: {
      type: Boolean,
      default: null
    },
    listType: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      mouseover: false,
      domain: '',
      file: null,
      submitting: false
    };
  },

  created() {
    this.frameName = 'frame-' + Date.now();
  },

  mounted() {
    const self = this;
    !this.$isServer &&
      window.addEventListener(
        'message',
        event => {
          if (!self.file) return;
          var targetOrigin = new URL(self.action).origin;
          if (event.origin !== targetOrigin) return;
          var response = event.data;
          if (response.result === 'success') {
            self.onSuccess(response, self.file);
          } else if (response.result === 'failed') {
            self.onError(response, self.file);
          }
          self.submitting = false;
          self.file = null;
        },
        false
      );
  },

  methods: {
    isImage(str) {
      return str.indexOf('image') !== -1;
    },
    handleClick() {
      if (!this.disabled) {
        this.$refs.input.click();
      }
    },
    handleChange(ev) {
      const file = ev.target.value;
      if (file) {
        this.uploadFiles(file);
      }
    },
    uploadFiles(file) {
      if (this.submitting) return;
      this.submitting = true;
      this.file = file;
      this.onStart(file);

      const formNode = this.getFormNode();
      const dataSpan = this.getFormDataNode();
      let data = this.data;
      if (typeof data === 'function') {
        data = data(file);
      }
      const inputs = [];
      for (const key in data) {
        if (hasOwn(data, key)) {
          inputs.push(`<input name="${key}" value="${data[key]}"/>`);
        }
      }
      dataSpan.innerHTML = inputs.join('');
      formNode.submit();
      dataSpan.innerHTML = '';
    },
    getFormNode() {
      return this.$refs.form;
    },
    getFormDataNode() {
      return this.$refs.data;
    }
  },

  render() {
    const { drag, uploadFiles, listType, frameName, disabled } = this;
    const oClass = { 'el-upload': true };
    oClass[`el-upload--${listType}`] = true;

    return (
      <div
        class={oClass}
        on-click={this.handleClick}
        nativeOn-drop={this.onDrop}
        nativeOn-dragover={this.handleDragover}
        nativeOn-dragleave={this.handleDragleave}
      >
        <iframe on-load={this.onload} ref='iframe' name={frameName} />
        <form
          ref='form'
          action={this.action}
          target={frameName}
          enctype='multipart/form-data'
          method='POST'
        >
          <input
            class='el-upload__input'
            type='file'
            ref='input'
            name='file'
            on-change={this.handleChange}
            accept={this.accept}
          />
          <input
            type='hidden'
            name='documentDomain'
            value={this.$isServer ? '' : document.domain}
          />
          <span ref='data' />
        </form>
        {drag ? (
          <upload-dragger on-file={uploadFiles} disabled={disabled}>
            {this.$slots.default}
          </upload-dragger>
        ) : (
          this.$slots.default
        )}
      </div>
    );
  }
};
</script>
