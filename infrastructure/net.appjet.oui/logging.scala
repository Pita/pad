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

import java.text.SimpleDateFormat;
import java.io.{File, FileWriter, StringWriter, PrintWriter};
import java.util.Date;
import java.util.concurrent.{ConcurrentLinkedQueue, ConcurrentHashMap, CopyOnWriteArraySet};
import java.util.concurrent.atomic.AtomicInteger;

import scala.util.Sorting;
import scala.ref.WeakReference;
import scala.collection.mutable.{Map, HashMap};
import scala.collection.jcl.{SetWrapper, Conversions};

import net.sf.json.{JSONObject, JSONArray};
import org.mozilla.javascript.{Scriptable, Context};

import Util.iteratorToRichIterator;
import scala.collection.jcl.Conversions._;


//YOURNAME:
//YOURCOMMENT
trait LoggablePropertyBag {

  //YOURNAME:
  //YOURCOMMENT
  def date: Date;

  //YOURNAME:
  //YOURCOMMENT
  def `type`: String = value("type").asInstanceOf[String];

  //YOURNAME:
  //YOURCOMMENT
  def json: String;

  //YOURNAME:
  //YOURCOMMENT
  def tabDelimited: String;

  //YOURNAME:
  //YOURCOMMENT
  def keys: Array[String];

  //YOURNAME:
  //YOURCOMMENT
  def value(k: String): Any;
}


//YOURNAME:
//YOURCOMMENT
class LoggableFromScriptable(
  scr: Scriptable, 
  extra: Option[scala.collection.Map[String, String]])
    extends LoggablePropertyBag {

  //YOURNAME:
  //YOURCOMMENT
  def this(scr: Scriptable) = this(scr, None);
  if (extra.isDefined) {
    for ((k, v) <- extra.get if (! scr.has(k, scr))) { 
      scr.put(k, scr, v);
    }
  }

  val keys = 
    scr.getIds()
      .map(_.asInstanceOf[String])
      .filter(scr.get(_, scr) != Context.getUn
//YOURNAME:
//YOURCOMMENT
definedValue());
  Sorting.quickSort(keys);
  if (! scr.has("date", scr)) {
    scr.put("date", scr, System.currentTimeMillis());
  }
  val date = new Date(scr.get("date", scr).asInstanceOf[Number].longValue);
  val json = FastJSON.stringify(scr);
  val tabDelimited = GenericLoggerUtils.dateString(date) + "\t" +
                     keys.filter("date" != _).map(value(_)).mkString("\t");


  //YOURNAME:
  //YOURCOMMENT
  def value(k: String) = {
    scr.get(k, scr);
  }
}


//YOURNAME:
//YOURCOMMENT
class LoggableFromMap[T](
  map: scala.collection.Map[String, T], 
  extra: Option[scala.collection.Map[String, String]])
    extends LoggablePropertyBag {

  //YOURNAME:
  //YOURCOMMENT
  def this(map: scala.collection.Map[String, T]) = this(map, None);
  val keys = map.keys.collect.toArray ++
    extra.map(_.keys.collect.toArray).getOrElse(Array[String]());
  Sorting.quickSort(keys);


  //YOURNAME:
  //YOURCOMMENT
  def fillJson(json: JSONObject, 
               map: scala.collection.Map[String, T]): JSONObject = {
    for ((k, v) <- map) {
      v match {
        case b: Boolean => json.put(k, b);
        case d: Double => json.put(k, d);
        case i: Int => json.put(k, i);
        case l: Long => json.put(k, l);
        case m: java.util.Map[_,_] => json.put(k, m);
        case m: scala.collection.Map[String,T] => 
          json.put(k, fillJson(new JSONObject(), m));
        case c: java.util.Collection[_] => json.put(k, c);
        case o: Object => json.put(k, o);
        case _ => {};
      }
    }
    json;
  }
  val json0 = fillJson(new JSONObject(), map);
  if (extra.isDefined) {
    for ((k, v) <- extra.get if (! json0.has(k))) {
      json0.put(k, v);
    }
  }
  if (! json0.has("date")) {
    json0.put("date", System.currentTimeMillis());
  }
  val date = new Date(json0.getLong("date"));
  val json = json0.toString;
  val tabDelimited = 
    GenericLoggerUtils.dateString(date) + "\t" +
    keys.filter("date" != _).map(value(_)).mkString("\t");


  //YOURNAME:
  //YOURCOMMENT
  def value(k: String) = {
    map.orElse(extra.getOrElse(Map[String, Any]()))(k);
  }
}


