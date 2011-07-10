exports.Utils = {};
var Utils = exports.Utils;


Utils.extends = function(supertype, descendant) {
    descendant.prototype = new supertype();
};


Utils.shuffle = function(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

Utils.include = function(a,v) {
    var cmp = arguments[2];

    for(var i=(a.length-1); i>=0; i--) {
        var res = false;
        if(cmp == null) {
            res = (a[i] === v);
        } else {
            res = (cmp(a[i],v) === 0);
        }

        if(res === true) {
            return true;
        }
    }

    return false;
};

Utils.repeat = function(c,max,floop,fend,env) {
    if(arguments.length===4) { env = {}; }
    if(c<max) {
        env._i = c;
        floop(function(floop,env){
            // avoid stack overflow
            // deadly hack
            if(c % 5 == 4) {
                setTimeout(function(){ Utils.repeat(c+1, max, floop, fend, env); }, 0);
            } else {
                Utils.repeat(c+1, max, floop, fend, env);
            }
        },env);
    } else {
        fend(env);
    }
};


Utils.while = function(c,floop,fend,env) {
    if(arguments.length===3) { env = {}; }

    if(env['_stack_counter'] == null) {
        env['_stack_counter'] = 0;
    }

    if(c===true) {
        floop(function(c,floop,env){
            if(env['_stack_counter'] % 40 == 39) {
                env['_stack_counter'] = env['_stack_counter'] + 1;
                setTimeout(function(){ Utils.while(c, floop, fend, env); }, 0);
            } else {
                env['_stack_counter'] = env['_stack_counter'] + 1;
                Utils.while(c, floop, fend, env);
            }
        },env);
    } else {
        fend(env);
    }
};

Utils.seq = function() {
    var fs = arguments;
    return function(callback) {
        Utils.repeat(0, fs.length, function(k,env){
            var floop = arguments.callee;
            fs[env._i](function(){
                k(floop, env);
            });
        }, function(){
            callback();
        });
    }
};


Utils.partition = function(c, n) {
    var rem = c.length % n;
    var currentGroup = [];
    for(var i=0; i<rem; i++) {
        currentGroup.push(null);
    }
    
    var groups = [];
    var groupCounter = rem;
    for(var i=0; i<c.length; i++) {
        currentGroup.push(c[i]);
        if(currentGroup.length % n == 0) {
            groups.push(currentGroup);
            currentGroup = [];
        }
    }
    return groups;
};

Utils.keys = function(obj) {
    var variables = [];
    for(var variable in obj) {
        variables.push(variable);
    }

    return variables;
};

Utils.iso8601 = function(date) {
    function pad(n){
        return n<10 ? '0'+n : n;
    }    
    return date.getUTCFullYear()+'-'
        + pad(date.getUTCMonth()+1)+'-'
        + pad(date.getUTCDate())+'T'
        + pad(date.getUTCHours())+':'
        + pad(date.getUTCMinutes())+':'
        + pad(date.getUTCSeconds())+'Z';
};


Utils.parseStrictISO8601 = function (str) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = str.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); } else { throw "missing ISO8061 component" }
    if (d[5]) { date.setDate(d[5]);  } else { throw "missing ISO8061 component" }
    if (d[7]) { date.setHours(d[7]);  } else { throw "missing ISO8061 component" }
    if (d[8]) { date.setMinutes(d[8]);  } else { throw "missing ISO8061 component" }
    if (d[10]) { date.setSeconds(d[10]);  } else { throw "missing ISO8061 component" }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    var toReturn = new Date();
    toReturn.setTime(Number(time));
    return toReturn;
}


Utils.parseISO8601 = function (str) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = str.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]);  }
    if (d[7]) { date.setHours(d[7]);  }
    if (d[8]) { date.setMinutes(d[8]);  }
    if (d[10]) { date.setSeconds(d[10]);  }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    var toReturn = new Date();
    toReturn.setTime(Number(time));
    return toReturn;
};

Utils.parseISO8601Components = function (str) {
    var regexp = "([0-9]{4})(-([0-9]{2}))(-([0-9]{2}))(T([0-9]{2}):([0-9]{2})(:([0-9]{2}))?(\.([0-9]+))?)?(Z|([-+])([0-9]{2})(:([0-9]{2}))?)?";
    var d = str.match(new RegExp(regexp));
    var year, month, date, hours, minutes, seconds, millisecs, timezone;
    year = Number(d[1]);
    month = d[3] - 1;
    date  = Number(d[5]);
    hours = Number(d[7]);
    minutes = Number(d[8]);
    seconds = Number(d[10]);

    if(d[12]) { millisecs = Number("0." + d[12]) * 1000 }

    if(d[13]==="Z") {
        timezone = 0;
    } else if (d[14]) {
        var timezone = 0;
        if(d[17]) {
            timezone = Number(d[17]);
        }
        timezone = timezone+(Number(d[15]) * 60);
        timezone *= ((d[14] == '-') ? -1 : +1);
    } else if(d[14]==null && d[11]) {
        timezone = Number(d[12])*60;
    }    

    return {'year': isNaN(year) ? null : year,
            'month': isNaN(month) ? null : month,
            'date': isNaN(date) ? null : date,
            'hours': isNaN(hours) ? null : hours,
            'minutes': isNaN(minutes) ? null : minutes,
            'seconds': isNaN(seconds) ? null : seconds,
            'millisecs':isNaN(millisecs) ? null : millisecs,
            'timezone': isNaN(timezone) ? null : timezone};
};

