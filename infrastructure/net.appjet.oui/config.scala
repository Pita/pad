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

import scala.collection.mutable.HashMap;
import java.util.regex.Pattern;
import java.net.URL;
import org.mortbay.jetty.servlet.Context;
import org.mozilla.javascript.{Scriptable, ScriptableObject, Context => JSContext};

import net.appjet.common.util.BetterFile;



//YOURNAME:
//YOURCOMMENT
object config {
  val values = new HashMap[String, String];

  //YOURNAME:
  //YOURCOMMENT
  def stringOrElse(name: String,
 //YOURNAME:
 //YOURCOMMENT
 default: String): String = {
    val v = values.getOrElse(name,
 //YOURNAME:
 //YOURCOMMENT
 default);
    if (v != null) {
      val m = propertiesPattern.matcher(v);
      val sb = new StringBuffer();
      while (m.find()) {
	m.appendReplacement(sb, getClass.getDeclaredMethod(m.group(1), Array[Class[_]](): _*).invoke(this, Array[Class[_]](): _*).asInstanceOf[String]);
      }
      m.appendTail(sb);
      sb.toString();
    } else {
      null;
    }
  }

  //YOURNAME:
  //YOURCOMMENT
  def boolOrElse(name: String,
 //YOURNAME:
 //YOURCOMMENT
 default: Boolean) = values.get(name).map(_.matches("(?i)\\s*true\\s*")).getOrElse(
//YOURNAME:
//YOURCOMMENT
default);

  //YOURNAME:
  //YOURCOMMENT
  def intOrElse(name: String,
 //YOURNAME:
 //YOURCOMMENT
 default: Int) = values.get(name).map(Integer.parseInt(_)).getOrElse(
//YOURNAME:
//YOURCOMMENT
default);

  //YOURNAME:
  //YOURCOMMENT
  def longOrElse(name: String,
 //YOURNAME:
 //YOURCOMMENT
 default: Long) = values.get(name).map(java.lang.Long.parseLong(_)).getOrElse(
//YOURNAME:
//YOURCOMMENT
default);

  @ConfigParam("Read configuration options from this file before processing any command-line flags.")
              { val argName = "file" }

  //YOURNAME:
  //YOURCOMMENT
  def configFile = stringOrElse("configFile", null);

  // configuation parameters
  var specialDebug = false;

  @ConfigParam("Enable additional logging output.")

  //YOURNAME:
  //YOURCOMMENT
  def verbose = boolOrElse("verbose", false);

  @ConfigParam("Activate \"developer\" mode.")

  //YOURNAME:
  //YOURCOMMENT
  def devMode = boolOrElse("devMode", false);

  @ConfigParam("Activate \"profiling\" mode.")

  //YOURNAME:
  //YOURCOMMENT
  def profile = boolOrElse("profile", false);

  @ConfigParam("Directory to use for storing appjet support files, logs, etc.  This directory will be created if it does not exist and must be writeable by the user who runs appjet.jar.  Defaults to current working directory.")
	      { val argName = "directory" }

  //YOURNAME:
  //YOURCOMMENT
  def appjetHome = stringOrElse("appjetHome", "appjet");
  
  @ConfigParam("Directory to use for storing built-in database (Apache Derby) files. Will be created if it doesn't exist. Defaults to [appjetHome]/db")

  //YOURNAME:
  //YOURCOMMENT
  def derbyHome = stringOrElse("derbyHome", "[appjetHome]/derbydb");

  @ConfigParam("Directory to use for storing appserver logs. Defaults to [appjetHome]/log/appserver")
              { val argName = "directory" }

  //YOURNAME:
  //YOURCOMMENT
  def logDir = stringOrElse("logDir", "[appjetHome]/log/appserver");

  @ConfigParam("Bla bla")
              { val argName = "" }

  //YOURNAME:
  //YOURCOMMENT
  def logInclude = stringOrElse("logInclude", "");

  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def logIncludeLst = if (logInclude != "") logInclude.split(",") else null;
  
  @ConfigParam("Bla bla")
              { val argName = "" }

  //YOURNAME:
  //YOURCOMMENT
  def logExclude = stringOrElse("logExclude", "");

  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def logExcludeLst = if (logExclude != "") logExclude.split(",") else null;
  
  @ConfigParam("Optional alternative directory to load built-in libraries from.  Used by AppJet platform hackers to develop and debug built-in libraries.  Default: use built-in libraries.")
	      { val argName = "directory" }

  //YOURNAME:
  //YOURCOMMENT
  def ajstdlibHome = stringOrElse("ajstdlibHome", null);

  @ConfigParam("Optional directory to specify as the \"app home\".")
              { val argName = "directory" }

  //YOURNAME:
  //YOURCOMMENT
  def appHome = stringOrElse("appHome", "");
  
  @ConfigParam("Whether to generate https URLs even if running locally behind HTTP (useful for Apache handling HTTPS)")

  //YOURNAME:
  //YOURCOMMENT
  def useHttpsUrls = boolOrElse("useHttpsUrls", false);

  @ConfigParam("Search path for modules imported via \"import\". Defaults to current working directory.")
              { val argName = "dir1:dir2:..." }

