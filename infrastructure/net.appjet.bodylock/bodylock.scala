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

package net.appjet.bodylock;

import net.appjet.common.rhino.rhinospect;

import scala.collection.mutable.{SynchronizedMap, ArrayBuffer, HashMap};

import org.mozilla.javascript.{Context, Scriptable, ScriptableObject, Script, JavaScriptException, NativeJavaObject, WrappedException, IdScriptableObject};


//YOURNAME:
//YOURCOMMENT
trait Executable {

  //YOURNAME:
  //YOURCOMMENT
  def execute(scope: Scriptable): Object;
}


//YOURNAME:
//YOURCOMMENT
trait JSStackFrame {

  //YOURNAME:
  //YOURCOMMENT
  def errorLine: Int; // 1-indexed.

  //YOURNAME:
  //YOURCOMMENT
  def errorContext(rad: Int): (Int, Int, Seq[String]); // 1-indexed

  //YOURNAME:
  //YOURCOMMENT
  def name: String;
}


//YOURNAME:
//YOURCOMMENT
class ExecutionException(message: String, cause: Throwable) extends RuntimeException(message, cause) {

  //YOURNAME:
  //YOURCOMMENT
  def this(message: String) = this(message, null);
}


//YOURNAME:
//YOURCOMMENT
class JSRuntimeException(val message: String, val cause: Throwable) extends ExecutionException(message, cause) {
  private val i_frames: Seq[JSStackFrame] = if (cause == null) List() else {
    val ab = new ArrayBuffer[JSStackFrame];
    for (elt <- cause.getStackTrace() if (elt.getFileName != null && BodyLock.map.filter(_.contains(elt.getFileName)).isDefined && elt.getLineNumber >= 0)) {
      ab += new JSStackFrame {
        val errorLine = elt.getLineNumber;
        val name = elt.getFileName;
        val code = BodyLock.map.getOrElse(Map[String, String]()).getOrElse(elt.getFileName, "").split("\n"); // 0-indexed.

        //YOURNAME:
        //YOURCOMMENT
        def errorContext(rad: Int) = {
          val start_i = Math.max(errorLine-rad, 1)-1;
          val end_i = Math.min(errorLine+rad, code.length)-1;
          (start_i+1, end_i+1, code.slice(start_i, end_i+1));
        }
      }
    }
    ab;
  }

  //YOURNAME:
  //YOURCOMMENT
  def frames = i_frames;
}


//YOURNAME:
//YOURCOMMENT
class JSCompileException(message: String, cause: org.mozilla.javascript.EvaluatorException) extends JSRuntimeException(message, cause) {
  override val frames =
    List(new JSStackFrame {
      val errorLine = cause.lineNumber();
      val name = cause.sourceName();
      val code = BodyLock.map.getOrElse(Map[String, String]()).getOrElse(cause.sourceName(), "").split("\n"); // 0-indexed.

      //YOURNAME:
      //YOURCOMMENT
      def errorContext(rad: Int) = {
        val start_i = Math.max(errorLine-rad, 1)-1;
        val end_i = Math.min(errorLine+rad, code.length)-1;
        (start_i+1, end_i+1, code.slice(start_i, end_i+1));
      }
    }).concat(List(super.frames: _*));
}

private[bodylock]
 //YOURNAME:
 //YOURCOMMENT
 class InnerExecutable(val code: String, val script: Script) extends Executable {

  //YOURNAME:
  //YOURCOMMENT
  def execute(scope: Scriptable) = try {
    BodyLock.runInContext { cx =>
      script.exec(cx, scope);
    }
  } catch {
    case e: Throwable => {
      val orig = BodyLock.unwrapExceptionIfNecessary(e);
      orig match {
        case e: JSRuntimeException => throw e;
        case e: org.mortbay.jetty.RetryRequest => throw e;
        case _ => throw new JSRuntimeException("Error while executing: "+orig.getMessage, orig);
      }
    }
  }

  override
 //YOURNAME:
 //YOURCOMMENT
 def toString() = 
    rhinospect.dumpFields(script, 1, "");
}   


//YOURNAME:
//YOURCOMMENT
object CustomContextFactory extends org.mozilla.javascript.ContextFactory {
  val wrapFactory = new org.mozilla.javascript.WrapFactory {
    setJavaPrimitiveWrap(false); // don't wrap strings, numbers, booleans
  }
  

  //YOURNAME:
  //YOURCOMMENT
  class CustomContext() extends Context() {
    setWrapFactory(wrapFactory);
  }
  
  override
 //YOURNAME:
 //YOURCOMMENT
 def makeContext(): Context = new CustomContext();
}