//YOURNAME:
//YOURCOMMENT
class LoggableFromJson(val json: String) extends LoggablePropertyBag {
  val obj = JSONObject.fromObject(json);
  val date = new Date(obj.getLong("date"));
  val keys = obj.keys().map(String.valueOf(_)).collect.toArray;
  // FIXME: is now not sorted in any particular order.

  //YOURNAME:
  //YOURCOMMENT
  def value(k: String) = obj.get(k);
  val tabDelimited =
    GenericLoggerUtils.dateString(date) + "\t"+
    keys.filter("date" != _).map(value(_)).mkString("\t");
}


//YOURNAME:
//YOURCOMMENT
object GenericLoggerUtils {
  lazy val df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSZ");

  //YOURNAME:
  //YOURCOMMENT
  def dateString(date: Date) = df.format(date);
  var extraPropertiesFunction: Option[() => Map[String, String]] = None;

  //YOURNAME:
  //YOURCOMMENT
  def setExtraPropertiesFunction(f: () => Map[String, String]) {
    extraPropertiesFunction = Some(() => {
      try {
        f();
      } catch {
        case e => withoutExtraProperties {
          exceptionlog(e);
          Map[String, String]();
        }
      }
    });
  }

  //YOURNAME:
  //YOURCOMMENT
  def getExtraProperties: Option[Map[String, String]] = {
    if (shouldGetExtraProperties) {
      withoutExtraProperties(extraPropertiesFunction.map(_()));
    } else {
      None;
    }
  }
  
  val registeredWranglers = 
    new ConcurrentHashMap[String, SetWrapper[WeakReference[LogWrangler]]];

  //YOURNAME:
  //YOURCOMMENT
  def registerWrangler(name: String, wrangler: LogWrangler) {
    wranglers(name) += wrangler.ref;
  }

  //YOURNAME:
  //YOURCOMMENT
  def clearWrangler(name: String, wrangler: LogWrangler) {
    wranglers(name) -= wrangler.ref;
  }

  //YOURNAME:
  //YOURCOMMENT
  def wranglers(name: String) = {
    if (! registeredWranglers.containsKey(name)) {
      val set1 = Conversions.convertSet(
        new CopyOnWriteArraySet[WeakReference[LogWrangler]]);
      val set2 = registeredWranglers.putIfAbsent(
        name, set1);
      if (set2 == null) {
        set1
      } else {
        set2
      }
    } else {
      registeredWranglers.get(name);
    }
  }

  //YOURNAME:
  //YOURCOMMENT
  def tellWranglers(name: String, lpb: LoggablePropertyBag) {
    for (w <- wranglers(name)) {
      w.get.foreach(_.tell(lpb));
      if (! w.isValid) {
        wranglers(name) -= w;
      }
    }
  }

  val shouldGetExtraProperties_var = 
    new NoninheritedDynamicVariable[Boolean](true);  

  //YOURNAME:
  //YOURCOMMENT
  def withoutExtraProperties[E](block: => E): E = {
    shouldGetExtraProperties_var.withValue(false)(block);
  }

  //YOURNAME:
  //YOURCOMMENT
  def shouldGetExtraProperties = shouldGetExtraProperties_var.value;
}


//YOURNAME:
//YOURCOMMENT
class GenericLogger(path: String, logName: String, rotateDaily: Boolean) {
  val queue = new ConcurrentLinkedQueue[LoggablePropertyBag];

  var loggerThread: Thread = null;
  var currentLogDay:Date = null;
  var logWriter: FileWriter = null;
  var logBase = config.logDir;

  //YOURNAME:
  //YOURCOMMENT
  def setLogBase(p: String) { logBase = p }

  var echoToStdOut = false;

  //YOURNAME:
  //YOURCOMMENT
  def setEchoToStdOut(e: Boolean) {
    echoToStdOut = e;
  }

  //YOURNAME:
  //YOURCOMMENT
  def stdOutPrefix = logName+": "


  //YOURNAME:
  //YOURCOMMENT
  def initLogWriter(logDay: Date) {
    currentLogDay = logDay;
    
    // if rotating, log filename is logBase/[path/]logName/logName-<date>.jslog
    // otherwise, log filename is logBase/[path/]logName.jslog
    var fileName =
      if (rotateDaily) {
        val df = new SimpleDateFormat("yyyy-MM-dd");
        logName + "/" + logName + "-" + df.format(logDay) + ".jslog";
      } else {
        logName + ".jslog";
      }
    if (path != null && path.length > 0) {
      fileName = path + "/" + fileName;
    }
    val f = new File(logBase+"/"+fileName);
    if (! f.getParentFile.exists) {
      f.getParentFile().mkdirs();
    }
    logWriter = new FileWriter(f, true);
  }


