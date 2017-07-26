phina.app.Element.prototype.$method('init', function(options) {
  this.superInit();

  options = ({}).$safe(options, phina.app.Object2D.defaults);

  this.position = phina.geom.Vector2(options.x, options.y);
  this.scale    = phina.geom.Vector2(options.scaleX, options.scaleY);
  this.rotation = options.rotation;
  this.origin   = phina.geom.Vector2(options.originX, options.originY);

  this._matrix = phina.geom.Matrix33().identity();
  this._worldMatrix = phina.geom.Matrix33().identity();

  this.interactive = options.interactive;
  this.childrenInteractive = options.childrenInteractive;
  
  this._overFlags = {};
  this._touchFlags = {};

  this.width = options.width;
  this.height = options.height;
  this.radius = options.radius;
  this.boundingType = options.boundingType;
});
phina.app.Element.defaults.interactive = false;
phina.app.Element.defaults.childrenInteractive = true;

phina.app.Interactive.prototype.$method('_checkElement', function(element) {
  var app = this.app;
  
  // 更新するかを判定
  if (element.awake === false) return ;

  // 子供を更新
  var len = element.children.length;
  if (len > 0 && element.childrenInteractive) {
    var tempChildren = element.children.slice();
    for (var i=0; i<len; ++i) {
      this._checkElement(tempChildren[i]);
    }
  }

  // タッチ判定
  if (obj.interactive) this._checkPoint(element);
});

phina.app.Interactive.prototype.$method('__checkPoint', function(obj, p) {

  var prevOverFlag = obj._overFlags[p.id];
  var overFlag = obj.hitTest(p.x, p.y);
  obj._overFlags[p.id] = overFlag;

  var e = {
    pointer: p,
    interactive: this,
    over: overFlag,
  };

  if (!prevOverFlag && overFlag) {
    obj.flare('pointover', e);

    if (obj.boundingType && obj.boundingType !== 'none') {
      this._holds.push(obj);
    }
  }
  if (prevOverFlag && !overFlag) {
    obj.flare('pointout', e);
    this._holds.erase(obj);
  }

  if (overFlag) {
    if (p.getPointingStart()) {
      obj._touchFlags[p.id] = true;
      obj.flare('pointstart', e);
      // クリックフラグを立てる
      obj._clicked = true;
    }
  }

  if (obj._touchFlags[p.id]) {
    obj.flare('pointstay', e);
    if (p._moveFlag) {
      obj.flare('pointmove', e);
    }
  }

  if (obj._touchFlags[p.id]===true && p.getPointingEnd()) {
    obj._touchFlags[p.id] = false;
    obj.flare('pointend', e);

    if (phina.isMobile() && obj._overFlags[p.id]) {
      obj._overFlags[p.id] = false;
      obj.flare('pointout', e);
      this._holds.erase(obj);
    }
  }
});