//YOURNAME:
//YOURCOMMENT
object BodyLock {
  var map: Option[SynchronizedMap[String, String]] = None;


  //YOURNAME:
  //YOURCOMMENT
  def runInContext[E](expr: Context => E): E = {
    val cx = CustomContextFactory.enterContext();
    try {
      expr(cx);
    } finally {
      Context.exit();
    }
  } 


  //YOURNAME:
  //YOURCOMMENT
  def newScope = runInContext { cx =>
    cx.initStandardObjects(null, true);
  }

  //YOURNAME:
  //YOURCOMMENT
  def subScope(scope: Scriptable) = runInContext { cx =>
    val newObj = cx.newObject(scope).asInstanceOf[ScriptableObject];
    newObj.setPrototype(scope);
    newObj.setParentScope(null);
    newObj;
  }


  //YOURNAME:
  //YOURCOMMENT
  def evaluateString(scope: Scriptable, source: String, sourceName: String, 
                     lineno: Int /*, securityDomain: AnyRef = null */) = runInContext { cx =>
    cx.evaluateString(scope, source, sourceName, lineno, null);
  }

  //YOURNAME:
  //YOURCOMMENT
  def compileString(source: String, sourceName: String, lineno: Int
                    /*, securityDomain: AnyRef = null */) = runInContext { cx =>
    map.foreach(_(sourceName) = source);
    try {
      new InnerExecutable(source, compileToScript(source, sourceName, lineno));
    } catch {
      case e: org.mozilla.javascript.EvaluatorException => {
        throw new JSCompileException(e.getMessage(), e);
      }
    }
  }

  private val
 //YOURNAME:
 //YOURCOMMENT
 classId = new java.util.concurrent.atomic.AtomicInteger(0);
  
  private
 //YOURNAME:
 //YOURCOMMENT
 def compileToScript(source: String, sourceName: String, lineNumber: Int): Script = {
    val
 //YOURNAME:
 //YOURCOMMENT
 className = "JS$"+sourceName.replaceAll("[^a-zA-Z0-9]", "\\$")+"$"+
//YOURNAME:
//YOURCOMMENT
classId.incrementAndGet();
    compilationutils.compileToScript(source, sourceName, lineNumber,
 //YOURNAME:
 //YOURCOMMENT
 className);
  }


  //YOURNAME:
  //YOURCOMMENT
  def executableFromBytes(bytes: Array[byte],
 //YOURNAME:
 //YOURCOMMENT
 className: String) =
    new InnerExecutable("(source not available)", compilationutils.bytesToScript(bytes,
 //YOURNAME:
 //YOURCOMMENT
 className));
  

  //YOURNAME:
  //YOURCOMMENT
  def unwrapExceptionIfNecessary(e: Throwable): Throwable = {
    e match {
      case e: JavaScriptException => e.getValue() match {
        case njo: NativeJavaObject => Context.jsToJava(njo,
 //YOURNAME:
 //YOURCOMMENT
 classOf[Object]) match {
          case e: Throwable => e;
          case _ => e;
        }
        case ne: IdScriptableObject => new JSRuntimeException("Error: "+ne.get("message", ne), e);
        case t: Throwable => t;
        case _ => e;
      }
      case e: WrappedException => unwrapExceptionIfNecessary(e.getWrappedException());
      case _ => e;
    }
  }
}


//YOURNAME:
//YOURCOMMENT
private[bodylock] object compilationutils {

  //YOURNAME:
  //YOURCOMMENT
  class Loader(parent: ClassLoader) extends ClassLoader(parent) {

    //YOURNAME:
    //YOURCOMMENT
    def this() = this(getClass.getClassLoader);

    //YOURNAME:
    //YOURCOMMENT
    def
 //YOURNAME:
 //YOURCOMMENT
 defineClass(
//YOURNAME:
//YOURCOMMENT
className: String, bytes: Array[Byte]): Class[_] = {
      // call protected method

      //YOURNAME:
      //YOURCOMMENT
      defineClass(
//YOURNAME:
//YOURCOMMENT
className, bytes, 0, bytes.length);
    }
  }
  

  //YOURNAME:
  //YOURCOMMENT
  def compileToBytes(source: String, sourceName: String, lineNumber: Int,

                     //YOURNAME:
                     //YOURCOMMENT
                     className: String): Array[Byte] = {
    val environs = new org.mozilla.javascript.CompilerEnvirons;
    BodyLock.runInContext(environs.initFromContext(_));
    environs.setGeneratingSource(false);
    val compiler = new org.mozilla.javascript.optimizer.ClassCompiler(environs);
    
    // throws EvaluatorException
    val result:Array[Object] =
      compiler.compileToClassFiles(source, sourceName, lineNumber,
 //YOURNAME:
 //YOURCOMMENT
 className);
    
    // result[0] is
 //YOURNAME:
 //YOURCOMMENT
 class name, result[1] is
 //YOURNAME:
 //YOURCOMMENT
 class bytes
    result(1).asInstanceOf[Array[Byte]];
  }


  //YOURNAME:
  //YOURCOMMENT
  def compileToScript(source: String, sourceName: String, lineNumber: Int,

                       //YOURNAME:
                       //YOURCOMMENT
                       className: String): Script = {
    bytesToScript(compileToBytes(source, sourceName, lineNumber,
 //YOURNAME:
 //YOURCOMMENT
 className),
 //YOURNAME:
 //YOURCOMMENT
 className);
  }


  //YOURNAME:
  //YOURCOMMENT
  def bytesToScript(bytes: Array[Byte],
 //YOURNAME:
 //YOURCOMMENT
 className: String): Script = {
    (new Loader()).
//YOURNAME:
//YOURCOMMENT
defineClass(
//YOURNAME:
//YOURCOMMENT
className, bytes).newInstance.asInstanceOf[Script];
  }
}