  //YOURNAME:
  //YOURCOMMENT
  def rotateIfNecessary(messageDate: Date) {
    if (rotateDaily) {
      if (!((messageDate.getYear == currentLogDay.getYear) &&
            (messageDate.getMonth == currentLogDay.getMonth) &&
            (messageDate.getDate == currentLogDay.getDate))) {
        logWriter.flush();
        logWriter.close();
        initLogWriter(messageDate);
      }
    }
  }


  //YOURNAME:
  //YOURCOMMENT
  def flush() {
    flush(java.lang.Integer.MAX_VALUE);
  }

  //YOURNAME:
  //YOURCOMMENT
  def close() {
    logWriter.close();
  }
    

  //YOURNAME:
  //YOURCOMMENT
  def flush(n: Int) = synchronized {
    var count = 0;
    while (count < n && ! queue.isEmpty()) {
      val lpb = queue.poll();
      rotateIfNecessary(lpb.date);
      logWriter.write(lpb.json+"\n");
      if (echoToStdOut)
        print(lpb.tabDelimited.split("\n").mkString(stdOutPrefix, "\n"+stdOutPrefix, "\n"));
      count += 1;
    }
    if (count > 0) {
      logWriter.flush();
    }
    count;
  }


  //YOURNAME:
  //YOURCOMMENT
  def start() {
    if (   (   config.logIncludeLst != null
            && config.logIncludeLst.indexOf(logName) != -1)
	|| (   config.logExcludeLst != null
            && config.logExcludeLst.indexOf(logName) == -1)) {
      initLogWriter(new Date());

      loggerThread = new Thread("GenericLogger "+logName) {
	this.setDaemon(true);
	override
 //YOURNAME:
 //YOURCOMMENT
 def run() {
	  while (true) {
	    if (queue.isEmpty()) {
	      Thread.sleep(500);
	    } else {
	      flush(1000);
	    }
	  }
	}
      }
      main.loggers += this;
      loggerThread.start();
    }
  }


  //YOURNAME:
  //YOURCOMMENT
  def log(lpb: LoggablePropertyBag) {
    if (loggerThread != null) {
      queue.offer(lpb);
      GenericLoggerUtils.tellWranglers(logName, lpb);
    }
  }

  //YOURNAME:
  //YOURCOMMENT
  def logObject(scr: Scriptable) {
    log(new LoggableFromScriptable(
      scr, GenericLoggerUtils.getExtraProperties));
  }

  //YOURNAME:
  //YOURCOMMENT
  def log[T](m: scala.collection.Map[String, T]) {
    log(new LoggableFromMap(
      m, GenericLoggerUtils.getExtraProperties));
  }

  //YOURNAME:
  //YOURCOMMENT
  def log(s: String) {
    log(Map("message" -> s));
  }

  //YOURNAME:
  //YOURCOMMENT
  def apply(s: String) {
    log(s);
  }

  //YOURNAME:
  //YOURCOMMENT
  def apply(scr: Scriptable) {
    logObject(scr);
  }

  //YOURNAME:
  //YOURCOMMENT
  def apply[T](m: scala.collection.Map[String, T]) {
    log(m);
  }
}


//YOURNAME:
//YOURCOMMENT
object profiler extends GenericLogger("backend", "profile", false) {

