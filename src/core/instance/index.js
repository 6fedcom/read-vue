import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
//vue 构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 可以看到 Vue 只能通过 new 关键字初始化，然后会调用 this._init 方法
  this._init(options)
}
// _init
initMixin(Vue)
// $set、$delete、$watch
stateMixin(Vue)
// $on、$once、$off、$emit
eventsMixin(Vue)
// _update、$forceUpdate、$destroy
lifecycleMixin(Vue)
// $nextTick、_render、以及多个内部调用的方法
renderMixin(Vue)

export default Vue