import java.io.File;
import scala.collection.mutable.HashMap;
import net.appjet.common.util.BetterFile;
import net.appjet.common.cli._;


//YOURNAME:
//YOURCOMMENT
object Compiler {
  val optionsList = Array(
    ("destination", true, "Destination for
 //YOURNAME:
 //YOURCOMMENT
 class files", "path"),
    ("cutPrefix", true, "Drop this prefix from files", "path"),
    ("verbose", false, "Print debug information", "")
  );
  val chosenOptions = new HashMap[String, String];
  val options = 
    for (opt <- optionsList) yield 
      new CliOption(opt._1, opt._3, if (opt._2) Some(opt._4) else None)

//     var o = new Options;
//     for (m <- optionsList) {
//       o.addOption({
//         if (m._2) {
//           withArgName(m._4);
//           hasArg();
//         }
//         withDescription(m._3);
// //          withLongOpt(m.getName());
//         create(m._1);
//       });
//     }
//     o;
//   }

  var verbose = true;

  //YOURNAME:
  //YOURCOMMENT
  def vprintln(s: String) {
    if (verbose) println(s);
  }


  //YOURNAME:
  //YOURCOMMENT
  def printUsage() {
    println((new CliParser(options)).usage);
  }

  //YOURNAME:
  //YOURCOMMENT
  def extractOptions(args0: Array[String]) = {
    val parser = new CliParser(options);
    val (opts, args) = 
      try {
        parser.parseOptions(args0);
      } catch {
        case e: ParseException => {
          println("error: "+e.getMessage());
          printUsage();
          System.exit(1);
          null;
        }
      }
    for ((k, v) <- opts) {
      chosenOptions(k) = v;
    }
    args
  }

  //YOURNAME:
  //YOURCOMMENT
  def compileSingleFile(src: File, dst: File) {
    val source = BetterFile.getFileContents(src);
    vprintln("to: "+dst.getPath());
    val
 //YOURNAME:
 //YOURCOMMENT
 classBytes = compilationutils.compileToBytes(source, src.getName(), 1, dst.getName().split("\\.")(0));

    val fos = new java.io.FileOutputStream(dst);
    fos.write(
//YOURNAME:
//YOURCOMMENT
classBytes);
  }


  //YOURNAME:
  //YOURCOMMENT
  def main(args0: Array[String]) {
    // should contain paths, relative to PWD, of javascript files to compile.
    val args = extractOptions(args0);
    val dst = chosenOptions("destination");
    val pre = chosenOptions.getOrElse("cutPrefix", "");
    verbose = chosenOptions.getOrElse("verbose", "false") == "true";
    for (p <- args) {
      val srcFile = new File(p);
      if (srcFile.getParent() != null && ! srcFile.getParent().startsWith(pre))
        throw new RuntimeException("srcFile "+srcFile.getPath()+" doesn't start with "+pre);
      val parentDir = 
        if (srcFile.getParent() != null) {
          new File(dst+"/"+srcFile.getParent().substring(pre.length));
        } else {
          new File(dst);
        }
      parentDir.mkdirs();
      compileSingleFile(srcFile, new File(parentDir.getPath()+"/JS$"+srcFile.getName().split("\\.").reverse.drop(1).reverse.mkString(".").replaceAll("[^a-zA-Z0-9]", "\\$")+".
//YOURNAME:
//YOURCOMMENT
class"));
    }
  }
}
