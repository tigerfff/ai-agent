<template>
    <!-- css内部已隐藏掉footer/header -->
    <el-dialog 
        class="chat-bi-drawer" 
        v-bind="$attrs" 
        v-on="$listeners"
        :style="{ '--dialog-width': $attrs.width || '600px' }"
    >
        <template v-for="(index, name) in $slots" v-slot:[name]>
            <slot :name="name" />
        </template>
    </el-dialog>
</template>

<script>

export default {
    name: "Drawer",
    inheritAttrs: false
};
</script>

<style lang="scss">
.chat-bi-drawer {
    // 出入场动画调整
    &.dialog-fade-enter-active {
        animation: drawer-fade-in 0.3s;
    }
    &.dialog-fade-leave-active {
        animation: drawer-fade-out 0.3s;
    }

    // 弹窗样式定制
    .el-dialog {
        position: absolute !important;
        margin: 0 !important;
        width: var(--dialog-width) !important;
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: #e2ecf9;
        background-image: radial-gradient(
                circle at 110% 110%,
                #c5ceff 0%,
                rgba(255, 255, 255, 0) 49%
            ),
            radial-gradient(
                circle at 66% -8.6%,
                #d0e2ff 0%,
                rgba(255, 255, 255, 0) 78%
            );
        border-radius: 16px;
        top: 16px !important;
        left: auto;
        right: 16px;
        height: calc(100vh - 32px);
        display: flex;
        flex-direction: column;

        .el-dialog__header {
            display: none;
        }
        .el-dialog__footer {
            display: none;
        }
        .el-dialog__body {
            flex: 1;
            box-sizing: border-box;
            position: relative;

            // 超长滚动
            .el-dialog__body-wrapper {
                padding: 0;
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
            }

            /*滚动条样式*/
            &::-webkit-scrollbar {
                width: 8px; /*高宽分别对应横竖滚动条的尺寸*/
                height: 10px;
            }
            &::-webkit-scrollbar-thumb {
                /*滚动条里面小方块*/
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.15);
                &:hover {
                    background: rgba(0, 0, 0, 0.3);
                }
                &:active {
                    background: rgba(0, 0, 0, 0.5);
                }
            }
        }
    }
}

@keyframes drawer-fade-in {
    0% {
        transform: translateX(500px);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}
@keyframes drawer-fade-out {
    0% {
        transform: translateX(0);
        opacity: 1;
    }
    100% {
        transform: translateX(500px);
        opacity: 0;
    }
}
</style>
