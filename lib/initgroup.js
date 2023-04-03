const core = require('@lumjs/core');
const {F,S} = core.types;

/**
 * A class representing an initialization group.
 */
class InitGroup
{
  constructor(name, api=null)
  {
    this.api = api;
    this.name = name;
    this.methods = {};
  }

  add(name, method, apiIsThis=false)
  {
    if (typeof name === S && typeof method === F)
    {
      if (this.methods[name] === undefined)
      {
        method._run_init = false;
        method._this_api = apiIsThis;
        this.methods[name] = method;
        return true;
      }
      else
      {
        console.error("cannot overwrite init method", name, method, this); 
      }
    }
    else
    {
      console.error("invalid init method", name, method, this);
    }
    return false;
  }

  /**
  * Run a named init script in this group.
  */
  need (name, conf)
  {
    const meth = this.methods[name];

    if (typeof meth !== F)
    {
      console.error("invalid init method requested", name, this, conf);
      return false;
    }

    if (meth._run_init)
    { // This function has already been run.
      return true;
    }

    const wantThis = (meth._this_api && this.api) ? this.api : this;

    const ret = meth.call(wantThis, conf);
    meth._run_init = true;
    
    return ret;
  }

  /**
  * Run all init scripts in this group.
  */
  run(conf)
  {
    for (const name in this.methods)
    {
      this.need(name, conf);
    }
  }

} // class InitGroup

module.exports = InitGroup;
