
读代码可能有两种原因，一是因为二次开发或者对这个东西某处不满意想改，二是想学习其中的设计实现思路（为开源做贡献或打算写拓展）。当然阅读源代码的好处肯定是不言而喻的，
学习源码可以很好地巩固基础，修炼内功，提升技术。前端几乎都会学习 JS 的基础知识，如类型、变量、函数、作用域、闭包、原型链、event loop 等知识，但很多人很难把这些知识在实践中运用自如，主要原因还是实践的少了，大部分时间都在写业务的胶水代码。学习 框架的源码，会不断去巩固这些知识点，如果你源码看熟练了，那么你的 JS 基础就会更扎实。

从扩展思路的角度来说，一个程序员应该好好读过这样一些代码：

## 文章目录

[学习源码的好处![](http://cdn.ru23.com/common/link.svg)](/vue-code-analysis/1.Benefits of learning source code.md)

学习vue源码前的准备工作


<!-- https://www.cnblogs.com/hao123456/p/10616356.html -->
## 准备工作
js本身是弱类型语言，java是强类型语言，尽管js不强制我们严格类型使用，但是开发大项目时，变量的不确定性会让我们很头疼，出现不易排查的问题，因此静态类型检查对于发现和排查这些问题很有用。Vue.js 的源码利用了 [`Flow`](https://flow.org/en/docs/getting-started/) 做了静态类型检查,flow可以按我们的规定检查我们使用的这些类型的代码是否可靠。

Vue.js 的源码利用了 [`Flow`](https://flow.org/en/docs/getting-started/) 做了静态类型检查,Vue.js 的源码都在 src 目录下，其目录结构如下
```
├─ scripts --------------------------------- 包含与构建相关的脚本和配置文件
│   ├─ alias.js -------------------------------- 源码中使用到的模块导入别名
│   ├─ config.js ------------------------------- 项目的构建配置
├─ build ----------------------------------- 构建相关的文件，一般情况下我们不需要动
├─ dist ------------------------------------ 构建后文件的输出目录
├─ examples -------------------------------- 存放一些使用Vue开发的应用案例
├─ flow ------------------------------------ 静态类型检查工具[Flow](https://flowtype.org/)的类型声明
├─ package.json
├─ test ------------------------------------ 测试文件
├─ src ------------------------------------- 源码目录
│   ├─ compiler ------------------------------ 编译器代码，用来将 template 编译为 render 函数
│   │   ├─ parser ------------------------------ 存放将模板字符串转换成元素抽象语法树的代码
│   │   ├─ codegen ----------------------------- 存放从抽象语法树(AST)生成render函数的代码
│   │   ├─ optimizer.js ------------------------ 分析静态树，优化vdom渲染
│   ├─ core ------------------------------------ 存放通用的，平台无关的运行时代码
│   │   ├─ observer ---------------------------- 响应式实现，包含数据观测的核心代码
│   │   ├─ vdom -------------------------------- 虚拟DOM的 creation 和 patching 的代码
│   │   ├─ instance ---------------------------- Vue构造函数与原型相关代码
│   │   ├─ global-api -------------------------- 给Vue构造函数挂载全局方法(静态方法)或属性的代码
│   │   ├─ components -------------------------- 包含抽象出来的通用组件，目前只有keep-alive
│   ├─ server ---------------------------------- 服务端渲染(server-side rendering)的相关代码
│   ├─ platforms ------------------------------- 不同平台特有的相关代码
│   │   ├─ weex -------------------------------- weex平台支持
│   │   ├─ web --------------------------------- web平台支持
│   │   │   ├─ entry-runtime.js ---------------- 运行时构建的入口
│   │   │   ├─ entry-runtime-with-compiler.js -- 独立构建版本的入口
│   │   │   ├─ entry-compiler.js --------------- vue-template-compiler 包的入口文件
│   │   │   ├─ entry-server-renderer.js -------- vue-server-renderer 包的入口文件
│   ├─ sfc ------------------------------- 包含单文件组件(.vue文件)的解析逻辑，用于vue-template-compiler包
│   ├─ shared ---------------------------- 整个代码库通用的代码
```
Vue.js 的源码都在 src 目录下，其目录结构如下

![1.vue 源码目录](http://cdn.ru23.com/vue-analysis/1.1vue%E6%BA%90%E7%A0%81%E7%9B%AE%E5%BD%95.jpg)

[了解更多...![](http://cdn.ru23.com/common/link.svg)](/vue-code-analysis/2.vue%E6%BA%90%E7%A0%81%E7%9B%AE%E5%BD%95%E8%AE%BE%E8%AE%A1.md)

2.入口源码分析
我们之前提到过 Vue.js 构建过程，在 web 应用下，我们来分析 `Runtime + Compiler` 构建出来的 Vue.js，它的入口是 [`src/platforms/web/entry-runtime-with-compiler.js` ![](http://cdn.ru23.com/common/link.svg)](/src/platforms/web/entry-runtime-with-compiler.js)：

## 数据驱动

##### 1.从入口代码开始分析，new Vue发生了什么？

new 关键字在 Javascript 语言中代表实例化是一个对象，而 Vue 实际上是一个类，类在 Javascript 中是用 Function 来实现的，来看一下源码，在[`src/core/instance/index.js`![](http://cdn.ru23.com/common/link.svg)](https://github.com/ru23/vue-source-code-analysis/blob/dev/src/core/instance/init.js) 中。
Vue 初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 `data、props、computed、watcher` 等等。

Vue 的初始化逻辑写的非常清楚，把不同的功能逻辑拆成一些单独的函数执行，让主线逻辑一目了然，这样的编程思想是非常值得借鉴和学习的。
 
参考：
