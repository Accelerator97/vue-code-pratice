(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function isFunction(data) {
    return typeof data === 'function';
  }
  function isObject(data) {
    return _typeof(data) === 'object' && data !== null;
  }

  var oldArrayPrototype = Array.prototype;
  var arrayMethods = Object.create(oldArrayPrototype); //以Array的原型作为当前对象的原型 arrayMehthods.__proto__ = Array.prototype

  var methods = ['push', 'shift', 'unshift', 'pop', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    //用户如果调用以上七个方法会用我自己重写的，否则用数组原来的方法
    arrayMethods[method] = function () {
      var _oldArrayPrototype$me;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args)); //根据当前数组获取Observer类的实例
      //这里的this指向数组


      var ob = this.__ob__;
      var inserted;

      switch (method) {
        case 'push':
          inserted = args;
        //args就是新增的内容

        case 'unshift':
          inserted = args;
        //args就是新增的内容

        case 'splice':
          //xxx.splice(0,1,xxx) 在下标为0的地方插入一个数xxx 
          //此时args的第三个参数就是xxx 为新增的内容  
          inserted = args.slice(2);
      } //如果有新增的内容要继续进行劫持，需要观察数组的每一项，而不是数组


      if (inserted) {
        ob.observeArray(inserted);
      }
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //这里的this是Observer类的实例
      //给data添加__ob__属性，这是为了如果data是数组的情况下，可以访问Observer类上的方法observeArray
      //所有被劫持的属性都有__ob__
      //写成这种形式是为了防止如果是对象走walk方法然后添加了__ob__,因为__ob__对应的this是一个实例对象，所以会不停地对__ob__进行观测，导致爆栈
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false //不可枚举

      }); //对于数组，Vue没有监控索引的变化，但是如果索引对应的数据是对象需要被监控 

      if (Array.isArray(data)) {
        //数组劫持的逻辑
        //对数组原来的方法进行改写，切片编程，高阶函数
        data.__proto__ = arrayMethods; //如果数组里面的数据是对象类型，那么需要监控对象的变化

        this.observeArray(data);
      } else {
        this.walk(data); //对对象所有属性进行劫持
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        //对于数组中的对象再次进行监控 递归
        data.forEach(function (item) {
          observe(item);
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        //Object.keys保证是对对象的私有属性进行遍历
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }(); //Vue2会对对象进行遍历一次，为每个属性添加set/get方法，所以性能会差一点


  function defineReactive(data, key, value) {
    //value有可能是对象，进行递归，为value下面的属性添加set/get方法（所以性能会比较差）
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        observe(newValue); //如果用户赋值一个新对象，需要对这个新对象进行劫持

        value = newValue;
      }
    });
  }

  function observe(data) {
    //是对象才进行观测
    if (!isObject(data)) {
      return;
    }

    if (data.__ob__) {
      //如果data有__ob__属性，说明已经被观测过了
      return;
    }

    return new Observer(data);
  }
  /**
   * 小结：
   * 如果数据是对象，会不断递归进行劫持
   * 如果是数组，会劫持数组的方法，如果数组中的数据是对象，还会进行检测劫持
   */

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    } // if(opts.computed){
    //     initComputed()
    // }
    // if(opts.watch){
    //     initWatch()
    // }
    // if(opts.props){
    //     initProps()
    // }

  }

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; //判断data是否是函数，如果是函数就通过call调用 this指向vm
    //这时候data与vm没有关系，所以添加vm._data，通过_data进行关联

    data = vm._data = isFunction(data) ? data.call(vm) : data;

    for (var key in data) {
      //设置代理，直接通过vm.xxx访问而不是通过vm._data.xxx访问
      proxy(vm, '_data', key);
    } //通过Object.defineProperty进行数据劫持


    observe(data);
  }

  function initMixin(Vue) {
    //表示在Vue的基础上做一次混合操作
    Vue.prototype._init = function (options) {
      //Vue原型上添加_init方法
      var vm = this;
      vm.$options = options; //后续对options进行扩展操作
      //对数据进行初始化 watch computed props data ... initState专门对状态进行初始化

      initState(vm);
    };
  }

  function Vue(options) {
    //options是用户传入的配置项,_表示的是Vue内部调用，希望用户不要调用
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
