<template>
  <ul
    :class="[
      'el-upload-list',
      'el-upload-list--' + listType,
      { 'is-disabled': disabled }
    ]"
    name="el-list"
  >
    <li
      v-for="(file, index) in files"
      :key="`${index}`"
      :class="['el-upload-list__item', 'is-' + file.status]"
    >
      <el-tooltip
        :disabled="file.status !== 'fail'"
        :content="errorTooltipText"
        placement="top"
        effect="light"
      >
        <div>
          <i v-if="listType === 'text'" class="h-icon-attach" />
          <div class="el-upload-list__item-content">
            <img
              v-if="
                ['picture-card', 'picture'].indexOf(listType) > -1 &&
                  (file.percentage === undefined ||
                    file.percentage >= 100 ||
                    file.status === 'success' ||
                    autoUpload === false)
              "
              :src="file.url"
              class="el-upload-list__item-thumbnail"
              alt=""
            />
            <i
              v-if="
                ['picture-card', 'picture'].indexOf(listType) > -1 &&
                  file.percentage !== undefined &&
                  file.percentage < 100
              "
              class="uploading-close h-icon-close"
              @click="$emit('remove', file)"
            ></i>
            <span
              :style="{ width: fileNameWidth(file) }"
              class="el-upload-list__item-name"
              @click="handleClick(file)"
            >
              <name-content
                :file="file"
                :file-name-render="fileNameRender"
              ></name-content>
            </span>
            <i
              class="list-icon-btn h-icon-close_sm"
              @click="$emit('remove', file)"
            />
            <i
              v-if="file.status === 'fail' && listType === 'text'"
              class="list-icon-btn h-icon-refresh_sm"
              @click="handleReupload(file)"
            />
            <el-progress
              v-if="file.status === 'uploading'"
              :show-text="false"
              :stroke-width="2"
              :percentage="parsePercentage(file.percentage)"
              type="line"
            />
          </div>
          <span
            v-if="
              listType === 'picture-card' &&
                (file.percentage === undefined ||
                  file.percentage >= 100 ||
                  file.status === 'success' ||
                  autoUpload === false)
            "
            class="el-upload-list__item-actions"
          >
            <span
              v-if="file.status === 'fail' && listType === 'picture-card'"
              class="el-upload-list__item-reupload"
              @click="handleReupload(file)"
            >
              <i class="h-icon-refresh"></i>
            </span>
            <span
              v-if="
                file.status !== 'fail' &&
                  handlePreview &&
                  listType === 'picture-card'
              "
              class="el-upload-list__item-preview"
              @click="handlePreview(file)"
            >
              <i class="h-icon-zoom_in" />
            </span>
            <span
              class="el-upload-list__item-delete"
              @click="$emit('remove', file)"
            >
              <i class="h-icon-delete" />
            </span>
          </span>
        </div>
      </el-tooltip>
    </li>
    <slot />
  </ul>
</template>
<script>
import Locale from 'hui/src/mixins/locale';
import ElProgress from 'hui/packages/progress';
import ElTooltip from 'hui/packages/tooltip';

export default {
  components: {
    ElProgress,
    ElTooltip,
    NameContent: {
      props: {
        file: {
          required: true
        },
        fileNameRender: Function
      },
      render(h) {
        const { name } = this.file;
        return this.fileNameRender ? (
          this.fileNameRender(h, this.file)
        ) : (
          <span>{name}</span>
        );
      }
    }
  },
  mixins: [Locale],

  props: {
    files: {
      type: Array,
      default() {
        return [];
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    handlePreview: {
      type: Function,
      default: null
    },
    listType: {
      type: String,
      default: ''
    },
    reupload: {
      type: Function,
      default: null
    },
    fileNameRender: {
      type: Function,
      default: null
    },
    errorTooltipText: {
      type: String,
      default: 'upload error'
    },
    autoUpload: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    parsePercentage(val) {
      return parseInt(val, 10);
    },
    handleClick(file) {
      this.handlePreview && this.handlePreview(file);
    },
    handleReupload(file) {
      this.reupload && this.reupload(file);
    },
    fileNameWidth(file) {
      return file.status === 'fail' && this.listType === 'text'
        ? `calc(100% - 52px)`
        : `calc(100% - 28px)`;
    }
  }
};
</script>
