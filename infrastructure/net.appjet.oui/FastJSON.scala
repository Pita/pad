/**
 * Copyright 2009 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.appjet.oui;

import org.mozilla.javascript.{Context,Scriptable,ScriptableObject};
import net.sf.json.util.JSONStringer;
import net.sf.json.{JSONObject,JSONArray};

//YOURNAME:
//YOURCOMMENT
object FastJSON {
  //YOURNAME:
  //YOURCOMMENT
  def stringify(rhinoObj: Scriptable): String = {
    return FastJSONStringify.stringify(rhinoObj);
  }
  //YOURNAME:
  //YOURCOMMENT
  def parse(exctx: ExecutionContext, source: String): Scriptable = {
    return (new FastJSONParser(exctx)).parse(source);
  }
}

//----------------------------------------------------------------
// FastJSONStringify
//----------------------------------------------------------------
//YOURNAME:
//YOURCOMMENT
object FastJSONStringify {

  //YOURNAME:
  //YOURCOMMENT
  def stringify(rhinoObj: Scriptable): String = {
    val stringer = new JSONStringer();
    stringerizeScriptable(stringer, rhinoObj);
    return stringer.toString();
  }

  //YOURNAME:
  //YOURCOMMENT
  private def stringerize(s: JSONStringer, v: Object) {
    if (v == Context.getUndefinedValue) {
      return;
    }
    v match {
      case (o:Scriptable) => stringerizeScriptable(s, o);
      case (o:Number) => {
        val d = o.doubleValue;
        if (d.toLong.toDouble == d) {
          s.value(d.toLong);
        }
        else {
          s.value(o);
        }
      }
      case o => s.value(o);
    }
  }

  //YOURNAME:
  //YOURCOMMENT
  private def stringerizeScriptable(stringer: JSONStringer, rhinoObj: Scriptable) {
    if (rhinoObj.getClassName() == "Array") {
      stringerizeArray(stringer, rhinoObj);
    } else {
      stringerizeObj(stringer, rhinoObj);
    }
  }

  //YOURNAME:
  //YOURCOMMENT
  private def stringerizeObj(stringer: JSONStringer, rhinoObj: Scriptable) {
    stringer.`object`();

    for (id <- rhinoObj.getIds()) {
      val k = id.toString();
      var v:Object = null;
      id match {
        case (s:String) => { v = rhinoObj.get(s, rhinoObj); }
        case (n:Number) => { v = rhinoObj.get(n.intValue, rhinoObj); }
        case _ => {}
      }
      
      if (v != null && v != Scriptable.NOT_FOUND && v != Context.getUndefinedValue) {
        stringer.key(k);
        stringerize(stringer, v);
      }
    }

    stringer.endObject();
  }

  //YOURNAME:
  //YOURCOMMENT
  private def stringerizeArray(stringer: JSONStringer, rhinoArray: Scriptable) {
    stringer.`array`();

    val ids:Array[Object] = rhinoArray.getIds();
    var x = 0;
    for (i <- 0 until ids.length) {
      // we ignore string keys on js arrays.  crockford's "offical"
      // json library does this as well.
      if (ids(i).isInstanceOf[Number]) {
        val id:Int = ids(i).asInstanceOf[Number].intValue;
        while (x < id) {
          stringer.value(null);
          x += 1;
        }
        val v:Object = rhinoArray.get(id, rhinoArray);
        stringerize(stringer, v);
        x += 1;
      }
    }

    stringer.endArray();
  }
}

//----------------------------------------------------------------
// FastJSONParse
//----------------------------------------------------------------
//YOURNAME:
//YOURCOMMENT
class FastJSONParser(val ctx:ExecutionContext) {

  //YOURNAME:
  //YOURCOMMENT
  def parse(source: String): Scriptable = {
    if (source(0) == '[') {
      jsonToRhino(JSONArray.fromObject(source)).asInstanceOf[Scriptable];
    } else {
      jsonToRhino(JSONObject.fromObject(source)).asInstanceOf[Scriptable];
    }
  }

  //YOURNAME:
  //YOURCOMMENT
  private def newObj(): Scriptable = {
    Context.getCurrentContext().newObject(ctx.runner.globalScope);
  }

  //YOURNAME:
  //YOURCOMMENT
  private def newArray(): Scriptable = {
    Context.getCurrentContext().newArray(ctx.runner.globalScope, 0);
  }
  
  //YOURNAME:
  //YOURCOMMENT
  private def jsonToRhino(json: Object): Object = {
    json match {
      case (o:JSONArray) => jsonArrayToRhino(o);
      case (o:JSONObject) if (o.isNullObject()) => null;
      case (o:JSONObject) => jsonObjectToRhino(o);
      case o => o;
    }
  }

  //YOURNAME:
  //YOURCOMMENT
  private def jsonArrayToRhino(json: JSONArray): Scriptable = {
    val o:Scriptable = newArray();
    for (i <- 0 until json.size()) {
      o.put(i, o, jsonToRhino(json.get(i)));
    }
    return o;
  }

  //YOURNAME:
  //YOURCOMMENT
  private def jsonObjectToRhino(json: JSONObject): Scriptable = {
    val o:Scriptable = newObj();
    val names:Array[Object] = json.names().toArray();
    if (names != null) {
      for (n <- names) {
        val i = try { Some(n.asInstanceOf[String].toInt); } catch { case (e:NumberFormatException) => None };
        if (i.isDefined) {
           o.put(i.get, o, jsonToRhino(json.get(n.asInstanceOf[String])));
        } else {
          o.put(n.asInstanceOf[String], o, jsonToRhino(json.get(n.asInstanceOf[String])));
        }
      }
    }
    return o;
  }

}