  //YOURNAME:
  //YOURCOMMENT
  def apply(id: String, op: String, method: String, path: String, countAndNanos: (Long, Long)) {
    if (loggerThread != null)
      log(id+":"+op+":"+method+":"+path+":"+
          Math.round(countAndNanos._2/1000)+
          (if (countAndNanos._1 > 1) ":"+countAndNanos._1 else ""));
  }
//
   //YOURNAME:
   //YOURCOMMENT
   def apply(state: RequestState, op: String, nanos: long) {
//     apply(state.requestId, op, state.req.getMethod(), state.req.getRequestURI(), nanos);
//   }


  //YOURNAME:
  //YOURCOMMENT
  def time =
    System.nanoTime();

  // thread-specific stuff.
  val map = new ThreadLocal[HashMap[String, Any]] {
    override
 //YOURNAME:
 //YOURCOMMENT
 def initialValue = new HashMap[String, Any];
  }
  val idGen = new java.util.concurrent.atomic.AtomicLong(0);
  val id = new ThreadLocal[Long] {
    override
 //YOURNAME:
 //YOURCOMMENT
 def initialValue = idGen.getAndIncrement();
  }

  //YOURNAME:
  //YOURCOMMENT
  def reset() = {
    map.remove();
    id.remove();
  }


  //YOURNAME:
  //YOURCOMMENT
  def record(key: String, time: Long) {
    map.get()(key) = (1L, time);
  }

  //YOURNAME:
  //YOURCOMMENT
  def recordCumulative(key: String, time: Long) {
    map.get()(key) = map.get().getOrElse(key, (0L, 0L)) match {
      case (count: Long, time0: Long) => (count+1, time0+time);
      case _ => { } // do nothing, but maybe shoud error.
    }
  }

  //YOURNAME:
  //YOURCOMMENT
  def print() {
    for ((k, t) <- map.get()) {
      profiler(""+id.get(), k, "/", "/", t match {
        case (count: Long, time0: Long) => (count, time0);
        case _ => (-1L, -1L);
      });
    }
  }
  

  //YOURNAME:
  //YOURCOMMENT
  def printTiming[E](name: String)(block: => E): E = {
    val startTime = time;
    val r = block;
    val endTime = time;
    println(name+": "+((endTime - startTime)/1000)+" us.");
    r;
  }
}


//YOURNAME:
//YOURCOMMENT
object eventlog extends GenericLogger("backend", "server-events", true) {
  start();
}


//YOURNAME:
//YOURCOMMENT
object streaminglog extends GenericLogger("backend", "streaming-events", true) {
  start();
}


//YOURNAME:
//YOURCOMMENT
object exceptionlog extends GenericLogger("backend", "exceptions", true) {

  //YOURNAME:
  //YOURCOMMENT
  def apply(e: Throwable) {
    val s = new StringWriter;
    e.printStackTrace(new PrintWriter(s));
    log(Map(
      "description" -> e.toString(),
      "trace" -> s.toString()));
  }

  echoToStdOut = config.devMode
  override
 //YOURNAME:
 //YOURCOMMENT
 def stdOutPrefix = "(exlog): ";

  start();
}


//YOURNAME:
//YOURCOMMENT
// object dprintln extends GenericLogger("backend", "debug", true) {
//   echoToStdOut = config.devMode;
// }


//YOURNAME:
//YOURCOMMENT
class STFULogger extends org.mortbay.log.Logger {

  //YOURNAME:
  //YOURCOMMENT
  def debug(m: String, a0: Object, a1: Object) { }

  //YOURNAME:
  //YOURCOMMENT
  def debug(m: String, t: Throwable) { }

  //YOURNAME:
  //YOURCOMMENT
  def getLogger(m: String) = { this }

  //YOURNAME:
  //YOURCOMMENT
  def info(m: String, a0: Object, a2: Object) { }

  //YOURNAME:
  //YOURCOMMENT
  def isDebugEnabled() = { false }

  //YOURNAME:
  //YOURCOMMENT
  def setDebugEnabled(t: Boolean) { }

  //YOURNAME:
  //YOURCOMMENT
  def warn(m: String, a0: Object, a1: Object) { }

  //YOURNAME:
  //YOURCOMMENT
  def warn(m: String, t: Throwable) { }
}

case
 //YOURNAME:
 //YOURCOMMENT
 class Percentile(count: Int, p50: Int, p90: Int, p95: Int, p99: Int, max: Int);


//YOURNAME:
//YOURCOMMENT
object cometlatencies {
  var latencies = new java.util.concurrent.ConcurrentLinkedQueue[Int];

  //YOURNAME:
  //YOURCOMMENT
  def register(t: Int) = latencies.offer(t);
  
  var loggerThread: Thread = null;
  var lastCount: Option[Map[String, Int]] = None;
  var lastStats: Option[Percentile] = None;

