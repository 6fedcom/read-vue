/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

/*
  * aFn 函数会多次调用 里面就能体现了
  *  用对象去缓存记录函数
  *  idToTemplate 是一个函数，根据key值来 取值，如果第二次的key还是一样则从对象中取值，而不是重新在执行一次函数
  * */
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount //缓存上一次的Vue.prototype.$mount

/*
  * Vue 的$mount()为手动挂载，
  * 在项目中可用于延时挂载（例如在挂载之前要进行一些其他操作、判断等），之后要手动挂载上。
  * new Vue时，el和$mount并没有本质上的不同。
  * @params
  * */
Vue.prototype.$mount = function (
  el?: string | Element, //真实dom 或者是string
  hydrating?: boolean //新的虚拟dom vonde
): Component {
  el = el && query(el)//获取dom

  /* istanbul ignore if */
  //如果el 是body 或者文档 则警告
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }
  //获取参数
  const options = this.$options
  // resolve template/el and convert to render function
  //解析模板/el并转换为render函数
  if (!options.render) {
    //获取模板字符串
    let template = options.template
    if (template) {
      if (typeof template === 'string') {//模板是字符串
        //模板第一个字符串为# 则判断该字符串为 dom的id
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)//获取字符串模板的innerHtml
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {//如果template 是don节点 则获取他的html
        template = template.innerHTML
      } else {
        //如果什么都是不是则发出警告
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      //如果模板没有，dom节点存在则获取dom节点中的html 给模板
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      //监听性能监测
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      //创建模板
      const { render, staticRenderFns } = compileToFunctions(
        template//模板字符串
        , {
          outputSourceRange: process.env.NODE_ENV !== 'production',
          shouldDecodeNewlines,//flase //IE在属性值中编码换行，而其他浏览器则不会
          shouldDecodeNewlinesForHref,//true chrome在a[href]中编码内容
          delimiters: options.delimiters,//改变纯文本插入分隔符。修改指令的书写风格，比如默认是{{mgs}}  delimiters: ['${', '}']之后变成这样 ${mgs}
          comments: options.comments//当设为 true 时，将会保留且渲染模板中的 HTML 注释。默认行为是舍弃它们。
        }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