Utils.compareDateComponents = function(stra,strb) {
    var a = Utils.parseISO8601Components(stra);
    var b = Utils.parseISO8601Components(strb);

    if((a.timezone == null && b.timezone == null) ||
       (a.timezone != null && b.timezone != null)) {        
        da = Utils.parseISO8601(stra);
        db = Utils.parseISO8601(strb);
        
        if(da.getTime() == db.getTime()) {
            return 0;
        } else if(da.getTime() < db.getTime()){
            return -1;
        } else {
            return 1;
        }
    } else if (a.timezone != null && b.timezone == null){
        da = Utils.parseISO8601(stra);
        db = Utils.parseISO8601(strb);
        ta = da.getTime();
        tb = db.getTime();

        var offset = 14*60*60;

        if(ta < tb && ta < (tb + offset)) {
            return -1;
        } else if(ta > tb && ta > (tb - offset)) {
            return 1;
        } else {
        return null;
        }
    } else {
        da = Utils.parseISO8601(stra);
        db = Utils.parseISO8601(strb);
        ta = da.getTime();
        tb = db.getTime();

        var offset = 14*60*60;
        if(ta < tb && (ta + offset)  < tb) {
            return -1;
        } else if(ta > tb && (ta + offset) > tb) {
            return 1;
        } else {
        return null;
        }
    }
};

// RDF utils

Utils.lexicalFormLiteral = function(term, env) {
    var value = term.value;
    var lang = term.lang;
    var type = term.type;

    var indexedValue = null;
    if(value != null && type != null && typeof(type) != 'string') {
        var typeValue = type.value;

        if(typeValue != null) {
            indexedValue = '"' + term.value + '"^^<' + typeValue + '>';
        } else {
            var typePrefix = type.prefix;
            var typeSuffix = type.suffix;

            var resolvedPrefix = env.namespaces[typePrefix];
            term.type = resolvedPrefix+typeSuffix;
            indexedValue = '"' + term.value + '"^^<' + resolvedPrefix + typeSuffix + '>';
        }
    } else {
        if(lang == null && type == null) {
            indexedValue = '"' + value + '"';
        } else if(type == null) {
            indexedValue = '"' + value + '"' + "@" + lang;        
        } else {
            indexedValue = '"' + term.value + '"^^<'+type+'>';
        }
    }
    return indexedValue;
};

Utils.lexicalFormBaseUri = function(term, env) {
    var uri = null;
    //console.log("*** normalizing URI token:");
    //console.log(term);
    if(term.value == null) {
        //console.log(" - URI has prefix and suffix");
        //console.log(" - prefix:"+term.prefix);
        //console.log(" - suffixx:"+term.suffix);
        var prefix = term.prefix;
        var suffix = term.suffix;
        var resolvedPrefix = env.namespaces[prefix];
        if(resolvedPrefix != null) {            
            uri = resolvedPrefix+suffix;
        }
    } else {
        //console.log(" - URI is not prefixed");
        uri = term.value
    }

    if(uri===null) {
        return null;
    } else {
        //console.log(" - resolved URI is "+uri);
        if(uri.indexOf(":") == -1) {
            //console.log(" - URI is partial");
            uri = (env.base||"") + uri; // applyBaseUri
        } else {
            //console.log(" - URI is complete");
        }
        //console.log(" -> FINAL URI: "+uri);
    }

    return uri;
};


Utils.lexicalFormTerm = function(term, ns) {
    if(term.token === 'uri') {
        return {'uri': Utils.lexicalFormBaseUri(term, ns)}
    } else if(term.token === 'literal') {
        return {'literal': Utils.lexicalFormLiteral(term, ns)};
    } else if(term.token === 'blank') {
        var label = '_:'+ns.blank;
        ns.blank = ns.blank+1;
        return {'blank': label};
    } else {
        callback(false, 'Token of kind '+term.token+' cannot transformed into its lexical form');
    }
};

Utils.normalizeUnicodeLiterals = function(string) {
    var escapedUnicode = string.match(/\\u[0-9abcdefABCDEF]{4,4}/g) || [];
    var dups = {};
    for(var i=0; i<escapedUnicode.length; i++) {
        if(dups[escapedUnicode[i]] == null) {
            dups[escapedUnicode[i]] = true;
            string = string.replace(new RegExp("\\"+escapedUnicode[i],"g"), eval("'"+escapedUnicode[i]+"'"));
        }
    }

    return string;
}

Utils.hashTerm = function(term) {
    try {
      if(term == null) {
          return "";
      } if(term.token==='uri') {
          return "u"+term.value;
      } else if(term.token === 'blank') {
          return "b"+term.value;
      } else if(term.token === 'literal') {
          l = "l"+term.value;
          l = l + (term.type || "");
          l = l + (term.lang || "");        
   
          return l;
      }
    } catch(e) {
        if(typeof(term) === 'object') {
            var key = "";
            for(p in term) {
                key = key + p + term[p];
            }

            return key;
        }
        return term;
    }
}
