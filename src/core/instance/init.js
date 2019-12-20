/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0
// Vue 的初始化逻辑写的非常清楚，
// 把不同的功能逻辑拆成一些单独的函数执行，
// 让主线逻辑一目了然，这样的编程思想是非常值得借鉴和学习的
// Vue 初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，
// 初始化渲染，初始化 data、props、computed、watcher 等等。

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag //开始标签和结束标签
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed 一个避免被观察到的标志
    vm._isVue = true
    // merge options 合并选项 参数
    if (options && options._isComponent) {
      // optimize internal component instantiation 
      // 优化内部组件实例化
      // since dynamic options merging is pretty slow, and none of the 
      // 因为动态选项合并非常慢，没有一个是内部组件选项需要特殊处理。
      // internal component options needs special treatment.
      // 初始化内部组件
      initInternalComponent(vm, options)
    } else {
      //合并参数 将两个对象合成一个对象 将父值对象和子值对象合并在一起，并且优先取值子值，如果没有则取子值
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      //初始化 代理 监听
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)//初始化生命周期 标志
    initEvents(vm)//初始化事件
    initRender(vm)// 初始化渲染
    callHook(vm, 'beforeCreate')//触发beforeCreate钩子函数
    initInjections(vm) // resolve injections before data/props 在数据/道具之前解决注入问题 //初始化 inject
    initState(vm)//初始化状态
    initProvide(vm) // resolve provide after data/props解决后提供数据/道具  provide 选项应该是一个对象或返回一个对象的函数。该对象包含可注入其子孙的属性，用于组件之间通信。
    callHook(vm, 'created') //触发created钩子函数

    /* istanbul ignore if */
    //浏览器 性能监听
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      // Vue 的$mount()为手动挂载，
      // 在项目中可用于延时挂载（例如在挂载之前要进行一些其他操作、判断等），之后要手动挂载上。
      // new Vue时，el和$mount并没有本质上的不同。
      vm.$mount(vm.$options.el)
    }
  }
}
//初始化内部组件
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  // 这样做是因为它比动态枚举快。
  const parentVnode = options._parentVnode
  opts.parent = options.parent  //组件的父节点
  opts._parentVnode = parentVnode //组件的 虚拟vonde 父节点

  const vnodeComponentOptions = parentVnode.componentOptions //组件参数
  opts.propsData = vnodeComponentOptions.propsData  //组件数据
  opts._parentListeners = vnodeComponentOptions.listeners //组件 事件
  opts._renderChildren = vnodeComponentOptions.children//组件子节点
  opts._componentTag = vnodeComponentOptions.tag//组件的标签

  if (options.render) {
    opts.render = options.render //渲染函数
    opts.staticRenderFns = options.staticRenderFns  //静态渲染函数
  }
}
//解析new Vue constructor上的options拓展参数属性的 合并 过滤去重数据
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  // 有super属性，说明Ctor是Vue.extend构建的子类 继承的子类
  if (Ctor.super) {//超类
    const superOptions = resolveConstructorOptions(Ctor.super)//回调超类 表示继承父类
    const cachedSuperOptions = Ctor.superOptions// Vue构造函数上的options,如directives,filters,....
    if (superOptions !== cachedSuperOptions) {//判断如果 超类的options不等于子类的options 的时候
      // super option changed,
      //超级选项改变，
      // need to resolve new options.
      //需要解决新的选项。
      Ctor.superOptions = superOptions//让他的超类选项赋值Ctor.superOptions
      // check if there are any late-modified/attached options (#4976) 检查是否有任何后期修改/附加选项(#4976)
      // 解决修改选项 转义数据 合并 数据
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options 更新基本扩展选项
      if (modifiedOptions) {
        //extendOptions合并拓展参数
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 优先取Ctor.extendOptions 将两个对象合成一个对象 将父值对象和子值对象合并在一起，并且优先取值子值，如果没有则取子值
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {//如果参数含有name 组件name
        options.components[options.name] = Ctor
      }
    }
  }
  return options//返回参数
}
// 解决修改options 转义数据 合并 数据
function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options//获取选项
  const sealed = Ctor.sealedOptions//获取子类选项
  for (const key in latest) {//遍历最新选项
    if (latest[key] !== sealed[key]) {//如果选项不等于子类选项
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
