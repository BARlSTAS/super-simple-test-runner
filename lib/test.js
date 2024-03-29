

module.exports = Test;

function Test(title, fn) {
  this.title = title;
  this.fn = fn;
  this.pending = !fn;
  this.async = fn && fn.length;
  this.sync = ! this.async;
  this.timeout(2000);
}


Test.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};


Test.prototype.fullTitle = function(){
  return this.parent.fullTitle() + ' ' + this.title;
};


Test.prototype.run = function(fn){
  let timer
    , self = this
    , ms = this._timeout
    , start = new Date;

  if (this.async) {
    timer = setTimeout(function(){
      fn(new Error('timeout of ' + ms + 'ms exceeded'));
    }, ms);
  }

  if (this.async) {
    this.fn(function(err){
      clearTimeout(timer);
      self.duration = new Date - start;
      fn(err);
      self.finished = true;
    });
  } else {
    if (!this.pending) this.fn();
    this.duration = new Date - start;
  }
};