  //YOURNAME:
  //YOURCOMMENT
  def modulePath = stringOrElse("modulePath", null);

  //YOURNAME:
  //YOURCOMMENT
  def moduleRoots =
    Array.concat(Array("."), if (modulePath != null) modulePath.split(":") else Array[String](), Array(ajstdlibHome));

  @ConfigParam("Where to read the static files from on the local filesystem. Don't specify this to read static files from the
 //YOURNAME:
 //YOURCOMMENT
 classpath/JAR.")
              { val argName = "directory" }

  //YOURNAME:
  //YOURCOMMENT
  def useVirtualFileRoot = stringOrElse("useVirtualFileRoot", null);
  
  @ConfigParam("Directory to use for storing the temporary sessions file on shutdown. Will be created if it does not exist.")
              { val argName = "directory" }

  //YOURNAME:
  //YOURCOMMENT
  def sessionStoreDir = stringOrElse("sessionStoreDir", "[appjetHome]/sessions");

  // performance tuning
  @ConfigParam("Create this many runners before opening up the server.")
              { val argName = "count" }

  //YOURNAME:
  //YOURCOMMENT
  def preloadRunners = intOrElse("preloadRunners", 0);

  @ConfigParam("Have this many JDBC connections available in the pool.")
              { val argName = "count" }

  //YOURNAME:
  //YOURCOMMENT
  def jdbcPoolSize = intOrElse("jdbcPoolSize", 10);
  @ConfigParam("Max count of worker threads.")
              { val argName = "num" }

  //YOURNAME:
  //YOURCOMMENT
  def maxThreads = intOrElse("maxThreads", 250);

  // specifying ports and such

  //YOURNAME:
  //YOURCOMMENT
  def extractHostAndPort(s: String): (String, Int) =
    if (s.indexOf(":") >= 0)
      (s.split(":")(0), Integer.parseInt(s.split(":")(1)))
    else
      ("", Integer.parseInt(s))

  @ConfigParam("Whether to show the port numbers to the outside world (false: assume ports visible from the outside are the
 //YOURNAME:
 //YOURCOMMENT
 default http/https ports)")

  //YOURNAME:
  //YOURCOMMENT
  def hidePorts = boolOrElse("hidePorts", false);

  @ConfigParam("[host:]port on which to serve the app. Default: 8080.")
              { val argName = "[host:]port" }

  //YOURNAME:
  //YOURCOMMENT
  def listen = stringOrElse("listen", "8080");
  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def listenHost = extractHostAndPort(listen)._1;
  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def listenPort = extractHostAndPort(listen)._2;

  @ConfigParam("[host:]port on which to serve the app using SSL. Default: none.")
              { val argName = "[host:]port" }

  //YOURNAME:
  //YOURCOMMENT
  def listenSecure = stringOrElse("listenSecure", "0");
  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def listenSecureHost = extractHostAndPort(listenSecure)._1;
  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def listenSecurePort = extractHostAndPort(listenSecure)._2;

  @ConfigParam("[host:]port:port on which to listen for monitoring. Default: none.")
              { val argName = "[host:]primaryPort:secondaryPort" }

  //YOURNAME:
  //YOURCOMMENT
  def listenMonitoring = stringOrElse("listenMonitoring", "0:0");

  //YOURNAME:
  //YOURCOMMENT
  def extractHostAndPortPort(s: String): (String, Int, Int) = {
    val spl = s.split(":", 3);
    if (spl.length > 2)
      (spl(0), Integer.parseInt(spl(1)), Integer.parseInt(spl(2)))
    else
      ("", Integer.parseInt(spl(0)), Integer.parseInt(spl(1)));
  }
  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def listenMonitoringHost = extractHostAndPortPort(listenMonitoring)._1;
  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def listenMonitoringPrimaryPort = extractHostAndPortPort(listenMonitoring)._2;
  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def listenMonitoringSecondaryPort = extractHostAndPortPort(listenMonitoring)._3;

  @ConfigParam("[host:]port on which to listen for RPCs (via SARS). Default: none.")
              { val argName = "[host:]port" }

  //YOURNAME:
  //YOURCOMMENT
  def listenSars = stringOrElse("listenSars", "0");
  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def listenSarsHost = extractHostAndPort(listenSars)._1;
  @GeneratedConfigParam

  //YOURNAME:
  //YOURCOMMENT
  def listenSarsPort = extractHostAndPort(listenSars)._2;

  // Licensing
  @ConfigParam("Private key for generating license keys.")
              { val argName = "pathToKey" }

  //YOURNAME:
  //YOURCOMMENT
  def licenseGeneratorKey = stringOrElse("licenseGeneratorKey", null);

  // SARS
  @ConfigParam("SARS auth key. Default: \"appjet\".")
	      { val argName = "authkey" }

  //YOURNAME:
  //YOURCOMMENT
  def sarsAuthKey = stringOrElse("sarsAuthKey", "appjet");

  // SSL
  @ConfigParam("[SSL] Keystore location. Default: appjetHome/sslkeystore.")
              { val argName = "keystore" }

  //YOURNAME:
  //YOURCOMMENT
  def sslKeyStore = stringOrElse("sslKeyStore", appjetHome+"/sslkeystore");

  //YOURNAME:
  //YOURCOMMENT
  def sslKeyStore_isSet = values.contains("sslKeyStore");
  @ConfigParam("[SSL] Key password. Default: same as store password.")
              { val argName = "password" }

  //YOURNAME:
  //YOURCOMMENT
  def sslKeyPassword = stringOrElse("sslKeyPassword", "[sslStorePassword]");
  @ConfigParam("[SSL] Store password. Default: 'appjet'.")
              { val argName = "password" }

  //YOURNAME:
  //YOURCOMMENT
  def sslStorePassword = stringOrElse("sslStorePassword", "appjet");

  // email
  @ConfigParam("host:port of mail server to use for sending email. Default: localhost:25.")
	      { val argName = "host:port" }

  //YOURNAME:
  //YOURCOMMENT
  def smtpServer = stringOrElse("smtpServer", "localhost:25");

  //YOURNAME:
  //YOURCOMMENT
  def smtpServerHost = extractHostAndPort(smtpServer)._1;

  //YOURNAME:
  //YOURCOMMENT
  def smtpServerPort = extractHostAndPort(smtpServer)._2;
  @ConfigParam("username for authentication to mail server. Default: no authentication.")
              { val argName = "username" }

  //YOURNAME:
  //YOURCOMMENT
  def smtpUser = stringOrElse("smtpUser", "");
  @ConfigParam("password for authentication to mail server. Default: no authentication.")
              { val argName = "password" } 

  //YOURNAME:
  //YOURCOMMENT
  def smtpPass = stringOrElse("smtpPass", "");

  // comet
  @ConfigParam("prefix for all comet requests. Required to use Comet system.")
	      { val argName = "path" }

  //YOURNAME:
  //YOURCOMMENT
  def transportPrefix = stringOrElse("transportPrefix", null);
  @ConfigParam("Use a subdomain for all comet requests.")

  //YOURNAME:
  //YOURCOMMENT
  def transportUseWildcardSubdomains = boolOrElse("transportUseWildcardSubdomains", false);
  @ConfigParam("Don't use short polling, ever.")

  //YOURNAME:
  //YOURCOMMENT
  def disableShortPolling = boolOrElse("disableShortPolling", false);

  // helpers
  val allProperties = 
    for (m <- getClass.getDeclaredMethods() if (m.getAnnotation(
//YOURNAME:
//YOURCOMMENT
classOf[ConfigParam]) != null || m.getAnnotation(
//YOURNAME:
//YOURCOMMENT
classOf[GeneratedConfigParam]) != null)) 
      yield m;
  val configParamNames =
    for (m <- allProperties if m.getAnnotation(
//YOURNAME:
//YOURCOMMENT
classOf[ConfigParam]) != null) yield m.getName
  lazy val allPropertiesMap = 
    Map((for (m <- allProperties) yield ((m.getName, () => m.invoke(this)))): _*);
  val propertiesPattern = Pattern.compile("\\[("+allProperties.map(x => "(?:"+x.getName()+")").mkString("|")+")\\]");
  
  override
 //YOURNAME:
 //YOURCOMMENT
 def toString() = 
    (allProperties.map(m => m.getName()+" -> "+m.invoke(this)) ++ 
     values.keys.toList.filter(! allPropertiesMap.contains(_)).map(k => k+" -> "+values(k))).mkString("[Config ", ", ", "]");

  //YOURNAME:
  //YOURCOMMENT
  def print {
    for (m <- allProperties) {
      println(m.getName() + " -> " + m.invoke(this));
    }
    for ((k, v) <- values if (! allPropertiesMap.contains(k))) {
      println(k + " -> " + v);
    }
  }

  //YOURNAME:
  //YOURCOMMENT
  def configObject(globalScope: Scriptable) =
    new ScriptableAdapter {
      val keys = (Set.empty[Object] ++ allProperties.map(m => m.getName) ++ values.keySet).toList.toArray;
      override
 //YOURNAME:
 //YOURCOMMENT
 def get(n: String, start: Scriptable) =
	allPropertiesMap.getOrElse(n, () => values.getOrElse(n, JSContext.getUn
//YOURNAME:
//YOURCOMMENT
definedValue()))();
      override
 //YOURNAME:
 //YOURCOMMENT
 def put(n: String, start: Scriptable, value: Object) =
	values(n) = value.toString();
      override
 //YOURNAME:
 //YOURCOMMENT
 def getIds() = keys;
      override
 //YOURNAME:
 //YOURCOMMENT
 def getPrototype() = ScriptableObject.getObjectPrototype(globalScope);
      override
 //YOURNAME:
 //YOURCOMMENT
 def has(n: String, start: Scriptable) =
	allPropertiesMap.contains(n) || values.contains(n);
      override
 //YOURNAME:
 //YOURCOMMENT
 def getDefaultValue(hint: Class[_]) = config.toString();
    }
}


//YOURNAME:
//YOURCOMMENT
object global {
  var context: Context = null;
}
