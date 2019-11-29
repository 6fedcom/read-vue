学习源码可以很好地巩固基础，修炼内功，提升技术。前端几乎都会学习 JS 的基础知识，如类型、变量、函数、作用域、闭包、原型链、event loop 等知识，但很多人很难把这些知识在实践中运用自如，主要原因还是实践的少了，大部分时间都在写业务的胶水代码。学习 Vue.js 这类框架的源码，会不断去巩固这些知识点，如果你源码看熟练了，那么你的 JS 基础就会更扎实。

参考黄老师的[《vue.js技术揭秘》![](http://cdn.ru23.com/common/link.svg)](https://ustbhuangyi.github.io/vue-analysis/)，加入了自己的逐行注释
<!-- https://www.cnblogs.com/hao123456/p/10616356.html -->
## 准备工作

Vue.js 的源码利用了 [`Flow`](https://flow.org/en/docs/getting-started/) 做了静态类型检查,Vue.js 的源码都在 src 目录下，其目录结构如下

![1.vue 源码目录](http://cdn.ru23.com/vue-analysis/1.1vue%E6%BA%90%E7%A0%81%E7%9B%AE%E5%BD%95.jpg)

[了解更多...![](http://cdn.ru23.com/common/link.svg)](https://github.com/ru23/vue-source-code-analysis/blob/dev/vue-code-analysis/2.vue%E6%BA%90%E7%A0%81%E7%9B%AE%E5%BD%95%E8%AE%BE%E8%AE%A1.md)

2.入口源码分析
我们之前提到过 Vue.js 构建过程，在 web 应用下，我们来分析 `Runtime + Compiler` 构建出来的 Vue.js，它的入口是 [`src/platforms/web/entry-runtime-with-compiler.js` ![](http://cdn.ru23.com/common/link.svg)](https://github.com/ru23/vue-source-code-analysis/blob/dev/src/platforms/web/entry-runtime-with-compiler.js)：

## 数据驱动

##### 1.从入口代码开始分析，new Vue发生了什么？

new 关键字在 Javascript 语言中代表实例化是一个对象，而 Vue 实际上是一个类，类在 Javascript 中是用 Function 来实现的，来看一下源码，在[`src/core/instance/index.js`![](http://cdn.ru23.com/common/link.svg)](https://github.com/ru23/vue-source-code-analysis/blob/dev/src/core/instance/init.js) 中。
Vue 初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 `data、props、computed、watcher` 等等。

Vue 的初始化逻辑写的非常清楚，把不同的功能逻辑拆成一些单独的函数执行，让主线逻辑一目了然，这样的编程思想是非常值得借鉴和学习的。
 
参考：