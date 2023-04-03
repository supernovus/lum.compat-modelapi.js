const core = require('@lumjs/core');
const {F,O,S,B} = core.types;

/**
 * Extensions to the ModelAPI should extend this class.
 */
class Extension
{
  /**
   * The extension is passed a copy of the Model instance during it's
   * construction. This is done prior to the various "init" stages.
   * You can create a method called setup() which will also be passed
   * the Model instance. You should NOT depend on anything being
   * initialized in the Model in your setup() method, as the extensions
   * are loaded before any of the "init" groups are called.
   *
   * You can add a method called preInit() which will be passed a copy
   * of the configuration object used to construct the Model. It's also
   * called before any of the "init" groups, but after this constructor
   * and any setup() calls have completed.
   *
   * Finally you can add a method called postInit() which will be passed
   * a copy of the configuration object used to construct the Model.
   * It's called after all of the "init" groups have completed.
   */
  constructor(apiInstance)
  {
    if (!(apiInstance instanceof Model))
    {
      throw new Error("Extension must be passed it's parent Model");
    }

    this.parent = apiInstance;

    if (typeof this.setup === F)
    {
      this.setup(apiInstance);
    }
  }

  /**
   * Call this from your setup(), preInit(), or postInit() methods.
   *
   * It will add a method in the Model which simply calls a method
   * in the extension using apply(), all arguments passed to the model
   * method will be passed to the extension method.
   *
   * @param string srcName   The name of the method in the extension.
   * @param string destName  The name of the method to add (optional).
   *                         If null/false/omitted, we use srcName.
   * @param bool modelIsThis If true, set 'this' to model.
   *                         If null/false/omitted, 'this' is the extension.
   * @param bool canReplace  If true, we can overwrite existing Model
   *                         properties/methods. If falsey, we will throw
   *                         and Error if a property/method already exists!
   *                         This is really dangerous, only use it if you
   *                         really know what you are doing!
   */
  addHandledMethod(srcName, destName, modelIsThis, canReplace)
  {
    destName = destName || srcName;

    if (typeof this[srcName] === F)
    {
      if (canReplace || this.parent[destName] === undefined)
      {
        let ext = this;
        let applyThis = modelIsThis ? this.parent : this;
        this.parent[destName] = function ()
        {
          ext[srcName].apply(applyThis, arguments);
        }
      }
      else
      {
        throw new Error(destName+" was already defined in the Model");
      }
    }
    else
    {
      throw new Error(srcName+" method not found in the Extension");
    }
  }

  /**
   * A wrapper for addHandledMethod() that allows you to add a whole
   * bunch of wrappers all at once!
   *
   * @param object methodsToAdd  Object describing the methods to add.
   *
   * If methodsToAdd is an Array object, it's assumed that every member
   * of the array is a srcName parameter for addHandledMethod() and
   * that default options will be used for them all.
   *
   * If methodsToAdd is any other kind of object, the keys will be used as 
   * the srcName parameter for addHandledMethod(), and the values may take
   * several different forms:
   *
   *  string:  If the value is a string, it's assumed to be the destName.
   *  bool:    If the value is a boolean, it's assumed to be modelIsThis.
   *  object:  If the value is an object then it specifies options.
   *
   *  Options supported all have the same name as the corresponding
   *  parameter in the addHandledMethod() method.
   *
   *   destName:    string
   *   modelIsThis: bool
   *   canReplace:  bool
   *
   * There's a lot of flexibility in this method!
   */
  addHandledMethods(methodsToAdd)
  {
    if (typeof methodsToAdd === O)
    {
      if (Array.isArray(methodsToAdd))
      { // An array of source names.
        for (var m in methodsToAdd)
        {
          var methodName = methodsToAdd[m];
          this.addHandledMethod(methodName);
        }
      }
      else
      { // An object with potential values.
        for (var srcName in methodsToAdd)
        {
          var methSpec = methodsToAdd[srcName];
          if (typeof methSpec === S)
          {
            this.addHandledMethod(srcName, methSpec);
          }
          else if (typeof methSpec === B)
          {
            this.addHandledMethod(srcName, null, methSpec);
          }
          else if (typeof methSpec === O)
          {
            this.addHandledMethod(
              srcName,
              methSpec.destName,
              methSpec.modelIsThis,
              methSpec.canReplace
            );
          }
        }
      }
    }
    else
    {
      console.error("Non-object sent to addHandledMethods()", methodsToAdd);
    }
  }
} // class Extension

module.exports = Extension;

const Model = require('./model');