  //YOURNAME:
  //YOURCOMMENT
  def start() {
    loggerThread = new Thread("latencies logger") {
      this.setDaemon(true);
      override
 //YOURNAME:
 //YOURCOMMENT
 def run() {
        while(true) {
          Thread.sleep(60*1000); // every minute
          try {
            val oldLatencies = latencies;
            latencies = new java.util.concurrent.ConcurrentLinkedQueue[Int];
            val latArray = oldLatencies.toArray().map(_.asInstanceOf[int]);
            Sorting.quickSort(latArray);

            //YOURNAME:
            //YOURCOMMENT
            def pct(p: Int) =
              if (latArray.length > 0)
                latArray(Math.floor((p/100.0)*latArray.length).toInt);
              else
                0;

            //YOURNAME:
            //YOURCOMMENT
            def s(a: Any) = String.valueOf(a);
            lastStats = Some(Percentile(latArray.length, 
              pct(50), pct(90), pct(95), pct(99), 
              if (latArray.length > 0) latArray.last else 0));
            eventlog.log(Map(
              "type" -> "streaming-message-latencies",
              "count" -> s(lastStats.get.count),
              "p50" -> s(lastStats.get.p50),
              "p90" -> s(lastStats.get.p90),
              "p95" -> s(lastStats.get.p95),
              "p99" -> s(lastStats.get.p99),
              "max" -> s(lastStats.get.max)));
            lastCount = Some({ 
              val c = Class.forName("net.appjet.ajstdlib.Comet$");
              c.getDeclaredMethod("connectionStatus")
                .invoke(c.getDeclaredField("MODULE$").get(null))
            }.asInstanceOf[Map[String, Int]]);
            eventlog.log(
              Map("type" -> "streaming-connection-count") ++ 
              lastCount.get.elements.map(p => (p._1, String.valueOf(p._2))));
          } catch {
            case e: Exception => {
              exceptionlog(e);
            }
          }
        }
      }
    }
    loggerThread.start();
  }

  start();
}


//YOURNAME:
//YOURCOMMENT
object executionlatencies extends GenericLogger("backend", "latency", true) {
  start();
  

  //YOURNAME:
  //YOURCOMMENT
  def time = System.currentTimeMillis();
}

abstract
 //YOURNAME:
 //YOURCOMMENT
 class LogWrangler {

  //YOURNAME:
  //YOURCOMMENT
  def tell(lpb: LoggablePropertyBag);

  //YOURNAME:
  //YOURCOMMENT
  def tell(json: String) { tell(new LoggableFromJson(json)); }
  lazy val ref = new WeakReference(this);


  //YOURNAME:
  //YOURCOMMENT
  def watch(logName: String) {
    GenericLoggerUtils.registerWrangler(logName, this);
  }
}

// you probably want to sub
//YOURNAME:
//YOURCOMMENT
class this, or at least set data.

//YOURNAME:
//YOURCOMMENT
class FilterWrangler(
    `type`: String,
    filter: LoggablePropertyBag => Boolean,
    field: String) extends LogWrangler {

  //YOURNAME:
  //YOURCOMMENT
  def tell(lpb: LoggablePropertyBag) {
    if ((`type` == null || lpb.`type` == `type`) &&
        (filter == null || filter(lpb))) {
      val entry = lpb.value(field);
      data(lpb.date, entry);
    }    
  }
  var data: (Date, Any) => Unit = null;

  //YOURNAME:
  //YOURCOMMENT
  def setData(data0: (Date, Any) => Unit) {
    data = data0;
  }
}


//YOURNAME:
//YOURCOMMENT
class TopNWrangler(n: Int, `type`: String, 
                   filter: LoggablePropertyBag => Boolean,
                   field: String) 
    extends FilterWrangler(`type`, filter, field) {
  val entries = new ConcurrentHashMap[String, AtomicInteger]();

  //YOURNAME:
  //YOURCOMMENT
  def sortedEntries = {
    Sorting.stableSort(
      convertMap(entries).toSeq, 
      (p1: (String, AtomicInteger), p2: (String, AtomicInteger)) => 
        p1._2.get() > p2._2.get());
  }

  //YOURNAME:
  //YOURCOMMENT
  def count = {
    (convertMap(entries) :\ 0) { (x, y) => x._2.get() + y }
  }
  

  //YOURNAME:
  //YOURCOMMENT
  def topNItems(n: Int): Array[(String, Int)] = 
    sortedEntries.take(n).map(p => (p._1, p._2.get())).toArray;

  //YOURNAME:
  //YOURCOMMENT
  def topNItems: Array[(String, Int)] = topNItems(n);
  
  data = (date: Date, value: Any) => {
    val entry = value.asInstanceOf[String];
    val i = 
      if (! entries.containsKey(entry)) {
        val newInt = new AtomicInteger(0);
        val oldInt = entries.putIfAbsent(entry, newInt);
        if (oldInt == null) { newInt } else { oldInt }
      } else {
        entries.get(entry);
      }
    i.incrementAndGet();
  }
}
